import React, { useState, useMemo } from 'react';
import {
  Eye,
  Edit,
  UserCheck,
  ArrowRightLeft,
  Undo2,
  Wrench,
  Archive,
  Trash2,
  Download,
  Filter,
  ArrowUpDown,
  FileText,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const STATUS_COLORS = {
  Available: { text: '#34d399', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)' },
  Assigned: { text: '#22d3ee', bg: 'rgba(6, 182, 212, 0.15)', border: 'rgba(6, 182, 212, 0.3)' },
  'In Stock': { text: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)' },
  'Under Maintenance': { text: '#fbbf24', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)' },
  Reserved: { text: '#c084fc', bg: 'rgba(192, 132, 252, 0.15)', border: 'rgba(192, 132, 252, 0.3)' },
  Lost: { text: '#f87171', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)' },
  Stolen: { text: '#ef4444', bg: 'rgba(239, 68, 68, 0.25)', border: 'rgba(239, 68, 68, 0.5)' },
  Retired: { text: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)', border: 'rgba(148, 163, 184, 0.3)' },
  Disposed: { text: '#64748b', bg: 'rgba(100, 116, 139, 0.15)', border: 'rgba(100, 116, 139, 0.3)' },
};

export default function AssetTable({
  assets = [],
  categoryFilter = 'All',
  globalSearch = '',
  onViewDetails,
  onAssign,
  onTransfer,
  onReturn,
  onMaintenance,
  onDelete,
}) {
  const [statusFilter, setStatusFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [selectedIds, setSelectedIds] = useState([]);

  // Unique departments and locations for filters
  const departments = useMemo(() => ['All', ...new Set(assets.map(a => a.department).filter(Boolean))], [assets]);
  const locations = useMemo(() => ['All', ...new Set(assets.map(a => a.plant).filter(Boolean))], [assets]);

  // Multi-attribute search & filter logic (Section 19)
  const filteredAssets = useMemo(() => {
    return assets.filter((item) => {
      // Category filter (from sidebar)
      if (categoryFilter !== 'All') {
        const catMap = {
          'assets-laptops': 'Laptop',
          'assets-desktops': 'Desktop',
          'assets-servers': 'Server',
          'assets-monitors': 'Monitor',
          'assets-network': 'Network Switch',
          'assets-printers': 'Printer',
          'assets-tablets': 'Tablet',
        };
        const targetType = catMap[categoryFilter] || categoryFilter;
        if (targetType === 'Desktop') {
          if (item.deviceType !== 'Desktop' && item.deviceType !== 'All in One Desktop') return false;
        } else if (item.deviceType !== targetType) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'All' && item.status !== statusFilter) return false;

      // Department filter
      if (deptFilter !== 'All' && item.department !== deptFilter) return false;

      // Location filter
      if (locationFilter !== 'All' && item.plant !== locationFilter) return false;

      // Global search string
      if (globalSearch) {
        const q = globalSearch.toLowerCase();
        const match =
          (item.assetNo || '').toLowerCase().includes(q) ||
          (item.sr || '').toLowerCase().includes(q) ||
          (item.make || '').toLowerCase().includes(q) ||
          (item.model || '').toLowerCase().includes(q) ||
          (item.userName || '').toLowerCase().includes(q) ||
          (item.empCode || '').toLowerCase().includes(q) ||
          (item.department || '').toLowerCase().includes(q) ||
          (item.ipAddress || '').toLowerCase().includes(q) ||
          (item.macAddress || '').toLowerCase().includes(q) ||
          (item.hostName || '').toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [assets, categoryFilter, statusFilter, deptFilter, locationFilter, globalSearch]);

  // Sort logic
  const sortedAssets = useMemo(() => {
    return [...filteredAssets].sort((a, b) => {
      let aVal = a[sortBy] || '';
      let bVal = b[sortBy] || '';
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredAssets, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedAssets.length / pageSize) || 1;
  const paginatedAssets = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedAssets.slice(start, start + pageSize);
  }, [sortedAssets, currentPage, pageSize]);

  const handleSelectAll = () => {
    if (selectedIds.length === paginatedAssets.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedAssets.map((a) => a._id));
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Export CSV of currently filtered assets
  const exportFilteredCSV = () => {
    if (sortedAssets.length === 0) return alert('No data to export');
    const headers = ['Asset Tag', 'Serial No', 'Type', 'Make', 'Model', 'Status', 'User Name', 'Emp Code', 'Department', 'Location', 'Purchase Date', 'Price'];
    const rows = sortedAssets.map(a => [
      a.assetNo || '',
      a.sr || '',
      a.deviceType || '',
      a.make || '',
      a.model || '',
      a.status || '',
      a.userName || 'Unassigned',
      a.empCode || '',
      a.department || '',
      a.plant || '',
      a.purchaseDate ? new Date(a.purchaseDate).toLocaleDateString() : '',
      a.purchasePrice || 0,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ITAM_Assets_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: '0', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Controls & Minimal Filter Bar */}
      <div
        style={{
          backgroundColor: '#0f172a',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          marginBottom: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          {/* Quick Status Pills */}
          <div style={{ display: 'flex', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px', padding: '2px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            {['All', 'Assigned', 'Available', 'Under Maintenance'].map((st) => {
              const isAct = statusFilter === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => { setStatusFilter(st); setCurrentPage(1); }}
                  style={{
                    padding: '0.25rem 0.6rem',
                    fontSize: '0.75rem',
                    fontWeight: isAct ? 600 : 400,
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: isAct ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                    color: isAct ? '#818cf8' : '#94a3b8',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {st}
                </button>
              );
            })}
          </div>

          {/* Department Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Dept:</span>
            <select
              value={deptFilter}
              onChange={(e) => { setDeptFilter(e.target.value); setCurrentPage(1); }}
              style={selectStyle}
            >
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Plant:</span>
            <select
              value={locationFilter}
              onChange={(e) => { setLocationFilter(e.target.value); setCurrentPage(1); }}
              style={selectStyle}
            >
              {locations.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Action CTAs: CSV Export & Count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontVariantNumeric: 'tabular-nums' }}>
            <strong style={{ color: '#cbd5e1' }}>{sortedAssets.length}</strong> items
          </span>
          <button
            type="button"
            onClick={exportFilteredCSV}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#cbd5e1',
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Asset Table */}
      <div
        style={{
          backgroundColor: '#0f172a',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#090d16', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <th style={{ padding: '0.65rem 0.85rem', width: '36px' }}>
                  <input
                    type="checkbox"
                    checked={paginatedAssets.length > 0 && selectedIds.length === paginatedAssets.length}
                    onChange={handleSelectAll}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
                <th onClick={() => handleSort('assetNo')} style={thStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                    <span>Asset Tag</span>
                    <ArrowUpDown size={11} />
                  </div>
                </th>
                <th onClick={() => handleSort('make')} style={thStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                    <span>Model</span>
                    <ArrowUpDown size={11} />
                  </div>
                </th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Hostname</th>
                <th style={thStyle}>IP Address</th>
                <th onClick={() => handleSort('sr')} style={thStyle}>Serial No</th>
                <th onClick={() => handleSort('userName')} style={thStyle}>Custodian</th>
                <th style={thStyle}>Dept</th>
                <th style={thStyle}>Plant</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Remark / VNC</th>
                <th style={thStyle}>Doc</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAssets.length === 0 ? (
                <tr>
                  <td colSpan="14" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    No matching assets found for your search and filters.
                  </td>
                </tr>
              ) : (
                paginatedAssets.map((item) => {
                  const isSelected = selectedIds.includes(item._id);
                  const isAssigned = item.status === 'Assigned' && item.userName && item.userName !== 'Unassigned';
                  const stColor = STATUS_COLORS[item.status] || STATUS_COLORS.Available;

                  return (
                    <tr
                      key={item._id}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                        transition: 'background-color 0.12s',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {/* Checkbox */}
                      <td style={{ padding: '0.65rem 0.85rem' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(item._id)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>

                      {/* Asset Tag */}
                      <td style={{ padding: '0.65rem 0.85rem', fontWeight: 600, color: '#818cf8', fontFamily: 'monospace' }}>
                        <div style={{ cursor: 'pointer' }} onClick={() => onViewDetails(item)}>
                          {item.assetNo || `AST-${item.sr?.substring(0, 8)}`}
                        </div>
                      </td>

                      {/* Make & Model */}
                      <td style={{ padding: '0.65rem 0.85rem' }}>
                        <div style={{ fontWeight: 500, color: '#f8fafc' }}>
                          {item.make} {item.model}
                        </div>
                      </td>

                      {/* Category */}
                      <td style={{ padding: '0.65rem 0.85rem', color: '#94a3b8' }}>
                        {item.deviceType || 'Laptop'}
                      </td>

                      {/* Host-Name */}
                      <td style={{ padding: '0.65rem 0.85rem', fontWeight: 500, color: '#f8fafc' }}>
                        {item.hostName || '—'}
                      </td>

                      {/* IP Address */}
                      <td style={{ padding: '0.65rem 0.85rem', fontFamily: 'monospace', color: '#38bdf8', fontSize: '0.78rem' }}>
                        {item.ipAddress || '—'}
                      </td>

                      {/* Serial Number */}
                      <td style={{ padding: '0.65rem 0.85rem', fontFamily: 'monospace', color: '#64748b', fontSize: '0.75rem' }}>
                        {item.sr}
                      </td>

                      {/* Employee */}
                      <td style={{ padding: '0.65rem 0.85rem' }}>
                        {isAssigned ? (
                          <div>
                            <div style={{ color: '#f8fafc', fontWeight: 500 }}>{item.userName}</div>
                            {item.empCode && (
                              <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{item.empCode}</div>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: '#475569', fontSize: '0.75rem' }}>
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* Department */}
                      <td style={{ padding: '0.65rem 0.85rem', color: '#cbd5e1' }}>
                        {item.department || '—'}
                      </td>

                      {/* Location */}
                      <td style={{ padding: '0.65rem 0.85rem', color: '#64748b' }}>
                        {item.plant || '—'}
                      </td>

                      {/* Minimal Status Dot */}
                      <td style={{ padding: '0.65rem 0.85rem' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            color: stColor.text,
                          }}
                        >
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: stColor.text,
                            }}
                          />
                          <span>{item.status}</span>
                        </span>
                      </td>

                      {/* Remark / VNC */}
                      <td style={{ padding: '0.65rem 0.85rem', fontSize: '0.75rem', color: item.vncPassword ? '#fde047' : '#64748b' }}>
                        {item.remarks || (item.vncPassword ? `VNC: ${item.vncPassword}` : '—')}
                      </td>

                      {/* Invoice / PDF Document Preview */}
                      <td style={{ padding: '0.65rem 0.85rem' }}>
                        {item.invoiceImage ? (
                          <button
                            type="button"
                            onClick={() => onViewDetails(item, 'documents')}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              padding: '0.2rem 0.45rem',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(99, 102, 241, 0.1)',
                              border: '1px solid rgba(99, 102, 241, 0.25)',
                              color: '#818cf8',
                              fontSize: '0.7rem',
                              fontWeight: 500,
                              cursor: 'pointer',
                            }}
                          >
                            <span>{item.invoiceImage?.startsWith('data:application/pdf') ? 'PDF' : 'Bill'}</span>
                          </button>
                        ) : (
                          <span style={{ color: '#334155', fontSize: '0.72rem' }}>—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.25rem', alignItems: 'center' }}>
                          <button
                            type="button"
                            onClick={() => onViewDetails(item)}
                            title="View Details"
                            style={actionBtnStyle}
                          >
                            <Eye size={13} />
                          </button>

                          {isAssigned ? (
                            <>
                              <button
                                type="button"
                                onClick={() => onTransfer(item)}
                                title="Transfer"
                                style={{ ...actionBtnStyle, color: '#38bdf8' }}
                              >
                                <ArrowRightLeft size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => onReturn(item)}
                                title="Return"
                                style={{ ...actionBtnStyle, color: '#fbbf24' }}
                              >
                                <Undo2 size={13} />
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onAssign(item)}
                              title="Assign"
                              style={{ ...actionBtnStyle, color: '#34d399' }}
                            >
                              <UserCheck size={13} />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => onMaintenance(item)}
                            title="Maintenance"
                            style={{ ...actionBtnStyle, color: '#f59e0b' }}
                          >
                            <Wrench size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Minimal Table Footer with Pagination */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.65rem 1rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            backgroundColor: '#090d16',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Page {currentPage} of {totalPages} • Total {sortedAssets.length} assets
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              style={{
                ...paginationBtnStyle,
                opacity: currentPage <= 1 ? 0.35 : 1,
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
              }}
            >
              <ChevronLeft size={14} />
              <span>Previous</span>
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              style={{
                ...paginationBtnStyle,
                opacity: currentPage >= totalPages ? 0.35 : 1,
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const selectStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '5px',
  color: '#cbd5e1',
  padding: '0.3rem 0.55rem',
  fontSize: '0.75rem',
  outline: 'none',
  cursor: 'pointer',
};

const thStyle = {
  padding: '0.65rem 0.85rem',
  color: '#64748b',
  fontWeight: 600,
  fontSize: '0.7rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const actionBtnStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  color: '#94a3b8',
  borderRadius: '5px',
  padding: '0.3rem 0.45rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background-color 0.15s',
};

const paginationBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.25rem',
  backgroundColor: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  color: '#cbd5e1',
  padding: '0.3rem 0.6rem',
  borderRadius: '5px',
  fontSize: '0.75rem',
  fontWeight: 500,
};