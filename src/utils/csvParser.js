const FIELD_ALIASES = {
  caseName: ['案件', '案件名称', '案件名', '案例名称', '案例', 'case', 'caseName', 'case_name'],
  evidence: ['证据材料', '证据', '证据名称', '材料名称', '材料', 'evidence', 'material'],
  source: ['来源', '证据来源', '材料来源', '获取来源', 'source', 'from'],
  date: ['取得日期', '日期', '获取日期', '取得时间', '采集日期', 'date', 'acquireDate'],
  purpose: ['证明目的', '证明内容', '证明事项', 'prove'],
  issue: ['关联争议点', '争议点', '焦点', '关联焦点', '争议焦点', 'issue', 'dispute'],
  level: ['保密等级', '密级', '保密级别', '等级', 'level', 'secrecy', 'classification'],
  status: ['当前状态', '状态', '核对状态', 'status', 'state']
};

const REQUIRED_FIELDS = ['caseName', 'evidence'];
const ALL_FIELDS = ['caseName', 'evidence', 'source', 'date', 'purpose', 'issue', 'level', 'status'];

function parseCSV(text) {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(line => line.trim());
  if (lines.length === 0) return { headers: [], rows: [] };

  const parseLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map(parseLine);
  return { headers, rows };
}

function matchField(header) {
  const normalized = header.trim().toLowerCase().replace(/\s+/g, '');
  for (const [fieldKey, aliases] of Object.entries(FIELD_ALIASES)) {
    for (const alias of aliases) {
      if (normalized === alias.toLowerCase().replace(/\s+/g, '')) {
        return fieldKey;
      }
    }
  }
  return null;
}

export { FIELD_ALIASES, REQUIRED_FIELDS, ALL_FIELDS, parseCSV, matchField };
