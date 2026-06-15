import { getAllIssues, isTaskOverdue, getTaskDaysLeft } from './index';
import { appConfig, today } from './storage';

export const REVIEW_ITEM_CATEGORIES = {
  'evidence-coverage': { label: '证据覆盖', icon: 'Target' },
  'material-status': { label: '材料状态', icon: 'ClipboardList' },
  'strengthen-task': { label: '补强任务', icon: 'AlertTriangle' },
  'secrecy-level': { label: '保密等级', icon: 'Shield' },
  'purpose-completeness': { label: '证明目的完整性', icon: 'CheckCircle2' },
};

export function generateReviewChecklist(caseName, records, tasks, customIssues) {
  const caseRecords = records.filter((r) => r.caseName === caseName);
  const builtInIssues = appConfig.fields.find((f) => f.key === 'issue')?.options || [];
  const issues = getAllIssues(customIssues, caseName, records, builtInIssues);
  const caseTasks = tasks.filter((t) => t.caseName === caseName);
  const items = [];

  issues.forEach((issue) => {
    const issueRecords = caseRecords.filter((r) => r.issue === issue);
    const pendingRecords = issueRecords.filter((r) => r.status === '待核对');
    const strengthenRecords = issueRecords.filter((r) => r.status === '需补强');
    const noPurposeRecords = issueRecords.filter((r) => !r.purpose || !r.purpose.trim());
    const confidentialRecords = issueRecords.filter((r) => r.level === '机密');
    const issueTasks = caseTasks.filter((t) => t.issue === issue);
    const unfinishedTasks = issueTasks.filter((t) => t.status !== '已完成' && t.status !== '已取消');

    if (issueRecords.length === 0) {
      items.push({
        id: `coverage-none-${issue}`,
        category: 'evidence-coverage',
        issue,
        title: `争议点「${issue}」无任何证据`,
        severity: 'high',
        description: `该争议点尚未关联任何证据材料，出庭时无法就该项主张提供证据支持`,
        linkType: 'coverage',
        linkIssue: issue,
        checked: false,
      });
    } else if (strengthenRecords.length > 0) {
      items.push({
        id: `coverage-strengthen-${issue}`,
        category: 'evidence-coverage',
        issue,
        title: `争议点「${issue}」存在${strengthenRecords.length}项需补强证据`,
        severity: 'high',
        description: `证据覆盖不充分，${strengthenRecords.length}项证据标注为"需补强"，可能影响证明力`,
        linkType: 'coverage',
        linkIssue: issue,
        evidenceIds: strengthenRecords.map((r) => r.id),
        checked: false,
      });
    } else if (pendingRecords.length === issueRecords.length) {
      items.push({
        id: `coverage-pending-${issue}`,
        category: 'evidence-coverage',
        issue,
        title: `争议点「${issue}」全部证据待核对`,
        severity: 'medium',
        description: `${pendingRecords.length}项证据均未核对，出庭前需完成核对确认`,
        linkType: 'coverage',
        linkIssue: issue,
        evidenceIds: pendingRecords.map((r) => r.id),
        checked: false,
      });
    }

    pendingRecords.forEach((r) => {
      items.push({
        id: `status-pending-${r.id}`,
        category: 'material-status',
        issue,
        evidenceId: r.id,
        evidenceName: r.evidence,
        title: `证据「${r.evidence}」尚待核对`,
        severity: 'medium',
        description: `该证据状态为"待核对"，需在出庭前完成核对确认`,
        linkType: 'evidence',
        linkEvidenceId: r.id,
        checked: false,
      });
    });

    strengthenRecords.forEach((r) => {
      items.push({
        id: `status-strengthen-${r.id}`,
        category: 'material-status',
        issue,
        evidenceId: r.id,
        evidenceName: r.evidence,
        title: `证据「${r.evidence}」需补强`,
        severity: 'high',
        description: `该证据标注为"需补强"，证明力不足，出庭时可能被对方质疑`,
        linkType: 'evidence',
        linkEvidenceId: r.id,
        checked: false,
      });
    });

    unfinishedTasks.forEach((task) => {
      const overdue = isTaskOverdue(task, today);
      const daysLeft = getTaskDaysLeft(task, today);
      let severity = task.status === '待处理' ? 'high' : 'medium';
      if (overdue) severity = 'high';
      let timeDesc = '';
      if (overdue) {
        timeDesc = `已逾期${Math.abs(daysLeft || 0)}天`;
      } else if (daysLeft !== null) {
        timeDesc = `剩余${daysLeft}天`;
      } else {
        timeDesc = '未设截止日期';
      }
      items.push({
        id: `task-unfinished-${task.id}`,
        category: 'strengthen-task',
        issue,
        taskId: task.id,
        taskName: task.evidenceName || task.issue,
        title: `${overdue ? '⚠ ' : ''}补强任务「${task.evidenceName || task.issue}」未完成（${task.status}）${overdue ? ' - 已逾期' : ''}`,
        severity,
        description: `补强任务当前状态为"${task.status}"，${task.deadline ? `截止日期：${task.deadline}（${timeDesc}）` : timeDesc}，${task.reason || ''}${task.assignee ? `，负责人：${task.assignee}` : ''}`,
        linkType: 'task',
        linkTaskId: task.id,
        checked: false,
      });
    });

    if (confidentialRecords.length > 0) {
      items.push({
        id: `secrecy-confidential-${issue}`,
        category: 'secrecy-level',
        issue,
        title: `争议点「${issue}」含${confidentialRecords.length}项机密材料`,
        severity: 'medium',
        description: `出庭时需注意保密处理，公开模式下将脱敏展示，内部模式下可见但需注意法庭披露范围`,
        linkType: 'coverage',
        linkIssue: issue,
        evidenceIds: confidentialRecords.map((r) => r.id),
        checked: false,
      });
    }

    noPurposeRecords.forEach((r) => {
      items.push({
        id: `purpose-missing-${r.id}`,
        category: 'purpose-completeness',
        issue,
        evidenceId: r.id,
        evidenceName: r.evidence,
        title: `证据「${r.evidence}」缺少证明目的`,
        severity: 'medium',
        description: `该证据未填写证明目的，出庭时可能无法明确该证据的证明指向，影响举证效果`,
        linkType: 'evidence',
        linkEvidenceId: r.id,
        checked: false,
      });
    });

    const noSourceRecords = issueRecords.filter((r) => !r.source || !r.source.trim());
    noSourceRecords.forEach((r) => {
      items.push({
        id: `source-missing-${r.id}`,
        category: 'material-status',
        issue,
        evidenceId: r.id,
        evidenceName: r.evidence,
        title: `证据「${r.evidence}」缺少来源信息`,
        severity: 'medium',
        description: `该证据未填写来源，证据链不完整可能被对方质疑证据合法性`,
        linkType: 'evidence',
        linkEvidenceId: r.id,
        checked: false,
      });
    });

    const noDateRecords = issueRecords.filter((r) => !r.date || !r.date.trim());
    noDateRecords.forEach((r) => {
      items.push({
        id: `date-missing-${r.id}`,
        category: 'material-status',
        issue,
        evidenceId: r.id,
        evidenceName: r.evidence,
        title: `证据「${r.evidence}」缺少取得日期`,
        severity: 'medium',
        description: `该证据未填写取得日期，无法证明证据形成时间，可能影响证据的关联性和时效性`,
        linkType: 'evidence',
        linkEvidenceId: r.id,
        checked: false,
      });
    });
  });

  return items;
}

