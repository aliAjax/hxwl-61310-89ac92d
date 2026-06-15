function getAllIssues(customIssues, caseName, records, builtInIssues = []) {
  const custom = customIssues?.[caseName] || [];
  const fromRecords = [...new Set(
    (records || [])
      .filter((r) => r.caseName === caseName)
      .map((r) => r.issue)
      .filter(Boolean)
  )];
  const merged = [...builtInIssues];
  custom.forEach((item) => {
    if (!merged.includes(item)) merged.push(item);
  });
  fromRecords.forEach((item) => {
    if (!merged.includes(item)) merged.push(item);
  });
  return merged;
}

function computeIssueCoverage(customIssues, caseName, records, builtInIssues = []) {
  const issues = getAllIssues(customIssues, caseName, records, builtInIssues);
  const caseRecords = records.filter((r) => r.caseName === caseName);

  const result = issues.map((issue) => {
    const issueRecords = caseRecords.filter((r) => r.issue === issue);
    const total = issueRecords.length;
    const pending = issueRecords.filter((r) => r.status === '待核对').length;
    const verified = issueRecords.filter((r) => r.status === '已核对').length;
    const needStrengthen = issueRecords.filter((r) => r.status === '需补强').length;

    let coverageStatus;
    if (total === 0) {
      coverageStatus = 'none';
    } else if (needStrengthen > 0) {
      coverageStatus = 'need-strengthen';
    } else if (total === pending) {
      coverageStatus = 'all-pending';
    } else if (verified > 0) {
      coverageStatus = 'covered';
    } else {
      coverageStatus = 'partial';
    }

    return {
      name: issue,
      total,
      pending,
      verified,
      needStrengthen,
      records: issueRecords,
      coverageStatus,
    };
  });

  return result;
}

const COVERAGE_STATUS_META = {
  'none': { label: '无证据', color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: 'alert-circle' },
  'all-pending': { label: '待核对', color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: 'clock' },
  'need-strengthen': { label: '需补强', color: '#b45309', bg: '#fff7ed', border: '#fed7aa', icon: 'alert-triangle' },
  'covered': { label: '已覆盖', color: '#047857', bg: '#ecfdf3', border: '#a7f3d0', icon: 'check-circle' },
  'partial': { label: '部分覆盖', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', icon: 'info' },
};

export { getAllIssues, computeIssueCoverage, COVERAGE_STATUS_META };
