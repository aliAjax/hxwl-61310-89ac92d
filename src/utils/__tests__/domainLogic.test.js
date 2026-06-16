import { describe, it, expect } from 'vitest';
import {
  avg,
  money,
  inNextDays,
  latestTemp,
  hasHotTemp,
  priorityRank,
  hasOverlap,
  statusClass,
  computeCaseOverview,
  computeReviewStats,
  computeIssueCoverageStats,
  buildTimelineData,
  buildTimelineGroups,
  computeWorkbenchStats,
  computeTaskMetrics,
  WORK_PACKAGE_EXPORT_SECTIONS,
} from '../domainLogic';
import { isTaskOverdue } from '../taskOverdue';

const mockStatuses = ['待核对', '已核对', '需补强'];

describe('领域逻辑纯函数', () => {
  describe('avg', () => {
    it('应该正确计算数字数组的平均值', () => {
      expect(avg([1, 2, 3, 4, 5])).toBe(3);
    });

    it('应该过滤掉非有限值', () => {
      expect(avg([1, NaN, 3, Infinity, 5])).toBe(3);
    });

    it('空数组应该返回0', () => {
      expect(avg([])).toBe(0);
    });

    it('全部是非有限值应该返回0', () => {
      expect(avg([NaN, Infinity])).toBe(0);
    });
  });

  describe('money', () => {
    it('应该正确格式化人民币金额', () => {
      expect(money(1000)).toContain('1,000');
      expect(money(1000)).toContain('¥');
    });

    it('空值应该显示为¥0', () => {
      expect(money(0)).toContain('¥0');
      expect(money(null)).toContain('¥0');
      expect(money(undefined)).toContain('¥0');
    });
  });

  describe('inNextDays', () => {
    const today = '2026-06-16';

    it('空日期应该返回false', () => {
      expect(inNextDays('', 7, today)).toBe(false);
      expect(inNextDays(null, 7, today)).toBe(false);
    });

    it('未来3天内的日期应该返回true', () => {
      expect(inNextDays('2026-06-18', 7, today)).toBe(true);
      expect(inNextDays('2026-06-16', 7, today)).toBe(true);
    });

    it('超过7天的日期应该返回false', () => {
      expect(inNextDays('2026-06-24', 7, today)).toBe(false);
    });

    it('过去的日期应该返回false', () => {
      expect(inNextDays('2026-06-15', 7, today)).toBe(false);
    });
  });

  describe('latestTemp', () => {
    it('应该返回最新的温度读数', () => {
      expect(latestTemp({ temps: [1, 2, 3] })).toBe(3);
    });

    it('没有temps数组时应该返回temperature字段', () => {
      expect(latestTemp({ temperature: '2.5' })).toBe(2.5);
    });
  });

  describe('hasHotTemp', () => {
    it('温度超过2应该返回true', () => {
      expect(hasHotTemp({ temps: [1, 3] })).toBe(true);
    });

    it('温度都不超过2应该返回false', () => {
      expect(hasHotTemp({ temps: [1, 2] })).toBe(false);
    });

    it('没有temps数组时检查temperature字段', () => {
      expect(hasHotTemp({ temperature: '3' })).toBe(true);
    });
  });

  describe('priorityRank', () => {
    it('应该正确映射优先级排序', () => {
      expect(priorityRank('危急')).toBe(0);
      expect(priorityRank('加急')).toBe(1);
      expect(priorityRank('常规')).toBe(2);
      expect(priorityRank('高')).toBe(0);
      expect(priorityRank('中')).toBe(1);
      expect(priorityRank('低')).toBe(2);
    });

    it('未知优先级应该返回9', () => {
      expect(priorityRank('未知')).toBe(9);
    });
  });

  describe('hasOverlap', () => {
    const records = [
      { id: 1, bed: 'A', date: '2026-06-16', start: '09:00', end: '10:00' },
      { id: 2, bed: 'B', date: '2026-06-16', start: '10:00', end: '11:00' },
    ];

    it('缺少必要字段应该返回false', () => {
      expect(hasOverlap({ bed: 'A' }, records)).toBe(false);
    });

    it('有时间重叠应该返回true', () => {
      const target = { id: 3, bed: 'A', date: '2026-06-16', start: '09:30', end: '10:30' };
      expect(hasOverlap(target, records)).toBe(true);
    });

    it('没有时间重叠应该返回false', () => {
      const target = { id: 3, bed: 'A', date: '2026-06-16', start: '10:00', end: '11:00' };
      expect(hasOverlap(target, records)).toBe(false);
    });
  });

  describe('statusClass', () => {
    it('应该根据状态索引返回正确的CSS类', () => {
      expect(statusClass('待核对', mockStatuses)).toBe('status-a');
      expect(statusClass('已核对', mockStatuses)).toBe('status-b');
      expect(statusClass('需补强', mockStatuses)).toBe('status-c');
    });

    it('未知状态应该返回默认类', () => {
      expect(statusClass('未知', mockStatuses)).toBe('status-a');
    });
  });

  describe('computeCaseOverview', () => {
    const mockRecords = [
      { id: 1, caseName: '案件A', status: '已核对', issue: '合同成立', level: '内部', date: '2026-06-01', createdAt: '2026-06-01T10:00:00Z' },
      { id: 2, caseName: '案件A', status: '待核对', issue: '付款事实', level: '机密', date: '2026-06-02', createdAt: '2026-06-02T10:00:00Z' },
      { id: 3, caseName: '案件A', status: '需补强', issue: '合同成立', level: '公开', date: '2026-06-03', createdAt: '2026-06-03T10:00:00Z' },
      { id: 4, caseName: '案件B', status: '已核对', issue: '交付瑕疵', level: '内部', date: '2026-06-04', createdAt: '2026-06-04T10:00:00Z' },
    ];

    it('没有选择案件时应该返回null', () => {
      expect(computeCaseOverview(mockRecords, '', mockStatuses)).toBeNull();
    });

    it('应该正确计算案件概览数据', () => {
      const result = computeCaseOverview(mockRecords, '案件A', mockStatuses);
      expect(result).not.toBeNull();
      expect(result.totalCount).toBe(3);
      expect(result.statusDistribution).toEqual([
        { name: '待核对', count: 1 },
        { name: '已核对', count: 1 },
        { name: '需补强', count: 1 },
      ]);
      expect(result.issueDistribution).toEqual([
        { name: '合同成立', count: 2 },
        { name: '付款事实', count: 1 },
      ]);
      expect(result.levelDistribution).toEqual([
        { name: '内部', count: 1 },
        { name: '机密', count: 1 },
        { name: '公开', count: 1 },
      ]);
      expect(result.recentEvidence).toHaveLength(3);
    });
  });

  describe('computeReviewStats', () => {
    it('空清单应该返回null', () => {
      expect(computeReviewStats(null)).toBeNull();
      expect(computeReviewStats([])).toBeNull();
    });

    it('应该正确计算审查统计', () => {
      const checklist = [
        { id: '1', category: 'evidence-coverage', severity: 'high', checked: true },
        { id: '2', category: 'material-status', severity: 'medium', checked: true },
        { id: '3', category: 'strengthen-task', severity: 'high', checked: false },
        { id: '4', category: 'secrecy-level', severity: 'medium', checked: true },
        { id: '5', category: 'purpose-completeness', severity: 'high', checked: false },
      ];

      const result = computeReviewStats(checklist);
      expect(result.total).toBe(5);
      expect(result.checked).toBe(3);
      expect(result.highTotal).toBe(3);
      expect(result.highChecked).toBe(1);
      expect(result.passable).toBe(false);
      expect(result.unresolvedHighRisk).toHaveLength(2);
      expect(result.byCategory['evidence-coverage']).toEqual({ total: 1, checked: 1 });
    });

    it('全部勾选时passable应该为true', () => {
      const checklist = [
        { id: '1', severity: 'high', checked: true },
        { id: '2', severity: 'medium', checked: true },
      ];
      expect(computeReviewStats(checklist).passable).toBe(true);
    });
  });

  describe('computeIssueCoverageStats', () => {
    it('空数据应该返回null', () => {
      expect(computeIssueCoverageStats(null)).toBeNull();
    });

    it('应该正确计算覆盖统计', () => {
      const coverageData = [
        { coverageStatus: 'covered' },
        { coverageStatus: 'covered' },
        { coverageStatus: 'partial' },
        { coverageStatus: 'need-strengthen' },
        { coverageStatus: 'all-pending' },
        { coverageStatus: 'none' },
      ];

      const result = computeIssueCoverageStats(coverageData);
      expect(result.total).toBe(6);
      expect(result.covered).toBe(2);
      expect(result.partial).toBe(1);
      expect(result.needStrengthen).toBe(1);
      expect(result.allPending).toBe(1);
      expect(result.none).toBe(1);
    });
  });

  describe('buildTimelineData & buildTimelineGroups', () => {
    const mockRecords = [
      { id: 1, caseName: '案件A', date: '2026-06-02', evidence: '证据1' },
      { id: 2, caseName: '案件A', date: '2026-06-01', evidence: '证据2' },
      { id: 3, caseName: '案件A', date: '', evidence: '证据3' },
      { id: 4, caseName: '案件B', date: '2026-06-03', evidence: '证据4' },
    ];

    it('没有选择案件时应该返回空数组', () => {
      expect(buildTimelineData(mockRecords, '')).toEqual([]);
    });

    it('应该按日期分组并排序', () => {
      const result = buildTimelineData(mockRecords, '案件A');
      expect(result).toHaveLength(3);
      expect(result[0].date).toBe('2026-06-01');
      expect(result[1].date).toBe('2026-06-02');
      expect(result[2].date).toBe('未标注日期');
      expect(result[2].isNoDate).toBe(true);
      expect(result[2].items).toHaveLength(1);
    });
  });

  describe('computeWorkbenchStats', () => {
    const mockRecords = [
      { id: 1, caseName: '案件A', status: '待核对', issue: '合同成立' },
      { id: 2, caseName: '案件A', status: '已核对', issue: '付款事实' },
      { id: 3, caseName: '案件A', status: '需补强', issue: '合同成立' },
      { id: 4, caseName: '案件B', status: '已核对', issue: '交付瑕疵' },
    ];
    const mockTasks = [
      { id: 1, caseName: '案件A', status: '待处理', deadline: '2026-06-15' },
      { id: 2, caseName: '案件A', status: '处理中', deadline: '2026-06-20' },
    ];
    const today = '2026-06-16';

    it('没有选择案件时应该返回null', () => {
      expect(computeWorkbenchStats(mockRecords, mockTasks, '', isTaskOverdue, today)).toBeNull();
    });

    it('应该正确计算工作台统计', () => {
      const result = computeWorkbenchStats(mockRecords, mockTasks, '案件A', isTaskOverdue, today);
      expect(result).not.toBeNull();
      expect(result.total).toBe(3);
      expect(result.pending).toBe(1);
      expect(result.verified).toBe(1);
      expect(result.needStrengthen).toBe(1);
      expect(result.issues).toBe(2);
      expect(result.tasks).toBe(2);
      expect(result.tasksOverdue).toBe(1);
    });
  });

  describe('computeTaskMetrics', () => {
    const mockTasks = [
      { id: 1, status: '待处理', deadline: '2026-06-15' },
      { id: 2, status: '处理中', deadline: '2026-06-20' },
      { id: 3, status: '已完成', deadline: '2026-06-10' },
      { id: 4, status: '待处理', deadline: '2026-06-25' },
    ];
    const today = '2026-06-16';

    it('应该正确计算任务统计', () => {
      const result = computeTaskMetrics(mockTasks, isTaskOverdue, today);
      expect(result.total).toBe(4);
      expect(result.pending).toBe(2);
      expect(result.inProgress).toBe(1);
      expect(result.completed).toBe(1);
      expect(result.overdue).toBe(1);
    });

    it('空任务数组应该返回全部为0', () => {
      const result = computeTaskMetrics([], isTaskOverdue, today);
      expect(result).toEqual({ total: 0, pending: 0, inProgress: 0, completed: 0, overdue: 0 });
    });
  });

  describe('WORK_PACKAGE_EXPORT_SECTIONS', () => {
    it('应该包含所有必要的导出部分', () => {
      const keys = WORK_PACKAGE_EXPORT_SECTIONS.map(s => s.key);
      expect(keys).toContain('records');
      expect(keys).toContain('customIssues');
      expect(keys).toContain('purposeTemplates');
      expect(keys).toContain('tasks');
      expect(keys).toContain('factNodes');
    });
  });
});
