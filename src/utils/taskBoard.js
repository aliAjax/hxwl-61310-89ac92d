import { isTaskOverdue } from './index';
import { today } from './storage';

export function getTasksForEvidence(tasks, evidenceId) {
  return tasks.filter((task) => task.evidenceId === evidenceId);
}

export function getTaskType(task) {
  return task.taskType || (task.evidenceId ? 'evidence' : 'issue');
}

export function getTaskSourceLabel(task) {
  const ctx = task.sourceContext;
  if (!ctx) return '无上下文';
  const sourceMap = {
    'evidence': '证据详情',
    'coverage': '争议点覆盖',
    'workbench-coverage': '工作台-争议点覆盖',
    'board-case': '案件看板',
    'board-issue': '争议点看板',
  };
  return sourceMap[ctx.source] || ctx.source || '未知来源';
}

export function buildCaseTaskBoard(tasks, records, customIssues) {
  const caseMap = {};
  tasks.forEach((task) => {
    const cname = task.caseName;
    if (!cname) return;
    if (!caseMap[cname]) {
      caseMap[cname] = {
        caseName: cname,
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        cancelled: 0,
        overdue: 0,
        issues: {},
        assignees: {},
      };
    }
    const cb = caseMap[cname];
    cb.total += 1;
    if (task.status === '待处理') cb.pending += 1;
    else if (task.status === '处理中') cb.inProgress += 1;
    else if (task.status === '已完成') cb.completed += 1;
    else if (task.status === '已取消') cb.cancelled += 1;
    if (isTaskOverdue(task, today)) cb.overdue += 1;

    const issueName = task.issue || '未分类';
    if (!cb.issues[issueName]) {
      cb.issues[issueName] = {
        name: issueName,
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        cancelled: 0,
        overdue: 0,
        tasks: [],
      };
    }
    cb.issues[issueName].total += 1;
    if (task.status === '待处理') cb.issues[issueName].pending += 1;
    else if (task.status === '处理中') cb.issues[issueName].inProgress += 1;
    else if (task.status === '已完成') cb.issues[issueName].completed += 1;
    else if (task.status === '已取消') cb.issues[issueName].cancelled += 1;
    if (isTaskOverdue(task, today)) cb.issues[issueName].overdue += 1;
    cb.issues[issueName].tasks.push(task);

    const assignee = task.assignee || '未分配';
    if (!cb.assignees[assignee]) {
      cb.assignees[assignee] = { name: assignee, total: 0, overdue: 0, pending: 0, inProgress: 0, completed: 0 };
    }
    cb.assignees[assignee].total += 1;
    if (isTaskOverdue(task, today)) cb.assignees[assignee].overdue += 1;
    if (task.status === '待处理') cb.assignees[assignee].pending += 1;
    else if (task.status === '处理中') cb.assignees[assignee].inProgress += 1;
    else if (task.status === '已完成') cb.assignees[assignee].completed += 1;
  });

  const caseList = Object.values(caseMap).map((c) => ({
    ...c,
    issues: Object.values(c.issues).sort((a, b) => b.total - a.total),
    assignees: Object.values(c.assignees).sort((a, b) => b.total - a.total),
  }));

  return caseList;
}

export function buildIssueTaskBoard(tasks, records, customIssues) {
  const issueMap = {};
  tasks.forEach((task) => {
    const issueName = task.issue || '未分类';
    if (!issueMap[issueName]) {
      issueMap[issueName] = {
        name: issueName,
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        cancelled: 0,
        overdue: 0,
        cases: {},
        assignees: {},
        tasks: [],
      };
    }
    const ib = issueMap[issueName];
    ib.total += 1;
    if (task.status === '待处理') ib.pending += 1;
    else if (task.status === '处理中') ib.inProgress += 1;
    else if (task.status === '已完成') ib.completed += 1;
    else if (task.status === '已取消') ib.cancelled += 1;
    if (isTaskOverdue(task, today)) ib.overdue += 1;
    ib.tasks.push(task);

    const caseName = task.caseName || '未分类案件';
    if (!ib.cases[caseName]) {
      ib.cases[caseName] = { name: caseName, total: 0, overdue: 0, pending: 0, inProgress: 0, completed: 0, tasks: [] };
    }
    ib.cases[caseName].total += 1;
    if (isTaskOverdue(task, today)) ib.cases[caseName].overdue += 1;
    if (task.status === '待处理') ib.cases[caseName].pending += 1;
    else if (task.status === '处理中') ib.cases[caseName].inProgress += 1;
    else if (task.status === '已完成') ib.cases[caseName].completed += 1;
    ib.cases[caseName].tasks.push(task);

    const assignee = task.assignee || '未分配';
    if (!ib.assignees[assignee]) {
      ib.assignees[assignee] = { name: assignee, total: 0, overdue: 0 };
    }
    ib.assignees[assignee].total += 1;
    if (isTaskOverdue(task, today)) ib.assignees[assignee].overdue += 1;
  });

  const issueList = Object.values(issueMap).map((i) => ({
    ...i,
    cases: Object.values(i.cases).sort((a, b) => b.total - a.total),
    assignees: Object.values(i.assignees).sort((a, b) => b.total - a.total),
  })).sort((a, b) => b.total - a.total);

  return issueList;
}

export function buildAssigneeTaskBoard(tasks, records, customIssues) {
  const assigneeMap = {};
  tasks.forEach((task) => {
    const assignee = task.assignee || '未分配';
    if (!assigneeMap[assignee]) {
      assigneeMap[assignee] = {
        name: assignee,
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        cancelled: 0,
        overdue: 0,
        cases: {},
        issues: {},
        tasks: [],
      };
    }
    const ab = assigneeMap[assignee];
    ab.total += 1;
    if (task.status === '待处理') ab.pending += 1;
    else if (task.status === '处理中') ab.inProgress += 1;
    else if (task.status === '已完成') ab.completed += 1;
    else if (task.status === '已取消') ab.cancelled += 1;
    if (isTaskOverdue(task, today)) ab.overdue += 1;
    ab.tasks.push(task);

    const caseName = task.caseName || '未分类案件';
    if (!ab.cases[caseName]) {
      ab.cases[caseName] = { name: caseName, total: 0, overdue: 0, pending: 0, inProgress: 0, completed: 0 };
    }
    ab.cases[caseName].total += 1;
    if (isTaskOverdue(task, today)) ab.cases[caseName].overdue += 1;
    if (task.status === '待处理') ab.cases[caseName].pending += 1;
    else if (task.status === '处理中') ab.cases[caseName].inProgress += 1;
    else if (task.status === '已完成') ab.cases[caseName].completed += 1;

    const issueName = task.issue || '未分类';
    if (!ab.issues[issueName]) {
      ab.issues[issueName] = { name: issueName, total: 0, overdue: 0 };
    }
    ab.issues[issueName].total += 1;
    if (isTaskOverdue(task, today)) ab.issues[issueName].overdue += 1;
  });

  const assigneeList = Object.values(assigneeMap).map((a) => ({
    ...a,
    cases: Object.values(a.cases).sort((a, b) => b.total - a.total),
    issues: Object.values(a.issues).sort((a, b) => b.total - a.total),
  })).sort((a, b) => {
    if (b.overdue !== a.overdue) return b.overdue - a.overdue;
    return b.total - a.total;
  });

  return assigneeList;
}
