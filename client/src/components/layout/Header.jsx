import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Bell,
  Plus,
  RefreshCw,
  Menu,
  X,
  User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';

export default function Header({
  activePage = 'dashboard',
  globalSearch = '',
  setGlobalSearch,
  onRefresh,
  onOpenAddAsset,
  notifications = [],
  dbConnected = false,
  onToggleMobile,
}) {
  const { user } = useAuth();
  const toast = useToast();
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const searchInputRef = useRef(null);
  const notifMenuRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Keyboard shortcut for search (/)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close notifications menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target)) {
        setNotifMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleRefreshClick = async () => {
    setRefreshing(true);
    try {
      if (onRefresh) await onRefresh();
      toast.info('System data refreshed');
    } catch {
      toast.error('Failed to refresh data');
    } finally {
      setTimeout(() => setRefreshing(false), 400);
    }
  };

  // Dynamic breadcrumb generation
  const getBreadcrumbs = () => {
    const map = {
      dashboard: ['Overview', 'Dashboard'],
      'assets-all': ['Hardware', 'All Assets'],
      'assets-laptops': ['Hardware', 'Laptops'],
      'assets-desktops': ['Hardware', 'Desktops'],
      'assets-servers': ['Hardware', 'Servers'],
      'assets-monitors': ['Hardware', 'Monitors'],
      'assets-network': ['Hardware', 'Network Equipment'],
      'assets-printers': ['Hardware', 'Printers'],
      'assets-tablets': ['Hardware', 'Mobiles & Tablets'],
      'asset-add': ['Operations', 'Inward Asset'],
      'asset-assign': ['Operations', 'Asset Allocation'],
      'asset-transfer': ['Operations', 'Custody Transfer'],
      'asset-return': ['Operations', 'Return & Handover'],
      'asset-maintenance': ['Operations', 'Maintenance Tracker'],
      'asset-warranty': ['Operations', 'OEM Warranty Monitor'],
      'org-employees': ['Organization', 'Employees'],
      'org-departments': ['Organization', 'Departments'],
      'org-locations': ['Organization', 'Facilities & Plants'],
      'org-vendors': ['Organization', 'Vendors & Suppliers'],
      'software-inventory': ['Software', 'Applications Portfolio'],
      'software-licenses': ['Software', 'SAM Licenses'],
      'network-devices': ['Infrastructure', 'Network & Racks'],
      reports: ['Auditing', 'Compliance Reports'],
      'audit-logs': ['Auditing', 'System Audit Trail'],
    };
    return map[activePage] || ['System', 'Overview'];
  };

  const [section, pageTitle] = getBreadcrumbs();

  return (
    <header
      style={{
        height: '60px',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-default)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      {/* Left Area: Mobile Hamburger + Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {onToggleMobile && (
          <button
            type="button"
            onClick={onToggleMobile}
            className="btn btn-ghost btn-icon"
            style={{ display: 'none' }}
            id="mobile-nav-toggle"
            title="Toggle Menu"
          >
            <Menu size={19} />
          </button>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem' }}>
          <span style={{ color: 'var(--text-faint)', fontWeight: 500 }}>{section}</span>
          <span style={{ color: 'var(--border-strong)', fontSize: '0.75rem' }}>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{pageTitle}</span>
        </div>
      </div>

      {/* Global Search Bar */}
      <div style={{ position: 'relative', width: '320px', maxWidth: '38vw' }}>
        <Search
          size={14}
          style={{
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            pointerEvents: 'none',
          }}
        />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search serial, tag, user, IP..."
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
          className="form-control"
          style={{
            paddingLeft: '2rem',
            paddingRight: globalSearch ? '2.4rem' : '1.8rem',
            height: '34px',
            fontSize: '0.8rem',
          }}
        />
        {globalSearch ? (
          <button
            type="button"
            onClick={() => setGlobalSearch('')}
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
            }}
          >
            <X size={13} />
          </button>
        ) : (
          <span
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '0.62rem',
              color: 'var(--text-faint)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              padding: '0.1rem 0.35rem',
              borderRadius: 'var(--radius-xs)',
              pointerEvents: 'none',
              border: '1px solid var(--border-subtle)',
            }}
          >
            /
          </span>
        )}
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {/* System Health Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: '0.72rem',
            fontWeight: 600,
            padding: '0.28rem 0.65rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: dbConnected ? 'var(--status-available-bg)' : 'var(--status-maintenance-bg)',
            color: dbConnected ? 'var(--status-available-text)' : 'var(--status-maintenance-text)',
            border: `1px solid ${dbConnected ? 'var(--status-available-border)' : 'var(--status-maintenance-border)'}`,
          }}
          title={dbConnected ? 'MongoDB Connected & Ready' : 'Database Offline'}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: dbConnected ? '#10b981' : '#f59e0b',
            }}
            className={dbConnected ? 'pulse-dot' : ''}
          />
          <span>{dbConnected ? 'Online' : 'Offline'}</span>
        </div>

        {/* Inward / New Asset CTA */}
        <button
          type="button"
          onClick={onOpenAddAsset}
          className="btn btn-primary btn-sm"
          style={{ height: '32px' }}
        >
          <Plus size={14} />
          <span>Inward Asset</span>
        </button>

        {/* Refresh Data Button */}
        <button
          type="button"
          onClick={handleRefreshClick}
          className="btn btn-outline btn-icon"
          title="Refresh Data"
          style={{ height: '32px', width: '32px', padding: 0 }}
        >
          <RefreshCw
            size={14}
            style={{
              animation: refreshing ? 'spin 0.7s linear infinite' : 'none',
            }}
          />
        </button>

        {/* Notifications Popover */}
        <div style={{ position: 'relative' }} ref={notifMenuRef}>
          <button
            type="button"
            onClick={() => setNotifMenuOpen(!notifMenuOpen)}
            className="btn btn-outline btn-icon"
            style={{ height: '32px', width: '32px', padding: 0, position: 'relative' }}
            title="Notifications"
          >
            <Bell size={14} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '6px',
                  height: '6px',
                  backgroundColor: '#6366f1',
                  borderRadius: '50%',
                }}
              />
            )}
          </button>

          {notifMenuOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '38px',
                width: '320px',
                backgroundColor: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-xl)',
                overflow: 'hidden',
                zIndex: 60,
                animation: 'slideUp 0.15s ease-out',
              }}
            >
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderBottom: '1px solid var(--border-default)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>Notifications</span>
                <span className="badge badge-assigned">{unreadCount} New</span>
              </div>
              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    No unread notifications
                  </div>
                ) : (
                  notifications.map((n, i) => (
                    <div
                      key={n._id || i}
                      style={{
                        padding: '0.75rem 1rem',
                        borderBottom: '1px solid var(--border-subtle)',
                        fontSize: '0.78rem',
                      }}
                    >
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{n.title || n.subject}</div>
                      <div style={{ color: 'var(--text-muted)', marginTop: '2px', fontSize: '0.72rem' }}>{n.message}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Clean Admin Profile Badge (No dummy accounts) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.28rem 0.65rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-default)',
          }}
        >
          <div
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              fontSize: '0.68rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {(user?.name || 'A').charAt(0)}
          </div>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {user?.name || 'IT Administrator'}
          </span>
          <span
            style={{
              fontSize: '0.65rem',
              padding: '0.1rem 0.35rem',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--primary-light)',
              color: '#a5b4fc',
              fontWeight: 700,
            }}
          >
            {user?.role || 'IT Admin'}
          </span>
        </div>
      </div>
    </header>
  );
}