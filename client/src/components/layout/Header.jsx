import React, { useState } from 'react';
import {
  Search,
  Bell,
  Plus,
  RefreshCw,
  Sparkles,
  ChevronDown,
  Trash2,
  MoreHorizontal,
  CheckCircle2,
} from 'lucide-react';
import { useAuth, DEMO_ACCOUNTS } from '../../context/AuthContext';
import { api } from '../../services/api';

export default function Header({
  globalSearch,
  setGlobalSearch,
  onRefresh,
  onOpenAddAsset,
  notifications = [],
  dbConnected,
}) {
  const { user, switchDemoRole } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleSeedData = async () => {
    if (!window.confirm('Seed database with 50+ enterprise assets, 20 employees, 10 software products, and maintenance tickets?')) return;
    setSeeding(true);
    setActionsMenuOpen(false);
    try {
      await api.seedDemoData();
      alert('🎉 Enterprise ITAM demo data successfully seeded!');
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Seeding error: ' + err.message);
    } finally {
      setSeeding(false);
    }
  };

  const handleClearData = async () => {
    if (!window.confirm('Are you sure you want to remove all dummy and demo data? The database will be completely clean.')) return;
    setActionsMenuOpen(false);
    try {
      await api.clearAllData();
      alert('🧹 All dummy data has been removed!');
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Error clearing data: ' + err.message);
    }
  };

  return (
    <header
      style={{
        height: '60px',
        backgroundColor: '#090d16',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      {/* Sleek Search Bar */}
      <div style={{ position: 'relative', width: '340px' }}>
        <Search
          size={15}
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#64748b',
          }}
        />
        <input
          type="text"
          placeholder="Search Tag, Hostname, IP, User..."
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '0.45rem 2rem 0.45rem 2.2rem',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            color: '#f8fafc',
            fontSize: '0.825rem',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
          onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)')}
        />
        <span
          style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '0.65rem',
            color: '#64748b',
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            padding: '0.1rem 0.35rem',
            borderRadius: '4px',
            pointerEvents: 'none',
          }}
        >
          /
        </span>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        {/* Minimal Live Status Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: '0.75rem',
            fontWeight: 500,
            color: dbConnected ? '#34d399' : '#fbbf24',
            backgroundColor: dbConnected ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
            padding: '0.3rem 0.65rem',
            borderRadius: '6px',
            border: `1px solid ${dbConnected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`,
          }}
          title={dbConnected ? 'MongoDB Connected & Ready' : 'Database Offline'}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: dbConnected ? '#10b981' : '#f59e0b',
              boxShadow: dbConnected ? '0 0 6px rgba(16, 185, 129, 0.6)' : 'none',
            }}
          />
          <span>{dbConnected ? 'Online' : 'Offline'}</span>
        </div>

        {/* Inward Asset Action */}
        <button
          type="button"
          onClick={onOpenAddAsset}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            backgroundColor: '#4f46e5',
            color: '#ffffff',
            border: 'none',
            padding: '0.4rem 0.8rem',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          <Plus size={15} />
          <span>New Asset</span>
        </button>

        {/* Refresh Icon Button */}
        <button
          type="button"
          onClick={onRefresh}
          title="Refresh Data"
          style={{
            background: 'none',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            color: '#94a3b8',
            borderRadius: '6px',
            padding: '0.45rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <RefreshCw size={14} />
        </button>

        {/* Notifications Icon Button */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => {
              setNotifMenuOpen(!notifMenuOpen);
              setActionsMenuOpen(false);
              setRoleMenuOpen(false);
            }}
            title="Notifications"
            style={{
              position: 'relative',
              background: 'none',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              color: '#94a3b8',
              borderRadius: '6px',
              padding: '0.45rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bell size={14} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  width: '7px',
                  height: '7px',
                  backgroundColor: '#6366f1',
                  borderRadius: '50%',
                }}
              />
            )}
          </button>

          {/* Notifications Dropdown */}
          {notifMenuOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '38px',
                width: '320px',
                backgroundColor: '#0f172a',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
                zIndex: 60,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '0.65rem 0.9rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f8fafc' }}>Notifications</span>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{notifications.length} total</span>
              </div>
              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
                    All notifications cleared
                  </div>
                ) : (
                  notifications.map((n, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '0.65rem 0.9rem',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        fontSize: '0.78rem',
                        color: '#cbd5e1',
                      }}
                    >
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>{n.title}</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.74rem', marginTop: '2px' }}>{n.message}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Minimal Actions Menu (Seed / Clear Data) */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => {
              setActionsMenuOpen(!actionsMenuOpen);
              setNotifMenuOpen(false);
              setRoleMenuOpen(false);
            }}
            title="System & Database Actions"
            style={{
              background: 'none',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              color: '#94a3b8',
              borderRadius: '6px',
              padding: '0.45rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MoreHorizontal size={14} />
          </button>

          {actionsMenuOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '38px',
                width: '210px',
                backgroundColor: '#0f172a',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
                zIndex: 60,
                padding: '0.35rem',
              }}
            >
              <div style={{ padding: '0.4rem 0.6rem', fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                Database Actions
              </div>
              <button
                type="button"
                onClick={handleSeedData}
                disabled={seeding}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  width: '100%',
                  padding: '0.45rem 0.6rem',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '5px',
                  color: '#fde047',
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  cursor: seeding ? 'not-allowed' : 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(234, 179, 8, 0.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Sparkles size={13} />
                <span>{seeding ? 'Seeding...' : 'Seed Demo Data'}</span>
              </button>

              <button
                type="button"
                onClick={handleClearData}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  width: '100%',
                  padding: '0.45rem 0.6rem',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '5px',
                  color: '#f87171',
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Trash2 size={13} />
                <span>Clear All Data</span>
              </button>
            </div>
          )}
        </div>

        {/* Minimal User Profile / Role Switcher */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => {
              setRoleMenuOpen(!roleMenuOpen);
              setNotifMenuOpen(false);
              setActionsMenuOpen(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'none',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              padding: '0.3rem 0.6rem',
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#f8fafc',
            }}
          >
            <div
              style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                backgroundColor: '#4f46e5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                fontWeight: 700,
              }}
            >
              {user?.name?.charAt(0) || 'U'}
            </div>
            <span style={{ fontSize: '0.78rem', fontWeight: 500 }}>{user?.name || 'User'}</span>
            <ChevronDown size={12} color="#94a3b8" />
          </button>

          {roleMenuOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '38px',
                width: '240px',
                backgroundColor: '#0f172a',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
                padding: '0.5rem',
                zIndex: 60,
              }}
            >
              <div style={{ padding: '0.3rem 0.5rem 0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  Switch Role (RBAC)
                </div>
              </div>

              <div style={{ marginTop: '0.35rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                {DEMO_ACCOUNTS.map((acc) => {
                  const isCurrent = user?.role === acc.role;
                  return (
                    <button
                      key={acc.role}
                      type="button"
                      onClick={() => {
                        switchDemoRole(acc.role);
                        setRoleMenuOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.4rem 0.55rem',
                        borderRadius: '5px',
                        border: 'none',
                        backgroundColor: isCurrent ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                        color: isCurrent ? '#818cf8' : '#cbd5e1',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '0.75rem',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600 }}>{acc.role}</div>
                        <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{acc.name}</div>
                      </div>
                      {isCurrent && <CheckCircle2 size={13} color="#818cf8" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}