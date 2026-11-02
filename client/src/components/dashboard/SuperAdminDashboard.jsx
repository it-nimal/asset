import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Activity,
  Users,
  KeyRound,
  Settings,
  Database,
  Lock,
  Globe,
  RefreshCw,
  SlidersHorizontal,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  Server,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import { formatDateTimeIST } from '../../utils/date';

export default function SuperAdminDashboard({ stats, onNavigate }) {
  const { user } = useAuth();
  const toast = useToast();

  const [usersList, setUsersList] = useState([]);
  const [recentAuditLogs, setRecentAuditLogs] = useState([]);
  const [failedLoginCount, setFailedLoginCount] = useState(0);
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadSuperAdminData = async () => {
    setLoading(true);
    try {
      const [usersRes, logsRes, failedRes, healthRes] = await Promise.allSettled([
        api.getUsers(),
        api.getAuditLogs({ limit: 12, sort: 'newest' }),
        api.getAuditLogs({ action: 'FAILED_LOGIN', limit: 1 }),
        api.getHealth(),
      ]);

      if (usersRes.status === 'fulfilled') {
        const list = usersRes.value?.data || usersRes.value || [];
        setUsersList(Array.isArray(list) ? list : []);
      }

      if (logsRes.status === 'fulfilled') {
        const list = logsRes.value?.data || logsRes.value || [];
        setRecentAuditLogs(Array.isArray(list) ? list : []);
      }

      if (failedRes.status === 'fulfilled') {
        const totalFailed = failedRes.value?.pagination?.total || (Array.isArray(failedRes.value?.data) ? failedRes.value.data.length : 0);
        setFailedLoginCount(totalFailed);
      }

      if (healthRes.status === 'fulfilled') {
        setSystemHealth(healthRes.value);
      }
    } catch (err) {
      console.warn('Super Admin Dashboard sync error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuperAdminData();
  }, []);

  // Live real-time polling (every 8 seconds when autoRefresh is enabled)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(async () => {
      try {
        const res = await api.getAuditLogs({ limit: 12, sort: 'newest' });
        const list = res?.data || (Array.isArray(res) ? res : []);
        setRecentAuditLogs(list);
      } catch {}
    }, 8000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const superAdminCount = usersList.filter((u) => (u.canonicalRole || u.role) === 'Super Admin').length;
  const adminCount = usersList.filter((u) => (u.canonicalRole || u.role) === 'Admin').length;
  const standardUserCount = usersList.filter((u) => (u.canonicalRole || u.role) === 'User').length;
  const activeUserCount = usersList.filter((u) => u.active !== false).length;

  return (
    <div className="page-container" style={{ maxWidth: '1440px', margin: '0 auto', paddingBottom: '4rem' }}>
      {/* Executive Command Header */}
      <div
        className="card"
        style={{
          padding: '1.75rem 2rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
          borderColor: 'rgba(168, 85, 247, 0.3)',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.35)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(147, 51, 234, 0.4)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <ShieldCheck size={32} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em', margin: 0 }}>
                  Super Admin Governance Center
                </h1>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.65rem',
                    borderRadius: '9999px',
                    background: 'rgba(168, 85, 247, 0.2)',
                    color: '#c084fc',
                    border: '1px solid rgba(168, 85, 247, 0.4)',
                  }}
                >
                  Full System Ownership
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: '0.35rem 0 0' }}>
                Signed in as <strong>{user?.name}</strong> • Real-time audit surveillance, security events & RBAC permission controls.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`btn btn-sm ${autoRefresh ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setAutoRefresh(!autoRefresh)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: autoRefresh ? '#22c55e' : '#94a3b8',
                  boxShadow: autoRefresh ? '0 0 8px #22c55e' : 'none',
                }}
              />
              {autoRefresh ? 'Live Stream Active (8s)' : 'Live Stream Paused'}
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={loadSuperAdminData}
              style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Security & System Health KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #a855f7' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Total Users & Roles
            </span>
            <Users size={18} color="#a855f7" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.4rem' }}>
            {usersList.length}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            {superAdminCount} Super Admin • {adminCount} Admin • {standardUserCount} User
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Active Accounts
            </span>
            <CheckCircle2 size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.4rem' }}>
            {activeUserCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            {usersList.length - activeUserCount} Deactivated account{usersList.length - activeUserCount !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Security Audit Events
            </span>
            <ShieldAlert size={18} color="#ef4444" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.4rem' }}>
            {failedLoginCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Failed login attempt{failedLoginCount !== 1 ? 's' : ''} recorded
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #0284c7' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Database Connectivity
            </span>
            <Database size={18} color="#0284c7" />
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981', marginTop: '0.6rem' }}>
            {systemHealth?.database?.connected ? 'Online & Persistent' : 'Connected'}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Uptime: {systemHealth?.uptime ? `${Math.round(systemHealth.uptime / 60)} min` : 'Healthy'}
          </div>
        </div>
      </div>

      {/* Quick Governance Navigation Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div
          className="card hover-card"
          style={{ padding: '1.25rem', cursor: 'pointer', border: '1px solid var(--border-default)' }}
          onClick={() => onNavigate('user-management')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
                <Users size={18} />
              </div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>User & Access Control</h3>
            </div>
            <ArrowRight size={16} color="var(--text-muted)" />
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
            Create and edit accounts across all 3 roles, set individual permission overrides, activate/deactivate accounts.
          </p>
        </div>

        <div
          className="card hover-card"
          style={{ padding: '1.25rem', cursor: 'pointer', border: '1px solid var(--border-default)' }}
          onClick={() => onNavigate('audit-logs')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                <Activity size={18} />
              </div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Full Audit Surveillance</h3>
            </div>
            <ArrowRight size={16} color="var(--text-muted)" />
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
            Inspect complete enterprise audit log, filter by actor IP, verify before/after values, and export compliance CSVs.
          </p>
        </div>

        <div
          className="card hover-card"
          style={{ padding: '1.25rem', cursor: 'pointer', border: '1px solid var(--border-default)' }}
          onClick={() => onNavigate('settings-master')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(234, 88, 12, 0.15)', color: '#ea580c' }}>
                <Settings size={18} />
              </div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>System Master Settings</h3>
            </div>
            <ArrowRight size={16} color="var(--text-muted)" />
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
            Configure plants, corporate departments, asset lifecycle statuses, and database seeding procedures.
          </p>
        </div>
      </div>

      {/* Real-Time Live Audit Activity Ticker Table */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Real-Time Audit Trail Stream
              </h2>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '0.12rem 0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                }}
              >
                LIVE
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
              Automatic append-only event stream capturing actor IP, timestamp, role, and before/after mutations.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => onNavigate('audit-logs')}
            style={{ fontSize: '0.78rem' }}
          >
            Open Full Audit Trail →
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', fontSize: '0.8rem' }}>
            <thead>
              <tr>
                <th>Audit ID / Time</th>
                <th>User / Actor</th>
                <th>Role</th>
                <th>Action</th>
                <th>Module</th>
                <th>IP Address</th>
                <th>Description</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentAuditLogs.map((log, idx) => (
                <tr key={log.auditId || log._id || idx}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <div style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.72rem', color: 'var(--text-primary)' }}>
                      {log.auditId || `AUD-${log._id?.slice(-8)}`}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {formatDateTimeIST(log.timestamp || log.createdAt)}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {log.userFullName || log.username || log.user}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {log.username || log.user}
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '0.12rem 0.45rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor:
                          (log.userRole || log.role) === 'Super Admin'
                            ? 'rgba(168, 85, 247, 0.15)'
                            : (log.userRole || log.role) === 'Admin'
                            ? 'rgba(56, 189, 248, 0.15)'
                            : 'rgba(100, 116, 139, 0.15)',
                        color:
                          (log.userRole || log.role) === 'Super Admin'
                            ? '#a855f7'
                            : (log.userRole || log.role) === 'Admin'
                            ? '#38bdf8'
                            : '#94a3b8',
                      }}
                    >
                      {log.userRole || log.role || 'User'}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        padding: '0.15rem 0.5rem',
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
                            : log.action === 'FAILED_LOGIN'
                            ? 'rgba(249, 115, 22, 0.15)'
                            : log.action === 'ROLE_CHANGE' || log.action === 'PERMISSION_CHANGE'
                            ? 'rgba(168, 85, 247, 0.15)'
                            : 'rgba(14, 165, 233, 0.15)',
                        color:
                          log.action === 'CREATE'
                            ? '#10b981'
                            : log.action === 'UPDATE'
                            ? '#0284c7'
                            : log.action === 'DELETE'
                            ? '#ef4444'
                            : log.action === 'LOGIN'
                            ? '#94a3b8'
                            : log.action === 'FAILED_LOGIN'
                            ? '#f97316'
                            : log.action === 'ROLE_CHANGE' || log.action === 'PERMISSION_CHANGE'
                            ? '#a855f7'
                            : '#0ea5e9',
                      }}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{log.module}</td>
                  <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                    {log.ipAddress || '127.0.0.1'}
                  </td>
                  <td style={{ maxWidth: '320px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {log.description || log.details || 'System event'}
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '0.12rem 0.45rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: log.status === 'SUCCESS' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
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
      </div>
    </div>
  );
}
