import { ALL_FIELDS } from './index';
import { appConfig, uid, today, ensureRecordIntegrity, runMigrations, CURRENT_SCHEMA_VERSION } from './storage';

export const WORK_PACKAGE_VERSION = 1;
export const WORK_PACKAGE_TYPE = 'hxwl-case-work-package';

export function buildWorkPackage(caseName, allRecords, allTemplates, allCustomIssues, allTasks, allFactNodes, selectedSections) {
  const caseRecords = allRecords.filter(r => r.caseName === caseName);
  const caseRecordIds = new Set(caseRecords.map(r => r.id));

  const caseCustomIssues = {};
  if (selectedSections.includes('customIssues')) {
    if (allCustomIssues[caseName]) {
      caseCustomIssues[caseName] = allCustomIssues[caseName];
    }
  }

  const casePurposeTemplates = { custom: {}, favorites: {}, recent: {} };
  if (selectedSections.includes('purposeTemplates')) {
    const caseIssueSet = new Set([
      ...(caseCustomIssues[caseName] || []),
      ...caseRecords.map(r => r.issue).filter(Boolean)
    ]);
    caseIssueSet.forEach(issue => {
      if (allTemplates.custom?.[issue]) casePurposeTemplates.custom[issue] = allTemplates.custom[issue];
      if (allTemplates.favorites?.[issue]) casePurposeTemplates.favorites[issue] = allTemplates.favorites[issue];
      if (allTemplates.recent?.[issue]) casePurposeTemplates.recent[issue] = allTemplates.recent[issue];
    });
  }

  let caseTasks = [];
  if (selectedSections.includes('tasks')) {
    caseTasks = allTasks.filter(t =>
      t.caseName === caseName ||
      (t.evidenceId && caseRecordIds.has(t.evidenceId))
    );
  }

  let caseFactNodes = [];
  if (selectedSections.includes('factNodes')) {
    caseFactNodes = allFactNodes.filter(n => n.caseName === caseName);
  }

  return {
    _type: WORK_PACKAGE_TYPE,
    _packageVersion: WORK_PACKAGE_VERSION,
    _schemaVersion: CURRENT_SCHEMA_VERSION,
    _exportedAt: new Date().toISOString(),
    _exportedBy: navigator.userAgent ? '浏览器客户端' : '未知',
    caseName,
    _sections: selectedSections,
    _stats: {
      recordCount: caseRecords.length,
      customIssueCount: caseCustomIssues[caseName]?.length || 0,
      templateIssueCount: Object.keys(casePurposeTemplates.custom).length,
      taskCount: caseTasks.length,
      factNodeCount: caseFactNodes.length,
    },
    records: caseRecords,
    customIssues: caseCustomIssues,
    purposeTemplates: casePurposeTemplates,
    tasks: caseTasks,
    factNodes: caseFactNodes,
  };
}

