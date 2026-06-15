import { parseCSV, matchField, REQUIRED_FIELDS, ALL_FIELDS } from './csvParser';

function getFieldLabel(fieldKey, fieldsConfig) {
  const field = fieldsConfig?.find?.(f => f.key === fieldKey);
  return field?.label || (fieldKey === 'status' ? '当前状态' : fieldKey);
}

function buildImportPreview(text, fieldsConfig, primaryStatus, customFieldMapping = {}) {
  if (!text.trim()) {
    return {
      hasData: false,
      matchedFields: [],
      unmatchedHeaders: [],
      missingRequired: REQUIRED_FIELDS.map(key => ({
        key,
        label: getFieldLabel(key, fieldsConfig)
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
      label: getFieldLabel(key, fieldsConfig)
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
        missingFields.push(getFieldLabel(key, fieldsConfig));
      }
    });

    const enrichedRecord = {
      ...record,
      status: record.status || primaryStatus,
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
      label: getFieldLabel(key, fieldsConfig)
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

export { buildImportPreview };
