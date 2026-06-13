import { useMemo, useState } from 'react';
import { Scale, Plus, Search, Trash2, RotateCcw, CheckCircle2, AlertTriangle, ClipboardList, CalendarDays, Upload, FileSpreadsheet, X, Check, AlertCircle, Info, Briefcase, Clock, Shield, Target, ChevronDown, BarChart3, Bookmark, BookmarkCheck, Printer, Eye, FileText, GitBranch, CircleDot, Filter, LayoutGrid, Layers, ListChecks, ArrowRight } from 'lucide-react';
import './App.css';

const appConfig = {
  "id": "hxwl-61310",
  "port": 61310,
  "title": "法律证据材料整理",
  "subtitle": "案件、证据、争议点和目录预览",
  "domain": "法律证据",
  "icon": "Scale",
  "storage": "hxwl-61310-legal-evidence",
  "templateStorage": "hxwl-61310-purpose-templates",
  "issueStorage": "hxwl-61310-custom-issues",
  "taskStorage": "hxwl-61310-strengthen-tasks",
  "accent": "#475569",
  "statuses": [
    "待核对",
    "已核对",
    "需补强"
  ],
  "primaryStatus": "待核对",
  "fields": [
    {
      "key": "caseName",
      "label": "案件",
      "type": "input",
      "placeholder": "合同纠纷案",
      "options": []
    },
    {
      "key": "evidence",
      "label": "证据材料",
      "type": "input",
      "placeholder": "付款截图",
      "options": []
    },
    {
      "key": "source",
      "label": "来源",
      "type": "input",
      "placeholder": "委托人提供",
      "options": []
    },
    {
      "key": "date",
      "label": "取得日期",
      "type": "date",
      "placeholder": "",
      "options": []
    },
    {
      "key": "purpose",
      "label": "证明目的",
      "type": "textarea",
      "placeholder": "证明被告已收到预付款",
      "options": []
    },
    {
      "key": "issue",
      "label": "关联争议点",
      "type": "select",
      "placeholder": "付款事实",
      "options": [
        "合同成立",
        "付款事实",
        "交付瑕疵",
        "违约损失"
      ]
    },
    {
      "key": "level",
      "label": "保密等级",
      "type": "select",
      "placeholder": "内部",
      "options": [
        "公开",
        "内部",
        "机密"
      ]
    }
  ],
  "seed": [
    {
      "caseName": "合同纠纷案",
      "evidence": "付款截图",
      "source": "委托人提供",
      "date": "2026-06-02",
      "purpose": "证明被告已收到预付款",
      "issue": "付款事实",
      "level": "内部",
      "status": "已核对"
    },
    {
      "caseName": "合同纠纷案",
      "evidence": "聊天记录",
      "source": "微信导出",
      "date": "2026-06-06",
      "purpose": "证明交付期限变更",
      "issue": "合同成立",
      "level": "机密",
      "status": "待核对"
    },
    {
      "caseName": "设备买卖案",
      "evidence": "维修报告",
      "source": "第三方机构",
      "date": "2026-05-28",
      "purpose": "证明设备存在瑕疵",
      "issue": "交付瑕疵",
      "level": "内部",
      "status": "需补强"
    }
  ],
  "metrics": [
    [
      "证据数",
      "records.length"
    ],
    [
      "案件数",
      "new Set(records.map((item) => item.caseName)).size"
    ],
    [
      "需补强",
      "records.filter((item) => item.status === '需补强').length"
    ]
  ],
  "filters": [
    {
      "key": "query",
      "label": "案件/证据",
      "type": "search",
      "match": "`${item.caseName}${item.evidence}${item.issue}`.includes(filters.query)"
    },
    {
      "key": "status",
      "label": "核对状态",
      "type": "status"
    }
  ],
  "cardTitle": "item.evidence",
  "cardMeta": "`${item.caseName} · ${item.issue} · ${item.level}`",
  "cardDetail": "item.purpose",
  "directory": true,
  "note": "重点是案件、证据、目录预览的闭环。",
  "defaultValues": {
    "caseName": "合同纠纷案",
    "evidence": "付款截图",
    "source": "委托人提供",
    "date": "",
    "purpose": "证明被告已收到预付款",
    "issue": "付款事实",
    "level": "内部",
    "status": "待核对"
  },
  "purposeTemplates": {
    "合同成立": [
      "证明双方已就合同主要条款达成合意",
      "证明合同已依法成立并生效",
      "证明要约、承诺过程完整有效",
      "证明双方均具有相应的民事行为能力",
      "证明合同内容不违反法律强制性规定",
      "证明合同签订系双方真实意思表示",
      "证明合同书加盖公章/签字真实有效"
    ],
    "付款事实": [
      "证明原告已按约定支付款项",
      "证明被告已收到相应款项",
      "证明付款金额与合同约定一致",
      "证明付款时间符合合同约定",
      "证明款项性质为合同项下货款/服务费",
      "证明原告已履行付款义务"
    ],
    "交付瑕疵": [
      "证明交付标的物存在质量瑕疵",
      "证明标的物不符合合同约定的规格标准",
      "证明交付数量与合同约定不符",
      "证明交付时间迟延于合同约定",
      "证明标的物存在功能性缺陷",
      "证明瑕疵导致合同目的无法实现",
      "证明原告已在异议期内提出质量异议"
    ],
    "违约损失": [
      "证明被告存在违约行为",
      "证明原告因违约遭受实际损失",
      "证明损失与违约行为存在因果关系",
      "证明违约金计算符合合同约定",
      "证明逾期利息/资金占用损失合理",
      "证明原告为维权支出的合理费用",
      "证明可得利益损失的计算依据"
    ]
  }
};

const today = new Date().toISOString().slice(0, 10);

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function withIds(items) {
  return items.map((item) => ({ id: uid(), timeline: item.timeline || [{ status: item.status, at: today, by: '系统' }], ...item }));
}

function loadRecords() {
  const raw = localStorage.getItem(appConfig.storage);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      return withIds(appConfig.seed);
    }
  }
  return withIds(appConfig.seed);
}

function loadTemplates() {
  const raw = localStorage.getItem(appConfig.templateStorage);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return {};
}

function saveTemplates(customTemplates) {
  localStorage.setItem(appConfig.templateStorage, JSON.stringify(customTemplates));
}

function addCustomTemplate(customTemplates, issue, purpose) {
  const next = { ...customTemplates };
  if (!next[issue]) {
    next[issue] = [];
  }
  if (!next[issue].includes(purpose)) {
    next[issue] = [...next[issue], purpose];
  }
  saveTemplates(next);
  return next;
}

function removeCustomTemplate(customTemplates, issue, purpose) {
  const next = { ...customTemplates };
  if (next[issue]) {
    next[issue] = next[issue].filter((item) => item !== purpose);
    if (next[issue].length === 0) {
      delete next[issue];
    }
  }
  saveTemplates(next);
  return next;
}

function loadCustomIssues() {
  const raw = localStorage.getItem(appConfig.issueStorage);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return {};
}

function saveCustomIssues(customIssues) {
  localStorage.setItem(appConfig.issueStorage, JSON.stringify(customIssues));
}

function addCustomIssue(customIssues, caseName, issue) {
  const next = { ...customIssues };
  if (!next[caseName]) {
    next[caseName] = [];
  }
  if (!next[caseName].includes(issue)) {
    next[caseName] = [...next[caseName], issue];
  }
  saveCustomIssues(next);
  return next;
}

function removeCustomIssue(customIssues, caseName, issue) {
  const next = { ...customIssues };
  if (next[caseName]) {
    next[caseName] = next[caseName].filter((item) => item !== issue);
    if (next[caseName].length === 0) {
      delete next[caseName];
    }
  }
  saveCustomIssues(next);
  return next;
}

const TASK_STATUSES = ['待处理', '处理中', '已完成', '已取消'];
const TASK_PRIMARY_STATUS = '待处理';
const TASK_STATUS_META = {
  '待处理': { color: '#6b7280', bg: '#f3f4f6', border: '#d1d5db' },
  '处理中': { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  '已完成': { color: '#047857', bg: '#ecfdf3', border: '#a7f3d0' },
  '已取消': { color: '#9ca3af', bg: '#f9fafb', border: '#e5e7eb' },
};

function loadTasks() {
  const raw = localStorage.getItem(appConfig.taskStorage);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }
  return [];
}

function saveTasks(tasks) {
  localStorage.setItem(appConfig.taskStorage, JSON.stringify(tasks));
}

function addTask(tasks, taskData) {
  const newTask = {
    id: uid(),
    ...taskData,
    status: taskData.status || TASK_PRIMARY_STATUS,
    createdAt: new Date().toISOString(),
    timeline: [{ status: taskData.status || TASK_PRIMARY_STATUS, at: today, by: '系统' }],
  };
  const next = [newTask, ...tasks];
  saveTasks(next);
  return next;
}

function updateTask(tasks, taskId, updates) {
  const next = tasks.map((task) => {
    if (task.id !== taskId) return task;
    const updatedTask = { ...task, ...updates };
    if (updates.status && updates.status !== task.status) {
      updatedTask.timeline = [
        ...(task.timeline || []),
        { status: updates.status, at: today, by: '操作员' },
      ];
    }
    return updatedTask;
  });
  saveTasks(next);
  return next;
}

function removeTask(tasks, taskId) {
  const next = tasks.filter((task) => task.id !== taskId);
  saveTasks(next);
  return next;
}

function isTaskOverdue(task) {
  if (!task.deadline || task.status === '已完成' || task.status === '已取消') return false;
  const deadlineDate = new Date(task.deadline);
  const now = new Date(today);
  return deadlineDate < now;
}

function getTaskDaysLeft(task) {
  if (!task.deadline) return null;
  const deadlineDate = new Date(task.deadline);
  const now = new Date(today);
  const diff = Math.ceil((deadlineDate.getTime() - now.getTime()) / 86400000);
  return diff;
}

function getTasksForEvidence(tasks, evidenceId) {
  return tasks.filter((task) => task.evidenceId === evidenceId);
}

function getAllIssues(customIssues, caseName, records) {
  const builtIn = appConfig.fields.find((f) => f.key === 'issue')?.options || [];
  const custom = customIssues[caseName] || [];
  const fromRecords = [...new Set(records.filter((r) => r.caseName === caseName).map((r) => r.issue).filter(Boolean))];
  const merged = [...builtIn];
  custom.forEach((item) => {
    if (!merged.includes(item)) merged.push(item);
  });
  fromRecords.forEach((item) => {
    if (!merged.includes(item)) merged.push(item);
  });
  return merged;
}

