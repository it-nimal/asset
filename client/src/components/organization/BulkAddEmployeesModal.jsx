import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  Trash2,
  Plus,
  Users,
  RefreshCw,
  Sparkles,
  ClipboardPaste,
  Check,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../common/Toast';
import { useAuth } from '../../context/AuthContext';
import { COMPANY_DEPARTMENTS } from '../../constants/organization';

export default function BulkAddEmployeesModal({
  departments = [],
  locations = [],
  employees = [],
  onClose,
  onSuccess,
}) {
  const { user } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef(null);

  // Tabs: 'csv' | 'paste' | 'grid'
  const [activeTab, setActiveTab] = useState('csv');
  const [loading, setLoading] = useState(false);
  const [updateExisting, setUpdateExisting] = useState(false);

  // Raw paste text
  const [pasteText, setPasteText] = useState('');

  // Parsed rows for pre-flight review
  const [parsedRows, setParsedRows] = useState([]);
  const [importResult, setImportResult] = useState(null);

  // Suggest next ID starting point
  const getNextSequentialId = (offset = 0) => {
    let maxNum = 1000;
    employees.forEach((e) => {
      if (e.employeeId && e.employeeId.startsWith('VIT-')) {
        const num = parseInt(e.employeeId.replace('VIT-', ''), 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    });
    return `VIT-${maxNum + 1 + offset}`;
  };

  // Initial rows for interactive grid
  const createEmptyRow = (offset = 0) => ({
    employeeId: getNextSequentialId(offset),
    name: '',
    email: '',
    department: departments[0]?.name || COMPANY_DEPARTMENTS[0] || 'IT',
    location: 'Vitromed',
    designation: 'Staff Associate',
    phone: '',
    status: 'Active',
  });

  const [gridRows, setGridRows] = useState([
    createEmptyRow(0),
    createEmptyRow(1),
    createEmptyRow(2),
    createEmptyRow(3),
    createEmptyRow(4),
  ]);

  // ----------------- CSV TEMPLATE DOWNLOAD -----------------
  const downloadSampleTemplate = () => {
    const headers = [
      'Employee ID',
      'Full Name',
      'Email Address',
      'Department',
      'Plant Location',
      'Designation',
      'Phone',
      'Status',
    ];

    const sampleRows = [
      ['VIT-1051', 'Ramesh Kumar', 'ramesh.kumar@vitromed.com', 'IT', 'Vitromed', 'Network Specialist', '9876543210', 'Active'],
      ['VIT-1052', 'Priya Sharma', 'priya.sharma@vitromed.com', 'Quality Control', 'Vitromed', 'QC Inspector', '9876543211', 'Active'],
      ['VIT-1053', 'Amit Verma', 'amit.verma@vitromed.com', 'Production', 'Vitromed', 'Shift Supervisor', '9876543212', 'Active'],
      ['VIT-1054', 'Sneha Patel', 'sneha.patel@vitromed.com', 'Human Resources', 'Vitromed', 'HR Officer', '9876543213', 'Active'],
      ['VIT-1055', 'Rajesh Joshi', 'rajesh.joshi@vitromed.com', 'Accounts', 'Vitromed', 'Senior Accountant', '9876543214', 'Active'],
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...sampleRows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Vitromed_Bulk_Employees_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ----------------- CSV FILE PARSING -----------------
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result;
      if (typeof text === 'string') {
        parseCSVText(text);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const parseCSVText = (csvString) => {
    const lines = csvString
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length < 2) {
      toast.error('The uploaded file does not contain enough data rows.');
      return;
    }

    const splitLine = (line) => {
      const result = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if ((char === ',' || char === '\t') && !inQuotes) {
          result.push(cur.trim().replace(/^"|"$/g, ''));
          cur = '';
        } else {
          cur += char;
        }
      }
      result.push(cur.trim().replace(/^"|"$/g, ''));
      return result;
    };

    const header = splitLine(lines[0]).map((h) => h.toLowerCase());
    const idIdx = header.findIndex((h) => h.includes('id') || h.includes('code'));
    const nameIdx = header.findIndex((h) => h.includes('name'));
    const emailIdx = header.findIndex((h) => h.includes('mail'));
    const deptIdx = header.findIndex((h) => h.includes('dept') || h.includes('department'));
    const locIdx = header.findIndex((h) => h.includes('loc') || h.includes('plant') || h.includes('facility'));
    const desigIdx = header.findIndex((h) => h.includes('desig') || h.includes('role') || h.includes('title'));
    const phoneIdx = header.findIndex((h) => h.includes('phone') || h.includes('mobile') || h.includes('contact'));
    const statusIdx = header.findIndex((h) => h.includes('status'));

    const parsed = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = splitLine(lines[i]);
      if (cols.length === 0 || cols.every((c) => !c)) continue;

      const name = nameIdx !== -1 ? cols[nameIdx] : cols[1] || cols[0];
      if (!name) continue;

      const employeeId = idIdx !== -1 ? cols[idIdx] : cols[0] && cols[0] !== name ? cols[0] : '';
      const email = emailIdx !== -1 ? cols[emailIdx] : '';
      const department = deptIdx !== -1 ? cols[deptIdx] : 'General';
      const location = locIdx !== -1 ? cols[locIdx] : 'Vitromed';
      const designation = desigIdx !== -1 ? cols[desigIdx] : 'Staff Associate';
      const phone = phoneIdx !== -1 ? cols[phoneIdx] : '';
      const status = statusIdx !== -1 ? cols[statusIdx] : 'Active';

      parsed.push({
        employeeId: employeeId || getNextSequentialId(parsed.length),
        name,
        email: email || `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@vitromed.com`,
        department: department || 'General',
        location: location || 'Vitromed',
        designation: designation || 'Staff Associate',
        phone: phone || '',
        status: status || 'Active',
      });
    }

    if (parsed.length === 0) {
      toast.error('No valid employee records found in CSV');
      return;
    }

    setParsedRows(parsed);
    toast.success(`Parsed ${parsed.length} employee records from CSV file!`);
  };

  // ----------------- EXCEL / TEXTAREA PASTE PARSING -----------------
  const handleParsePaste = () => {
    if (!pasteText.trim()) {
      toast.error('Please paste rows from your Excel sheet or spreadsheet first.');
      return;
    }

    const lines = pasteText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) return;

    const firstLineLower = lines[0].toLowerCase();
    const hasHeader =
      firstLineLower.includes('name') ||
      firstLineLower.includes('id') ||
      firstLineLower.includes('department') ||
      firstLineLower.includes('email');

    const startIndex = hasHeader ? 1 : 0;
    const parsed = [];

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      const cols = line.includes('\t')
        ? line.split('\t').map((c) => c.trim().replace(/^"|"$/g, ''))
        : line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));

      if (cols.length === 0 || cols.every((c) => !c)) continue;

      let employeeId = '';
      let name = '';
      let email = '';
      let department = 'General';
      let location = 'Vitromed';
      let designation = 'Staff Associate';
      let phone = '';

      if (cols.length === 1) {
        name = cols[0];
      } else if (cols.length === 2) {
        if (cols[0].toLowerCase().startsWith('vit-') || /^\d+$/.test(cols[0])) {
          employeeId = cols[0];
          name = cols[1];
        } else {
          name = cols[0];
          department = cols[1];
        }
      } else {
        if (cols[0].toLowerCase().startsWith('vit-') || /^\d+$/.test(cols[0])) {
          employeeId = cols[0];
          name = cols[1];
          email = cols[2] || '';
          department = cols[3] || 'General';
          location = cols[4] || 'Vitromed';
          designation = cols[5] || 'Staff Associate';
          phone = cols[6] || '';
        } else {
          name = cols[0];
          email = cols[1] || '';
          department = cols[2] || 'General';
          location = cols[3] || 'Vitromed';
          designation = cols[4] || 'Staff Associate';
          phone = cols[5] || '';
        }
      }

      if (!name) continue;

      parsed.push({
        employeeId: employeeId || getNextSequentialId(parsed.length),
        name,
        email: email || `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@vitromed.com`,
        department: department || 'General',
        location: location || 'Vitromed',
        designation: designation || 'Staff Associate',
        phone: phone || '',
        status: 'Active',
      });
    }

    if (parsed.length === 0) {
      toast.error('Could not extract valid records from pasted text.');
      return;
    }

    setParsedRows(parsed);
    toast.success(`Successfully parsed ${parsed.length} rows from clipboard!`);
  };

  // ----------------- SUBMIT BATCH IMPORT -----------------
  const executeImport = async () => {
    let rowsToImport = [];

    if (activeTab === 'grid') {
      rowsToImport = gridRows.filter((r) => r.name && r.name.trim().length > 0);
    } else {
      rowsToImport = parsedRows.filter((r) => r.name && r.name.trim().length > 0);
    }

    if (rowsToImport.length === 0) {
      return toast.error('Please provide at least one valid employee with a Name.');
    }

    setLoading(true);
    try {
      const res = await api.createEmployeesBulk(rowsToImport, {
        actorName: user?.name || 'IT Admin',
        updateExisting,
      });

      setImportResult(res.data || res);
      toast.success(res.message || `Successfully imported ${rowsToImport.length} employees!`);
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err.message || 'Failed to complete bulk employee import');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '920px',
          width: '95%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.15rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface-raised)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Bulk Add & Import Workforce Users
                </h3>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.12rem 0.5rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'rgba(99, 102, 241, 0.15)',
                    color: '#818cf8',
                  }}
                >
                  Enterprise ITAM
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Enroll multiple staff members at once via CSV file, Excel copy-paste, or interactive batch table.
              </p>
            </div>
          </div>

          <button type="button" onClick={onClose} className="btn btn-ghost btn-icon btn-sm">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
          {importResult ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1rem 0' }}>
              <div
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                <CheckCircle2 size={32} color="#10b981" />
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#34d399' }}>
                    Bulk Import Completed Successfully!
                  </h4>
                  <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Processed records: <strong>{importResult.created?.length || 0}</strong> created,{' '}
                    <strong>{importResult.updated?.length || 0}</strong> updated,{' '}
                    <strong>{importResult.skipped?.length || 0}</strong> skipped.
                  </p>
                </div>
              </div>

              {importResult.skipped?.length > 0 && (
                <div className="card" style={{ padding: '1rem' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fbbf24', marginBottom: '0.5rem' }}>
                    Skipped Records ({importResult.skipped.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '180px', overflowY: 'auto' }}>
                    {importResult.skipped.map((s, idx) => (
                      <div
                        key={idx}
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.4rem 0.6rem',
                          borderRadius: 'var(--radius-xs)',
                          backgroundColor: 'rgba(255, 255, 255, 0.02)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>{s.name} ({s.employeeId})</span>
                        <span style={{ color: 'var(--text-faint)' }}>{s.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setImportResult(null);
                    setParsedRows([]);
                    setPasteText('');
                  }}
                  className="btn btn-outline btn-sm"
                >
                  Import More Users
                </button>
                <button type="button" onClick={onClose} className="btn btn-primary btn-sm">
                  Done & View Directory
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Method Switcher Tabs */}
              <div
                style={{
                  display: 'flex',
                  borderBottom: '1px solid var(--border-default)',
                  marginBottom: '1.25rem',
                  gap: '0.5rem',
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveTab('csv')}
                  style={{
                    padding: '0.65rem 1rem',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    border: 'none',
                    borderBottom: `2px solid ${activeTab === 'csv' ? 'var(--primary)' : 'transparent'}`,
                    backgroundColor: 'transparent',
                    color: activeTab === 'csv' ? 'var(--primary)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                  }}
                >
                  <Upload size={15} />
                  <span>1. Upload CSV File</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('paste')}
                  style={{
                    padding: '0.65rem 1rem',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    border: 'none',
                    borderBottom: `2px solid ${activeTab === 'paste' ? 'var(--primary)' : 'transparent'}`,
                    backgroundColor: 'transparent',
                    color: activeTab === 'paste' ? 'var(--primary)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                  }}
                >
                  <ClipboardPaste size={15} />
                  <span>2. Copy & Paste from Excel</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('grid')}
                  style={{
                    padding: '0.65rem 1rem',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    border: 'none',
                    borderBottom: `2px solid ${activeTab === 'grid' ? 'var(--primary)' : 'transparent'}`,
                    backgroundColor: 'transparent',
                    color: activeTab === 'grid' ? 'var(--primary)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                  }}
                >
                  <FileSpreadsheet size={15} />
                  <span>3. Interactive Multi-Row Grid</span>
                </button>
              </div>

              {/* TAB 1: CSV FILE UPLOAD */}
              {activeTab === 'csv' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div
                    style={{
                      border: '2px dashed var(--border-default)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '2rem 1.5rem',
                      textAlign: 'center',
                      backgroundColor: 'rgba(255, 255, 255, 0.01)',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s ease',
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (evt) => parseCSVText(evt.target?.result || '');
                        reader.readAsText(file);
                      }
                    }}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".csv, text/csv, text/plain"
                      style={{ display: 'none' }}
                      onChange={handleFileUpload}
                    />
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'rgba(56, 189, 248, 0.12)',
                        color: '#38bdf8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                      }}
                    >
                      <Upload size={22} />
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Click to browse or drag and drop your CSV file here
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                      Supports standard CSV exports from HRMS, Excel, or Google Sheets (.csv)
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-surface-raised)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <FileSpreadsheet size={18} color="#10b981" />
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          Need the standard Vitromed column format?
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Download our ready-made CSV template pre-populated with example headers and entries.
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={downloadSampleTemplate}
                      className="btn btn-outline btn-xs"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                    >
                      <Download size={13} />
                      <span>Download Template</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: PASTE FROM EXCEL / SHEETS */}
              {activeTab === 'paste' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Paste Table Rows Directly from Excel or Google Sheets:</span>
                      <button
                        type="button"
                        onClick={downloadSampleTemplate}
                        className="btn btn-ghost btn-xs"
                        style={{ fontSize: '0.72rem', color: '#38bdf8' }}
                      >
                        <Download size={12} />
                        Download Template CSV
                      </button>
                    </label>
                    <textarea
                      rows={7}
                      placeholder="Paste copied columns here (Tab or Comma separated)...&#10;Example:&#10;VIT-1010&#9;Rohit Sharma&#9;rohit@vitromed.com&#9;IT&#9;Vitromed&#9;Engineer&#10;VIT-1011&#9;Anjali Mehta&#9;anjali@vitromed.com&#9;HR&#9;Vitromed&#9;Officer"
                      value={pasteText}
                      onChange={(e) => setPasteText(e.target.value)}
                      className="input-field"
                      style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', width: '100%' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setPasteText('')}
                      className="btn btn-ghost btn-sm"
                      disabled={!pasteText}
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={handleParsePaste}
                      className="btn btn-primary btn-sm"
                      disabled={!pasteText.trim()}
                    >
                      <Sparkles size={14} />
                      <span>Parse Pasted Rows ({pasteText.trim() ? pasteText.trim().split(/\r?\n/).length : 0})</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: INTERACTIVE MULTI-ROW GRID */}
              {activeTab === 'grid' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Quickly type multiple employees directly into the table below:
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => {
                          const nextOffset = gridRows.length;
                          setGridRows([
                            ...gridRows,
                            createEmptyRow(nextOffset),
                            createEmptyRow(nextOffset + 1),
                            createEmptyRow(nextOffset + 2),
                            createEmptyRow(nextOffset + 3),
                            createEmptyRow(nextOffset + 4),
                          ]);
                        }}
                        className="btn btn-outline btn-xs"
                      >
                        <Plus size={13} />
                        <span>+ Add 5 Rows</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setGridRows(gridRows.filter((r) => r.name.trim().length > 0));
                        }}
                        className="btn btn-ghost btn-xs"
                      >
                        Clear Blank Rows
                      </button>
                    </div>
                  </div>

                  <div style={{ overflowX: 'auto', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                      <thead>
                        <tr style={{ backgroundColor: 'var(--bg-surface-raised)', borderBottom: '1px solid var(--border-subtle)' }}>
                          <th style={{ padding: '0.55rem 0.75rem', textAlign: 'left', width: '110px' }}>Emp ID</th>
                          <th style={{ padding: '0.55rem 0.75rem', textAlign: 'left', width: '180px' }}>Full Name *</th>
                          <th style={{ padding: '0.55rem 0.75rem', textAlign: 'left', width: '180px' }}>Email Address</th>
                          <th style={{ padding: '0.55rem 0.75rem', textAlign: 'left', width: '140px' }}>Department</th>
                          <th style={{ padding: '0.55rem 0.75rem', textAlign: 'left', width: '130px' }}>Plant</th>
                          <th style={{ padding: '0.55rem 0.75rem', textAlign: 'left', width: '140px' }}>Designation</th>
                          <th style={{ padding: '0.55rem 0.75rem', textAlign: 'center', width: '40px' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {gridRows.map((row, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <td style={{ padding: '0.35rem 0.5rem' }}>
                              <input
                                type="text"
                                value={row.employeeId}
                                onChange={(e) => {
                                  const updated = [...gridRows];
                                  updated[idx].employeeId = e.target.value;
                                  setGridRows(updated);
                                }}
                                className="input-field"
                                style={{ height: '30px', fontSize: '0.74rem', fontFamily: 'var(--font-mono)' }}
                              />
                            </td>
                            <td style={{ padding: '0.35rem 0.5rem' }}>
                              <input
                                type="text"
                                placeholder="e.g. Ramesh Kumar"
                                value={row.name}
                                onChange={(e) => {
                                  const updated = [...gridRows];
                                  updated[idx].name = e.target.value;
                                  if (!updated[idx].email && e.target.value) {
                                    updated[idx].email = `${e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '')}@vitromed.com`;
                                  }
                                  setGridRows(updated);
                                }}
                                className="input-field"
                                style={{ height: '30px', fontSize: '0.74rem', fontWeight: 600 }}
                              />
                            </td>
                            <td style={{ padding: '0.35rem 0.5rem' }}>
                              <input
                                type="email"
                                placeholder="user@vitromed.com"
                                value={row.email}
                                onChange={(e) => {
                                  const updated = [...gridRows];
                                  updated[idx].email = e.target.value;
                                  setGridRows(updated);
                                }}
                                className="input-field"
                                style={{ height: '30px', fontSize: '0.74rem' }}
                              />
                            </td>
                            <td style={{ padding: '0.35rem 0.5rem' }}>
                              <select
                                value={row.department}
                                onChange={(e) => {
                                  const updated = [...gridRows];
                                  updated[idx].department = e.target.value;
                                  setGridRows(updated);
                                }}
                                className="input-field"
                                style={{ height: '30px', fontSize: '0.74rem' }}
                              >
                                {COMPANY_DEPARTMENTS.map((d) => (
                                  <option key={d} value={d}>
                                    {d}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td style={{ padding: '0.35rem 0.5rem' }}>
                              <select
                                value={row.location}
                                onChange={(e) => {
                                  const updated = [...gridRows];
                                  updated[idx].location = e.target.value;
                                  setGridRows(updated);
                                }}
                                className="input-field"
                                style={{ height: '30px', fontSize: '0.74rem' }}
                              >
                                <option value="Vitromed">Vitromed</option>
                                {locations
                                  .filter((l) => l.name !== 'Vitromed')
                                  .map((l) => (
                                    <option key={l._id || l.name} value={l.name}>
                                      {l.name}
                                    </option>
                                  ))}
                              </select>
                            </td>
                            <td style={{ padding: '0.35rem 0.5rem' }}>
                              <input
                                type="text"
                                value={row.designation}
                                onChange={(e) => {
                                  const updated = [...gridRows];
                                  updated[idx].designation = e.target.value;
                                  setGridRows(updated);
                                }}
                                className="input-field"
                                style={{ height: '30px', fontSize: '0.74rem' }}
                              />
                            </td>
                            <td style={{ padding: '0.35rem 0.5rem', textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  setGridRows(gridRows.filter((_, i) => i !== idx));
                                }}
                                className="btn btn-ghost btn-icon btn-xs"
                                style={{ color: 'var(--text-faint)' }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* PRE-FLIGHT VERIFICATION TABLE (FOR CSV & PASTE MODES) */}
              {activeTab !== 'grid' && parsedRows.length > 0 && (
                <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle2 size={16} color="#10b981" />
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Parsed Preview ({parsedRows.length} Employees Ready)
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setParsedRows([])}
                      className="btn btn-ghost btn-xs"
                      style={{ color: '#f87171' }}
                    >
                      Clear Parsed List
                    </button>
                  </div>

                  <div
                    style={{
                      maxHeight: '220px',
                      overflowY: 'auto',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem' }}>
                      <thead>
                        <tr style={{ backgroundColor: 'var(--bg-surface-raised)', borderBottom: '1px solid var(--border-subtle)' }}>
                          <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left' }}>Emp ID</th>
                          <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left' }}>Full Name</th>
                          <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left' }}>Email</th>
                          <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left' }}>Department</th>
                          <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left' }}>Plant</th>
                          <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left' }}>Designation</th>
                          <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center', width: '36px' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedRows.map((r, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <td style={{ padding: '0.45rem 0.75rem', fontFamily: 'var(--font-mono)', color: '#38bdf8', fontWeight: 600 }}>
                              {r.employeeId}
                            </td>
                            <td style={{ padding: '0.45rem 0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                              {r.name}
                            </td>
                            <td style={{ padding: '0.45rem 0.75rem', color: 'var(--text-muted)' }}>
                              {r.email}
                            </td>
                            <td style={{ padding: '0.45rem 0.75rem' }}>
                              <span style={{ padding: '0.1rem 0.4rem', borderRadius: 'var(--radius-xs)', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                                {r.department}
                              </span>
                            </td>
                            <td style={{ padding: '0.45rem 0.75rem', color: 'var(--text-muted)' }}>
                              {r.location}
                            </td>
                            <td style={{ padding: '0.45rem 0.75rem', color: 'var(--text-muted)' }}>
                              {r.designation}
                            </td>
                            <td style={{ padding: '0.45rem 0.75rem', textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => setParsedRows(parsedRows.filter((_, i) => i !== idx))}
                                className="btn btn-ghost btn-icon btn-xs"
                                style={{ color: 'var(--text-faint)' }}
                              >
                                <X size={13} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Duplicate Handling Option */}
              <div
                style={{
                  marginTop: '1.25rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    <input
                      type="checkbox"
                      checked={updateExisting}
                      onChange={(e) => setUpdateExisting(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span>Update existing employee records if Employee ID or Email already exists</span>
                  </label>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '2px 0 0 1.5rem' }}>
                    If unchecked, duplicate IDs will be safely skipped to protect existing custody records.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        {!importResult && (
          <div
            style={{
              padding: '0.85rem 1.5rem',
              borderTop: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-surface-raised)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {activeTab === 'grid' ? (
                <span>
                  Ready to enroll:{' '}
                  <strong style={{ color: 'var(--text-primary)' }}>
                    {gridRows.filter((r) => r.name.trim().length > 0).length}
                  </strong>{' '}
                  staff members
                </span>
              ) : (
                <span>
                  Parsed records:{' '}
                  <strong style={{ color: 'var(--text-primary)' }}>{parsedRows.length}</strong>
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <button type="button" onClick={onClose} className="btn btn-secondary btn-sm" disabled={loading}>
                Cancel
              </button>

              <button
                type="button"
                onClick={executeImport}
                className="btn btn-primary btn-sm"
                disabled={
                  loading ||
                  (activeTab === 'grid'
                    ? gridRows.filter((r) => r.name.trim().length > 0).length === 0
                    : parsedRows.length === 0)
                }
                style={{ minWidth: '150px' }}
              >
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <RefreshCw size={14} className="spin" />
                    <span>Importing...</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Check size={14} />
                    <span>
                      {activeTab === 'grid'
                        ? `Import ${gridRows.filter((r) => r.name.trim().length > 0).length} Employees`
                        : `Import ${parsedRows.length} Employees`}
                    </span>
                  </div>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
