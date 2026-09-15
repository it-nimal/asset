import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Upload,
  Download,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  X,
  Layers,
  ArrowRight,
  Database,
  Sparkles,
  RefreshCw,
  Info,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../common/Toast';

export const MASTER_38_COLUMNS = [
  'S/N',
  'Plant',
  'Assest No.',
  'User Status',
  'User Name',
  'Emp. Code',
  "Mail Id's",
  'Department',
  'Official Number',
  'PC Group',
  'Host-Name',
  'IP Address',
  'eScan Policy',
  'System Type',
  'System Brand',
  'Model No.',
  'Serial Number',
  'Bill Copy & Date',
  'Warranty Details',
  'Windows',
  'Windows Type',
  'Windows License Keys',
  "Office Software's",
  'Office License Keys',
  'Mail Software',
  'SAP ID',
  'User Name (Login)',
  'New ID/Login Password',
  'Antivirus',
  'Other Software',
  "Processor Full Detail's",
  'RAM',
  'HDD',
  'LCD Screen',
  'LCD Sr. No',
  'Data Backup',
  'Mobiles, Accessories & Other',
  'Remark',
];

export const SAMPLE_MASTER_ROW = {
  'S/N': 109,
  'Plant': 'Vitromed',
  'Assest No.': '21',
  'User Status': 'Active',
  'User Name': 'CCTV / Mahendra Yadav / Rajnath Singh',
  'Emp. Code': 'OS1130',
  "Mail Id's": 'cctvit@vitromed.co.in',
  'Department': 'IT',
  'Official Number': '8000929236',
  'PC Group': 'Workgroup',
  'Host-Name': 'CCTV',
  'IP Address': '192.168.8.123',
  'eScan Policy': 'Profile',
  'System Type': 'Laptop',
  'System Brand': 'HP',
  'Model No.': 'HP Laptop 15-bs1xx',
  'Serial Number': 'CND744D8ZH',
  'Bill Copy & Date': 'N/A',
  'Warranty Details': '13-12-2017 to 10-02-2019',
  'Windows': 'Windows 10 Professional 64-bit',
  'Windows Type': 'OPEN OS',
  'Windows License Keys': '9QN27-QC4RM-YQ3TD-MV6RH-KHJXM',
  "Office Software's": 'MS Office 2013 Std',
  'Office License Keys': 'XWNTF-9DHKH-B48X3-PJ4C2-27GYG',
  'Mail Software': 'Online WPA',
  'SAP ID': 'N/A',
  'User Name (Login)': 'Vitromed',
  'New ID/Login Password': 'Vitromed / CCTV@121',
  'Antivirus': 'eScan',
  'Other Software': 'N/A',
  "Processor Full Detail's": '8th Gen Intel(R) Core(TM) i5-8250 CPU @ 1.60GHz 1.80 GHz',
  'RAM': '8 GB',
  'HDD': '120 GB M.2 SSD + 1 TB HDD',
  'LCD Screen': '22 inch',
  'LCD Sr. No': '',
  'Data Backup': 'Daily Backup',
  'Mobiles, Accessories & Other': 'UPS, Wireless K/B & Mouse,',
  'Remark': '',
};

