import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  runMigrations,
  MIGRATIONS,
  CURRENT_SCHEMA_VERSION,
  SCHEMA_VERSIONS,
  ensureRecordIntegrity,
  uid,
  withIds,
  createSnapshot,
  loadSnapshot,
  deleteSnapshot,
  listSnapshots,
  performRollback,
  finishRollback,
} from '../storage';

const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0,
};

Object.defineProperty(globalThis, 'localStorage', { value: mockLocalStorage });

describe('数据迁移与版本管理', () => {
  beforeEach(() => {
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
    mockLocalStorage.key.mockClear();
    mockLocalStorage.length = 0;
  });

  describe('MIGRATIONS配置', () => {
    it('应该包含从0到1的迁移', () => {
      const migration = MIGRATIONS.find(m => m.from === 0 && m.to === 1);
      expect(migration).toBeDefined();
      expect(migration.description).toBeDefined();
      expect(typeof migration.migrate).toBe('function');
    });

    it('CURRENT_SCHEMA_VERSION应该是1', () => {
      expect(CURRENT_SCHEMA_VERSION).toBe(1);
    });

    it('SCHEMA_VERSIONS应该包含版本0和1', () => {
      expect(SCHEMA_VERSIONS[0]).toBeDefined();
      expect(SCHEMA_VERSIONS[1]).toBeDefined();
      expect(SCHEMA_VERSIONS[0].label).toContain('v0');
      expect(SCHEMA_VERSIONS[1].label).toContain('v1');
    });
  });

  describe('runMigrations', () => {
    const v0Records = [
      { id: 'rec1', caseName: '案件A', evidence: '证据1', date: '2026-06-01' },
      { id: 'rec2', caseName: '案件A', evidence: '证据2' },
    ];

    it('应该成功从v0迁移到v1', () => {
      const result = runMigrations(v0Records, 0, 1);

      expect(result.success).toBe(true);
      expect(result.steps).toHaveLength(1);
      expect(result.steps[0].status).toBe('success');
      expect(result.records).toHaveLength(2);
      expect(result.records[0].createdAt).toBe('2026-06-01');
      expect(result.records[1].createdAt).toBeDefined();
    });

    it('v0迁移应该为没有date的记录生成createdAt', () => {
      const result = runMigrations(v0Records, 0, 1);
      expect(result.records[1].createdAt).toBeDefined();
      expect(typeof result.records[1].createdAt).toBe('string');
      expect(result.records[1].createdAt.length).toBeGreaterThan(0);
    });

    it('相同版本应该直接返回成功', () => {
      const records = [{ id: 'rec1', caseName: '案件A', evidence: '证据1' }];
      const result = runMigrations(records, 1, 1);

      expect(result.success).toBe(true);
      expect(result.steps).toHaveLength(0);
      expect(result.records).toBe(records);
    });

    it('缺少迁移脚本应该返回失败', () => {
      const records = [{ id: 'rec1', caseName: '案件A', evidence: '证据1' }];
      const result = runMigrations(records, 99, 100);

      expect(result.success).toBe(false);
      expect(result.steps).toHaveLength(1);
      expect(result.steps[0].status).toBe('failed');
      expect(result.steps[0].error).toContain('未找到迁移脚本');
    });

    it('迁移失败应该返回失败状态', () => {
      const badMigration = {
        from: 0,
        to: 1,
        description: '测试迁移',
        migrate: () => { throw new Error('迁移失败'); },
      };

      const originalMigrations = [...MIGRATIONS];
      MIGRATIONS.length = 0;
      MIGRATIONS.push(badMigration);

      try {
        const result = runMigrations(v0Records, 0, 1);
        expect(result.success).toBe(false);
        expect(result.steps[0].status).toBe('failed');
        expect(result.steps[0].error).toContain('迁移失败');
      } finally {
        MIGRATIONS.length = 0;
        originalMigrations.forEach(m => MIGRATIONS.push(m));
      }
    });

    it('迁移步骤应该包含正确的计数信息', () => {
      const result = runMigrations(v0Records, 0, 1);
      expect(result.steps[0].prevCount).toBe(2);
      expect(result.steps[0].newCount).toBe(2);
      expect(result.steps[0].snapshotKey).toBeDefined();
    });
  });

  describe('ensureRecordIntegrity', () => {
    it('应该为没有ID的记录生成ID', () => {
      const records = [
        { caseName: '案件A', evidence: '证据1' },
        { caseName: '案件A', evidence: '证据2' },
      ];
      const result = ensureRecordIntegrity(records);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBeDefined();
      expect(result[1].id).toBeDefined();
      expect(result[0].id).not.toBe(result[1].id);
    });

    it('应该修复重复的ID', () => {
      const records = [
        { id: 'dup', caseName: '案件A', evidence: '证据1' },
        { id: 'dup', caseName: '案件A', evidence: '证据2' },
      ];
      const result = ensureRecordIntegrity(records);

      expect(result[0].id).toBe('dup');
      expect(result[1].id).not.toBe('dup');
      expect(result[1].id).toBeDefined();
    });

    it('应该为没有timeline的记录添加默认timeline', () => {
      const records = [
        { id: 'rec1', caseName: '案件A', evidence: '证据1', status: '已核对' },
      ];
      const result = ensureRecordIntegrity(records);

      expect(result[0].timeline).toHaveLength(1);
      expect(result[0].timeline[0].status).toBe('已核对');
      expect(result[0].timeline[0].by).toBe('系统');
    });

    it('应该保留已有的timeline', () => {
      const timeline = [{ status: '已核对', at: '2026-06-01', by: '操作员' }];
      const records = [
        { id: 'rec1', caseName: '案件A', evidence: '证据1', timeline },
      ];
      const result = ensureRecordIntegrity(records);

      expect(result[0].timeline).toBe(timeline);
    });
  });

  describe('uid', () => {
    it('应该生成唯一的ID', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(uid());
      }
      expect(ids.size).toBe(100);
    });

    it('ID应该是字符串', () => {
      expect(typeof uid()).toBe('string');
      expect(uid().length).toBeGreaterThan(0);
    });
  });

  describe('withIds', () => {
    it('应该为所有记录添加ID和timeline', () => {
      const records = [
        { caseName: '案件A', evidence: '证据1', status: '已核对' },
        { caseName: '案件A', evidence: '证据2', status: '待核对' },
      ];
      const result = withIds(records);

      expect(result[0].id).toBeDefined();
      expect(result[0].timeline).toHaveLength(1);
      expect(result[0].timeline[0].status).toBe('已核对');
      expect(result[1].timeline[0].status).toBe('待核对');
    });

    it('应该保留已有的ID', () => {
      const records = [
        { id: 'custom', caseName: '案件A', evidence: '证据1' },
      ];
      const result = withIds(records);

      expect(result[0].id).toBe('custom');
    });
  });

  describe('快照管理', () => {
    const testRecords = [
      { id: 'rec1', caseName: '案件A', evidence: '证据1' },
      { id: 'rec2', caseName: '案件A', evidence: '证据2' },
    ];

    it('createSnapshot应该成功创建快照', () => {
      const result = createSnapshot(testRecords, 1);

      expect(result.success).toBe(true);
      expect(result.snapshotKey).toBeDefined();
      expect(result.snapshotId).toBeDefined();
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('loadSnapshot应该正确加载快照', () => {
      const snapshotKey = 'hxwl-61310-legal-evidence-snapshot-v1-test123';
      const snapshotData = {
        version: 1,
        records: testRecords,
        timestamp: '2026-06-16T10:00:00Z',
        recordCount: 2,
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(snapshotData));
      const result = loadSnapshot(snapshotKey);

      expect(result).toEqual(snapshotData);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(snapshotKey);
    });

    it('loadSnapshot对于不存在的快照应该返回null', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      const result = loadSnapshot('nonexistent');

      expect(result).toBeNull();
    });

    it('loadSnapshot对于损坏的数据应该返回null', () => {
      mockLocalStorage.getItem.mockReturnValue('{invalid json}');
      const result = loadSnapshot('corrupted');

      expect(result).toBeNull();
    });

    it('deleteSnapshot应该成功删除快照', () => {
      const result = deleteSnapshot('test-key');

      expect(result).toBe(true);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('test-key');
    });

    it('listSnapshots应该列出所有快照', () => {
      const snapshot1 = { version: 1, records: [], timestamp: '2026-06-15', recordCount: 1 };
      const snapshot2 = { version: 1, records: [], timestamp: '2026-06-16', recordCount: 2 };

      mockLocalStorage.length = 3;
      mockLocalStorage.key.mockImplementation((index) => {
        const keys = [
          'hxwl-61310-legal-evidence-snapshot-v1-abc123',
          'hxwl-61310-legal-evidence-snapshot-v1-def456',
          'other-key',
        ];
        return keys[index];
      });
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key.includes('abc123')) return JSON.stringify(snapshot1);
        if (key.includes('def456')) return JSON.stringify(snapshot2);
        return null;
      });

      const result = listSnapshots();

      expect(result).toHaveLength(2);
      expect(result[0].timestamp).toBe('2026-06-15');
      expect(result[1].timestamp).toBe('2026-06-16');
    });
  });

  describe('performRollback', () => {
    it('应该成功回滚到快照', () => {
      const snapshotKey = 'hxwl-61310-legal-evidence-snapshot-v1-abc123';
      const snapshotData = {
        version: 1,
        records: [{ id: 'rec1', caseName: '案件A', evidence: '证据1' }],
        timestamp: '2026-06-16T10:00:00Z',
        recordCount: 1,
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(snapshotData));
      const result = performRollback(snapshotKey);

      expect(result.success).toBe(true);
      expect(result.records).toEqual(snapshotData.records);
      expect(result.version).toBe(1);
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('快照不存在时应该返回失败', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      const result = performRollback('nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toContain('快照不存在');
    });
  });

  describe('finishRollback', () => {
    it('应该成功完成回滚（相同版本）', () => {
      const rollbackResult = {
        success: true,
        records: [
          { id: 'rec1', caseName: '案件A', evidence: '证据1' },
          { id: 'rec2', caseName: '案件A', evidence: '证据2' },
        ],
        version: 1,
      };

      const result = finishRollback(rollbackResult);

      expect(result.success).toBe(true);
      expect(result.records).toHaveLength(2);
      expect(result.message).toBe('已成功恢复数据');
    });

    it('回滚失败应该直接返回', () => {
      const rollbackResult = {
        success: false,
        error: '测试错误',
      };

      const result = finishRollback(rollbackResult);

      expect(result).toBe(rollbackResult);
    });

    it('应该从低版本回滚后自动迁移', () => {
      const v0Records = [
        { id: 'rec1', caseName: '案件A', evidence: '证据1', date: '2026-06-01' },
      ];

      const rollbackResult = {
        success: true,
        records: v0Records,
        version: 0,
      };

      const result = finishRollback(rollbackResult);

      expect(result.success).toBe(true);
      expect(result.message).toContain('自动迁移');
      expect(result.records[0].createdAt).toBeDefined();
    });
  });
});
