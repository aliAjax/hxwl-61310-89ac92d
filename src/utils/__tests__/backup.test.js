import { describe, it, expect, beforeEach, vi } from 'vitest';
import { analyzeBackupImport, applyBackupMerge, prepareIncomingRecord } from '../backup';

const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0,
};

Object.defineProperty(globalThis, 'localStorage', { value: mockLocalStorage });

describe('备份导入分析', () => {
  const currentRecords = [
    { id: 'rec1', caseName: '案件A', evidence: '证据1', source: '来源1', date: '2026-06-01', status: '已核对' },
    { id: 'rec2', caseName: '案件A', evidence: '证据2', source: '来源2', date: '2026-06-02', status: '待核对' },
    { id: 'rec3', caseName: '案件B', evidence: '证据3', source: '来源3', date: '2026-06-03', status: '需补强' },
  ];

  describe('analyzeBackupImport', () => {
    it('空内容应该返回hasData: false', () => {
      const result = analyzeBackupImport('', currentRecords);
      expect(result.hasData).toBe(false);
    });

    it('无效JSON应该返回解析错误', () => {
      const result = analyzeBackupImport('{invalid json}', currentRecords);
      expect(result.hasData).toBe(true);
      expect(result.parseError).toBe(true);
      expect(result.errorDetail).toBe('无法解析为有效JSON');
    });

    it('不兼容的数据格式应该返回错误', () => {
      const result = analyzeBackupImport('{"key": "value"}', currentRecords);
      expect(result.hasData).toBe(true);
      expect(result.parseError).toBe(true);
      expect(result.errorDetail).toContain('数据格式不兼容');
    });

    it('数组格式应该正确解析', () => {
      const backupRecords = [
        { caseName: '案件C', evidence: '新证据1', source: '来源4', date: '2026-06-04' },
      ];
      const result = analyzeBackupImport(JSON.stringify(backupRecords), currentRecords);
      expect(result.hasData).toBe(true);
      expect(result.parseError).toBe(false);
      expect(result.backupSchemaVersion).toBe(0);
      expect(result.backupRecords).toHaveLength(1);
    });

    it('版本化对象格式应该正确解析', () => {
      const backupData = {
        _schemaVersion: 1,
        records: [
          { caseName: '案件C', evidence: '新证据1', source: '来源4', date: '2026-06-04' },
        ],
      };
      const result = analyzeBackupImport(JSON.stringify(backupData), currentRecords);
      expect(result.hasData).toBe(true);
      expect(result.parseError).toBe(false);
      expect(result.backupSchemaVersion).toBe(1);
    });

    it('应该正确识别字段差异', () => {
      const backupRecords = [
        { caseName: '案件C', evidence: '新证据1', source: '来源4', date: '2026-06-04', extraField: '额外值' },
      ];
      const result = analyzeBackupImport(JSON.stringify(backupRecords), currentRecords);
      expect(result.fieldComparison.extraFields).toContain('extraField');
      expect(result.fieldComparison.commonFields).toContain('caseName');
    });

    it('应该正确识别ID冲突', () => {
      const backupRecords = [
        { id: 'rec1', caseName: '案件A', evidence: '证据1', source: '修改后的来源', date: '2026-06-01' },
      ];
      const result = analyzeBackupImport(JSON.stringify(backupRecords), currentRecords);
      expect(result.conflictAnalysis.overlappingIds).toBe(1);
      expect(result.conflictAnalysis.riskLevel).toBe('high');
    });

    it('应该正确识别内容冲突（案件+证据）', () => {
      const backupRecords = [
        { id: 'newId', caseName: '案件A', evidence: '证据1', source: '修改后的来源', date: '2026-06-01' },
      ];
      const result = analyzeBackupImport(JSON.stringify(backupRecords), currentRecords);
      expect(result.conflictAnalysis.overlappingContent).toBe(1);
      expect(result.conflictAnalysis.riskLevel).toBe('medium');
    });

    it('应该生成三种策略的预览', () => {
      const backupRecords = [
        { id: 'rec1', caseName: '案件A', evidence: '证据1', source: '修改后的来源', date: '2026-06-01' },
        { caseName: '案件C', evidence: '新证据1', source: '来源4', date: '2026-06-04' },
      ];
      const result = analyzeBackupImport(JSON.stringify(backupRecords), currentRecords);

      expect(result.strategyPreviews.addOnly.addCount).toBe(1);
      expect(result.strategyPreviews.addOnly.skipCount).toBe(1);

      expect(result.strategyPreviews.overwriteById.addCount).toBe(1);
      expect(result.strategyPreviews.overwriteById.overwriteCount).toBe(1);

      expect(result.strategyPreviews.mergeByCaseEvidence.addCount).toBe(1);
      expect(result.strategyPreviews.mergeByCaseEvidence.overwriteCount).toBe(1);
    });

    it('无冲突时风险等级应为low', () => {
      const backupRecords = [
        { caseName: '案件C', evidence: '新证据1', source: '来源4', date: '2026-06-04' },
      ];
      const result = analyzeBackupImport(JSON.stringify(backupRecords), currentRecords);
      expect(result.conflictAnalysis.riskLevel).toBe('low');
      expect(result.conflictAnalysis.overwriteRisk).toBe(false);
    });
  });

  describe('prepareIncomingRecord', () => {
    it('应该为记录补充必要字段', () => {
      const record = { caseName: '案件A', evidence: '证据1' };
      const result = prepareIncomingRecord(record, 'addOnly', '测试导入');
      expect(result.id).toBeDefined();
      expect(result.status).toBe('待核对');
      expect(result.timeline).toHaveLength(1);
      expect(result.createdAt).toBeDefined();
    });

    it('应该保留已有字段', () => {
      const record = { id: 'customId', caseName: '案件A', evidence: '证据1', status: '已核对' };
      const result = prepareIncomingRecord(record, 'addOnly', '测试导入');
      expect(result.id).toBe('customId');
      expect(result.status).toBe('已核对');
    });

    it('应该保留已有timeline', () => {
      const timeline = [{ status: '已核对', at: '2026-06-01', by: '原操作员' }];
      const record = { caseName: '案件A', evidence: '证据1', timeline };
      const result = prepareIncomingRecord(record, 'addOnly', '测试导入');
      expect(result.timeline).toBe(timeline);
    });
  });

  describe('applyBackupMerge', () => {
    beforeEach(() => {
      mockLocalStorage.setItem.mockClear();
    });

    it('无效的分析结果应该返回null', () => {
      const result = applyBackupMerge(null, currentRecords, 'addOnly');
      expect(result).toBeNull();
    });

    it('addOnly策略应该只添加新记录', () => {
      const backupRecords = [
        { id: 'rec1', caseName: '案件A', evidence: '证据1', source: '修改后的来源', date: '2026-06-01' },
        { caseName: '案件C', evidence: '新证据1', source: '来源4', date: '2026-06-04' },
      ];
      const analysis = analyzeBackupImport(JSON.stringify(backupRecords), currentRecords);
      const result = applyBackupMerge(analysis, currentRecords, 'addOnly');

      expect(result).not.toBeNull();
      expect(result).toHaveLength(4);

      const original = result.find(r => r.id === 'rec1');
      expect(original.source).toBe('来源1');

      const newRecord = result.find(r => r.evidence === '新证据1');
      expect(newRecord).toBeDefined();
      expect(newRecord.caseName).toBe('案件C');
    });

    it('overwriteById策略应该按ID覆盖', () => {
      const backupRecords = [
        { id: 'rec1', caseName: '案件A', evidence: '证据1', source: '修改后的来源', date: '2026-06-01' },
        { caseName: '案件C', evidence: '新证据1', source: '来源4', date: '2026-06-04' },
      ];
      const analysis = analyzeBackupImport(JSON.stringify(backupRecords), currentRecords);
      const result = applyBackupMerge(analysis, currentRecords, 'overwriteById');

      expect(result).not.toBeNull();
      expect(result).toHaveLength(4);

      const updated = result.find(r => r.id === 'rec1');
      expect(updated.source).toBe('修改后的来源');
    });

    it('mergeByCaseEvidence策略应该按案件+证据合并', () => {
      const backupRecords = [
        { id: 'newId', caseName: '案件A', evidence: '证据1', source: '修改后的来源', date: '2026-06-01' },
        { caseName: '案件C', evidence: '新证据1', source: '来源4', date: '2026-06-04' },
      ];
      const analysis = analyzeBackupImport(JSON.stringify(backupRecords), currentRecords);
      const result = applyBackupMerge(analysis, currentRecords, 'mergeByCaseEvidence');

      expect(result).not.toBeNull();
      expect(result).toHaveLength(4);

      const updated = result.find(r => r.caseName === '案件A' && r.evidence === '证据1');
      expect(updated.source).toBe('修改后的来源');
      expect(updated.id).toBe('rec1');
    });

    it('应该确保记录完整性（唯一ID）', () => {
      const backupRecords = [
        { id: 'rec1', caseName: '案件C', evidence: '新证据1', source: '来源4', date: '2026-06-04' },
        { id: 'rec1', caseName: '案件C', evidence: '新证据2', source: '来源5', date: '2026-06-05' },
      ];
      const analysis = analyzeBackupImport(JSON.stringify(backupRecords), currentRecords);
      const result = applyBackupMerge(analysis, currentRecords, 'addOnly');

      const ids = result.map(r => r.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('应该为导入的记录添加timeline', () => {
      const backupRecords = [
        { caseName: '案件C', evidence: '新证据1', source: '来源4', date: '2026-06-04' },
      ];
      const analysis = analyzeBackupImport(JSON.stringify(backupRecords), currentRecords);
      const result = applyBackupMerge(analysis, currentRecords, 'addOnly');

      const newRecord = result.find(r => r.evidence === '新证据1');
      expect(newRecord.timeline).toBeDefined();
      expect(newRecord.timeline.length).toBeGreaterThan(0);
      expect(newRecord.timeline[0].by).toContain('备份导入');
    });
  });
});
