import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateReviewChecklist, REVIEW_ITEM_CATEGORIES } from '../review';

const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0,
};

Object.defineProperty(globalThis, 'localStorage', { value: mockLocalStorage });

describe('出庭审查清单', () => {
  const mockRecords = [
    { id: 'rec1', caseName: '案件A', evidence: '证据1', source: '来源1', date: '2026-06-01', purpose: '证明付款事实', issue: '付款事实', level: '内部', status: '已核对' },
    { id: 'rec2', caseName: '案件A', evidence: '证据2', source: '', date: '', purpose: '', issue: '付款事实', level: '机密', status: '需补强' },
    { id: 'rec3', caseName: '案件A', evidence: '证据3', source: '来源3', date: '2026-06-03', purpose: '证明合同成立', issue: '合同成立', level: '公开', status: '待核对' },
    { id: 'rec4', caseName: '案件B', evidence: '证据4', source: '来源4', date: '2026-06-04', purpose: '证明交付瑕疵', issue: '交付瑕疵', level: '内部', status: '已核对' },
  ];

  const mockTasks = [
    { id: 'task1', caseName: '案件A', evidenceId: 'rec2', evidenceName: '证据2', issue: '付款事实', reason: '需补充原件', assignee: '张三', deadline: '2026-06-15', status: '待处理', taskType: 'evidence' },
    { id: 'task2', caseName: '案件A', evidenceId: 'rec3', evidenceName: '证据3', issue: '合同成立', reason: '需核对原件', assignee: '李四', deadline: '2026-06-25', status: '处理中', taskType: 'evidence' },
    { id: 'task3', caseName: '案件B', evidenceId: 'rec4', evidenceName: '证据4', issue: '交付瑕疵', reason: '已完成', assignee: '王五', deadline: '2026-06-10', status: '已完成', taskType: 'evidence' },
  ];

  const mockCustomIssues = {
    '案件A': ['新增争议点'],
  };

  const builtInIssues = ['合同成立', '付款事实', '交付瑕疵', '违约损失'];

  describe('generateReviewChecklist', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-06-16'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('应该为案件A生成完整的审查清单', () => {
      const checklist = generateReviewChecklist('案件A', mockRecords, mockTasks, mockCustomIssues);

      expect(checklist.length).toBeGreaterThan(0);
      expect(checklist.every(item => item.id)).toBe(true);
      expect(checklist.every(item => item.category)).toBe(true);
      expect(checklist.every(item => item.severity)).toBe(true);
    });

    it('应该包含所有类别', () => {
      const checklist = generateReviewChecklist('案件A', mockRecords, mockTasks, mockCustomIssues);
      const categories = new Set(checklist.map(item => item.category));

      expect(categories.has('evidence-coverage')).toBe(true);
      expect(categories.has('material-status')).toBe(true);
      expect(categories.has('strengthen-task')).toBe(true);
      expect(categories.has('secrecy-level')).toBe(true);
      expect(categories.has('purpose-completeness')).toBe(true);
    });

    it('应该检测无证据的争议点', () => {
      const checklist = generateReviewChecklist('案件A', mockRecords, mockTasks, mockCustomIssues);
      const noEvidenceItems = checklist.filter(item => item.id.startsWith('coverage-none-'));

      expect(noEvidenceItems.length).toBeGreaterThan(0);
      expect(noEvidenceItems[0].severity).toBe('high');
      expect(noEvidenceItems[0].linkType).toBe('coverage');
    });

    it('应该检测需补强的证据', () => {
      const checklist = generateReviewChecklist('案件A', mockRecords, mockTasks, mockCustomIssues);
      const strengthenItems = checklist.filter(item => item.id.startsWith('coverage-strengthen-'));

      expect(strengthenItems.length).toBeGreaterThan(0);
      expect(strengthenItems[0].severity).toBe('high');
      expect(strengthenItems[0].evidenceIds).toContain('rec2');
    });

    it('应该检测全部待核对的争议点', () => {
      const recordsWithAllPending = [
        { id: 'rec1', caseName: '案件C', evidence: '证据1', issue: '合同成立', status: '待核对' },
        { id: 'rec2', caseName: '案件C', evidence: '证据2', issue: '合同成立', status: '待核对' },
      ];
      const checklist = generateReviewChecklist('案件C', recordsWithAllPending, [], {});
      const pendingItems = checklist.filter(item => item.id.startsWith('coverage-pending-'));

      expect(pendingItems.length).toBe(1);
      expect(pendingItems[0].severity).toBe('medium');
    });

    it('应该检测待核对的证据', () => {
      const checklist = generateReviewChecklist('案件A', mockRecords, mockTasks, mockCustomIssues);
      const pendingEvidence = checklist.filter(item => item.id.startsWith('status-pending-'));

      expect(pendingEvidence.length).toBeGreaterThan(0);
      expect(pendingEvidence[0].linkType).toBe('evidence');
      expect(pendingEvidence[0].linkEvidenceId).toBe('rec3');
    });

    it('应该检测需补强的证据（状态级别）', () => {
      const checklist = generateReviewChecklist('案件A', mockRecords, mockTasks, mockCustomIssues);
      const strengthenEvidence = checklist.filter(item => item.id.startsWith('status-strengthen-'));

      expect(strengthenEvidence.length).toBeGreaterThan(0);
      expect(strengthenEvidence[0].severity).toBe('high');
      expect(strengthenEvidence[0].linkEvidenceId).toBe('rec2');
    });

    it('应该检测缺少来源的证据', () => {
      const checklist = generateReviewChecklist('案件A', mockRecords, mockTasks, mockCustomIssues);
      const missingSource = checklist.filter(item => item.id.startsWith('source-missing-'));

      expect(missingSource.length).toBeGreaterThan(0);
      expect(missingSource[0].linkEvidenceId).toBe('rec2');
    });

    it('应该检测缺少日期的证据', () => {
      const checklist = generateReviewChecklist('案件A', mockRecords, mockTasks, mockCustomIssues);
      const missingDate = checklist.filter(item => item.id.startsWith('date-missing-'));

      expect(missingDate.length).toBeGreaterThan(0);
      expect(missingDate[0].linkEvidenceId).toBe('rec2');
    });

    it('应该检测缺少证明目的的证据', () => {
      const checklist = generateReviewChecklist('案件A', mockRecords, mockTasks, mockCustomIssues);
      const missingPurpose = checklist.filter(item => item.id.startsWith('purpose-missing-'));

      expect(missingPurpose.length).toBeGreaterThan(0);
      expect(missingPurpose[0].linkEvidenceId).toBe('rec2');
    });

    it('应该检测机密材料', () => {
      const checklist = generateReviewChecklist('案件A', mockRecords, mockTasks, mockCustomIssues);
      const confidentialItems = checklist.filter(item => item.id.startsWith('secrecy-confidential-'));

      expect(confidentialItems.length).toBeGreaterThan(0);
      expect(confidentialItems[0].severity).toBe('medium');
      expect(confidentialItems[0].evidenceIds).toContain('rec2');
    });

    it('应该检测未完成的补强任务', () => {
      const checklist = generateReviewChecklist('案件A', mockRecords, mockTasks, mockCustomIssues);
      const unfinishedTasks = checklist.filter(item => item.id.startsWith('task-unfinished-'));

      expect(unfinishedTasks.length).toBe(2);

      const overdueTask = unfinishedTasks.find(t => t.title.includes('逾期'));
      expect(overdueTask).toBeDefined();
      expect(overdueTask.severity).toBe('high');
      expect(overdueTask.linkTaskId).toBe('task1');
    });

    it('已完成的任务不应该出现在清单中', () => {
      const checklist = generateReviewChecklist('案件B', mockRecords, mockTasks, {});
      const unfinishedTasks = checklist.filter(item => item.id.startsWith('task-unfinished-'));

      expect(unfinishedTasks.length).toBe(0);
    });

    it('应该包含自定义争议点', () => {
      const checklist = generateReviewChecklist('案件A', mockRecords, mockTasks, mockCustomIssues);
      const issues = new Set(checklist.map(item => item.issue));

      expect(issues.has('新增争议点')).toBe(true);
    });

    it('应该为每个检查项提供必要的字段', () => {
      const checklist = generateReviewChecklist('案件A', mockRecords, mockTasks, mockCustomIssues);

      checklist.forEach(item => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('category');
        expect(item).toHaveProperty('title');
        expect(item).toHaveProperty('severity');
        expect(item).toHaveProperty('description');
        expect(item).toHaveProperty('checked', false);
      });
    });

    it('空案件应该返回无证据检查项', () => {
      const checklist = generateReviewChecklist('不存在的案件', mockRecords, mockTasks, {});
      expect(checklist.length).toBeGreaterThan(0);
      expect(checklist.every(item => item.category === 'evidence-coverage')).toBe(true);
      expect(checklist.every(item => item.severity === 'high')).toBe(true);
      expect(checklist.every(item => item.title.includes('无任何证据'))).toBe(true);
    });

    it('没有任务时不应该生成任务检查项', () => {
      const checklist = generateReviewChecklist('案件A', mockRecords, [], mockCustomIssues);
      const taskItems = checklist.filter(item => item.category === 'strengthen-task');

      expect(taskItems.length).toBe(0);
    });

    it('应该正确计算高风险项', () => {
      const checklist = generateReviewChecklist('案件A', mockRecords, mockTasks, mockCustomIssues);
      const highRiskItems = checklist.filter(item => item.severity === 'high');

      expect(highRiskItems.length).toBeGreaterThan(0);
      highRiskItems.forEach(item => {
        expect(['需补强', '无任何证据', '无证据', '逾期', '待处理'].some(keyword =>
          item.title.includes(keyword) || item.description.includes(keyword)
        )).toBe(true);
      });
    });

    it('REVIEW_ITEM_CATEGORIES应该包含所有必要类别', () => {
      expect(REVIEW_ITEM_CATEGORIES).toHaveProperty('evidence-coverage');
      expect(REVIEW_ITEM_CATEGORIES).toHaveProperty('material-status');
      expect(REVIEW_ITEM_CATEGORIES).toHaveProperty('strengthen-task');
      expect(REVIEW_ITEM_CATEGORIES).toHaveProperty('secrecy-level');
      expect(REVIEW_ITEM_CATEGORIES).toHaveProperty('purpose-completeness');
    });
  });
});