export default function BulkImportExportModal({ isOpen, onClose, onImportSuccess }) {
  const fileInputRef = useRef(null);
  const toast = useToast();

  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState('');
  const [parsedRows, setParsedRows] = useState([]);
  const [overwrite, setOverwrite] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [importSummary, setImportSummary] = useState(null);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const processFile = (file) => {
    if (!file) return;
    setFileName(file.name);
    setImportSummary(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!json || json.length === 0) {
          toast.warning('The file contains no readable data rows.');
          return;
        }

        setParsedRows(json);
        toast.success(`Successfully parsed ${json.length} records from ${file.name}!`);
      } catch (err) {
        console.error('File parsing error:', err);
        toast.error(`Failed to parse file: ${err.message}`);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Download Sample Excel Template
  const handleDownloadExcelTemplate = () => {
    try {
      const ws = XLSX.utils.json_to_sheet([SAMPLE_MASTER_ROW], { header: MASTER_38_COLUMNS });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Asset_Master_38_Cols');
      XLSX.writeFile(wb, 'Company_Asset_Master_Template.xlsx');
      toast.success('Excel template downloaded successfully!');
    } catch (err) {
      toast.error(`Failed to generate template: ${err.message}`);
    }
  };

  // Download Sample CSV Template
  const handleDownloadCSVTemplate = () => {
    try {
      const ws = XLSX.utils.json_to_sheet([SAMPLE_MASTER_ROW], { header: MASTER_38_COLUMNS });
      const csv = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Company_Asset_Master_Template.csv';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('CSV template downloaded successfully!');
    } catch (err) {
      toast.error(`Failed to generate CSV: ${err.message}`);
    }
  };

  // Quick Seed Sample Master Row
  const handleQuickSeedSample = async () => {
    try {
      setIsImporting(true);
      const res = await api.seedSampleMasterRow();
      toast.success(res.message || 'Sample master record seeded successfully!');
      if (onImportSuccess) onImportSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to seed sample record');
    } finally {
      setIsImporting(false);
    }
  };

  // Confirm Import
  const handleConfirmImport = async () => {
    if (parsedRows.length === 0) return;
    setIsImporting(true);
    try {
      const res = await api.bulkImportAssets(parsedRows, overwrite, 'IT Admin');
      setImportSummary(res.summary);
      toast.success(res.message);
      if (onImportSuccess) onImportSuccess();
    } catch (err) {
      toast.error(err.message || 'Bulk import failed');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '980px', width: '95vw', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div className="modal-header" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8',
              }}
            >
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Master Asset Roster Import & Export
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Full support for company 38-column spreadsheet format (Excel .xlsx, .xls, or .csv)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-icon"
            style={{ color: 'var(--text-muted)', cursor: 'pointer', background: 'transparent', border: 'none' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Action Cards / Helpers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {/* Template Download Card */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-default)',
                borderRadius: '10px',
                padding: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Download size={16} color="var(--primary)" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Download Master Template
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Pre-configured with all 38 column headers and sample hardware record.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={handleDownloadExcelTemplate}
                  className="btn"
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.4rem 0.75rem',
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    color: '#059669',
                    border: '1px solid rgba(16, 185, 129, 0.28)',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontWeight: 600,
                  }}
                >
                  <FileSpreadsheet size={13} /> Excel (.xlsx)
                </button>
                <button
                  type="button"
                  onClick={handleDownloadCSVTemplate}
                  className="btn"
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.4rem 0.75rem',
                    backgroundColor: 'rgba(2, 132, 199, 0.12)',
                    color: 'var(--primary)',
                    border: '1px solid rgba(2, 132, 199, 0.28)',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontWeight: 600,
                  }}
                >
                  <Download size={13} /> CSV (.csv)
                </button>
              </div>
            </div>

            {/* Live Inventory Export Card */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-default)',
                borderRadius: '10px',
                padding: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Database size={16} color="#059669" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Export Current Database
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Download all active systems mapped into the exact 38-column roster layout.
              </p>
              <a
                href={api.getExportMasterCSVUrl()}
                download="Company_Asset_Master_38_Cols.csv"
                className="btn"
                style={{
                  fontSize: '0.75rem',
                  padding: '0.4rem 0.85rem',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  color: '#059669',
                  border: '1px solid rgba(16, 185, 129, 0.28)',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontWeight: 600,
                }}
              >
                <Download size={13} /> Export Master CSV (38 Cols)
              </a>
            </div>

            {/* Quick Sample Ingest Button */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-default)',
                borderRadius: '10px',
                padding: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Sparkles size={16} color="#d97706" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Sample Record Test
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Instantly insert the S/N 109 record (HP Laptop 15-bs1xx / CCTV) into database.
              </p>
              <button
                type="button"
                onClick={handleQuickSeedSample}
                disabled={isImporting}
                className="btn"
                style={{
                  fontSize: '0.75rem',
                  padding: '0.4rem 0.85rem',
                  backgroundColor: 'rgba(245, 158, 11, 0.12)',
                  color: '#d97706',
                  border: '1px solid rgba(245, 158, 11, 0.28)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <Check size={13} /> Ingest Sample Row
              </button>
            </div>
          </div>

          {/* Upload Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragActive ? 'var(--border-focus)' : 'var(--border-default)'}`,
              borderRadius: '12px',
              padding: '2.25rem 1.5rem',
              textAlign: 'center',
              backgroundColor: dragActive ? 'var(--primary-light)' : 'var(--bg-surface-raised)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto',
              }}
            >
              <Upload size={26} />
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.35rem 0' }}>
              {fileName ? fileName : 'Choose or drop your Master Asset Spreadsheet'}
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Supports Microsoft Excel (.xlsx, .xls) and Comma-Separated Values (.csv)
            </p>
            {parsedRows.length > 0 && (
              <div
                style={{
                  marginTop: '0.85rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#34d399',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                }}
              >
                <CheckCircle2 size={15} /> {parsedRows.length} Rows Ready for Ingestion
              </div>
            )}
          </div>

          {/* Import Summary Results if available */}
          {importSummary && (
            <div
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '10px',
                padding: '1rem 1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontWeight: 700, marginBottom: '0.5rem' }}>
                <CheckCircle2 size={18} /> Ingestion Summary
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                <span>Total Processed: <strong>{importSummary.total}</strong></span>
                <span>Created: <strong style={{ color: '#34d399' }}>{importSummary.inserted}</strong></span>
                <span>Updated: <strong style={{ color: '#38bdf8' }}>{importSummary.updated}</strong></span>
                {importSummary.errors > 0 && (
                  <span>Errors: <strong style={{ color: '#f87171' }}>{importSummary.errors}</strong></span>
                )}
              </div>
            </div>
          )}

          {/* Preview Section */}
          {parsedRows.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Layers size={16} color="#38bdf8" />
                  Spreadsheet Preview (First {Math.min(5, parsedRows.length)} of {parsedRows.length} rows)
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={overwrite}
                    onChange={(e) => setOverwrite(e.target.checked)}
                    style={{ accentColor: '#38bdf8' }}
                  />
                  <span>Overwrite existing records if Serial Number / Tag matches</span>
                </label>
              </div>

              <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', textAlign: 'left' }}>
                      <th style={{ padding: '0.6rem 0.75rem', borderBottom: '1px solid var(--border-color)', color: '#38bdf8' }}>S/N</th>
                      <th style={{ padding: '0.6rem 0.75rem', borderBottom: '1px solid var(--border-color)', color: '#38bdf8' }}>Asset Tag</th>
                      <th style={{ padding: '0.6rem 0.75rem', borderBottom: '1px solid var(--border-color)', color: '#38bdf8' }}>Custodian</th>
                      <th style={{ padding: '0.6rem 0.75rem', borderBottom: '1px solid var(--border-color)', color: '#38bdf8' }}>Department</th>
                      <th style={{ padding: '0.6rem 0.75rem', borderBottom: '1px solid var(--border-color)', color: '#38bdf8' }}>System</th>
                      <th style={{ padding: '0.6rem 0.75rem', borderBottom: '1px solid var(--border-color)', color: '#38bdf8' }}>Serial No</th>
                      <th style={{ padding: '0.6rem 0.75rem', borderBottom: '1px solid var(--border-color)', color: '#38bdf8' }}>IP Address</th>
                      <th style={{ padding: '0.6rem 0.75rem', borderBottom: '1px solid var(--border-color)', color: '#38bdf8' }}>Windows OS</th>
                      <th style={{ padding: '0.6rem 0.75rem', borderBottom: '1px solid var(--border-color)', color: '#38bdf8' }}>RAM / HDD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.slice(0, 5).map((r, idx) => {
                      const sn = r['S/N'] || r['sn'] || idx + 1;
                      const tag = r['Assest No.'] || r['Asset No.'] || r['assetNo'] || 'N/A';
                      const custodian = r['User Name'] || r['userName'] || 'Unassigned';
                      const dept = r['Department'] || r['department'] || 'IT';
                      const system = `${r['System Brand'] || r['make'] || ''} ${r['Model No.'] || r['model'] || ''}`.trim() || 'System';
                      const sr = r['Serial Number'] || r['sr'] || 'N/A';
                      const ip = r['IP Address'] || r['ipAddress'] || 'N/A';
                      const os = r['Windows'] || r['osVersion'] || 'Windows';
                      const specs = `${r['RAM'] || ''} / ${r['HDD'] || ''}`.trim() || 'Standard';

                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                          <td style={{ padding: '0.55rem 0.75rem', fontWeight: 600 }}>{sn}</td>
                          <td style={{ padding: '0.55rem 0.75rem', color: '#38bdf8', fontFamily: 'monospace' }}>{tag}</td>
                          <td style={{ padding: '0.55rem 0.75rem' }}>{custodian}</td>
                          <td style={{ padding: '0.55rem 0.75rem' }}>{dept}</td>
                          <td style={{ padding: '0.55rem 0.75rem' }}>{system}</td>
                          <td style={{ padding: '0.55rem 0.75rem', fontFamily: 'monospace', color: '#fbbf24' }}>{sr}</td>
                          <td style={{ padding: '0.55rem 0.75rem', fontFamily: 'monospace' }}>{ip}</td>
                          <td style={{ padding: '0.55rem 0.75rem' }}>{os}</td>
                          <td style={{ padding: '0.55rem 0.75rem', color: 'var(--text-muted)' }}>{specs}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="modal-footer"
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {parsedRows.length > 0 ? `${parsedRows.length} rows ready` : 'Select a spreadsheet to begin'}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ cursor: 'pointer' }}>
              Close
            </button>
            <button
              type="button"
              disabled={parsedRows.length === 0 || isImporting}
              onClick={handleConfirmImport}
              className="btn btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: parsedRows.length === 0 || isImporting ? 0.6 : 1,
                cursor: parsedRows.length === 0 || isImporting ? 'not-allowed' : 'pointer',
              }}
            >
              {isImporting ? (
                <>
                  <RefreshCw size={15} className="spin" /> Importing...
                </>
              ) : (
                <>
                  <Database size={15} /> Import {parsedRows.length > 0 ? `${parsedRows.length} Assets` : ''}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
