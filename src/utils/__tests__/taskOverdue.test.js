import { describe, it, expect } from 'vitest';
import { isTaskOverdue, getTaskDaysLeft } from '../taskOverdue';

const TODAY = '2026-06-15';

describe('补强任务逾期判断', () => {
  describe('isTaskOverdue', () => {
    it('对于已完成的任务应该返回false', () => {
      const task = {
        deadline: '2026-06-10',
        status: '已完成',
      };
      expect(isTaskOverdue(task, TODAY)).toBe(false);
    });

    it('对于已取消的任务应该返回false', () => {
      const task = {
        deadline: '2026-06-10',
        status: '已取消',
      };
      expect(isTaskOverdue(task, TODAY)).toBe(false);
    });

    it('对于没有截止日期的任务应该返回false', () => {
      const task = {
        status: '待处理',
      };
      expect(isTaskOverdue(task, TODAY)).toBe(false);
    });

    it('对于截止日期为空字符串的任务应该返回false', () => {
      const task = {
        deadline: '',
        status: '待处理',
      };
      expect(isTaskOverdue(task, TODAY)).toBe(false);
    });

    it('对于截止日期在今天之前的待处理任务应该返回true', () => {
      const task = {
        deadline: '2026-06-10',
        status: '待处理',
      };
      expect(isTaskOverdue(task, TODAY)).toBe(true);
    });

    it('对于截止日期在今天之前的处理中任务应该返回true', () => {
      const task = {
        deadline: '2026-06-10',
        status: '处理中',
      };
      expect(isTaskOverdue(task, TODAY)).toBe(true);
    });

    it('对于截止日期等于今天的任务应该返回false', () => {
      const task = {
        deadline: '2026-06-15',
        status: '待处理',
      };
      expect(isTaskOverdue(task, TODAY)).toBe(false);
    });

    it('对于截止日期在今天之后的任务应该返回false', () => {
      const task = {
        deadline: '2026-06-20',
        status: '待处理',
      };
      expect(isTaskOverdue(task, TODAY)).toBe(false);
    });

    it('对于null任务应该返回false', () => {
      expect(isTaskOverdue(null, TODAY)).toBe(false);
    });

    it('对于undefined任务应该返回false', () => {
      expect(isTaskOverdue(undefined, TODAY)).toBe(false);
    });

    it('对于空对象任务应该返回false', () => {
      expect(isTaskOverdue({}, TODAY)).toBe(false);
    });

    it('应该正确处理不同的日期格式', () => {
      const task1 = { deadline: '2026-06-10', status: '待处理' };
      const task2 = { deadline: '2026/06/10', status: '待处理' };
      const task3 = { deadline: '06/10/2026', status: '待处理' };
      
      expect(isTaskOverdue(task1, TODAY)).toBe(true);
      expect(isTaskOverdue(task2, TODAY)).toBe(true);
      expect(isTaskOverdue(task3, TODAY)).toBe(true);
    });
  });

  describe('getTaskDaysLeft', () => {
    it('对于没有截止日期的任务应该返回null', () => {
      const task = { status: '待处理' };
      expect(getTaskDaysLeft(task, TODAY)).toBeNull();
    });

    it('对于截止日期为空字符串的任务应该返回null', () => {
      const task = { deadline: '', status: '待处理' };
      expect(getTaskDaysLeft(task, TODAY)).toBeNull();
    });

    it('对于截止日期在今天之前的任务应该返回负数', () => {
      const task = { deadline: '2026-06-10', status: '待处理' };
      expect(getTaskDaysLeft(task, TODAY)).toBe(-5);
    });

    it('对于截止日期等于今天的任务应该返回0', () => {
      const task = { deadline: '2026-06-15', status: '待处理' };
      expect(getTaskDaysLeft(task, TODAY)).toBe(0);
    });

    it('对于截止日期在明天的任务应该返回1', () => {
      const task = { deadline: '2026-06-16', status: '待处理' };
      expect(getTaskDaysLeft(task, TODAY)).toBe(1);
    });

    it('对于截止日期在5天后的任务应该返回5', () => {
      const task = { deadline: '2026-06-20', status: '待处理' };
      expect(getTaskDaysLeft(task, TODAY)).toBe(5);
    });

    it('对于截止日期在一个月后的任务应该返回正确天数', () => {
      const task = { deadline: '2026-07-15', status: '待处理' };
      expect(getTaskDaysLeft(task, TODAY)).toBe(30);
    });

    it('对于null任务应该返回null', () => {
      expect(getTaskDaysLeft(null, TODAY)).toBeNull();
    });

    it('对于undefined任务应该返回null', () => {
      expect(getTaskDaysLeft(undefined, TODAY)).toBeNull();
    });

    it('对于空对象任务应该返回null', () => {
      expect(getTaskDaysLeft({}, TODAY)).toBeNull();
    });

    it('应该正确处理跨月份的日期计算', () => {
      const task = { deadline: '2026-07-01', status: '待处理' };
      expect(getTaskDaysLeft(task, '2026-06-30')).toBe(1);
      expect(getTaskDaysLeft(task, '2026-07-01')).toBe(0);
      expect(getTaskDaysLeft(task, '2026-07-02')).toBe(-1);
    });

    it('应该正确处理跨年份的日期计算', () => {
      const task = { deadline: '2027-01-01', status: '待处理' };
      expect(getTaskDaysLeft(task, '2026-12-31')).toBe(1);
      expect(getTaskDaysLeft(task, '2027-01-01')).toBe(0);
      expect(getTaskDaysLeft(task, '2027-01-02')).toBe(-1);
    });

    it('应该正确处理闰年2月的日期计算', () => {
      const task = { deadline: '2024-03-01', status: '待处理' };
      expect(getTaskDaysLeft(task, '2024-02-28')).toBe(2);
      expect(getTaskDaysLeft(task, '2024-02-29')).toBe(1);
    });
  });

  describe('组合场景', () => {
    it('isTaskOverdue和getTaskDaysLeft应该对同一个任务返回一致的结果', () => {
      const today = '2026-06-15';
      
      const overdueTask = { deadline: '2026-06-10', status: '待处理' };
      expect(isTaskOverdue(overdueTask, today)).toBe(true);
      expect(getTaskDaysLeft(overdueTask, today)).toBeLessThan(0);

      const todayTask = { deadline: '2026-06-15', status: '待处理' };
      expect(isTaskOverdue(todayTask, today)).toBe(false);
      expect(getTaskDaysLeft(todayTask, today)).toBe(0);

      const futureTask = { deadline: '2026-06-20', status: '待处理' };
      expect(isTaskOverdue(futureTask, today)).toBe(false);
      expect(getTaskDaysLeft(futureTask, today)).toBeGreaterThan(0);

      const completedTask = { deadline: '2026-06-10', status: '已完成' };
      expect(isTaskOverdue(completedTask, today)).toBe(false);
      expect(getTaskDaysLeft(completedTask, today)).toBe(-5);
    });

    it('应该正确处理各种任务状态的组合', () => {
      const today = '2026-06-15';
      const deadline = '2026-06-10';

      expect(isTaskOverdue({ deadline, status: '待处理' }, today)).toBe(true);
      expect(isTaskOverdue({ deadline, status: '处理中' }, today)).toBe(true);
      expect(isTaskOverdue({ deadline, status: '已完成' }, today)).toBe(false);
      expect(isTaskOverdue({ deadline, status: '已取消' }, today)).toBe(false);
    });

    it('应该正确处理任务列表的批量过滤', () => {
      const today = '2026-06-15';
      const tasks = [
        { id: 1, deadline: '2026-06-10', status: '待处理' },
        { id: 2, deadline: '2026-06-15', status: '待处理' },
        { id: 3, deadline: '2026-06-20', status: '待处理' },
        { id: 4, deadline: '2026-06-10', status: '已完成' },
        { id: 5, deadline: '', status: '待处理' },
      ];

      const overdueTasks = tasks.filter(t => isTaskOverdue(t, today));
      expect(overdueTasks).toHaveLength(1);
      expect(overdueTasks[0].id).toBe(1);

      const upcomingTasks = tasks.filter(t => getTaskDaysLeft(t, today) > 0);
      expect(upcomingTasks).toHaveLength(1);
      expect(upcomingTasks[0].id).toBe(3);

      const noDeadlineTasks = tasks.filter(t => getTaskDaysLeft(t, today) === null);
      expect(noDeadlineTasks).toHaveLength(1);
      expect(noDeadlineTasks[0].id).toBe(5);
    });

    it('应该正确排序任务按剩余天数', () => {
      const today = '2026-06-15';
      const tasks = [
        { id: 1, deadline: '2026-06-20', status: '待处理' },
        { id: 2, deadline: '2026-06-10', status: '待处理' },
        { id: 3, deadline: '2026-06-18', status: '待处理' },
        { id: 4, deadline: '', status: '待处理' },
      ];

      const sortedTasks = [...tasks].sort((a, b) => {
        const daysA = getTaskDaysLeft(a, today) ?? Infinity;
        const daysB = getTaskDaysLeft(b, today) ?? Infinity;
        return daysA - daysB;
      });

      expect(sortedTasks[0].id).toBe(2);
      expect(sortedTasks[1].id).toBe(3);
      expect(sortedTasks[2].id).toBe(1);
      expect(sortedTasks[3].id).toBe(4);
    });
  });
});
