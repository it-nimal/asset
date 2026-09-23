import React, { useState, useEffect, useMemo } from 'react';
import {
  Truck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Boxes,
  Eye,
  Edit3,
  Trash2,
  Download,
  Calendar,
  Layers,
  ArrowRight,
  X,
} from 'lucide-react';
import { INWARD_CATEGORIES } from '../../config/assetSpecificationConfig';
import InwardForm from './InwardForm';
import InwardDetailModal from './InwardDetailModal';
import { api } from '../../services/api';
import { useToast } from '../common/Toast';

export default function InwardRegister({
  vendors = [],
  onViewAsset,
  onInwardCreated,
}) {
  const toast = useToast();
  const [inwards, setInwards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [vendorFilter, setVendorFilter] = useState('All');

  // Modals state
  const [showInwardForm, setShowInwardForm] = useState(false);
  const [editingInward, setEditingInward] = useState(null);
  const [selectedInwardForDetail, setSelectedInwardForDetail] = useState(null);

  // Load Inward Records
  const loadInwards = async () => {
    setLoading(true);
    try {
      const res = await api.getInwards();
      if (res && res.success && Array.isArray(res.data)) {
        setInwards(res.data);
      } else if (Array.isArray(res)) {
        setInwards(res);
      }
    } catch (err) {
      console.warn('Error loading inwards:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInwards();
  }, []);

  // Filtered list
  const filteredInwards = useMemo(() => {
    return inwards.filter((inw) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (inw.inwardNumber || '').toLowerCase().includes(q) ||
        (inw.vendor || '').toLowerCase().includes(q) ||
        (inw.invoiceNumber || '').toLowerCase().includes(q) ||
        (inw.purchaseOrderNumber || inw.poNumber || '').toLowerCase().includes(q) ||
        (inw.manufacturer || '').toLowerCase().includes(q) ||
        (inw.model || '').toLowerCase().includes(q) ||
        (inw.deviceType || '').toLowerCase().includes(q);

      const matchesCat = categoryFilter === 'All' || inw.category === categoryFilter;
      const matchesStatus = statusFilter === 'All' || inw.status === statusFilter;
      const matchesVendor = vendorFilter === 'All' || inw.vendor === vendorFilter;

      return matchesSearch && matchesCat && matchesStatus && matchesVendor;
    });
  }, [inwards, searchQuery, categoryFilter, statusFilter, vendorFilter]);

  // Statistics
  const totalShipments = inwards.length;
  const totalReceivedQty = inwards.reduce((acc, inw) => acc + (parseInt(inw.quantity, 10) || 1), 0);
  const verifiedCount = inwards.filter(
    (inw) => inw.status === 'Verified' || inw.status === 'Asset Created' || inw.status === 'Verified & Created'
  ).length;
  const pendingVerificationCount = inwards.filter(
    (inw) => inw.status === 'Received' || inw.status === 'Verification Pending'
  ).length;

  const handleDelete = async (inw) => {
    if (!window.confirm(`Are you sure you want to delete inward receipt ${inw.inwardNumber}?`)) return;
    try {
      await api.deleteInward(inw._id);
      toast.success(`Inward ${inw.inwardNumber} deleted successfully`);
      loadInwards();
    } catch (err) {
      toast.error(err.message || 'Failed to delete inward');
    }
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
              Inward & Material Receiving Register
            </h1>
            <span
              style={{
                backgroundColor: 'rgba(2, 132, 199, 0.12)',
                color: '#0284c7',
                border: '1px solid rgba(2, 132, 199, 0.25)',
                padding: '0.2rem 0.65rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 700,
              }}
            >
              {totalShipments} Shipments ({totalReceivedQty} Total Units)
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.35rem', marginBottom: 0 }}>
            Record incoming physical hardware shipments, verify technical specifications & accessories, and convert to Asset Master inventory.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingInward(null);
            setShowInwardForm(true);
          }}
          className="btn btn-primary btn-sm"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.5rem 1rem',
            fontWeight: 700,
            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
          }}
        >
          <Plus size={16} />
          <span>+ Record Inward Entry</span>
        </button>
      </div>

      {/* KPI Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div className="card" style={{ padding: '0.9rem 1.15rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: 'rgba(2, 132, 199, 0.12)', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Truck size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Inward Shipments</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{totalShipments}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '0.9rem 1.15rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: 'rgba(251, 191, 36, 0.12)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Pending Verification</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fbbf24' }}>{pendingVerificationCount}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '0.9rem 1.15rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Verified & Created</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>{verifiedCount}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '0.9rem 1.15rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: 'rgba(99, 102, 241, 0.12)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Boxes size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Units Received</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#818cf8' }}>{totalReceivedQty} Units</div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.85rem',
          marginBottom: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: '240px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
            <Search
              size={15}
              color="var(--text-muted)"
              style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Search by Inward #, Vendor, Invoice, Model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '2.25rem', paddingRight: searchQuery ? '2.25rem' : '0.65rem', fontSize: '0.82rem', width: '100%' }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '8px',
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
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="form-select"
            style={{ fontSize: '0.78rem', width: 'auto' }}
          >
            <option value="All">All Categories</option>
            {INWARD_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select"
            style={{ fontSize: '0.78rem', width: 'auto' }}
          >
            <option value="All">All Statuses</option>
            <option value="Received">Received</option>
            <option value="Verification Pending">Verification Pending</option>
            <option value="Verified">Verified</option>
            <option value="Discrepancy">Discrepancy</option>
            <option value="Asset Created">Asset Created</option>
          </select>

          <button
            type="button"
            onClick={loadInwards}
            className="btn btn-outline btn-xs"
            style={{ height: '32px' }}
            title="Refresh Inwards"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Inward Register Table */}
      <div
        className="card"
        style={{
          padding: 0,
          overflow: 'hidden',
          border: '1px solid var(--border-default, #e2e8f0)',
          backgroundColor: 'var(--bg-surface, #ffffff)',
          borderRadius: '8px',
        }}
      >
        <div className="table-responsive" style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-surface-raised, #f8fafc)', borderBottom: '2px solid var(--border-default, #e2e8f0)' }}>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-secondary)' }}>Inward No.</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-secondary)' }}>Received Date</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-secondary)' }}>Vendor / Supplier</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-secondary)' }}>Invoice / PO #</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-secondary)' }}>Category & Item</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'center', fontWeight: 700, color: 'var(--text-secondary)' }}>Quantity</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-secondary)' }}>Status</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 700, color: 'var(--text-secondary)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInwards.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
                    <Truck size={32} color="var(--text-faint)" style={{ margin: '0 auto 0.5rem' }} />
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>No Inward Shipments Found</div>
                    <div style={{ fontSize: '0.76rem', marginTop: '4px' }}>Click "+ Record Inward Entry" to log newly arrived hardware.</div>
                  </td>
                </tr>
              ) : (
                filteredInwards.map((inw) => {
                  const statusColor =
                    inw.status === 'Verified' || inw.status === 'Asset Created' || inw.status === 'Verified & Created'
                      ? '#10b981'
                      : inw.status === 'Discrepancy'
                      ? '#f87171'
                      : '#fbbf24';

                  const statusBg =
                    inw.status === 'Verified' || inw.status === 'Asset Created' || inw.status === 'Verified & Created'
                      ? 'rgba(16, 185, 129, 0.12)'
                      : inw.status === 'Discrepancy'
                      ? 'rgba(248, 113, 113, 0.12)'
                      : 'rgba(251, 191, 36, 0.12)';

                  return (
                    <tr
                      key={inw._id || inw.inwardNumber}
                      style={{
                        borderBottom: '1px solid var(--border-subtle, #f1f5f9)',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div
                          style={{
                            fontFamily: 'monospace',
                            fontWeight: 800,
                            color: '#0284c7',
                            cursor: 'pointer',
                          }}
                          onClick={() => setSelectedInwardForDetail(inw)}
                          title="Click to view full inward shipment details"
                        >
                          {inw.inwardNumber}
                        </div>
                      </td>

                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                        {new Date(inw.receivedDate || inw.inwardDate || inw.createdAt).toLocaleDateString('en-GB')}
                      </td>

                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {inw.vendor}
                      </td>

                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-primary)' }}>
                          {inw.invoiceNumber || inw.purchaseOrderNumber || inw.poNumber || '—'}
                        </div>
                      </td>

                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div>
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                            {inw.manufacturer} {inw.model}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '0.4rem' }}>
                            ({inw.deviceType})
                          </span>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>
                          {inw.category}
                        </div>
                      </td>

                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                        <span
                          style={{
                            fontSize: '0.76rem',
                            fontWeight: 800,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(2, 132, 199, 0.08)',
                            color: '#0284c7',
                          }}
                        >
                          {inw.quantity || 1}
                        </span>
                      </td>

                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.5rem',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: statusBg,
                            color: statusColor,
                            border: `1px solid ${statusColor}44`,
                          }}
                        >
                          ● {inw.status || 'Received'}
                        </span>
                      </td>

                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedInwardForDetail(inw)}
                            className="btn btn-primary btn-xs"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}
                            title="View Inward Specifications & Verify"
                          >
                            <Eye size={12} />
                            <span>Details</span>
                          </button>

                          {inw.status !== 'Asset Created' && inw.status !== 'Verified & Created' && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingInward(inw);
                                setShowInwardForm(true);
                              }}
                              className="btn btn-outline btn-xs"
                              title="Edit Inward"
                            >
                              <Edit3 size={12} />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDelete(inw)}
                            className="btn btn-ghost btn-icon btn-xs"
                            title="Delete Inward"
                          >
                            <Trash2 size={13} color="#f87171" />
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
      </div>

      {/* Inward Form Modal */}
      {showInwardForm && (
        <InwardForm
          inward={editingInward}
          vendors={vendors}
          onClose={() => {
            setShowInwardForm(false);
            setEditingInward(null);
          }}
          onSuccess={() => {
            loadInwards();
            if (onInwardCreated) onInwardCreated();
          }}
        />
      )}

      {/* Inward Detail / Verification Modal */}
      {selectedInwardForDetail && (
        <InwardDetailModal
          inward={selectedInwardForDetail}
          onClose={() => setSelectedInwardForDetail(null)}
          onViewAsset={onViewAsset}
          onRefresh={() => {
            loadInwards();
            api.getInwardById(selectedInwardForDetail._id).then((res) => {
              if (res?.data) setSelectedInwardForDetail(res.data);
            }).catch(() => {});
          }}
        />
      )}
    </div>
  );
}
