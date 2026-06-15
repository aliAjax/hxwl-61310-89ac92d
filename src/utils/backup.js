import { ALL_FIELDS } from './index';
import { appConfig, uid, today } from './storage';

export function analyzeBackupImport(backupText, currentRecords) {
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

export function prepareIncomingRecord(r, strategy, by) {
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
