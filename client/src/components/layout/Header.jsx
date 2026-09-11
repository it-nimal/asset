import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  Bell,
  Plus,
  RefreshCw,
  Menu,
  X,
  User,
  Laptop,
  ArrowRight,
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
  assets = [],
  onSelectAsset,
  onNavigate,
}) {
  const { user } = useAuth();
  const toast = useToast();
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const notifMenuRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Search results computed for global quick dropdown
  const searchResults = useMemo(() => {
    const q = (globalSearch || '').trim().toLowerCase();
    if (!q) return [];
    const terms = q.split(/\s+/).filter(Boolean);
    return assets.filter((item) => {
      const text = [
        item.assetNo,
        item.sr,
        item.serialNo,
        item.serialNumber,
        item.deviceType,
        item.make,
        item.model,
        item.userName,
        item.empCode,
        item.department,
        item.plant,
        item.location,
        item.floorCabin,
        item.ipAddress,
        item.hostName,
        item.status,
        item.processor,
        item.ramSize,
        item.storage,
        item.billNo,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return terms.every((t) => text.includes(t));
    });
  }, [assets, globalSearch]);

  // Keyboard shortcut for search (/)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchFocused(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target)) {
        setNotifMenuOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchFocused(false);
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
      className="header-content"
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
        gap: '0.75rem',
      }}
    >
      {/* Left Area: Mobile Hamburger + Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
        {onToggleMobile && (
          <button
            type="button"
            onClick={onToggleMobile}
            className="btn btn-ghost btn-icon"
            style={{ display: 'none' }}
            id="mobile-nav-toggle"
            title="Toggle Menu"
          >
            <Menu size={20} />
          </button>
        )}

        <div className="header-breadcrumbs" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem' }}>
          <span style={{ color: 'var(--text-faint)', fontWeight: 500 }}>{section}</span>
          <span style={{ color: 'var(--border-strong)', fontSize: '0.75rem' }}>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{pageTitle}</span>
        </div>
      </div>

      {/* Global Search Bar with Live Quick-Search Results */}
      <div ref={searchContainerRef} className="header-search-container" style={{ position: 'relative', width: '340px', maxWidth: '40vw' }}>
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
          placeholder="Search tag, serial, user... (Press /)"
          value={globalSearch}
          onFocus={() => setSearchFocused(true)}
          onChange={(e) => {
            setGlobalSearch(e.target.value);
            setSearchFocused(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (onNavigate) onNavigate('assets-all');
              setSearchFocused(false);
            } else if (e.key === 'Escape') {
              setSearchFocused(false);
              searchInputRef.current?.blur();
            }
          }}
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
            onClick={() => {
              setGlobalSearch('');
              setSearchFocused(false);
            }}
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

        {/* Live Instant Search Dropdown */}
        {searchFocused && Boolean((globalSearch || '').trim()) && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '6px',
              backgroundColor: 'var(--bg-surface-raised)',
              border: '1px solid var(--border-focus)',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
              zIndex: 100,
              maxHeight: '380px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                padding: '0.55rem 0.85rem',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
              }}
            >
              <span>{searchResults.length} systems found</span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)' }}>Press Enter to view all</span>
            </div>

            {searchResults.length === 0 ? (
              <div style={{ padding: '1.25rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                No assets matching "<strong>{globalSearch}</strong>"
              </div>
            ) : (
              <div>
                {searchResults.slice(0, 6).map((item) => (
                  <div
                    key={item._id}
                    onClick={() => {
                      if (onSelectAsset) onSelectAsset(item);
                      setSearchFocused(false);
                    }}
                    style={{
                      padding: '0.6rem 0.85rem',
                      borderBottom: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.1)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'rgba(56, 189, 248, 0.12)',
                          color: '#38bdf8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Laptop size={14} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ fontFamily: 'monospace', color: '#38bdf8' }}>{item.assetNo || item.sr}</span>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.make} {item.model}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', gap: '0.45rem' }}>
                          <span>{item.userName || 'Unassigned'}</span>
                          <span>•</span>
                          <span>{item.department || 'General'}</span>
                        </div>
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.45rem',
                        borderRadius: 'var(--radius-xs)',
                        backgroundColor: item.status === 'Assigned' ? 'rgba(56, 189, 248, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                        color: item.status === 'Assigned' ? '#38bdf8' : '#34d399',
                        flexShrink: 0,
                      }}
                    >
                      {item.status || 'Available'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                if (onNavigate) onNavigate('assets-all');
                setSearchFocused(false);
              }}
              style={{
                padding: '0.6rem 0.85rem',
                border: 'none',
                background: 'rgba(99, 102, 241, 0.08)',
                color: '#818cf8',
                fontSize: '0.76rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <span>View all matching results in Hardware Inventory</span>
              <ArrowRight size={13} />
            </button>
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>
        {/* System Health Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: '0.72rem',
            fontWeight: 600,
            padding: '0.28rem 0.6rem',
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
          <span className="hide-on-mobile">{dbConnected ? 'Online' : 'Offline'}</span>
        </div>

        {/* Inward / New Asset CTA */}
        <button
          type="button"
          onClick={onOpenAddAsset}
          className="btn btn-primary btn-sm"
          style={{ height: '32px' }}
          title="Inward New Asset"
        >
          <Plus size={14} />
          <span className="hide-on-mobile">Inward Asset</span>
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