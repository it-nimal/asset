import React, { useState, useEffect } from 'react';
import { Activity, Search, Filter, Clock, ShieldCheck, UserCheck, ArrowRightLeft, Undo2, Wrench, PlusCircle, AlertTriangle } from 'lucide-react';
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
        if (res.success && res.data) {
          setLogs(res.data);
        }
      } catch (err) {
        console.warn('Failed to load audit logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      !searchTerm ||
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.assetTag?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction =
      actionFilter === 'All' ||
      log.action?.toLowerCase().includes(actionFilter.toLowerCase());

    return matchesSearch && matchesAction;
  });

  const getActionBadge = (action = '') => {
    const act = action.toUpperCase();
    if (act.includes('ASSIGN')) return { bg: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee', icon: UserCheck };
    if (act.includes('TRANSFER')) return { bg: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', icon: ArrowRightLeft };
    if (act.includes('RETURN')) return { bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399', icon: Undo2 };
    if (act.includes('CREATE') || act.includes('INWARD')) return { bg: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', icon: PlusCircle };
    if (act.includes('MAINTENANCE')) return { bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', icon: Wrench };
    return { bg: 'rgba(100, 116, 139, 0.15)', color: '#94a3b8', icon: Clock };
  };

  return (
    <div style={{ padding: '1.75rem 2rem 4rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#818cf8', letterSpacing: '0.05em' }}>
            AUDIT TRAIL & SYSTEM INTEGRITY (SECTION 21)
          </span>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginTop: '0.2rem' }}>
            IT Asset Activity Log
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            Immutable, timestamped audit trail of all asset assignments, transfers, returns, maintenance, and status changes.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          backgroundColor: '#131d36',
          padding: '1rem 1.25rem',
          borderRadius: '12px',
          border: '1px solid #1e293b',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '240px' }}>
          <Search size={16} color="#64748b" />
          <input
            type="text"
            placeholder="Search by action, user, asset tag, or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: '#0b1329',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '0.5rem 0.85rem',
              color: '#ffffff',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={15} color="#64748b" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            style={{
              backgroundColor: '#0b1329',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '0.5rem 0.85rem',
              color: '#cbd5e1',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          >
            <option value="All">All Actions</option>
            <option value="ASSIGN">Assignment</option>
            <option value="TRANSFER">Transfer</option>
            <option value="RETURN">Return</option>
            <option value="CREATE">Create / Inward</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="STATUS">Status Change</option>
          </select>
        </div>
      </div>

      {/* Activity Timeline List */}
      <div style={{ backgroundColor: '#131d36', borderRadius: '14px', border: '1px solid #1e293b', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading activity logs...</div>
        ) : filteredLogs.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>No audit records found matching criteria.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredLogs.map((log, idx) => {
              const badge = getActionBadge(log.action);
              const Icon = badge.icon;
              return (
                <div
                  key={log._id || idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.25rem',
                    padding: '1rem 1.5rem',
                    borderBottom: idx < filteredLogs.length - 1 ? '1px solid #1e293b' : 'none',
                    backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.015)',
                  }}
                >
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      backgroundColor: badge.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={18} color={badge.color} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: badge.bg,
                          color: badge.color,
                          padding: '0.2rem 0.55rem',
                          borderRadius: '6px',
                          textTransform: 'uppercase',
                        }}
                      >
                        {log.action}
                      </span>
                      {log.assetTag && (
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#818cf8' }}>
                          Tag: {log.assetTag}
                        </span>
                      )}
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        by <strong style={{ color: '#cbd5e1' }}>{log.actorName || 'System Admin'}</strong>
                      </span>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: '#e2e8f0', marginTop: '0.25rem' }}>
                      {log.details || log.message || 'Action executed successfully.'}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0, fontSize: '0.75rem', color: '#64748b' }}>
                    <div>{log.createdAt ? new Date(log.createdAt).toLocaleDateString() : 'Recent'}</div>
                    <div>{log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
