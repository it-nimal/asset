import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Search,
  Plus,
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Laptop,
  ShieldCheck,
  ArrowLeftRight,
  Eye,
  X,
} from 'lucide-react';
import MaintenanceStatusBadge from './MaintenanceStatusBadge';
import MaintenanceForm from './MaintenanceForm';
import MaintenanceQCModal from './MaintenanceQCModal';
import MaintenanceReturnModal from './MaintenanceReturnModal';
import MaintenanceDetailsModal from './MaintenanceDetailsModal';
import { api } from '../../services/api';

export default function MaintenanceRegister() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Active');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showQCModal, setShowQCModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);

  useEffect(() => {
    loadTickets();
  }, [statusFilter, priorityFilter, categoryFilter]);

  const loadTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMaintenance({
        status: statusFilter,
        priority: priorityFilter,
        issueCategory: categoryFilter,
        search,
      });
      setTickets(Array.isArray(data) ? data : (data.data || []));
    } catch (err) {
      setError(err.message || 'Failed to load maintenance records');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadTickets();
  };

  // Metrics counters
  const totalInMaintenance = tickets.filter(
    (t) => !['Returned', 'Cancelled', 'Resolved', 'Closed'].includes(t.status)
  ).length;
  const inRepairCount = tickets.filter((t) =>
    ['In Repair', 'Under Diagnosis'].includes(t.status)
  ).length;
  const awaitingCount = tickets.filter((t) =>
    ['Awaiting Vendor', 'Awaiting Parts'].includes(t.status)
  ).length;
  const readyCount = tickets.filter((t) => t.status === 'Ready').length;

  return (
    <div className="page-container" style={{ paddingBottom: '3rem' }}>
      {/* Top Banner & Actions */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f59e0b',
            }}
          >
            <Wrench size={22} />
          </div>
          <div>
            <h1
              style={{
                fontSize: '1.45rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
              Maintenance & Repair Register
            </h1>
            <p
              style={{
                fontSize: '0.82rem',
                color: 'var(--text-muted)',
                marginTop: '0.15rem',
                margin: 0,
              }}
            >
              Track physical equipment repair lifecycle, vendor claims, QC testing, and custodian returns.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            type="button"
            onClick={loadTickets}
            disabled={loading}
            className="btn btn-outline btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary btn-sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: '#f59e0b',
              borderColor: '#f59e0b',
              color: '#ffffff',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
            }}
          >
            <Plus size={16} />
            <span>Log Maintenance Request</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Active In Maintenance
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(59, 130, 246, 0.12)',
                color: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Wrench size={16} />
            </div>
          </div>
          <div
            style={{
              fontSize: '1.65rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginTop: '0.5rem',
              lineHeight: 1,
            }}
          >
            {totalInMaintenance}
          </div>
          <div
            style={{
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              marginTop: '0.35rem',
            }}
          >
            Total active repair tickets
          </div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              In Repair / Diagnosis
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                color: '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Clock size={16} />
            </div>
          </div>
          <div
            style={{
              fontSize: '1.65rem',
              fontWeight: 800,
              color: '#f59e0b',
              marginTop: '0.5rem',
              lineHeight: 1,
            }}
          >
            {inRepairCount}
          </div>
          <div
            style={{
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              marginTop: '0.35rem',
            }}
          >
            Technician bench testing & repairs
          </div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Vendor / Parts Pending
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(2, 132, 199, 0.12)',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={16} />
            </div>
          </div>
          <div
            style={{
              fontSize: '1.65rem',
              fontWeight: 800,
              color: '#0284c7',
              marginTop: '0.5rem',
              lineHeight: 1,
            }}
          >
            {awaitingCount}
          </div>
          <div
            style={{
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              marginTop: '0.35rem',
            }}
          >
            Awaiting vendor or spare parts
          </div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              QC Passed / Ready
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(13, 148, 136, 0.12)',
                color: '#0d9488',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div
            style={{
              fontSize: '1.65rem',
              fontWeight: 800,
              color: '#0d9488',
              marginTop: '0.5rem',
              lineHeight: 1,
            }}
          >
            {readyCount}
          </div>
          <div
            style={{
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              marginTop: '0.35rem',
            }}
          >
            Ready for employee/stock return
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="card" style={{ padding: '1.1rem', marginBottom: '1.25rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          {/* Status Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '0.35rem',
              backgroundColor: 'var(--bg-canvas)',
              padding: '0.25rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-default)',
              overflowX: 'auto',
              maxWidth: '100%',
            }}
          >
            {[
              { id: 'Active', label: 'Active Repairs' },
              { id: 'Reported', label: 'Reported' },
              { id: 'In Repair', label: 'In Repair' },
              { id: 'QC Pending', label: 'QC Pending' },
              { id: 'Ready', label: 'Ready for Return' },
              { id: 'Returned', label: 'Returned & Closed' },
              { id: 'All', label: 'All Records' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.78rem',
                  fontWeight: statusFilter === tab.id ? 700 : 500,
                  backgroundColor:
                    statusFilter === tab.id ? 'var(--bg-surface)' : 'transparent',
                  color:
                    statusFilter === tab.id
                      ? 'var(--text-primary)'
                      : 'var(--text-muted)',
                  border:
                    statusFilter === tab.id
                      ? '1px solid var(--border-default)'
                      : '1px solid transparent',
                  cursor: 'pointer',
                  boxShadow:
                    statusFilter === tab.id
                      ? '0 1px 3px rgba(0,0,0,0.06)'
                      : 'none',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} style={{ position: 'relative', minWidth: '260px' }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Ticket, Tag, Serial, Custodian..."
              className="form-input"
              style={{
                paddingLeft: '2.2rem',
                paddingRight: search ? '2.2rem' : '0.75rem',
                paddingTop: '0.45rem',
                paddingBottom: '0.45rem',
                fontSize: '0.8rem',
                width: '100%',
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
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
          </form>
        </div>

        {/* Priority & Category Dropdowns */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginTop: '0.85rem',
            paddingTop: '0.85rem',
            borderTop: '1px solid var(--border-default)',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              fontWeight: 600,
            }}
          >
            <Filter size={14} />
            <span>Filters:</span>
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="form-select"
            style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', width: 'auto' }}
          >
            <option value="All">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="form-select"
            style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', width: 'auto' }}
          >
            <option value="All">All Issue Categories</option>
            <option value="Hardware">Hardware Fault</option>
            <option value="Software">Software / OS</option>
            <option value="Power">Power & Battery</option>
            <option value="Physical Damage">Physical Damage</option>
            <option value="Performance">Performance</option>
          </select>
        </div>
      </div>

      {/* Maintenance Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <RefreshCw
              size={24}
              className="animate-spin"
              style={{ margin: '0 auto 0.75rem', color: '#f59e0b' }}
            />
            <div style={{ fontSize: '0.85rem' }}>Loading maintenance register...</div>
          </div>
        ) : error ? (
          <div
            style={{
              padding: '2.5rem',
              textAlign: 'center',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
            }}
          >
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        ) : tickets.length === 0 ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Wrench size={32} style={{ margin: '0 auto 0.75rem', color: 'var(--text-muted)', opacity: 0.5 }} />
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              No maintenance tickets found
            </div>
            <div style={{ fontSize: '0.78rem', marginTop: '0.25rem' }}>
              No maintenance records match the selected filters.
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-canvas)' }}>
                  <th style={{ padding: '0.75rem 1rem 0.75rem 1.25rem', textAlign: 'left', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                    Ticket ID
                  </th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                    Equipment / Tag
                  </th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                    Custodian
                  </th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                    Issue Description
                  </th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                    Priority
                  </th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                    Status
                  </th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                    Vendor / Cost
                  </th>
                  <th style={{ padding: '0.75rem 1.25rem 0.75rem 1rem', textAlign: 'right', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr
                    key={t._id}
                    onClick={() => {
                      setSelectedTicket(t);
                      setShowDetailsModal(true);
                    }}
                    style={{
                      borderTop: '1px solid var(--border-default)',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '0.85rem 1rem 0.85rem 1.25rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.82rem' }}>
                      {t.maintenanceId}
                    </td>

                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.82rem' }}>
                        {t.assetMake} {t.assetModel}
                      </div>
                      <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        {t.assetTag || t.assetSerial}
                      </div>
                    </td>

                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.82rem' }}>
                        {t.employeeName || 'Unassigned'}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {t.department || 'Vitromed'}
                      </div>
                    </td>

                    <td style={{ padding: '0.85rem 1rem', maxWidth: '240px' }}>
                      <div
                        style={{
                          fontWeight: 500,
                          color: 'var(--text-secondary)',
                          fontSize: '0.8rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {t.issueDescription}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {t.issueCategory || 'Hardware'}
                      </div>
                    </td>

                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.15rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor:
                            t.priority === 'High'
                              ? 'rgba(239, 68, 68, 0.12)'
                              : t.priority === 'Medium'
                              ? 'rgba(245, 158, 11, 0.12)'
                              : 'var(--bg-canvas)',
                          color:
                            t.priority === 'High'
                              ? '#ef4444'
                              : t.priority === 'Medium'
                              ? '#f59e0b'
                              : 'var(--text-muted)',
                          border: `1px solid ${
                            t.priority === 'High'
                              ? 'rgba(239, 68, 68, 0.25)'
                              : t.priority === 'Medium'
                              ? 'rgba(245, 158, 11, 0.25)'
                              : 'var(--border-default)'
                          }`,
                        }}
                      >
                        {t.priority || 'Medium'}
                      </span>
                    </td>

                    <td style={{ padding: '0.85rem 1rem' }}>
                      <MaintenanceStatusBadge status={t.status} size="sm" />
                    </td>

                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                        {t.vendor || t.serviceVendor || 'Internal IT'}
                      </div>
                      {(t.repairCost > 0 || t.cost > 0) && (
                        <div style={{ fontSize: '0.75rem', color: '#0d9488', fontWeight: 700 }}>
                          ₹{t.repairCost || t.cost}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '0.85rem 1.25rem 0.85rem 1rem', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                        {['Reported', 'Under Diagnosis', 'In Repair', 'Awaiting Vendor', 'Awaiting Parts', 'QC Pending'].includes(t.status) && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTicket(t);
                              setShowQCModal(true);
                            }}
                            className="btn btn-ghost btn-xs btn-icon"
                            style={{
                              backgroundColor: 'rgba(168, 85, 247, 0.12)',
                              color: '#a855f7',
                              border: '1px solid rgba(168, 85, 247, 0.25)',
                            }}
                            title="Perform QC Testing"
                          >
                            <ShieldCheck size={15} />
                          </button>
                        )}

                        {t.status === 'Ready' && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTicket(t);
                              setShowReturnModal(true);
                            }}
                            className="btn btn-ghost btn-xs btn-icon"
                            style={{
                              backgroundColor: 'rgba(13, 148, 136, 0.12)',
                              color: '#0d9488',
                              border: '1px solid rgba(13, 148, 136, 0.25)',
                            }}
                            title="Return to Custodian / Stock"
                          >
                            <ArrowLeftRight size={15} />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTicket(t);
                            setShowDetailsModal(true);
                          }}
                          className="btn btn-ghost btn-xs btn-icon"
                          style={{
                            backgroundColor: 'var(--bg-canvas)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-default)',
                          }}
                          title="View Details"
                        >
                          <Eye size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <MaintenanceForm
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadTickets();
          }}
        />
      )}

      {showDetailsModal && selectedTicket && (
        <MaintenanceDetailsModal
          isOpen={showDetailsModal}
          ticket={selectedTicket}
          onClose={() => setShowDetailsModal(false)}
          onUpdated={() => {
            setShowDetailsModal(false);
            loadTickets();
          }}
        />
      )}

      {showQCModal && selectedTicket && (
        <MaintenanceQCModal
          isOpen={showQCModal}
          ticket={selectedTicket}
          onClose={() => setShowQCModal(false)}
          onSuccess={() => {
            setShowQCModal(false);
            loadTickets();
          }}
        />
      )}

      {showReturnModal && selectedTicket && (
        <MaintenanceReturnModal
          isOpen={showReturnModal}
          ticket={selectedTicket}
          onClose={() => setShowReturnModal(false)}
          onSuccess={() => {
            setShowReturnModal(false);
            loadTickets();
          }}
        />
      )}
    </div>
  );
}
