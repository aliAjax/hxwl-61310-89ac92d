import { describe, it, expect } from 'vitest';
import { buildImportPreview } from '../importValidator';

const mockFieldsConfig = [
  { key: 'caseName', label: '案件' },
  { key: 'evidence', label: '证据材料' },
  { key: 'source', label: '来源' },
  { key: 'date', label: '取得日期' },
  { key: 'purpose', label: '证明目的' },
  { key: 'issue', label: '关联争议点' },
  { key: 'level', label: '保密等级' },
  { key: 'status', label: '当前状态' },
];

const PRIMARY_STATUS = '待核对';

describe('导入预览必填校验', () => {
  describe('空内容处理', () => {
    it('应该正确处理空文本', () => {
      const result = buildImportPreview('', mockFieldsConfig, PRIMARY_STATUS);
      expect(result.hasData).toBe(false);
      expect(result.validRows).toEqual([]);
      expect(result.invalidRows).toEqual([]);
      expect(result.missingRequired).toHaveLength(2);
      expect(result.missingRequired.map(f => f.key)).toContain('caseName');
      expect(result.missingRequired.map(f => f.key)).toContain('evidence');
    });

    it('应该正确处理只有空白字符的文本', () => {
      const result = buildImportPreview('   \n   \n  ', mockFieldsConfig, PRIMARY_STATUS);
      expect(result.hasData).toBe(false);
    });
  });

  describe('字段匹配', () => {
    it('应该正确匹配所有必填字段', () => {
      const csv = '案件,证据,来源\n合同纠纷案,付款截图,委托人提供';
      const result = buildImportPreview(csv, mockFieldsConfig, PRIMARY_STATUS);
      expect(result.hasData).toBe(true);
      expect(result.matchedFields.map(f => f.key)).toContain('caseName');
      expect(result.matchedFields.map(f => f.key)).toContain('evidence');
      expect(result.missingRequired).toEqual([]);
    });

    it('应该正确识别未匹配的表头', () => {
      const csv = '案件,证据,备注,额外字段\n合同纠纷案,付款截图,测试备注,额外值';
      const result = buildImportPreview(csv, mockFieldsConfig, PRIMARY_STATUS);
      expect(result.unmatchedHeaders).toContain('备注');
      expect(result.unmatchedHeaders).toContain('额外字段');
    });

    it('应该支持自定义字段映射', () => {
      const csv = '第一列,第二列,备注\n合同纠纷案,付款截图,测试';
      const customMapping = { 0: 'caseName', 1: 'evidence' };
      const result = buildImportPreview(csv, mockFieldsConfig, PRIMARY_STATUS, customMapping);
      expect(result.matchedFields.map(f => f.key)).toContain('caseName');
      expect(result.matchedFields.map(f => f.key)).toContain('evidence');
      expect(result.validRows).toHaveLength(1);
    });
  });

  describe('必填校验', () => {
    it('应该通过完整数据行的校验', () => {
      const csv = '案件,证据\n合同纠纷案,付款截图\n设备买卖案,维修报告';
      const result = buildImportPreview(csv, mockFieldsConfig, PRIMARY_STATUS);
      expect(result.validRows).toHaveLength(2);
      expect(result.invalidRows).toEqual([]);
      expect(result.rowCount).toBe(2);
    });

    it('应该标记缺少案件名称的行为无效', () => {
      const csv = '案件,证据\n,付款截图\n设备买卖案,维修报告';
      const result = buildImportPreview(csv, mockFieldsConfig, PRIMARY_STATUS);
      expect(result.validRows).toHaveLength(1);
      expect(result.invalidRows).toHaveLength(1);
      expect(result.invalidRows[0]._missingFields).toContain('案件');
      expect(result.invalidRows[0]._rowNumber).toBe(2);
    });

    it('应该标记缺少证据名称的行为无效', () => {
      const csv = '案件,证据\n合同纠纷案,\n设备买卖案,维修报告';
      const result = buildImportPreview(csv, mockFieldsConfig, PRIMARY_STATUS);
      expect(result.validRows).toHaveLength(1);
      expect(result.invalidRows).toHaveLength(1);
      expect(result.invalidRows[0]._missingFields).toContain('证据材料');
    });

    it('应该标记同时缺少两个必填字段的行为无效', () => {
      const csv = '案件,证据\n,\n合同纠纷案,付款截图';
      const result = buildImportPreview(csv, mockFieldsConfig, PRIMARY_STATUS);
      expect(result.validRows).toHaveLength(1);
      expect(result.invalidRows).toHaveLength(1);
      expect(result.invalidRows[0]._missingFields).toContain('案件');
      expect(result.invalidRows[0]._missingFields).toContain('证据材料');
    });

    it('应该正确识别空白字符串为缺失', () => {
      const csv = '案件,证据\n"   ",付款截图\n"  ","  "';
      const result = buildImportPreview(csv, mockFieldsConfig, PRIMARY_STATUS);
      expect(result.validRows).toHaveLength(0);
      expect(result.invalidRows).toHaveLength(2);
    });

    it('应该标记缺少必填字段的导入为缺少必填字段', () => {
      const csv = '来源,日期\n委托人提供,2026-06-02';
      const result = buildImportPreview(csv, mockFieldsConfig, PRIMARY_STATUS);
      expect(result.missingRequired).toHaveLength(2);
      expect(result.missingRequired.map(f => f.key)).toContain('caseName');
      expect(result.missingRequired.map(f => f.key)).toContain('evidence');
    });

    it('应该标记只缺少一个必填字段的导入', () => {
      const csv = '案件,来源\n合同纠纷案,委托人提供';
      const result = buildImportPreview(csv, mockFieldsConfig, PRIMARY_STATUS);
      expect(result.missingRequired).toHaveLength(1);
      expect(result.missingRequired[0].key).toBe('evidence');
    });
  });

  describe('数据提取与默认值', () => {
    it('应该正确提取所有字段数据', () => {
      const csv = '案件,证据,来源,取得日期,证明目的,关联争议点,保密等级,当前状态\n合同纠纷案,付款截图,委托人提供,2026-06-02,证明被告已收款,付款事实,内部,已核对';
      const result = buildImportPreview(csv, mockFieldsConfig, PRIMARY_STATUS);
      expect(result.validRows).toHaveLength(1);
      const row = result.validRows[0];
      expect(row.caseName).toBe('合同纠纷案');
      expect(row.evidence).toBe('付款截图');
      expect(row.source).toBe('委托人提供');
      expect(row.date).toBe('2026-06-02');
      expect(row.purpose).toBe('证明被告已收款');
      expect(row.issue).toBe('付款事实');
      expect(row.level).toBe('内部');
      expect(row.status).toBe('已核对');
    });

    it('对于缺失的状态字段应该使用默认值', () => {
      const csv = '案件,证据\n合同纠纷案,付款截图';
      const result = buildImportPreview(csv, mockFieldsConfig, PRIMARY_STATUS);
      expect(result.validRows[0].status).toBe(PRIMARY_STATUS);
    });

    it('应该正确设置行号（从2开始，因为第1行是表头）', () => {
      const csv = '案件,证据\n行1,证1\n行2,证2\n行3,证3';
      const result = buildImportPreview(csv, mockFieldsConfig, PRIMARY_STATUS);
      expect(result.validRows[0]._rowNumber).toBe(2);
      expect(result.validRows[1]._rowNumber).toBe(3);
      expect(result.validRows[2]._rowNumber).toBe(4);
    });
  });

  describe('复杂场景', () => {
    it('应该正确处理混合有效和无效行的情况', () => {
      const csv = `案件,证据,来源
合同纠纷案,付款截图,委托人提供
,缺失案件,测试来源
设备买卖案,,第三方机构
劳动争议案,工资条,公司提供`;
      const result = buildImportPreview(csv, mockFieldsConfig, PRIMARY_STATUS);
      expect(result.validRows).toHaveLength(2);
      expect(result.invalidRows).toHaveLength(2);
      expect(result.rowCount).toBe(4);
    });

    it('应该正确处理带引号的复杂内容', () => {
      const csv = `案件,证据,证明目的
合同纠纷案,付款截图,"证明被告已收到预付款，金额为100万元整"
设备买卖案,维修报告,"证明设备存在质量问题，需要维修，费用约5万元"`;
      const result = buildImportPreview(csv, mockFieldsConfig, PRIMARY_STATUS);
      expect(result.validRows).toHaveLength(2);
      expect(result.validRows[0].purpose).toBe('证明被告已收到预付款，金额为100万元整');
      expect(result.validRows[1].purpose).toBe('证明设备存在质量问题，需要维修，费用约5万元');
    });

    it('应该正确返回字段映射关系', () => {
      const csv = '案件,证据,来源\n合同纠纷案,付款截图,委托人提供';
      const result = buildImportPreview(csv, mockFieldsConfig, PRIMARY_STATUS);
      expect(result.fieldMapping).toEqual({
        caseName: 0,
        evidence: 1,
        source: 2,
      });
    });

    it('应该返回原始表头和行数据', () => {
      const csv = '案件,证据,来源\n合同纠纷案,付款截图,委托人提供';
      const result = buildImportPreview(csv, mockFieldsConfig, PRIMARY_STATUS);
      expect(result.headers).toEqual(['案件', '证据', '来源']);
      expect(result.rawRows).toEqual([['合同纠纷案', '付款截图', '委托人提供']]);
    });
  });

  describe('已匹配字段信息', () => {
    it('应该返回已匹配字段的键和标签', () => {
      const csv = '案件,证据,来源\n合同纠纷案,付款截图,委托人提供';
      const result = buildImportPreview(csv, mockFieldsConfig, PRIMARY_STATUS);
      expect(result.matchedFields).toEqual([
        { key: 'caseName', label: '案件' },
        { key: 'evidence', label: '证据材料' },
        { key: 'source', label: '来源' },
      ]);
    });

    it('对于未配置的字段应该返回默认标签', () => {
      const result = buildImportPreview('', [], PRIMARY_STATUS);
      const missingCaseName = result.missingRequired.find(f => f.key === 'caseName');
      expect(missingCaseName?.label).toBe('caseName');
    });
  });
});
