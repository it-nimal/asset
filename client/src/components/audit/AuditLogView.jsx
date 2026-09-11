import React, { useState, useEffect } from 'react';
import {
  Activity,
  Search,
  Filter,
  Clock,
  ShieldCheck,
  UserCheck,
  ArrowRightLeft,
  Undo2,
  Wrench,
  PlusCircle,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../../services/api';

export default function AuditLogView({ logs: initialLogs = [] }) {
  const [logs, setLogs] = useState(initialLogs);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('All');

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await api.getAuditLogs({ limit: 100 });
        const list = Array.isArray(res) ? res : res?.data || [];
        setLogs(list);
      } catch (err) {
        console.warn('Failed to load audit logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const q = searchTerm.toLowerCase().trim();
    const actor = (log.user || log.actorName || '').toLowerCase();
    const action = (log.action || '').toLowerCase();
    const tag = (log.assetTag || '').toLowerCase();
    const details = (log.details || '').toLowerCase();

    const matchesSearch =
      !q ||
      action.includes(q) ||
      actor.includes(q) ||
      tag.includes(q) ||
      details.includes(q);

    const matchesAction =
      actionFilter === 'All' ||
      action.includes(actionFilter.toLowerCase());

    return matchesSearch && matchesAction;
  });

  const getActionBadge = (action = '') => {
    const act = action.toUpperCase();
    if (act.includes('ASSIGN')) return { bg: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', icon: UserCheck };
    if (act.includes('TRANSFER')) return { bg: 'rgba(168, 85, 247, 0.12)', color: '#c084fc', icon: ArrowRightLeft };
    if (act.includes('RETURN')) return { bg: 'rgba(16, 185, 129, 0.12)', color: '#34d399', icon: Undo2 };
    if (act.includes('CREATE') || act.includes('INWARD')) return { bg: 'rgba(99, 102, 241, 0.12)', color: '#818cf8', icon: PlusCircle };
    if (act.includes('MAINTENANCE')) return { bg: 'rgba(245, 158, 11, 0.12)', color: '#fbbf24', icon: Wrench };
    return { bg: 'rgba(148, 163, 184, 0.12)', color: '#94a3b8', icon: Clock };
  };

  return (
    <div style={{ padding: '1.5rem 2rem 4rem', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Enterprise System Audit Trail
        </h1>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          Cryptographically recorded, timestamped audit log of all hardware allocations, transfers, returns, and inventory modifications.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div
        className="card"
        style={{
          padding: '0.85rem 1.15rem',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.85rem',
        }}
      >
        <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
          <input
            type="text"
            placeholder="Search by action, user, or asset tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
            style={{ paddingLeft: '2rem', height: '34px', fontSize: '0.8rem' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>Filter Action:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="form-select"
            style={{ padding: '0.28rem 1.8rem 0.28rem 0.65rem', fontSize: '0.78rem', width: 'auto' }}
          >
            <option value="All">All Actions</option>
            <option value="Assign">Assignments</option>
            <option value="Transfer">Custody Transfers</option>
            <option value="Return">Returns</option>
            <option value="Create">Inwarded Assets</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Timeline Feed */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {loading ? (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading audit logs...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-faint)' }}>
              <div>{logs.length === 0 ? 'No audit records found in database.' : 'No audit logs match current filter criteria.'}</div>
              {(searchTerm || actionFilter !== 'All') && (
                <div style={{ marginTop: '0.85rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setActionFilter('All');
                    }}
                    className="btn btn-outline btn-xs"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          ) : (
            filteredLogs.map((log, idx) => {
              const badge = getActionBadge(log.action);
              const Icon = badge.icon;
              return (
                <div
                  key={log._id || idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                    gap: '1rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: badge.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px',
                      }}
                    >
                      <Icon size={16} color={badge.color} />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--text-primary)' }}>
                          {log.action}
                        </span>
                        {log.assetTag && (
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.72rem',
                              padding: '0.1rem 0.4rem',
                              borderRadius: 'var(--radius-xs)',
                              backgroundColor: 'rgba(99, 102, 241, 0.1)',
                              color: '#a5b4fc',
                              fontWeight: 700,
                            }}
                          >
                            {log.assetTag}
                          </span>
                        )}
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>by</span>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {log.user || log.actorName || 'System Admin'}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem', lineHeight: 1.4 }}>
                        {log.details}
                      </div>

                      {log.ipAddress && (
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)', marginTop: '0.35rem', fontFamily: 'var(--font-mono)' }}>
                          IP: {log.ipAddress}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-faint)', fontSize: '0.72rem' }}>
                    <Clock size={12} />
                    <span>{new Date(log.createdAt || log.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