export function downloadWorkPackage(workPackage) {
  const safeCaseName = workPackage.caseName.replace(/[\\/:*?"<>|]/g, '_');
  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = `案件工作包_${safeCaseName}_${dateStr}.json`;
  const blob = new Blob([JSON.stringify(workPackage, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
  return fileName;
}

export function parseWorkPackage(rawText) {
  if (!rawText || !rawText.trim()) {
    return { valid: false, error: '工作包内容为空' };
  }
  let data;
  try {
    data = JSON.parse(rawText);
  } catch (e) {
    return { valid: false, error: '无法解析为有效JSON：' + e.message };
  }
  if (!data || data._type !== WORK_PACKAGE_TYPE) {
    return { valid: false, error: '不是合法的案件工作包文件（缺少_type标识）' };
  }
  if (typeof data._packageVersion !== 'number') {
    return { valid: false, error: '工作包版本号缺失' };
  }
  if (data._packageVersion > WORK_PACKAGE_VERSION) {
    return { valid: false, error: `工作包版本 v${data._packageVersion} 高于当前支持版本 v${WORK_PACKAGE_VERSION}，请升级应用` };
  }
  if (typeof data._schemaVersion !== 'number') {
    return { valid: false, error: '数据schema版本缺失' };
  }
  if (!data.caseName || !String(data.caseName).trim()) {
    return { valid: false, error: '工作包未指定案件名称' };
  }
  if (!Array.isArray(data.records)) {
    return { valid: false, error: '工作包证据记录格式错误' };
  }
  if (data._schemaVersion < CURRENT_SCHEMA_VERSION) {
    const migrationResult = runMigrations(data.records, data._schemaVersion, CURRENT_SCHEMA_VERSION);
    if (!migrationResult.success) {
      return { valid: false, error: '工作包数据迁移失败：' + (migrationResult.steps.find(s => s.status === 'failed')?.error || '未知错误') };
    }
    data.records = ensureRecordIntegrity(migrationResult.records);
    data._schemaVersion = CURRENT_SCHEMA_VERSION;
  } else {
    data.records = ensureRecordIntegrity(data.records);
  }
  if (data._packageVersion < WORK_PACKAGE_VERSION) {
    if (!data.customIssues) data.customIssues = {};
    if (!data.purposeTemplates) data.purposeTemplates = { custom: {}, favorites: {}, recent: {} };
    if (!data.tasks) data.tasks = [];
    if (!data.factNodes) data.factNodes = [];
    if (!data._sections) data._sections = ['records', 'customIssues', 'purposeTemplates', 'tasks', 'factNodes'];
  }
  return { valid: true, data };
}

export function computeRecordHash(record) {
  const { id, caseName, evidence, source, date, purpose, issue, level, status } = record;
  return JSON.stringify({ id, caseName, evidence, source, date, purpose, issue, level, status });
}

export function recordsEqual(a, b) {
  if (!a || !b) return false;
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) {
    if (k === 'timeline' || k === 'createdAt' || k.startsWith('_')) continue;
    const va = a[k];
    const vb = b[k];
    if (typeof va === 'object' && typeof vb === 'object' && va !== null && vb !== null) {
      if (JSON.stringify(va) !== JSON.stringify(vb)) return false;
    } else if (va !== vb) {
      return false;
    }
  }
  return true;
}

export function detectWorkPackageConflicts(workPackageData, localRecords, localTemplates, localCustomIssues, localTasks, localFactNodes) {
  const { caseName, records: wpRecords, customIssues: wpCustomIssues, purposeTemplates: wpTemplates, tasks: wpTasks, factNodes: wpFactNodes } = workPackageData;

  const localIdMap = new Map(localRecords.map(r => [r.id, r]));
  const localCaseEvidenceMap = new Map(localRecords.filter(r => r.caseName === caseName).map(r => [`${r.caseName}||${r.evidence}`, r]));

  const recordConflicts = [];
  const recordAdditions = [];
  wpRecords.forEach(wpRec => {
    let localById = wpRec.id && localIdMap.get(wpRec.id);
    const key = `${wpRec.caseName}||${wpRec.evidence}`;
    const localByContent = localCaseEvidenceMap.get(key);
    const localMatch = localById || localByContent;
    if (!localMatch) {
      recordAdditions.push({ type: 'add', item: wpRec, matchKey: localById ? 'id' : (localByContent ? 'content' : 'none') });
    } else {
      if (recordsEqual(wpRec, localMatch)) {
      } else {
        const fieldDiffs = {};
        const allKeys = new Set([...Object.keys(wpRec), ...Object.keys(localMatch)]);
        allKeys.forEach(k => {
          if (k === 'timeline' || k === 'createdAt' || k.startsWith('_')) return;
          const va = wpRec[k];
          const vb = localMatch[k];
          const sa = typeof va === 'object' ? JSON.stringify(va) : String(va ?? '');
          const sb = typeof vb === 'object' ? JSON.stringify(vb) : String(vb ?? '');
          if (sa !== sb) {
            fieldDiffs[k] = { incoming: va, local: vb };
          }
        });
        recordConflicts.push({
          type: 'conflict',
          incoming: wpRec,
          local: localMatch,
          matchKey: localById ? 'id' : 'content',
          fieldDiffs,
          resolution: 'ask',
        });
      }
    }
  });

  const localCaseRecords = localRecords.filter(r => r.caseName === caseName);
  const wpRecordSet = new Set(wpRecords.map(r => r.id));
  const wpCaseEvidenceSet = new Set(wpRecords.map(r => `${r.caseName}||${r.evidence}`));
  const recordLocalsOnly = localCaseRecords.filter(r => !wpRecordSet.has(r.id) && !wpCaseEvidenceSet.has(`${r.caseName}||${r.evidence}`));

  const localIssueSet = new Set(localCustomIssues[caseName] || []);
  const wpIssueSet = new Set(wpCustomIssues[caseName] || []);
  const customIssueConflicts = [];
  wpIssueSet.forEach(issue => {
    if (!localIssueSet.has(issue)) {
      customIssueConflicts.push({ type: 'add', item: issue });
    }
  });

  const customIssueLocalsOnly = [...localIssueSet].filter(i => !wpIssueSet.has(i));

  const templateConflicts = [];
  const wpCustom = wpTemplates.custom || {};
  const localCustom = localTemplates.custom || {};
  Object.entries(wpCustom).forEach(([issue, templates]) => {
    const localTemps = localCustom[issue] || [];
    const localTempSet = new Set(localTemps);
    templates.forEach(t => {
      if (!localTempSet.has(t)) {
        templateConflicts.push({ type: 'add', issue, item: t });
      }
    });
  });

  const localTaskIdMap = new Map(localTasks.map(t => [t.id, t]));
  const taskConflicts = [];
  const taskAdditions = [];
  wpTasks.forEach(wpTask => {
    const localMatch = wpTask.id && localTaskIdMap.get(wpTask.id);
    if (!localMatch) {
      taskAdditions.push({ type: 'add', item: wpTask });
    } else if (!recordsEqual(wpTask, localMatch)) {
      const fieldDiffs = {};
      const keys = new Set([...Object.keys(wpTask), ...Object.keys(localMatch)]);
      keys.forEach(k => {
        if (k === 'timeline' || k === 'createdAt' || k.startsWith('_')) return;
        const va = wpTask[k];
        const vb = localMatch[k];
        if (JSON.stringify(va ?? '') !== JSON.stringify(vb ?? '')) {
          fieldDiffs[k] = { incoming: va, local: vb };
        }
      });
      if (Object.keys(fieldDiffs).length > 0) {
        taskConflicts.push({
          type: 'conflict',
          incoming: wpTask,
          local: localMatch,
          fieldDiffs,
          resolution: 'ask',
        });
      }
    }
  });

  const localFactIdMap = new Map(localFactNodes.map(n => [n.id, n]));
  const factNodeConflicts = [];
  const factNodeAdditions = [];
  wpFactNodes.forEach(wpNode => {
    const localMatch = wpNode.id && localFactIdMap.get(wpNode.id);
    if (!localMatch) {
      factNodeAdditions.push({ type: 'add', item: wpNode });
    } else if (!recordsEqual(wpNode, localMatch)) {
      const fieldDiffs = {};
      const keys = new Set([...Object.keys(wpNode), ...Object.keys(localMatch)]);
      keys.forEach(k => {
        if (k === 'createdAt' || k.startsWith('_')) return;
        const va = wpNode[k];
        const vb = localMatch[k];
        if (JSON.stringify(va ?? '') !== JSON.stringify(vb ?? '')) {
          fieldDiffs[k] = { incoming: va, local: vb };
        }
      });
      if (Object.keys(fieldDiffs).length > 0) {
        factNodeConflicts.push({
          type: 'conflict',
          incoming: wpNode,
          local: localMatch,
          fieldDiffs,
          resolution: 'ask',
        });
      }
    }
  });

  return {
    records: { additions: recordAdditions, conflicts: recordConflicts, localsOnly: recordLocalsOnly },
    customIssues: { additions: customIssueConflicts, localsOnly: customIssueLocalsOnly },
    purposeTemplates: { additions: templateConflicts },
    tasks: { additions: taskAdditions, conflicts: taskConflicts },
    factNodes: { additions: factNodeAdditions, conflicts: factNodeConflicts },
  };
}

export function applyWorkPackageMerge(workPackageData, resolutions, localRecords, localTemplates, localCustomIssues, localTasks, localFactNodes) {
  const { caseName, records: wpRecords, customIssues: wpCustomIssues, purposeTemplates: wpTemplates, tasks: wpTasks, factNodes: wpFactNodes } = workPackageData;

  let finalRecords = [...localRecords];
  const wpIdToResolution = new Map();
  resolutions.records.forEach(r => {
    const key = r.matchKey === 'content' ? `content:${r.incoming?.caseName || r.local?.caseName}||${r.incoming?.evidence || r.local?.evidence}` : `id:${r.incoming?.id || r.local?.id}`;
    wpIdToResolution.set(key, r.resolution);
  });

  const processedRecordIds = new Set();
  const localIdMap = new Map(localRecords.map(r => [r.id, r]));
  const localCaseEvidenceMap = new Map(localRecords.filter(r => r.caseName === caseName).map(r => [`${r.caseName}||${r.evidence}`, r]));

  resolutions.records.forEach(conflict => {
    const localRec = conflict.local;
    const incoming = conflict.incoming;
    if (!localRec) return;
    const idx = finalRecords.findIndex(r => r.id === localRec.id);
    if (idx === -1) return;
    if (conflict.resolution === 'keepLocal') {
      processedRecordIds.add(localRec.id);
    } else if (conflict.resolution === 'useIncoming') {
      finalRecords[idx] = {
        ...incoming,
        id: localRec.id,
        createdAt: localRec.createdAt,
        timeline: [
          ...(localRec.timeline || []),
          { status: incoming.status || localRec.status || '工作包合并', at: today, by: '工作包导入（采用导入）' }
        ],
      };
      processedRecordIds.add(localRec.id);
    } else if (conflict.resolution === 'mergeFields' && conflict.fieldResolutions) {
      const merged = { ...localRec };
      Object.entries(conflict.fieldResolutions || {}).forEach(([field, choice]) => {
        if (choice === 'incoming') {
          merged[field] = incoming[field];
        }
      });
      merged.timeline = [
        ...(localRec.timeline || []),
        { status: merged.status || localRec.status, at: today, by: '工作包导入（逐字段合并' }
      ];
      finalRecords[idx] = merged;
      processedRecordIds.add(localRec.id);
    }
  });

  wpRecords.forEach(wpRec => {
    const localById = wpRec.id && localIdMap.get(wpRec.id);
    const key = `${wpRec.caseName}||${wpRec.evidence}`;
    const localByContent = localCaseEvidenceMap.get(key);
    const localMatch = localById || localByContent;
    const matchType = localById ? 'id' : (localByContent ? 'content' : 'none');
    const resKey = matchType === 'content' ? `content:${key}` : `id:${localMatch?.id || wpRec.id}`;
    const resolution = wpIdToResolution.get(resKey);
    if (!localMatch) {
      if (resolution !== 'skip') {
        finalRecords.push({
          ...wpRec,
          id: wpRec.id || uid(),
          timeline: [
            ...(wpRec.timeline || []),
            { status: wpRec.status || appConfig.primaryStatus, at: today, by: '工作包导入（新增）' }
          ],
          createdAt: wpRec.createdAt || new Date().toISOString(),
        });
      }
    } else if (matchType === 'content' && !processedRecordIds.has(localMatch.id)) {
      const idx = finalRecords.findIndex(r => r.id === localMatch.id);
      if (idx !== -1) {
        if (resolution === 'useIncoming') {
          finalRecords[idx] = {
            ...wpRec,
            id: localMatch.id,
            createdAt: localMatch.createdAt,
            timeline: [
              ...(localMatch.timeline || []),
              { status: wpRec.status || localMatch.status, at: today, by: '工作包导入（采用导入）' }
            ],
          };
        } else if (resolution === 'mergeFields' && resolution && resolution.fieldResolutions) {
          const merged = { ...localMatch };
          Object.entries(resolution.fieldResolutions || {}).forEach(([field, choice]) => {
            if (choice === 'incoming') {
              merged[field] = wpRec[field];
            }
          });
          merged.timeline = [
            ...(localMatch.timeline || []),
            { status: merged.status, at: today, by: '工作包导入（逐字段合并）' }
          ];
          finalRecords[idx] = merged;
        }
        processedRecordIds.add(localMatch.id);
      }
    }
  });

  let finalCustomIssues = { ...localCustomIssues };
  if (wpCustomIssues[caseName]) {
    const existing = new Set(finalCustomIssues[caseName] || []);
    const toAdd = [];
    wpCustomIssues[caseName].forEach(issue => {
      const res = resolutions.customIssues.find(r => r.item === issue);
      if (!existing.has(issue) && (!res || res.resolution !== 'skip')) {
        toAdd.push(issue);
      }
    });
    if (toAdd.length > 0) {
      finalCustomIssues[caseName] = [...existing, ...toAdd];
    }
  }

  let finalTemplates = { custom: { ...localTemplates.custom }, favorites: { ...localTemplates.favorites }, recent: { ...localTemplates.recent } };
  Object.entries(wpTemplates.custom || {}).forEach(([issue, templates]) => {
    const existing = new Set(finalTemplates.custom[issue] || []);
    const toAdd = [];
    templates.forEach(t => {
      const res = resolutions.purposeTemplates.find(r => r.issue === issue && r.item === t);
      if (!existing.has(t) && (!res || res.resolution !== 'skip')) {
        toAdd.push(t);
      }
    });
    if (toAdd.length > 0) {
      finalTemplates.custom[issue] = [...existing, ...toAdd];
    }
  });
  const wpFav = wpTemplates.favorites || {};
  Object.entries(wpFav).forEach(([issue, favs]) => {
    const existing = new Set(finalTemplates.favorites[issue] || []);
    favs.forEach(f => { if (!existing.has(f)) existing.add(f); });
    if (existing.size > 0) finalTemplates.favorites[issue] = [...existing];
  });
  const wpRecent = wpTemplates.recent || {};
  Object.entries(wpRecent).forEach(([issue, recentMap]) => {
    finalTemplates.recent[issue] = { ...(finalTemplates.recent[issue] || {}), ...recentMap };
  });

  let finalTasks = [...localTasks];
  const localTaskIdMap = new Map(localTasks.map(t => [t.id, t]));
  resolutions.tasks.forEach(conflict => {
    const idx = finalTasks.findIndex(t => t.id === conflict.local?.id);
    if (idx !== -1) {
      if (conflict.resolution === 'keepLocal') {
      } else if (conflict.resolution === 'useIncoming') {
        finalTasks[idx] = {
          ...conflict.incoming,
          id: conflict.local.id,
          createdAt: conflict.local.createdAt,
        };
      }
    }
  });
  wpTasks.forEach(wpTask => {
    if (!wpTask.id || !localTaskIdMap.has(wpTask.id)) {
      const hasConflict = resolutions.tasks.some(t => t.local?.id === wpTask.id);
      if (!hasConflict) {
        finalTasks.push({
          ...wpTask,
          id: wpTask.id || uid(),
          createdAt: wpTask.createdAt || new Date().toISOString(),
        });
      }
    }
  });

  let finalFactNodes = [...localFactNodes];
  const localFactIdMap = new Map(localFactNodes.map(n => [n.id, n]));
  resolutions.factNodes.forEach(conflict => {
    const idx = finalFactNodes.findIndex(n => n.id === conflict.local?.id);
    if (idx !== -1) {
      if (conflict.resolution === 'keepLocal') {
      } else if (conflict.resolution === 'useIncoming') {
        finalFactNodes[idx] = {
          ...conflict.incoming,
          id: conflict.local.id,
          createdAt: conflict.local.createdAt,
        };
      }
    }
  });
  wpFactNodes.forEach(wpNode => {
    if (!wpNode.id || !localFactIdMap.has(wpNode.id)) {
      const hasConflict = resolutions.factNodes.some(n => n.local?.id === wpNode.id);
      if (!hasConflict) {
        finalFactNodes.push({
          ...wpNode,
          id: wpNode.id || uid(),
          createdAt: wpNode.createdAt || new Date().toISOString(),
        });
      }
    }
  });

  return {
    records: ensureRecordIntegrity(finalRecords),
    customIssues: finalCustomIssues,
    purposeTemplates: finalTemplates,
    tasks: finalTasks,
    factNodes: finalFactNodes,
  };
}
