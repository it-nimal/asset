import React, { useState, useEffect, useMemo } from 'react';
import {
  Eye,
  UserCheck,
  ArrowRightLeft,
  Undo2,
  Wrench,
  Trash2,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  Filter,
  Package,
  Layers,
  Edit3,
  CheckCircle2,
  Search,
  X,
  Archive,
  FileSpreadsheet,
} from 'lucide-react';
import { COMPANY_DEPARTMENTS, COMPANY_PLANTS } from '../../constants/organization';
import BulkImportExportModal from './BulkImportExportModal';

export const STATUS_COLORS = {
  Available: { text: '#34d399', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.28)' },
  Assigned: { text: '#38bdf8', bg: 'rgba(56, 189, 248, 0.12)', border: 'rgba(56, 189, 248, 0.28)' },
  'In Stock': { text: '#34d399', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.28)' },
  'Under Maintenance': { text: '#fbbf24', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.28)' },
  Reserved: { text: '#c084fc', bg: 'rgba(192, 132, 252, 0.12)', border: 'rgba(192, 132, 252, 0.28)' },
  Lost: { text: '#f87171', bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.28)' },
  Stolen: { text: '#ef4444', bg: 'rgba(239, 68, 68, 0.2)', border: 'rgba(239, 68, 68, 0.4)' },
  Retired: { text: '#94a3b8', bg: 'rgba(148, 163, 184, 0.12)', border: 'rgba(148, 163, 184, 0.28)' },
  Disposed: { text: '#64748b', bg: 'rgba(100, 116, 139, 0.12)', border: 'rgba(100, 116, 139, 0.28)' },
};

