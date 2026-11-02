import React, { useState, useEffect } from 'react';
import {
  Activity,
  X,
  Clock,
  Shield,
  Globe,
  Filter,
  Search,
  Laptop,
  CheckCircle2,
  Trash2,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../common/Toast';
import { formatDateTimeIST } from '../../utils/date';

export default function UserActivityModal({ user, onClose }) {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [activityData, setActivityData] = useState(null);
  const [actionFilter, setActionFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const loadActivity = async () => {
    setLoading(true);
    try {
      const res = await api.getUserActivity(user._id || user.id);
      if (res && res.data) {
        setActivityData(res.data);
      }
    } catch (err) {
      toast.error('Failed to load user activity history: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadActivity();
    }
  }, [user]);

  const recentLogs = activityData?.recentActivity || [];

  const filteredLogs = recentLogs.filter((log) => {
    const matchesAction = actionFilter === 'All' || log.action === actionFilter;
    const matchesSearch =
      !searchTerm ||
      log.module?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress?.includes(searchTerm);
    return matchesAction && matchesSearch;
  });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '920px', width: '95vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ padding: '0.45rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#0284c7' }}>
              <Activity size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Activity History: {user.name}
              </h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Role: <strong>{user.canonicalRole || user.role}</strong> • Email: {user.email}
              </div>
            </div>
          </div>
          <button type="button" className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              Querying enterprise audit records...
            </div>
          ) : (
            <div>
              {/* Summary Metrics Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '0.85rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div className="card" style={{ padding: '1rem', borderLeft: '4px solid #0284c7' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Total Operations
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.35rem' }}>
                    {activityData?.totalOperations || 0}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    Total audit log entries
                  </div>
                </div>

                <div className="card" style={{ padding: '1rem', borderLeft: '4px solid #10b981' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Total Logins
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.35rem' }}>
                    {activityData?.totalLogins || 0}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    Successful authentications
                  </div>
                </div>

                <div className="card" style={{ padding: '1rem', borderLeft: '4px solid #8b5cf6' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Last Login IP
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.35rem', fontFamily: 'monospace' }}>
                    {activityData?.lastLoginIp || 'Unknown'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    {activityData?.lastLoginDate ? formatDateTimeIST(activityData.lastLoginDate) : 'No login recorded'}
                  </div>
                </div>

                <div className="card" style={{ padding: '1rem', borderLeft: '4px solid #f59e0b' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Hardware Mutations
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.35rem' }}>
                    {(activityData?.assetsCreated || 0) + (activityData?.assetsUpdated || 0)}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    {activityData?.assetsCreated || 0} Created • {activityData?.assetsUpdated || 0} Updated
                  </div>
                </div>
              </div>

              {/* Filter controls */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  marginBottom: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '220px' }}>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <Search
                      size={15}
                      style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                    />
                    <input
                      type="text"
                      className="form-control"
                      style={{ paddingLeft: '2rem', fontSize: '0.8rem' }}
                      placeholder="Search activity description, IP, or module..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <select
                    className="form-control"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.65rem' }}
                    value={actionFilter}
                    onChange={(e) => setActionFilter(e.target.value)}
                  >
                    <option value="All">All Actions</option>
                    <option value="LOGIN">LOGIN</option>
                    <option value="LOGOUT">LOGOUT</option>
                    <option value="CREATE">CREATE</option>
                    <option value="UPDATE">UPDATE</option>
                    <option value="DELETE">DELETE</option>
                    <option value="ALLOCATE">ALLOCATE</option>
                    <option value="RETURN">RETURN</option>
                    <option value="PASSWORD_CHANGE">PASSWORD_CHANGE</option>
                    <option value="ROLE_CHANGE">ROLE_CHANGE</option>
                  </select>

                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={loadActivity}
                    title="Refresh"
                  >
                    <RefreshCw size={15} />
                  </button>
                </div>
              </div>

              {/* Activity Log Table */}
              {filteredLogs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No activity events match your filter criteria.
                </div>
              ) : (
                <div style={{ overflowX: 'auto', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
                  <table className="table" style={{ width: '100%', fontSize: '0.78rem' }}>
                    <thead style={{ backgroundColor: 'var(--bg-surface-raised)' }}>
                      <tr>
                        <th style={{ padding: '0.65rem 0.75rem' }}>Timestamp</th>
                        <th>Action</th>
                        <th>Module</th>
                        <th>Description</th>
                        <th>IP Address</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLogs.map((log, idx) => (
                        <tr key={log.auditId || log._id || idx}>
                          <td style={{ whiteSpace: 'nowrap', color: 'var(--text-muted)', padding: '0.65rem 0.75rem' }}>
                            {formatDateTimeIST(log.timestamp || log.createdAt)}
                          </td>
                          <td>
                            <span
                              style={{
                                fontWeight: 700,
                                fontSize: '0.68rem',
                                padding: '0.12rem 0.45rem',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor:
                                  log.action === 'CREATE'
                                    ? 'rgba(16, 185, 129, 0.15)'
                                    : log.action === 'UPDATE'
                                    ? 'rgba(2, 132, 199, 0.15)'
                                    : log.action === 'DELETE'
                                    ? 'rgba(239, 68, 68, 0.15)'
                                    : log.action === 'LOGIN'
                                    ? 'rgba(100, 116, 139, 0.15)'
                                    : 'rgba(168, 85, 247, 0.15)',
                                color:
                                  log.action === 'CREATE'
                                    ? '#10b981'
                                    : log.action === 'UPDATE'
                                    ? '#0284c7'
                                    : log.action === 'DELETE'
                                    ? '#ef4444'
                                    : log.action === 'LOGIN'
                                    ? '#94a3b8'
                                    : '#a855f7',
                              }}
                            >
                              {log.action}
                            </span>
                          </td>
                          <td style={{ fontWeight: 600 }}>{log.module}</td>
                          <td style={{ maxWidth: '320px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {log.description || log.details || 'Operation'}
                          </td>
                          <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                            {log.ipAddress || '127.0.0.1'}
                          </td>
                          <td>
                            <span
                              style={{
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                color: log.status === 'SUCCESS' ? '#10b981' : '#ef4444',
                              }}
                            >
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ borderTop: '1px solid var(--border-default)', padding: '0.85rem 1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
