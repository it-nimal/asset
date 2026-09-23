import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Calendar,
  Download,
  Search,
  Filter,
  Eye,
  Edit,
  ExternalLink,
  CheckCircle2,
  XCircle,
  X,
} from 'lucide-react';
import { useToast } from '../common/Toast';

export default function WarrantyView({
  assets = [],
  onViewDetails,
  onEditAsset,
}) {
  const toast = useToast();
  const [selectedBucket, setSelectedBucket] = useState('all'); // 'all', '30d', '60d', '90d', 'expired', 'active'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPlant, setSelectedPlant] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const now = new Date();

  // Calculate days remaining helper
  const getWarrantyInfo = (asset) => {
    if (!asset.warrantyEndDate) return { status: 'none', days: null, label: 'No Warranty Record' };
    const end = new Date(asset.warrantyEndDate);
    if (isNaN(end.getTime())) return { status: 'none', days: null, label: 'Invalid Date' };

    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'expired', days: diffDays, label: `Expired (${Math.abs(diffDays)}d ago)` };
    }
    if (diffDays <= 30) {
      return { status: '30d', days: diffDays, label: `${diffDays} days left (Critical)` };
    }
    if (diffDays <= 60) {
      return { status: '60d', days: diffDays, label: `${diffDays} days left` };
    }
    if (diffDays <= 90) {
      return { status: '90d', days: diffDays, label: `${diffDays} days left` };
    }
    return { status: 'active', days: diffDays, label: `${diffDays} days left` };
  };

  // Compute bucket metrics
  const metrics = useMemo(() => {
    let expired = 0;
    let in30 = 0;
    let in60 = 0;
    let in90 = 0;
    let active = 0;
    let totalRecorded = 0;

    assets.forEach((a) => {
      const info = getWarrantyInfo(a);
      if (info.status !== 'none') {
        totalRecorded++;
        if (info.status === 'expired') expired++;
        else if (info.status === '30d') in30++;
        else if (info.status === '60d') in60++;
        else if (info.status === '90d') in90++;
        else if (info.status === 'active') active++;
      }
    });

    return { totalRecorded, expired, in30, in60, in90, active };
  }, [assets]);

  // Unique plants
  const plantOptions = useMemo(() => {
    const set = new Set();
    assets.forEach((a) => {
      if (a.plant) set.add(a.plant);
    });
    return Array.from(set).sort();
  }, [assets]);

  // Unique categories
  const categoryOptions = useMemo(() => {
    const set = new Set();
    assets.forEach((a) => {
      const c = a.category || a.deviceType;
      if (c) set.add(c);
    });
    return Array.from(set).sort();
  }, [assets]);

  // Filtered assets
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const info = getWarrantyInfo(asset);

      // Bucket filter
      if (selectedBucket === '30d' && info.status !== '30d') return false;
      if (selectedBucket === '60d' && info.status !== '60d') return false;
      if (selectedBucket === '90d' && info.status !== '90d') return false;
      if (selectedBucket === 'expired' && info.status !== 'expired') return false;
      if (selectedBucket === 'active' && info.status !== 'active') return false;
      if (selectedBucket === 'all' && info.status === 'none') return false;

      // Category filter
      if (selectedCategory !== 'All') {
        const cat = asset.category || asset.deviceType || '';
        if (cat !== selectedCategory) return false;
      }

      // Plant filter
      if (selectedPlant !== 'All' && asset.plant !== selectedPlant) {
        return false;
      }

      // Search filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const tag = (asset.assetNo || '').toLowerCase();
        const sr = (asset.sr || '').toLowerCase();
        const make = (asset.make || '').toLowerCase();
        const model = (asset.model || '').toLowerCase();
        const vendor = (asset.vendor || asset.vendorName || '').toLowerCase();
        const user = (asset.userName || '').toLowerCase();

        if (
          !tag.includes(q) &&
          !sr.includes(q) &&
          !make.includes(q) &&
          !model.includes(q) &&
          !vendor.includes(q) &&
          !user.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [assets, selectedBucket, selectedCategory, selectedPlant, searchTerm]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredAssets.length / itemsPerPage));
  const paginatedAssets = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAssets.slice(start, start + itemsPerPage);
  }, [filteredAssets, currentPage]);

  const handleExportCSV = () => {
    if (filteredAssets.length === 0) {
      return toast.warning('No warranty records match current filters');
    }
    const headers = [
      'Asset Tag',
      'Serial Number',
      'Category',
      'Make',
      'Model',
      'Plant',
      'Custodian',
      'Vendor / OEM',
      'Warranty Start Date',
      'Warranty End Date',
      'Days Remaining',
      'Warranty Status',
      'Warranty Details',
    ];
    const rows = filteredAssets.map((a) => {
      const info = getWarrantyInfo(a);
      return [
        a.assetNo || '',
        a.sr || '',
        a.category || a.deviceType || '',
        a.make || '',
        a.model || '',
        a.plant || '',
        a.userName || 'Unassigned',
        a.vendor || a.vendorName || '',
        a.warrantyStartDate ? new Date(a.warrantyStartDate).toLocaleDateString() : '',
        a.warrantyEndDate ? new Date(a.warrantyEndDate).toLocaleDateString() : '',
        info.days !== null ? info.days : 'N/A',
        info.status,
        a.warrantyDetails || '',
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `Warranty_Schedule_${selectedBucket}_${Date.now()}.csv`;
    link.click();
    toast.success(`Exported ${filteredAssets.length} warranty records to CSV`);
  };

  const getBadgeForStatus = (info) => {
    if (info.status === 'expired') {
      return { bg: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: '#ef4444' };
    }
    if (info.status === '30d') {
      return { bg: 'rgba(239, 68, 68, 0.14)', color: '#f87171', border: '#f87171' };
    }
    if (info.status === '60d') {
      return { bg: 'rgba(245, 158, 11, 0.14)', color: '#fbbf24', border: '#fbbf24' };
    }
    if (info.status === '90d') {
      return { bg: 'rgba(56, 189, 248, 0.14)', color: '#38bdf8', border: '#38bdf8' };
    }
    if (info.status === 'active') {
      return { bg: 'rgba(16, 185, 129, 0.12)', color: '#34d399', border: '#34d399' };
    }
    return { bg: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8', border: '#64748b' };
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
            OEM Warranty & AMC Expiration Monitor
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Track active coverage, upcoming 30/60/90-day OEM expiration schedules, and renew Annual Maintenance Contracts (AMC).
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="btn btn-outline btn-sm"
          title="Export warranty schedule to CSV"
        >
          <Download size={14} />
          <span>Export Schedule</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.85rem',
          marginBottom: '1.5rem',
        }}
      >
        {[
          { id: 'all', label: 'Under Warranty', count: metrics.totalRecorded, color: '#38bdf8', icon: ShieldCheck },
          { id: '30d', label: 'Expiring in ≤ 30 Days', count: metrics.in30, color: '#ef4444', icon: ShieldAlert },
          { id: '60d', label: 'Expiring in 31-60 Days', count: metrics.in60, color: '#f59e0b', icon: Clock },
          { id: '90d', label: 'Expiring in 61-90 Days', count: metrics.in90, color: '#38bdf8', icon: Calendar },
          { id: 'active', label: 'Active (> 90 Days)', count: metrics.active, color: '#34d399', icon: CheckCircle2 },
          { id: 'expired', label: 'Expired Warranties', count: metrics.expired, color: '#94a3b8', icon: XCircle },
        ].map((kpi) => {
          const Icon = kpi.icon;
          const isSelected = selectedBucket === kpi.id;
          return (
            <div
              key={kpi.id}
              onClick={() => {
                setSelectedBucket(kpi.id);
                setCurrentPage(1);
              }}
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isSelected ? 'var(--bg-surface-active)' : 'var(--bg-surface)',
                border: '1px solid',
                borderColor: isSelected ? kpi.color : 'var(--border-default)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isSelected ? `0 0 14px ${kpi.color}25` : 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: isSelected ? '#ffffff' : 'var(--text-muted)', fontWeight: 600 }}>
                  {kpi.label}
                </span>
                <Icon size={16} color={kpi.color} />
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: kpi.color, marginTop: '0.4rem', lineHeight: 1 }}>
                {kpi.count}
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div
        className="card"
        style={{
          padding: '0.85rem 1.15rem',
          marginBottom: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.85rem',
        }}
      >
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
            placeholder="Search Tag, S/N, Make, Model, Vendor..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="input-field"
            style={{ paddingLeft: '32px', paddingRight: searchTerm ? '32px' : '10px', fontSize: '0.82rem', height: '36px', width: '100%' }}
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
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-faint)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: 0,
              }}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-faint)', fontWeight: 600 }}>Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="input-field"
              style={{ height: '34px', fontSize: '0.78rem', padding: '0 0.65rem' }}
            >
              <option value="All">All Categories</option>
              {categoryOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

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

          {(searchTerm || selectedCategory !== 'All' || selectedPlant !== 'All' || selectedBucket !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
                setSelectedPlant('All');
                setSelectedBucket('all');
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

      {/* Warranty Table */}
      <div className="table-container">
        <div style={{ overflowX: 'auto' }}>
          <table className="table-modern">
            <thead>
              <tr>
                <th>Asset Tag</th>
                <th>Hardware / Model</th>
                <th>Serial Number</th>
                <th>Category</th>
                <th>Plant</th>
                <th>Custodian</th>
                <th>Vendor / OEM</th>
                <th>Warranty Expiration</th>
                <th>Remaining / Urgency</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAssets.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                    <ShieldCheck size={36} color="var(--text-faint)" style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                    <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      No assets found in selected warranty bucket
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedAssets.map((asset) => {
                  const info = getWarrantyInfo(asset);
                  const badge = getBadgeForStatus(info);
                  const endDateStr = asset.warrantyEndDate
                    ? new Date(asset.warrantyEndDate).toLocaleDateString()
                    : 'N/A';

                  return (
                    <tr key={asset._id || asset.id}>
                      <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>
                        <button
                          type="button"
                          onClick={() => onViewDetails && onViewDetails(asset, 'warranty')}
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
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.84rem' }}>
                          {asset.make} {asset.model}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>
                          {asset.warrantyDetails || 'Standard OEM Warranty'}
                        </div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {asset.sr || 'N/A'}
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            padding: '0.12rem 0.45rem',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          {asset.category || asset.deviceType || 'Hardware'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {asset.plant || 'Vitromed HQ'}
                      </td>
                      <td style={{ fontSize: '0.82rem', color: asset.userName ? 'var(--text-primary)' : 'var(--text-faint)' }}>
                        {asset.userName || 'Unassigned'}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {asset.vendor || asset.vendorName || asset.make || 'OEM Direct'}
                      </td>
                      <td style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {endDateStr}
                      </td>
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
                          {info.label}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <button
                            type="button"
                            onClick={() => onViewDetails && onViewDetails(asset, 'warranty')}
                            className="btn btn-ghost btn-xs"
                            title="View Asset & Warranty Terms"
                          >
                            <Eye size={13} />
                          </button>
                          {onEditAsset && (
                            <button
                              type="button"
                              onClick={() => onEditAsset(asset)}
                              className="btn btn-outline btn-xs"
                              title="Extend / Update Warranty Dates"
                            >
                              <Edit size={12} />
                              <span>Extend</span>
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
