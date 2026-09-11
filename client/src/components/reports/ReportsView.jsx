import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  CheckCircle2,
  ShieldCheck,
  Package,
} from 'lucide-react';
import { useToast } from '../common/Toast';

export const REPORT_TYPES = [
  { id: 'all-inventory', title: 'Complete Hardware Inventory', desc: 'Full registry of all hardware serials, models, custodians, and locations' },
  { id: 'by-dept', title: 'Assets by Department', desc: 'Breakdown of IT devices grouped across corporate business units' },
  { id: 'by-emp', title: 'Assets by Employee', desc: 'Auditable roster of equipment currently issued to staff' },
  { id: 'by-location', title: 'Assets by Facility & Plant', desc: 'Distribution across Vitromed manufacturing and operations plant' },
  { id: 'available', title: 'Available & In-Stock Systems', desc: 'Unassigned inventory ready for immediate provisioning' },
  { id: 'assigned', title: 'Active Assigned Assets', desc: 'Active deployment of computing hardware in live operations' },
  { id: 'retired', title: 'Retired & Disposed Units', desc: 'Decommissioned machines marked for recycling or safe disposal' },
  { id: 'lost', title: 'Lost or Security Incidents', desc: 'Incident-flagged devices requiring network credential revocation' },
  { id: 'warranty', title: 'OEM Warranty Expiry Report', desc: 'Hardware approaching 30-day and 60-day warranty expiration' },
  { id: 'maintenance', title: 'Maintenance & Service Report', desc: 'Authorized technician repair history and cumulative expenses' },
  { id: 'software', title: 'Software License Compliance', desc: 'SAM subscription utilization, allocated seats, and compliance standing' },
  { id: 'purchase', title: 'Procurement & Billing Report', desc: 'Historical inward capital outlay grouped by PO, vendor, and date' },
  { id: 'depreciation', title: 'Asset Valuation & Depreciation', desc: 'Book value, purchase cost, and estimated depreciated asset worth' },
];

export default function ReportsView({ assets = [], software = [], maintenance = [] }) {
  const toast = useToast();
  const [selectedReport, setSelectedReport] = useState('all-inventory');

  const getReportData = () => {
    switch (selectedReport) {
      case 'available':
        return assets.filter((a) => a.status === 'Available' || a.status === 'In Stock');
      case 'assigned':
        return assets.filter((a) => a.status === 'Assigned');
      case 'retired':
        return assets.filter((a) => a.status === 'Retired' || a.status === 'Disposed');
      case 'lost':
        return assets.filter((a) => a.status === 'Lost' || a.status === 'Stolen');
      case 'warranty': {
        const in60Days = new Date();
        in60Days.setDate(in60Days.getDate() + 60);
        return assets.filter((a) => a.warrantyEndDate && new Date(a.warrantyEndDate) <= in60Days);
      }
      default:
        return assets;
    }
  };

  const reportData = getReportData();
  const currentRep = REPORT_TYPES.find((r) => r.id === selectedReport) || REPORT_TYPES[0];

  const handleExportCSV = () => {
    if (reportData.length === 0) return toast.warning('No data entries to export in this report');
    const headers = [
      'Asset Tag',
      'Serial No',
      'Type',
      'Make',
      'Model',
      'Status',
      'Custodian',
      'Department',
      'Location',
      'Purchase Date',
    ];
    const rows = reportData.map((a) => [
      a.assetNo || '',
      a.sr || '',
      a.deviceType || '',
      a.make || '',
      a.model || '',
      a.status || '',
      a.userName || 'Unassigned',
      a.department || '',
      a.plant || '',
      a.purchaseDate ? new Date(a.purchaseDate).toLocaleDateString() : '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `Vitromed_${selectedReport}_Report_${Date.now()}.csv`;
    link.click();
    toast.success('Report CSV exported successfully');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ padding: '1.5rem 2rem 4rem', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '1.75rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Auditable ITAM Compliance Reports
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Generate auditable records for ISO compliance, corporate procurement, warranty renewals, and asset rosters.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={handlePrint}
            className="btn btn-outline btn-sm"
          >
            <Printer size={14} />
            <span>Print Report</span>
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="btn btn-primary btn-sm"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Report Categories Selector Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1.75rem',
        }}
      >
        {REPORT_TYPES.map((rep) => {
          const isSelected = selectedReport === rep.id;
          return (
            <div
              key={rep.id}
              onClick={() => setSelectedReport(rep.id)}
              className="card"
              style={{
                padding: '0.85rem 1rem',
                cursor: 'pointer',
                border: `1px solid ${isSelected ? 'var(--border-focus)' : 'var(--border-default)'}`,
                backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--bg-surface)',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: isSelected ? '#ffffff' : 'var(--text-primary)',
                  }}
                >
                  {rep.title}
                </span>
                {isSelected && <CheckCircle2 size={14} color="#818cf8" />}
              </div>
              <p
                style={{
                  fontSize: '0.72rem',
                  color: isSelected ? '#cbd5e1' : 'var(--text-faint)',
                  marginTop: '0.35rem',
                  lineHeight: 1.35,
                }}
              >
                {rep.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Generated Report Table */}
      <div className="table-container">
        <div
          style={{
            padding: '0.85rem 1.25rem',
            borderBottom: '1px solid var(--border-default)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'rgba(9, 15, 26, 0.4)',
          }}
        >
          <div>
            <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{currentRep.title}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.65rem' }}>
              ({reportData.length} records)
            </span>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table-modern">
            <thead>
              <tr>
                <th>Asset Tag</th>
                <th>Serial Number</th>
                <th>Model</th>
                <th>Device Type</th>
                <th>Status</th>
                <th>Custodian</th>
                <th>Department</th>
                <th>Plant Facility</th>
              </tr>
            </thead>
            <tbody>
              {reportData.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <Package size={32} color="var(--text-faint)" />
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>No Matching Records in Report</div>
                      <div style={{ color: 'var(--text-faint)', fontSize: '0.78rem' }}>
                        This report category currently contains 0 records.
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                reportData.map((a, idx) => (
                  <tr key={a._id || idx}>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#818cf8' }}>
                        {a.assetNo || 'AST-N/A'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {a.sr || '—'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {a.make} {a.model}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-secondary)' }}>{a.deviceType}</span>
                    </td>
                    <td>
                      <span className="badge badge-available">{a.status}</span>
                    </td>
                    <td>
                      <span style={{ color: a.userName !== 'Unassigned' ? 'var(--text-primary)' : 'var(--text-faint)' }}>
                        {a.userName || 'Unassigned'}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-secondary)' }}>{a.department || '—'}</span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-secondary)' }}>{a.plant || '—'}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}