function computeIssueCoverage(customIssues, caseName, records) {
  const issues = getAllIssues(customIssues, caseName, records);
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

function getAllTemplates(customTemplates) {
  const result = {};
  Object.keys(appConfig.purposeTemplates).forEach((issue) => {
    result[issue] = [...appConfig.purposeTemplates[issue]];
  });
  Object.keys(customTemplates).forEach((issue) => {
    if (!result[issue]) {
      result[issue] = [];
    }
    customTemplates[issue].forEach((item) => {
      if (!result[issue].includes(item)) {
        result[issue].push(item);
      }
    });
  });
  return result;
}

function isBuiltInTemplate(issue, purpose) {
  return appConfig.purposeTemplates[issue]?.includes(purpose) ?? false;
}

function avg(numbers) {
  const valid = numbers.filter((value) => Number.isFinite(value));
  if (!valid.length) return 0;
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

function money(value) {
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', maximumFractionDigits: 0 }).format(value || 0);
}

function inNextDays(dateText, days) {
  if (!dateText) return false;
  const date = new Date(dateText);
  const now = new Date(today);
  const diff = (date.getTime() - now.getTime()) / 86400000;
  return diff >= 0 && diff <= days;
}

function latestTemp(item) {
  const temps = item.temps || [Number(item.temperature)];
  return temps[temps.length - 1];
}

function hasHotTemp(item) {
  const temps = item.temps || [Number(item.temperature)];
  return temps.some((value) => Number(value) > 2);
}

function priorityRank(value) {
  return { 危急: 0, 加急: 1, 常规: 2, 高: 0, 中: 1, 低: 2 }[value] ?? 9;
}

function hasOverlap(target, records) {
  if (!target.bed || !target.date || !target.start || !target.end) return false;
  return records.some((item) => item.id !== target.id && item.bed === target.bed && item.date === target.date && target.start < item.end && target.end > item.start);
}

function statusClass(status) {
  const index = appConfig.statuses.indexOf(status);
  return ['status-a', 'status-b', 'status-c', 'status-d'][index] || 'status-a';
}

const FIELD_ALIASES = {
  caseName: ['案件', '案件名称', '案件名', '案例名称', '案例', 'case', 'caseName', 'case_name'],
  evidence: ['证据材料', '证据', '证据名称', '材料名称', '材料', 'evidence', 'material'],
  source: ['来源', '证据来源', '材料来源', '获取来源', 'source', 'from'],
  date: ['取得日期', '日期', '获取日期', '取得时间', '采集日期', 'date', 'acquireDate'],
  purpose: ['证明目的', '证明内容', '证明事项', '说明', 'purpose', 'prove'],
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

function buildImportPreview(text) {
  if (!text.trim()) {
    return {
      hasData: false,
      matchedFields: [],
      unmatchedHeaders: [],
      missingRequired: REQUIRED_FIELDS.map(key => ({
        key,
        label: appConfig.fields.find(f => f.key === key)?.label || (key === 'status' ? '当前状态' : key)
      })),
      validRows: [],
      invalidRows: [],
      rowCount: 0,
      fieldMapping: {}
    };
  }

  const { headers, rows } = parseCSV(text);
  const fieldMapping = {};
  const matchedFields = [];
  const unmatchedHeaders = [];

  headers.forEach((header, index) => {
    const fieldKey = matchField(header);
    if (fieldKey) {
      fieldMapping[fieldKey] = index;
      if (!matchedFields.includes(fieldKey)) {
        matchedFields.push(fieldKey);
      }
    } else if (header.trim()) {
      unmatchedHeaders.push(header);
    }
  });

  const missingRequired = REQUIRED_FIELDS
    .filter(key => !matchedFields.includes(key))
    .map(key => ({
      key,
      label: appConfig.fields.find(f => f.key === key)?.label || (key === 'status' ? '当前状态' : key)
    }));

  const validRows = [];
  const invalidRows = [];

  rows.forEach((row, rowIndex) => {
    const record = {};
    let hasRequired = true;
    const missingFields = [];

    ALL_FIELDS.forEach(fieldKey => {
      const colIndex = fieldMapping[fieldKey];
      if (colIndex !== undefined && colIndex < row.length) {
        record[fieldKey] = row[colIndex];
      }
    });

    REQUIRED_FIELDS.forEach(key => {
      if (!record[key] || !String(record[key]).trim()) {
        hasRequired = false;
        missingFields.push(appConfig.fields.find(f => f.key === key)?.label || key);
      }
    });

    const enrichedRecord = {
      ...record,
      status: record.status || appConfig.primaryStatus,
      _rowNumber: rowIndex + 2,
      _missingFields: missingFields
    };

    if (hasRequired) {
      validRows.push(enrichedRecord);
    } else {
      invalidRows.push(enrichedRecord);
    }
  });

  return {
    hasData: true,
    matchedFields: matchedFields.map(key => ({
      key,
      label: appConfig.fields.find(f => f.key === key)?.label || (key === 'status' ? '当前状态' : key)
    })),
    unmatchedHeaders,
    missingRequired,
    validRows,
    invalidRows,
    rowCount: rows.length,
    fieldMapping
  };
}

function App() {
  const [records, setRecords] = useState(loadRecords);
  const [form, setForm] = useState(appConfig.defaultValues);
  const [filters, setFilters] = useState({ query: '', status: '全部' });
  const [selected, setSelected] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [importResult, setImportResult] = useState(null);
  const [selectedCaseName, setSelectedCaseName] = useState('');
  const [customTemplates, setCustomTemplates] = useState(loadTemplates);
  const [showTemplatePanel, setShowTemplatePanel] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [exportConfig, setExportConfig] = useState({
    caseName: '',
    hideConfidential: false,
    groupByIssue: true,
  });
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [customIssues, setCustomIssues] = useState(loadCustomIssues);
  const [selectedIssueFilter, setSelectedIssueFilter] = useState('');
  const [newIssueInput, setNewIssueInput] = useState('');
  const [issueCoverageFilter, setIssueCoverageFilter] = useState('all');
  const [viewMode, setViewMode] = useState('机密');
  const [tasks, setTasks] = useState(loadTasks);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskModalMode, setTaskModalMode] = useState('create');
  const [taskForm, setTaskForm] = useState({
    evidenceId: '',
    caseName: '',
    evidenceName: '',
    issue: '',
    reason: '',
    assignee: '',
    deadline: '',
    status: TASK_PRIMARY_STATUS,
  });
  const [taskFilters, setTaskFilters] = useState({
    caseName: '',
    issue: '',
    overdueStatus: 'all',
    status: 'all',
  });
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [workbenchCase, setWorkbenchCase] = useState('');
  const [workbenchTab, setWorkbenchTab] = useState('evidence');

  const WORKBENCH_TABS = [
    { key: 'evidence', label: '证据录入', icon: ClipboardList },
    { key: 'coverage', label: '争议点覆盖', icon: Target },
    { key: 'timeline', label: '证据链时间线', icon: GitBranch },
    { key: 'tasks', label: '补强任务', icon: AlertTriangle },
    { key: 'export', label: '导出预览', icon: Eye },
  ];

  const VIEW_MODES = [
    { key: '公开', label: '公开模式', desc: '机密信息脱敏，仅见公开材料', color: '#047857' },
    { key: '内部', label: '内部模式', desc: '展示公开和内部材料', color: '#2563eb' },
    { key: '机密', label: '机密模式', desc: '展示全部材料', color: '#dc2626' },
  ];

  const LEVEL_RANK = { '公开': 0, '内部': 1, '机密': 2 };
  const MODE_MAX_VISIBLE_LEVEL = { '公开': LEVEL_RANK['公开'], '内部': LEVEL_RANK['内部'], '机密': LEVEL_RANK['机密'] };

  function isRecordMasked(item, mode) {
    const itemLevel = LEVEL_RANK[item.level] ?? 1;
    const visibleLevel = MODE_MAX_VISIBLE_LEVEL[mode] ?? 0;
    return itemLevel > visibleLevel;
  }

  function maskText(text, type = 'default') {
    if (!text || !String(text).trim()) return text;
    const str = String(text);
    if (str.length <= 2) return '****';
    if (type === 'purpose') {
      return str.slice(0, 4) + '****' + (str.length > 8 ? str.slice(-2) : '');
    }
    if (type === 'source') {
      return str.slice(0, 2) + '****';
    }
    return str.slice(0, 2) + '****' + str.slice(-2);
  }

  function applyMaskToRecord(item, mode) {
    if (!isRecordMasked(item, mode)) return item;
    return {
      ...item,
      evidence: maskText(item.evidence, 'evidence'),
      source: maskText(item.source, 'source'),
      purpose: maskText(item.purpose, 'purpose'),
      _masked: true,
    };
  }

  function getProcessedRecords(items, mode) {
    return items.map((item) => applyMaskToRecord(item, mode));
  }

  function processSingleRecord(item, mode) {
    if (!item) return item;
    return applyMaskToRecord(item, mode);
  }

  function getSearchableText(item, mode) {
    const masked = applyMaskToRecord(item, mode);
    return `${masked.caseName}${masked.evidence}${masked.issue}`;
  }

  function persist(next) {
    setRecords(next);
    localStorage.setItem(appConfig.storage, JSON.stringify(next));
  }

  function addRecord(event) {
    event.preventDefault();
    const nextRecord = {
      id: uid(),
      ...form,
      status: form.status || appConfig.primaryStatus,
      createdAt: new Date().toISOString(),
      timeline: [{ status: form.status || appConfig.primaryStatus, at: today, by: '录入' }]
    };

    if (appConfig.conflict === 'date-slot' && records.some((item) => item.date === nextRecord.date && item.slot === nextRecord.slot)) {
      nextRecord.conflict = true;
    }
    if (appConfig.conflict === 'bed-time' && hasOverlap(nextRecord, records)) {
      nextRecord.conflict = true;
    }
    if (appConfig.chart) {
      const temp = Number(nextRecord.temperature || 0);
      nextRecord.temps = [temp];
      if (temp > 2) nextRecord.status = '异常';
    }

    persist([nextRecord, ...records]);
    setForm(appConfig.defaultValues);
    setSelected(nextRecord);
  }

  function updateStatus(id, status) {
    const next = records.map((item) => item.id === id ? {
      ...item,
      status,
      timeline: [...(item.timeline || []), { status, at: today, by: '操作员' }]
    } : item);
    persist(next);
    if (selected?.id === id) setSelected(next.find((item) => item.id === id));
  }

  function removeRecord(id) {
    const next = records.filter((item) => item.id !== id);
    persist(next);
    if (selected?.id === id) setSelected(null);
  }

  function duplicateRecord(item) {
    const copied = { ...item, id: uid(), status: appConfig.primaryStatus, timeline: [{ status: appConfig.primaryStatus, at: today, by: '复制' }] };
    persist([copied, ...records]);
    setSelected(copied);
  }

  function addTemperature(item) {
    const value = Number(prompt('录入新的温度读数'));
    if (!Number.isFinite(value)) return;
    const next = records.map((record) => record.id === item.id ? {
      ...record,
      temps: [...(record.temps || []), value],
      temperature: String(value),
      status: value > 2 ? '异常' : record.status
    } : record);
    persist(next);
    setSelected(next.find((record) => record.id === item.id));
  }

  function handleImportTextChange(value) {
    setImportText(value);
    setImportResult(buildImportPreview(value));
  }

  function openImport() {
    setShowImport(true);
    setImportText('');
    setImportResult(null);
  }

  function closeImport() {
    setShowImport(false);
    setImportText('');
    setImportResult(null);
  }

  function confirmImport() {
    if (!importResult || importResult.validRows.length === 0) return;

    const newRecords = importResult.validRows.map(row => {
      const baseRecord = {};
      ALL_FIELDS.forEach(key => {
        if (row[key] !== undefined) {
          baseRecord[key] = row[key];
        }
      });

      let status = baseRecord.status || appConfig.primaryStatus;
      if (!appConfig.statuses.includes(status)) {
        status = appConfig.primaryStatus;
      }

      return {
        id: uid(),
        ...baseRecord,
        status,
        createdAt: new Date().toISOString(),
        timeline: [{ status, at: today, by: '批量导入' }]
      };
    });

    persist([...newRecords, ...records]);
    if (newRecords.length > 0) {
      setSelected(newRecords[0]);
    }
    closeImport();
  }

  function applyTemplate(purpose) {
    setForm({ ...form, purpose });
  }

  function handleSaveTemplate() {
    if (!form.purpose || !form.purpose.trim()) return;
    const issue = form.issue || appConfig.defaultValues.issue;
    const next = addCustomTemplate(customTemplates, issue, form.purpose.trim());
    setCustomTemplates(next);
  }

  function handleRemoveTemplate(issue, purpose) {
    const next = removeCustomTemplate(customTemplates, issue, purpose);
    setCustomTemplates(next);
  }

  const allTemplates = useMemo(() => getAllTemplates(customTemplates), [customTemplates]);
  const currentTemplates = allTemplates[form.issue] || [];

  const filteredRecords = useMemo(() => {
    return records
      .filter((item) => !filters.query || getSearchableText(item, viewMode).includes(filters.query))
      .filter((item) => filters.status === '全部' || item.status === filters.status)
      .filter((item) => !selectedIssueFilter || (
        item.issue === selectedIssueFilter
        && (!selectedCaseName || item.caseName === selectedCaseName)
      ))
      .sort((a, b) => {
        if (appConfig.sort === 'priority') {
          const rank = priorityRank(a.priority) - priorityRank(b.priority);
          if (rank !== 0) return rank;
        }
        const aDate = a[appConfig.dateKey] || a.sentAt || a.createdAt || '';
        const bDate = b[appConfig.dateKey] || b.sentAt || b.createdAt || '';
        return String(aDate).localeCompare(String(bDate));
      });
  }, [records, filters, selectedIssueFilter, selectedCaseName, viewMode]);

  const displayRecords = useMemo(() => getProcessedRecords(filteredRecords, viewMode), [filteredRecords, viewMode]);
  const displaySelected = useMemo(() => processSingleRecord(selected, viewMode), [selected, viewMode]);

  const metrics = [
    { label: "证据数", value: records.length },
    { label: "案件数", value: new Set(records.map((item) => item.caseName)).size },
    { label: "需补强", value: records.filter((item) => item.status === '需补强').length },
  ];

  const groupedByDate = useMemo(() => {
    return displayRecords.reduce((acc, item) => {
      const key = item[appConfig.dateKey] || item.date || item.enrollDate || '未排期';
      (acc[key] ||= []).push(item);
      return acc;
    }, {});
  }, [displayRecords]);

  const directory = useMemo(() => {
    const visibleRecords = getProcessedRecords(records, viewMode);
    return visibleRecords.reduce((acc, item) => {
      const key = item.issue || '未分类';
      (acc[key] ||= []).push(item);
      return acc;
    }, {});
  }, [records, viewMode]);

  const caseNames = useMemo(() => {
    const names = [...new Set(records.map((item) => item.caseName))];
    return names;
  }, [records]);

  const caseOverview = useMemo(() => {
    if (!selectedCaseName) return null;

    const caseRecords = records.filter((item) => item.caseName === selectedCaseName);

    const statusDistribution = appConfig.statuses.map((status) => ({
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
  }, [records, selectedCaseName]);

  const issueCoverageData = useMemo(() => {
    if (!selectedCaseName) return null;
    return computeIssueCoverage(customIssues, selectedCaseName, records);
  }, [records, selectedCaseName, customIssues]);

  const filteredIssueCoverage = useMemo(() => {
    if (!issueCoverageData) return null;
    if (issueCoverageFilter === 'all') return issueCoverageData;
    return issueCoverageData.filter((item) => item.coverageStatus === issueCoverageFilter);
  }, [issueCoverageData, issueCoverageFilter]);

  const issueCoverageStats = useMemo(() => {
    if (!issueCoverageData) return null;
    return {
      total: issueCoverageData.length,
      none: issueCoverageData.filter((i) => i.coverageStatus === 'none').length,
      allPending: issueCoverageData.filter((i) => i.coverageStatus === 'all-pending').length,
      needStrengthen: issueCoverageData.filter((i) => i.coverageStatus === 'need-strengthen').length,
      covered: issueCoverageData.filter((i) => i.coverageStatus === 'covered').length,
      partial: issueCoverageData.filter((i) => i.coverageStatus === 'partial').length,
    };
  }, [issueCoverageData]);

  function handleAddCustomIssue() {
    if (!selectedCaseName || !newIssueInput.trim()) return;
    const next = addCustomIssue(customIssues, selectedCaseName, newIssueInput.trim());
    setCustomIssues(next);
    setNewIssueInput('');
  }

  function handleRemoveCustomIssue(issueName) {
    if (!selectedCaseName) return;
    const next = removeCustomIssue(customIssues, selectedCaseName, issueName);
    setCustomIssues(next);
  }

  function openCreateTaskFromEvidence(evidence) {
    setTaskForm({
      evidenceId: evidence.id,
      caseName: evidence.caseName,
      evidenceName: evidence.evidence,
      issue: evidence.issue,
      reason: '',
      assignee: '',
      deadline: '',
      status: TASK_PRIMARY_STATUS,
    });
    setTaskModalMode('create');
    setEditingTaskId(null);
    setShowTaskModal(true);
  }

  function openEditTask(task) {
    setTaskForm({
      evidenceId: task.evidenceId,
      caseName: task.caseName,
      evidenceName: task.evidenceName,
      issue: task.issue,
      reason: task.reason,
      assignee: task.assignee,
      deadline: task.deadline,
      status: task.status,
    });
    setTaskModalMode('edit');
    setEditingTaskId(task.id);
    setShowTaskModal(true);
  }

  function closeTaskModal() {
    setShowTaskModal(false);
    setTaskModalMode('create');
    setEditingTaskId(null);
    setTaskForm({
      evidenceId: '',
      caseName: '',
      evidenceName: '',
      issue: '',
      reason: '',
      assignee: '',
      deadline: '',
      status: TASK_PRIMARY_STATUS,
    });
  }

  function handleTaskFormSubmit(event) {
    event.preventDefault();
    if (!taskForm.evidenceId || !taskForm.reason.trim() || !taskForm.assignee.trim() || !taskForm.deadline) {
      alert('请填写完整的任务信息（补强原因、负责人、截止日期为必填）');
      return;
    }
    if (taskModalMode === 'create') {
      const next = addTask(tasks, { ...taskForm });
      setTasks(next);
    } else if (taskModalMode === 'edit' && editingTaskId) {
      const next = updateTask(tasks, editingTaskId, { ...taskForm });
      setTasks(next);
    }
    closeTaskModal();
  }

  function handleTaskStatusChange(taskId, newStatus) {
    const next = updateTask(tasks, taskId, { status: newStatus });
    setTasks(next);
  }

  function handleTaskDelete(taskId) {
    if (confirm('确定要删除这个补强任务吗？')) {
      const next = removeTask(tasks, taskId);
      setTasks(next);
    }
  }

  const taskIssueOptions = useMemo(() => {
    const issues = new Set();
    tasks.forEach((task) => {
      if (task.issue) issues.add(task.issue);
    });
    return [...issues];
  }, [tasks]);

  const taskCaseOptions = useMemo(() => {
    const cases = new Set();
    tasks.forEach((task) => {
      if (task.caseName) cases.add(task.caseName);
    });
    return [...cases];
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (taskFilters.caseName && task.caseName !== taskFilters.caseName) return false;
      if (taskFilters.issue && task.issue !== taskFilters.issue) return false;
      if (taskFilters.status !== 'all' && task.status !== taskFilters.status) return false;
      if (taskFilters.overdueStatus !== 'all') {
        const overdue = isTaskOverdue(task);
        if (taskFilters.overdueStatus === 'overdue' && !overdue) return false;
        if (taskFilters.overdueStatus === 'not-overdue' && overdue) return false;
      }
      return true;
    }).sort((a, b) => {
      const aOverdue = isTaskOverdue(a) ? 0 : 1;
      const bOverdue = isTaskOverdue(b) ? 0 : 1;
      if (aOverdue !== bOverdue) return aOverdue - bOverdue;
      if (a.deadline && b.deadline) {
        return a.deadline.localeCompare(b.deadline);
      }
      if (a.deadline) return -1;
      if (b.deadline) return 1;
      return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
    });
  }, [tasks, taskFilters]);

  const tasksForSelectedEvidence = useMemo(() => {
    if (!selected) return [];
    return getTasksForEvidence(tasks, selected.id);
  }, [tasks, selected]);

  const taskMetrics = useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter((t) => t.status === '待处理').length;
    const inProgress = tasks.filter((t) => t.status === '处理中').length;
    const completed = tasks.filter((t) => t.status === '已完成').length;
    const overdue = tasks.filter((t) => isTaskOverdue(t)).length;
    return { total, pending, inProgress, completed, overdue };
  }, [tasks]);

  const wbRecords = useMemo(() => {
    if (!workbenchCase) return [];
    return records.filter((r) => r.caseName === workbenchCase);
  }, [records, workbenchCase]);

  const wbDisplayRecords = useMemo(() => getProcessedRecords(wbRecords, viewMode), [wbRecords, viewMode]);

  const wbCoverage = useMemo(() => {
    if (!workbenchCase) return null;
    return computeIssueCoverage(customIssues, workbenchCase, records);
  }, [records, workbenchCase, customIssues]);

  const wbTimeline = useMemo(() => {
    if (!workbenchCase) return [];
    const caseRecords = wbDisplayRecords.filter((item) => item.date);
    const noDate = wbDisplayRecords.filter((item) => !item.date);
    const grouped = {};
    caseRecords.forEach((item) => {
      (grouped[item.date] ||= []).push(item);
    });
    const sortedDates = Object.keys(grouped).sort();
    const result = sortedDates.map((date) => ({ date, items: grouped[date], isNoDate: false }));
    if (noDate.length > 0) {
      result.push({ date: '未标注日期', items: noDate, isNoDate: true });
    }
    return result;
  }, [wbDisplayRecords, workbenchCase]);

  const wbTasks = useMemo(() => {
    if (!workbenchCase) return [];
    return tasks.filter((t) => t.caseName === workbenchCase);
  }, [tasks, workbenchCase]);

  const wbExportData = useMemo(() => {
    if (!workbenchCase) return [];
    let data = records.filter((item) => item.caseName === workbenchCase);
    return data;
  }, [records, workbenchCase]);

  const wbDirectory = useMemo(() => {
    if (!workbenchCase) return {};
    const visibleRecords = getProcessedRecords(wbRecords, viewMode);
    return visibleRecords.reduce((acc, item) => {
      const key = item.issue || '未分类';
      (acc[key] ||= []).push(item);
      return acc;
    }, {});
  }, [wbRecords, viewMode, workbenchCase]);

  const wbStats = useMemo(() => {
    if (!workbenchCase) return null;
    const caseRecords = records.filter((item) => item.caseName === workbenchCase);
    return {
      total: caseRecords.length,
      pending: caseRecords.filter((r) => r.status === '待核对').length,
      verified: caseRecords.filter((r) => r.status === '已核对').length,
      needStrengthen: caseRecords.filter((r) => r.status === '需补强').length,
      issues: new Set(caseRecords.map((r) => r.issue).filter(Boolean)).size,
      tasks: wbTasks.length,
      tasksOverdue: wbTasks.filter((t) => isTaskOverdue(t)).length,
    };
  }, [records, workbenchCase, wbTasks]);

  function isBuiltInIssue(issueName) {
    const builtIn = appConfig.fields.find((f) => f.key === 'issue')?.options || [];
    return builtIn.includes(issueName);
  }

  function handleClickIssue(issueName) {
    if (selectedIssueFilter === issueName) {
      setSelectedIssueFilter('');
    } else {
      setSelectedIssueFilter(issueName);
    }
  }

  const timelineData = useMemo(() => {
    if (!selectedCaseName) return [];

    const caseRecords = displayRecords.filter(item => item.caseName === selectedCaseName);
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
  }, [displayRecords, selectedCaseName]);

  function openExport() {
    setShowExport(true);
    setExportConfig({
      caseName: '',
      hideConfidential: false,
      groupByIssue: true,
    });
    setShowPrintPreview(false);
  }

  function closeExport() {
    setShowExport(false);
    setShowPrintPreview(false);
  }

  const exportData = useMemo(() => {
    let data = [...records];

    if (exportConfig.caseName) {
      data = data.filter((item) => item.caseName === exportConfig.caseName);
    }

    if (exportConfig.hideConfidential) {
      data = data.filter((item) => item.level !== '机密');
    }

    return data;
  }, [records, exportConfig]);

  const groupedExportData = useMemo(() => {
    if (!exportConfig.groupByIssue) {
      return { '全部证据': exportData };
    }

    const byCase = {};
    exportData.forEach((item) => {
      const caseKey = item.caseName || '未分类案件';
      if (!byCase[caseKey]) {
        byCase[caseKey] = {};
      }
      const issueKey = item.issue || '未分类争议点';
      if (!byCase[caseKey][issueKey]) {
        byCase[caseKey][issueKey] = [];
      }
      byCase[caseKey][issueKey].push(item);
    });

    return byCase;
  }, [exportData, exportConfig.groupByIssue]);

  const exportStats = useMemo(() => {
    const total = exportData.length;
    const cases = new Set(exportData.map((item) => item.caseName)).size;
    const issues = new Set(exportData.map((item) => item.issue)).size;
    const confidentialCount = exportData.filter((item) => item.level === '机密').length;
    return { total, cases, issues, confidentialCount };
  }, [exportData]);

  function handlePrint() {
    setShowPrintPreview(true);
    setTimeout(() => {
      window.print();
    }, 200);
  }

  return (
    <main className="shell" style={{ '--accent': appConfig.accent }}>
      <section className="hero">
        <div>
          <div className="eyebrow"><Scale size={18} />{appConfig.domain}</div>
          <h1>{appConfig.title}</h1>
          <p>{appConfig.subtitle}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="port-card">
            <span>Local Port</span>
            <strong>{appConfig.port}</strong>
          </div>
          <button className="export-entry-btn" type="button" onClick={openExport}>
            <FileText size={18} />
            导出证据目录
          </button>
        </div>
      </section>

      <section className="view-mode-bar">
        <div className="view-mode-label">
          <Shield size={18} />
          <span>保密视图</span>
        </div>
        <div className="view-mode-switcher">
          {VIEW_MODES.map((m) => (
            <button
              key={m.key}
              type="button"
              className={`view-mode-btn ${viewMode === m.key ? 'active' : ''}`}
              style={viewMode === m.key ? { background: m.color, borderColor: m.color } : {}}
              onClick={() => setViewMode(m.key)}
              title={m.desc}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="view-mode-desc">
          {VIEW_MODES.find((m) => m.key === viewMode)?.desc}
        </div>
      </section>

      <section className="metrics">
        {metrics.map((metric) => (
          <article className="metric" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </section>

      <section className="panel workbench-panel">
        <div className="panel-title">
          <LayoutGrid size={18} />
          <h2>案件证据工作台</h2>
          <div className="workbench-case-selector">
            <Briefcase size={16} />
            <select value={workbenchCase} onChange={(e) => { setWorkbenchCase(e.target.value); setWorkbenchTab('evidence'); }}>
              <option value="">请选择案件进入工作台</option>
              {caseNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <ChevronDown size={16} />
          </div>
        </div>

        {!workbenchCase ? (
          <div className="workbench-empty">
            <LayoutGrid size={48} />
            <h3>选择案件，进入专属工作台</h3>
            <p>在同一工作区内切换查看证据录入、争议点覆盖、证据链时间线、补强任务和导出预览</p>
          </div>
        ) : (
          <>
            <div className="workbench-stats">
              <div className="wb-stat-card">
                <FileSpreadsheet size={18} />
                <div>
                  <span>证据</span>
                  <strong>{wbStats.total}</strong>
                </div>
              </div>
              <div className="wb-stat-card wb-pending">
                <Clock size={18} />
                <div>
                  <span>待核对</span>
                  <strong>{wbStats.pending}</strong>
                </div>
              </div>
              <div className="wb-stat-card wb-verified">
                <CheckCircle2 size={18} />
                <div>
                  <span>已核对</span>
                  <strong>{wbStats.verified}</strong>
                </div>
              </div>
              <div className="wb-stat-card wb-strengthen">
                <AlertTriangle size={18} />
                <div>
                  <span>需补强</span>
                  <strong>{wbStats.needStrengthen}</strong>
                </div>
              </div>
              <div className="wb-stat-card wb-issues">
                <Target size={18} />
                <div>
                  <span>争议点</span>
                  <strong>{wbStats.issues}</strong>
                </div>
              </div>
              <div className="wb-stat-card wb-tasks">
                <ListChecks size={18} />
                <div>
                  <span>任务{wbStats.tasksOverdue > 0 ? `(${wbStats.tasksOverdue}逾期)` : ''}</span>
                  <strong>{wbStats.tasks}</strong>
                </div>
              </div>
            </div>

            <div className="workbench-tabs">
              {WORKBENCH_TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    className={`workbench-tab ${workbenchTab === tab.key ? 'active' : ''}`}
                    onClick={() => setWorkbenchTab(tab.key)}
                  >
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="workbench-content">
              {workbenchTab === 'evidence' && (
                <div className="wb-evidence-tab">
                  <div className="wb-form-section">
                    <h3 className="wb-section-title"><ClipboardList size={16} /> 快速录入证据到当前案件</h3>
                    <form className="wb-form" onSubmit={(e) => {
                      e.preventDefault();
                      if (!form.evidence || !form.caseName) return;
                      const nextRecord = {
                        id: uid(),
                        ...form,
                        caseName: workbenchCase,
                        status: form.status || appConfig.primaryStatus,
                        createdAt: new Date().toISOString(),
                        timeline: [{ status: form.status || appConfig.primaryStatus, at: today, by: '工作台录入' }]
                      };
                      persist([nextRecord, ...records]);
                      setForm(appConfig.defaultValues);
                      setSelected(nextRecord);
                    }}>
                      <div className="wb-form-grid">
                        {appConfig.fields.filter((f) => f.key !== 'caseName').map((field) => (
                          field.key === 'purpose' ? (
                            <label key={field.key} className="wb-wide">
                              <span>{field.label}</span>
                              <textarea value={form[field.key] || ''} onChange={(e) => setForm({ ...form, [field.key]: e.target.value, caseName: workbenchCase })} placeholder={field.placeholder} rows={2} />
                            </label>
                          ) : field.type === 'select' ? (
                            <label key={field.key}>
                              <span>{field.label}</span>
                              <select value={form[field.key] || ''} onChange={(e) => setForm({ ...form, [field.key]: e.target.value, caseName: workbenchCase })}>
                                <option value="">请选择</option>
                                {(field.key === 'issue' ? getAllIssues(customIssues, workbenchCase, records) : field.options).map((opt) => <option key={opt}>{opt}</option>)}
                              </select>
                            </label>
                          ) : (
                            <label key={field.key}>
                              <span>{field.label}</span>
                              <input type={field.type} value={field.key === 'caseName' ? workbenchCase : (form[field.key] || '')} onChange={(e) => setForm({ ...form, [field.key]: e.target.value, caseName: workbenchCase })} placeholder={field.placeholder} readOnly={field.key === 'caseName'} />
                            </label>
                          )
                        ))}
                        <label>
                          <span>当前状态</span>
                          <select value={form.status || appConfig.primaryStatus} onChange={(e) => setForm({ ...form, status: e.target.value, caseName: workbenchCase })}>
                            {appConfig.statuses.map((s) => <option key={s}>{s}</option>)}
                          </select>
                        </label>
                      </div>
                      <div className="wb-form-actions">
                        <button className="primary" type="submit"><Plus size={16} />录入证据</button>
                        <button type="button" className="secondary" onClick={openImport}><Upload size={16} />批量导入CSV</button>
                      </div>
                    </form>
                  </div>

                  <div className="wb-records-section">
                    <h3 className="wb-section-title"><FileText size={16} /> 当前案件证据列表（{wbRecords.length}）</h3>
                    <div className="wb-records-toolbar">
                      <div className="search">
                        <Search size={16} />
                        <input value={filters.query} onChange={(e) => setFilters({ ...filters, query: e.target.value })} placeholder="搜索证据名称、争议点" />
                      </div>
                      <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                        <option>全部</option>
                        {appConfig.statuses.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="wb-records-list">
                      {wbDisplayRecords.length > 0 ? wbDisplayRecords.map((item) => (
                        <article key={item.id} className={`wb-record-card ${item._masked ? 'masked-record' : ''}`} onClick={() => setSelected(records.find((r) => r.id === item.id))}>
                          <div className="wb-record-head">
                            <h4>
                              {item.evidence}
                              {item._masked && <span className="masked-badge"><Shield size={12} />脱敏</span>}
                            </h4>
                            <span className={'status ' + statusClass(item.status)}>{item.status}</span>
                          </div>
                          <div className="wb-record-meta">
                            <span><Target size={12} />{item.issue || '未关联'}</span>
                            <span><Shield size={12} />{item.level || '内部'}</span>
                            <span><CalendarDays size={12} />{item.date || '未标注'}</span>
                          </div>
                          <p className="wb-record-purpose">{item.purpose}</p>
                          <div className="wb-record-actions" onClick={(e) => e.stopPropagation()}>
                            {appConfig.statuses.map((s) => (
                              <button key={s} type="button" onClick={() => updateStatus(item.id, s)}>{s}</button>
                            ))}
                            {item.status === '需补强' && !item._masked && (
                              <button type="button" className="task-btn" onClick={() => openCreateTaskFromEvidence(records.find((r) => r.id === item.id))}>
                                <AlertTriangle size={14} /> 生成任务
                              </button>
                            )}
                            <button className="ghost-danger" type="button" onClick={() => removeRecord(item.id)}><Trash2 size={14} /></button>
                          </div>
                        </article>
                      )) : (
                        <div className="wb-empty-hint">
                          <FileText size={32} />
                          <p>该案件暂无证据记录，请通过上方表单录入</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {workbenchTab === 'coverage' && (
                <div className="wb-coverage-tab">
                  {wbCoverage ? (
                    <>
                      <div className="wb-coverage-summary">
                        <div className="wb-cov-stat wb-cov-covered">
                          <CheckCircle2 size={18} />
                          <strong>{wbCoverage.filter((i) => i.coverageStatus === 'covered').length}</strong>
                          <span>已覆盖</span>
                        </div>
                        <div className="wb-cov-stat wb-cov-partial">
                          <Info size={18} />
                          <strong>{wbCoverage.filter((i) => i.coverageStatus === 'partial').length}</strong>
                          <span>部分覆盖</span>
                        </div>
                        <div className="wb-cov-stat wb-cov-waiting">
                          <Clock size={18} />
                          <strong>{wbCoverage.filter((i) => i.coverageStatus === 'all-pending').length}</strong>
                          <span>待核对</span>
                        </div>
                        <div className="wb-cov-stat wb-cov-strengthen">
                          <AlertTriangle size={18} />
                          <strong>{wbCoverage.filter((i) => i.coverageStatus === 'need-strengthen').length}</strong>
                          <span>需补强</span>
                        </div>
                        <div className="wb-cov-stat wb-cov-none">
                          <AlertCircle size={18} />
                          <strong>{wbCoverage.filter((i) => i.coverageStatus === 'none').length}</strong>
                          <span>无证据</span>
                        </div>
                      </div>
                      <div className="wb-coverage-grid">
                        {wbCoverage.map((issue) => {
                          const meta = COVERAGE_STATUS_META[issue.coverageStatus];
                          return (
                            <div key={issue.name} className="wb-cov-card" style={{ borderColor: meta.border, background: meta.bg }}>
                              <div className="wb-cov-card-head">
                                <span className="coverage-indicator" style={{ background: meta.color }} />
                                <h4 style={{ color: meta.color }}>{issue.name}</h4>
                                <span className="coverage-badge" style={{ background: meta.color, color: '#fff' }}>{meta.label}</span>
                              </div>
                              <div className="wb-cov-counts">
                                <span>总{issue.total}</span>
                                <span>已核对{issue.verified}</span>
                                <span>待核对{issue.pending}</span>
                                <span>需补强{issue.needStrengthen}</span>
                              </div>
                              <div className="issue-progress-bar">
                                {issue.total > 0 && (
                                  <>
                                    {issue.verified > 0 && <div className="progress-segment ps-verified" style={{ width: `${(issue.verified / issue.total) * 100}%` }} />}
                                    {issue.pending > 0 && <div className="progress-segment ps-pending" style={{ width: `${(issue.pending / issue.total) * 100}%` }} />}
                                    {issue.needStrengthen > 0 && <div className="progress-segment ps-strengthen" style={{ width: `${(issue.needStrengthen / issue.total) * 100}%` }} />}
                                  </>
                                )}
                              </div>
                              {issue.records.length > 0 && (
                                <div className="issue-evidence-preview">
                                  <div className="issue-evidence-tags">
                                    {issue.records.slice(0, 5).map((ev) => {
                                      const masked = applyMaskToRecord(ev, viewMode);
                                      return (
                                        <span key={ev.id} className={`issue-evidence-tag status ${statusClass(ev.status)} ${masked._masked ? 'masked-record' : ''}`} onClick={(e) => { e.stopPropagation(); setSelected(ev); }}>
                                          {masked.evidence}
                                        </span>
                                      );
                                    })}
                                    {issue.records.length > 5 && <span className="issue-evidence-more">+{issue.records.length - 5} 更多</span>}
                                  </div>
                                </div>
                              )}
                              {issue.coverageStatus === 'none' && (
                                <div className="issue-empty-hint">
                                  <AlertCircle size={14} />
                                  该争议点暂无证据材料，请尽快补充
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="wb-empty-hint"><Target size={32} /><p>请选择案件</p></div>
                  )}
                </div>
              )}

              {workbenchTab === 'timeline' && (
                <div className="wb-timeline-tab">
                  {wbTimeline.length > 0 ? (
                    <div className="timeline-track">
                      {wbTimeline.map((group, groupIdx) => (
                        <div key={group.date} className={`timeline-group ${group.isNoDate ? 'no-date-group' : ''}`}>
                          <div className="timeline-date-marker">
                            <div className="timeline-dot-wrapper">
                              {groupIdx === 0 ? <CircleDot size={14} /> : <span className="timeline-dot" />}
                              {groupIdx < wbTimeline.length - 1 && <span className="timeline-line" />}
                            </div>
                            <div className="timeline-date-label">
                              <CalendarDays size={14} />
                              <span>{group.isNoDate ? '未标注日期' : group.date}</span>
                              <span className="timeline-count">{group.items.length} 份</span>
                            </div>
                          </div>
                          <div className="timeline-items">
                            {group.items.map((item) => (
                              <div key={item.id} className={`timeline-node ${selected?.id === item.id ? 'active' : ''} ${item._masked ? 'masked-record' : ''}`} onClick={() => setSelected(records.find((r) => r.id === item.id))}>
                                <div className="timeline-node-head">
                                  <span className="timeline-node-title">
                                    {item.evidence}
                                    {item._masked && <span className="masked-badge"><Shield size={12} />脱敏</span>}
                                  </span>
                                  <span className={'status ' + statusClass(item.status)}>{item.status}</span>
                                </div>
                                <div className="timeline-node-meta">
                                  <span><Briefcase size={12} />{item.source || '未标注'}</span>
                                  <span><Target size={12} />{item.issue || '未关联'}</span>
                                </div>
                                <div className="timeline-node-purpose">{item.purpose || '无证明目的'}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="wb-empty-hint"><GitBranch size={32} /><p>该案件暂无带日期的证据记录</p></div>
                  )}
                </div>
              )}

              {workbenchTab === 'tasks' && (
                <div className="wb-tasks-tab">
                  {wbTasks.length > 0 ? (
                    <div className="wb-tasks-list">
                      {wbTasks.map((task) => {
                        const overdue = isTaskOverdue(task);
                        const daysLeft = getTaskDaysLeft(task);
                        const statusMeta = TASK_STATUS_META[task.status];
                        return (
                          <div key={task.id} className={`task-card ${overdue ? 'overdue' : ''}`} style={{ borderLeftColor: overdue ? '#dc2626' : statusMeta.color }}>
                            <div className="task-card-header">
                              <div className="task-card-title-row">
                                <h4 className="task-evidence-name"><FileText size={16} /> {task.evidenceName}</h4>
                                <span className="task-status-chip" style={{ background: statusMeta.bg, color: statusMeta.color, borderColor: statusMeta.border }}>{task.status}</span>
                                {overdue && (
                                  <span className="overdue-chip"><AlertCircle size={12} /> 逾期{daysLeft !== null ? ` ${Math.abs(daysLeft)} 天` : ''}</span>
                                )}
                                {!overdue && daysLeft !== null && task.status !== '已完成' && task.status !== '已取消' && daysLeft <= 3 && (
                                  <span className="urgent-chip"><Clock size={12} /> {daysLeft === 0 ? '今日截止' : `剩 ${daysLeft} 天`}</span>
                                )}
                              </div>
                              <div className="task-card-meta-row">
                                <span className="task-issue-tag"><Target size={12} /> {task.issue || '未关联'}</span>
                              </div>
                            </div>
                            <div className="task-card-body">
                              <div className="task-reason-block">
                                <span className="task-block-label">补强原因</span>
                                <p className="task-reason-text">{task.reason}</p>
                              </div>
                              <div className="task-info-row">
                                <div className="task-info-item"><Briefcase size={14} /><span className="ti-label">负责人：</span><span className="ti-value">{task.assignee}</span></div>
                                <div className="task-info-item"><CalendarDays size={14} /><span className="ti-label">截止日期：</span><span className={`ti-value ${overdue ? 'overdue-text' : ''}`}>{task.deadline}</span></div>
                              </div>
                            </div>
                            <div className="task-card-footer">
                              <div className="task-status-actions">
                                {TASK_STATUSES.map((s) => (
                                  <button key={s} type="button" className={`task-status-btn ${task.status === s ? 'active' : ''}`} onClick={() => handleTaskStatusChange(task.id, s)} style={task.status === s ? { background: statusMeta.color, color: '#fff', borderColor: statusMeta.color } : {}}>{s}</button>
                                ))}
                              </div>
                              <div className="task-card-actions">
                                <button type="button" className="task-action-btn edit" onClick={() => openEditTask(task)}>编辑</button>
                                <button type="button" className="task-action-btn delete" onClick={() => handleTaskDelete(task.id)}><Trash2 size={14} /> 删除</button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="wb-empty-hint">
                      <ListChecks size={32} />
                      <p>该案件暂无补强任务</p>
                    </div>
                  )}
                </div>
              )}

              {workbenchTab === 'export' && (
                <div className="wb-export-tab">
                  <div className="wb-export-config">
                    <label className="checkbox-label">
                      <input type="checkbox" checked={exportConfig.hideConfidential} onChange={(e) => setExportConfig({ ...exportConfig, hideConfidential: e.target.checked })} />
                      <span>隐藏「机密」材料</span>
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" checked={exportConfig.groupByIssue} onChange={(e) => setExportConfig({ ...exportConfig, groupByIssue: e.target.checked })} />
                      <span>按争议点分组</span>
                    </label>
                  </div>
                  <div className="wb-export-stats">
                    <div className="summary-stat"><div className="summary-icon info"><FileSpreadsheet size={16} /></div><div><span>证据数</span><strong>{wbExportData.length}</strong></div></div>
                    <div className="summary-stat"><div className="summary-icon ok"><Target size={16} /></div><div><span>争议点</span><strong>{new Set(wbExportData.map((i) => i.issue).filter(Boolean)).size}</strong></div></div>
                    <div className="summary-stat warning"><div className="summary-icon warn"><Shield size={16} /></div><div><span>机密</span><strong>{wbExportData.filter((i) => i.level === '机密').length}</strong></div></div>
                  </div>
                  {wbExportData.length > 0 ? (
                    <div className="wb-directory-preview">
                      <h3 className="wb-section-title"><FileText size={16} /> 证据目录预览</h3>
                      {exportConfig.groupByIssue ? (
                        Object.entries(wbDirectory).map(([issue, items]) => (
                          <div key={issue} className="directory-group">
                            <strong>{issue}</strong>
                            {items.map((item, index) => (
                              <span key={item.id} className={item._masked ? 'masked-dir-entry' : ''}>
                                {index + 1}. {item.evidence}｜{item.purpose}
                                {item._masked && <em className="dir-masked-tag"><Shield size={10} />脱敏</em>}
                              </span>
                            ))}
                          </div>
                        ))
                      ) : (
                        <div className="directory-group">
                          <strong>全部证据</strong>
                          {wbExportData.map((item, index) => (
                            <span key={item.id}>{index + 1}. {item.evidence}｜{item.purpose}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="wb-empty-hint"><FileText size={32} /><p>该案件暂无可导出的证据</p></div>
                  )}
                  <div className="wb-export-actions">
                    <button type="button" className="primary" onClick={() => { setExportConfig({ ...exportConfig, caseName: workbenchCase }); openExport(); }}>
                      <Printer size={16} /> 打开完整导出预览
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </section>

      <section className="panel case-overview">
        <div className="panel-title">
          <BarChart3 size={18} />
          <h2>案件总览</h2>
          <div className="case-selector">
            <Briefcase size={16} />
            <select value={selectedCaseName} onChange={(e) => setSelectedCaseName(e.target.value)}>
              <option value="">请选择案件</option>
              {caseNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <ChevronDown size={16} />
          </div>
        </div>

        {caseOverview ? (
          <>
            <div className="overview-stats">
              <div className="overview-stat-card">
                <div className="stat-icon evidence-icon">
                  <FileSpreadsheet size={22} />
                </div>
                <div>
                  <span>证据总数</span>
                  <strong>{caseOverview.totalCount}</strong>
                </div>
              </div>
              <div className="overview-stat-card">
                <div className="stat-icon issue-icon">
                  <Target size={22} />
                </div>
                <div>
                  <span>争议点</span>
                  <strong>{caseOverview.issueDistribution.length}</strong>
                </div>
              </div>
              <div className="overview-stat-card">
                <div className="stat-icon level-icon">
                  <Shield size={22} />
                </div>
                <div>
                  <span>保密等级</span>
                  <strong>{caseOverview.levelDistribution.length}</strong>
                </div>
              </div>
            </div>

            <div className="overview-distributions">
              <div className="distribution-card">
                <h3>核对状态分布</h3>
                <div className="distribution-list">
                  {caseOverview.statusDistribution.map((item) => (
                    <div key={item.name} className="distribution-item">
                      <div className="dist-label">
                        <span className={'status ' + statusClass(item.name)}>{item.name}</span>
                        <span className="dist-count">{item.count}</span>
                      </div>
                      <div className="dist-bar">
                        <div
                          className={'dist-fill ' + statusClass(item.name)}
                          style={{ width: `${caseOverview.totalCount ? (item.count / caseOverview.totalCount) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="distribution-card">
                <h3>关联争议点分布</h3>
                <div className="distribution-list">
                  {caseOverview.issueDistribution.map((item) => (
                    <div key={item.name} className="distribution-item">
                      <div className="dist-label">
                        <span className="dist-name">{item.name}</span>
                        <span className="dist-count">{item.count}</span>
                      </div>
                      <div className="dist-bar">
                        <div
                          className="dist-fill dist-issue"
                          style={{ width: `${caseOverview.totalCount ? (item.count / caseOverview.totalCount) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="distribution-card">
                <h3>保密等级分布</h3>
                <div className="distribution-list">
                  {caseOverview.levelDistribution.map((item) => (
                    <div key={item.name} className="distribution-item">
                      <div className="dist-label">
                        <span className="dist-name">{item.name}</span>
                        <span className="dist-count">{item.count}</span>
                      </div>
                      <div className="dist-bar">
                        <div
                          className="dist-fill dist-level"
                          style={{ width: `${caseOverview.totalCount ? (item.count / caseOverview.totalCount) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="recent-evidence">
              <h3>
                <Clock size={16} />
                最近录入证据
              </h3>
              <div className="recent-list">
                {caseOverview.recentEvidence.map((item) => {
                  const masked = applyMaskToRecord(item, viewMode);
                  return (
                    <div key={item.id} className={`recent-item ${masked._masked ? 'masked-record' : ''}`} onClick={() => setSelected(item)}>
                      <div className="recent-main">
                        <span className="recent-title">
                          {masked.evidence}
                          {masked._masked && <span className="masked-badge"><Shield size={12} />脱敏</span>}
                        </span>
                        <span className={'status ' + statusClass(item.status)}>{item.status}</span>
                      </div>
                      <div className="recent-meta">
                        <span>{item.issue}</span>
                        <span>·</span>
                        <span>{item.date || item.createdAt?.slice(0, 10) || '未设置日期'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="overview-empty">
            <Briefcase size={40} />
            <p>请从上方选择一个案件，查看该案件的证据统计概览</p>
          </div>
        )}
      </section>

      <section className="panel issue-coverage">
        <div className="panel-title">
          <Target size={18} />
          <h2>争议点覆盖检查</h2>
          <div className="case-selector">
            <Briefcase size={16} />
            <select value={selectedCaseName} onChange={(e) => setSelectedCaseName(e.target.value)}>
              <option value="">请选择案件</option>
              {caseNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <ChevronDown size={16} />
          </div>
        </div>

        {issueCoverageData ? (
          <>
            <div className="coverage-stats">
              <div className="coverage-stat-card cs-covered" onClick={() => setIssueCoverageFilter(issueCoverageFilter === 'covered' ? 'all' : 'covered')}>
                <div className="coverage-stat-icon"><CheckCircle2 size={22} /></div>
                <div>
                  <span>已覆盖</span>
                  <strong>{issueCoverageStats.covered}</strong>
                </div>
              </div>
              <div className="coverage-stat-card cs-partial" onClick={() => setIssueCoverageFilter(issueCoverageFilter === 'partial' ? 'all' : 'partial')}>
                <div className="coverage-stat-icon"><Info size={22} /></div>
                <div>
                  <span>部分覆盖</span>
                  <strong>{issueCoverageStats.partial}</strong>
                </div>
              </div>
              <div className="coverage-stat-card cs-pending" onClick={() => setIssueCoverageFilter(issueCoverageFilter === 'all-pending' ? 'all' : 'all-pending')}>
                <div className="coverage-stat-icon"><Clock size={22} /></div>
                <div>
                  <span>待核对</span>
                  <strong>{issueCoverageStats.allPending}</strong>
                </div>
              </div>
              <div className="coverage-stat-card cs-strengthen" onClick={() => setIssueCoverageFilter(issueCoverageFilter === 'need-strengthen' ? 'all' : 'need-strengthen')}>
                <div className="coverage-stat-icon"><AlertTriangle size={22} /></div>
                <div>
                  <span>需补强</span>
                  <strong>{issueCoverageStats.needStrengthen}</strong>
                </div>
              </div>
              <div className="coverage-stat-card cs-none" onClick={() => setIssueCoverageFilter(issueCoverageFilter === 'none' ? 'all' : 'none')}>
                <div className="coverage-stat-icon"><AlertCircle size={22} /></div>
                <div>
                  <span>无证据</span>
                  <strong>{issueCoverageStats.none}</strong>
                </div>
              </div>
            </div>

            {issueCoverageFilter !== 'all' && (
              <div className="coverage-filter-badge">
                <Filter size={12} />
                正在筛选：{COVERAGE_STATUS_META[issueCoverageFilter]?.label}
                <button type="button" onClick={() => setIssueCoverageFilter('all')}>
                  <X size={12} /> 清除
                </button>
              </div>
            )}

            <div className="add-issue-row">
              <div className="add-issue-input-wrap">
                <Plus size={16} />
                <input
                  type="text"
                  placeholder="输入自定义争议点名称，回车或点击按钮添加"
                  value={newIssueInput}
                  onChange={(e) => setNewIssueInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomIssue();
                    }
                  }}
                />
              </div>
              <button
                type="button"
                className="primary add-issue-btn"
                onClick={handleAddCustomIssue}
                disabled={!newIssueInput.trim()}
              >
                <Plus size={16} />
                新增争议点
              </button>
            </div>

            {selectedIssueFilter && (
              <div className="issue-filter-active-badge">
                <Target size={14} />
                已筛选争议点：<strong>{selectedIssueFilter}</strong>
                <button type="button" onClick={() => setSelectedIssueFilter('')}>
                  <X size={12} /> 取消筛选
                </button>
              </div>
            )}

            <div className="issue-coverage-list">
              {filteredIssueCoverage.length > 0 ? (
                filteredIssueCoverage.map((issue) => {
                  const meta = COVERAGE_STATUS_META[issue.coverageStatus];
                  const isActive = selectedIssueFilter === issue.name;
                  return (
                    <div
                      key={issue.name}
                      className={`issue-coverage-card ${isActive ? 'active' : ''}`}
                      style={{ borderColor: meta.border, background: meta.bg }}
                      onClick={() => handleClickIssue(issue.name)}
                    >
                      <div className="issue-card-head">
                        <div className="issue-card-title">
                          <span
                            className="coverage-indicator"
                            style={{ background: meta.color }}
                          />
                          <h3 style={{ color: meta.color }}>{issue.name}</h3>
                          {!isBuiltInIssue(issue.name) && (
                            <button
                              type="button"
                              className="remove-issue-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveCustomIssue(issue.name);
                              }}
                              title="删除此自定义争议点"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                        <span className="coverage-badge" style={{ background: meta.color, color: '#fff' }}>
                          {meta.label}
                        </span>
                      </div>

                      <div className="issue-card-body">
                        <div className="issue-counts">
                          <div className="issue-count">
                            <span className="ic-label">证据总数</span>
                            <strong className="ic-value">{issue.total}</strong>
                          </div>
                          <div className="issue-count">
                            <span className="ic-label">已核对</span>
                            <strong className="ic-value" style={{ color: '#047857' }}>{issue.verified}</strong>
                          </div>
                          <div className="issue-count">
                            <span className="ic-label">待核对</span>
                            <strong className="ic-value" style={{ color: '#d97706' }}>{issue.pending}</strong>
                          </div>
                          <div className="issue-count">
                            <span className="ic-label">需补强</span>
                            <strong className="ic-value" style={{ color: '#b45309' }}>{issue.needStrengthen}</strong>
                          </div>
                        </div>

                        <div className="issue-progress">
                          <div className="issue-progress-bar">
                            {issue.total > 0 && (
                              <>
                                {issue.verified > 0 && (
                                  <div
                                    className="progress-segment ps-verified"
                                    style={{ width: `${(issue.verified / issue.total) * 100}%` }}
                                    title={`已核对 ${issue.verified} 份`}
                                  />
                                )}
                                {issue.pending > 0 && (
                                  <div
                                    className="progress-segment ps-pending"
                                    style={{ width: `${(issue.pending / issue.total) * 100}%` }}
                                    title={`待核对 ${issue.pending} 份`}
                                  />
                                )}
                                {issue.needStrengthen > 0 && (
                                  <div
                                    className="progress-segment ps-strengthen"
                                    style={{ width: `${(issue.needStrengthen / issue.total) * 100}%` }}
                                    title={`需补强 ${issue.needStrengthen} 份`}
                                  />
                                )}
                              </>
                            )}
                          </div>
                          <div className="progress-legend">
                            <span><i className="legend-dot ld-verified" />已核对</span>
                            <span><i className="legend-dot ld-pending" />待核对</span>
                            <span><i className="legend-dot ld-strengthen" />需补强</span>
                          </div>
                        </div>

                        {issue.records.length > 0 && (
                          <div className="issue-evidence-preview">
                            <div className="issue-evidence-title">
                              <FileText size={12} />
                              关联证据（{issue.records.length}）
                            </div>
                            <div className="issue-evidence-tags">
                              {issue.records.slice(0, 5).map((ev) => {
                                const masked = applyMaskToRecord(ev, viewMode);
                                return (
                                  <span
                                    key={ev.id}
                                    className={`issue-evidence-tag status ${statusClass(ev.status)} ${masked._masked ? 'masked-record' : ''}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelected(ev);
                                    }}
                                  >
                                    {masked.evidence}
                                  </span>
                                );
                              })}
                              {issue.records.length > 5 && (
                                <span className="issue-evidence-more">+{issue.records.length - 5} 更多</span>
                              )}
                            </div>
                          </div>
                        )}

                        {issue.coverageStatus === 'none' && (
                          <div className="issue-empty-hint">
                            <AlertCircle size={14} />
                            该争议点暂无证据材料，请尽快补充相关证据
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="coverage-empty">
                  <Target size={36} />
                  <p>当前筛选条件下没有匹配的争议点</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="overview-empty">
            <Target size={40} />
            <p>请从上方选择一个案件，查看该案件的争议点证据覆盖情况</p>
          </div>
        )}
      </section>

      <section className="workspace">
        <form className="panel form-panel" onSubmit={addRecord}>
          <div className="panel-title">
            <ClipboardList size={18} />
            <h2>新增记录</h2>
          </div>
          <div className="form-grid">
            {appConfig.fields.map((field) => (
              field.key === 'purpose' ? (
                <label key={field.key} className="wide">
                  <span className="field-label-row">
                    <span>{field.label}</span>
                    <button
                      type="button"
                      className="template-toggle-btn"
                      onClick={() => setShowTemplatePanel(!showTemplatePanel)}
                    >
                      <Bookmark size={14} />
                      {showTemplatePanel ? '收起模板' : '证明目的模板'}
                      <ChevronDown size={14} className={showTemplatePanel ? 'rotate-up' : ''} />
                    </button>
                  </span>
                  <textarea
                    value={form[field.key] || ''}
                    onChange={(event) => setForm({ ...form, [field.key]: event.target.value })}
                    placeholder={field.placeholder}
                  />
                  {showTemplatePanel && (
                    <div className="template-panel">
                      <div className="template-panel-header">
                        <span className="template-panel-title">
                          <BookmarkCheck size={14} />
                          {form.issue || '请选择争议点'} 相关模板
                        </span>
                        <button
                          type="button"
                          className="save-template-btn"
                          onClick={handleSaveTemplate}
                          disabled={!form.purpose || !form.purpose.trim()}
                        >
                          <Plus size={14} />
                          保存当前为模板
                        </button>
                      </div>
                      {currentTemplates.length > 0 ? (
                        <div className="template-list">
                          {currentTemplates.map((template, index) => (
                            <div key={index} className="template-item">
                              <button
                                type="button"
                                className="template-text"
                                onClick={() => applyTemplate(template)}
                                title="点击填入"
                              >
                                {template}
                              </button>
                              {!isBuiltInTemplate(form.issue, template) && (
                                <button
                                  type="button"
                                  className="template-delete-btn"
                                  onClick={() => handleRemoveTemplate(form.issue, template)}
                                  title="删除模板"
                                >
                                  <X size={12} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="template-empty">暂无模板，请先选择争议点或添加自定义模板</p>
                      )}
                    </div>
                  )}
                </label>
              ) : (
                <label key={field.key} className={field.type === 'textarea' ? 'wide' : ''}>
                  <span>{field.label}</span>
                  {field.type === 'textarea' ? (
                    <textarea value={form[field.key] || ''} onChange={(event) => setForm({ ...form, [field.key]: event.target.value })} placeholder={field.placeholder} />
                  ) : field.type === 'select' ? (
                    <select value={form[field.key] || ''} onChange={(event) => setForm({ ...form, [field.key]: event.target.value })}>
                      {(field.key === 'issue' && form.caseName
                        ? getAllIssues(customIssues, form.caseName, records)
                        : field.options
                      ).map((option) => <option key={option}>{option}</option>)}
                    </select>
                  ) : (
                    <input type={field.type} value={form[field.key] || ''} onChange={(event) => setForm({ ...form, [field.key]: event.target.value })} placeholder={field.placeholder} />
                  )}
                </label>
              )
            ))}
            <label>
              <span>当前状态</span>
              <select value={form.status || appConfig.primaryStatus} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                {appConfig.statuses.map((status) => <option key={status}>{status}</option>)}
              </select>
            </label>
          </div>
          <div className="form-actions">
            <button className="primary" type="submit"><Plus size={18} />新增</button>
            <button type="button" className="secondary" onClick={openImport}><Upload size={18} />批量导入CSV</button>
          </div>
          <p className="hint">{appConfig.note}</p>
        </form>

        <section className="panel list-panel">
          <div className="toolbar">
            <div className="search">
              <Search size={16} />
              <input value={filters.query} onChange={(event) => setFilters({ ...filters, query: event.target.value })} placeholder={appConfig.filters[0]?.label || '搜索'} />
            </div>
            <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
              <option>全部</option>
              {appConfig.statuses.map((status) => <option key={status}>{status}</option>)}
            </select>
          </div>

          <div className="records">
            {displayRecords.map((item) => (
              <article className={'record ' + (item.conflict || hasOverlap(item, records) ? 'conflict' : '') + (item._masked ? ' masked-record' : '')} key={item.id} onClick={() => setSelected(records.find((r) => r.id === item.id))}>
                <div className="record-head">
                  <div>
                    <h3>
                      {item.evidence}
                      {item._masked && <span className="masked-badge"><Shield size={12} />脱敏</span>}
                    </h3>
                    <p>{`${item.caseName} · ${item.issue} · ${item.level}`}</p>
                  </div>
                  <span className={'status ' + statusClass(item.status)}>{item.status}</span>
                </div>
                <p className="record-detail">{item.purpose}</p>
                {(item.conflict || hasOverlap(item, records)) && <div className="warning"><AlertTriangle size={15} />发现冲突</div>}
                <div className="actions" onClick={(event) => event.stopPropagation()}>
                  {appConfig.statuses.map((status) => (
                    <button key={status} type="button" onClick={() => updateStatus(item.id, status)}>{status}</button>
                  ))}
                  {item.status === '需补强' && !item._masked && (
                    <button
                      key="create-task"
                      type="button"
                      className="task-btn"
                      onClick={() => openCreateTaskFromEvidence(records.find((r) => r.id === item.id))}
                      title="生成补强任务"
                    >
                      <AlertTriangle size={14} /> 生成任务
                    </button>
                  )}
                  {appConfig.action === 'copyRecipe' && <button type="button" onClick={() => duplicateRecord(records.find((r) => r.id === item.id))}><RotateCcw size={14} />复制</button>}
                  {appConfig.chart && <button type="button" onClick={() => addTemperature(records.find((r) => r.id === item.id))}>加温度</button>}
                  <button className="ghost-danger" type="button" onClick={() => removeRecord(item.id)}><Trash2 size={14} /></button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>

      <section className="panel evidence-chain-timeline">
        <div className="panel-title">
          <GitBranch size={18} />
          <h2>证据链时间线</h2>
          <div className="timeline-case-selector">
            <Briefcase size={16} />
            <select value={selectedCaseName} onChange={(e) => setSelectedCaseName(e.target.value)}>
              <option value="">请选择案件</option>
              {caseNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <ChevronDown size={16} />
          </div>
          {(filters.query || filters.status !== '全部') && (
            <span className="timeline-filter-badge">
              <Filter size={12} />
              筛选视图
            </span>
          )}
        </div>

        {selectedCaseName ? (
          timelineData.length > 0 ? (
            <div className="timeline-track">
              {timelineData.map((group, groupIdx) => (
                <div key={group.date} className={`timeline-group ${group.isNoDate ? 'no-date-group' : ''}`}>
                  <div className="timeline-date-marker">
                    <div className="timeline-dot-wrapper">
                      {groupIdx === 0 ? <CircleDot size={14} /> : <span className="timeline-dot" />}
                      {groupIdx < timelineData.length - 1 && <span className="timeline-line" />}
                    </div>
                    <div className="timeline-date-label">
                      <CalendarDays size={14} />
                      <span>{group.isNoDate ? '未标注日期' : group.date}</span>
                      <span className="timeline-count">{group.items.length} 份</span>
                    </div>
                  </div>
                  <div className="timeline-items">
                    {group.items.map((item) => (
                      <div
                        key={item.id}
                        className={`timeline-node ${selected?.id === item.id ? 'active' : ''} ${item._masked ? 'masked-record' : ''}`}
                        onClick={() => setSelected(records.find((r) => r.id === item.id))}
                      >
                        <div className="timeline-node-head">
                          <span className="timeline-node-title">
                            {item.evidence}
                            {item._masked && <span className="masked-badge"><Shield size={12} />脱敏</span>}
                          </span>
                          <span className={'status ' + statusClass(item.status)}>{item.status}</span>
                        </div>
                        <div className="timeline-node-meta">
                          <span><Briefcase size={12} />{item.source || '未标注'}</span>
                          <span><Target size={12} />{item.issue || '未关联'}</span>
                        </div>
                        <div className="timeline-node-purpose">{item.purpose || '无证明目的'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="timeline-empty">
              <GitBranch size={40} />
              <p>当前筛选条件下没有匹配的证据记录</p>
            </div>
          )
        ) : (
          <div className="timeline-empty">
            <GitBranch size={40} />
            <p>请选择一个案件，查看该案件的证据链时间线</p>
          </div>
        )}
      </section>

      <section className="panel strengthen-tasks-panel">
        <div className="panel-title" style={{ marginBottom: 16 }}>
          <AlertTriangle size={18} />
          <h2>证据补强任务</h2>
          <div className="task-metrics-brief">
            <span className="tmb tmb-overdue">逾期：{taskMetrics.overdue}</span>
            <span className="tmb tmb-pending">待处理：{taskMetrics.pending}</span>
            <span className="tmb tmb-progress">处理中：{taskMetrics.inProgress}</span>
            <span className="tmb tmb-done">已完成：{taskMetrics.completed}</span>
            <span className="tmb tmb-total">总计：{taskMetrics.total}</span>
          </div>
        </div>

        <div className="task-filter-bar">
          <div className="task-filter-item">
            <label><Briefcase size={14} /> 案件</label>
            <select
              value={taskFilters.caseName}
              onChange={(e) => setTaskFilters({ ...taskFilters, caseName: e.target.value })}
            >
              <option value="">全部案件</option>
              {caseNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          <div className="task-filter-item">
            <label><Target size={14} /> 争议点</label>
            <select
              value={taskFilters.issue}
              onChange={(e) => setTaskFilters({ ...taskFilters, issue: e.target.value })}
            >
              <option value="">全部争议点</option>
              {taskIssueOptions.length > 0 ? (
                taskIssueOptions.map((issue) => (
                  <option key={issue} value={issue}>{issue}</option>
                ))
              ) : (
                (appConfig.fields.find((f) => f.key === 'issue')?.options || []).map((issue) => (
                  <option key={issue} value={issue}>{issue}</option>
                ))
              )}
            </select>
          </div>
          <div className="task-filter-item">
            <label><AlertCircle size={14} /> 逾期状态</label>
            <select
              value={taskFilters.overdueStatus}
              onChange={(e) => setTaskFilters({ ...taskFilters, overdueStatus: e.target.value })}
            >
              <option value="all">全部</option>
              <option value="overdue">已逾期</option>
              <option value="not-overdue">未逾期</option>
            </select>
          </div>
          <div className="task-filter-item">
            <label><CheckCircle2 size={14} /> 处理状态</label>
            <select
              value={taskFilters.status}
              onChange={(e) => setTaskFilters({ ...taskFilters, status: e.target.value })}
            >
              <option value="all">全部</option>
              {TASK_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className="clear-task-filters-btn"
            onClick={() => setTaskFilters({ caseName: '', issue: '', overdueStatus: 'all', status: 'all' })}
          >
            <RotateCcw size={14} /> 重置
          </button>
        </div>

        <div className="task-list">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => {
              const overdue = isTaskOverdue(task);
              const daysLeft = getTaskDaysLeft(task);
              const statusMeta = TASK_STATUS_META[task.status];
              return (
                <div
                  key={task.id}
                  className={`task-card ${overdue ? 'overdue' : ''}`}
                  style={{ borderLeftColor: overdue ? '#dc2626' : statusMeta.color }}
                >
                  <div className="task-card-header">
                    <div className="task-card-title-row">
                      <h4 className="task-evidence-name">
                        <FileText size={16} /> {task.evidenceName}
                      </h4>
                      <span
                        className="task-status-chip"
                        style={{ background: statusMeta.bg, color: statusMeta.color, borderColor: statusMeta.border }}
                      >
                        {task.status}
                      </span>
                      {overdue && (
                        <span className="overdue-chip">
                          <AlertCircle size={12} /> 逾期
                          {daysLeft !== null ? ` ${Math.abs(daysLeft)} 天` : ''}
                        </span>
                      )}
                      {!overdue && daysLeft !== null && task.status !== '已完成' && task.status !== '已取消' && daysLeft <= 3 && (
                        <span className="urgent-chip">
                          <Clock size={12} /> {daysLeft === 0 ? '今日截止' : `剩 ${daysLeft} 天`}
                        </span>
                      )}
                    </div>
                    <div className="task-card-meta-row">
                      <span className="task-case-tag">
                        <Briefcase size={12} /> {task.caseName}
                      </span>
                      <span className="task-issue-tag">
                        <Target size={12} /> {task.issue || '未关联'}
                      </span>
                    </div>
                  </div>

                  <div className="task-card-body">
                    <div className="task-reason-block">
                      <span className="task-block-label">补强原因</span>
                      <p className="task-reason-text">{task.reason}</p>
                    </div>
                    <div className="task-info-row">
                      <div className="task-info-item">
                        <Briefcase size={14} />
                        <span className="ti-label">负责人：</span>
                        <span className="ti-value">{task.assignee}</span>
                      </div>
                      <div className="task-info-item">
                        <CalendarDays size={14} />
                        <span className="ti-label">截止日期：</span>
                        <span className={`ti-value ${overdue ? 'overdue-text' : ''}`}>{task.deadline}</span>
                      </div>
                    </div>
                  </div>

                  <div className="task-card-footer">
                    <div className="task-status-actions">
                      {TASK_STATUSES.map((s) => (
                        <button
                          key={s}
                          type="button"
                          className={`task-status-btn ${task.status === s ? 'active' : ''}`}
                          onClick={() => handleTaskStatusChange(task.id, s)}
                          style={task.status === s ? { background: statusMeta.color, color: '#fff', borderColor: statusMeta.color } : {}}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    <div className="task-card-actions">
                      <button
                        type="button"
                        className="task-action-btn edit"
                        onClick={() => openEditTask(task)}
                      >
                        编辑
                      </button>
                      <button
                        type="button"
                        className="task-action-btn delete"
                        onClick={() => handleTaskDelete(task.id)}
                      >
                        <Trash2 size={14} /> 删除
                      </button>
                      <button
                        type="button"
                        className="task-action-btn view-evidence"
                        onClick={() => {
                          const ev = records.find((r) => r.id === task.evidenceId);
                          if (ev) setSelected(ev);
                        }}
                      >
                        <Eye size={14} /> 查看证据
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="task-list-empty">
              <ClipboardList size={48} />
              <h3>暂无补强任务</h3>
              <p>
                {taskFilters.caseName || taskFilters.issue || taskFilters.overdueStatus !== 'all' || taskFilters.status !== 'all'
                  ? '当前筛选条件下没有匹配的任务，可尝试调整筛选条件'
                  : '在「需补强」的证据卡片上点击「生成任务」按钮，创建补强待办任务'}
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="insights">
        <div className="panel">
          <div className="panel-title">
            <CalendarDays size={18} />
            <h2>{appConfig.directory ? '证据目录预览' : appConfig.board ? '床位看板' : '分组视图'}</h2>
          </div>
          {appConfig.directory ? (
            <div className="directory">
              {Object.entries(directory).map(([issue, items]) => (
                <div key={issue} className="directory-group">
                  <strong>{issue}</strong>
                  {items.map((item, index) => (
                    <span key={item.id} className={item._masked ? 'masked-dir-entry' : ''}>
                      {index + 1}. {item.evidence}｜{item.purpose}
                      {item._masked && <em className="dir-masked-tag"><Shield size={10} />脱敏</em>}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="date-groups">
              {Object.entries(groupedByDate).map(([date, items]) => (
                <div key={date} className="date-group">
                  <strong>{date}</strong>
                  <span>{items.length}条记录</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="panel detail-panel">
          <div className="panel-title">
            <CheckCircle2 size={18} />
            <h2>详情</h2>
          </div>
          {displaySelected ? (
            <div className="detail">
              <h3>
                {displaySelected.evidence}
                {displaySelected._masked && <span className="masked-badge"><Shield size={12} />脱敏</span>}
              </h3>
              <p>{`${displaySelected.caseName} · ${displaySelected.issue} · ${displaySelected.level}`}</p>
              <p>{displaySelected.purpose}</p>
              {selected.temps && (
                <div className="temp-chart">
                  {selected.temps.map((value, index) => <i key={index} style={{ height: Math.max(10, 56 + Number(value) * 8) }} title={String(value)} />)}
                </div>
              )}
              <div className="timeline">
                {(selected.timeline || []).map((step, index) => (
                  <span key={index}>{step.at} · {step.status} · {step.by}</span>
                ))}
              </div>

              {!displaySelected._masked && (
                <div className="evidence-tasks-section">
                  <div className="evidence-tasks-header">
                    <AlertTriangle size={16} />
                    <span>关联补强任务</span>
                    {selected.status === '需补强' && (
                      <button
                        type="button"
                        className="add-task-inline-btn"
                        onClick={() => openCreateTaskFromEvidence(selected)}
                      >
                        <Plus size={14} /> 新增
                      </button>
                    )}
                  </div>

                  {tasksForSelectedEvidence.length > 0 ? (
                    <div className="evidence-tasks-list">
                      {tasksForSelectedEvidence.map((task) => {
                        const overdue = isTaskOverdue(task);
                        const daysLeft = getTaskDaysLeft(task);
                        const statusMeta = TASK_STATUS_META[task.status];
                        return (
                          <div
                            key={task.id}
                            className={`evidence-task-card ${overdue ? 'overdue' : ''}`}
                            style={{ borderColor: overdue ? '#fecaca' : statusMeta.border }}
                          >
                            <div className="evidence-task-head">
                              <span
                                className="task-status-badge"
                                style={{ background: statusMeta.color, color: '#fff' }}
                              >
                                {task.status}
                              </span>
                              {overdue && (
                                <span className="overdue-tag">
                                  <AlertCircle size={12} /> 逾期{daysLeft !== null ? ` ${Math.abs(daysLeft)}天` : ''}
                                </span>
                              )}
                              {!overdue && daysLeft !== null && task.status !== '已完成' && task.status !== '已取消' && daysLeft <= 3 && (
                                <span className="urgent-tag">
                                  <Clock size={12} /> 剩{daysLeft}天
                                </span>
                              )}
                            </div>
                            <div className="evidence-task-reason">{task.reason}</div>
                            <div className="evidence-task-meta">
                              <span><Briefcase size={12} /> 负责人：{task.assignee}</span>
                              <span><CalendarDays size={12} /> 截止：{task.deadline}</span>
                            </div>
                            <div className="evidence-task-actions">
                              {TASK_STATUSES.map((s) => (
                                <button
                                  key={s}
                                  type="button"
                                  className={`mini-status-btn ${task.status === s ? 'active' : ''}`}
                                  onClick={() => handleTaskStatusChange(task.id, s)}
                                  style={task.status === s ? { background: TASK_STATUS_META[s].color, color: '#fff', borderColor: TASK_STATUS_META[s].color } : {}}
                                >
                                  {s}
                                </button>
                              ))}
                              <button
                                type="button"
                                className="mini-edit-btn"
                                onClick={() => openEditTask(task)}
                              >
                                编辑
                              </button>
                              <button
                                type="button"
                                className="mini-delete-btn"
                                onClick={() => handleTaskDelete(task.id)}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="evidence-tasks-empty">
                      {selected.status === '需补强' ? (
                        <p>暂无补强任务，点击右上角「新增」创建</p>
                      ) : (
                        <p>该证据暂无需补强任务</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="empty">点击任意记录查看详情和状态流转。</p>
          )}
        </aside>
      </section>

      {showTaskModal && (
        <div className="modal-overlay" onClick={closeTaskModal}>
          <div className="modal task-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="panel-title" style={{ marginBottom: 0 }}>
                <AlertTriangle size={18} />
                <h2>{taskModalMode === 'create' ? '创建证据补强任务' : '编辑补强任务'}</h2>
              </div>
              <button type="button" className="icon-btn" onClick={closeTaskModal}>
                <X size={18} />
              </button>
            </div>

            <form className="modal-body" onSubmit={handleTaskFormSubmit}>
              <div className="task-form-section">
                <div className="task-form-evidence-info">
                  <div className="tfei-title">关联证据</div>
                  <div className="tfei-content">
                    <div className="tfei-row">
                      <span className="tfei-label"><FileText size={14} /> 证据材料：</span>
                      <span className="tfei-value tfei-evidence">{taskForm.evidenceName}</span>
                    </div>
                    <div className="tfei-row">
                      <span className="tfei-label"><Briefcase size={14} /> 案件：</span>
                      <span className="tfei-value">{taskForm.caseName}</span>
                    </div>
                    <div className="tfei-row">
                      <span className="tfei-label"><Target size={14} /> 争议点：</span>
                      <span className="tfei-value">{taskForm.issue || '未关联'}</span>
                    </div>
                  </div>
                </div>

                <div className="task-form-grid">
                  <label className="wide">
                    <span className="field-label-row">
                      <span>补强原因 <em className="required-tag">必填</em></span>
                    </span>
                    <textarea
                      value={taskForm.reason || ''}
                      onChange={(e) => setTaskForm({ ...taskForm, reason: e.target.value })}
                      placeholder="请详细描述需要补强的原因，如证据链不完整、证明力不足等"
                      rows={3}
                    />
                  </label>

                  <label>
                    <span className="field-label-row">
                      <span>负责人 <em className="required-tag">必填</em></span>
                    </span>
                    <input
                      type="text"
                      value={taskForm.assignee || ''}
                      onChange={(e) => setTaskForm({ ...taskForm, assignee: e.target.value })}
                      placeholder="请输入负责人姓名"
                    />
                  </label>

                  <label>
                    <span className="field-label-row">
                      <span>截止日期 <em className="required-tag">必填</em></span>
                    </span>
                    <input
                      type="date"
                      value={taskForm.deadline || ''}
                      onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                      min={today}
                    />
                  </label>

                  {taskModalMode === 'edit' && (
                    <label className="wide">
                      <span className="field-label-row">
                        <span>处理状态</span>
                      </span>
                      <div className="task-status-picker">
                        {TASK_STATUSES.map((s) => {
                          const meta = TASK_STATUS_META[s];
                          return (
                            <button
                              key={s}
                              type="button"
                              className={`status-picker-btn ${taskForm.status === s ? 'active' : ''}`}
                              onClick={() => setTaskForm({ ...taskForm, status: s })}
                              style={taskForm.status === s ? { background: meta.color, color: '#fff', borderColor: meta.color } : {}}
                            >
                              {s}
                            </button>
                          );
                        })}
                      </div>
                    </label>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="ghost-btn" onClick={closeTaskModal}>取消</button>
                <button
                  type="submit"
                  className="primary"
                >
                  <Check size={18} />
                  {taskModalMode === 'create' ? '创建任务' : '保存修改'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showImport && (
        <div className="modal-overlay" onClick={closeImport}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="panel-title" style={{ marginBottom: 0 }}>
                <FileSpreadsheet size={18} />
                <h2>批量导入CSV</h2>
              </div>
              <button type="button" className="icon-btn" onClick={closeImport}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="import-section">
                <label>
                  <span>粘贴CSV内容</span>
                  <textarea
                    className="import-textarea"
                    value={importText}
                    onChange={(e) => handleImportTextChange(e.target.value)}
                    placeholder={`案件,证据材料,来源,取得日期,证明目的,关联争议点,保密等级,当前状态
合同纠纷案,付款截图,委托人提供,2026-06-02,证明被告已收到预付款,付款事实,内部,已核对
合同纠纷案,聊天记录,微信导出,2026-06-06,证明交付期限变更,合同成立,机密,待核对`}
                  />
                </label>
                <p className="hint">
                  <Info size={14} /> 支持字段：案件、证据材料（必填）、来源、取得日期、证明目的、关联争议点、保密等级、当前状态。首行为表头。
                </p>
              </div>

              {importResult && importResult.hasData && (
                <>
                  <div className="import-summary">
                    <div className="summary-stat">
                      <div className="summary-icon ok"><Check size={16} /></div>
                      <div>
                        <span>总行数</span>
                        <strong>{importResult.rowCount}</strong>
                      </div>
                    </div>
                    <div className="summary-stat success">
                      <div className="summary-icon ok"><CheckCircle2 size={16} /></div>
                      <div>
                        <span>可导入</span>
                        <strong>{importResult.validRows.length}</strong>
                      </div>
                    </div>
                    <div className="summary-stat warning">
                      <div className="summary-icon warn"><AlertTriangle size={16} /></div>
                      <div>
                        <span>跳过</span>
                        <strong>{importResult.invalidRows.length}</strong>
                      </div>
                    </div>
                    <div className="summary-stat">
                      <div className="summary-icon info"><FileSpreadsheet size={16} /></div>
                      <div>
                        <span>识别字段</span>
                        <strong>{importResult.matchedFields.length} / 8</strong>
                      </div>
                    </div>
                  </div>

                  <div className="import-section">
                    <h3 className="section-title">
                      <Check size={16} /> 字段识别结果
                    </h3>
                    <div className="field-tags">
                      {ALL_FIELDS.map(key => {
                        const field = appConfig.fields.find(f => f.key === key);
                        const label = field?.label || (key === 'status' ? '当前状态' : key);
                        const matched = importResult.matchedFields.some(f => f.key === key);
                        const required = REQUIRED_FIELDS.includes(key);
                        return (
                          <span key={key} className={`field-tag ${matched ? 'matched' : 'missing'} ${required ? 'required' : ''}`}>
                            {matched ? <Check size={12} /> : <AlertCircle size={12} />}
                            {label}
                            {required && <em>*</em>}
                          </span>
                        );
                      })}
                    </div>
                    {importResult.unmatchedHeaders.length > 0 && (
                      <div className="unmatched-hint">
                        <AlertCircle size={14} /> 未识别列：
                        {importResult.unmatchedHeaders.map((h, i) => (
                          <code key={i}>{h}</code>
                        ))}
                      </div>
                    )}
                    {importResult.missingRequired.length > 0 && (
                      <div className="missing-alert">
                        <AlertTriangle size={16} /> 缺少必填字段：
                        {importResult.missingRequired.map(f => f.label).join('、')}，这些行将被跳过。
                      </div>
                    )}
                  </div>

                  {importResult.validRows.length > 0 && (
                    <div className="import-section">
                      <h3 className="section-title">
                        <CheckCircle2 size={16} /> 预览可导入记录 ({importResult.validRows.length}条)
                      </h3>
                      <div className="preview-table-wrap">
                        <table className="preview-table">
                          <thead>
                            <tr>
                              <th style={{ width: 50 }}>#</th>
                              {importResult.matchedFields.map(f => (
                                <th key={f.key}>{f.label}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {importResult.validRows.slice(0, 10).map((row, idx) => (
                              <tr key={idx}>
                                <td className="row-num">{row._rowNumber}</td>
                                {importResult.matchedFields.map(f => (
                                  <td key={f.key}>{row[f.key] || <span className="dim">-</span>}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {importResult.validRows.length > 10 && (
                        <p className="hint">...还有 {importResult.validRows.length - 10} 条记录未显示</p>
                      )}
                    </div>
                  )}

                  {importResult.invalidRows.length > 0 && (
                    <div className="import-section">
                      <h3 className="section-title warn-title">
                        <AlertTriangle size={16} /> 将被跳过的记录 ({importResult.invalidRows.length}条)
                      </h3>
                      <div className="preview-table-wrap">
                        <table className="preview-table invalid-table">
                          <thead>
                            <tr>
                              <th style={{ width: 50 }}>行号</th>
                              <th>跳过原因</th>
                            </tr>
                          </thead>
                          <tbody>
                            {importResult.invalidRows.slice(0, 5).map((row, idx) => (
                              <tr key={idx}>
                                <td className="row-num">{row._rowNumber}</td>
                                <td className="warn-text">缺少必填字段：{row._missingFields.join('、')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {importResult.invalidRows.length > 5 && (
                        <p className="hint">...还有 {importResult.invalidRows.length - 5} 条记录未显示</p>
                      )}
                    </div>
                  )}
                </>
              )}

              {importResult && !importResult.hasData && (
                <div className="empty-preview">
                  <FileSpreadsheet size={40} />
                  <p>请在上方粘贴CSV内容以预览导入结果</p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="ghost-btn" onClick={closeImport}>取消</button>
              <button
                type="button"
                className="primary"
                disabled={!importResult || importResult.validRows.length === 0}
                onClick={confirmImport}
              >
                <Check size={18} />
                确认导入 {importResult?.validRows.length > 0 ? `(${importResult.validRows.length}条)` : ''}
              </button>
            </div>
          </div>
        </div>
      )}

      {showExport && !showPrintPreview && (
        <div className="modal-overlay" onClick={closeExport}>
          <div className="modal export-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="panel-title" style={{ marginBottom: 0 }}>
                <FileText size={18} />
                <h2>导出证据目录</h2>
              </div>
              <button type="button" className="icon-btn" onClick={closeExport}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="export-config-section">
                <h3 className="section-title">
                  <Eye size={16} /> 导出设置
                </h3>
                <div className="export-config-grid">
                  <label>
                    <span>选择案件（可选）</span>
                    <div className="export-select-wrap">
                      <Briefcase size={16} />
                      <select
                        value={exportConfig.caseName}
                        onChange={(e) => setExportConfig({ ...exportConfig, caseName: e.target.value })}
                      >
                        <option value="">全部案件</option>
                        {caseNames.map((name) => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                      </select>
                    </div>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={exportConfig.hideConfidential}
                      onChange={(e) => setExportConfig({ ...exportConfig, hideConfidential: e.target.checked })}
                    />
                    <span>隐藏「机密」材料</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={exportConfig.groupByIssue}
                      onChange={(e) => setExportConfig({ ...exportConfig, groupByIssue: e.target.checked })}
                    />
                    <span>按案件和争议点分组</span>
                  </label>
                </div>
              </div>

              <div className="export-summary-section">
                <h3 className="section-title">
                  <BarChart3 size={16} /> 预览统计
                </h3>
                <div className="export-summary">
                  <div className="summary-stat">
                    <div className="summary-icon info"><FileSpreadsheet size={16} /></div>
                    <div>
                      <span>证据总数</span>
                      <strong>{exportStats.total}</strong>
                    </div>
                  </div>
                  <div className="summary-stat">
                    <div className="summary-icon ok"><Briefcase size={16} /></div>
                    <div>
                      <span>涉及案件</span>
                      <strong>{exportStats.cases}</strong>
                    </div>
                  </div>
                  <div className="summary-stat">
                    <div className="summary-icon info"><Target size={16} /></div>
                    <div>
                      <span>争议点数</span>
                      <strong>{exportStats.issues}</strong>
                    </div>
                  </div>
                  <div className="summary-stat warning">
                    <div className="summary-icon warn"><Shield size={16} /></div>
                    <div>
                      <span>机密材料</span>
                      <strong>{exportStats.confidentialCount}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="export-preview-section">
                <h3 className="section-title">
                  <Eye size={16} /> 内容预览
                </h3>
                {exportData.length > 0 ? (
                  <div className="export-preview-wrap">
                    <table className="export-preview-table">
                      <thead>
                        <tr>
                          <th style={{ width: 50 }}>序号</th>
                          <th>证据名称</th>
                          <th>来源</th>
                          <th>取得日期</th>
                          <th>证明目的</th>
                          <th>核对状态</th>
                          <th>保密等级</th>
                        </tr>
                      </thead>
                      <tbody>
                        {exportData.slice(0, 20).map((item, idx) => (
                          <tr key={item.id}>
                            <td className="row-num">{idx + 1}</td>
                            <td className="ev-name">{item.evidence}</td>
                            <td>{item.source || '-'}</td>
                            <td>{item.date || '-'}</td>
                            <td className="ev-purpose">{item.purpose || '-'}</td>
                            <td>
                              <span className={'status ' + statusClass(item.status)}>{item.status}</span>
                            </td>
                            <td>
                              <span className={'level-tag level-' + (item.level || '内部')}>
                                {item.level || '内部'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {exportData.length > 20 && (
                      <p className="hint" style={{ marginTop: 10 }}>
                        ...还有 {exportData.length - 20} 条记录未显示，完整内容请在打印预览中查看
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="empty-preview">
                    <FileSpreadsheet size={40} />
                    <p>当前筛选条件下没有可导出的证据记录</p>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="ghost-btn" onClick={closeExport}>取消</button>
              <button
                type="button"
                className="primary"
                disabled={exportData.length === 0}
                onClick={handlePrint}
              >
                <Printer size={18} />
                生成并打印
              </button>
            </div>
          </div>
        </div>
      )}

      {showPrintPreview && (
        <div className="print-preview-root">
          <div className="print-toolbar no-print">
            <button type="button" className="ghost-btn" onClick={() => setShowPrintPreview(false)}>
              <X size={16} /> 返回
            </button>
            <div className="print-toolbar-title">
              <FileText size={18} />
              证据目录打印预览
            </div>
            <button type="button" className="primary print-btn" onClick={() => window.print()}>
              <Printer size={18} />
              立即打印
            </button>
          </div>

          <div className="print-page">
            <div className="print-header">
              <div className="print-header-main">
                <Scale size={36} className="print-logo" />
                <div>
                  <h1 className="print-title">证据目录清单</h1>
                  <p className="print-subtitle">
                    {exportConfig.caseName ? `案件：${exportConfig.caseName}` : '全部案件证据汇总'}
                  </p>
                </div>
              </div>
              <div className="print-meta">
                <div className="print-meta-row">
                  <span>生成日期：</span>
                  <strong>{today}</strong>
                </div>
                <div className="print-meta-row">
                  <span>证据总数：</span>
                  <strong>{exportStats.total} 份</strong>
                </div>
                {exportConfig.hideConfidential && (
                  <div className="print-meta-row">
                    <span>备注：</span>
                    <strong style={{ color: '#dc2626' }}>已排除机密材料</strong>
                  </div>
                )}
              </div>
            </div>

            {exportConfig.groupByIssue ? (
              Object.entries(groupedExportData).map(([caseName, issues]) => (
                <section key={caseName} className="print-case-section">
                  <div className="print-case-title">
                    <Briefcase size={18} />
                    <h2>{caseName}</h2>
                    <span className="print-case-count">
                      共 {Object.values(issues).flat().length} 份证据
                    </span>
                  </div>

                  {Object.entries(issues).map(([issueName, items]) => (
                    <div key={issueName} className="print-issue-section">
                      <div className="print-issue-title">
                        <Target size={16} />
                        <h3>{issueName}</h3>
                        <span>{items.length} 份</span>
                      </div>
                      <table className="print-table">
                        <thead>
                          <tr>
                            <th style={{ width: '6%' }}>序号</th>
                            <th style={{ width: '18%' }}>证据名称</th>
                            <th style={{ width: '12%' }}>来源</th>
                            <th style={{ width: '12%' }}>取得日期</th>
                            <th style={{ width: '32%' }}>证明目的</th>
                            <th style={{ width: '10%' }}>核对状态</th>
                            <th style={{ width: '10%' }}>保密等级</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item, idx) => (
                            <tr key={item.id}>
                              <td className="pt-num">{idx + 1}</td>
                              <td className="pt-name">{item.evidence}</td>
                              <td>{item.source || '-'}</td>
                              <td>{item.date || '-'}</td>
                              <td className="pt-purpose">{item.purpose || '-'}</td>
                              <td>
                                <span className={'pt-status ps-' + (item.status || '待核对').replace(/待核对|已核对|需补强/g, (m) => ({'待核对':'a','已核对':'b','需补强':'c'}[m]))}>
                                  {item.status || '待核对'}
                                </span>
                              </td>
                              <td>
                                <span className={'pt-level pl-' + (item.level || '内部')}>
                                  {item.level || '内部'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </section>
              ))
            ) : (
              <section className="print-case-section">
                <div className="print-case-title">
                  <FileSpreadsheet size={18} />
                  <h2>全部证据</h2>
                  <span className="print-case-count">共 {exportData.length} 份证据</span>
                </div>
                <table className="print-table">
                  <thead>
                    <tr>
                      <th style={{ width: '6%' }}>序号</th>
                      <th style={{ width: '18%' }}>证据名称</th>
                      <th style={{ width: '10%' }}>案件</th>
                      <th style={{ width: '10%' }}>来源</th>
                      <th style={{ width: '10%' }}>取得日期</th>
                      <th style={{ width: '30%' }}>证明目的</th>
                      <th style={{ width: '8%' }}>核对状态</th>
                      <th style={{ width: '8%' }}>保密等级</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exportData.map((item, idx) => (
                      <tr key={item.id}>
                        <td className="pt-num">{idx + 1}</td>
                        <td className="pt-name">{item.evidence}</td>
                        <td>{item.caseName}</td>
                        <td>{item.source || '-'}</td>
                        <td>{item.date || '-'}</td>
                        <td className="pt-purpose">{item.purpose || '-'}</td>
                        <td>
                          <span className={'pt-status ps-' + (item.status || '待核对').replace(/待核对|已核对|需补强/g, (m) => ({'待核对':'a','已核对':'b','需补强':'c'}[m]))}>
                            {item.status || '待核对'}
                          </span>
                        </td>
                        <td>
                          <span className={'pt-level pl-' + (item.level || '内部')}>
                            {item.level || '内部'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}

            <div className="print-footer">
              <div className="print-footer-row">
                <span>编制人：____________________</span>
                <span>核对人：____________________</span>
                <span>编制日期：{today}</span>
              </div>
              <div className="print-footer-pagination">
                第 <span className="page-counter">1</span> 页 / 共 <span className="page-counter">1</span> 页
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
