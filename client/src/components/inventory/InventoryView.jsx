import React, { useState, useMemo } from 'react';
import {
  Boxes,
  CheckCircle2,
  Clock,
  UserCheck,
  Wrench,
  AlertTriangle,
  Flame,
  Archive,
  Trash2,
  Search,
  X,
  Filter,
  Download,
  Plus,
  ArrowRightLeft,
  Undo2,
  Eye,
  SlidersHorizontal,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '../common/Toast';

const INVENTORY_STATUSES = [
  { id: 'all', label: 'All Inventory', icon: Boxes, color: '#38bdf8' },
  { id: 'Available', label: 'Available (In Stock)', icon: CheckCircle2, color: '#34d399' },
  { id: 'Reserved', label: 'Reserved', icon: Clock, color: '#60a5fa' },
  { id: 'Assigned', label: 'Assigned (In Use)', icon: UserCheck, color: '#a78bfa' },
  { id: 'Under Maintenance', label: 'Maintenance / Repair', icon: Wrench, color: '#fbbf24' },
  { id: 'Under QC', label: 'Under QC Testing', icon: AlertTriangle, color: '#f97316' },
  { id: 'Damaged', label: 'Damaged / Defective', icon: Flame, color: '#ef4444' },
  { id: 'Retired', label: 'Retired (Decommissioned)', icon: Archive, color: '#94a3b8' },
  { id: 'Disposed', label: 'Disposed / Scrapped', icon: Trash2, color: '#64748b' },
];

const CATEGORIES = [
  'All',
  'Laptop',
  'Desktop',
  'Server',
  'Network Switch',
  'Printer',
  'Monitor',
  'Tablet',
  'Power / UPS',
  'Other',
];

export default function InventoryView({
  assets = [],
  departments = [],
  locations = [],
  onViewDetails,
  onAssign,
  onTransfer,
  onReturn,
  onMaintenance,
  onMaintenanceReturn,
  onRetire,
  onInwardNew,
  onRefresh,
}) {
  const toast = useToast();
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPlant, setSelectedPlant] = useState('All');
  const [selectedDept, setSelectedDept] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Counts by status
  const statusCounts = useMemo(() => {
    const counts = { all: assets.length };
    INVENTORY_STATUSES.forEach((st) => {
      if (st.id !== 'all') {
        counts[st.id] = assets.filter((a) => {
          if (st.id === 'Available') {
            return a.status === 'Available' || a.status === 'In Stock';
          }
          return a.status?.toLowerCase() === st.id.toLowerCase();
        }).length;
      }
    });
    return counts;
  }, [assets]);

  // Unique plants from assets & locations
  const plantOptions = useMemo(() => {
    const set = new Set();
    assets.forEach((a) => {
      if (a.plant) set.add(a.plant);
    });
    locations.forEach((l) => {
      if (l.name) set.add(l.name);
    });
    return Array.from(set).sort();
  }, [assets, locations]);

  // Unique departments
  const deptOptions = useMemo(() => {
    const set = new Set();
    assets.forEach((a) => {
      if (a.department) set.add(a.department);
    });
    departments.forEach((d) => {
      if (d.name) set.add(d.name);
    });
    return Array.from(set).sort();
  }, [assets, departments]);

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      // Status filter
      if (selectedStatus !== 'all') {
        if (selectedStatus === 'Available') {
          if (asset.status !== 'Available' && asset.status !== 'In Stock') return false;
        } else if (asset.status?.toLowerCase() !== selectedStatus.toLowerCase()) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'All') {
        const cat = asset.category || asset.deviceType || '';
        if (selectedCategory === 'Power / UPS') {
          if (!cat.includes('Power') && !cat.includes('UPS')) return false;
        } else if (!cat.toLowerCase().includes(selectedCategory.toLowerCase())) {
          return false;
        }
      }

      // Plant filter
      if (selectedPlant !== 'All' && asset.plant !== selectedPlant) {
        return false;
      }

      // Department filter
      if (selectedDept !== 'All' && asset.department !== selectedDept) {
        return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const tag = (asset.assetNo || '').toLowerCase();
        const sr = (asset.sr || '').toLowerCase();
        const make = (asset.make || '').toLowerCase();
        const model = (asset.model || '').toLowerCase();
        const user = (asset.userName || '').toLowerCase();
        const empCode = (asset.empCode || '').toLowerCase();
        const ip = (asset.ipAddress || '').toLowerCase();
        const host = (asset.hostName || '').toLowerCase();

        if (
          !tag.includes(q) &&
          !sr.includes(q) &&
          !make.includes(q) &&
          !model.includes(q) &&
          !user.includes(q) &&
          !empCode.includes(q) &&
          !ip.includes(q) &&
          !host.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [assets, selectedStatus, selectedCategory, selectedPlant, selectedDept, searchTerm]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredAssets.length / itemsPerPage));
  const paginatedAssets = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAssets.slice(start, start + itemsPerPage);
  }, [filteredAssets, currentPage]);

  const handleExportCSV = () => {
    if (filteredAssets.length === 0) {
      return toast.warning('No assets match current filters to export.');
    }
    const headers = [
      'Asset Tag',
      'Serial Number',
      'Category',
      'Device Type',
      'Make',
      'Model',
      'Status',
      'Condition',
      'Plant',
      'Department',
      'Custodian',
      'Employee Code',
      'Purchase Date',
      'Warranty End Date',
    ];
    const rows = filteredAssets.map((a) => [
      a.assetNo || '',
      a.sr || '',
      a.category || a.deviceType || '',
      a.deviceType || '',
      a.make || '',
      a.model || '',
      a.status || '',
      a.condition || '',
      a.plant || '',
      a.department || '',
      a.userName || 'Unassigned',
      a.empCode || '',
      a.purchaseDate ? new Date(a.purchaseDate).toLocaleDateString() : '',
      a.warrantyEndDate ? new Date(a.warrantyEndDate).toLocaleDateString() : '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `Inventory_${selectedStatus}_${Date.now()}.csv`;
    link.click();
    toast.success(`Exported ${filteredAssets.length} assets to CSV`);
  };

  const getStatusBadge = (status) => {
    const st = (status || '').toLowerCase();
    if (st === 'available' || st === 'in stock') {
      return { bg: 'rgba(16, 185, 129, 0.12)', color: '#34d399', text: 'Available' };
    }
    if (st === 'assigned') {
      return { bg: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', text: 'Assigned' };
    }
    if (st === 'reserved') {
      return { bg: 'rgba(96, 165, 250, 0.12)', color: '#60a5fa', text: 'Reserved' };
    }
    if (st.includes('maintenance') || st.includes('repair')) {
      return { bg: 'rgba(245, 158, 11, 0.12)', color: '#fbbf24', text: 'Maintenance' };
    }
    if (st.includes('qc')) {
      return { bg: 'rgba(249, 115, 22, 0.12)', color: '#f97316', text: 'Under QC' };
    }
    if (st.includes('damaged')) {
      return { bg: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', text: 'Damaged' };
    }
    if (st.includes('retired')) {
      return { bg: 'rgba(148, 163, 184, 0.12)', color: '#94a3b8', text: 'Retired' };
    }
    if (st.includes('disposed') || st.includes('scrapped')) {
      return { bg: 'rgba(100, 116, 139, 0.12)', color: '#64748b', text: 'Disposed' };
    }
    return { bg: 'rgba(148, 163, 184, 0.12)', color: '#94a3b8', text: status || 'Unknown' };
  };

  return (
    <div className="page-container" style={{ maxWidth: '1600px', margin: '0 auto', padding: '1.5rem 2rem 4rem' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Central Inventory & Lifecycle Management
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Real-time multi-state hardware inventory ledger across all facilities, depots, and maintenance hubs.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button
            type="button"
            onClick={handleExportCSV}
            className="btn btn-outline btn-sm"
            title="Export filtered inventory to CSV"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          {onInwardNew && (
            <button
              type="button"
              onClick={onInwardNew}
              className="btn btn-primary btn-sm"
            >
              <Plus size={14} />
              <span>+ Inward Asset</span>
            </button>
          )}
        </div>
      </div>

      {/* Status KPI / Tab Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))',
          gap: '0.65rem',
          marginBottom: '1.5rem',
        }}
      >
        {INVENTORY_STATUSES.map((st) => {
          const Icon = st.icon;
          const isSelected = selectedStatus === st.id;
          const count = statusCounts[st.id] || 0;

          return (
            <div
              key={st.id}
              onClick={() => {
                setSelectedStatus(st.id);
                setCurrentPage(1);
              }}
              style={{
                padding: '0.85rem 0.95rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isSelected ? 'var(--bg-surface-active)' : 'var(--bg-surface)',
                border: '1px solid',
                borderColor: isSelected ? st.color : 'var(--border-default)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: isSelected ? `0 0 12px ${st.color}22` : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: `${st.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: st.color,
                    flexShrink: 0,
                  }}
                >
                  <Icon size={16} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: isSelected ? '#ffffff' : 'var(--text-muted)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {st.label.split('(')[0]}
                  </div>
                  <div
                    style={{
                      fontSize: '1.15rem',
                      fontWeight: 800,
                      color: isSelected ? st.color : 'var(--text-primary)',
                      lineHeight: 1.2,
                    }}
                  >
                    {count}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter Toolbar */}
      <div
        className="card"
        style={{
          padding: '1rem 1.25rem',
          marginBottom: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
        }}
      >
        {/* Top row: Search & dropdown filters */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.85rem',
          }}
        >
          {/* Search bar */}
          <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-faint)',
              }}
            />
            <input
              type="text"
              placeholder="Search Tag, Serial, Make, Model, User..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="input-field"
              style={{ paddingLeft: '32px', paddingRight: searchTerm ? '30px' : '10px', fontSize: '0.82rem', height: '36px' }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-faint)',
                  padding: '3px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                }}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            {/* Plant selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-faint)', fontWeight: 600 }}>Plant:</span>
              <select
                value={selectedPlant}
                onChange={(e) => {
                  setSelectedPlant(e.target.value);
                  setCurrentPage(1);
                }}
                className="input-field"
                style={{ height: '34px', fontSize: '0.78rem', padding: '0 0.65rem' }}
              >
                <option value="All">All Plants</option>
                {plantOptions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Department selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-faint)', fontWeight: 600 }}>Dept:</span>
              <select
                value={selectedDept}
                onChange={(e) => {
                  setSelectedDept(e.target.value);
                  setCurrentPage(1);
                }}
                className="input-field"
                style={{ height: '34px', fontSize: '0.78rem', padding: '0 0.65rem' }}
              >
                <option value="All">All Departments</option>
                {deptOptions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {(searchTerm || selectedCategory !== 'All' || selectedPlant !== 'All' || selectedDept !== 'All' || selectedStatus !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                  setSelectedPlant('All');
                  setSelectedDept('All');
                  setSelectedStatus('all');
                  setCurrentPage(1);
                }}
                className="btn btn-ghost btn-xs"
                style={{ color: 'var(--text-faint)', fontSize: '0.74rem' }}
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Bottom row: Category filter chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', fontWeight: 600, marginRight: '0.25rem' }}>
            Category:
          </span>
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentPage(1);
                }}
                style={{
                  padding: '0.22rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.74rem',
                  fontWeight: isActive ? 700 : 500,
                  backgroundColor: isActive ? 'var(--primary)' : 'var(--bg-surface-raised)',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  border: '1px solid',
                  borderColor: isActive ? 'var(--primary)' : 'var(--border-default)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="table-container">
        <div style={{ overflowX: 'auto' }}>
          <table className="table-modern">
            <thead>
              <tr>
                <th>Asset Tag</th>
                <th>Hardware / Model</th>
                <th>Serial Number</th>
                <th>Category</th>
                <th>Status</th>
                <th>Plant / Facility</th>
                <th>Department</th>
                <th>Custodian</th>
                <th>Condition</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAssets.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                    <Boxes size={36} color="var(--text-faint)" style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                    <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      No inventory assets found
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-faint)', marginTop: '0.25rem' }}>
                      Try adjusting the status tabs, search query, or category filters.
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedAssets.map((asset) => {
                  const badge = getStatusBadge(asset.status);
                  const isAvailable = asset.status === 'Available' || asset.status === 'In Stock';
                  const isAssigned = asset.status === 'Assigned';

                  return (
                    <tr key={asset._id || asset.id}>
                      {/* Asset Tag */}
                      <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>
                        <button
                          type="button"
                          onClick={() => onViewDetails && onViewDetails(asset, 'overview')}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#38bdf8',
                            cursor: 'pointer',
                            fontWeight: 700,
                            fontFamily: 'var(--font-mono)',
                            padding: 0,
                            textDecoration: 'underline',
                          }}
                        >
                          {asset.assetNo || 'AST-N/A'}
                        </button>
                      </td>

                      {/* Hardware / Model */}
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.84rem' }}>
                          {asset.make} {asset.model}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>
                          {asset.hostName ? `Host: ${asset.hostName}` : asset.deviceType || 'Hardware'}
                        </div>
                      </td>

                      {/* Serial Number */}
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {asset.sr || 'N/A'}
                      </td>

                      {/* Category */}
                      <td>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            padding: '0.15rem 0.45rem',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          {asset.category || asset.deviceType || 'Other'}
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '0.18rem 0.55rem',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: badge.bg,
                            color: badge.color,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                          }}
                        >
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: badge.color,
                            }}
                          />
                          {badge.text}
                        </span>
                      </td>

                      {/* Plant */}
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {asset.plant || 'Vitromed HQ'}
                      </td>

                      {/* Department */}
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {asset.department || 'N/A'}
                      </td>

                      {/* Custodian */}
                      <td>
                        {asset.userName ? (
                          <div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                              {asset.userName}
                            </div>
                            {asset.empCode && (
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>
                                ID: {asset.empCode}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)', fontStyle: 'italic' }}>
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* Condition */}
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {asset.condition || 'Good'}
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <button
                            type="button"
                            onClick={() => onViewDetails && onViewDetails(asset, 'overview')}
                            className="btn btn-ghost btn-xs"
                            title="View Asset Details"
                          >
                            <Eye size={13} />
                          </button>

                          {isAvailable && onAssign && (
                            <button
                              type="button"
                              onClick={() => onAssign(asset)}
                              className="btn btn-primary btn-xs"
                              title="Assign to Employee"
                            >
                              <UserCheck size={12} />
                              <span>Assign</span>
                            </button>
                          )}

                          {isAssigned && onTransfer && (
                            <button
                              type="button"
                              onClick={() => onTransfer(asset)}
                              className="btn btn-outline btn-xs"
                              title="Transfer Custody"
                            >
                              <ArrowRightLeft size={12} />
                            </button>
                          )}

                          {isAssigned && onReturn && (
                            <button
                              type="button"
                              onClick={() => onReturn(asset)}
                              className="btn btn-outline btn-xs"
                              title="Return to Stock"
                            >
                              <Undo2 size={12} />
                            </button>
                          )}

                          {asset.status === 'Under Maintenance' && onMaintenanceReturn && (
                            <button
                              type="button"
                              onClick={() => onMaintenanceReturn(asset)}
                              className="btn btn-warning btn-xs"
                              title="Return from Maintenance to Stock"
                            >
                              <CheckCircle2 size={12} />
                              <span>Mark Repaired</span>
                            </button>
                          )}

                          {asset.status !== 'Under Maintenance' && onMaintenance && (
                            <button
                              type="button"
                              onClick={() => onMaintenance(asset)}
                              className="btn btn-ghost btn-xs"
                              title="Send to Maintenance"
                            >
                              <Wrench size={13} />
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

        {/* Pagination Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.85rem 1.25rem',
            borderTop: '1px solid var(--border-default)',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div>
            Showing{' '}
            <strong style={{ color: 'var(--text-primary)' }}>
              {filteredAssets.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
            </strong>{' '}
            to{' '}
            <strong style={{ color: 'var(--text-primary)' }}>
              {Math.min(currentPage * itemsPerPage, filteredAssets.length)}
            </strong>{' '}
            of <strong style={{ color: 'var(--text-primary)' }}>{filteredAssets.length}</strong> items
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="btn btn-ghost btn-xs"
              style={{ opacity: currentPage <= 1 ? 0.4 : 1 }}
            >
              Previous
            </button>
            <span style={{ padding: '0 0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="btn btn-ghost btn-xs"
              style={{ opacity: currentPage >= totalPages ? 0.4 : 1 }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
