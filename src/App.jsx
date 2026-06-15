import { useEffect, useMemo, useState } from 'react';
import { Scale, Plus, Search, Trash2, RotateCcw, CheckCircle2, AlertTriangle, ClipboardList, CalendarDays, Upload, FileSpreadsheet, X, Check, AlertCircle, Info, Briefcase, Clock, Shield, Target, ChevronDown, ChevronUp, BarChart3, Bookmark, BookmarkCheck, Printer, Eye, FileText, GitBranch, CircleDot, Filter, LayoutGrid, Layers, ListChecks, ArrowRight, ArrowRightLeft, Database, History, Download, Star, Settings, Link2, ArrowLeft } from 'lucide-react';
import './App.css';

const FACT_NODE_STORAGE = 'hxwl-61310-fact-nodes';

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

const CURRENT_SCHEMA_VERSION = 1;
const MIGRATION_STORAGE_KEY = appConfig.storage + '-migration-history';
const SNAPSHOT_PREFIX = appConfig.storage + '-snapshot-';

const MIGRATIONS = [
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

function createSnapshot(records, version) {
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

function loadSnapshot(snapshotKey) {
  try {
    const raw = localStorage.getItem(snapshotKey);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function deleteSnapshot(snapshotKey) {
  try {
    localStorage.removeItem(snapshotKey);
    return true;
  } catch {
    return false;
  }
}

function listSnapshots() {
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

function loadMigrationHistory() {
  try {
    const raw = localStorage.getItem(MIGRATION_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveMigrationHistory(history) {
  localStorage.setItem(MIGRATION_STORAGE_KEY, JSON.stringify(history));
}

function addMigrationRecord(record) {
  const history = loadMigrationHistory();
  history.unshift({ id: uid(), ...record });
  saveMigrationHistory(history);
  return history;
}

function runMigrations(records, fromVersion, toVersion) {
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

function performRollback(snapshotKey) {
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

function analyzeBackupImport(backupText, currentRecords) {
  if (!backupText || !backupText.trim()) {
    return { hasData: false };
  }
  let backupData;
  try {
    backupData = JSON.parse(backupText);
  } catch {
    return { hasData: true, parseError: true, errorDetail: '无法解析为有效JSON' };
  }
  let backupRecords;
  let backupSchemaVersion = 0;
  if (Array.isArray(backupData)) {
    backupRecords = backupData;
    backupSchemaVersion = 0;
  } else if (backupData && typeof backupData === 'object' && Array.isArray(backupData.records)) {
    backupRecords = backupData.records;
    backupSchemaVersion = backupData._schemaVersion || 0;
  } else {
    return { hasData: true, parseError: true, errorDetail: '数据格式不兼容：既不是数组也不是版本化对象' };
  }
  const backupFields = new Set();
  const backupFieldSample = {};
  backupRecords.slice(0, 20).forEach((r) => {
    Object.keys(r).forEach((k) => {
      if (k !== 'id' && k !== 'timeline' && !k.startsWith('_')) {
        backupFields.add(k);
        if (!backupFieldSample[k]) backupFieldSample[k] = r[k];
      }
    });
  });
  const currentFieldSet = new Set(ALL_FIELDS);
  const extraFields = [...backupFields].filter((f) => !currentFieldSet.has(f));
  const missingFields = [...currentFieldSet].filter((f) => !backupFields.has(f));
  const commonFields = [...backupFields].filter((f) => currentFieldSet.has(f));
  const currentIds = new Set(currentRecords.map((r) => r.id));
  const overlappingIds = backupRecords.filter((r) => r.id && currentIds.has(r.id));
  const currentCaseEvidence = new Set(currentRecords.map((r) => `${r.caseName}||${r.evidence}`));
  const overlappingContent = backupRecords.filter((r) => currentCaseEvidence.has(`${r.caseName}||${r.evidence}`));
  const backupCounts = {
    total: backupRecords.length,
    withId: backupRecords.filter((r) => r.id).length,
    withoutId: backupRecords.filter((r) => !r.id).length,
    withTimeline: backupRecords.filter((r) => r.timeline && Array.isArray(r.timeline)).length,
  };
  const overwriteRisk = overlappingIds.length > 0 || overlappingContent.length > 0;
  const riskLevel = overlappingIds.length > 0 ? 'high' : overlappingContent.length > 0 ? 'medium' : 'low';

  const currentIdMap = new Map(currentRecords.map((r) => [r.id, r]));
  const currentCaseEvidenceMap = new Map(currentRecords.map((r) => [`${r.caseName}||${r.evidence}`, r]));

  function analyzeStrategy(strategy) {
    const toAdd = [];
    const toOverwrite = [];
    const toSkip = [];
    const overwriteSamples = [];
    const addSamples = [];
    const skipSamples = [];
    const overwrittenIds = new Set();
    const newIdSet = new Set(currentRecords.map((r) => r.id));

    backupRecords.forEach((r) => {
      if (strategy === 'addOnly') {
        const hasIdConflict = r.id && currentIds.has(r.id);
        const hasContentConflict = currentCaseEvidence.has(`${r.caseName}||${r.evidence}`);
        if (hasIdConflict || hasContentConflict) {
          toSkip.push(r);
          if (skipSamples.length < 3) skipSamples.push(r);
        } else {
          toAdd.push(r);
          if (addSamples.length < 3) addSamples.push(r);
        }
      } else if (strategy === 'overwriteById') {
        if (r.id && currentIdMap.has(r.id) && !overwrittenIds.has(r.id)) {
          toOverwrite.push({ incoming: r, existing: currentIdMap.get(r.id) });
          overwrittenIds.add(r.id);
          if (overwriteSamples.length < 3) overwriteSamples.push({ incoming: r, existing: currentIdMap.get(r.id) });
        } else {
          let id = r.id;
          if (!id || newIdSet.has(id)) {
            id = uid();
          }
          newIdSet.add(id);
          toAdd.push(r);
          if (addSamples.length < 3) addSamples.push(r);
        }
      } else if (strategy === 'mergeByCaseEvidence') {
        const key = `${r.caseName}||${r.evidence}`;
        let matched = false;
        if (currentCaseEvidenceMap.has(key)) {
          const existing = currentCaseEvidenceMap.get(key);
          if (!overwrittenIds.has(existing.id)) {
            toOverwrite.push({ incoming: r, existing });
            overwrittenIds.add(existing.id);
            if (overwriteSamples.length < 3) overwriteSamples.push({ incoming: r, existing });
            matched = true;
          }
        }
        if (!matched && r.id && currentIdMap.has(r.id) && !overwrittenIds.has(r.id)) {
          const existing = currentIdMap.get(r.id);
          toOverwrite.push({ incoming: r, existing });
          overwrittenIds.add(r.id);
          if (overwriteSamples.length < 3) overwriteSamples.push({ incoming: r, existing });
          matched = true;
        }
        if (!matched) {
          let id = r.id;
          if (!id || newIdSet.has(id)) {
            id = uid();
          }
          newIdSet.add(id);
          toAdd.push(r);
          if (addSamples.length < 3) addSamples.push(r);
        }
      }
    });

    return {
      strategy,
      addCount: toAdd.length,
      overwriteCount: toOverwrite.length,
      skipCount: toSkip.length,
      addSamples,
      overwriteSamples,
      skipSamples,
    };
  }

  const strategyPreviews = {
    addOnly: analyzeStrategy('addOnly'),
    overwriteById: analyzeStrategy('overwriteById'),
    mergeByCaseEvidence: analyzeStrategy('mergeByCaseEvidence'),
  };

  return {
    hasData: true,
    parseError: false,
    backupSchemaVersion,
    backupRecords,
    fieldComparison: { extraFields, missingFields, commonFields },
    conflictAnalysis: { overlappingIds: overlappingIds.length, overlappingContent: overlappingContent.length, overwriteRisk, riskLevel },
    backupCounts,
    currentCount: currentRecords.length,
    strategyPreviews,
  };
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function withIds(items) {
  return items.map((item) => ({ ...item, id: item.id || uid(), timeline: item.timeline || [{ status: item.status, at: today, by: '系统' }] }));
}

function ensureRecordIntegrity(items) {
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

function loadRecords() {
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

function loadTemplates() {
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

function saveTemplates(templateData) {
  localStorage.setItem(appConfig.templateStorage, JSON.stringify(templateData));
}

function addCustomTemplate(templateData, issue, purpose) {
  const next = {
    custom: { ...templateData.custom },
    favorites: { ...templateData.favorites },
    recent: { ...templateData.recent },
  };
  if (!next.custom[issue]) {
    next.custom[issue] = [];
  }
  if (!next.custom[issue].includes(purpose)) {
    next.custom[issue] = [...next.custom[issue], purpose];
  }
  saveTemplates(next);
  return next;
}

function removeCustomTemplate(templateData, issue, purpose) {
  const next = {
    custom: { ...templateData.custom },
    favorites: { ...templateData.favorites },
    recent: { ...templateData.recent },
  };
  if (next.custom[issue]) {
    next.custom[issue] = next.custom[issue].filter((item) => item !== purpose);
    if (next.custom[issue].length === 0) {
      delete next.custom[issue];
    }
  }
  if (next.favorites[issue]) {
    next.favorites[issue] = next.favorites[issue].filter((item) => item !== purpose);
    if (next.favorites[issue].length === 0) {
      delete next.favorites[issue];
    }
  }
  if (next.recent[issue]) {
    delete next.recent[issue][purpose];
    if (Object.keys(next.recent[issue]).length === 0) {
      delete next.recent[issue];
    }
  }
  saveTemplates(next);
  return next;
}

function toggleFavorite(templateData, issue, purpose) {
  const next = {
    custom: { ...templateData.custom },
    favorites: { ...templateData.favorites },
    recent: { ...templateData.recent },
  };
  if (!next.favorites[issue]) {
    next.favorites[issue] = [];
  }
  if (next.favorites[issue].includes(purpose)) {
    next.favorites[issue] = next.favorites[issue].filter((item) => item !== purpose);
    if (next.favorites[issue].length === 0) {
      delete next.favorites[issue];
    }
  } else {
    next.favorites[issue] = [...next.favorites[issue], purpose];
  }
  saveTemplates(next);
  return next;
}

function isFavorite(templateData, issue, purpose) {
  return templateData.favorites?.[issue]?.includes(purpose) ?? false;
}

function recordRecentUse(templateData, issue, purpose) {
  const next = {
    custom: { ...templateData.custom },
    favorites: { ...templateData.favorites },
    recent: { ...templateData.recent },
  };
  if (!next.recent[issue]) {
    next.recent[issue] = {};
  }
  next.recent[issue] = { ...next.recent[issue], [purpose]: Date.now() };
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

function loadFactNodes() {
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

function saveFactNodes(nodes) {
  localStorage.setItem(FACT_NODE_STORAGE, JSON.stringify(nodes));
}

function addFactNode(nodes, nodeData) {
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

function updateFactNode(nodes, nodeId, updates) {
  const next = nodes.map((node) =>
    node.id === nodeId ? { ...node, ...updates } : node
  );
  saveFactNodes(next);
  return next;
}

function removeFactNode(nodes, nodeId) {
  const next = nodes.filter((node) => node.id !== nodeId);
  saveFactNodes(next);
  return next;
}

function addEvidenceToFactNode(nodes, nodeId, evidenceId) {
  return updateFactNode(nodes, nodeId, {
    evidenceIds: [...(nodes.find((n) => n.id === nodeId)?.evidenceIds || []), evidenceId],
  });
}

function removeEvidenceFromFactNode(nodes, nodeId, evidenceId) {
  const node = nodes.find((n) => n.id === nodeId);
  if (!node) return nodes;
  return updateFactNode(nodes, nodeId, {
    evidenceIds: node.evidenceIds.filter((id) => id !== evidenceId),
  });
}

function getEvidenceFactNodeMap(nodes) {
  const map = {};
  nodes.forEach((node) => {
    node.evidenceIds.forEach((eid) => {
      map[eid] = node.id;
    });
  });
  return map;
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

function getTaskType(task) {
  return task.taskType || (task.evidenceId ? 'evidence' : 'issue');
}

function getTaskSourceLabel(task) {
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

function buildCaseTaskBoard(tasks, records, customIssues) {
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
    if (isTaskOverdue(task)) cb.overdue += 1;

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
    if (isTaskOverdue(task)) cb.issues[issueName].overdue += 1;
    cb.issues[issueName].tasks.push(task);

    const assignee = task.assignee || '未分配';
    if (!cb.assignees[assignee]) {
      cb.assignees[assignee] = { name: assignee, total: 0, overdue: 0, pending: 0, inProgress: 0, completed: 0 };
    }
    cb.assignees[assignee].total += 1;
    if (isTaskOverdue(task)) cb.assignees[assignee].overdue += 1;
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

function buildIssueTaskBoard(tasks, records, customIssues) {
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
    if (isTaskOverdue(task)) ib.overdue += 1;
    ib.tasks.push(task);

    const caseName = task.caseName || '未分类案件';
    if (!ib.cases[caseName]) {
      ib.cases[caseName] = { name: caseName, total: 0, overdue: 0, pending: 0, inProgress: 0, completed: 0, tasks: [] };
    }
    ib.cases[caseName].total += 1;
    if (isTaskOverdue(task)) ib.cases[caseName].overdue += 1;
    if (task.status === '待处理') ib.cases[caseName].pending += 1;
    else if (task.status === '处理中') ib.cases[caseName].inProgress += 1;
    else if (task.status === '已完成') ib.cases[caseName].completed += 1;
    ib.cases[caseName].tasks.push(task);

    const assignee = task.assignee || '未分配';
    if (!ib.assignees[assignee]) {
      ib.assignees[assignee] = { name: assignee, total: 0, overdue: 0 };
    }
    ib.assignees[assignee].total += 1;
    if (isTaskOverdue(task)) ib.assignees[assignee].overdue += 1;
  });

  const issueList = Object.values(issueMap).map((i) => ({
    ...i,
    cases: Object.values(i.cases).sort((a, b) => b.total - a.total),
    assignees: Object.values(i.assignees).sort((a, b) => b.total - a.total),
  })).sort((a, b) => b.total - a.total);

  return issueList;
}

function buildAssigneeTaskBoard(tasks, records, customIssues) {
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
    if (isTaskOverdue(task)) ab.overdue += 1;
    ab.tasks.push(task);

    const caseName = task.caseName || '未分类案件';
    if (!ab.cases[caseName]) {
      ab.cases[caseName] = { name: caseName, total: 0, overdue: 0, pending: 0, inProgress: 0, completed: 0 };
    }
    ab.cases[caseName].total += 1;
    if (isTaskOverdue(task)) ab.cases[caseName].overdue += 1;
    if (task.status === '待处理') ab.cases[caseName].pending += 1;
    else if (task.status === '处理中') ab.cases[caseName].inProgress += 1;
    else if (task.status === '已完成') ab.cases[caseName].completed += 1;

    const issueName = task.issue || '未分类';
    if (!ab.issues[issueName]) {
      ab.issues[issueName] = { name: issueName, total: 0, overdue: 0 };
    }
    ab.issues[issueName].total += 1;
    if (isTaskOverdue(task)) ab.issues[issueName].overdue += 1;
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

function getAllTemplates(templateData) {
  const { custom = {}, favorites = {}, recent = {} } = templateData || {};
  const result = {};
  const allIssues = new Set([
    ...Object.keys(appConfig.purposeTemplates),
    ...Object.keys(custom),
  ]);

  allIssues.forEach((issue) => {
    const builtIn = appConfig.purposeTemplates[issue] || [];
    const userCustom = custom[issue] || [];
    const issueFavorites = favorites[issue] || [];
    const issueRecent = recent[issue] || {};

    const merged = [];
    const seen = new Set();

    [...builtIn, ...userCustom].forEach((item) => {
      if (!seen.has(item)) {
        seen.add(item);
        merged.push(item);
      }
    });

    merged.sort((a, b) => {
      const aFav = issueFavorites.includes(a) ? 1 : 0;
      const bFav = issueFavorites.includes(b) ? 1 : 0;
      if (aFav !== bFav) return bFav - aFav;

      const aRecent = issueRecent[a] || 0;
      const bRecent = issueRecent[b] || 0;
      if (aRecent !== bRecent) return bRecent - aRecent;

      const aBuiltIn = builtIn.includes(a) ? 0 : 1;
      const bBuiltIn = builtIn.includes(b) ? 0 : 1;
      if (aBuiltIn !== bBuiltIn) return aBuiltIn - bBuiltIn;

      return 0;
    });

    result[issue] = merged;
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

const SCHEMA_VERSIONS = {
  0: { label: 'v0（无版本标记）', description: '旧版数据，数组格式，无schema版本字段', fields: ALL_FIELDS },
  1: { label: 'v1（初始版本化）', description: '引入schema版本号，数据包裹为版本化对象，增加createdAt时间戳', fields: [...ALL_FIELDS, 'createdAt'] },
};

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

function buildImportPreview(text, customFieldMapping = {}) {
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
      fieldMapping: {},
      headers: [],
      rawRows: []
    };
  }

  const { headers, rows } = parseCSV(text);
  const fieldMapping = {};
  const matchedFields = [];
  const unmatchedHeaders = [];

  headers.forEach((header, index) => {
    let fieldKey = null;
    if (customFieldMapping[index] !== undefined && customFieldMapping[index] !== null) {
      fieldKey = customFieldMapping[index];
    } else {
      fieldKey = matchField(header);
    }
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
    fieldMapping,
    headers,
    rawRows: rows
  };
}

function App() {
  const [records, setRecords] = useState(loadRecords);
  const [form, setForm] = useState(appConfig.defaultValues);
  const [filters, setFilters] = useState({ query: '', status: '全部', caseName: '', issue: '', level: '' });
  const [selected, setSelected] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [importResult, setImportResult] = useState(null);
  const [customFieldMapping, setCustomFieldMapping] = useState({});
  const [showFieldMapper, setShowFieldMapper] = useState(false);
  const [selectedCaseName, setSelectedCaseName] = useState('');
  const [templateData, setTemplateData] = useState(loadTemplates);
  const [showTemplatePanel, setShowTemplatePanel] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [exportConfig, setExportConfig] = useState({
    caseName: '',
    exportLevel: '机密',
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
    taskType: 'evidence',
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
  const [boardExpandedCases, setBoardExpandedCases] = useState({});
  const [boardExpandedIssues, setBoardExpandedIssues] = useState({});
  const [boardExpandedIssueCases, setBoardExpandedIssueCases] = useState({});
  const [boardExpandedAssignees, setBoardExpandedAssignees] = useState({});
  const [boardExpandedAssigneeCases, setBoardExpandedAssigneeCases] = useState({});
  const [showDataMgmt, setShowDataMgmt] = useState(false);
  const [dataMgmtTab, setDataMgmtTab] = useState('version');
  const [backupImportText, setBackupImportText] = useState('');
  const [backupImportAnalysis, setBackupImportAnalysis] = useState(null);
  const [mergeStrategy, setMergeStrategy] = useState('addOnly');
  const [showEvidencePicker, setShowEvidencePicker] = useState(false);
  const [evidencePickerSearch, setEvidencePickerSearch] = useState('');
  const [rollbackStatus, setRollbackStatus] = useState(null);
  const [taskViewMode, setTaskViewMode] = useState('list');
  const [boardGroupBy, setBoardGroupBy] = useState('case');
  const [boardFilterOverdue, setBoardFilterOverdue] = useState(false);
  const [taskContext, setTaskContext] = useState(null);
  const [multiEvidenceIds, setMultiEvidenceIds] = useState([]);
  const [factNodes, setFactNodes] = useState(loadFactNodes);
  const [timelineViewMode, setTimelineViewMode] = useState('date');
  const [showFactNodeModal, setShowFactNodeModal] = useState(false);
  const [factNodeModalMode, setFactNodeModalMode] = useState('create');
  const [editingFactNodeId, setEditingFactNodeId] = useState(null);
  const [factNodeForm, setFactNodeForm] = useState({
    title: '',
    summary: '',
    issue: '',
    dateFrom: '',
    dateTo: '',
  });
  const [expandedFactNodes, setExpandedFactNodes] = useState({});
  const [draggedEvidenceId, setDraggedEvidenceId] = useState(null);
  const [dragOverNodeId, setDragOverNodeId] = useState(null);
  const [factNodeSource, setFactNodeSource] = useState(null);

  const DATA_MGMT_TABS = [
    { key: 'version', label: '版本信息', icon: Database },
    { key: 'history', label: '迁移历史', icon: History },
    { key: 'backup', label: '备份导入', icon: Download },
    { key: 'recovery', label: '恢复', icon: RotateCcw },
  ];

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
    localStorage.setItem(appConfig.storage, JSON.stringify({ _schemaVersion: CURRENT_SCHEMA_VERSION, records: next }));
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
    setImportResult(buildImportPreview(value, customFieldMapping));
  }

  function handleFieldMappingChange(colIndex, fieldKey) {
    const newMapping = { ...customFieldMapping };
    if (fieldKey === null || fieldKey === '') {
      delete newMapping[colIndex];
    } else {
      Object.keys(newMapping).forEach(key => {
        if (newMapping[key] === fieldKey) {
          delete newMapping[key];
        }
      });
      newMapping[colIndex] = fieldKey;
    }
    setCustomFieldMapping(newMapping);
    setImportResult(buildImportPreview(importText, newMapping));
  }

  function resetFieldMapping() {
    setCustomFieldMapping({});
    setImportResult(buildImportPreview(importText, {}));
  }

  function openImport() {
    setShowImport(true);
    setImportText('');
    setImportResult(null);
    setCustomFieldMapping({});
    setShowFieldMapper(false);
  }

  function closeImport() {
    setShowImport(false);
    setImportText('');
    setImportResult(null);
    setCustomFieldMapping({});
    setShowFieldMapper(false);
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
    const issue = form.issue || appConfig.defaultValues.issue;
    const next = recordRecentUse(templateData, issue, purpose);
    setTemplateData(next);
  }

  function handleSaveTemplate() {
    if (!form.purpose || !form.purpose.trim()) return;
    const issue = form.issue || appConfig.defaultValues.issue;
    const next = addCustomTemplate(templateData, issue, form.purpose.trim());
    setTemplateData(next);
  }

  function handleRemoveTemplate(issue, purpose) {
    const next = removeCustomTemplate(templateData, issue, purpose);
    setTemplateData(next);
  }

  function handleToggleFavorite(issue, purpose) {
    const next = toggleFavorite(templateData, issue, purpose);
    setTemplateData(next);
  }

  const allTemplates = useMemo(() => getAllTemplates(templateData), [templateData]);
  const currentTemplates = allTemplates[form.issue] || [];

  const allIssues = useMemo(() => {
    const issues = new Set();
    records.forEach((item) => {
      if (item.issue) issues.add(item.issue);
    });
    return [...issues];
  }, [records]);

  const allLevels = useMemo(() => {
    const levelField = appConfig.fields.find((f) => f.key === 'level');
    return levelField?.options || [];
  }, []);

  const filteredRecords = useMemo(() => {
    return records
      .filter((item) => !filters.query || getSearchableText(item, viewMode).includes(filters.query))
      .filter((item) => filters.status === '全部' || item.status === filters.status)
      .filter((item) => !filters.caseName || item.caseName === filters.caseName)
      .filter((item) => !filters.issue || item.issue === filters.issue)
      .filter((item) => !filters.level || item.level === filters.level)
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

  const hasActiveFilters = filters.query || filters.status !== '全部' || filters.caseName || filters.issue || filters.level || selectedIssueFilter;

  function clearAllFilters() {
    setFilters({ query: '', status: '全部', caseName: '', issue: '', level: '' });
    setSelectedIssueFilter('');
  }

  useEffect(() => {
    if (selected) {
      const stillVisible = filteredRecords.some((r) => r.id === selected.id);
      if (!stillVisible) {
        setSelected(null);
      }
    }
  }, [filteredRecords, selected]);

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
    const visibleRecords = displayRecords;
    return visibleRecords.reduce((acc, item) => {
      const key = item.issue || '未分类';
      (acc[key] ||= []).push(item);
      return acc;
    }, {});
  }, [displayRecords]);

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
      evidenceIds: [evidence.id],
      caseName: evidence.caseName,
      evidenceName: evidence.evidence,
      issue: evidence.issue,
      reason: '',
      assignee: '',
      deadline: '',
      status: TASK_PRIMARY_STATUS,
      taskType: 'evidence',
    });
    setTaskModalMode('create');
    setEditingTaskId(null);
    setTaskContext({ source: 'evidence', evidenceId: evidence.id, caseName: evidence.caseName, issue: evidence.issue });
    setMultiEvidenceIds([evidence.id]);
    setShowTaskModal(true);
  }

  function openCreateTaskFromIssue(caseName, issue, sourceTab) {
    const issueRecords = records.filter((r) => r.caseName === caseName && r.issue === issue);
    const strengthenRecords = issueRecords.filter((r) => r.status === '需补强');
    const primaryEvidence = strengthenRecords[0] || issueRecords[0];
    const defaultReason = issueRecords.length === 0 ? `争议点「${issue}」尚无任何证据材料，需补充证据` : `争议点「${issue}」存在${strengthenRecords.length}项需补强证据，需进一步补强`;
    const evIds = strengthenRecords.length > 0 ? strengthenRecords.map((r) => r.id) : (primaryEvidence ? [primaryEvidence.id] : []);
    setTaskForm({
      evidenceId: primaryEvidence?.id || '',
      evidenceIds: evIds,
      caseName,
      evidenceName: primaryEvidence?.evidence || '',
      issue,
      reason: defaultReason,
      assignee: '',
      deadline: '',
      status: TASK_PRIMARY_STATUS,
      taskType: 'issue',
    });
    setTaskModalMode('create');
    setEditingTaskId(null);
    setTaskContext({ source: sourceTab || 'coverage', caseName, issue, evidenceId: primaryEvidence?.id || '' });
    setMultiEvidenceIds(evIds);
    setShowTaskModal(true);
  }

  function openEditTask(task) {
    setTaskForm({
      evidenceId: task.evidenceId,
      evidenceIds: task.evidenceIds || (task.evidenceId ? [task.evidenceId] : []),
      caseName: task.caseName,
      evidenceName: task.evidenceName,
      issue: task.issue,
      reason: task.reason,
      assignee: task.assignee,
      deadline: task.deadline,
      status: task.status,
      taskType: task.taskType || (task.evidenceId ? 'evidence' : 'issue'),
    });
    setTaskModalMode('edit');
    setEditingTaskId(task.id);
    setTaskContext(task.sourceContext || null);
    setMultiEvidenceIds(task.evidenceIds || (task.evidenceId ? [task.evidenceId] : []));
    setShowTaskModal(true);
  }

  function closeTaskModal() {
    setShowTaskModal(false);
    setTaskModalMode('create');
    setEditingTaskId(null);
    setTaskForm({
      evidenceId: '',
      evidenceIds: [],
      caseName: '',
      evidenceName: '',
      issue: '',
      reason: '',
      assignee: '',
      deadline: '',
      status: TASK_PRIMARY_STATUS,
      taskType: 'evidence',
    });
    setTaskContext(null);
    setMultiEvidenceIds([]);
  }

  function handleTaskFormSubmit(event) {
    event.preventDefault();
    if (taskForm.taskType === 'issue' && (!taskForm.caseName || !taskForm.issue || !taskForm.reason.trim() || !taskForm.assignee.trim() || !taskForm.deadline)) {
      alert('请填写完整的任务信息（案件、争议点、补强原因、负责人、截止日期为必填）');
      return;
    }
    if (taskForm.taskType === 'evidence' && (!taskForm.evidenceId || !taskForm.reason.trim() || !taskForm.assignee.trim() || !taskForm.deadline)) {
      alert('请填写完整的任务信息（补强原因、负责人、截止日期为必填）');
      return;
    }
    if (taskModalMode === 'create') {
      const next = addTask(tasks, { ...taskForm, evidenceIds: multiEvidenceIds, sourceContext: taskContext });
      setTasks(next);
      if (taskContext) {
        setSelectedTaskId(next[0].id);
      }
    } else if (taskModalMode === 'edit' && editingTaskId) {
      const next = updateTask(tasks, editingTaskId, { ...taskForm, evidenceIds: multiEvidenceIds, sourceContext: taskContext });
      setTasks(next);
    }
    closeTaskModal();
  }

  function navigateToTaskContext(task) {
    const ctx = task.sourceContext;
    const caseName = ctx?.caseName || task.caseName;
    const evidenceId = ctx?.evidenceId || task.evidenceId;
    const issue = ctx?.issue || task.issue;

    if (caseName) {
      setSelectedCaseName(caseName);
      setWorkbenchCase(caseName);
    }

    if (evidenceId) {
      const ev = records.find((r) => r.id === evidenceId);
      if (ev) setSelected(ev);
    }

    if (!ctx) {
      if (caseName) {
        setWorkbenchTab('coverage');
      }
      return;
    }

    if (ctx.source === 'coverage' || ctx.source === 'workbench-coverage') {
      setWorkbenchTab('coverage');
    } else if (ctx.source === 'board-case' || ctx.source === 'board-issue') {
      setWorkbenchTab('tasks');
      setTaskViewMode('board');
      if (ctx.source === 'board-case') {
        setBoardGroupBy('case');
      } else {
        setBoardGroupBy('issue');
      }
    } else if (ctx.source === 'evidence') {
      if (evidenceId) {
        const ev = records.find((r) => r.id === evidenceId);
        if (ev) setSelected(ev);
      }
    }
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

  const filteredBoardTasks = useMemo(() => {
    if (!boardFilterOverdue) return tasks;
    return tasks.filter((t) => isTaskOverdue(t));
  }, [tasks, boardFilterOverdue]);

  const filteredCaseBoard = useMemo(() => buildCaseTaskBoard(filteredBoardTasks, records, customIssues), [filteredBoardTasks, records, customIssues]);
  const filteredIssueBoard = useMemo(() => buildIssueTaskBoard(filteredBoardTasks, records, customIssues), [filteredBoardTasks, records, customIssues]);
  const filteredAssigneeBoard = useMemo(() => buildAssigneeTaskBoard(filteredBoardTasks, records, customIssues), [filteredBoardTasks, records, customIssues]);

  const wbRecords = useMemo(() => {
    if (!workbenchCase) return [];
    return records.filter((r) => r.caseName === workbenchCase);
  }, [records, workbenchCase]);

  const wbIssueOptions = useMemo(() => {
    if (!workbenchCase) return [];
    const issues = new Set();
    wbRecords.forEach((item) => {
      if (item.issue) issues.add(item.issue);
    });
    return [...issues];
  }, [wbRecords, workbenchCase]);

  const wbFilteredRecords = useMemo(() => {
    return wbRecords
      .filter((item) => !filters.query || `${item.caseName}${item.evidence}${item.issue}`.includes(filters.query))
      .filter((item) => filters.status === '全部' || item.status === filters.status)
      .filter((item) => !filters.issue || item.issue === filters.issue)
      .filter((item) => !filters.level || item.level === filters.level);
  }, [wbRecords, filters]);

  const wbDisplayRecords = useMemo(() => getProcessedRecords(wbRecords, viewMode), [wbRecords, viewMode]);
  const wbFilteredDisplayRecords = useMemo(() => getProcessedRecords(wbFilteredRecords, viewMode), [wbFilteredRecords, viewMode]);

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

  const wbFactNodeTimelineData = useMemo(() => {
    if (!workbenchCase) return [];

    const caseRecords = wbDisplayRecords.filter(item => item.caseName === workbenchCase);
    const caseFactNodes = factNodes.filter(n => n.caseName === workbenchCase);
    const evidenceNodeMap = getEvidenceFactNodeMap(caseFactNodes);

    const unassignedEvidence = caseRecords.filter(item => !evidenceNodeMap[item.id]);
    const unassignedWithDate = unassignedEvidence.filter(item => item.date);
    const unassignedWithoutDate = unassignedEvidence.filter(item => !item.date);

    const result = [];

    caseFactNodes.forEach(node => {
      const nodeEvidence = caseRecords.filter(r => node.evidenceIds.includes(r.id));
      const sortedEvidence = nodeEvidence.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
      let nodeDate = node.dateFrom;
      if (!nodeDate && sortedEvidence.length > 0) {
        nodeDate = sortedEvidence[0].date;
      }
      result.push({
        type: 'factNode',
        id: node.id,
        node,
        date: nodeDate || '未标注日期',
        items: sortedEvidence,
        isNoDate: !nodeDate,
      });
    });

    result.sort((a, b) => {
      if (a.isNoDate && b.isNoDate) return 0;
      if (a.isNoDate) return 1;
      if (b.isNoDate) return -1;
      return a.date.localeCompare(b.date);
    });

    const unassignedGrouped = {};
    unassignedWithDate.forEach(item => {
      const key = item.date;
      (unassignedGrouped[key] ||= []).push(item);
    });
    const sortedUnassignedDates = Object.keys(unassignedGrouped).sort();
    sortedUnassignedDates.forEach(date => {
      result.push({
        type: 'dateGroup',
        date,
        items: unassignedGrouped[date],
        isNoDate: false,
      });
    });

    if (unassignedWithoutDate.length > 0) {
      result.push({
        type: 'dateGroup',
        date: '未标注日期',
        items: unassignedWithoutDate,
        isNoDate: true,
      });
    }

    return result.sort((a, b) => {
      if (a.isNoDate && b.isNoDate) return 0;
      if (a.isNoDate) return 1;
      if (b.isNoDate) return -1;
      return a.date.localeCompare(b.date);
    });
  }, [wbDisplayRecords, workbenchCase, factNodes]);

  const [wbTimelineViewMode, setWbTimelineViewMode] = useState('date');
  const [wbExpandedFactNodes, setWbExpandedFactNodes] = useState({});
  const [wbDragOverNodeId, setWbDragOverNodeId] = useState(null);

  function toggleWbFactNodeExpand(nodeId) {
    setWbExpandedFactNodes({
      ...wbExpandedFactNodes,
      [nodeId]: !wbExpandedFactNodes[nodeId],
    });
  }

  function handleWbDragOver(e, nodeId) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setWbDragOverNodeId(nodeId);
  }

  function handleWbDragLeave() {
    setWbDragOverNodeId(null);
  }

  function handleWbDropOnNode(e, nodeId) {
    e.preventDefault();
    if (!draggedEvidenceId) return;

    const evidenceNodeMap = getEvidenceFactNodeMap(factNodes);
    const currentNodeId = evidenceNodeMap[draggedEvidenceId];

    let next = factNodes;
    if (currentNodeId && currentNodeId !== nodeId) {
      next = removeEvidenceFromFactNode(next, currentNodeId, draggedEvidenceId);
    }
    if (currentNodeId !== nodeId) {
      next = addEvidenceToFactNode(next, nodeId, draggedEvidenceId);
    }

    setFactNodes(next);
    setDraggedEvidenceId(null);
    setWbDragOverNodeId(null);
  }

  function handleWbDropOnUngrouped(e) {
    e.preventDefault();
    if (!draggedEvidenceId) return;

    const evidenceNodeMap = getEvidenceFactNodeMap(factNodes);
    const currentNodeId = evidenceNodeMap[draggedEvidenceId];

    if (currentNodeId) {
      const next = removeEvidenceFromFactNode(factNodes, currentNodeId, draggedEvidenceId);
      setFactNodes(next);
    }

    setDraggedEvidenceId(null);
    setWbDragOverNodeId(null);
  }

  function openWbCreateFactNode() {
    setFactNodeModalMode('create');
    setEditingFactNodeId(null);
    setFactNodeSource('workbench');
    setFactNodeForm({
      title: '',
      summary: '',
      issue: '',
      dateFrom: '',
      dateTo: '',
    });
    setShowFactNodeModal(true);
  }

  function openWbEditFactNode(node) {
    setFactNodeModalMode('edit');
    setEditingFactNodeId(node.id);
    setFactNodeSource('workbench');
    setFactNodeForm({
      title: node.title || '',
      summary: node.summary || '',
      issue: node.issue || '',
      dateFrom: node.dateFrom || '',
      dateTo: node.dateTo || '',
    });
    setShowFactNodeModal(true);
  }

  function handleWbDeleteFactNode(nodeId) {
    if (!confirm('确定要删除此事实节点吗？节点下的证据不会被删除。')) return;
    const next = removeFactNode(factNodes, nodeId);
    setFactNodes(next);
  }

  function handleWbRemoveEvidenceFromNode(nodeId, evidenceId) {
    const next = removeEvidenceFromFactNode(factNodes, nodeId, evidenceId);
    setFactNodes(next);
  }

  const wbTasks = useMemo(() => {
    if (!workbenchCase) return [];
    return tasks.filter((t) => t.caseName === workbenchCase);
  }, [tasks, workbenchCase]);

  const wbExportData = useMemo(() => {
    if (!workbenchCase) return [];
    return getProcessedRecords(wbFilteredRecords, exportConfig.exportLevel);
  }, [wbFilteredRecords, workbenchCase, exportConfig.exportLevel]);

  const wbDirectory = useMemo(() => {
    if (!workbenchCase) return {};
    const visibleRecords = wbExportData;
    return visibleRecords.reduce((acc, item) => {
      const key = item.issue || '未分类';
      (acc[key] ||= []).push(item);
      return acc;
    }, {});
  }, [wbExportData, workbenchCase]);

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

  const factNodeTimelineData = useMemo(() => {
    if (!selectedCaseName) return [];

    const caseRecords = displayRecords.filter(item => item.caseName === selectedCaseName);
    const caseFactNodes = factNodes.filter(n => n.caseName === selectedCaseName);
    const evidenceNodeMap = getEvidenceFactNodeMap(caseFactNodes);

    const unassignedEvidence = caseRecords.filter(item => !evidenceNodeMap[item.id]);
    const unassignedWithDate = unassignedEvidence.filter(item => item.date);
    const unassignedWithoutDate = unassignedEvidence.filter(item => !item.date);

    const result = [];

    caseFactNodes.forEach(node => {
      const nodeEvidence = caseRecords.filter(r => node.evidenceIds.includes(r.id));
      const sortedEvidence = nodeEvidence.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
      let nodeDate = node.dateFrom;
      if (!nodeDate && sortedEvidence.length > 0) {
        nodeDate = sortedEvidence[0].date;
      }
      result.push({
        type: 'factNode',
        id: node.id,
        node,
        date: nodeDate || '未标注日期',
        items: sortedEvidence,
        isNoDate: !nodeDate,
      });
    });

    result.sort((a, b) => {
      if (a.isNoDate && b.isNoDate) return 0;
      if (a.isNoDate) return 1;
      if (b.isNoDate) return -1;
      return a.date.localeCompare(b.date);
    });

    const unassignedGrouped = {};
    unassignedWithDate.forEach(item => {
      const key = item.date;
      (unassignedGrouped[key] ||= []).push(item);
    });
    const sortedUnassignedDates = Object.keys(unassignedGrouped).sort();
    sortedUnassignedDates.forEach(date => {
      result.push({
        type: 'dateGroup',
        date,
        items: unassignedGrouped[date],
        isNoDate: false,
      });
    });

    if (unassignedWithoutDate.length > 0) {
      result.push({
        type: 'dateGroup',
        date: '未标注日期',
        items: unassignedWithoutDate,
        isNoDate: true,
      });
    }

    return result.sort((a, b) => {
      if (a.isNoDate && b.isNoDate) return 0;
      if (a.isNoDate) return 1;
      if (b.isNoDate) return -1;
      return a.date.localeCompare(b.date);
    });
  }, [displayRecords, selectedCaseName, factNodes]);

  function openCreateFactNode() {
    setFactNodeModalMode('create');
    setEditingFactNodeId(null);
    setFactNodeSource('main');
    setFactNodeForm({
      title: '',
      summary: '',
      issue: '',
      dateFrom: '',
      dateTo: '',
    });
    setShowFactNodeModal(true);
  }

  function openEditFactNode(node) {
    setFactNodeModalMode('edit');
    setEditingFactNodeId(node.id);
    setFactNodeSource(node.caseName === workbenchCase ? 'workbench' : 'main');
    setFactNodeForm({
      title: node.title || '',
      summary: node.summary || '',
      issue: node.issue || '',
      dateFrom: node.dateFrom || '',
      dateTo: node.dateTo || '',
    });
    setShowFactNodeModal(true);
  }

  function closeFactNodeModal() {
    setShowFactNodeModal(false);
    setEditingFactNodeId(null);
    setFactNodeSource(null);
  }

  function handleFactNodeFormChange(key, value) {
    setFactNodeForm({ ...factNodeForm, [key]: value });
  }

  function confirmFactNode() {
    if (factNodeModalMode === 'create') {
      const targetCaseName = factNodeSource === 'workbench' ? workbenchCase : selectedCaseName;
      const next = addFactNode(factNodes, {
        ...factNodeForm,
        caseName: targetCaseName,
      });
      setFactNodes(next);
    } else if (factNodeModalMode === 'edit' && editingFactNodeId) {
      const next = updateFactNode(factNodes, editingFactNodeId, factNodeForm);
      setFactNodes(next);
    }
    closeFactNodeModal();
  }

  function handleDeleteFactNode(nodeId) {
    if (!confirm('确定要删除此事实节点吗？节点下的证据不会被删除。')) return;
    const next = removeFactNode(factNodes, nodeId);
    setFactNodes(next);
  }

  function toggleFactNodeExpand(nodeId) {
    setExpandedFactNodes({
      ...expandedFactNodes,
      [nodeId]: !expandedFactNodes[nodeId],
    });
  }

  function handleDragStart(e, evidenceId) {
    setDraggedEvidenceId(evidenceId);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragEnd() {
    setDraggedEvidenceId(null);
    setDragOverNodeId(null);
  }

  function handleDragOver(e, nodeId) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverNodeId(nodeId);
  }

  function handleDragLeave() {
    setDragOverNodeId(null);
  }

  function handleDropOnNode(e, nodeId) {
    e.preventDefault();
    if (!draggedEvidenceId) return;

    const evidenceNodeMap = getEvidenceFactNodeMap(factNodes);
    const currentNodeId = evidenceNodeMap[draggedEvidenceId];

    let next = factNodes;
    if (currentNodeId && currentNodeId !== nodeId) {
      next = removeEvidenceFromFactNode(next, currentNodeId, draggedEvidenceId);
    }
    if (currentNodeId !== nodeId) {
      next = addEvidenceToFactNode(next, nodeId, draggedEvidenceId);
    }

    setFactNodes(next);
    setDraggedEvidenceId(null);
    setDragOverNodeId(null);
  }

  function handleDropOnUngrouped(e) {
    e.preventDefault();
    if (!draggedEvidenceId) return;

    const evidenceNodeMap = getEvidenceFactNodeMap(factNodes);
    const currentNodeId = evidenceNodeMap[draggedEvidenceId];

    if (currentNodeId) {
      const next = removeEvidenceFromFactNode(factNodes, currentNodeId, draggedEvidenceId);
      setFactNodes(next);
    }

    setDraggedEvidenceId(null);
    setDragOverNodeId(null);
  }

  function handleRemoveEvidenceFromNode(nodeId, evidenceId) {
    const next = removeEvidenceFromFactNode(factNodes, nodeId, evidenceId);
    setFactNodes(next);
  }

  function openDataMgmt() {
    setShowDataMgmt(true);
    setDataMgmtTab('version');
    setBackupImportText('');
    setBackupImportAnalysis(null);
    setRollbackStatus(null);
  }

  function closeDataMgmt() {
    setShowDataMgmt(false);
    setBackupImportText('');
    setBackupImportAnalysis(null);
    setMergeStrategy('addOnly');
    setRollbackStatus(null);
  }

  function handleBackupTextChange(value) {
    setBackupImportText(value);
    setBackupImportAnalysis(analyzeBackupImport(value, records));
  }

  function handleBackupFileUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setBackupImportText(text);
      setBackupImportAnalysis(analyzeBackupImport(text, records));
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  function prepareIncomingRecord(r, strategy, by) {
    return {
      ...r,
      id: r.id || uid(),
      status: r.status || appConfig.primaryStatus,
      timeline: r.timeline && Array.isArray(r.timeline) && r.timeline.length > 0
        ? r.timeline
        : [{ status: r.status || appConfig.primaryStatus, at: today, by }],
      createdAt: r.createdAt || new Date().toISOString(),
    };
  }

  function confirmMergeImport() {
    if (!backupImportAnalysis || !backupImportAnalysis.hasData || backupImportAnalysis.parseError) return;

    const preview = backupImportAnalysis.strategyPreviews[mergeStrategy];
    if (!preview) return;

    const currentIdMap = new Map(records.map((r) => [r.id, r]));
    const currentCaseEvidenceMap = new Map(records.map((r) => [`${r.caseName}||${r.evidence}`, r]));
    const newIdSet = new Set(records.map((r) => r.id));

    const finalRecords = [...records];
    const overwrittenIds = new Set();
    let addCount = 0;
    let overwriteCount = 0;

    const by = mergeStrategy === 'addOnly' ? '备份导入（仅新增）'
      : mergeStrategy === 'overwriteById' ? '备份导入（按ID覆盖）'
      : '备份导入（按案件+证据合并）';

    backupImportAnalysis.backupRecords.forEach((r) => {
      if (mergeStrategy === 'addOnly') {
        const hasIdConflict = r.id && currentIdMap.has(r.id);
        const hasContentConflict = currentCaseEvidenceMap.has(`${r.caseName}||${r.evidence}`);
        if (hasIdConflict || hasContentConflict) {
          return;
        }
        let id = r.id;
        if (!id || newIdSet.has(id)) {
          id = uid();
        }
        newIdSet.add(id);
        finalRecords.push(prepareIncomingRecord({ ...r, id }, mergeStrategy, by));
        addCount++;
      } else if (mergeStrategy === 'overwriteById') {
        if (r.id && currentIdMap.has(r.id) && !overwrittenIds.has(r.id)) {
          const idx = finalRecords.findIndex((rec) => rec.id === r.id);
          if (idx !== -1) {
            const existing = finalRecords[idx];
            finalRecords[idx] = prepareIncomingRecord({
              ...r,
              id: r.id,
              createdAt: existing.createdAt,
            }, mergeStrategy, by);
            overwrittenIds.add(r.id);
            overwriteCount++;
          }
        } else {
          let id = r.id;
          if (!id || newIdSet.has(id)) {
            id = uid();
          }
          newIdSet.add(id);
          finalRecords.push(prepareIncomingRecord({ ...r, id }, mergeStrategy, by));
          addCount++;
        }
      } else if (mergeStrategy === 'mergeByCaseEvidence') {
        const key = `${r.caseName}||${r.evidence}`;
        let matched = false;
        if (currentCaseEvidenceMap.has(key)) {
          const existing = currentCaseEvidenceMap.get(key);
          if (!overwrittenIds.has(existing.id)) {
            const idx = finalRecords.findIndex((rec) => rec.id === existing.id);
            if (idx !== -1) {
              finalRecords[idx] = prepareIncomingRecord({
                ...r,
                id: existing.id,
                createdAt: existing.createdAt,
              }, mergeStrategy, by);
              overwrittenIds.add(existing.id);
              overwriteCount++;
              matched = true;
            }
          }
        }
        if (!matched && r.id && currentIdMap.has(r.id) && !overwrittenIds.has(r.id)) {
          const idx = finalRecords.findIndex((rec) => rec.id === r.id);
          if (idx !== -1) {
            const existing = finalRecords[idx];
            finalRecords[idx] = prepareIncomingRecord({
              ...r,
              id: r.id,
              createdAt: existing.createdAt,
            }, mergeStrategy, by);
            overwrittenIds.add(r.id);
            overwriteCount++;
            matched = true;
          }
        }
        if (!matched) {
          let id = r.id;
          if (!id || newIdSet.has(id)) {
            id = uid();
          }
          newIdSet.add(id);
          finalRecords.push(prepareIncomingRecord({ ...r, id }, mergeStrategy, by));
          addCount++;
        }
      }
    });

    const strategyDesc = mergeStrategy === 'addOnly' ? '仅新增'
      : mergeStrategy === 'overwriteById' ? '按ID覆盖'
      : '按案件+证据合并';

    const snapshotResult = createSnapshot(records, CURRENT_SCHEMA_VERSION);
    if (snapshotResult.success) {
      addMigrationRecord({
        fromVersion: CURRENT_SCHEMA_VERSION,
        toVersion: CURRENT_SCHEMA_VERSION,
        timestamp: new Date().toISOString(),
        status: 'success',
        description: `备份导入（${strategyDesc}）- 新增${addCount}条，覆盖${overwriteCount}条`,
        snapshotKey: snapshotResult.snapshotKey,
        recordCount: finalRecords.length,
        importDetails: {
          strategy: mergeStrategy,
          addCount,
          overwriteCount,
          skipCount: backupImportAnalysis.backupRecords.length - addCount - overwriteCount,
        },
      });
    }

    persist(ensureRecordIntegrity(finalRecords));
    closeDataMgmt();
  }

  function confirmBackupImport() {
    confirmMergeImport();
  }

  function confirmBackupReplace() {
    confirmMergeImport();
  }

  function handleRollback(snapshotKey) {
    const result = performRollback(snapshotKey);
    if (result.success) {
      const migrated = ensureRecordIntegrity(result.records);
      if (result.version < CURRENT_SCHEMA_VERSION) {
        const migrationResult = runMigrations(migrated, result.version, CURRENT_SCHEMA_VERSION);
        if (migrationResult.success) {
          const versionedData = { _schemaVersion: CURRENT_SCHEMA_VERSION, records: migrationResult.records };
          localStorage.setItem(appConfig.storage, JSON.stringify(versionedData));
          setRecords(ensureRecordIntegrity(migrationResult.records));
          setRollbackStatus({ success: true, message: `已从 v${result.version} 快照恢复并自动迁移到 v${CURRENT_SCHEMA_VERSION}` });
        } else {
          setRecords(migrated);
          setRollbackStatus({ success: true, message: `已从 v${result.version} 快照恢复，但自动迁移未完全成功，当前数据为 v${result.version} 格式` });
        }
      } else {
        setRecords(migrated);
        setRollbackStatus({ success: true, message: '已成功恢复数据' });
      }
    } else {
      setRollbackStatus({ success: false, message: result.error });
    }
  }

  function handleDeleteSnapshot(snapshotKey) {
    deleteSnapshot(snapshotKey);
    setRollbackStatus({ success: true, message: '快照已删除' });
  }

  function handleExportBackup() {
    const backupData = { _schemaVersion: CURRENT_SCHEMA_VERSION, exportDate: new Date().toISOString(), records };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `证据数据备份_${today}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function openExport(initialConfig = {}) {
    setShowExport(true);
    setExportConfig({
      caseName: '',
      exportLevel: '机密',
      groupByIssue: true,
      ...initialConfig,
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

    return getProcessedRecords(data, exportConfig.exportLevel);
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
    const maskedCount = exportData.filter((item) => item._masked).length;
    const confidentialCount = exportConfig.exportLevel === '机密'
      ? exportData.filter((item) => item.level === '机密').length
      : 0;
    return { total, cases, issues, confidentialCount, maskedCount };
  }, [exportData, exportConfig.exportLevel]);

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
          <button className="data-mgmt-entry-btn" type="button" onClick={openDataMgmt}>
            <Database size={18} />
            数据管理
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
                        <button type="button" className="secondary" onClick={() => { setShowEvidencePicker(true); setEvidencePickerSearch(''); }} disabled={!workbenchCase || wbRecords.length === 0}><ClipboardList size={16} />从已有证据带入</button>
                        <button type="button" className="secondary" onClick={openImport}><Upload size={16} />批量导入CSV</button>
                      </div>
                    </form>
                  </div>

                  <div className="wb-records-section">
                    <h3 className="wb-section-title"><FileText size={16} /> 当前案件证据列表（{wbFilteredRecords.length < wbRecords.length ? `${wbFilteredRecords.length}/${wbRecords.length}` : wbRecords.length}）</h3>
                    <div className="wb-records-toolbar">
                      <div className="wb-toolbar-row">
                        <div className="search">
                          <Search size={16} />
                          <input value={filters.query} onChange={(e) => setFilters({ ...filters, query: e.target.value })} placeholder="搜索证据名称、争议点" />
                        </div>
                        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                          <option value="全部">全部状态</option>
                          {appConfig.statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="wb-toolbar-row wb-filter-row">
                        <div className="filter-select-wrap">
                          <Target size={14} />
                          <select value={filters.issue} onChange={(e) => setFilters({ ...filters, issue: e.target.value })}>
                            <option value="">全部争议点</option>
                            {wbIssueOptions.map((issue) => <option key={issue} value={issue}>{issue}</option>)}
                          </select>
                        </div>
                        <div className="filter-select-wrap">
                          <Shield size={14} />
                          <select value={filters.level} onChange={(e) => setFilters({ ...filters, level: e.target.value })}>
                            <option value="">全部保密等级</option>
                            {allLevels.map((level) => <option key={level} value={level}>{level}</option>)}
                          </select>
                        </div>
                        {(filters.query || filters.status !== '全部' || filters.issue || filters.level) && (
                          <button type="button" className="clear-filters-btn" onClick={() => setFilters({ ...filters, query: '', status: '全部', issue: '', level: '' })}>
                            <RotateCcw size={14} /> 重置筛选
                          </button>
                        )}
                        {(filters.query || filters.status !== '全部' || filters.issue || filters.level) && (
                          <span className="filter-count-badge">
                            <Filter size={12} /> {wbFilteredRecords.length}/{wbRecords.length}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="wb-records-list">
                      {wbFilteredDisplayRecords.length > 0 ? wbFilteredDisplayRecords.map((item) => (
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
                          <p>{wbRecords.length > 0 ? '暂无符合当前筛选条件的记录，请调整搜索关键词或状态筛选' : '该案件暂无证据记录，请通过上方表单录入'}</p>
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
                                  <button type="button" className="create-task-from-issue-btn" onClick={(e) => { e.stopPropagation(); openCreateTaskFromIssue(workbenchCase, issue.name, 'workbench-coverage'); }}>
                                    <AlertTriangle size={14} /> 创建补强任务
                                  </button>
                                </div>
                              )}
                              {issue.coverageStatus === 'need-strengthen' && (
                                <div className="issue-task-create-row">
                                  <button type="button" className="create-task-from-issue-btn" onClick={(e) => { e.stopPropagation(); openCreateTaskFromIssue(workbenchCase, issue.name, 'workbench-coverage'); }}>
                                    <AlertTriangle size={14} /> 创建补强任务
                                  </button>
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
                  <div className="wb-timeline-controls">
                    <div className="timeline-view-toggle">
                      <button
                        type="button"
                        className={`timeline-view-btn ${wbTimelineViewMode === 'date' ? 'active' : ''}`}
                        onClick={() => setWbTimelineViewMode('date')}
                      >
                        <CalendarDays size={14} /> 按日期
                      </button>
                      <button
                        type="button"
                        className={`timeline-view-btn ${wbTimelineViewMode === 'fact' ? 'active' : ''}`}
                        onClick={() => setWbTimelineViewMode('fact')}
                      >
                        <Layers size={14} /> 事实节点
                      </button>
                    </div>
                    {wbTimelineViewMode === 'fact' && (
                      <button type="button" className="add-fact-node-btn" onClick={openWbCreateFactNode}>
                        <Plus size={14} /> 新建节点
                      </button>
                    )}
                  </div>

                  {wbTimelineViewMode === 'date' ? (
                    wbTimeline.length > 0 ? (
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
                    )
                  ) : (
                    wbFactNodeTimelineData.length > 0 ? (
                      <div className="timeline-track fact-node-timeline">
                        {wbFactNodeTimelineData.map((group, groupIdx) => (
                          group.type === 'factNode' ? (
                            <div
                              key={group.id}
                              className={`timeline-fact-node-group ${wbDragOverNodeId === group.id ? 'drag-over' : ''} ${group.isNoDate ? 'no-date-group' : ''}`}
                              onDragOver={(e) => handleWbDragOver(e, group.id)}
                              onDragLeave={handleWbDragLeave}
                              onDrop={(e) => handleWbDropOnNode(e, group.id)}
                            >
                              <div className="timeline-date-marker">
                                <div className="timeline-dot-wrapper">
                                  {groupIdx === 0 ? <CircleDot size={14} className="fact-node-dot" /> : <span className="timeline-dot fact-node-dot" />}
                                  {groupIdx < wbFactNodeTimelineData.length - 1 && <span className="timeline-line" />}
                                </div>
                                <div className="timeline-date-label fact-node-date-label">
                                  <Layers size={14} />
                                  <span className="fact-node-date">{group.isNoDate ? '未标注日期' : group.date}</span>
                                  <span className="timeline-count">{group.items.length} 份证据</span>
                                </div>
                              </div>
                              <div className="fact-node-card">
                                <div className="fact-node-header" onClick={() => toggleWbFactNodeExpand(group.id)}>
                                  <div className="fact-node-title-row">
                                    <span className="fact-node-title">{group.node.title || '未命名事实节点'}</span>
                                    {group.node.issue && <span className="fact-node-issue-tag"><Target size={12} /> {group.node.issue}</span>}
                                  </div>
                                  <div className="fact-node-actions">
                                    <button type="button" className="fact-node-action-btn" onClick={(e) => { e.stopPropagation(); openWbEditFactNode(group.node); }} title="编辑节点">
                                      <Settings size={14} />
                                    </button>
                                    <button type="button" className="fact-node-action-btn danger" onClick={(e) => { e.stopPropagation(); handleWbDeleteFactNode(group.id); }} title="删除节点">
                                      <Trash2 size={14} />
                                    </button>
                                    {wbExpandedFactNodes[group.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                  </div>
                                </div>
                                {group.node.summary && (
                                  <div className="fact-node-summary">{group.node.summary}</div>
                                )}
                                {group.node.dateFrom && group.node.dateTo && (
                                  <div className="fact-node-date-range">
                                    <CalendarDays size={12} />
                                    <span>{group.node.dateFrom} 至 {group.node.dateTo}</span>
                                  </div>
                                )}
                                {wbExpandedFactNodes[group.id] && (
                                  <div className="timeline-items fact-node-items">
                                    {group.items.map((item) => (
                                      <div
                                        key={item.id}
                                        className={`timeline-node ${selected?.id === item.id ? 'active' : ''} ${item._masked ? 'masked-record' : ''}`}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, item.id)}
                                        onDragEnd={handleDragEnd}
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
                                        <button
                                          type="button"
                                          className="remove-from-node-btn"
                                          onClick={(e) => { e.stopPropagation(); handleWbRemoveEvidenceFromNode(group.id, item.id); }}
                                          title="移出节点"
                                        >
                                          <X size={12} />
                                        </button>
                                      </div>
                                    ))}
                                    {group.items.length === 0 && (
                                      <div className="fact-node-empty">
                                        <p>拖拽证据到此节点中</p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div
                              key={group.date}
                              className={`timeline-group ${group.isNoDate ? 'no-date-group' : ''}`}
                              onDragOver={(e) => { e.preventDefault(); }}
                              onDrop={handleWbDropOnUngrouped}
                            >
                              <div className="timeline-date-marker">
                                <div className="timeline-dot-wrapper">
                                  {groupIdx === 0 ? <CircleDot size={14} /> : <span className="timeline-dot" />}
                                  {groupIdx < wbFactNodeTimelineData.length - 1 && <span className="timeline-line" />}
                                </div>
                                <div className="timeline-date-label">
                                  <CalendarDays size={14} />
                                  <span>{group.isNoDate ? '未标注日期' : group.date}</span>
                                  <span className="timeline-count">{group.items.length} 份 · 未归类</span>
                                </div>
                              </div>
                              <div className="timeline-items">
                                {group.items.map((item) => (
                                  <div
                                    key={item.id}
                                    className={`timeline-node ${selected?.id === item.id ? 'active' : ''} ${item._masked ? 'masked-record' : ''}`}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, item.id)}
                                    onDragEnd={handleDragEnd}
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
                          )
                        ))}
                      </div>
                    ) : (
                      <div className="wb-empty-hint">
                        <GitBranch size={32} />
                        <p>该案件暂无证据记录</p>
                        <button type="button" className="primary-btn" onClick={openWbCreateFactNode}>
                          <Plus size={14} /> 新建事实节点
                        </button>
                      </div>
                    )
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
                        const taskType = getTaskType(task);
                        const hasContext = task.sourceContext || task.caseName || task.evidenceId;
                        const sourceLabel = getTaskSourceLabel(task);
                        return (
                          <div key={task.id} className={`task-card ${overdue ? 'overdue' : ''} ${hasContext ? 'clickable' : ''}`} style={{ borderLeftColor: overdue ? '#dc2626' : statusMeta.color }} onClick={hasContext ? () => navigateToTaskContext(task) : undefined}>
                            <div className="task-card-header">
                              <div className="task-card-title-row">
                                <h4 className="task-evidence-name">
                                  {taskType === 'issue' ? <Target size={16} /> : <FileText size={16} />}
                                  <span className="task-type-tag" style={{ background: taskType === 'issue' ? '#fff7ed' : '#eff6ff', color: taskType === 'issue' ? '#b45309' : '#2563eb', borderColor: taskType === 'issue' ? '#fed7aa' : '#bfdbfe' }}>
                                    {taskType === 'issue' ? '争议点级' : '证据级'}
                                  </span>
                                  {task.evidenceName || task.issue}
                                </h4>
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
                                <span className="task-source-tag"><History size={10} /> 来源：{sourceLabel}</span>
                                {hasContext && (
                                  <span className="task-context-hint"><Link2 size={10} /> 点击跳转</span>
                                )}
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
                            <div className="task-card-footer" onClick={(e) => e.stopPropagation()}>
                              <div className="task-status-actions">
                                {TASK_STATUSES.map((s) => (
                                  <button key={s} type="button" className={`task-status-btn ${task.status === s ? 'active' : ''}`} onClick={() => handleTaskStatusChange(task.id, s)} style={task.status === s ? { background: statusMeta.color, color: '#fff', borderColor: statusMeta.color } : {}}>{s}</button>
                                ))}
                              </div>
                              <div className="task-card-actions">
                                <button type="button" className="task-action-btn edit" onClick={() => openEditTask(task)}>编辑</button>
                                <button type="button" className="task-action-btn delete" onClick={() => handleTaskDelete(task.id)}><Trash2 size={14} /> 删除</button>
                                {task.evidenceId && (
                                  <button type="button" className="task-action-btn view-evidence" onClick={() => {
                                    const ev = records.find((r) => r.id === task.evidenceId);
                                    if (ev) setSelected(ev);
                                  }}><Eye size={14} /> 查看证据</button>
                                )}
                                {hasContext && (
                                  <button type="button" className="task-action-btn goto-context" onClick={() => navigateToTaskContext(task)}><Link2 size={14} /> 跳转上下文</button>
                                )}
                                <button type="button" className="task-action-btn goto-coverage" onClick={() => setWorkbenchTab('coverage')}><Target size={14} /> 定位争议点</button>
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
                    <label>
                      <span style={{ display: 'block', marginBottom: 6, fontSize: 13, color: '#475569', fontWeight: 500 }}><Shield size={13} /> 出卷分级模式</span>
                      <select
                        value={exportConfig.exportLevel}
                        onChange={(e) => setExportConfig({ ...exportConfig, exportLevel: e.target.value })}
                        className="export-level-select"
                      >
                        {VIEW_MODES.map((m) => (
                          <option key={m.key} value={m.key}>{m.label}</option>
                        ))}
                      </select>
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" checked={exportConfig.groupByIssue} onChange={(e) => setExportConfig({ ...exportConfig, groupByIssue: e.target.checked })} />
                      <span>按争议点分组</span>
                    </label>
                  </div>
                  <div className="wb-export-stats">
                    <div className="summary-stat"><div className="summary-icon info"><FileSpreadsheet size={16} /></div><div><span>证据数</span><strong>{wbExportData.length}</strong></div></div>
                    <div className="summary-stat"><div className="summary-icon ok"><Target size={16} /></div><div><span>争议点</span><strong>{new Set(wbExportData.map((i) => i.issue).filter(Boolean)).size}</strong></div></div>
                    <div className="summary-stat warning"><div className="summary-icon warn"><Shield size={16} /></div><div><span>{exportConfig.exportLevel === '机密' ? '机密' : '脱敏'}</span><strong>{exportConfig.exportLevel === '机密' ? wbExportData.filter((i) => i.level === '机密').length : wbExportData.filter((i) => i._masked).length}</strong></div></div>
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
                            <span key={item.id} className={item._masked ? 'masked-dir-entry' : ''}>
                              {index + 1}. {item.evidence}｜{item.purpose}
                              {item._masked && <em className="dir-masked-tag"><Shield size={10} />脱敏</em>}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="wb-empty-hint"><FileText size={32} /><p>该案件暂无可导出的证据</p></div>
                  )}
                  <div className="wb-export-actions">
                    <button type="button" className="primary" onClick={() => openExport({
                      caseName: workbenchCase,
                      exportLevel: exportConfig.exportLevel,
                      groupByIssue: exportConfig.groupByIssue,
                    })}>
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
                            <button type="button" className="create-task-from-issue-btn" onClick={(e) => { e.stopPropagation(); openCreateTaskFromIssue(selectedCaseName, issue.name, 'coverage'); }}>
                              <AlertTriangle size={14} /> 创建补强任务
                            </button>
                          </div>
                        )}
                        {issue.coverageStatus === 'need-strengthen' && (
                          <div className="issue-task-create-row">
                            <button type="button" className="create-task-from-issue-btn" onClick={(e) => { e.stopPropagation(); openCreateTaskFromIssue(selectedCaseName, issue.name, 'coverage'); }}>
                              <AlertTriangle size={14} /> 创建补强任务
                            </button>
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
                          {(() => {
                            const currentIssue = form.issue;
                            const favoriteTemplates = currentTemplates.filter((t) => isFavorite(templateData, currentIssue, t));
                            const otherTemplates = currentTemplates.filter((t) => !isFavorite(templateData, currentIssue, t));
                            const renderItem = (template) => {
                              const fav = isFavorite(templateData, currentIssue, template);
                              return (
                                <div key={template} className={`template-item ${fav ? 'is-favorite' : ''}`}>
                                  <button
                                    type="button"
                                    className={`template-fav-btn ${fav ? 'active' : ''}`}
                                    onClick={() => handleToggleFavorite(currentIssue, template)}
                                    title={fav ? '取消收藏' : '收藏'}
                                  >
                                    <Star size={14} fill={fav ? '#f59e0b' : 'none'} />
                                  </button>
                                  <button
                                    type="button"
                                    className="template-text"
                                    onClick={() => applyTemplate(template)}
                                    title="点击填入"
                                  >
                                    {template}
                                  </button>
                                  {!isBuiltInTemplate(currentIssue, template) && (
                                    <button
                                      type="button"
                                      className="template-delete-btn"
                                      onClick={() => handleRemoveTemplate(currentIssue, template)}
                                      title="删除模板"
                                    >
                                      <X size={12} />
                                    </button>
                                  )}
                                </div>
                              );
                            };
                            return (
                              <>
                                {favoriteTemplates.length > 0 && (
                                  <div className="template-group">
                                    <div className="template-group-label">
                                      <Star size={12} fill="#f59e0b" />
                                      收藏模板
                                    </div>
                                    {favoriteTemplates.map(renderItem)}
                                  </div>
                                )}
                                {otherTemplates.length > 0 && (
                                  <div className="template-group">
                                    {favoriteTemplates.length > 0 && (
                                      <div className="template-group-label">其他模板</div>
                                    )}
                                    {otherTemplates.map(renderItem)}
                                  </div>
                                )}
                              </>
                            );
                          })()}
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
            <div className="toolbar-row">
              <div className="search">
                <Search size={16} />
                <input value={filters.query} onChange={(event) => setFilters({ ...filters, query: event.target.value })} placeholder="案件/证据关键词搜索" />
              </div>
              <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
                <option value="全部">全部状态</option>
                {appConfig.statuses.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>
            <div className="toolbar-row toolbar-filter-row">
              <div className="filter-select-wrap">
                <Briefcase size={14} />
                <select value={filters.caseName} onChange={(event) => setFilters({ ...filters, caseName: event.target.value })}>
                  <option value="">全部案件</option>
                  {caseNames.map((name) => <option key={name} value={name}>{name}</option>)}
                </select>
              </div>
              <div className="filter-select-wrap">
                <Target size={14} />
                <select value={filters.issue} onChange={(event) => setFilters({ ...filters, issue: event.target.value })}>
                  <option value="">全部争议点</option>
                  {allIssues.map((issue) => <option key={issue} value={issue}>{issue}</option>)}
                </select>
              </div>
              <div className="filter-select-wrap">
                <Shield size={14} />
                <select value={filters.level} onChange={(event) => setFilters({ ...filters, level: event.target.value })}>
                  <option value="">全部保密等级</option>
                  {allLevels.map((level) => <option key={level} value={level}>{level}</option>)}
                </select>
              </div>
              {hasActiveFilters && (
                <button type="button" className="clear-filters-btn" onClick={clearAllFilters}>
                  <RotateCcw size={14} /> 清空筛选
                </button>
              )}
              {hasActiveFilters && (
                <span className="filter-count-badge">
                  <Filter size={12} /> 筛选中 · {filteredRecords.length}/{records.length}
                </span>
              )}
            </div>
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

        {selectedCaseName && (
          <div className="timeline-view-controls">
            <div className="timeline-view-toggle">
              <button
                type="button"
                className={`timeline-view-btn ${timelineViewMode === 'date' ? 'active' : ''}`}
                onClick={() => setTimelineViewMode('date')}
              >
                <CalendarDays size={14} /> 按日期
              </button>
              <button
                type="button"
                className={`timeline-view-btn ${timelineViewMode === 'fact' ? 'active' : ''}`}
                onClick={() => setTimelineViewMode('fact')}
              >
                <Layers size={14} /> 事实节点
              </button>
            </div>
            {timelineViewMode === 'fact' && (
              <button type="button" className="add-fact-node-btn" onClick={openCreateFactNode}>
                <Plus size={14} /> 新建事实节点
              </button>
            )}
          </div>
        )}

        {selectedCaseName ? (
          timelineViewMode === 'date' ? (
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
            factNodeTimelineData.length > 0 ? (
              <div className="timeline-track fact-node-timeline">
                {factNodeTimelineData.map((group, groupIdx) => (
                  group.type === 'factNode' ? (
                    <div
                      key={group.id}
                      className={`timeline-fact-node-group ${dragOverNodeId === group.id ? 'drag-over' : ''} ${group.isNoDate ? 'no-date-group' : ''}`}
                      onDragOver={(e) => handleDragOver(e, group.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDropOnNode(e, group.id)}
                    >
                      <div className="timeline-date-marker">
                        <div className="timeline-dot-wrapper">
                          {groupIdx === 0 ? <CircleDot size={14} className="fact-node-dot" /> : <span className="timeline-dot fact-node-dot" />}
                          {groupIdx < factNodeTimelineData.length - 1 && <span className="timeline-line" />}
                        </div>
                        <div className="timeline-date-label fact-node-date-label">
                          <Layers size={14} />
                          <span className="fact-node-date">{group.isNoDate ? '未标注日期' : group.date}</span>
                          <span className="timeline-count">{group.items.length} 份证据</span>
                        </div>
                      </div>
                      <div className="fact-node-card">
                        <div className="fact-node-header" onClick={() => toggleFactNodeExpand(group.id)}>
                          <div className="fact-node-title-row">
                            <span className="fact-node-title">{group.node.title || '未命名事实节点'}</span>
                            {group.node.issue && <span className="fact-node-issue-tag"><Target size={12} /> {group.node.issue}</span>}
                          </div>
                          <div className="fact-node-actions">
                            <button type="button" className="fact-node-action-btn" onClick={(e) => { e.stopPropagation(); openEditFactNode(group.node); }} title="编辑节点">
                              <Settings size={14} />
                            </button>
                            <button type="button" className="fact-node-action-btn danger" onClick={(e) => { e.stopPropagation(); handleDeleteFactNode(group.id); }} title="删除节点">
                              <Trash2 size={14} />
                            </button>
                            {expandedFactNodes[group.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        </div>
                        {group.node.summary && (
                          <div className="fact-node-summary">{group.node.summary}</div>
                        )}
                        {group.node.dateFrom && group.node.dateTo && (
                          <div className="fact-node-date-range">
                            <CalendarDays size={12} />
                            <span>{group.node.dateFrom} 至 {group.node.dateTo}</span>
                          </div>
                        )}
                        {expandedFactNodes[group.id] && (
                          <div className="timeline-items fact-node-items">
                            {group.items.map((item) => (
                              <div
                                key={item.id}
                                className={`timeline-node ${selected?.id === item.id ? 'active' : ''} ${item._masked ? 'masked-record' : ''}`}
                                draggable
                                onDragStart={(e) => handleDragStart(e, item.id)}
                                onDragEnd={handleDragEnd}
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
                                <button
                                  type="button"
                                  className="remove-from-node-btn"
                                  onClick={(e) => { e.stopPropagation(); handleRemoveEvidenceFromNode(group.id, item.id); }}
                                  title="移出节点"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ))}
                            {group.items.length === 0 && (
                              <div className="fact-node-empty">
                                <p>拖拽证据到此节点中</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div
                      key={group.date}
                      className={`timeline-group ${group.isNoDate ? 'no-date-group' : ''}`}
                      onDragOver={(e) => { e.preventDefault(); }}
                      onDrop={handleDropOnUngrouped}
                    >
                      <div className="timeline-date-marker">
                        <div className="timeline-dot-wrapper">
                          {groupIdx === 0 ? <CircleDot size={14} /> : <span className="timeline-dot" />}
                          {groupIdx < factNodeTimelineData.length - 1 && <span className="timeline-line" />}
                        </div>
                        <div className="timeline-date-label">
                          <CalendarDays size={14} />
                          <span>{group.isNoDate ? '未标注日期' : group.date}</span>
                          <span className="timeline-count">{group.items.length} 份 · 未归类</span>
                        </div>
                      </div>
                      <div className="timeline-items">
                        {group.items.map((item) => (
                          <div
                            key={item.id}
                            className={`timeline-node ${selected?.id === item.id ? 'active' : ''} ${item._masked ? 'masked-record' : ''}`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, item.id)}
                            onDragEnd={handleDragEnd}
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
                  )
                ))}
              </div>
            ) : (
              <div className="timeline-empty">
                <GitBranch size={40} />
                <p>当前筛选条件下没有匹配的证据记录</p>
                <button type="button" className="primary-btn" onClick={openCreateFactNode}>
                  <Plus size={14} /> 新建事实节点
                </button>
              </div>
            )
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
          <h2>补强任务看板</h2>
          <div className="task-metrics-brief">
            <span className="tmb tmb-overdue">逾期：{taskMetrics.overdue}</span>
            <span className="tmb tmb-pending">待处理：{taskMetrics.pending}</span>
            <span className="tmb tmb-progress">处理中：{taskMetrics.inProgress}</span>
            <span className="tmb tmb-done">已完成：{taskMetrics.completed}</span>
            <span className="tmb tmb-total">总计：{taskMetrics.total}</span>
          </div>
          <div className="task-view-toggle">
            <button type="button" className={`task-view-btn ${taskViewMode === 'board' ? 'active' : ''}`} onClick={() => setTaskViewMode('board')}>
              <Layers size={14} /> 看板
            </button>
            <button type="button" className={`task-view-btn ${taskViewMode === 'list' ? 'active' : ''}`} onClick={() => setTaskViewMode('list')}>
              <ListChecks size={14} /> 列表
            </button>
          </div>
        </div>

        {taskViewMode === 'board' && (
          <div className="board-controls">
            <div className="board-group-by">
              <span className="board-ctrl-label"><Layers size={14} /> 汇总维度</span>
              <button type="button" className={`board-group-btn ${boardGroupBy === 'case' ? 'active' : ''}`} onClick={() => setBoardGroupBy('case')}><Briefcase size={12} /> 按案件</button>
              <button type="button" className={`board-group-btn ${boardGroupBy === 'issue' ? 'active' : ''}`} onClick={() => setBoardGroupBy('issue')}><Target size={12} /> 按争议点</button>
              <button type="button" className={`board-group-btn ${boardGroupBy === 'assignee' ? 'active' : ''}`} onClick={() => setBoardGroupBy('assignee')}><Clock size={12} /> 按负责人</button>
            </div>
            <label className="board-overdue-toggle">
              <input type="checkbox" checked={boardFilterOverdue} onChange={(e) => setBoardFilterOverdue(e.target.checked)} />
              <AlertCircle size={14} /> 仅看逾期
            </label>
          </div>
        )}

        {taskViewMode === 'board' ? (
          <div className="task-kanban">
            {boardGroupBy === 'case' && (
              filteredCaseBoard.length > 0 ? (
                filteredCaseBoard.map((caseBoard) => {
                  const isExpanded = boardExpandedCases[caseBoard.caseName] !== false;
                  return (
                    <div key={caseBoard.caseName} className="kanban-case-group">
                      <div className="kanban-case-header" onClick={() => setBoardExpandedCases({ ...boardExpandedCases, [caseBoard.caseName]: !isExpanded })}>
                        <div className="kanban-case-title">
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                          <Briefcase size={16} />
                          <h3>{caseBoard.caseName}</h3>
                        </div>
                        <div className="kanban-case-stats">
                          <span className="kcs kcs-overdue">{caseBoard.overdue} 逾期</span>
                          <span className="kcs kcs-pending">{caseBoard.pending} 待处理</span>
                          <span className="kcs kcs-progress">{caseBoard.inProgress} 处理中</span>
                          <span className="kcs kcs-done">{caseBoard.completed} 已完成</span>
                          <span className="kcs kcs-total">共 {caseBoard.total}</span>
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="kanban-case-body">
                          <div className="kanban-section">
                            <div className="kanban-section-title">
                              <Target size={14} />
                              <span>按争议点</span>
                            </div>
                            <div className="kanban-issue-grid">
                              {caseBoard.issues.map((issueBoard) => {
                                const issueExpanded = boardExpandedIssues[`${caseBoard.caseName}||${issueBoard.name}`] !== false;
                                const coverage = computeIssueCoverage(customIssues, caseBoard.caseName, records).find((i) => i.name === issueBoard.name);
                                const covMeta = coverage ? COVERAGE_STATUS_META[coverage.coverageStatus] : null;
                                return (
                                  <div key={issueBoard.name} className="kanban-issue-card" style={covMeta ? { borderColor: covMeta.border, background: covMeta.bg } : {}}>
                                    <div className="kanban-issue-header" onClick={() => setBoardExpandedIssues({ ...boardExpandedIssues, [`${caseBoard.caseName}||${issueBoard.name}`]: !issueExpanded })}>
                                      <div className="kanban-issue-title">
                                        {issueExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                                        {covMeta && <span className="coverage-indicator" style={{ background: covMeta.color }} />}
                                        <h4 style={covMeta ? { color: covMeta.color } : {}}>{issueBoard.name}</h4>
                                        {covMeta && <span className="coverage-badge-sm" style={{ background: covMeta.color, color: '#fff' }}>{covMeta.label}</span>}
                                      </div>
                                      <div className="kanban-issue-counts">
                                        <span className="kic-overdue">{issueBoard.overdue}逾期</span>
                                        <span className="kic-pending">{issueBoard.pending}待处理</span>
                                        <span>{issueBoard.total}项</span>
                                      </div>
                                    </div>
                                    {issueExpanded && (
                                      <div className="kanban-issue-tasks">
                                        {issueBoard.tasks.map((task) => {
                                          const overdue = isTaskOverdue(task);
                                          const daysLeft = getTaskDaysLeft(task);
                                          const statusMeta = TASK_STATUS_META[task.status];
                                          const taskType = getTaskType(task);
                                          return (
                                            <div key={task.id} className={`kanban-task-item ${overdue ? 'overdue' : ''}`} style={{ borderLeftColor: overdue ? '#dc2626' : statusMeta.color }} onClick={() => navigateToTaskContext(task)}>
                                              <div className="kanban-task-head">
                                                <span className="kanban-task-type-badge" style={{ background: taskType === 'issue' ? '#b45309' : '#2563eb' }}>
                                                  {taskType === 'issue' ? '争议点' : '证据'}
                                                </span>
                                                <span className="task-status-chip" style={{ background: statusMeta.bg, color: statusMeta.color, borderColor: statusMeta.border }}>{task.status}</span>
                                                {overdue && <span className="overdue-chip-sm"><AlertCircle size={10} />逾期</span>}
                                                {!overdue && daysLeft !== null && task.status !== '已完成' && task.status !== '已取消' && daysLeft <= 3 && (
                                                  <span className="urgent-chip-sm"><Clock size={10} />{daysLeft === 0 ? '今日' : `${daysLeft}天`}</span>
                                                )}
                                              </div>
                                              <div className="kanban-task-name">
                                                {taskType === 'issue' ? <Target size={12} /> : <FileText size={12} />}
                                                {task.evidenceName || task.issue}
                                              </div>
                                              <div className="kanban-task-meta">
                                                <span><Briefcase size={10} />{task.assignee || '未分配'}</span>
                                                <span><CalendarDays size={10} />{task.deadline || '无期限'}</span>
                                              </div>
                                              <div className="kanban-task-actions" onClick={(e) => e.stopPropagation()}>
                                                {TASK_STATUSES.map((s) => (
                                                  <button key={s} type="button" className={`kanban-task-status-btn ${task.status === s ? 'active' : ''}`} onClick={() => handleTaskStatusChange(task.id, s)} style={task.status === s ? { background: statusMeta.color, color: '#fff' } : {}}>{s.slice(0, 1)}</button>
                                                ))}
                                                <button type="button" className="kanban-task-nav-btn" onClick={() => navigateToTaskContext(task)} title="跳转至上下文"><Link2 size={10} /></button>
                                                {task.evidenceId && (
                                                  <button type="button" className="kanban-task-nav-btn" onClick={() => {
                                                    const ev = records.find((r) => r.id === task.evidenceId);
                                                    if (ev) setSelected(ev);
                                                  }} title="查看关联证据"><Eye size={10} /></button>
                                                )}
                                              </div>
                                            </div>
                                          );
                                        })}
                                        <button type="button" className="kanban-add-task-btn" onClick={() => openCreateTaskFromIssue(caseBoard.caseName, issueBoard.name, 'board-case')}>
                                          <Plus size={12} /> 添加任务
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {caseBoard.assignees.length > 0 && (
                            <div className="kanban-section">
                              <div className="kanban-section-title">
                                <Briefcase size={14} />
                                <span>按负责人</span>
                              </div>
                              <div className="kanban-assignee-grid">
                                {caseBoard.assignees.map((assignee) => (
                                  <div key={assignee.name} className="kanban-assignee-card">
                                    <div className="kanban-assignee-header">
                                      <h4>{assignee.name}</h4>
                                      <div className="kanban-assignee-counts">
                                        {assignee.overdue > 0 && <span className="kac-overdue">{assignee.overdue}逾期</span>}
                                        <span>{assignee.pending}待处理</span>
                                        <span>{assignee.inProgress}处理中</span>
                                        <span>{assignee.completed}完成</span>
                                      </div>
                                    </div>
                                    <div className="kanban-assignee-bar">
                                      <div className="kab-segment kab-pending" style={{ width: `${assignee.total ? (assignee.pending / assignee.total) * 100 : 0}%` }} />
                                      <div className="kab-segment kab-progress" style={{ width: `${assignee.total ? (assignee.inProgress / assignee.total) * 100 : 0}%` }} />
                                      <div className="kab-segment kab-done" style={{ width: `${assignee.total ? (assignee.completed / assignee.total) * 100 : 0}%` }} />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="task-list-empty">
                  <Layers size={48} />
                  <h3>暂无补强任务</h3>
                  <p>在争议点覆盖视图中为「无证据」或「需补强」的争议点创建任务，或在「需补强」的证据上点击「生成任务」</p>
                </div>
              )
            )}

            {boardGroupBy === 'issue' && (
              filteredIssueBoard.length > 0 ? (
                <div className="kanban-issue-board">
                  {filteredIssueBoard.map((issueBoard) => {
                    const isExpanded = boardExpandedIssues[issueBoard.name] !== false;
                    return (
                      <div key={issueBoard.name} className="kanban-issue-group">
                        <div className="kanban-issue-group-header" onClick={() => setBoardExpandedIssues({ ...boardExpandedIssues, [issueBoard.name]: !isExpanded })}>
                          <div className="kanban-issue-group-title">
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                            <Target size={16} />
                            <h3>{issueBoard.name}</h3>
                          </div>
                          <div className="kanban-case-stats">
                            <span className="kcs kcs-overdue">{issueBoard.overdue} 逾期</span>
                            <span className="kcs kcs-pending">{issueBoard.pending} 待处理</span>
                            <span className="kcs kcs-progress">{issueBoard.inProgress} 处理中</span>
                            <span className="kcs kcs-done">{issueBoard.completed} 已完成</span>
                            <span className="kcs kcs-total">共 {issueBoard.total}</span>
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="kanban-issue-group-body">
                            <div className="kanban-section">
                              <div className="kanban-section-title">
                                <Briefcase size={14} />
                                <span>按案件</span>
                              </div>
                              <div className="kanban-case-grid">
                                {issueBoard.cases.map((caseItem) => {
                                  const caseExpanded = boardExpandedIssueCases[`${issueBoard.name}||${caseItem.name}`] !== false;
                                  return (
                                    <div key={caseItem.name} className="kanban-case-mini-card">
                                      <div className="kanban-case-mini-header" onClick={() => setBoardExpandedIssueCases({ ...boardExpandedIssueCases, [`${issueBoard.name}||${caseItem.name}`]: !caseExpanded })}>
                                        <div className="kanban-case-mini-title">
                                          {caseExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                                          <Briefcase size={14} />
                                          <h4>{caseItem.name}</h4>
                                        </div>
                                        <div className="kanban-case-mini-counts">
                                          {caseItem.overdue > 0 && <span className="kcm-overdue">{caseItem.overdue}逾期</span>}
                                          <span>{caseItem.total}项</span>
                                        </div>
                                      </div>
                                      {caseExpanded && (
                                        <div className="kanban-case-mini-tasks">
                                          {caseItem.tasks.map((task) => {
                                            const overdue = isTaskOverdue(task);
                                            const daysLeft = getTaskDaysLeft(task);
                                            const statusMeta = TASK_STATUS_META[task.status];
                                            const taskType = getTaskType(task);
                                            return (
                                              <div key={task.id} className={`kanban-task-item ${overdue ? 'overdue' : ''}`} style={{ borderLeftColor: overdue ? '#dc2626' : statusMeta.color }} onClick={() => navigateToTaskContext(task)}>
                                                <div className="kanban-task-head">
                                                  <span className="kanban-task-type-badge" style={{ background: taskType === 'issue' ? '#b45309' : '#2563eb' }}>
                                                    {taskType === 'issue' ? '争议点' : '证据'}
                                                  </span>
                                                  <span className="task-status-chip" style={{ background: statusMeta.bg, color: statusMeta.color, borderColor: statusMeta.border }}>{task.status}</span>
                                                  {overdue && <span className="overdue-chip-sm"><AlertCircle size={10} />逾期</span>}
                                                  {!overdue && daysLeft !== null && task.status !== '已完成' && task.status !== '已取消' && daysLeft <= 3 && (
                                                    <span className="urgent-chip-sm"><Clock size={10} />{daysLeft === 0 ? '今日' : `${daysLeft}天`}</span>
                                                  )}
                                                </div>
                                                <div className="kanban-task-name">
                                                  {taskType === 'issue' ? <Target size={12} /> : <FileText size={12} />}
                                                  {task.evidenceName || task.issue}
                                                </div>
                                                <div className="kanban-task-meta">
                                                  <span><Briefcase size={10} />{task.assignee || '未分配'}</span>
                                                  <span><CalendarDays size={10} />{task.deadline || '无期限'}</span>
                                                </div>
                                                <div className="kanban-task-actions" onClick={(e) => e.stopPropagation()}>
                                                  {TASK_STATUSES.map((s) => (
                                                    <button key={s} type="button" className={`kanban-task-status-btn ${task.status === s ? 'active' : ''}`} onClick={() => handleTaskStatusChange(task.id, s)} style={task.status === s ? { background: statusMeta.color, color: '#fff' } : {}}>{s.slice(0, 1)}</button>
                                                  ))}
                                                  <button type="button" className="kanban-task-nav-btn" onClick={() => navigateToTaskContext(task)} title="跳转至上下文"><Link2 size={10} /></button>
                                                </div>
                                              </div>
                                            );
                                          })}
                                          <button type="button" className="kanban-add-task-btn" onClick={() => openCreateTaskFromIssue(caseItem.name, issueBoard.name, 'board-issue')}>
                                            <Plus size={12} /> 添加任务
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {issueBoard.assignees.length > 0 && (
                              <div className="kanban-section">
                                <div className="kanban-section-title">
                                  <Briefcase size={14} />
                                  <span>负责人分布</span>
                                </div>
                                <div className="kanban-assignee-mini-grid">
                                  {issueBoard.assignees.map((assignee) => (
                                    <div key={assignee.name} className="kanban-assignee-mini-card">
                                      <span className="assignee-mini-name">{assignee.name}</span>
                                      <span className="assignee-mini-count">{assignee.total}项</span>
                                      {assignee.overdue > 0 && <span className="assignee-mini-overdue">{assignee.overdue}逾期</span>}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="task-list-empty">
                  <Layers size={48} />
                  <h3>暂无补强任务</h3>
                  <p>在争议点覆盖视图中为「无证据」或「需补强」的争议点创建任务</p>
                </div>
              )
            )}

            {boardGroupBy === 'assignee' && (
              filteredAssigneeBoard.length > 0 ? (
                <div className="kanban-assignee-board">
                  {filteredAssigneeBoard.map((assigneeBoard) => {
                    const isExpanded = boardExpandedAssignees[assigneeBoard.name] !== false;
                    return (
                      <div key={assigneeBoard.name} className="kanban-assignee-group">
                        <div className="kanban-assignee-group-header" onClick={() => setBoardExpandedAssignees({ ...boardExpandedAssignees, [assigneeBoard.name]: !isExpanded })}>
                          <div className="kanban-assignee-group-title">
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                            <Briefcase size={16} />
                            <h3>{assigneeBoard.name}</h3>
                            {assigneeBoard.overdue > 0 && <span className="assignee-group-overdue"><AlertCircle size={14} />{assigneeBoard.overdue} 逾期</span>}
                          </div>
                          <div className="kanban-case-stats">
                            <span className="kcs kcs-pending">{assigneeBoard.pending} 待处理</span>
                            <span className="kcs kcs-progress">{assigneeBoard.inProgress} 处理中</span>
                            <span className="kcs kcs-done">{assigneeBoard.completed} 已完成</span>
                            <span className="kcs kcs-total">共 {assigneeBoard.total}</span>
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="kanban-assignee-group-body">
                            <div className="kanban-assignee-progress-bar">
                              <div className="kab-segment kab-pending" style={{ width: `${assigneeBoard.total ? (assigneeBoard.pending / assigneeBoard.total) * 100 : 0}%` }} />
                              <div className="kab-segment kab-progress" style={{ width: `${assigneeBoard.total ? (assigneeBoard.inProgress / assigneeBoard.total) * 100 : 0}%` }} />
                              <div className="kab-segment kab-done" style={{ width: `${assigneeBoard.total ? (assigneeBoard.completed / assigneeBoard.total) * 100 : 0}%` }} />
                            </div>

                            {assigneeBoard.cases.length > 0 && (
                              <div className="kanban-section">
                                <div className="kanban-section-title">
                                  <Briefcase size={14} />
                                  <span>按案件</span>
                                </div>
                                <div className="kanban-case-grid">
                                  {assigneeBoard.cases.map((caseItem) => {
                                    const caseExpanded = boardExpandedAssigneeCases[`${assigneeBoard.name}||${caseItem.name}`] !== false;
                                    const caseTasks = assigneeBoard.tasks.filter((t) => t.caseName === caseItem.name);
                                    return (
                                      <div key={caseItem.name} className="kanban-case-mini-card">
                                        <div className="kanban-case-mini-header" onClick={() => setBoardExpandedAssigneeCases({ ...boardExpandedAssigneeCases, [`${assigneeBoard.name}||${caseItem.name}`]: !caseExpanded })}>
                                          <div className="kanban-case-mini-title">
                                            {caseExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                                            <Briefcase size={14} />
                                            <h4>{caseItem.name}</h4>
                                          </div>
                                          <div className="kanban-case-mini-counts">
                                            {caseItem.overdue > 0 && <span className="kcm-overdue">{caseItem.overdue}逾期</span>}
                                            <span>{caseItem.total}项</span>
                                          </div>
                                        </div>
                                        {caseExpanded && (
                                          <div className="kanban-case-mini-tasks">
                                            {caseTasks.map((task) => {
                                              const overdue = isTaskOverdue(task);
                                              const daysLeft = getTaskDaysLeft(task);
                                              const statusMeta = TASK_STATUS_META[task.status];
                                              const taskType = getTaskType(task);
                                              return (
                                                <div key={task.id} className={`kanban-task-item ${overdue ? 'overdue' : ''}`} style={{ borderLeftColor: overdue ? '#dc2626' : statusMeta.color }} onClick={() => navigateToTaskContext(task)}>
                                                  <div className="kanban-task-head">
                                                    <span className="kanban-task-type-badge" style={{ background: taskType === 'issue' ? '#b45309' : '#2563eb' }}>
                                                      {taskType === 'issue' ? '争议点' : '证据'}
                                                    </span>
                                                    <span className="task-status-chip" style={{ background: statusMeta.bg, color: statusMeta.color, borderColor: statusMeta.border }}>{task.status}</span>
                                                    {overdue && <span className="overdue-chip-sm"><AlertCircle size={10} />逾期</span>}
                                                    {!overdue && daysLeft !== null && task.status !== '已完成' && task.status !== '已取消' && daysLeft <= 3 && (
                                                      <span className="urgent-chip-sm"><Clock size={10} />{daysLeft === 0 ? '今日' : `${daysLeft}天`}</span>
                                                    )}
                                                  </div>
                                                  <div className="kanban-task-name">
                                                    {taskType === 'issue' ? <Target size={12} /> : <FileText size={12} />}
                                                    {task.evidenceName || task.issue}
                                                  </div>
                                                  <div className="kanban-task-meta">
                                                    <span><Target size={10} />{task.issue || '未关联'}</span>
                                                    <span><CalendarDays size={10} />{task.deadline || '无期限'}</span>
                                                  </div>
                                                  <div className="kanban-task-actions" onClick={(e) => e.stopPropagation()}>
                                                    {TASK_STATUSES.map((s) => (
                                                      <button key={s} type="button" className={`kanban-task-status-btn ${task.status === s ? 'active' : ''}`} onClick={() => handleTaskStatusChange(task.id, s)} style={task.status === s ? { background: statusMeta.color, color: '#fff' } : {}}>{s.slice(0, 1)}</button>
                                                    ))}
                                                    <button type="button" className="kanban-task-nav-btn" onClick={() => navigateToTaskContext(task)} title="跳转至上下文"><Link2 size={10} /></button>
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {assigneeBoard.issues.length > 0 && (
                              <div className="kanban-section">
                                <div className="kanban-section-title">
                                  <Target size={14} />
                                  <span>争议点分布</span>
                                </div>
                                <div className="kanban-issue-mini-grid">
                                  {assigneeBoard.issues.map((issue) => (
                                    <div key={issue.name} className="kanban-issue-mini-card">
                                      <span className="issue-mini-name">{issue.name}</span>
                                      <span className="issue-mini-count">{issue.total}项</span>
                                      {issue.overdue > 0 && <span className="issue-mini-overdue">{issue.overdue}逾期</span>}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="task-list-empty">
                  <Layers size={48} />
                  <h3>暂无补强任务</h3>
                  <p>创建任务时分配负责人后，可在此视图按负责人查看</p>
                </div>
              )
            )}
          </div>
        ) : (
          <>
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
                  const taskType = getTaskType(task);
                  const hasContext = task.sourceContext || task.caseName || task.evidenceId;
                  const sourceLabel = getTaskSourceLabel(task);
                  return (
                    <div
                      key={task.id}
                      className={`task-card ${overdue ? 'overdue' : ''} ${hasContext ? 'clickable' : ''}`}
                      style={{ borderLeftColor: overdue ? '#dc2626' : statusMeta.color }}
                      onClick={hasContext ? () => navigateToTaskContext(task) : undefined}
                    >
                      <div className="task-card-header">
                        <div className="task-card-title-row">
                          <h4 className="task-evidence-name">
                            {taskType === 'issue' ? <Target size={16} /> : <FileText size={16} />}
                            <span className="task-type-tag" style={{ background: taskType === 'issue' ? '#fff7ed' : '#eff6ff', color: taskType === 'issue' ? '#b45309' : '#2563eb', borderColor: taskType === 'issue' ? '#fed7aa' : '#bfdbfe' }}>
                              {taskType === 'issue' ? '争议点级' : '证据级'}
                            </span>
                            {task.evidenceName || task.issue}
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
                          <span className="task-source-tag"><History size={10} /> 来源：{sourceLabel}</span>
                          {hasContext && (
                            <span className="task-context-hint"><Link2 size={10} /> 点击跳转</span>
                          )}
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

                      <div className="task-card-footer" onClick={(e) => e.stopPropagation()}>
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
                          {task.evidenceId && (
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
                          )}
                          {hasContext && (
                            <button
                              type="button"
                              className="task-action-btn goto-context"
                              onClick={() => navigateToTaskContext(task)}
                            >
                              <Link2 size={14} /> 跳转上下文
                            </button>
                          )}
                          <button
                            type="button"
                            className="task-action-btn goto-coverage"
                            onClick={() => {
                              if (task.caseName) {
                                setSelectedCaseName(task.caseName);
                                setWorkbenchCase(task.caseName);
                                setWorkbenchTab('coverage');
                              }
                            }}
                          >
                            <Target size={14} /> 定位争议点
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
                      : '在争议点覆盖视图中为「无证据」或「需补强」的争议点创建任务，或在「需补强」的证据上点击「生成任务」'}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
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
                <h2>{taskModalMode === 'create' ? (taskForm.taskType === 'issue' ? '创建争议点补强任务' : '创建证据补强任务') : '编辑补强任务'}</h2>
              </div>
              <button type="button" className="icon-btn" onClick={closeTaskModal}>
                <X size={18} />
              </button>
            </div>

            <form className="modal-body" onSubmit={handleTaskFormSubmit}>
              <div className="task-form-section">
                <div className="task-form-evidence-info">
                  <div className="tfei-title">{taskForm.taskType === 'issue' ? '关联争议点' : '关联证据'}</div>
                  <div className="tfei-content">
                    {taskForm.taskType === 'issue' ? (
                      <>
                        <div className="tfei-row">
                          <span className="tfei-label"><Briefcase size={14} /> 案件：</span>
                          <span className="tfei-value">{taskForm.caseName}</span>
                        </div>
                        <div className="tfei-row">
                          <span className="tfei-label"><Target size={14} /> 争议点：</span>
                          <span className="tfei-value tfei-evidence">{taskForm.issue}</span>
                        </div>
                      </>
                    ) : (
                      <>
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
                      </>
                    )}
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

      {showFactNodeModal && (
        <div className="modal-overlay" onClick={closeFactNodeModal}>
          <div className="modal fact-node-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="panel-title" style={{ marginBottom: 0 }}>
                <Layers size={18} />
                <h2>{factNodeModalMode === 'create' ? '新建事实节点' : '编辑事实节点'}</h2>
              </div>
              <button type="button" className="icon-btn" onClick={closeFactNodeModal}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="fact-node-form">
                <label className="wide">
                  <span className="field-label-row">
                    <span>事实摘要 <em className="required-tag">必填</em></span>
                  </span>
                  <input
                    type="text"
                    value={factNodeForm.title || ''}
                    onChange={(e) => handleFactNodeFormChange('title', e.target.value)}
                    placeholder="请输入事实节点的摘要标题，如：合同签订过程"
                  />
                </label>

                <label className="wide">
                  <span className="field-label-row">
                    <span>事实详情</span>
                  </span>
                  <textarea
                    value={factNodeForm.summary || ''}
                    onChange={(e) => handleFactNodeFormChange('summary', e.target.value)}
                    placeholder="请详细描述该事实节点的具体内容"
                    rows={4}
                  />
                </label>

                <label>
                  <span className="field-label-row">
                    <span>关联争议点</span>
                  </span>
                  <select
                    value={factNodeForm.issue || ''}
                    onChange={(e) => handleFactNodeFormChange('issue', e.target.value)}
                  >
                    <option value="">请选择争议点</option>
                    {getAllIssues(customIssues, selectedCaseName || workbenchCase, records).map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>

                <div className="date-range-row">
                  <label>
                    <span className="field-label-row">
                      <span>起始日期</span>
                    </span>
                    <input
                      type="date"
                      value={factNodeForm.dateFrom || ''}
                      onChange={(e) => handleFactNodeFormChange('dateFrom', e.target.value)}
                    />
                  </label>
                  <span className="date-range-separator">至</span>
                  <label>
                    <span className="field-label-row">
                      <span>结束日期</span>
                    </span>
                    <input
                      type="date"
                      value={factNodeForm.dateTo || ''}
                      onChange={(e) => handleFactNodeFormChange('dateTo', e.target.value)}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="ghost-btn" onClick={closeFactNodeModal}>取消</button>
              <button
                type="button"
                className="primary"
                onClick={confirmFactNode}
                disabled={!factNodeForm.title || !factNodeForm.title.trim()}
              >
                <Check size={18} />
                {factNodeModalMode === 'create' ? '创建节点' : '保存修改'}
              </button>
            </div>
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
                    <div className="section-header">
                      <h3 className="section-title">
                        <Check size={16} /> 字段识别结果
                      </h3>
                      <button
                        type="button"
                        className="secondary small-btn"
                        onClick={() => setShowFieldMapper(!showFieldMapper)}
                      >
                        {showFieldMapper ? <ChevronUp size={14} /> : <Settings size={14} />}
                        {showFieldMapper ? '收起映射' : '调整字段映射'}
                      </button>
                    </div>
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

                    {showFieldMapper && (
                      <div className="field-mapper-panel">
                        <div className="mapper-header">
                          <h4><ArrowRightLeft size={16} /> 字段映射配置</h4>
                          <button
                            type="button"
                            className="ghost-btn small-btn"
                            onClick={resetFieldMapping}
                          >
                            <RotateCcw size={14} /> 重置为自动匹配
                          </button>
                        </div>
                        <p className="hint mapper-hint">
                          <Info size={14} /> 为每列CSV数据选择对应的目标字段。带 <em>*</em> 标记的为必填字段。
                        </p>
                        <div className="mapper-table-wrap">
                          <table className="mapper-table">
                            <thead>
                              <tr>
                                <th style={{ width: 60 }}>列号</th>
                                <th>CSV列名</th>
                                <th style={{ width: 60 }}>示例值</th>
                                <th>映射到</th>
                              </tr>
                            </thead>
                            <tbody>
                              {importResult.headers.map((header, colIndex) => {
                                const autoMatchedKey = matchField(header);
                                const currentMapping = customFieldMapping[colIndex] !== undefined
                                  ? customFieldMapping[colIndex]
                                  : autoMatchedKey;
                                const sampleValue = importResult.rawRows[0]?.[colIndex] || '';

                                return (
                                  <tr key={colIndex}>
                                    <td className="col-num">{colIndex + 1}</td>
                                    <td className="col-name">
                                      <span className="header-text">{header}</span>
                                      {autoMatchedKey && customFieldMapping[colIndex] === undefined && (
                                        <span className="auto-match-badge">自动匹配</span>
                                      )}
                                      {customFieldMapping[colIndex] !== undefined && (
                                        <span className="manual-match-badge">手动映射</span>
                                      )}
                                    </td>
                                    <td className="sample-value">
                                      <code>{String(sampleValue).slice(0, 12)}{String(sampleValue).length > 12 ? '...' : ''}</code>
                                    </td>
                                    <td>
                                      <select
                                        className="field-select"
                                        value={currentMapping || ''}
                                        onChange={(e) => handleFieldMappingChange(colIndex, e.target.value || null)}
                                      >
                                        <option value="">-- 不导入此列 --</option>
                                        {ALL_FIELDS.map(fieldKey => {
                                          const field = appConfig.fields.find(f => f.key === fieldKey);
                                          const label = field?.label || (fieldKey === 'status' ? '当前状态' : fieldKey);
                                          const required = REQUIRED_FIELDS.includes(fieldKey);
                                          const customMappedCol = Object.entries(customFieldMapping).find(
                                            ([idx, mappedKey]) => Number(idx) !== colIndex && mappedKey === fieldKey
                                          );
                                          const autoMappedCol = importResult.fieldMapping[fieldKey];
                                          const isAutoMappedElsewhere = autoMappedCol !== undefined 
                                            && autoMappedCol !== colIndex 
                                            && customFieldMapping[autoMappedCol] === undefined;
                                          const isMappedElsewhere = customMappedCol !== undefined || isAutoMappedElsewhere;
                                          return (
                                            <option
                                              key={fieldKey}
                                              value={fieldKey}
                                              disabled={isMappedElsewhere}
                                            >
                                              {label}{required ? ' *' : ''}{isMappedElsewhere ? ' (已映射)' : ''}
                                            </option>
                                          );
                                        })}
                                      </select>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
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
                  <label>
                    <span><Shield size={13} /> 出卷分级模式</span>
                    <div className="export-select-wrap">
                      <Shield size={16} />
                      <select
                        value={exportConfig.exportLevel}
                        onChange={(e) => setExportConfig({ ...exportConfig, exportLevel: e.target.value })}
                      >
                        {VIEW_MODES.map((m) => (
                          <option key={m.key} value={m.key}>{m.label} — {m.desc}</option>
                        ))}
                      </select>
                    </div>
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
                      <span>{exportConfig.exportLevel === '机密' ? '机密材料' : '脱敏材料'}</span>
                      <strong>{exportConfig.exportLevel === '机密' ? exportStats.confidentialCount : exportStats.maskedCount}</strong>
                    </div>
                  </div>
                </div>
                {exportConfig.exportLevel !== '机密' && exportStats.maskedCount > 0 && (
                  <div className="export-mode-hint">
                    <Info size={14} />
                    当前出卷模式为「{exportConfig.exportLevel}」，{exportStats.maskedCount} 条超出级别的材料已自动脱敏展示
                  </div>
                )}
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
                          <tr key={item.id} className={item._masked ? 'preview-row-masked' : ''}>
                            <td className="row-num">{idx + 1}</td>
                            <td className="ev-name">
                              {item.evidence}
                              {item._masked && <em className="cell-masked-tag"><Shield size={10} />脱敏</em>}
                            </td>
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
              {exportConfig.exportLevel !== '机密' && (
                <span className={'toolbar-level-badge toolbar-' + exportConfig.exportLevel}>
                  <Shield size={12} /> {exportConfig.exportLevel}模式
                </span>
              )}
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
                <div className="print-meta-row">
                  <span>出卷分级：</span>
                  <strong style={{ color: VIEW_MODES.find(m => m.key === exportConfig.exportLevel)?.color }}>
                    {exportConfig.exportLevel}
                  </strong>
                </div>
                {exportConfig.exportLevel !== '机密' && exportStats.maskedCount > 0 && (
                  <div className="print-meta-row print-meta-note">
                    <span>备注：</span>
                    <strong style={{ color: '#dc2626' }}>
                      超出级别的 {exportStats.maskedCount} 条材料已脱敏
                    </strong>
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
                            <tr key={item.id} className={item._masked ? 'print-row-masked' : ''}>
                              <td className="pt-num">{idx + 1}</td>
                              <td className="pt-name">
                                {item.evidence}
                                {item._masked && <em className="print-masked-tag"><Shield size={10} />脱敏</em>}
                              </td>
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
                      <tr key={item.id} className={item._masked ? 'print-row-masked' : ''}>
                        <td className="pt-num">{idx + 1}</td>
                        <td className="pt-name">
                          {item.evidence}
                          {item._masked && <em className="print-masked-tag"><Shield size={10} />脱敏</em>}
                        </td>
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

      {showDataMgmt && (
        <div className="modal-overlay" onClick={closeDataMgmt}>
          <div className="modal data-mgmt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="panel-title" style={{ marginBottom: 0 }}>
                <Database size={18} />
                <h2>数据管理与版本控制</h2>
              </div>
              <button type="button" className="icon-btn" onClick={closeDataMgmt}>
                <X size={18} />
              </button>
            </div>

            <div className="data-mgmt-tabs">
              {DATA_MGMT_TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    className={`data-mgmt-tab ${dataMgmtTab === tab.key ? 'active' : ''}`}
                    onClick={() => setDataMgmtTab(tab.key)}
                  >
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="modal-body data-mgmt-body">
              {dataMgmtTab === 'version' && (
                <div className="dm-version-tab">
                  <div className="dm-version-current">
                    <div className="dm-version-badge">
                      <Database size={20} />
                      <div>
                        <span>当前数据版本</span>
                        <strong>v{CURRENT_SCHEMA_VERSION}</strong>
                      </div>
                    </div>
                    <p className="dm-version-desc">{SCHEMA_VERSIONS[CURRENT_SCHEMA_VERSION]?.description}</p>
                  </div>

                  <div className="dm-version-info-grid">
                    <div className="dm-info-card">
                      <FileSpreadsheet size={16} />
                      <div>
                        <span>证据记录数</span>
                        <strong>{records.length}</strong>
                      </div>
                    </div>
                    <div className="dm-info-card">
                      <History size={16} />
                      <div>
                        <span>迁移次数</span>
                        <strong>{loadMigrationHistory().length}</strong>
                      </div>
                    </div>
                    <div className="dm-info-card">
                      <Shield size={16} />
                      <div>
                        <span>快照数</span>
                        <strong>{listSnapshots().length}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="dm-schema-timeline">
                    <h3 className="dm-section-title"><GitBranch size={16} /> Schema版本历程</h3>
                    {Object.entries(SCHEMA_VERSIONS).reverse().map(([version, info]) => (
                      <div key={version} className={`dm-schema-step ${Number(version) === CURRENT_SCHEMA_VERSION ? 'current' : ''}`}>
                        <div className="dm-schema-dot-wrap">
                          {Number(version) === CURRENT_SCHEMA_VERSION ? <CircleDot size={14} /> : <span className="dm-schema-dot" />}
                        </div>
                        <div className="dm-schema-content">
                          <div className="dm-schema-head">
                            <strong>{info.label}</strong>
                            {Number(version) === CURRENT_SCHEMA_VERSION && <span className="dm-current-tag">当前</span>}
                          </div>
                          <p>{info.description}</p>
                          <div className="dm-schema-fields">
                            {info.fields.map((f) => (
                              <span key={f} className="dm-field-chip">{f}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="dm-actions-row">
                    <button type="button" className="dm-action-btn primary" onClick={handleExportBackup}>
                      <Download size={16} /> 导出备份文件
                    </button>
                  </div>
                </div>
              )}

              {dataMgmtTab === 'history' && (
                <div className="dm-history-tab">
                  {(() => {
                    const history = loadMigrationHistory();
                    return history.length > 0 ? (
                      <div className="dm-history-list">
                        {history.map((record) => (
                          <div key={record.id} className={`dm-history-card ${record.status === 'failed' ? 'failed' : ''}`}>
                            <div className="dm-history-head">
                              <div className="dm-history-version-tag">
                                <GitBranch size={14} />
                                <span>v{record.fromVersion} → v{record.toVersion}</span>
                              </div>
                              <span className={`dm-history-status ${record.status}`}>
                                {record.status === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                                {record.status === 'success' ? '成功' : '失败'}
                              </span>
                            </div>
                            <div className="dm-history-meta">
                              <span><CalendarDays size={12} /> {record.timestamp ? new Date(record.timestamp).toLocaleString('zh-CN') : '未知时间'}</span>
                              {record.recordCount != null && <span><FileSpreadsheet size={12} /> {record.recordCount} 条记录</span>}
                              {record.description && <span className="dm-history-desc"><Info size={12} /> {record.description}</span>}
                            </div>
                            {record.steps && record.steps.length > 0 && (
                              <div className="dm-history-steps">
                                {record.steps.map((step, i) => (
                                  <div key={i} className={`dm-step-item ${step.status}`}>
                                    <span className="dm-step-arrow"><ArrowRight size={12} /></span>
                                    <span>v{step.from} → v{step.to}</span>
                                    <span className="dm-step-status">{step.status === 'success' ? '✓' : '✗'}</span>
                                    {step.error && <span className="dm-step-error">{step.error}</span>}
                                    {step.description && <span className="dm-step-desc">{step.description}</span>}
                                  </div>
                                ))}
                              </div>
                            )}
                            {record.snapshotKey && (
                              <div className="dm-history-snapshot">
                                <Database size={12} /> 快照已保存
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="dm-empty">
                        <History size={40} />
                        <p>暂无迁移历史记录</p>
                        <p className="dm-empty-hint">当数据从旧版本自动升级时，迁移记录会出现在这里</p>
                      </div>
                    );
                  })()}
                </div>
              )}

              {dataMgmtTab === 'backup' && (
                <div className="dm-backup-tab">
                  <div className="dm-backup-upload">
                    <h3 className="dm-section-title"><Download size={16} /> 导入备份文件</h3>
                    <p className="dm-backup-hint">粘贴JSON备份内容或上传备份文件，系统将自动分析字段差异和潜在覆盖风险</p>
                    <div className="dm-backup-input-row">
                      <label className="dm-file-upload-btn">
                        <Upload size={16} />
                        <span>选择文件</span>
                        <input type="file" accept=".json" onChange={handleBackupFileUpload} style={{ display: 'none' }} />
                      </label>
                    </div>
                    <textarea
                      className="dm-backup-textarea"
                      value={backupImportText}
                      onChange={(e) => handleBackupTextChange(e.target.value)}
                      placeholder="粘贴JSON备份内容..."
                      rows={4}
                    />
                  </div>

                  {backupImportAnalysis && backupImportAnalysis.hasData && (
                    backupImportAnalysis.parseError ? (
                      <div className="dm-backup-error">
                        <AlertCircle size={16} />
                        <span>解析失败：{backupImportAnalysis.errorDetail}</span>
                      </div>
                    ) : (
                      <div className="dm-backup-analysis">
                        <h3 className="dm-section-title"><Eye size={16} /> 导入预检结果</h3>

                        <div className="dm-analysis-stats">
                          <div className="dm-analysis-stat">
                            <FileSpreadsheet size={16} />
                            <div>
                              <span>备份记录数</span>
                              <strong>{backupImportAnalysis.backupCounts.total}</strong>
                            </div>
                          </div>
                          <div className="dm-analysis-stat">
                            <Database size={16} />
                            <div>
                              <span>备份版本</span>
                              <strong>v{backupImportAnalysis.backupSchemaVersion}</strong>
                            </div>
                          </div>
                          <div className="dm-analysis-stat">
                            <FileText size={16} />
                            <div>
                              <span>当前记录数</span>
                              <strong>{backupImportAnalysis.currentCount}</strong>
                            </div>
                          </div>
                        </div>

                        <div className="dm-field-compare">
                          <h4>字段对比</h4>
                          <div className="dm-field-compare-grid">
                            <div className="dm-field-group dm-common-fields">
                              <span className="dm-field-group-label"><CheckCircle2 size={12} /> 共有字段 ({backupImportAnalysis.fieldComparison.commonFields.length})</span>
                              <div className="dm-field-chips">
                                {backupImportAnalysis.fieldComparison.commonFields.map((f) => (
                                  <span key={f} className="dm-field-chip matched">{f}</span>
                                ))}
                              </div>
                            </div>
                            {backupImportAnalysis.fieldComparison.extraFields.length > 0 && (
                              <div className="dm-field-group dm-extra-fields">
                                <span className="dm-field-group-label"><Plus size={12} /> 备份额外字段 ({backupImportAnalysis.fieldComparison.extraFields.length})</span>
                                <div className="dm-field-chips">
                                  {backupImportAnalysis.fieldComparison.extraFields.map((f) => (
                                    <span key={f} className="dm-field-chip extra">{f}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {backupImportAnalysis.fieldComparison.missingFields.length > 0 && (
                              <div className="dm-field-group dm-missing-fields">
                                <span className="dm-field-group-label"><AlertCircle size={12} /> 备份缺失字段 ({backupImportAnalysis.fieldComparison.missingFields.length})</span>
                                <div className="dm-field-chips">
                                  {backupImportAnalysis.fieldComparison.missingFields.map((f) => (
                                    <span key={f} className="dm-field-chip missing">{f}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className={`dm-risk-panel ${backupImportAnalysis.conflictAnalysis.riskLevel}`}>
                          <h4>
                            {backupImportAnalysis.conflictAnalysis.riskLevel === 'high' && <AlertTriangle size={16} />}
                            {backupImportAnalysis.conflictAnalysis.riskLevel === 'medium' && <AlertCircle size={16} />}
                            {backupImportAnalysis.conflictAnalysis.riskLevel === 'low' && <CheckCircle2 size={16} />}
                            覆盖风险评估
                          </h4>
                          <div className="dm-risk-details">
                            <div className="dm-risk-item">
                              <span>ID冲突记录数</span>
                              <strong>{backupImportAnalysis.conflictAnalysis.overlappingIds}</strong>
                            </div>
                            <div className="dm-risk-item">
                              <span>内容重复记录数（同案件+同证据名）</span>
                              <strong>{backupImportAnalysis.conflictAnalysis.overlappingContent}</strong>
                            </div>
                          </div>
                          <div className="dm-risk-level">
                            风险等级：
                            <span className={`dm-risk-tag ${backupImportAnalysis.conflictAnalysis.riskLevel}`}>
                              {backupImportAnalysis.conflictAnalysis.riskLevel === 'high' ? '高风险' : backupImportAnalysis.conflictAnalysis.riskLevel === 'medium' ? '中风险' : '低风险'}
                            </span>
                          </div>
                          {backupImportAnalysis.conflictAnalysis.riskLevel !== 'low' && (
                            <p className="dm-risk-advice">
                              {backupImportAnalysis.conflictAnalysis.riskLevel === 'high'
                                ? '存在ID冲突，建议选择「按ID覆盖」以避免数据混乱，或先导出当前备份再操作'
                                : '存在内容重复，建议选择「按案件+证据材料合并」或手动处理'}
                            </p>
                          )}
                        </div>

                        <div className="dm-merge-strategy">
                          <h4><Layers size={16} /> 合并策略选择</h4>
                          <div className="dm-strategy-options">
                            <label className={`dm-strategy-option ${mergeStrategy === 'addOnly' ? 'active' : ''}`}>
                              <input
                                type="radio"
                                name="mergeStrategy"
                                value="addOnly"
                                checked={mergeStrategy === 'addOnly'}
                                onChange={(e) => setMergeStrategy(e.target.value)}
                              />
                              <div className="dm-strategy-content">
                                <div className="dm-strategy-title"><Plus size={14} /> 只新增</div>
                                <div className="dm-strategy-desc">仅导入没有冲突的新记录，ID或内容冲突的记录将被跳过</div>
                              </div>
                            </label>
                            <label className={`dm-strategy-option ${mergeStrategy === 'overwriteById' ? 'active' : ''}`}>
                              <input
                                type="radio"
                                name="mergeStrategy"
                                value="overwriteById"
                                checked={mergeStrategy === 'overwriteById'}
                                onChange={(e) => setMergeStrategy(e.target.value)}
                              />
                              <div className="dm-strategy-content">
                                <div className="dm-strategy-title"><ArrowRightLeft size={14} /> 按ID覆盖</div>
                                <div className="dm-strategy-desc">ID相同的记录将被备份数据覆盖，无ID或ID不冲突的作为新记录添加</div>
                              </div>
                            </label>
                            <label className={`dm-strategy-option ${mergeStrategy === 'mergeByCaseEvidence' ? 'active' : ''}`}>
                              <input
                                type="radio"
                                name="mergeStrategy"
                                value="mergeByCaseEvidence"
                                checked={mergeStrategy === 'mergeByCaseEvidence'}
                                onChange={(e) => setMergeStrategy(e.target.value)}
                              />
                              <div className="dm-strategy-content">
                                <div className="dm-strategy-title"><GitBranch size={14} /> 按案件+证据材料合并</div>
                                <div className="dm-strategy-desc">优先按「案件名称+证据材料」匹配覆盖，其次按ID匹配，无匹配则新增</div>
                              </div>
                            </label>
                          </div>
                        </div>

                        {backupImportAnalysis.strategyPreviews && backupImportAnalysis.strategyPreviews[mergeStrategy] && (
                          <div className="dm-merge-preview">
                            <h4><Eye size={16} /> 导入预览</h4>
                            <div className="dm-preview-stats">
                              <div className="dm-preview-stat add">
                                <Plus size={16} />
                                <div>
                                  <span>新增</span>
                                  <strong>{backupImportAnalysis.strategyPreviews[mergeStrategy].addCount}</strong>
                                </div>
                              </div>
                              <div className="dm-preview-stat overwrite">
                                <ArrowRightLeft size={16} />
                                <div>
                                  <span>覆盖</span>
                                  <strong>{backupImportAnalysis.strategyPreviews[mergeStrategy].overwriteCount}</strong>
                                </div>
                              </div>
                              <div className="dm-preview-stat skip">
                                <X size={16} />
                                <div>
                                  <span>跳过</span>
                                  <strong>{backupImportAnalysis.strategyPreviews[mergeStrategy].skipCount}</strong>
                                </div>
                              </div>
                            </div>

                            {backupImportAnalysis.strategyPreviews[mergeStrategy].addSamples.length > 0 && (
                              <div className="dm-preview-samples">
                                <h5><span className="sample-tag add">新增样例</span></h5>
                                <div className="dm-sample-list">
                                  {backupImportAnalysis.strategyPreviews[mergeStrategy].addSamples.map((s, i) => (
                                    <div key={i} className="dm-sample-item">
                                      <span className="dm-sample-case">{s.caseName}</span>
                                      <span className="dm-sample-arrow">→</span>
                                      <span className="dm-sample-evidence">{s.evidence}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {backupImportAnalysis.strategyPreviews[mergeStrategy].overwriteSamples.length > 0 && (
                              <div className="dm-preview-samples">
                                <h5><span className="sample-tag overwrite">覆盖样例</span></h5>
                                <div className="dm-sample-list">
                                  {backupImportAnalysis.strategyPreviews[mergeStrategy].overwriteSamples.map((s, i) => (
                                    <div key={i} className="dm-sample-item overwrite">
                                      <div className="dm-sample-existing">
                                        <span className="dm-sample-label">现有:</span>
                                        <span className="dm-sample-case">{s.existing.caseName}</span>
                                        <span className="dm-sample-evidence">{s.existing.evidence}</span>
                                        <span className="dm-sample-status">{s.existing.status}</span>
                                      </div>
                                      <div className="dm-sample-arrow-row">
                                        <ArrowRight size={12} />
                                      </div>
                                      <div className="dm-sample-incoming">
                                        <span className="dm-sample-label">导入:</span>
                                        <span className="dm-sample-case">{s.incoming.caseName}</span>
                                        <span className="dm-sample-evidence">{s.incoming.evidence}</span>
                                        <span className="dm-sample-status">{s.incoming.status}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {backupImportAnalysis.strategyPreviews[mergeStrategy].skipSamples.length > 0 && (
                              <div className="dm-preview-samples">
                                <h5><span className="sample-tag skip">跳过样例</span></h5>
                                <div className="dm-sample-list">
                                  {backupImportAnalysis.strategyPreviews[mergeStrategy].skipSamples.map((s, i) => (
                                    <div key={i} className="dm-sample-item skip">
                                      <span className="dm-sample-case">{s.caseName}</span>
                                      <span className="dm-sample-arrow">→</span>
                                      <span className="dm-sample-evidence">{s.evidence}</span>
                                      <span className="dm-sample-reason">（已存在）</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="dm-backup-actions">
                          <button
                            type="button"
                            className="dm-action-btn primary"
                            onClick={confirmMergeImport}
                            disabled={!backupImportAnalysis.strategyPreviews || !backupImportAnalysis.strategyPreviews[mergeStrategy]}
                          >
                            <CheckCircle2 size={16} /> 确认导入
                            <span className="dm-action-sub">
                              （新增{backupImportAnalysis.strategyPreviews?.[mergeStrategy]?.addCount || 0}
                              {backupImportAnalysis.strategyPreviews?.[mergeStrategy]?.overwriteCount > 0 &&
                                `，覆盖${backupImportAnalysis.strategyPreviews[mergeStrategy].overwriteCount}`}
                              {backupImportAnalysis.strategyPreviews?.[mergeStrategy]?.skipCount > 0 &&
                                `，跳过${backupImportAnalysis.strategyPreviews[mergeStrategy].skipCount}`}
                              ）
                            </span>
                          </button>
                        </div>
                      </div>
                    )
                  )}

                  {!backupImportAnalysis && (
                    <div className="dm-empty">
                      <Download size={40} />
                      <p>请粘贴或上传备份文件以开始预检</p>
                    </div>
                  )}
                </div>
              )}

              {dataMgmtTab === 'recovery' && (
                <div className="dm-recovery-tab">
                  {rollbackStatus && (
                    <div className={`dm-rollback-status ${rollbackStatus.success ? 'success' : 'failed'}`}>
                      {rollbackStatus.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                      <span>{rollbackStatus.message}</span>
                      <button type="button" onClick={() => setRollbackStatus(null)}><X size={14} /></button>
                    </div>
                  )}

                  <h3 className="dm-section-title"><RotateCcw size={16} /> 可用快照</h3>
                  <p className="dm-recovery-hint">每次迁移前会自动创建数据快照，可从任意快照恢复数据</p>
                  {(() => {
                    const snapshots = listSnapshots();
                    return snapshots.length > 0 ? (
                      <div className="dm-snapshot-list">
                        {snapshots.map((snap) => (
                          <div key={snap.key} className="dm-snapshot-card">
                            <div className="dm-snapshot-head">
                              <div className="dm-snapshot-version">
                                <Database size={14} />
                                <strong>v{snap.version}</strong>
                              </div>
                              <span className="dm-snapshot-count">{snap.recordCount} 条记录</span>
                            </div>
                            <div className="dm-snapshot-meta">
                              <span><CalendarDays size={12} /> {snap.timestamp ? new Date(snap.timestamp).toLocaleString('zh-CN') : '未知时间'}</span>
                            </div>
                            <div className="dm-snapshot-actions">
                              <button type="button" className="dm-action-btn primary" onClick={() => handleRollback(snap.key)}>
                                <RotateCcw size={14} /> 恢复到此版本
                              </button>
                              <button type="button" className="dm-action-btn ghost" onClick={() => handleDeleteSnapshot(snap.key)}>
                                <Trash2 size={14} /> 删除快照
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="dm-empty">
                        <Database size={40} />
                        <p>暂无可用快照</p>
                        <p className="dm-empty-hint">迁移操作会自动创建快照，可从快照恢复到之前的版本</p>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="ghost-btn" onClick={closeDataMgmt}>关闭</button>
            </div>
          </div>
        </div>
      )}

      {showEvidencePicker && workbenchCase && (
        <div className="modal-overlay" onClick={() => setShowEvidencePicker(false)}>
          <div className="modal evidence-picker-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="panel-title" style={{ marginBottom: 0 }}>
                <ClipboardList size={18} />
                <h2>从已有证据带入</h2>
                <span className="evidence-picker-case-tag">{workbenchCase}</span>
              </div>
              <button type="button" className="icon-btn" onClick={() => setShowEvidencePicker(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body evidence-picker-body">
              <p className="evidence-picker-hint">
                <Info size={14} /> 选择一条已有证据后将复用案件、来源、争议点、保密等级等字段，证据材料和证明目的需手动填写。
              </p>
              <div className="evidence-picker-search">
                <Search size={16} />
                <input
                  value={evidencePickerSearch}
                  onChange={(e) => setEvidencePickerSearch(e.target.value)}
                  placeholder="搜索证据名称、来源、争议点"
                  autoFocus
                />
              </div>
              <div className="evidence-picker-list">
                {wbRecords
                  .filter((item) => {
                    if (!evidencePickerSearch) return true;
                    const q = evidencePickerSearch.toLowerCase();
                    return `${item.evidence}${item.source}${item.issue}`.toLowerCase().includes(q);
                  })
                  .map((item) => (
                    <div
                      key={item.id}
                      className="evidence-picker-item"
                      onClick={() => {
                        setForm({
                          ...appConfig.defaultValues,
                          caseName: workbenchCase,
                          source: item.source || '',
                          issue: item.issue || '',
                          level: item.level || '',
                          evidence: item.evidence || '',
                          purpose: item.purpose || '',
                          date: '',
                        });
                        setShowEvidencePicker(false);
                        setEvidencePickerSearch('');
                      }}
                    >
                      <div className="evidence-picker-item-head">
                        <h4>{item.evidence}</h4>
                        <span className={'status ' + statusClass(item.status)}>{item.status}</span>
                      </div>
                      <div className="evidence-picker-item-meta">
                        <span><Briefcase size={12} />来源：{item.source || '未标注'}</span>
                        <span><Target size={12} />争议点：{item.issue || '未关联'}</span>
                        <span><Shield size={12} />密级：{item.level || '内部'}</span>
                      </div>
                      <p className="evidence-picker-item-purpose">{item.purpose || '无证明目的'}</p>
                    </div>
                  ))}
                {wbRecords.filter((item) => {
                  if (!evidencePickerSearch) return true;
                  const q = evidencePickerSearch.toLowerCase();
                  return `${item.evidence}${item.source}${item.issue}`.toLowerCase().includes(q);
                }).length === 0 && (
                  <div className="wb-empty-hint">
                    <Search size={32} />
                    <p>{evidencePickerSearch ? '未找到匹配的证据记录' : '当前案件暂无证据记录'}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="ghost-btn" onClick={() => setShowEvidencePicker(false)}>取消</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
