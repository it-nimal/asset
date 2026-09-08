import React, { useState } from 'react';
import { FileText, Download, Printer, Filter, CheckCircle2, ShieldCheck, DollarSign } from 'lucide-react';

export const REPORT_TYPES = [
  { id: 'all-inventory', title: 'Complete Asset Inventory', desc: 'Full registry of all hardware tags, specs, custodians, and values' },
  { id: 'by-dept', title: 'Assets by Department', desc: 'Breakdown of IT devices grouped across corporate departments' },
  { id: 'by-emp', title: 'Assets by Employee', desc: 'Auditable roster of hardware currently under employee custody' },
  { id: 'by-location', title: 'Assets by Location & Plant', desc: 'Distribution across HQ and manufacturing plant facilities' },
  { id: 'available', title: 'Available & In-Stock Assets', desc: 'Unassigned inventory ready for immediate provisioning' },
  { id: 'assigned', title: 'Assigned Assets', desc: 'Active deployment of computing hardware in active operations' },
  { id: 'retired', title: 'Retired & Disposed Assets', desc: 'Decommissioned units marked for recycling or electronic disposal' },
  { id: 'lost', title: 'Lost or Stolen Assets', desc: 'Incident-flagged devices requiring security revocation' },
  { id: 'warranty', title: 'Warranty Status & Expiry Report', desc: 'Hardware approaching 30-day and 60-day OEM warranty expiration' },
  { id: 'maintenance', title: 'Maintenance Cost & Service Report', desc: 'Technician repair tickets, diagnosis notes, and cumulative expenses' },
  { id: 'software', title: 'Software License Compliance Report', desc: 'SAM subscription utilization, allocated seats, and compliance standing' },
  { id: 'purchase', title: 'Asset Procurement & Purchase Report', desc: 'Historical inward capital outlay grouped by PO, vendor, and date' },
  { id: 'depreciation', title: 'Asset Depreciation & Valuation Report', desc: 'Book value, purchase cost, and current depreciated asset worth' },
];

export default function ReportsView({ assets = [], software = [], maintenance = [] }) {
  const [selectedReport, setSelectedReport] = useState('all-inventory');

  // Filter assets depending on chosen report
  const getReportData = () => {
    switch (selectedReport) {
      case 'available':
        return assets.filter(a => a.status === 'Available' || a.status === 'In Stock');
      case 'assigned':
        return assets.filter(a => a.status === 'Assigned');
      case 'retired':
        return assets.filter(a => a.status === 'Retired' || a.status === 'Disposed');
      case 'lost':
        return assets.filter(a => a.status === 'Lost' || a.status === 'Stolen');
      case 'warranty': {
        const now = new Date();
        const in60Days = new Date();
        in60Days.setDate(now.getDate() + 60);
        return assets.filter(a => a.warrantyEndDate && new Date(a.warrantyEndDate) <= in60Days);
      }
      default:
        return assets;
    }
  };

  const reportData = getReportData();
  const currentRep = REPORT_TYPES.find(r => r.id === selectedReport) || REPORT_TYPES[0];

  const handleExportCSV = () => {
    const headers = ['Asset Tag', 'Serial No', 'Type', 'Make', 'Model', 'Status', 'Custodian', 'Department', 'Location', 'Purchase Price', 'Current Value'];
    const rows = reportData.map(a => [
      a.assetNo || `AST-${a.sr?.substring(0, 6)}`,
      a.sr || '',
      a.deviceType || '',
      a.make || '',
      a.model || '',
      a.status || '',
      a.userName || 'Unassigned',
      a.department || '',
      a.plant || '',
      a.purchasePrice || 0,
      a.currentValue || 0,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `Vitromed_${selectedReport}_Report_${Date.now()}.csv`;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ padding: '1.75rem 2rem 4rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#818cf8', letterSpacing: '0.05em' }}>
            REGULATORY & COMPLIANCE (SECTION 18)
          </span>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginTop: '0.2rem' }}>
            13 Comprehensive ITAM Audit Reports
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            Generate auditable reports for IT procurement, insurance, depreciation, and corporate hardware compliance.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handlePrint}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              color: '#f8fafc',
              padding: '0.5rem 0.9rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Printer size={15} />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleExportCSV}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: '#4f46e5',
              border: 'none',
              color: '#ffffff',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem' }}>
        {/* Left Side: Report Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {REPORT_TYPES.map((rep) => {
            const isSelected = selectedReport === rep.id;
            return (
              <button
                key={rep.id}
                type="button"
                onClick={() => setSelectedReport(rep.id)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: `1px solid ${isSelected ? '#6366f1' : '#1e293b'}`,
                  backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.12)' : '#131d36',
                  color: isSelected ? '#ffffff' : '#cbd5e1',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <FileText size={16} color={isSelected ? '#818cf8' : '#64748b'} style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.84rem' }}>{rep.title}</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px', lineHeight: 1.3 }}>{rep.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Side: Report Preview Data */}
        <div style={{ backgroundColor: '#131d36', border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #1e293b', backgroundColor: '#0b1329', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>{currentRep.title}</h3>
              <p style={{ fontSize: '0.78rem', color: '#818cf8', marginTop: '2px' }}>{currentRep.desc}</p>
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#34d399', backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '0.25rem 0.65rem', borderRadius: '9999px' }}>
              {reportData.length} Records Found
            </span>
          </div>

          <div style={{ overflowX: 'auto', maxHeight: '65vh' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#070d1e', borderBottom: '1px solid #1e293b', position: 'sticky', top: 0 }}>
                  <th style={thStyle}>Asset Tag</th>
                  <th style={thStyle}>Make & Model</th>
                  <th style={thStyle}>Category</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Custodian</th>
                  <th style={thStyle}>Department</th>
                  <th style={thStyle}>Plant</th>
                  <th style={thStyle}>Value (₹)</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((item, idx) => (
                  <tr key={item._id || idx} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#818cf8' }}>
                      {item.assetNo || `AST-${item.sr?.substring(0, 6)}`}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#ffffff', fontWeight: 600 }}>
                      {item.make} {item.model}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#cbd5e1' }}>{item.deviceType}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ padding: '0.15rem 0.45rem', borderRadius: '4px', backgroundColor: '#1e293b', color: '#38bdf8', fontSize: '0.72rem', fontWeight: 600 }}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#f8fafc' }}>{item.userName || 'Unassigned'}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>{item.department || '—'}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>{item.plant || 'HQ'}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#34d399', fontWeight: 700 }}>
                      ₹{item.purchasePrice?.toLocaleString() || '0'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

const thStyle = {
  padding: '0.75rem 1rem',
  color: '#64748b',
  fontWeight: 700,
  fontSize: '0.72rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};