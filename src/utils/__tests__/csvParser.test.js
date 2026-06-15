import { describe, it, expect } from 'vitest';
import { parseCSV, matchField, FIELD_ALIASES, REQUIRED_FIELDS, ALL_FIELDS } from '../csvParser';

describe('CSV解析与字段别名匹配', () => {
  describe('FIELD_ALIASES', () => {
    it('应该包含所有必要的字段别名配置', () => {
      expect(FIELD_ALIASES).toHaveProperty('caseName');
      expect(FIELD_ALIASES).toHaveProperty('evidence');
      expect(FIELD_ALIASES).toHaveProperty('source');
      expect(FIELD_ALIASES).toHaveProperty('date');
      expect(FIELD_ALIASES).toHaveProperty('purpose');
      expect(FIELD_ALIASES).toHaveProperty('issue');
      expect(FIELD_ALIASES).toHaveProperty('level');
      expect(FIELD_ALIASES).toHaveProperty('status');
    });
  });

  describe('REQUIRED_FIELDS', () => {
    it('应该包含案件和证据作为必填字段', () => {
      expect(REQUIRED_FIELDS).toEqual(['caseName', 'evidence']);
    });
  });

  describe('ALL_FIELDS', () => {
    it('应该包含所有8个字段', () => {
      expect(ALL_FIELDS).toHaveLength(8);
      expect(ALL_FIELDS).toContain('caseName');
      expect(ALL_FIELDS).toContain('evidence');
      expect(ALL_FIELDS).toContain('source');
      expect(ALL_FIELDS).toContain('date');
      expect(ALL_FIELDS).toContain('purpose');
      expect(ALL_FIELDS).toContain('issue');
      expect(ALL_FIELDS).toContain('level');
      expect(ALL_FIELDS).toContain('status');
    });
  });

  describe('parseCSV', () => {
    it('应该正确解析简单的CSV内容', () => {
      const csv = '案件,证据,来源\n合同纠纷案,付款截图,委托人提供\n设备买卖案,维修报告,第三方机构';
      const result = parseCSV(csv);
      expect(result.headers).toEqual(['案件', '证据', '来源']);
      expect(result.rows).toHaveLength(2);
      expect(result.rows[0]).toEqual(['合同纠纷案', '付款截图', '委托人提供']);
      expect(result.rows[1]).toEqual(['设备买卖案', '维修报告', '第三方机构']);
    });

    it('应该处理空的CSV内容', () => {
      const result = parseCSV('');
      expect(result.headers).toEqual([]);
      expect(result.rows).toEqual([]);
    });

    it('应该处理只有标题行的CSV', () => {
      const csv = '案件,证据,来源';
      const result = parseCSV(csv);
      expect(result.headers).toEqual(['案件', '证据', '来源']);
      expect(result.rows).toEqual([]);
    });

    it('应该处理Windows换行符\\r\\n', () => {
      const csv = '案件,证据\r\n合同纠纷案,付款截图\r\n';
      const result = parseCSV(csv);
      expect(result.headers).toEqual(['案件', '证据']);
      expect(result.rows).toEqual([['合同纠纷案', '付款截图']]);
    });

    it('应该处理带引号的字段', () => {
      const csv = '案件,证据,证明目的\n合同纠纷案,付款截图,"证明被告已收到预付款，付款金额为100万"';
      const result = parseCSV(csv);
      expect(result.rows[0][2]).toBe('证明被告已收到预付款，付款金额为100万');
    });

    it('应该处理字段内包含逗号的情况（用引号包裹）', () => {
      const csv = '案件,证据,证明目的\n合同纠纷案,付款截图,"证明被告已收款,金额正确"';
      const result = parseCSV(csv);
      expect(result.rows[0]).toEqual(['合同纠纷案', '付款截图', '证明被告已收款,金额正确']);
    });

    it('应该处理转义的双引号', () => {
      const csv = '案件,证据\n合同纠纷案,"证据""名称""包含引号"';
      const result = parseCSV(csv);
      expect(result.rows[0][1]).toBe('证据"名称"包含引号');
    });

    it('应该自动修剪字段前后空格', () => {
      const csv = '案件 , 证据 \n 合同纠纷案 , 付款截图 ';
      const result = parseCSV(csv);
      expect(result.headers).toEqual(['案件', '证据']);
      expect(result.rows[0]).toEqual(['合同纠纷案', '付款截图']);
    });

    it('应该跳过空行', () => {
      const csv = '案件,证据\n\n合同纠纷案,付款截图\n\n\n设备买卖案,维修报告\n';
      const result = parseCSV(csv);
      expect(result.rows).toHaveLength(2);
    });
  });

  describe('matchField', () => {
    it('应该正确匹配中文别名「案件」到caseName', () => {
      expect(matchField('案件')).toBe('caseName');
    });

    it('应该正确匹配中文别名「证据材料」到evidence', () => {
      expect(matchField('证据材料')).toBe('evidence');
    });

    it('应该正确匹配中文别名「来源」到source', () => {
      expect(matchField('来源')).toBe('source');
    });

    it('应该正确匹配中文别名「取得日期」到date', () => {
      expect(matchField('取得日期')).toBe('date');
    });

    it('应该正确匹配中文别名「证明目的」到purpose', () => {
      expect(matchField('证明目的')).toBe('purpose');
    });

    it('应该正确匹配中文别名「关联争议点」到issue', () => {
      expect(matchField('关联争议点')).toBe('issue');
    });

    it('应该正确匹配中文别名「保密等级」到level', () => {
      expect(matchField('保密等级')).toBe('level');
    });

    it('应该正确匹配中文别名「当前状态」到status', () => {
      expect(matchField('当前状态')).toBe('status');
    });

    it('应该正确匹配英文别名「caseName」到caseName', () => {
      expect(matchField('caseName')).toBe('caseName');
    });

    it('应该正确匹配英文别名「evidence」到evidence', () => {
      expect(matchField('evidence')).toBe('evidence');
    });

    it('应该正确匹配带下划线的英文别名「case_name」到caseName', () => {
      expect(matchField('case_name')).toBe('caseName');
    });

    it('应该不区分大小写', () => {
      expect(matchField('CASE')).toBe('caseName');
      expect(matchField('Evidence')).toBe('evidence');
    });

    it('应该忽略空格', () => {
      expect(matchField(' 案件 名称 ')).toBe('caseName');
      expect(matchField('证 据 材 料')).toBe('evidence');
    });

    it('应该匹配各种别名变体', () => {
      expect(matchField('案例名称')).toBe('caseName');
      expect(matchField('材料名称')).toBe('evidence');
      expect(matchField('获取来源')).toBe('source');
      expect(matchField('采集日期')).toBe('date');
      expect(matchField('证明事项')).toBe('purpose');
      expect(matchField('争议焦点')).toBe('issue');
      expect(matchField('密级')).toBe('level');
      expect(matchField('核对状态')).toBe('status');
    });

    it('对于未知字段应该返回null', () => {
      expect(matchField('未知字段')).toBeNull();
      expect(matchField('random')).toBeNull();
      expect(matchField('')).toBeNull();
    });
  });
});
