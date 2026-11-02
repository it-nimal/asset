import React, { useState, useEffect } from 'react';
import {
  Activity,
  Search,
  Filter,
  Clock,
  ShieldCheck,
  Shield,
  UserCheck,
  UserX,
  ArrowRightLeft,
  Undo2,
  Wrench,
  PlusCircle,
  AlertTriangle,
  X,
  Download,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  Globe,
  SlidersHorizontal,
  FileSpreadsheet,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import { formatDateTimeIST } from '../../utils/date';

export default function AuditLogView() {
  const { user, isSuperAdmin, isUserOnly, canViewAuditLogs, canExportAuditLogs } = useAuth();
  const toast = useToast();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [livePolling, setLivePolling] = useState(false);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [actionFilter, setActionFilter] = useState('All');
  const [moduleFilter, setModuleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest'

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Detailed modal view
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const params = {
        page,
        limit,
        sort: sortOrder,
      };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (roleFilter !== 'All') params.role = roleFilter;
      if (actionFilter !== 'All') params.action = actionFilter;
      if (moduleFilter !== 'All') params.module = moduleFilter;
      if (statusFilter !== 'All') params.status = statusFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.getAuditLogs(params);
      const list = res?.data || (Array.isArray(res) ? res : []);
      setLogs(list);

      if (res?.pagination) {
        setTotalPages(res.pagination.totalPages || 1);
        setTotalCount(res.pagination.total || list.length);
      } else {
        setTotalPages(1);
        setTotalCount(list.length);
      }
    } catch (err) {
      if (!isBackground) {
        console.warn('Failed to load audit logs:', err);
        toast.error(err.message || 'Failed to load audit logs');
      }
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, limit, sortOrder, roleFilter, actionFilter, moduleFilter, statusFilter]);

  // Live stream polling interval
  useEffect(() => {
    if (!livePolling) return;
    const interval = setInterval(() => {
      fetchLogs(true);
    }, 7000);
    return () => clearInterval(interval);
  }, [livePolling, page, limit, sortOrder, roleFilter, actionFilter, moduleFilter, statusFilter, searchTerm, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setRoleFilter('All');
    setActionFilter('All');
    setModuleFilter('All');
    setStatusFilter('All');
    setStartDate('');
    setEndDate('');
    setSortOrder('newest');
    setPage(1);
  };

  const handleExportCSV = async () => {
    if (!canExportAuditLogs && !isSuperAdmin) {
      return toast.error('Permission Denied: Only Super Administrators can export the audit trail.');
    }

    setExporting(true);
    try {
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (roleFilter !== 'All') params.role = roleFilter;
      if (actionFilter !== 'All') params.action = actionFilter;
      if (moduleFilter !== 'All') params.module = moduleFilter;
      if (statusFilter !== 'All') params.status = statusFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      params.sort = sortOrder;

      await api.exportAuditLogsCsv(params);
      toast.success('Audit trail successfully exported to CSV!');
    } catch (err) {
      toast.error(err.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  // Permission check: unauthorized users
  if (!canViewAuditLogs && !isUserOnly) {
    return (
      <div style={{ maxWidth: '800px', margin: '4rem auto', padding: '2rem', textAlign: 'center' }}>
        <div className="card" style={{ padding: '3rem 2rem' }}>
          <Shield size={48} style={{ color: '#ef4444', margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Access Restricted (403 Forbidden)
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '460px', margin: '0 auto' }}>
            You do not have permission to view enterprise audit trail records.
          </p>
        </div>
      </div>
    );
  }

  // Module 7 Action Badges
  // CREATE: Green | UPDATE: Blue | DELETE: Red | LOGIN: Slate | FAILED_LOGIN: Orange | ROLE_CHANGE: Purple | PERMISSION_CHANGE: Indigo
  const getActionBadge = (action = '') => {
    const act = action.toUpperCase();
    if (act === 'CREATE' || act.includes('INWARD') || act.includes('ADD')) {
      return { bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981', icon: PlusCircle, label: action };
    }
    if (act === 'UPDATE' || act.includes('EDIT') || act.includes('ALLOCATE') || act.includes('ASSIGN') || act.includes('RETURN')) {
      return { bg: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', icon: ArrowRightLeft, label: action };
    }
    if (act === 'DELETE' || act.includes('REMOVE') || act.includes('RETIRE')) {
      return { bg: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', icon: AlertTriangle, label: action };
    }
    if (act === 'FAILED_LOGIN' || act.includes('DENIED') || act.includes('BLOCKED') || act.includes('UNAUTHORIZED')) {
      return { bg: 'rgba(249, 115, 22, 0.12)', color: '#f97316', icon: AlertTriangle, label: action };
    }
    if (act === 'ROLE_CHANGE') {
      return { bg: 'rgba(168, 85, 247, 0.12)', color: '#a855f7', icon: Shield, label: action };
    }
    if (act === 'PERMISSION_CHANGE') {
      return { bg: 'rgba(99, 102, 241, 0.12)', color: '#6366f1', icon: ShieldCheck, label: action };
    }
    if (act === 'PASSWORD_CHANGE' || act === 'PASSWORD_RESET') {
      return { bg: 'rgba(20, 184, 166, 0.12)', color: '#14b8a6', icon: ShieldCheck, label: action };
    }
    if (act === 'LOGIN' || act === 'LOGOUT') {
      return { bg: 'rgba(100, 116, 139, 0.12)', color: '#94a3b8', icon: ShieldCheck, label: action };
    }
    if (act === 'DATA_EXPORT') {
      return { bg: 'rgba(5, 150, 105, 0.12)', color: '#059669', icon: Download, label: action };
    }
    return { bg: 'rgba(148, 163, 184, 0.12)', color: '#94a3b8', icon: Clock, label: action };
  };

  return (
    <div style={{ padding: '1.5rem 2rem 4rem', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Top Header */}
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
          <h1
            style={{
              fontSize: '1.45rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
            }}
          >
            <Activity size={24} style={{ color: '#38bdf8' }} />
            Enterprise System Audit Trail
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Append-only, cryptographically tracked log of all hardware allocations, user permissions, transfers, returns, and inventory modifications.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setLivePolling((p) => !p)}
            className="btn btn-secondary btn-sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: livePolling ? 'rgba(16, 185, 129, 0.12)' : undefined,
              color: livePolling ? '#10b981' : undefined,
              borderColor: livePolling ? 'rgba(16, 185, 129, 0.4)' : undefined,
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: livePolling ? '#10b981' : '#94a3b8',
                display: 'inline-block',
              }}
            />
            <span>{livePolling ? 'Live Stream: Active' : 'Live Stream: Paused'}</span>
          </button>

          <button
            type="button"
            onClick={() => fetchLogs()}
            disabled={loading}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>

          {isSuperAdmin && (
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={exporting || logs.length === 0}
              className="btn btn-primary btn-sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                border: 'none',
              }}
            >
              <Download size={14} className={exporting ? 'spin' : ''} />
              <span>{exporting ? 'Exporting...' : 'Export Audit Trail (CSV)'}</span>
            </button>
          )}
        </div>
      </div>

      {isUserOnly && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            marginBottom: '1.25rem',
            borderRadius: '8px',
            backgroundColor: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            color: 'var(--text-secondary)',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
          }}
        >
          <ShieldCheck size={18} color="#38bdf8" />
          <span>
            <strong>Personal Activity Stream:</strong> You are viewing your own security events, logins, and asset custody transactions. Full enterprise logs across all users are restricted to Administrators.
          </span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Recorded Events</div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
            {totalCount}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: '0.2rem' }}>
            Immutable append-only entries
          </div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '3px solid #10b981' }}>
          <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>Timezone Standard</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.45rem' }}>
            Asia/Kolkata (IST)
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Server UTC synchronized to IST
          </div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '3px solid #38bdf8' }}>
          <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600 }}>Integrity Status</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle size={18} color="#38bdf8" />
            Append-Only
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Deletions & overwrites blocked
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
        }}
      >
        {/* Row 1: Search & Quick Submit */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search
              size={14}
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
              placeholder="Search by username, record ID / asset tag, details, or IP address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem 0.5rem 2.1rem',
                backgroundColor: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-default)',
                borderRadius: '6px',
                fontSize: '0.82rem',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-sm">
            Search
          </button>
          <button type="button" onClick={handleResetFilters} className="btn btn-secondary btn-sm">
            Reset
          </button>
        </form>

        {/* Row 2: Structured Filters */}
        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center', fontSize: '0.78rem' }}>
          {/* Module Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Module:</span>
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              style={{
                padding: '0.35rem 0.65rem',
                backgroundColor: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-default)',
                borderRadius: '6px',
                fontSize: '0.78rem',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            >
              <option value="All">All Modules</option>
              <option value="Assets">Assets</option>
              <option value="Allocation">Allocation</option>
              <option value="Employees">Employees</option>
              <option value="Inward">Inward</option>
              <option value="Transfers">Transfers</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Software">Software</option>
              <option value="Users">Users</option>
              <option value="Auth">Auth & Security</option>
              <option value="Settings">Settings</option>
            </select>
          </div>

          {/* Role Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                padding: '0.35rem 0.65rem',
                backgroundColor: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-default)',
                borderRadius: '6px',
                fontSize: '0.78rem',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            >
              <option value="All">All Roles</option>
              <option value="Super Admin">Super Admin</option>
              <option value="Admin">Admin</option>
              <option value="User">User</option>
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '0.35rem 0.65rem',
                backgroundColor: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-default)',
                borderRadius: '6px',
                fontSize: '0.78rem',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            >
              <option value="All">All Statuses</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>

          {/* Date Range: From */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                padding: '0.35rem 0.5rem',
                backgroundColor: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-default)',
                borderRadius: '6px',
                fontSize: '0.78rem',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
          </div>

          {/* Date Range: To */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                padding: '0.35rem 0.5rem',
                backgroundColor: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-default)',
                borderRadius: '6px',
                fontSize: '0.78rem',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
          </div>

          {/* Sort Order */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginLeft: 'auto' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Sort:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              style={{
                padding: '0.35rem 0.65rem',
                backgroundColor: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-default)',
                borderRadius: '6px',
                fontSize: '0.78rem',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid var(--border-default)',
                  backgroundColor: 'var(--bg-surface-raised)',
                  color: 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                <th style={{ padding: '0.85rem 1rem' }}>Timestamp (IST)</th>
                <th style={{ padding: '0.85rem 1rem' }}>Actor & Role</th>
                <th style={{ padding: '0.85rem 1rem' }}>Action & Module</th>
                <th style={{ padding: '0.85rem 1rem' }}>Target Record</th>
                <th style={{ padding: '0.85rem 1rem' }}>Event Details</th>
                <th style={{ padding: '0.85rem 1rem' }}>Client IP</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Diff</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <RefreshCw size={24} className="spin" style={{ margin: '0 auto 0.5rem' }} />
                    <div>Loading audit trail entries...</div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Activity size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                    <div style={{ fontWeight: 600 }}>No audit log records found matching query.</div>
                  </td>
                </tr>
              ) : (
                logs.map((log, idx) => {
                  const badge = getActionBadge(log.action);
                  const Icon = badge.icon;
                  const isSuccess = log.status !== 'FAILED';
                  const hasDiff = Boolean(log.oldValues || log.newValues);

                  return (
                    <tr
                      key={log._id || idx}
                      style={{
                        borderBottom: '1px solid var(--border-default)',
                        backgroundColor: !isSuccess ? 'rgba(239, 68, 68, 0.05)' : undefined,
                      }}
                    >
                      {/* Timestamp (IST) */}
                      <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                        {formatDateTimeIST(log.timestamp || log.createdAt)}
                      </td>

                      {/* Actor & Role */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          {log.username || log.user || 'System'}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {log.role || 'Admin'}
                        </div>
                      </td>

                      {/* Action & Module */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            backgroundColor: badge.bg,
                            color: badge.color,
                            fontSize: '0.72rem',
                            fontWeight: 700,
                          }}
                        >
                          <Icon size={12} />
                          {log.action}
                        </span>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          Module: {log.module || 'Assets'}
                        </div>
                      </td>

                      {/* Target Record */}
                      <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                        {log.recordIdentifier || log.assetTag || '-'}
                      </td>

                      {/* Event Details */}
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)', maxWidth: '280px' }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.details}>
                          {log.details || '-'}
                        </div>
                      </td>

                      {/* Client IP */}
                      <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-faint)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Globe size={11} />
                          {log.ipAddress || '127.0.0.1'}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                        {isSuccess ? (
                          <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.7rem' }}>SUCCESS</span>
                        ) : (
                          <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.7rem' }}>FAILED</span>
                        )}
                      </td>

                      {/* Action / Diff Details button */}
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedLog(log)}
                          title="View Audit Record Details & Field Diff"
                          style={{
                            padding: '0.35rem 0.55rem',
                            borderRadius: '5px',
                            border: '1px solid var(--border-default)',
                            backgroundColor: hasDiff ? 'rgba(56, 189, 248, 0.1)' : 'var(--bg-surface-raised)',
                            color: hasDiff ? '#38bdf8' : 'var(--text-muted)',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontSize: '0.75rem',
                          }}
                        >
                          <Eye size={12} />
                          <span>View</span>
                        </button>
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
            backgroundColor: 'var(--bg-surface-raised)',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Showing Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalCount} total events)
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="btn btn-secondary btn-xs"
              style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}
            >
              <ChevronLeft size={13} />
              <span>Previous</span>
            </button>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="btn btn-secondary btn-xs"
              style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}
            >
              <span>Next</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* DETAILED AUDIT EVENT MODAL */}
      {selectedLog && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '1.75rem',
              position: 'relative',
            }}
          >
            <button
              type="button"
              onClick={() => setSelectedLog(null)}
              style={{
                position: 'absolute',
                right: '1.25rem',
                top: '1.25rem',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.55rem',
                  borderRadius: '4px',
                  backgroundColor: selectedLog.status === 'FAILED' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  color: selectedLog.status === 'FAILED' ? '#ef4444' : '#10b981',
                }}
              >
                {selectedLog.status || 'SUCCESS'}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Module: {selectedLog.module || 'Assets'}
              </span>
            </div>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              {selectedLog.action}
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              {selectedLog.details || 'No additional event details.'}
            </p>

            {/* Metadata Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.85rem',
                backgroundColor: 'var(--bg-surface-raised)',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                fontSize: '0.78rem',
              }}
            >
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Audit ID</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {selectedLog.auditId || selectedLog._id}
                </span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Correlation ID</span>
                <span style={{ fontWeight: 700, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                  {selectedLog.correlationId || 'corr-direct'}
                </span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Event Timestamp (IST)</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {formatDateTimeIST(selectedLog.timestamp || selectedLog.createdAt)}
                </span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Origin Client IP</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {selectedLog.ipAddress || '127.0.0.1'}
                </span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Authenticated Actor</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  {selectedLog.username || selectedLog.user || 'System'} ({selectedLog.role || 'Admin'})
                </span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>API Endpoint & Method</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
                  {selectedLog.httpMethod ? `${selectedLog.httpMethod} ` : ''}{selectedLog.apiEndpoint || '/api/operations'}
                </span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Target Record Identifier</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {selectedLog.recordIdentifier || selectedLog.assetTag || selectedLog.recordId || 'N/A'}
                </span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Browser / User Agent</span>
                <span
                  style={{ fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.7rem', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  title={selectedLog.userAgent}
                >
                  {selectedLog.userAgent || 'Mozilla/5.0 Direct API Client'}
                </span>
              </div>
            </div>

            {/* Field-by-Field Diff Comparison */}
            <div>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
                Field-Level State Comparison (Diff)
              </h3>

              {Array.isArray(selectedLog.changedFields) && selectedLog.changedFields.length > 0 ? (
                <div style={{ border: '1px solid var(--border-default)', borderRadius: '6px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--bg-surface-raised)', borderBottom: '1px solid var(--border-default)' }}>
                        <th style={{ padding: '0.5rem 0.75rem', width: '30%', color: 'var(--text-muted)' }}>Field</th>
                        <th style={{ padding: '0.5rem 0.75rem', width: '35%', color: '#ef4444' }}>Previous Value</th>
                        <th style={{ padding: '0.5rem 0.75rem', width: '35%', color: '#10b981' }}>Updated Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedLog.changedFields.map((cf, cIdx) => (
                        <tr key={cIdx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '0.5rem 0.75rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                            {cf.field}
                          </td>
                          <td style={{ padding: '0.5rem 0.75rem', color: '#f87171', backgroundColor: 'rgba(239, 68, 68, 0.04)' }}>
                            {cf.oldValue === null || cf.oldValue === undefined ? <span style={{ color: 'var(--text-faint)', fontStyle: 'italic' }}>null</span> : String(cf.oldValue)}
                          </td>
                          <td style={{ padding: '0.5rem 0.75rem', color: '#34d399', backgroundColor: 'rgba(16, 185, 129, 0.04)' }}>
                            {cf.newValue === null || cf.newValue === undefined ? <span style={{ color: 'var(--text-faint)', fontStyle: 'italic' }}>null</span> : String(cf.newValue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : selectedLog.oldValues || selectedLog.newValues ? (
                <div style={{ border: '1px solid var(--border-default)', borderRadius: '6px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--bg-surface-raised)', borderBottom: '1px solid var(--border-default)' }}>
                        <th style={{ padding: '0.5rem 0.75rem', width: '30%', color: 'var(--text-muted)' }}>Field</th>
                        <th style={{ padding: '0.5rem 0.75rem', width: '35%', color: '#ef4444' }}>Previous Value</th>
                        <th style={{ padding: '0.5rem 0.75rem', width: '35%', color: '#10b981' }}>Updated Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from(
                        new Set([
                          ...Object.keys(selectedLog.oldValues || {}),
                          ...Object.keys(selectedLog.newValues || {}),
                        ])
                      ).map((fieldKey) => {
                        const oldVal = selectedLog.oldValues?.[fieldKey];
                        const newVal = selectedLog.newValues?.[fieldKey];

                        const formatVal = (val) => {
                          if (val === undefined || val === null) return <span style={{ color: 'var(--text-faint)', fontStyle: 'italic' }}>null</span>;
                          if (typeof val === 'object') return JSON.stringify(val);
                          return String(val);
                        };

                        return (
                          <tr key={fieldKey} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <td style={{ padding: '0.5rem 0.75rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                              {fieldKey}
                            </td>
                            <td style={{ padding: '0.5rem 0.75rem', color: '#f87171', backgroundColor: 'rgba(239, 68, 68, 0.04)' }}>
                              {formatVal(oldVal)}
                            </td>
                            <td style={{ padding: '0.5rem 0.75rem', color: '#34d399', backgroundColor: 'rgba(16, 185, 129, 0.04)' }}>
                              {formatVal(newVal)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-raised)', borderRadius: '6px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  No field delta recorded for this event type.
                </div>
              )}
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="btn btn-secondary btn-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
