import React from 'react';
import {
  LayoutDashboard,
  Laptop,
  Monitor,
  Server,
  Printer,
  Radio,
  Tablet,
  FileCode,
  FolderTree,
  PlusCircle,
  UserCheck,
  ArrowRightLeft,
  Undo2,
  History,
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
  ChevronDown,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import logo from '../photos/VitromedLogo.png';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ activePage, setActivePage, stats, countsByCategory }) {
  const { user } = useAuth();

  const navSections = [
    {
      title: 'DASHBOARD',
      items: [
        { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard, badge: stats?.total },
      ],
    },
    {
      title: 'ASSETS BY CATEGORY',
      items: [
        { id: 'assets-all', label: 'All Assets', icon: FolderTree, count: stats?.total },
        { id: 'assets-laptops', label: 'Laptops', icon: Laptop, count: countsByCategory?.Laptop },
        { id: 'assets-desktops', label: 'Desktops & AIO', icon: Monitor, count: (countsByCategory?.Desktop || 0) + (countsByCategory?.['All in One Desktop'] || 0) },
        { id: 'assets-servers', label: 'Servers & HCI', icon: Server, count: countsByCategory?.Server },
        { id: 'assets-monitors', label: 'Monitors & Displays', icon: Monitor, count: countsByCategory?.Monitor },
        { id: 'assets-network', label: 'Network Hardware', icon: Radio, count: countsByCategory?.['Network Switch'] },
        { id: 'assets-printers', label: 'Printers & MFPs', icon: Printer, count: countsByCategory?.Printer },
        { id: 'assets-tablets', label: 'Mobile & Tablets', icon: Tablet, count: countsByCategory?.Tablet },
      ],
    },
    {
      title: 'ASSET LIFECYCLE',
      items: [
        { id: 'asset-add', label: 'Add New Asset (Inward)', icon: PlusCircle, isAction: true },
        { id: 'asset-assign', label: 'Assign Asset', icon: UserCheck },
        { id: 'asset-transfer', label: 'Transfer Asset', icon: ArrowRightLeft },
        { id: 'asset-return', label: 'Return Asset', icon: Undo2 },
        { id: 'asset-maintenance', label: 'Maintenance & Repairs', icon: Wrench, count: stats?.maintenance, badgeColor: '#fbbf24' },
        { id: 'asset-warranty', label: 'Warranty Tracker', icon: ShieldCheck, count: stats?.warrantyExpiringSoon, badgeColor: '#f87171' },
      ],
    },
    {
      title: 'ORGANIZATION & USERS',
      items: [
        { id: 'org-employees', label: 'Employees Directory', icon: Users },
        { id: 'org-departments', label: 'Departments', icon: Building2 },
        { id: 'org-locations', label: 'Locations & Plants', icon: MapPin },
        { id: 'org-vendors', label: 'Vendors & Suppliers', icon: Truck },
      ],
    },
    {
      title: 'SOFTWARE (SAM)',
      items: [
        { id: 'software-inventory', label: 'Software Inventory', icon: Layers },
        { id: 'software-licenses', label: 'Licenses & Expiry', icon: KeyRound },
      ],
    },
    {
      title: 'NETWORK INFRASTRUCTURE',
      items: [
        { id: 'network-devices', label: 'Switches, Routers & Firewalls', icon: Radio },
      ],
    },
    {
      title: 'ANALYTICS & AUDIT',
      items: [
        { id: 'reports', label: 'Compliance Reports (13)', icon: FileText },
        { id: 'audit-logs', label: 'Audit Trail & Activity', icon: Activity },
      ],
    },
  ];

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: '#090d16',
        borderRight: '1px solid rgba(255, 255, 255, 0.06)',
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
          padding: '1.1rem 1.25rem 0.9rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <img
          src={logo}
          alt="Vitromed Logo"
          style={{ height: '32px', width: 'auto', objectFit: 'contain' }}
        />
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>VITROMED</span>
            <span style={{ fontSize: '0.62rem', backgroundColor: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: 600 }}>ITAM</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Asset Management</div>
        </div>
      </div>

      {/* Nav Menu Items */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0.85rem 0.65rem',
          scrollbarWidth: 'thin',
        }}
      >
        {navSections.map((section, sIdx) => (
          <div key={sIdx} style={{ marginBottom: '1.25rem' }}>
            <div
              style={{
                fontSize: '0.65rem',
                fontWeight: 600,
                color: '#475569',
                letterSpacing: '0.06em',
                padding: '0 0.6rem 0.35rem',
                textTransform: 'uppercase',
              }}
            >
              {section.title}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActivePage(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '0.45rem 0.65rem',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: isActive
                        ? 'rgba(99, 102, 241, 0.14)'
                        : 'transparent',
                      color: isActive
                        ? '#818cf8'
                        : (item.isAction ? '#a5b4fc' : '#94a3b8'),
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: isActive ? 600 : 400,
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                      position: 'relative',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <Icon size={15} color={isActive ? '#818cf8' : (item.isAction ? '#a5b4fc' : '#64748b')} />
                      <span>{item.label}</span>
                    </div>

                    {typeof item.count === 'number' && item.count > 0 && (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          padding: '0.05rem 0.4rem',
                          borderRadius: '4px',
                          backgroundColor: item.badgeColor
                            ? `rgba(${item.badgeColor === '#fbbf24' ? '245, 158, 11' : '239, 68, 68'}, 0.12)`
                            : (isActive ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.05)'),
                          color: item.badgeColor || (isActive ? '#818cf8' : '#64748b'),
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

      {/* User Role Card at bottom */}
      <div
        style={{
          padding: '0.75rem 1rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          backgroundColor: '#090d16',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.75rem',
            }}
          >
            {user?.name ? user.name.charAt(0) : 'U'}
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
              {user?.name || 'User'}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
              {user?.role || 'Guest'}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}