import { ALL_FIELDS, isTaskOverdue } from './index';

export const FACT_NODE_STORAGE = 'hxwl-61310-fact-nodes';
export const REVIEW_STORAGE = 'hxwl-61310-review-checklist';

export const CURRENT_SCHEMA_VERSION = 1;

export const appConfig = {
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

export const today = new Date().toISOString().slice(0, 10);

export const MIGRATION_STORAGE_KEY = appConfig.storage + '-migration-history';
export const SNAPSHOT_PREFIX = appConfig.storage + '-snapshot-';

export const MIGRATIONS = [
  {
    from: 0,
    to: 1,
    description: '将旧版数组格式迁移为版本化对象，为每条记录补充createdAt时间戳',
    migrate(records) {
      return records.map((item) => ({
        ...item,
        createdAt: item.createdAt || item.date || new Date().toISOString(),
      }));
    },
  },
];

export const SCHEMA_VERSIONS = {
  0: { label: 'v0（无版本标记）', description: '旧版数据，数组格式，无schema版本字段', fields: ALL_FIELDS },
  1: { label: 'v1（初始版本化）', description: '引入schema版本号，数据包裹为版本化对象，增加createdAt时间戳', fields: [...ALL_FIELDS, 'createdAt'] },
};

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function withIds(items) {
  return items.map((item) => ({ ...item, id: item.id || uid(), timeline: item.timeline || [{ status: item.status, at: today, by: '系统' }] }));
}

export function ensureRecordIntegrity(items) {
  const seenIds = new Set();
  return items.map((item) => {
    let id = item.id;
    if (!id || seenIds.has(id)) {
      id = uid();
    }
    seenIds.add(id);
    return {
      ...item,
      id,
      timeline: item.timeline && Array.isArray(item.timeline) && item.timeline.length > 0
        ? item.timeline
        : [{ status: item.status || appConfig.primaryStatus, at: today, by: '系统' }],
    };
  });
}

export function createSnapshot(records, version) {
  const snapshotId = uid();
  const snapshotKey = SNAPSHOT_PREFIX + 'v' + version + '-' + snapshotId;
  const snapshotData = {
    version,
    records: JSON.parse(JSON.stringify(records)),
    timestamp: new Date().toISOString(),
    recordCount: records.length,
  };
  try {
    localStorage.setItem(snapshotKey, JSON.stringify(snapshotData));
    return { snapshotKey, snapshotId, success: true };
  } catch (e) {
    return { snapshotKey: null, snapshotId: null, success: false, error: e.message };
  }
}

export function loadSnapshot(snapshotKey) {
  try {
    const raw = localStorage.getItem(snapshotKey);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function deleteSnapshot(snapshotKey) {
  try {
    localStorage.removeItem(snapshotKey);
    return true;
  } catch {
    return false;
  }
}

export function listSnapshots() {
  const snapshots = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(SNAPSHOT_PREFIX)) {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        snapshots.push({ key, ...data });
      } catch {}
    }
  }
  return snapshots.sort((a, b) => (a.timestamp || '').localeCompare(b.timestamp || ''));
}

