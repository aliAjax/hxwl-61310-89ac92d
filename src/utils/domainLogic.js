import { appConfig } from './storage';

export function avg(numbers) {
  const valid = numbers.filter((value) => Number.isFinite(value));
  if (!valid.length) return 0;
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

export function money(value) {
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', maximumFractionDigits: 0 }).format(value || 0);
}

export function inNextDays(dateText, days, todayStr) {
  if (!dateText) return false;
  const date = new Date(dateText);
  const now = new Date(todayStr);
  const diff = (date.getTime() - now.getTime()) / 86400000;
  return diff >= 0 && diff <= days;
}

export function latestTemp(item) {
  const temps = item.temps || [Number(item.temperature)];
  return temps[temps.length - 1];
}

export function hasHotTemp(item) {
  const temps = item.temps || [Number(item.temperature)];
  return temps.some((value) => Number(value) > 2);
}

export function priorityRank(value) {
  return { 危急: 0, 加急: 1, 常规: 2, 高: 0, 中: 1, 低: 2 }[value] ?? 9;
}

export function hasOverlap(target, records) {
  if (!target.bed || !target.date || !target.start || !target.end) return false;
  return records.some((item) => item.id !== target.id && item.bed === target.bed && item.date === target.date && target.start < item.end && target.end > item.start);
}

export function statusClass(status, statuses = appConfig.statuses) {
  const index = statuses.indexOf(status);
  return ['status-a', 'status-b', 'status-c', 'status-d'][index] || 'status-a';
}

export function computeCaseOverview(records, selectedCaseName, statuses) {
  if (!selectedCaseName) return null;

  const caseRecords = records.filter((item) => item.caseName === selectedCaseName);

  const statusDistribution = statuses.map((status) => ({
    name: status,
    count: caseRecords.filter((item) => item.status === status).length,
  }));

  const issueDistribution = {};
  caseRecords.forEach((item) => {
    const key = item.issue || '未分类';
    issueDistribution[key] = (issueDistribution[key] || 0) + 1;
  });

  const levelDistribution = {};
  caseRecords.forEach((item) => {
    const key = item.level || '未设置';
    levelDistribution[key] = (levelDistribution[key] || 0) + 1;
  });

  const recentEvidence = [...caseRecords]
    .sort((a, b) => {
      const aDate = a.createdAt || a.date || '';
      const bDate = b.createdAt || b.date || '';
      return String(bDate).localeCompare(String(aDate));
    })
    .slice(0, 5);

  return {
    totalCount: caseRecords.length,
    statusDistribution,
    issueDistribution: Object.entries(issueDistribution).map(([name, count]) => ({ name, count })),
    levelDistribution: Object.entries(levelDistribution).map(([name, count]) => ({ name, count })),
    recentEvidence,
  };
}

export function computeReviewStats(checklist) {
  if (!checklist || checklist.length === 0) return null;
  const total = checklist.length;
  const checked = checklist.filter((i) => i.checked).length;
  const highItems = checklist.filter((i) => i.severity === 'high');
  const highChecked = highItems.filter((i) => i.checked).length;
  const byCategory = {};
  const categoryKeys = ['evidence-coverage', 'material-status', 'strengthen-task', 'secrecy-level', 'purpose-completeness'];
  categoryKeys.forEach((cat) => {
    const catItems = checklist.filter((i) => i.category === cat);
    byCategory[cat] = { total: catItems.length, checked: catItems.filter((i) => i.checked).length };
  });
  const unresolvedHighRisk = checklist.filter((i) => i.severity === 'high' && !i.checked);
  return { total, checked, highTotal: highItems.length, highChecked, byCategory, unresolvedHighRisk, passable: total > 0 && checked === total };
}

export function computeIssueCoverageStats(coverageData) {
  if (!coverageData) return null;
  return {
    total: coverageData.length,
    none: coverageData.filter((i) => i.coverageStatus === 'none').length,
    allPending: coverageData.filter((i) => i.coverageStatus === 'all-pending').length,
    needStrengthen: coverageData.filter((i) => i.coverageStatus === 'need-strengthen').length,
    covered: coverageData.filter((i) => i.coverageStatus === 'covered').length,
    partial: coverageData.filter((i) => i.coverageStatus === 'partial').length,
  };
}

export function buildTimelineData(records, selectedCaseName) {
  if (!selectedCaseName) return [];

  const caseRecords = records.filter(item => item.caseName === selectedCaseName);
  return buildTimelineGroups(caseRecords);
}

export function buildTimelineGroups(caseRecords) {
  const withDate = caseRecords.filter(item => item.date);
  const withoutDate = caseRecords.filter(item => !item.date);

  const grouped = {};
  withDate.forEach(item => {
    const key = item.date;
    (grouped[key] ||= []).push(item);
  });

  const sortedDates = Object.keys(grouped).sort();
  const result = sortedDates.map(date => ({
    date,
    items: grouped[date],
    isNoDate: false,
  }));

  if (withoutDate.length > 0) {
    result.push({
      date: '未标注日期',
      items: withoutDate,
      isNoDate: true,
    });
  }

  return result;
}

export function computeWorkbenchStats(records, wbTasks, workbenchCase, isTaskOverdue, today) {
  if (!workbenchCase) return null;
  const caseRecords = records.filter((item) => item.caseName === workbenchCase);
  return {
    total: caseRecords.length,
    pending: caseRecords.filter((r) => r.status === '待核对').length,
    verified: caseRecords.filter((r) => r.status === '已核对').length,
    needStrengthen: caseRecords.filter((r) => r.status === '需补强').length,
    issues: new Set(caseRecords.map((r) => r.issue).filter(Boolean)).size,
    tasks: wbTasks.length,
    tasksOverdue: wbTasks.filter((t) => isTaskOverdue(t, today)).length,
  };
}

export function computeTaskMetrics(tasks, isTaskOverdue, today) {
  const total = tasks.length;
  const pending = tasks.filter((t) => t.status === '待处理').length;
  const inProgress = tasks.filter((t) => t.status === '处理中').length;
  const completed = tasks.filter((t) => t.status === '已完成').length;
  const overdue = tasks.filter((t) => isTaskOverdue(t, today)).length;
  return { total, pending, inProgress, completed, overdue };
}

export const WORK_PACKAGE_EXPORT_SECTIONS = [
  { key: 'records', label: '证据材料', desc: '案件关联的证据记录和时间线' },
  { key: 'customIssues', label: '自定义争议点', desc: '该案件下用户自定义的争议点' },
  { key: 'purposeTemplates', label: '证明目的模板', desc: '该案件争议点关联的自定义模板' },
  { key: 'tasks', label: '补强任务', desc: '该案件关联的补强任务' },
  { key: 'factNodes', label: '事实节点/时间线', desc: '该案件的事实节点和证据链' },
];
