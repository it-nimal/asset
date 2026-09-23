import React from 'react';
import {
  LayoutDashboard,
  Laptop,
  Monitor,
  Server,
  Printer,
  Radio,
  Tablet,
  FolderTree,
  PlusCircle,
  UserCheck,
  ArrowRightLeft,
  Undo2,
  Wrench,
  ShieldCheck,
  Users,
  Building2,
  MapPin,
  Truck,
  Layers,
  KeyRound,
  FileText,
  Activity,
  X,
  Sparkles,
  Boxes,
  Receipt,
  Settings,
  Upload,
} from 'lucide-react';
import logo from '../photos/VitromedLogo.png';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({
  activePage,
  setActivePage,
  stats,
  countsByCategory,
  employeesCount,
  onCloseMobile,
}) {
  const { user } = useAuth();

  const handleSelect = (id) => {
    setActivePage(id);
    if (onCloseMobile) onCloseMobile();
  };

  const navSections = [
    {
      title: 'User & Employee Workspaces',
      items: [
        { id: 'dashboard', label: 'User Operations Dashboard', icon: LayoutDashboard },
        { id: 'org-employees', label: 'All Users & Workstations', icon: Users, count: employeesCount || stats?.totalEmployees },
        { id: 'employee-self-service', label: 'My Assigned Assets (Staff)', icon: Laptop },
        { id: 'users-bulk', label: 'Bulk Import Users', icon: Upload },
        { id: 'asset-assign', label: 'Allocate Workstation Bundle', icon: UserCheck, isAction: true },
        { id: 'asset-transfer', label: 'User-to-User Transfer', icon: ArrowRightLeft },
        { id: 'asset-return', label: 'Offboarding & Return', icon: Undo2 },
        { id: 'org-departments', label: 'Department User Rosters', icon: Building2 },
        { id: 'org-locations', label: 'Plant & Site Workspaces', icon: MapPin },
      ],
    },
    {
      title: 'Hardware Depot & Stock',
      items: [
        { id: 'inventory-all', label: 'Central Inventory Depot', icon: Boxes, count: stats?.total },
        { id: 'assets-all', label: 'Hardware Master Fleet', icon: FolderTree, count: stats?.total },
        { id: 'assets-laptops', label: 'Laptops', icon: Laptop, count: countsByCategory?.Laptop },
        { id: 'assets-desktops', label: 'Desktops', icon: Monitor, count: (countsByCategory?.Desktop || 0) + (countsByCategory?.['All in One Desktop'] || 0) },
        { id: 'assets-servers', label: 'Servers', icon: Server, count: countsByCategory?.Server },
        { id: 'assets-monitors', label: 'Monitors', icon: Monitor, count: countsByCategory?.Monitor },
        { id: 'assets-network', label: 'Network', icon: Radio, count: countsByCategory?.['Network Switch'] },
        { id: 'assets-printers', label: 'Printers', icon: Printer, count: countsByCategory?.Printer },
        { id: 'assets-tablets', label: 'Mobiles / Tablets', icon: Tablet, count: countsByCategory?.Tablet },
        { id: 'asset-maintenance', label: 'Repairs & Maintenance', icon: Wrench, count: stats?.maintenance, badgeColor: '#fbbf24' },
        { id: 'asset-warranty', label: 'OEM Warranty Monitor', icon: ShieldCheck, count: stats?.warrantyExpiringSoon, badgeColor: '#f87171' },
      ],
    },
    {
      title: 'Procurement & Vendors',
      items: [
        { id: 'inward-register', label: 'Inward / Receiving Register', icon: Receipt },
        { id: 'org-vendors', label: 'Vendors & OEM Suppliers', icon: Truck },
      ],
    },
    {
      title: 'Software & Digital Licenses',
      items: [
        { id: 'software-inventory', label: 'Software Portfolio', icon: Layers },
        { id: 'software-licenses', label: 'SAM License Keys', icon: KeyRound },
      ],
    },
    {
      title: 'Compliance & Audit',
      items: [
        { id: 'reports', label: 'User Allocation Reports', icon: FileText },
        { id: 'audit-logs', label: 'Audit Trail & Custody Log', icon: Activity },
        { id: 'settings-master', label: 'System Master Settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-default)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        userSelect: 'none',
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '1.1rem 1.25rem',
          borderBottom: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-surface-raised)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img
            src={logo}
            alt="Vitromed Logo"
            style={{
              height: '32px',
              width: 'auto',
              objectFit: 'contain',
              filter: 'drop-shadow(0 2px 6px rgba(56,189,248,0.4))',
            }}
          />
          <div>
            
           
          </div>
        </div>

        {/* Mobile Close Button */}
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="btn btn-ghost btn-icon"
            style={{ display: 'inline-flex' }}
            title="Close Menu"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav Menu Scrollable Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0.85rem 0.65rem',
        }}
      >
        {navSections.map((section, sIdx) => (
          <div key={sIdx} style={{ marginBottom: '1.25rem' }}>
            <div
              style={{
                fontSize: '0.66rem',
                fontWeight: 700,
                color: 'var(--text-faint)',
                letterSpacing: '0.08em',
                padding: '0 0.65rem 0.4rem',
                textTransform: 'uppercase',
              }}
            >
              {section.title}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '0.48rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                      borderTop: 'none',
                      borderRight: 'none',
                      borderBottom: 'none',
                      backgroundColor: isActive
                        ? 'var(--primary-light)'
                        : 'transparent',
                      color: isActive
                        ? 'var(--primary)'
                        : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: isActive ? 600 : 500,
                      textAlign: 'left',
                      transition: 'all 0.12s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'var(--bg-surface-raised)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <Icon
                        size={15}
                        color={
                          isActive
                            ? 'var(--primary)'
                            : item.isAction
                            ? 'var(--primary)'
                            : 'var(--text-muted)'
                        }
                      />
                      <span>{item.label}</span>
                    </div>

                    {typeof item.count === 'number' && item.count > 0 && (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          padding: '0.08rem 0.42rem',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: isActive
                            ? 'var(--bg-surface)'
                            : 'var(--bg-surface-elevated)',
                          color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                          border: '1px solid var(--border-default)',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Profile Card */}
      <div
        style={{
          padding: '0.85rem 1rem',
          borderTop: '1px solid var(--border-default)',
          backgroundColor: 'var(--bg-surface-raised)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.65rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '0.78rem',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.name || 'Administrator'}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)' }}>
              {user?.role || 'IT Admin'}
            </div>
          </div>
        </div>

        <span
          style={{
            fontSize: '0.65rem',
            padding: '0.15rem 0.4rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            fontWeight: 700,
          }}
        >
          Active
        </span>
      </div>
    </aside>
  );
}