export function loadMigrationHistory() {
  try {
    const raw = localStorage.getItem(MIGRATION_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveMigrationHistory(history) {
  localStorage.setItem(MIGRATION_STORAGE_KEY, JSON.stringify(history));
}

export function addMigrationRecord(record) {
  const history = loadMigrationHistory();
  history.unshift({ id: uid(), ...record });
  saveMigrationHistory(history);
  return history;
}

export function runMigrations(records, fromVersion, toVersion) {
  let current = records;
  let currentVersion = fromVersion;
  const steps = [];
  while (currentVersion < toVersion) {
    const migration = MIGRATIONS.find((m) => m.from === currentVersion);
    if (!migration) {
      steps.push({ from: currentVersion, to: currentVersion + 1, status: 'failed', error: '未找到迁移脚本' });
      return { records: current, success: false, steps };
    }
    try {
      const snapshotResult = createSnapshot(current, currentVersion);
      const prev = JSON.parse(JSON.stringify(current));
      current = migration.migrate(current);
      steps.push({
        from: migration.from,
        to: migration.to,
        description: migration.description,
        status: 'success',
        snapshotKey: snapshotResult.snapshotKey,
        prevCount: prev.length,
        newCount: current.length,
      });
      currentVersion = migration.to;
    } catch (e) {
      steps.push({ from: currentVersion, to: currentVersion + 1, status: 'failed', error: e.message });
      return { records: current, success: false, steps };
    }
  }
  return { records: current, success: true, steps };
}

export function performRollback(snapshotKey) {
  const snapshot = loadSnapshot(snapshotKey);
  if (!snapshot) return { success: false, error: '快照不存在或已损坏' };
  const versionedData = {
    _schemaVersion: snapshot.version,
    records: snapshot.records,
  };
  try {
    localStorage.setItem(appConfig.storage, JSON.stringify(versionedData));
    return { success: true, records: snapshot.records, version: snapshot.version };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export function loadRecords() {
  const raw = localStorage.getItem(appConfig.storage);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && typeof parsed._schemaVersion === 'number') {
        const records = Array.isArray(parsed.records) ? parsed.records : [];
        if (parsed._schemaVersion < CURRENT_SCHEMA_VERSION) {
          const result = runMigrations(records, parsed._schemaVersion, CURRENT_SCHEMA_VERSION);
          if (result.success) {
            const migrated = result.records;
            addMigrationRecord({
              fromVersion: parsed._schemaVersion,
              toVersion: CURRENT_SCHEMA_VERSION,
              timestamp: new Date().toISOString(),
              status: 'success',
              steps: result.steps,
              recordCount: migrated.length,
            });
            const versionedData = { _schemaVersion: CURRENT_SCHEMA_VERSION, records: migrated };
            localStorage.setItem(appConfig.storage, JSON.stringify(versionedData));
            return ensureRecordIntegrity(migrated);
          } else {
            addMigrationRecord({
              fromVersion: parsed._schemaVersion,
              toVersion: CURRENT_SCHEMA_VERSION,
              timestamp: new Date().toISOString(),
              status: 'failed',
              steps: result.steps,
            });
            return ensureRecordIntegrity(records);
          }
        }
        return ensureRecordIntegrity(records);
      }
      if (Array.isArray(parsed)) {
        const snapshotResult = createSnapshot(parsed, 0);
        const result = runMigrations(parsed, 0, CURRENT_SCHEMA_VERSION);
        let migrated;
        if (result.success) {
          migrated = result.records;
          addMigrationRecord({
            fromVersion: 0,
            toVersion: CURRENT_SCHEMA_VERSION,
            timestamp: new Date().toISOString(),
            status: 'success',
            steps: result.steps,
            recordCount: migrated.length,
            snapshotKey: snapshotResult.snapshotKey,
          });
          const versionedData = { _schemaVersion: CURRENT_SCHEMA_VERSION, records: migrated };
          localStorage.setItem(appConfig.storage, JSON.stringify(versionedData));
        } else {
          addMigrationRecord({
            fromVersion: 0,
            toVersion: CURRENT_SCHEMA_VERSION,
            timestamp: new Date().toISOString(),
            status: 'failed',
            steps: result.steps,
            snapshotKey: snapshotResult.success ? snapshotResult.snapshotKey : null,
            error: result.steps.find((s) => s.status === 'failed')?.error,
          });
          migrated = parsed;
        }
        return ensureRecordIntegrity(migrated);
      }
      return withIds(appConfig.seed);
    } catch {
      return withIds(appConfig.seed);
    }
  }
  const seedRecords = withIds(appConfig.seed);
  const versionedData = { _schemaVersion: CURRENT_SCHEMA_VERSION, records: seedRecords };
  localStorage.setItem(appConfig.storage, JSON.stringify(versionedData));
  return seedRecords;
}

export function loadTemplates() {
  const raw = localStorage.getItem(appConfig.templateStorage);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && ('custom' in parsed || 'favorites' in parsed || 'recent' in parsed)) {
        return {
          custom: parsed.custom || {},
          favorites: parsed.favorites || {},
          recent: parsed.recent || {},
        };
      }
      return {
        custom: parsed || {},
        favorites: {},
        recent: {},
      };
    } catch {
      return { custom: {}, favorites: {}, recent: {} };
    }
  }
  return { custom: {}, favorites: {}, recent: {} };
}