export default function AssetTable({
  assets = [],
  categoryFilter = 'All',
  globalSearch = '',
  onViewDetails,
  onAssign,
  onTransfer,
  onReturn,
  onMaintenanceReturn,
  onEdit,
  onMaintenance,
  onRetire,
  onDelete,
  onRefresh,
}) {
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');
  const [sortBy, setSortBy] = useState('assetNo');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [selectedIds, setSelectedIds] = useState([]);

  // Combine local table search with global header search
  const effectiveSearch = (localSearch || globalSearch || '').trim();

  // Reset pagination to page 1 whenever search query or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [effectiveSearch, categoryFilter, statusFilter, deptFilter, locationFilter]);

  // Filter options derived from company standards & data
  const departments = useMemo(
    () => ['All', ...new Set([...COMPANY_DEPARTMENTS, ...assets.map((a) => a.department).filter(Boolean)])],
    [assets]
  );
  const locations = useMemo(
    () => ['All', ...COMPANY_PLANTS],
    []
  );

  // Multi-attribute search & filter logic
  const filteredAssets = useMemo(() => {
    return assets.filter((item) => {
      // Category filter (from sidebar or tabs)
      if (categoryFilter !== 'All') {
        const catMap = {
          'assets-laptops': ['Laptop'],
          'assets-desktops': ['Desktop', 'All in One Desktop', 'Workstation'],
          'assets-servers': ['Server', 'Storage Server / NAS', 'Blade Server'],
          'assets-monitors': ['Monitor', 'Interactive Display / Signage'],
          'assets-network': ['Network Switch', 'Router / Gateway', 'Firewall', 'Wireless Access Point'],
          'assets-printers': ['Printer', 'Scanner', 'Multi-Function Copier', 'Barcode / Label Printer'],
          'assets-tablets': ['Tablet', 'Smartphone', 'Barcode Terminal / PDA'],
        };
        const allowed = catMap[categoryFilter];
        if (allowed) {
          if (!allowed.includes(item.deviceType)) return false;
        } else if (item.deviceType !== categoryFilter) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'All' && item.status !== statusFilter) return false;

      // Department filter
      if (deptFilter !== 'All' && item.department !== deptFilter) return false;

      // Location filter
      if (locationFilter !== 'All' && item.plant !== locationFilter) return false;

      // Comprehensive multi-word search query
      if (effectiveSearch) {
        const terms = effectiveSearch.toLowerCase().split(/\s+/).filter(Boolean);
        const searchableText = [
          item.assetNo,
          item.sr,
          item.serialNo,
          item.serialNumber,
          item.deviceType,
          item.make,
          item.model,
          item.userName,
          item.empCode,
          item.department,
          item.plant,
          item.location,
          item.floorCabin,
          item.floor,
          item.room,
          item.ipAddress,
          item.hostName,
          item.status,
          item.processor,
          item.ramSize,
          item.ram,
          item.hddType,
          item.storage,
          item.hddModel,
          item.billNo,
          item.invoiceNo,
          item.indentNo,
          item.po,
          item.vendorName,
          item.vendor,
          item.remarks,
          item.operatingSystem,
          item.os,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        const match = terms.every((t) => searchableText.includes(t));
        if (!match) return false;
      }

      return true;
    });
  }, [assets, categoryFilter, statusFilter, deptFilter, locationFilter, effectiveSearch]);

  // Sort logic
  const sortedAssets = useMemo(() => {
    return [...filteredAssets].sort((a, b) => {
      let aVal = a[sortBy] ?? '';
      let bVal = b[sortBy] ?? '';
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredAssets, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedAssets.length / pageSize));
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

  const getSortIcon = (field) => {
    if (sortBy !== field) return <ArrowUpDown size={12} color="var(--text-faint)" />;
    return sortOrder === 'asc' ? (
      <ArrowUp size={12} color="#38bdf8" />
    ) : (
      <ArrowDown size={12} color="#38bdf8" />
    );
  };

  // Export CSV
  const exportFilteredCSV = () => {
    const targetList = selectedIds.length > 0
      ? sortedAssets.filter((a) => selectedIds.includes(a._id))
      : sortedAssets;

    if (targetList.length === 0) return alert('No asset records to export.');

    const headers = [
      'Asset Tag',
      'Serial No',
      'Device Type',
      'Make',
      'Model',
      'Status',
      'Custodian',
      'Emp Code',
      'Department',
      'Plant Facility',
      'IP Address',
      'Host Name',
      'Warranty',
    ];

    const rows = targetList.map((a) => [
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
      a.ipAddress || '',
      a.hostName || '',
      a.warrantyDetails || '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Vitromed_Asset_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Controls & Filter Toolbar */}
      <div
        className="card"
        style={{
          padding: '0.85rem 1.15rem',
          marginBottom: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.85rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          {/* Quick Status Pills */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'rgba(0, 0, 0, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '2px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {['All', 'Assigned', 'Available', 'Under Maintenance'].map((st) => {
              const isAct = statusFilter === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    setStatusFilter(st);
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: '0.28rem 0.65rem',
                    fontSize: '0.75rem',
                    fontWeight: isAct ? 700 : 500,
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    backgroundColor: isAct ? 'var(--primary-light)' : 'transparent',
                    color: isAct ? '#a5b4fc' : 'var(--text-muted)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {st}
                </button>
              );
            })}
          </div>

          {/* Department Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>Dept:</span>
            <select
              value={deptFilter}
              onChange={(e) => {
                setDeptFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="form-select"
              style={{ padding: '0.28rem 1.8rem 0.28rem 0.65rem', fontSize: '0.78rem', width: 'auto' }}
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>Plant:</span>
            <select
              value={locationFilter}
              onChange={(e) => {
                setLocationFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="form-select"
              style={{ padding: '0.28rem 1.8rem 0.28rem 0.65rem', fontSize: '0.78rem', width: 'auto' }}
            >
              {locations.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          {/* In-Table Dedicated Search Bar */}
          <div style={{ position: 'relative', width: '220px', minWidth: '150px', flex: '1 1 180px' }}>
            <Search
              size={13}
              style={{
                position: 'absolute',
                left: '9px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-faint)',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              placeholder="Search tag, user, specs..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="form-control"
              style={{
                paddingLeft: '1.85rem',
                paddingRight: localSearch ? '1.8rem' : '0.6rem',
                height: '30px',
                fontSize: '0.76rem',
                width: '100%',
              }}
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => setLocalSearch('')}
                style={{
                  position: 'absolute',
                  right: '6px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-faint)',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="Clear table search"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Export & Count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {globalSearch && (
            <span
              style={{
                fontSize: '0.72rem',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                color: '#a5b4fc',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                padding: '0.2rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <Search size={11} />
              <span>Query: "{globalSearch}"</span>
            </span>
          )}

          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Showing <strong>{sortedAssets.length}</strong> {sortedAssets.length === 1 ? 'system' : 'systems'}
          </span>

          <button
            type="button"
            onClick={exportFilteredCSV}
            className="btn btn-outline btn-xs"
            title="Export Quick CSV"
          >
            <Download size={13} />
            <span>Export Table</span>
          </button>

          <button
            type="button"
            onClick={() => setShowBulkModal(true)}
            className="btn btn-xs"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'rgba(99, 102, 241, 0.2)',
              color: '#38bdf8',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              fontWeight: 600,
              cursor: 'pointer',
              borderRadius: 'var(--radius-sm)',
            }}
            title="Import or Export full 38-column company roster"
          >
            <FileSpreadsheet size={13} />
            <span>Master Excel / CSV</span>
          </button>
        </div>
      </div>

      {/* Floating Multi-Select Action Bar */}
      {selectedIds.length > 0 && (
        <div
          style={{
            backgroundColor: 'var(--bg-surface-raised)',
            border: '1px solid var(--border-focus)',
            borderRadius: 'var(--radius-md)',
            padding: '0.6rem 1rem',
            marginBottom: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: 'var(--shadow-md)',
            animation: 'slideUp 0.15s ease-out',
          }}
        >
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#a5b4fc' }}>
            {selectedIds.length} {selectedIds.length === 1 ? 'asset' : 'assets'} selected
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={exportFilteredCSV}
              className="btn btn-primary btn-xs"
            >
              <Download size={13} />
              <span>Export Selected</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="btn btn-ghost btn-xs"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Modern Data Table */}
      <div className="table-container">
        <div className="table-responsive-wrapper">
          <table className="table-modern">
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
                  >
                    {selectedIds.length === paginatedAssets.length && paginatedAssets.length > 0 ? (
                      <CheckSquare size={16} color="#38bdf8" />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>
                </th>

                <th onClick={() => handleSort('assetNo')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span>Asset Tag</span>
                    {getSortIcon('assetNo')}
                  </div>
                </th>

                <th onClick={() => handleSort('model')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span>Hardware / Model</span>
                    {getSortIcon('model')}
                  </div>
                </th>

                <th onClick={() => handleSort('userName')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span>Custodian</span>
                    {getSortIcon('userName')}
                  </div>
                </th>

                <th onClick={() => handleSort('department')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span>Department</span>
                    {getSortIcon('department')}
                  </div>
                </th>

                <th onClick={() => handleSort('plant')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span>Facility</span>
                    {getSortIcon('plant')}
                  </div>
                </th>

                <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span>Status</span>
                    {getSortIcon('status')}
                  </div>
                </th>

                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedAssets.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.65rem' }}>
                      <Package size={32} color="var(--text-faint)" />
                      <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                        No Asset Records Found
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', maxWidth: '340px' }}>
                        No hardware records match the current filter or search criteria. Try adjusting your query or filters.
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedAssets.map((asset) => {
                  const isSelected = selectedIds.includes(asset._id);
                  const st = STATUS_COLORS[asset.status] || STATUS_COLORS.Available;

                  return (
                    <tr
                      key={asset._id}
                      style={{
                        backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.08)' : undefined,
                      }}
                    >
                      {/* Checkbox */}
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => toggleSelectOne(asset._id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
                        >
                          {isSelected ? <CheckSquare size={16} color="#38bdf8" /> : <Square size={16} />}
                        </button>
                      </td>

                      {/* Asset Tag & Serial */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span
                            onClick={() => onViewDetails && onViewDetails(asset, 'overview')}
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 700,
                              color: '#38bdf8',
                              cursor: 'pointer',
                            }}
                          >
                            {asset.assetNo || 'AST-VIT-NEW'}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)', marginTop: '1px' }}>
                            S/N: {asset.sr || 'N/A'}
                          </span>
                        </div>
                      </td>

                      {/* Make & Specs */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {asset.make} {asset.model}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {asset.deviceType || 'Hardware'} • {asset.processor || asset.ramSize || 'Standard'}
                          </span>
                        </div>
                      </td>

                      {/* Custodian User */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <div
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: 'var(--radius-full)',
                              backgroundColor: asset.userName && asset.userName !== 'Unassigned' ? 'var(--primary-light)' : 'rgba(255,255,255,0.05)',
                              color: asset.userName && asset.userName !== 'Unassigned' ? '#a5b4fc' : 'var(--text-faint)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {(asset.userName || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 500, color: asset.userName !== 'Unassigned' ? 'var(--text-primary)' : 'var(--text-faint)' }}>
                              {asset.userName || 'Unassigned'}
                            </span>
                            {asset.empCode && (
                              <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)' }}>
                                {asset.empCode}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {asset.department || 'General IT'}
                        </span>
                      </td>

                      {/* Plant / Facility */}
                      <td>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {asset.plant || 'Main Facility'}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td>
                        <span
                          className="badge"
                          style={{
                            color: st.text,
                            backgroundColor: st.bg,
                            borderColor: st.border,
                            border: `1px solid ${st.border}`,
                          }}
                        >
                          {asset.status}
                        </span>
                      </td>

                      {/* Contextual Action Buttons */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <button
                            type="button"
                            onClick={() => onViewDetails && onViewDetails(asset, 'overview')}
                            className="btn btn-ghost btn-icon btn-xs"
                            title="View Asset Details"
                          >
                            <Eye size={14} />
                          </button>

                          {asset.status === 'Available' && onAssign && (
                            <button
                              type="button"
                              onClick={() => onAssign(asset)}
                              className="btn btn-ghost btn-icon btn-xs"
                              title="Assign to Employee"
                              style={{ color: '#34d399' }}
                            >
                              <UserCheck size={14} />
                            </button>
                          )}

                          {asset.status === 'Assigned' && onTransfer && (
                            <button
                              type="button"
                              onClick={() => onTransfer(asset)}
                              className="btn btn-ghost btn-icon btn-xs"
                              title="Transfer Custody"
                              style={{ color: '#38bdf8' }}
                            >
                              <ArrowRightLeft size={14} />
                            </button>
                          )}

                          {asset.status === 'Assigned' && onReturn && (
                            <button
                              type="button"
                              onClick={() => onReturn(asset)}
                              className="btn btn-ghost btn-icon btn-xs"
                              title="Return to Stock"
                              style={{ color: '#38bdf8' }}
                            >
                              <Undo2 size={14} />
                            </button>
                          )}

                          {asset.status === 'Under Maintenance' && (onMaintenanceReturn || onReturn) && (
                            <button
                              type="button"
                              onClick={() => {
                                if (onMaintenanceReturn) onMaintenanceReturn(asset);
                                else onReturn(asset);
                              }}
                              className="btn btn-ghost btn-icon btn-xs"
                              title="Record Return from Repair (Wapsi / Repaired)"
                              style={{ color: '#34d399' }}
                            >
                              <CheckCircle2 size={14} />
                            </button>
                          )}

                          {onMaintenance && asset.status !== 'Under Maintenance' && asset.status !== 'Retired' && (
                            <button
                              type="button"
                              onClick={() => onMaintenance(asset)}
                              className="btn btn-ghost btn-icon btn-xs"
                              title="Log Maintenance Ticket"
                              style={{ color: '#fbbf24' }}
                            >
                              <Wrench size={14} />
                            </button>
                          )}

                          {onEdit && (
                            <button
                              type="button"
                              onClick={() => onEdit(asset)}
                              className="btn btn-ghost btn-icon btn-xs"
                              title="Edit Asset Details"
                              style={{ color: '#38bdf8' }}
                            >
                              <Edit3 size={14} />
                            </button>
                          )}

                          {onRetire && asset.status !== 'Retired' && (
                            <button
                              type="button"
                              onClick={() => onRetire(asset)}
                              className="btn btn-ghost btn-icon btn-xs"
                              title="Retire / Decommission Asset"
                              style={{ color: '#94a3b8' }}
                            >
                              <Archive size={14} />
                            </button>
                          )}

                          {onDelete && (
                            <button
                              type="button"
                              onClick={() => onDelete(asset)}
                              className="btn btn-ghost btn-icon btn-xs"
                              title="Delete Asset"
                              style={{ color: '#f87171' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div
          style={{
            padding: '0.75rem 1.25rem',
            borderTop: '1px solid var(--border-default)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            backgroundColor: 'rgba(9, 15, 26, 0.45)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="form-select"
              style={{ padding: '0.15rem 1.4rem 0.15rem 0.45rem', fontSize: '0.75rem', width: 'auto' }}
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn btn-outline btn-xs"
            >
              <ChevronLeft size={14} />
              <span>Prev</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="btn btn-outline btn-xs"
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Import / Export Modal for 38-Column Roster */}
      <BulkImportExportModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onImportSuccess={() => {
          if (onRefresh) onRefresh();
          else window.location.reload();
        }}
      />
    </div>
  );
}