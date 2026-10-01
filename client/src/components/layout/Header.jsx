import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  Bell,
  Plus,
  RefreshCw,
  Menu,
  X,
  User,
  Users,
  IdCard,
  Laptop,
  ArrowRight,
  Palette,
  Check,
  LogOut,
  ShieldAlert,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import { countExpiringWarranties } from '../../utils/warrantyUtils';

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
  employees = [],
  onSelectAsset,
  onSelectEmployee,
  onNavigate,
}) {
  const { user, logout } = useAuth();
  const toast = useToast();
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchCategory, setSearchCategory] = useState('all'); // 'all' | 'users' | 'assets'

  // Theme Management (Defaults to White Enterprise Slate & Blue Theme)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('it_asset_theme') || 'light';
  });
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);

  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const notifMenuRef = useRef(null);
  const themeMenuRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('it_asset_theme', theme);
  }, [theme]);

  const themeOptions = [
    {
      id: 'light',
      name: 'Enterprise Slate & Blue',
      badge: 'Default',
      desc: 'Crisp White background, Slate 900 typography & Deep Blue actions',
      colors: ['#ffffff', '#0f172a', '#1d4ed8'],
    },
    {
      id: 'bw-sky',
      name: 'Dark Slate Enterprise',
      badge: 'Dark Mode',
      desc: 'Deep slate canvas, high-contrast typography & blue highlights',
      colors: ['#090d16', '#f8fafc', '#3b82f6'],
    },
    {
      id: 'midnight',
      name: 'Midnight Navy',
      badge: 'Navy Slate',
      desc: 'Deep navy background with crisp white typography',
      colors: ['#0f172a', '#334155', '#3b82f6'],
    },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;
  const warrantyAlerts = useMemo(() => countExpiringWarranties(assets), [assets]);
  const totalAlerts = unreadCount + warrantyAlerts.criticalTotal;

  // Search results computed for global quick dropdown: Users & Assets
  const matchedEmployees = useMemo(() => {
    const q = (globalSearch || '').trim().toLowerCase();
    if (!q) return [];
    const terms = q.split(/\s+/).filter(Boolean);
    return (employees || []).filter((emp) => {
      const text = [
        emp.name,
        emp.employeeId,
        emp.department,
        emp.designation,
        emp.email,
        emp.phone,
        emp.location,
        emp.status,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return terms.every((t) => text.includes(t));
    });
  }, [employees, globalSearch]);

  const matchedAssets = useMemo(() => {
    const q = (globalSearch || '').trim().toLowerCase();
    if (!q) return [];
    const terms = q.split(/\s+/).filter(Boolean);
    return (assets || []).filter((item) => {
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

  const getEmpAssetCount = (emp) => {
    if (!emp || !assets) return 0;
    const empName = (emp.name || '').trim().toLowerCase();
    const empId = (emp.employeeId || '').trim().toLowerCase();
    return assets.filter((a) => {
      const aUser = (a.userName || '').trim().toLowerCase();
      const aCode = (a.empCode || '').trim().toLowerCase();
      if (!aUser || aUser === 'unassigned') return false;
      if (empId && aCode && empId === aCode) return true;
      if (empName && aUser.includes(empName)) return true;
      return false;
    }).length;
  };


  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target)) {
        setNotifMenuOpen(false);
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target)) {
        setThemeMenuOpen(false);
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
      <div ref={searchContainerRef} className="header-search-container" style={{ position: 'relative', width: '380px', maxWidth: '42vw' }}>
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
          placeholder="Search staff, users, tags, serial, specs..."
          value={globalSearch}
          onFocus={() => setSearchFocused(true)}
          onChange={(e) => {
            setGlobalSearch(e.target.value);
            setSearchFocused(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (searchCategory === 'users' || (matchedEmployees.length > 0 && matchedAssets.length === 0)) {
                if (onNavigate) onNavigate('org-employees');
              } else {
                if (onNavigate) onNavigate('assets-all');
              }
              setSearchFocused(false);
            } else if (e.key === 'Escape') {
              setSearchFocused(false);
              searchInputRef.current?.blur();
            }
          }}
          className="form-control"
          style={{
            paddingLeft: '2rem',
            paddingRight: globalSearch ? '2.4rem' : '0.75rem',
            height: '34px',
            fontSize: '0.8rem',
          }}
        />
        {globalSearch && (
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
        )}

        {/* Live Instant Search Dropdown: Users & Assets */}
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
              maxHeight: '440px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Category Filter Tabs Header */}
            <div
              style={{
                padding: '0.45rem 0.65rem',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                gap: '0.4rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <button
                  type="button"
                  onClick={() => setSearchCategory('all')}
                  style={{
                    padding: '0.2rem 0.55rem',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '0.72rem',
                    fontWeight: searchCategory === 'all' ? 700 : 500,
                    border: 'none',
                    backgroundColor: searchCategory === 'all' ? 'var(--primary-light)' : 'transparent',
                    color: searchCategory === 'all' ? 'var(--primary)' : 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  All ({matchedEmployees.length + matchedAssets.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSearchCategory('users')}
                  style={{
                    padding: '0.2rem 0.55rem',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '0.72rem',
                    fontWeight: searchCategory === 'users' ? 700 : 500,
                    border: 'none',
                    backgroundColor: searchCategory === 'users' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                    color: searchCategory === 'users' ? '#38bdf8' : 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <Users size={12} />
                  <span>Users ({matchedEmployees.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSearchCategory('assets')}
                  style={{
                    padding: '0.2rem 0.55rem',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '0.72rem',
                    fontWeight: searchCategory === 'assets' ? 700 : 500,
                    border: 'none',
                    backgroundColor: searchCategory === 'assets' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                    color: searchCategory === 'assets' ? '#818cf8' : 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <Laptop size={12} />
                  <span>Hardware ({matchedAssets.length})</span>
                </button>
              </div>

              <span style={{ fontSize: '0.66rem', color: 'var(--text-faint)' }}>Press ↵ Enter</span>
            </div>

            {matchedEmployees.length === 0 && matchedAssets.length === 0 ? (
              <div style={{ padding: '1.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                No users or assets matching "<strong>{globalSearch}</strong>"
              </div>
            ) : (
              <div>
                {/* 1. USERS / EMPLOYEES SECTION */}
                {(searchCategory === 'all' || searchCategory === 'users') && matchedEmployees.length > 0 && (
                  <div>
                    <div
                      style={{
                        padding: '0.4rem 0.85rem',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        color: '#38bdf8',
                        backgroundColor: 'rgba(56, 189, 248, 0.06)',
                        borderBottom: '1px solid var(--border-subtle)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Users size={12} />
                        <span>Workforce Employees ({matchedEmployees.length})</span>
                      </div>
                      <span style={{ fontSize: '0.64rem', color: 'var(--text-faint)' }}>Click to inspect user</span>
                    </div>

                    {(searchCategory === 'users' ? matchedEmployees.slice(0, 8) : matchedEmployees.slice(0, 4)).map((emp) => {
                      const empAssetCount = getEmpAssetCount(emp);
                      return (
                        <div
                          key={emp._id || emp.employeeId || emp.name}
                          onClick={() => {
                            if (onSelectEmployee) onSelectEmployee(emp);
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
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.1)')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
                            <div
                              style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: '0.78rem',
                                flexShrink: 0,
                              }}
                            >
                              {(emp.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {emp.name}
                                </span>
                                {emp.employeeId && (
                                  <span
                                    style={{
                                      fontFamily: 'monospace',
                                      fontSize: '0.7rem',
                                      color: '#38bdf8',
                                      backgroundColor: 'rgba(56, 189, 248, 0.12)',
                                      padding: '0.05rem 0.35rem',
                                      borderRadius: '3px',
                                    }}
                                  >
                                    {emp.employeeId}
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', gap: '0.45rem', marginTop: '1px' }}>
                                <span>{emp.designation || 'Staff'}</span>
                                <span>•</span>
                                <span>{emp.department || 'General'}</span>
                                {emp.location && (
                                  <>
                                    <span>•</span>
                                    <span>{emp.location}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>
                            <span
                              style={{
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                padding: '0.15rem 0.45rem',
                                borderRadius: 'var(--radius-xs)',
                                backgroundColor: empAssetCount > 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                                color: empAssetCount > 0 ? '#34d399' : '#fbbf24',
                              }}
                            >
                              {empAssetCount > 0 ? `${empAssetCount} Assets` : 'No Assets'}
                            </span>
                            <span
                              style={{
                                fontSize: '0.7rem',
                                color: '#38bdf8',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '2px',
                              }}
                            >
                              Inspect →
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 2. HARDWARE ASSETS SECTION */}
                {(searchCategory === 'all' || searchCategory === 'assets') && matchedAssets.length > 0 && (
                  <div>
                    <div
                      style={{
                        padding: '0.4rem 0.85rem',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        color: '#818cf8',
                        backgroundColor: 'rgba(99, 102, 241, 0.06)',
                        borderBottom: '1px solid var(--border-subtle)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Laptop size={12} />
                        <span>Hardware Assets & Machines ({matchedAssets.length})</span>
                      </div>
                      <span style={{ fontSize: '0.64rem', color: 'var(--text-faint)' }}>Click to inspect asset</span>
                    </div>

                    {(searchCategory === 'assets' ? matchedAssets.slice(0, 8) : matchedAssets.slice(0, 4)).map((item) => (
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
                              backgroundColor: 'rgba(99, 102, 241, 0.12)',
                              color: '#818cf8',
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
              </div>
            )}

            {/* Quick Navigation Footer Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--border-subtle)' }}>
              {matchedEmployees.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigate) onNavigate('org-employees');
                    setSearchFocused(false);
                  }}
                  style={{
                    padding: '0.5rem 0.85rem',
                    border: 'none',
                    background: 'rgba(56, 189, 248, 0.06)',
                    color: '#38bdf8',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    borderBottom: matchedAssets.length > 0 ? '1px solid var(--border-subtle)' : 'none',
                  }}
                >
                  <span>View all {matchedEmployees.length} matching staff in Employees Directory</span>
                  <ArrowRight size={13} />
                </button>
              )}

              {matchedAssets.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigate) onNavigate('assets-all');
                    setSearchFocused(false);
                  }}
                  style={{
                    padding: '0.5rem 0.85rem',
                    border: 'none',
                    background: 'rgba(99, 102, 241, 0.06)',
                    color: '#818cf8',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                  }}
                >
                  <span>View all {matchedAssets.length} matching items in Hardware Inventory</span>
                  <ArrowRight size={13} />
                </button>
              )}
            </div>
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

        {/* Theme Switcher Popover */}
        <div style={{ position: 'relative' }} ref={themeMenuRef}>
          <button
            type="button"
            onClick={() => setThemeMenuOpen(!themeMenuOpen)}
            className="btn btn-outline"
            style={{
              height: '32px',
              padding: '0 0.65rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.76rem',
              fontWeight: 600,
              borderColor: themeMenuOpen ? 'var(--primary)' : 'var(--border-default)',
              backgroundColor: themeMenuOpen ? 'var(--bg-surface-raised)' : 'transparent',
            }}
            title="Switch UI Color Theme"
          >
            <Palette size={14} style={{ color: 'var(--primary)' }} />
            <span className="hide-on-mobile">Theme</span>
          </button>

          {themeMenuOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '38px',
                width: '300px',
                backgroundColor: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-xl)',
                overflow: 'hidden',
                zIndex: 70,
                animation: 'slideUp 0.15s ease-out',
              }}
            >
              <div
                style={{
                  padding: '0.75rem 0.95rem',
                  borderBottom: '1px solid var(--border-default)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: 'var(--bg-surface)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Palette size={14} style={{ color: 'var(--primary)' }} />
                  <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)' }}>Color Theme</span>
                </div>
                <span
                  style={{
                    fontSize: '0.68rem',
                    padding: '0.15rem 0.45rem',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)',
                    fontWeight: 700,
                  }}
                >
                  {theme === 'light' || theme === 'wb-sky' ? 'White & Black' : theme === 'bw-sky' ? 'Dark Mode' : 'Midnight'}
                </span>
              </div>

              <div style={{ padding: '0.5rem' }}>
                {themeOptions.map((opt) => {
                  const isSelected = theme === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setTheme(opt.id);
                        toast.success(`Theme switched to ${opt.name}`);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.65rem 0.75rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: isSelected ? 'var(--primary-light)' : 'transparent',
                        border: isSelected ? '1px solid var(--border-focus)' : '1px solid transparent',
                        cursor: 'pointer',
                        marginBottom: '0.35rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                          <div
                            style={{
                              display: 'flex',
                              borderRadius: '3px',
                              overflow: 'hidden',
                              border: '1px solid rgba(128, 128, 128, 0.4)',
                            }}
                          >
                            {opt.colors.map((c, i) => (
                              <span key={i} style={{ width: '9px', height: '14px', backgroundColor: c }} />
                            ))}
                          </div>
                          <span
                            style={{
                              fontSize: '0.8rem',
                              fontWeight: isSelected ? 700 : 600,
                              color: 'var(--text-primary)',
                            }}
                          >
                            {opt.name}
                          </span>
                        </div>
                        {isSelected && <Check size={14} style={{ color: 'var(--primary)' }} />}
                      </div>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)', paddingLeft: '2rem' }}>
                        {opt.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div style={{ position: 'relative' }} ref={notifMenuRef}>
          <button
            type="button"
            onClick={() => setNotifMenuOpen(!notifMenuOpen)}
            className="btn btn-outline btn-icon"
            style={{ height: '32px', width: '32px', padding: 0, position: 'relative' }}
            title="Notifications & Alerts"
          >
            <Bell size={14} />
            {totalAlerts > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  minWidth: '14px',
                  height: '14px',
                  backgroundColor: warrantyAlerts.criticalTotal > 0 ? '#ef4444' : '#38bdf8',
                  borderRadius: '9999px',
                  color: '#ffffff',
                  fontSize: '0.6rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 2px',
                }}
              >
                {totalAlerts > 9 ? '9+' : totalAlerts}
              </span>
            )}
          </button>

          {notifMenuOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '38px',
                width: '330px',
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
                <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>Notifications & Alerts</span>
                <span className="badge badge-assigned">{totalAlerts} New</span>
              </div>

              {/* Warranty & AMC Expiry Quick Alerts */}
              {warrantyAlerts.criticalTotal > 0 && (
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: 'rgba(239, 68, 68, 0.06)',
                    borderBottom: '1px solid rgba(239, 68, 68, 0.15)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ef4444', fontWeight: 700, fontSize: '0.76rem' }}>
                    <ShieldAlert size={14} />
                    <span>Warranty & AMC Expiration Alert</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.4 }}>
                    {warrantyAlerts.expired > 0 && <div>• <strong>{warrantyAlerts.expired}</strong> asset(s) with expired warranty/AMC</div>}
                    {warrantyAlerts.urgent > 0 && <div>• <strong>{warrantyAlerts.urgent}</strong> asset(s) expiring within 30 days</div>}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setNotifMenuOpen(false);
                      if (onNavigate) onNavigate('asset-warranty');
                    }}
                    style={{
                      marginTop: '0.4rem',
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: 0,
                      textDecoration: 'underline',
                    }}
                  >
                    Open Warranty Register →
                  </button>
                </div>
              )}

              <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                {notifications.length === 0 && warrantyAlerts.criticalTotal === 0 ? (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    No unread notifications or alerts
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

        {/* Sign Out Action Button */}
        <button
          type="button"
          onClick={() => {
            logout();
            toast.info('You have been signed out', 'Session Ended');
          }}
          className="btn btn-outline btn-xs"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            color: '#ef4444',
            borderColor: 'rgba(239, 68, 68, 0.25)',
            backgroundColor: 'rgba(239, 68, 68, 0.04)',
            padding: '0.3rem 0.6rem',
            fontSize: '0.72rem',
            fontWeight: 600,
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
          }}
          title="Sign Out of Session"
        >
          <LogOut size={13} />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
}