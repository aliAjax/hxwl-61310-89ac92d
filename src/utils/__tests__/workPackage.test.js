import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  buildWorkPackage,
  parseWorkPackage,
  computeRecordHash,
  recordsEqual,
  detectWorkPackageConflicts,
  applyWorkPackageMerge,
  WORK_PACKAGE_TYPE,
  WORK_PACKAGE_VERSION,
} from '../workPackage';

const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0,
};

Object.defineProperty(globalThis, 'localStorage', { value: mockLocalStorage });

describe('工作包构建与解析', () => {
  const mockRecords = [
    { id: 'rec1', caseName: '案件A', evidence: '证据1', source: '来源1', date: '2026-06-01', status: '已核对', issue: '合同成立', level: '内部' },
    { id: 'rec2', caseName: '案件A', evidence: '证据2', source: '来源2', date: '2026-06-02', status: '待核对', issue: '付款事实', level: '机密' },
    { id: 'rec3', caseName: '案件B', evidence: '证据3', source: '来源3', date: '2026-06-03', status: '需补强', issue: '交付瑕疵', level: '公开' },
  ];

  const mockCustomIssues = {
    '案件A': ['新增争议点1', '新增争议点2'],
    '案件B': ['其他争议点'],
  };

  const mockTemplates = {
    custom: {
      '合同成立': ['模板1', '模板2'],
      '付款事实': ['模板3'],
    },
    favorites: { '合同成立': ['模板1'] },
    recent: { '合同成立': { '模板1': '2026-06-10' } },
  };

  const mockTasks = [
    { id: 'task1', caseName: '案件A', evidenceId: 'rec1', status: '待处理', deadline: '2026-06-20' },
    { id: 'task2', caseName: '案件A', evidenceId: 'rec2', status: '处理中', deadline: '2026-06-25' },
    { id: 'task3', caseName: '案件B', evidenceId: 'rec3', status: '已完成', deadline: '2026-06-10' },
  ];

  const mockFactNodes = [
    { id: 'node1', caseName: '案件A', title: '事实节点1', evidenceIds: ['rec1', 'rec2'], dateFrom: '2026-06-01', dateTo: '2026-06-02' },
    { id: 'node2', caseName: '案件B', title: '事实节点2', evidenceIds: ['rec3'], dateFrom: '2026-06-03', dateTo: '2026-06-03' },
  ];

  const allSections = ['records', 'customIssues', 'purposeTemplates', 'tasks', 'factNodes'];

  describe('buildWorkPackage', () => {
    it('应该正确构建包含所有部分的工作包', () => {
      const wp = buildWorkPackage('案件A', mockRecords, mockTemplates, mockCustomIssues, mockTasks, mockFactNodes, allSections);

      expect(wp._type).toBe(WORK_PACKAGE_TYPE);
      expect(wp._packageVersion).toBe(WORK_PACKAGE_VERSION);
      expect(wp.caseName).toBe('案件A');
      expect(wp.records).toHaveLength(2);
      expect(wp._stats.recordCount).toBe(2);
      expect(wp._stats.customIssueCount).toBe(2);
      expect(wp._stats.templateIssueCount).toBe(2);
      expect(wp._stats.taskCount).toBe(2);
      expect(wp._stats.factNodeCount).toBe(1);
    });

    it('应该只包含指定的部分', () => {
      const wp = buildWorkPackage('案件A', mockRecords, mockTemplates, mockCustomIssues, mockTasks, mockFactNodes, ['records', 'tasks']);

      expect(wp.records).toHaveLength(2);
      expect(wp.tasks).toHaveLength(2);
      expect(wp.customIssues).toEqual({});
      expect(wp.purposeTemplates).toEqual({ custom: {}, favorites: {}, recent: {} });
      expect(wp.factNodes).toEqual([]);
    });

    it('应该正确过滤其他案件的数据', () => {
      const wp = buildWorkPackage('案件A', mockRecords, mockTemplates, mockCustomIssues, mockTasks, mockFactNodes, allSections);

      expect(wp.records.every(r => r.caseName === '案件A')).toBe(true);
      expect(wp.tasks.every(t => t.caseName === '案件A' || t.evidenceId === 'rec1' || t.evidenceId === 'rec2')).toBe(true);
      expect(wp.factNodes.every(n => n.caseName === '案件A')).toBe(true);
    });
  });

  describe('parseWorkPackage', () => {
    it('空内容应该返回错误', () => {
      const result = parseWorkPackage('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('为空');
    });

    it('无效JSON应该返回错误', () => {
      const result = parseWorkPackage('{invalid}');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('JSON');
    });

    it('缺少_type标识应该返回错误', () => {
      const data = { caseName: '案件A', records: [] };
      const result = parseWorkPackage(JSON.stringify(data));
      expect(result.valid).toBe(false);
      expect(result.error).toContain('_type');
    });

    it('版本过高应该返回错误', () => {
      const data = {
        _type: WORK_PACKAGE_TYPE,
        _packageVersion: 999,
        _schemaVersion: 1,
        caseName: '案件A',
        records: [],
      };
      const result = parseWorkPackage(JSON.stringify(data));
      expect(result.valid).toBe(false);
      expect(result.error).toContain('版本');
    });

    it('缺少案件名称应该返回错误', () => {
      const data = {
        _type: WORK_PACKAGE_TYPE,
        _packageVersion: 1,
        _schemaVersion: 1,
        caseName: '',
        records: [],
      };
      const result = parseWorkPackage(JSON.stringify(data));
      expect(result.valid).toBe(false);
      expect(result.error).toContain('案件名称');
    });

    it('正确的工作包应该解析成功', () => {
      const wp = buildWorkPackage('案件A', mockRecords, mockTemplates, mockCustomIssues, mockTasks, mockFactNodes, allSections);
      const result = parseWorkPackage(JSON.stringify(wp));

      expect(result.valid).toBe(true);
      expect(result.data.caseName).toBe('案件A');
      expect(result.data.records).toHaveLength(2);
    });

    it('应该为旧版本工作包补充缺失字段', () => {
      const oldWp = {
        _type: WORK_PACKAGE_TYPE,
        _packageVersion: 0,
        _schemaVersion: 1,
        caseName: '案件A',
        records: [{ caseName: '案件A', evidence: '旧证据' }],
      };
      const result = parseWorkPackage(JSON.stringify(oldWp));

      expect(result.valid).toBe(true);
      expect(result.data.customIssues).toBeDefined();
      expect(result.data.purposeTemplates).toBeDefined();
      expect(result.data.tasks).toBeDefined();
      expect(result.data.factNodes).toBeDefined();
      expect(result.data._sections).toBeDefined();
    });
  });

  describe('computeRecordHash & recordsEqual', () => {
    it('应该为相同内容的记录生成相同的hash', () => {
      const record = { id: 'rec1', caseName: '案件A', evidence: '证据1', source: '来源1' };
      const hash1 = computeRecordHash(record);
      const hash2 = computeRecordHash({ ...record, timeline: [], createdAt: '2026-01-01' });
      expect(hash1).toBe(hash2);
    });

    it('应该忽略timeline和createdAt进行比较', () => {
      const a = { id: 'rec1', caseName: '案件A', evidence: '证据1', timeline: [{ status: '已核对' }], createdAt: '2026-01-01' };
      const b = { id: 'rec1', caseName: '案件A', evidence: '证据1', timeline: [], createdAt: '2026-06-01' };
      expect(recordsEqual(a, b)).toBe(true);
    });

    it('内容不同应该返回false', () => {
      const a = { id: 'rec1', caseName: '案件A', evidence: '证据1' };
      const b = { id: 'rec1', caseName: '案件A', evidence: '证据2' };
      expect(recordsEqual(a, b)).toBe(false);
    });

    it('嵌套对象应该正确比较', () => {
      const a = { id: 'rec1', meta: { key: 'value' } };
      const b = { id: 'rec1', meta: { key: 'value' } };
      const c = { id: 'rec1', meta: { key: 'different' } };
      expect(recordsEqual(a, b)).toBe(true);
      expect(recordsEqual(a, c)).toBe(false);
    });
  });

  describe('detectWorkPackageConflicts', () => {
    const localRecords = [
      { id: 'rec1', caseName: '案件A', evidence: '证据1', source: '来源1', status: '已核对' },
      { id: 'rec2', caseName: '案件A', evidence: '证据2', source: '来源2', status: '待核对' },
      { id: 'rec3', caseName: '案件A', evidence: '证据3', source: '来源3', status: '需补强' },
    ];

    const localTemplates = { custom: {}, favorites: {}, recent: {} };
    const localCustomIssues = { '案件A': ['已有争议点'] };
    const localTasks = [{ id: 'task1', caseName: '案件A', status: '待处理' }];
    const localFactNodes = [{ id: 'node1', caseName: '案件A', title: '节点1' }];

    it('应该正确识别新增记录', () => {
      const wpData = {
        caseName: '案件A',
        records: [{ id: 'rec4', caseName: '案件A', evidence: '新证据', source: '新来源', status: '待核对' }],
        customIssues: {},
        purposeTemplates: { custom: {}, favorites: {}, recent: {} },
        tasks: [],
        factNodes: [],
      };

      const result = detectWorkPackageConflicts(wpData, localRecords, localTemplates, localCustomIssues, localTasks, localFactNodes);
      expect(result.records.additions).toHaveLength(1);
      expect(result.records.conflicts).toHaveLength(0);
    });

    it('应该正确识别ID冲突', () => {
      const wpData = {
        caseName: '案件A',
        records: [{ id: 'rec1', caseName: '案件A', evidence: '证据1', source: '修改后的来源', status: '已核对' }],
        customIssues: {},
        purposeTemplates: { custom: {}, favorites: {}, recent: {} },
        tasks: [],
        factNodes: [],
      };

      const result = detectWorkPackageConflicts(wpData, localRecords, localTemplates, localCustomIssues, localTasks, localFactNodes);
      expect(result.records.conflicts).toHaveLength(1);
      expect(result.records.conflicts[0].matchKey).toBe('id');
      expect(result.records.conflicts[0].fieldDiffs.source).toBeDefined();
    });

    it('应该正确识别内容冲突（案件+证据）', () => {
      const wpData = {
        caseName: '案件A',
        records: [{ id: 'newId', caseName: '案件A', evidence: '证据1', source: '修改后的来源', status: '已核对' }],
        customIssues: {},
        purposeTemplates: { custom: {}, favorites: {}, recent: {} },
        tasks: [],
        factNodes: [],
      };

      const result = detectWorkPackageConflicts(wpData, localRecords, localTemplates, localCustomIssues, localTasks, localFactNodes);
      expect(result.records.conflicts).toHaveLength(1);
      expect(result.records.conflicts[0].matchKey).toBe('content');
    });

    it('应该正确识别本地独有记录', () => {
      const wpData = {
        caseName: '案件A',
        records: [{ id: 'rec1', caseName: '案件A', evidence: '证据1', source: '来源1', status: '已核对' }],
        customIssues: {},
        purposeTemplates: { custom: {}, favorites: {}, recent: {} },
        tasks: [],
        factNodes: [],
      };

      const result = detectWorkPackageConflicts(wpData, localRecords, localTemplates, localCustomIssues, localTasks, localFactNodes);
      expect(result.records.localsOnly).toHaveLength(2);
    });

    it('应该正确识别任务冲突', () => {
      const wpData = {
        caseName: '案件A',
        records: [],
        customIssues: {},
        purposeTemplates: { custom: {}, favorites: {}, recent: {} },
        tasks: [{ id: 'task1', caseName: '案件A', status: '已完成' }],
        factNodes: [],
      };

      const result = detectWorkPackageConflicts(wpData, localRecords, localTemplates, localCustomIssues, localTasks, localFactNodes);
      expect(result.tasks.conflicts).toHaveLength(1);
    });

    it('应该正确识别新增自定义争议点', () => {
      const wpData = {
        caseName: '案件A',
        records: [],
        customIssues: { '案件A': ['新增争议点'] },
        purposeTemplates: { custom: {}, favorites: {}, recent: {} },
        tasks: [],
        factNodes: [],
      };

      const result = detectWorkPackageConflicts(wpData, localRecords, localTemplates, localCustomIssues, localTasks, localFactNodes);
      expect(result.customIssues.additions).toHaveLength(1);
    });
  });

  describe('applyWorkPackageMerge', () => {
    beforeEach(() => {
      mockLocalStorage.setItem.mockClear();
    });

    const localRecords = [
      { id: 'rec1', caseName: '案件A', evidence: '证据1', source: '来源1', status: '已核对' },
      { id: 'rec2', caseName: '案件A', evidence: '证据2', source: '来源2', status: '待核对' },
    ];

    const localTemplates = { custom: {}, favorites: {}, recent: {} };
    const localCustomIssues = {};
    const localTasks = [];
    const localFactNodes = [];

    it('keepLocal策略应该保留本地版本', () => {
      const wpData = {
        caseName: '案件A',
        records: [{ id: 'rec1', caseName: '案件A', evidence: '证据1', source: '修改后的来源', status: '待核对' }],
        customIssues: {},
        purposeTemplates: { custom: {}, favorites: {}, recent: {} },
        tasks: [],
        factNodes: [],
      };

      const conflicts = detectWorkPackageConflicts(wpData, localRecords, localTemplates, localCustomIssues, localTasks, localFactNodes);
      const resolutions = {
        records: conflicts.records.conflicts.map(c => ({ ...c, resolution: 'keepLocal' })),
        customIssues: [],
        purposeTemplates: [],
        tasks: [],
        factNodes: [],
      };

      const result = applyWorkPackageMerge(wpData, resolutions, localRecords, localTemplates, localCustomIssues, localTasks, localFactNodes);
      const updated = result.records.find(r => r.id === 'rec1');
      expect(updated.source).toBe('来源1');
    });

    it('useIncoming策略应该使用导入版本', () => {
      const wpData = {
        caseName: '案件A',
        records: [{ id: 'rec1', caseName: '案件A', evidence: '证据1', source: '修改后的来源', status: '待核对' }],
        customIssues: {},
        purposeTemplates: { custom: {}, favorites: {}, recent: {} },
        tasks: [],
        factNodes: [],
      };

      const conflicts = detectWorkPackageConflicts(wpData, localRecords, localTemplates, localCustomIssues, localTasks, localFactNodes);
      const resolutions = {
        records: conflicts.records.conflicts.map(c => ({ ...c, resolution: 'useIncoming' })),
        customIssues: [],
        purposeTemplates: [],
        tasks: [],
        factNodes: [],
      };

      const result = applyWorkPackageMerge(wpData, resolutions, localRecords, localTemplates, localCustomIssues, localTasks, localFactNodes);
      const updated = result.records.find(r => r.id === 'rec1');
      expect(updated.source).toBe('修改后的来源');
      expect(updated.timeline).toBeDefined();
      expect(updated.timeline.some(t => t.by?.includes('工作包'))).toBe(true);
    });

    it('应该正确添加新记录', () => {
      const wpData = {
        caseName: '案件A',
        records: [{ id: 'rec3', caseName: '案件A', evidence: '新证据', source: '新来源', status: '待核对' }],
        customIssues: {},
        purposeTemplates: { custom: {}, favorites: {}, recent: {} },
        tasks: [],
        factNodes: [],
      };

      const conflicts = detectWorkPackageConflicts(wpData, localRecords, localTemplates, localCustomIssues, localTasks, localFactNodes);
      const resolutions = {
        records: conflicts.records.additions.map(a => ({ ...a, resolution: 'useIncoming' })),
        customIssues: [],
        purposeTemplates: [],
        tasks: [],
        factNodes: [],
      };

      const result = applyWorkPackageMerge(wpData, resolutions, localRecords, localTemplates, localCustomIssues, localTasks, localFactNodes);
      expect(result.records).toHaveLength(3);
      const newRecord = result.records.find(r => r.id === 'rec3');
      expect(newRecord).toBeDefined();
      expect(newRecord.timeline).toBeDefined();
    });

    it('应该正确合并自定义争议点', () => {
      const wpData = {
        caseName: '案件A',
        records: [],
        customIssues: { '案件A': ['新增争议点'] },
        purposeTemplates: { custom: {}, favorites: {}, recent: {} },
        tasks: [],
        factNodes: [],
      };

      const resolutions = {
        records: [],
        customIssues: [{ type: 'add', item: '新增争议点', resolution: 'useIncoming' }],
        purposeTemplates: [],
        tasks: [],
        factNodes: [],
      };

      const result = applyWorkPackageMerge(wpData, resolutions, localRecords, localTemplates, localCustomIssues, localTasks, localFactNodes);
      expect(result.customIssues['案件A']).toContain('新增争议点');
    });

    it('mergeFields策略应该按字段合并', () => {
      const wpData = {
        caseName: '案件A',
        records: [{ id: 'rec1', caseName: '案件A', evidence: '证据1', source: '修改后的来源', status: '待核对', purpose: '新的证明目的' }],
        customIssues: {},
        purposeTemplates: { custom: {}, favorites: {}, recent: {} },
        tasks: [],
        factNodes: [],
      };

      const conflicts = detectWorkPackageConflicts(wpData, localRecords, localTemplates, localCustomIssues, localTasks, localFactNodes);
      const resolutions = {
        records: conflicts.records.conflicts.map(c => ({
          ...c,
          resolution: 'mergeFields',
          fieldResolutions: { source: 'incoming', status: 'local' },
        })),
        customIssues: [],
        purposeTemplates: [],
        tasks: [],
        factNodes: [],
      };

      const result = applyWorkPackageMerge(wpData, resolutions, localRecords, localTemplates, localCustomIssues, localTasks, localFactNodes);
      const updated = result.records.find(r => r.id === 'rec1');
      expect(updated.source).toBe('修改后的来源');
      expect(updated.status).toBe('已核对');
    });
  });
});
