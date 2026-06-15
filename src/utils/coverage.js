export const LEVEL_RANK = { '公开': 0, '内部': 1, '机密': 2 };
export const MODE_MAX_VISIBLE_LEVEL = { '公开': LEVEL_RANK['公开'], '内部': LEVEL_RANK['内部'], '机密': LEVEL_RANK['机密'] };

export function isRecordMasked(item, mode) {
  const itemLevel = LEVEL_RANK[item.level] ?? 1;
  const visibleLevel = MODE_MAX_VISIBLE_LEVEL[mode] ?? 0;
  return itemLevel > visibleLevel;
}

export function maskText(text, type = 'default') {
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

export function applyMaskToRecord(item, mode) {
  if (!isRecordMasked(item, mode)) return item;
  return {
    ...item,
    evidence: maskText(item.evidence, 'evidence'),
    source: maskText(item.source, 'source'),
    purpose: maskText(item.purpose, 'purpose'),
    _masked: true,
  };
}

export function getProcessedRecords(items, mode) {
  return items.map((item) => applyMaskToRecord(item, mode));
}

export function processSingleRecord(item, mode) {
  if (!item) return item;
  return applyMaskToRecord(item, mode);
}

export function getSearchableText(item, mode) {
  const masked = applyMaskToRecord(item, mode);
  return `${masked.caseName}${masked.evidence}${masked.issue}`;
}
