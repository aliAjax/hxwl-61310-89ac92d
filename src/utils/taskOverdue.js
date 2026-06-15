function isTaskOverdue(task, todayStr) {
  if (!task?.deadline || task.status === '已完成' || task.status === '已取消') return false;
  const deadlineDate = new Date(task.deadline);
  const now = new Date(todayStr);
  return deadlineDate < now;
}

function getTaskDaysLeft(task, todayStr) {
  if (!task?.deadline) return null;
  const deadlineDate = new Date(task.deadline);
  const now = new Date(todayStr);
  const diff = Math.ceil((deadlineDate.getTime() - now.getTime()) / 86400000);
  return diff;
}

export { isTaskOverdue, getTaskDaysLeft };