export function generateReviewReport(caseName, records, tasks, customIssues, reviewPassedAt, wbReviewChecklist, wbReviewStats, exportLevel, levelRank, modeMaxVisibleLevel, wbExportData) {
  const lines = [];
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  lines.push('══════════════════════════════════════════════');
  lines.push('              出庭材料审查报告');
  lines.push('══════════════════════════════════════════════');
  lines.push('');
  lines.push(`案件名称：${caseName}`);
  lines.push(`审查时间：${reviewPassedAt ? new Date(reviewPassedAt).toLocaleString('zh-CN') : '未通过审查'}`);
  lines.push('');

  const catKeys = Object.keys(REVIEW_ITEM_CATEGORIES);
  catKeys.forEach((catKey, idx) => {
    const catMeta = REVIEW_ITEM_CATEGORIES[catKey];
    const stat = wbReviewStats.byCategory[catKey];
    if (!stat || stat.total === 0) return;
    lines.push(`──────────────────────────────────────────────`);
    lines.push(`步骤 ${idx + 1}：${catMeta.label}（${stat.checked}/${stat.total} 已确认）`);
    lines.push(`──────────────────────────────────────────────`);
    const catItems = wbReviewChecklist.filter((i) => i.category === catKey);
    const uncheckedItems = catItems.filter((i) => !i.checked);
    if (uncheckedItems.length === 0) {
      lines.push('  ✅ 全部已确认');
    } else {
      uncheckedItems.forEach((item) => {
        lines.push(`  □ ${item.title}`);
        lines.push(`    风险：${item.severity === 'high' ? '高风险' : '中风险'}`);
        if (item.description) lines.push(`    说明：${item.description}`);
      });
    }
    lines.push('');
  });

  if (wbReviewStats.unresolvedHighRisk.length > 0) {
    lines.push('──────────────────────────────────────────────');
    lines.push('⚠ 未解决高风险项');
    lines.push('──────────────────────────────────────────────');
    wbReviewStats.unresolvedHighRisk.forEach((item) => {
      lines.push(`  • ${item.title}`);
    });
    lines.push('');
  }

  lines.push('──────────────────────────────────────────────');
  lines.push('材料清单（按保密等级）');
  lines.push('──────────────────────────────────────────────');
  const maxRank = modeMaxVisibleLevel[exportLevel] ?? 0;
  ['公开', '内部', '机密'].filter((lv) => {
    const rank = levelRank[lv];
    return rank <= maxRank;
  }).forEach((lv) => {
    const lvRecords = wbExportData.filter((r) => (levelRank[r.level] ?? 1) === levelRank[lv]);
    if (lvRecords.length === 0) return;
    lines.push(`  【${lv}】${lvRecords.length} 项`);
    lvRecords.forEach((r, i) => {
      lines.push(`    ${i + 1}. ${r.evidence}｜${r.purpose || '无证明目的'}${r._masked ? '（脱敏）' : ''}`);
    });
  });
  lines.push('');

  lines.push('══════════════════════════════════════════════');
  lines.push(`报告生成时间：${now.toLocaleString('zh-CN')}`);
  lines.push('══════════════════════════════════════════════');

  const content = lines.join('\n');
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `出庭审查报告_${caseName}_${dateStr}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
