import { useMemo, useState } from 'react';
import { Scale, Plus, Search, Trash2, RotateCcw, CheckCircle2, AlertTriangle, ClipboardList, CalendarDays, Upload, FileSpreadsheet, X, Check, AlertCircle, Info } from 'lucide-react';
import './App.css';

const appConfig = {
  "id": "hxwl-61310",
  "port": 61310,
  "title": "法律证据材料整理",
  "subtitle": "案件、证据、争议点和目录预览",
  "domain": "法律证据",
  "icon": "Scale",
  "storage": "hxwl-61310-legal-evidence",
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

  const filteredRecords = useMemo(() => {
    return records
      .filter((item) => !filters.query || `${item.caseName}${item.evidence}${item.issue}`.includes(filters.query))
      .filter((item) => filters.status === '全部' || item.status === filters.status)
      .sort((a, b) => {
        if (appConfig.sort === 'priority') {
          const rank = priorityRank(a.priority) - priorityRank(b.priority);
          if (rank !== 0) return rank;
        }
        const aDate = a[appConfig.dateKey] || a.sentAt || a.createdAt || '';
        const bDate = b[appConfig.dateKey] || b.sentAt || b.createdAt || '';
        return String(aDate).localeCompare(String(bDate));
      });
  }, [records, filters]);

  const metrics = [
    { label: "证据数", value: records.length },
    { label: "案件数", value: new Set(records.map((item) => item.caseName)).size },
    { label: "需补强", value: records.filter((item) => item.status === '需补强').length },
  ];

  const groupedByDate = useMemo(() => {
    return filteredRecords.reduce((acc, item) => {
      const key = item[appConfig.dateKey] || item.date || item.enrollDate || '未排期';
      (acc[key] ||= []).push(item);
      return acc;
    }, {});
  }, [filteredRecords]);

  const directory = useMemo(() => {
    return records.reduce((acc, item) => {
      const key = item.issue || '未分类';
      (acc[key] ||= []).push(item);
      return acc;
    }, {});
  }, [records]);

  return (
    <main className="shell" style={{ '--accent': appConfig.accent }}>
      <section className="hero">
        <div>
          <div className="eyebrow"><Scale size={18} />{appConfig.domain}</div>
          <h1>{appConfig.title}</h1>
          <p>{appConfig.subtitle}</p>
        </div>
        <div className="port-card">
          <span>Local Port</span>
          <strong>{appConfig.port}</strong>
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

      <section className="workspace">
        <form className="panel form-panel" onSubmit={addRecord}>
          <div className="panel-title">
            <ClipboardList size={18} />
            <h2>新增记录</h2>
          </div>
          <div className="form-grid">
            {appConfig.fields.map((field) => (
              <label key={field.key} className={field.type === 'textarea' ? 'wide' : ''}>
                <span>{field.label}</span>
                {field.type === 'textarea' ? (
                  <textarea value={form[field.key] || ''} onChange={(event) => setForm({ ...form, [field.key]: event.target.value })} placeholder={field.placeholder} />
                ) : field.type === 'select' ? (
                  <select value={form[field.key] || ''} onChange={(event) => setForm({ ...form, [field.key]: event.target.value })}>
                    {field.options.map((option) => <option key={option}>{option}</option>)}
                  </select>
                ) : (
                  <input type={field.type} value={form[field.key] || ''} onChange={(event) => setForm({ ...form, [field.key]: event.target.value })} placeholder={field.placeholder} />
                )}
              </label>
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
            {filteredRecords.map((item) => (
              <article className={'record ' + (item.conflict || hasOverlap(item, records) ? 'conflict' : '')} key={item.id} onClick={() => setSelected(item)}>
                <div className="record-head">
                  <div>
                    <h3>{item.evidence}</h3>
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
                  {appConfig.action === 'copyRecipe' && <button type="button" onClick={() => duplicateRecord(item)}><RotateCcw size={14} />复制</button>}
                  {appConfig.chart && <button type="button" onClick={() => addTemperature(item)}>加温度</button>}
                  <button className="ghost-danger" type="button" onClick={() => removeRecord(item.id)}><Trash2 size={14} /></button>
                </div>
              </article>
            ))}
          </div>
        </section>
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
                  {items.map((item, index) => <span key={item.id}>{index + 1}. {item.evidence}｜{item.purpose}</span>)}
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
          {selected ? (
            <div className="detail">
              <h3>{selected.evidence}</h3>
              <p>{`${selected.caseName} · ${selected.issue} · ${selected.level}`}</p>
              <p>{selected.purpose}</p>
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
            </div>
          ) : (
            <p className="empty">点击任意记录查看详情和状态流转。</p>
          )}
        </aside>
      </section>

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
    </main>
  );
}

export default App;