export function saveTemplates(templateData) {
  localStorage.setItem(appConfig.templateStorage, JSON.stringify(templateData));
}

export function loadCustomIssues() {
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

export function saveCustomIssues(customIssues) {
  localStorage.setItem(appConfig.issueStorage, JSON.stringify(customIssues));
}

export function addCustomIssue(customIssues, caseName, issue) {
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

export function removeCustomIssue(customIssues, caseName, issue) {
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

export const TASK_STATUSES = ['待处理', '处理中', '已完成', '已取消'];
export const TASK_PRIMARY_STATUS = '待处理';
export const TASK_STATUS_META = {
  '待处理': { color: '#6b7280', bg: '#f3f4f6', border: '#d1d5db' },
  '处理中': { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  '已完成': { color: '#047857', bg: '#ecfdf3', border: '#a7f3d0' },
  '已取消': { color: '#9ca3af', bg: '#f9fafb', border: '#e5e7eb' },
};

export function loadTasks() {
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

export function saveTasks(tasks) {
  localStorage.setItem(appConfig.taskStorage, JSON.stringify(tasks));
}

export function addTask(tasks, taskData) {
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

export function updateTask(tasks, taskId, updates) {
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

export function removeTask(tasks, taskId) {
  const next = tasks.filter((task) => task.id !== taskId);
  saveTasks(next);
  return next;
}

export function loadFactNodes() {
  const raw = localStorage.getItem(FACT_NODE_STORAGE);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }
  return [];
}

export function saveFactNodes(nodes) {
  localStorage.setItem(FACT_NODE_STORAGE, JSON.stringify(nodes));
}

export function addFactNode(nodes, nodeData) {
  const newNode = {
    id: uid(),
    title: '',
    summary: '',
    issue: '',
    dateFrom: '',
    dateTo: '',
    caseName: '',
    evidenceIds: [],
    createdAt: new Date().toISOString(),
    ...nodeData,
  };
  const next = [...nodes, newNode];
  saveFactNodes(next);
  return next;
}

export function updateFactNode(nodes, nodeId, updates) {
  const next = nodes.map((node) =>
    node.id === nodeId ? { ...node, ...updates } : node
  );
  saveFactNodes(next);
  return next;
}

export function removeFactNode(nodes, nodeId) {
  const next = nodes.filter((node) => node.id !== nodeId);
  saveFactNodes(next);
  return next;
}

export function addEvidenceToFactNode(nodes, nodeId, evidenceId) {
  return updateFactNode(nodes, nodeId, {
    evidenceIds: [...(nodes.find((n) => n.id === nodeId)?.evidenceIds || []), evidenceId],
  });
}

export function removeEvidenceFromFactNode(nodes, nodeId, evidenceId) {
  const node = nodes.find((n) => n.id === nodeId);
  if (!node) return nodes;
  return updateFactNode(nodes, nodeId, {
    evidenceIds: node.evidenceIds.filter((id) => id !== evidenceId),
  });
}

export function getEvidenceFactNodeMap(nodes) {
  const map = {};
  nodes.forEach((node) => {
    node.evidenceIds.forEach((eid) => {
      map[eid] = node.id;
    });
  });
  return map;
}

export function loadReviewData() {
  try {
    const raw = localStorage.getItem(REVIEW_STORAGE);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveReviewData(data) {
  localStorage.setItem(REVIEW_STORAGE, JSON.stringify(data));
}

export function getReviewKey(caseName) {
  return caseName;
}

export function loadCaseReview(caseName) {
  const all = loadReviewData();
  return all[caseName] || null;
}

export function saveCaseReview(caseName, reviewState) {
  const all = loadReviewData();
  all[caseName] = reviewState;
  saveReviewData(all);
}
