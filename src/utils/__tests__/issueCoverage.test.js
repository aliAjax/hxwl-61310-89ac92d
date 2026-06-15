import { describe, it, expect } from 'vitest';
import { getAllIssues, computeIssueCoverage, COVERAGE_STATUS_META } from '../issueCoverage';

const BUILT_IN_ISSUES = ['合同成立', '付款事实', '交付瑕疵', '违约损失'];

describe('争议点覆盖状态计算', () => {
  describe('getAllIssues', () => {
    it('应该返回内置争议点列表', () => {
      const result = getAllIssues({}, '合同纠纷案', [], BUILT_IN_ISSUES);
      expect(result).toEqual(BUILT_IN_ISSUES);
    });

    it('应该合并自定义争议点', () => {
      const customIssues = { '合同纠纷案': ['诉讼时效', '证据合法性'] };
      const result = getAllIssues(customIssues, '合同纠纷案', [], BUILT_IN_ISSUES);
      expect(result).toContain('合同成立');
      expect(result).toContain('诉讼时效');
      expect(result).toContain('证据合法性');
      expect(result.length).toBe(6);
    });

    it('应该从记录中提取争议点', () => {
      const records = [
        { caseName: '合同纠纷案', issue: '付款事实', status: '已核对' },
        { caseName: '合同纠纷案', issue: '新增争议点', status: '待核对' },
        { caseName: '其他案件', issue: '不应出现', status: '已核对' },
      ];
      const result = getAllIssues({}, '合同纠纷案', records, BUILT_IN_ISSUES);
      expect(result).toContain('合同成立');
      expect(result).toContain('付款事实');
      expect(result).toContain('新增争议点');
      expect(result).not.toContain('不应出现');
    });

    it('应该去重重复的争议点', () => {
      const customIssues = { '合同纠纷案': ['付款事实', '合同成立'] };
      const records = [
        { caseName: '合同纠纷案', issue: '付款事实', status: '已核对' },
      ];
      const result = getAllIssues(customIssues, '合同纠纷案', records, BUILT_IN_ISSUES);
      const uniqueResult = [...new Set(result)];
      expect(result.length).toBe(uniqueResult.length);
      expect(result.filter(i => i === '付款事实').length).toBe(1);
    });

    it('应该处理空的自定义争议点', () => {
      const result = getAllIssues(null, '合同纠纷案', [], BUILT_IN_ISSUES);
      expect(result).toEqual(BUILT_IN_ISSUES);
    });

    it('应该处理空的记录列表', () => {
      const result = getAllIssues({}, '合同纠纷案', null, BUILT_IN_ISSUES);
      expect(result).toEqual(BUILT_IN_ISSUES);
    });

    it('应该保持顺序：内置 -> 自定义 -> 记录中提取', () => {
      const customIssues = { '合同纠纷案': ['自定义1', '自定义2'] };
      const records = [
        { caseName: '合同纠纷案', issue: '记录1', status: '已核对' },
        { caseName: '合同纠纷案', issue: '记录2', status: '已核对' },
      ];
      const result = getAllIssues(customIssues, '合同纠纷案', records, ['内置1', '内置2']);
      expect(result[0]).toBe('内置1');
      expect(result[1]).toBe('内置2');
      expect(result[2]).toBe('自定义1');
      expect(result[3]).toBe('自定义2');
      expect(result[4]).toBe('记录1');
      expect(result[5]).toBe('记录2');
    });

    it('应该过滤掉空字符串的争议点', () => {
      const records = [
        { caseName: '合同纠纷案', issue: '', status: '已核对' },
        { caseName: '合同纠纷案', issue: null, status: '已核对' },
        { caseName: '合同纠纷案', issue: undefined, status: '已核对' },
      ];
      const result = getAllIssues({}, '合同纠纷案', records, []);
      expect(result).toEqual([]);
    });
  });

  describe('COVERAGE_STATUS_META', () => {
    it('应该包含所有状态的元数据', () => {
      expect(COVERAGE_STATUS_META).toHaveProperty('none');
      expect(COVERAGE_STATUS_META).toHaveProperty('all-pending');
      expect(COVERAGE_STATUS_META).toHaveProperty('need-strengthen');
      expect(COVERAGE_STATUS_META).toHaveProperty('covered');
      expect(COVERAGE_STATUS_META).toHaveProperty('partial');
    });

    it('每个状态元数据应该包含必要的字段', () => {
      Object.values(COVERAGE_STATUS_META).forEach(meta => {
        expect(meta).toHaveProperty('label');
        expect(meta).toHaveProperty('color');
        expect(meta).toHaveProperty('bg');
        expect(meta).toHaveProperty('border');
        expect(meta).toHaveProperty('icon');
      });
    });
  });

  describe('computeIssueCoverage', () => {
    it('对于无证据的争议点应该标记为none', () => {
      const records = [
        { caseName: '合同纠纷案', issue: '付款事实', status: '已核对' },
      ];
      const result = computeIssueCoverage({}, '合同纠纷案', records, ['合同成立', '付款事实']);
      const contractIssue = result.find(i => i.name === '合同成立');
      expect(contractIssue.coverageStatus).toBe('none');
      expect(contractIssue.total).toBe(0);
    });

    it('对于全部待核对的争议点应该标记为all-pending', () => {
      const records = [
        { caseName: '合同纠纷案', issue: '付款事实', status: '待核对' },
        { caseName: '合同纠纷案', issue: '付款事实', status: '待核对' },
      ];
      const result = computeIssueCoverage({}, '合同纠纷案', records, ['付款事实']);
      expect(result[0].coverageStatus).toBe('all-pending');
      expect(result[0].total).toBe(2);
      expect(result[0].pending).toBe(2);
    });

    it('对于存在需补强证据的争议点应该标记为need-strengthen', () => {
      const records = [
        { caseName: '合同纠纷案', issue: '付款事实', status: '已核对' },
        { caseName: '合同纠纷案', issue: '付款事实', status: '需补强' },
        { caseName: '合同纠纷案', issue: '付款事实', status: '待核对' },
      ];
      const result = computeIssueCoverage({}, '合同纠纷案', records, ['付款事实']);
      expect(result[0].coverageStatus).toBe('need-strengthen');
      expect(result[0].needStrengthen).toBe(1);
    });

    it('对于全部已核对的争议点应该标记为covered', () => {
      const records = [
        { caseName: '合同纠纷案', issue: '付款事实', status: '已核对' },
        { caseName: '合同纠纷案', issue: '付款事实', status: '已核对' },
      ];
      const result = computeIssueCoverage({}, '合同纠纷案', records, ['付款事实']);
      expect(result[0].coverageStatus).toBe('covered');
      expect(result[0].verified).toBe(2);
    });

    it('对于部分已核对但不是全部的争议点应该标记为partial', () => {
      const records = [
        { caseName: '合同纠纷案', issue: '付款事实', status: '已核对' },
        { caseName: '合同纠纷案', issue: '付款事实', status: '待核对' },
      ];
      const result = computeIssueCoverage({}, '合同纠纷案', records, ['付款事实']);
      expect(result[0].coverageStatus).toBe('partial');
    });

    it('应该正确统计各状态的数量', () => {
      const records = [
        { caseName: '合同纠纷案', issue: '付款事实', status: '已核对' },
        { caseName: '合同纠纷案', issue: '付款事实', status: '已核对' },
        { caseName: '合同纠纷案', issue: '付款事实', status: '待核对' },
        { caseName: '合同纠纷案', issue: '付款事实', status: '待核对' },
        { caseName: '合同纠纷案', issue: '付款事实', status: '待核对' },
      ];
      const result = computeIssueCoverage({}, '合同纠纷案', records, ['付款事实']);
      expect(result[0].total).toBe(5);
      expect(result[0].verified).toBe(2);
      expect(result[0].pending).toBe(3);
      expect(result[0].needStrengthen).toBe(0);
    });

    it('应该只统计指定案件的记录', () => {
      const records = [
        { caseName: '合同纠纷案', issue: '付款事实', status: '已核对' },
        { caseName: '其他案件', issue: '付款事实', status: '待核对' },
        { caseName: '其他案件', issue: '付款事实', status: '待核对' },
      ];
      const result = computeIssueCoverage({}, '合同纠纷案', records, ['付款事实']);
      expect(result[0].total).toBe(1);
      expect(result[0].verified).toBe(1);
    });

    it('应该为每个争议点返回关联的记录列表', () => {
      const records = [
        { caseName: '合同纠纷案', issue: '付款事实', status: '已核对', evidence: '付款截图' },
        { caseName: '合同纠纷案', issue: '合同成立', status: '待核对', evidence: '合同书' },
      ];
      const result = computeIssueCoverage({}, '合同纠纷案', records, ['付款事实', '合同成立']);
      const paymentIssue = result.find(i => i.name === '付款事实');
      const contractIssue = result.find(i => i.name === '合同成立');
      expect(paymentIssue.records).toHaveLength(1);
      expect(paymentIssue.records[0].evidence).toBe('付款截图');
      expect(contractIssue.records).toHaveLength(1);
      expect(contractIssue.records[0].evidence).toBe('合同书');
    });

    it('应该正确处理多种状态混合的场景', () => {
      const records = [
        { caseName: '合同纠纷案', issue: '争议点A', status: '已核对' },
        { caseName: '合同纠纷案', issue: '争议点B', status: '待核对' },
        { caseName: '合同纠纷案', issue: '争议点B', status: '待核对' },
        { caseName: '合同纠纷案', issue: '争议点C', status: '已核对' },
        { caseName: '合同纠纷案', issue: '争议点C', status: '需补强' },
        { caseName: '合同纠纷案', issue: '争议点D', status: '已核对' },
        { caseName: '合同纠纷案', issue: '争议点D', status: '待核对' },
        { caseName: '合同纠纷案', issue: '争议点E', status: '已核对' },
      ];
      const issues = ['争议点A', '争议点B', '争议点C', '争议点D', '争议点E', '争议点F'];
      const result = computeIssueCoverage({}, '合同纠纷案', records, issues);

      expect(result.find(i => i.name === '争议点A').coverageStatus).toBe('covered');
      expect(result.find(i => i.name === '争议点B').coverageStatus).toBe('all-pending');
      expect(result.find(i => i.name === '争议点C').coverageStatus).toBe('need-strengthen');
      expect(result.find(i => i.name === '争议点D').coverageStatus).toBe('partial');
      expect(result.find(i => i.name === '争议点E').coverageStatus).toBe('covered');
      expect(result.find(i => i.name === '争议点F').coverageStatus).toBe('none');
    });

    it('应该正确处理未知状态的记录', () => {
      const records = [
        { caseName: '合同纠纷案', issue: '付款事实', status: '未知状态' },
        { caseName: '合同纠纷案', issue: '付款事实', status: '其他状态' },
      ];
      const result = computeIssueCoverage({}, '合同纠纷案', records, ['付款事实']);
      expect(result[0].total).toBe(2);
      expect(result[0].pending).toBe(0);
      expect(result[0].verified).toBe(0);
      expect(result[0].needStrengthen).toBe(0);
      expect(result[0].coverageStatus).toBe('partial');
    });
  });
});
