import React, { useState, useMemo } from 'react';
import {
  Boxes,
  UserCheck,
  CheckCircle2,
  Wrench,
  Archive,
  AlertOctagon,
  ShieldAlert,
  KeyRound,
  ArrowUpRight,
  Clock,
  Layers,
  MapPin,
  Building2,
  AlertTriangle,
  Plus,
  FileText,
  Activity,
  Users,
  Search,
  X,
  IdCard,
  Laptop,
  Monitor,
  Printer as PrintIcon,
  Headphones,
  Keyboard,
  ShieldCheck,
  ChevronRight,
  Filter,
  ExternalLink,
  Zap,
  HardDrive,
  UserPlus,
  Upload,
} from 'lucide-react';
import AssetTable from '../assets/AssetTable';
import { getEmployeeAssets } from '../organization/OrganizationView';
import EmployeeProfileModal from '../organization/EmployeeProfileModal';
import BulkAddEmployeesModal from '../organization/BulkAddEmployeesModal';

export default function Dashboard({
  stats,
  assets = [],
  employees = [],
  globalSearch = '',
  onNavigate,
  onViewDetails,
  onAssign,
  onTransfer,
  onReturn,
  onMaintenanceReturn,
  onMaintenance,
  onEdit,
  onRetire,
  onDelete,
}) {
  const [empSearchQuery, setEmpSearchQuery] = useState('');
  const [ledgerMode, setLedgerMode] = useState('users'); // 'users' or 'assets'
  const [deptFilter, setDeptFilter] = useState('All');
  const [allocationFilter, setAllocationFilter] = useState('All'); // 'All', 'equipped', 'pending'
  const [selectedEmployeeForModal, setSelectedEmployeeForModal] = useState(null);
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);

  // User-focused calculations
  const equippedEmployees = useMemo(() => {
    return employees.filter((emp) => getEmployeeAssets(emp, assets).length > 0);
  }, [employees, assets]);

  const pendingEmployees = useMemo(() => {
    return employees.filter((emp) => getEmployeeAssets(emp, assets).length === 0);
  }, [employees, assets]);

  const cards = [
    {
      title: 'Total Workforce Staff',
      value: employees.length || 0,
      subtext: 'Registered employees',
      icon: Users,
      color: '#1d4ed8',
      bgGlow: '#eff6ff',
      target: 'org-employees',
    },
    {
      title: 'Equipped Workstations',
      value: equippedEmployees.length,
      subtext: `${employees.length ? Math.round((equippedEmployees.length / employees.length) * 100) : 0}% workforce equipped`,
      icon: UserCheck,
      color: '#16a34a',
      bgGlow: '#f0fdf4',
      target: 'org-employees',
    },
    {
      title: 'Pending IT Allocation',
      value: pendingEmployees.length,
      subtext: 'Awaiting workstation setup',
      icon: AlertOctagon,
      color: '#d97706',
      bgGlow: '#fffbeb',
      target: 'asset-assign',
    },
    {
      title: 'User PCs in Active Use',
      value: stats?.assigned || 0,
      subtext: 'Hardware in employee custody',
      icon: Laptop,
      color: '#2563eb',
      bgGlow: '#eff6ff',
      target: 'assets-all',
    },
    {
      title: 'Depot Available Stock',
      value: stats?.available || 0,
      subtext: 'Ready for user allocation',
      icon: CheckCircle2,
      color: '#0d9488',
      bgGlow: '#f0fdfa',
      target: 'inventory-all',
    },
    {
      title: 'Under Maintenance',
      value: stats?.maintenance || 0,
      subtext: 'In service centers',
      icon: Wrench,
      color: '#6b7280',
      bgGlow: '#f3f4f6',
      target: 'asset-maintenance',
    },
    {
      title: 'Warranties Expiring (30d)',
      value: stats?.warrantyExpiringSoon || 0,
      subtext: 'Requires AMC review',
      icon: ShieldAlert,
      color: '#ea580c',
      bgGlow: '#fff7ed',
      target: 'asset-warranty',
    },
    {
      title: 'Software SAM Expiring',
      value: stats?.licensesExpiringSoon || 0,
      subtext: 'License seats renewal',
      icon: KeyRound,
      color: '#d97706',
      bgGlow: '#fffbeb',
      target: 'software-licenses',
    },
  ];

  const categoryData = stats?.categoryBreakdown || [];
  const deptData = stats?.departmentBreakdown || [];
  const locData = stats?.locationBreakdown || [];
  const recentActs = stats?.recentActivities || [];

  const uniqueDepartments = useMemo(() => {
    const set = new Set();
    employees.forEach((e) => {
      if (e.department) set.add(e.department);
    });
    return Array.from(set).sort();
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (deptFilter !== 'All' && emp.department !== deptFilter) return false;

      const empAssets = getEmployeeAssets(emp, assets);
      const isEquipped = empAssets.length > 0;

      if (allocationFilter === 'equipped' && !isEquipped) return false;
      if (allocationFilter === 'pending' && isEquipped) return false;

      const q = (empSearchQuery || globalSearch || '').trim().toLowerCase();
      if (!q) return true;

      const nameMatch = (emp.name || '').toLowerCase().includes(q);
      const idMatch = (emp.employeeId || '').toLowerCase().includes(q);
      const emailMatch = (emp.email || '').toLowerCase().includes(q);
      const deptMatch = (emp.department || '').toLowerCase().includes(q);
      const plantMatch = (emp.location || '').toLowerCase().includes(q);
      const assetMatch = empAssets.some(
        (a) =>
          (a.assetNo || '').toLowerCase().includes(q) ||
          (a.sr || '').toLowerCase().includes(q) ||
          (a.make || '').toLowerCase().includes(q) ||
          (a.model || '').toLowerCase().includes(q) ||
          (a.deviceType || '').toLowerCase().includes(q)
      );

      return nameMatch || idMatch || emailMatch || deptMatch || plantMatch || assetMatch;
    });
  }, [employees, assets, deptFilter, allocationFilter, empSearchQuery, globalSearch]);

  return (
    <div className="page-container">
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.75rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Corporate User Workstations & IT Operations
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Workforce IT allocation, workstation bundles, warranty health, and custody tracking across corporate plants.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button
            type="button"
            onClick={() => onNavigate('asset-assign')}
            className="btn btn-outline btn-sm"
          >
            <UserCheck size={14} />
            <span>Allocate Bundle</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('asset-add')}
            className="btn btn-primary btn-sm"
          >
            <Plus size={14} />
            <span>Inward Asset</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              onClick={() => onNavigate(c.target)}
              className="card card-hoverable"
              style={{
                padding: '1.15rem',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Subtle top edge accent */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  backgroundColor: c.color,
                  opacity: 0.7,
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {c.title}
                </span>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: c.bgGlow,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={16} color={c.color} />
                </div>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <span
                    style={{
                      fontSize: '1.75rem',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      fontVariantNumeric: 'tabular-nums',
                      lineHeight: 1,
                    }}
                  >
                    {c.value}
                  </span>
                  <ArrowUpRight size={14} color="var(--text-faint)" />
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: '0.35rem' }}>
                  {c.subtext}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Attention / Expiring Warranties Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(239, 68, 68, 0.08) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          borderRadius: 'var(--radius-lg)',
          padding: '0.85rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              padding: '0.35rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(245, 158, 11, 0.2)',
              display: 'flex',
            }}
          >
            <AlertTriangle size={17} color="#fbbf24" />
          </div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
            <strong style={{ color: '#fbbf24', fontWeight: 700 }}>Maintenance & Warranty Alert:</strong> 3 hardware warranties and 2 software licenses approach expiration within 30 days.
          </span>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('asset-warranty')}
          className="btn btn-outline btn-xs"
          style={{ borderColor: 'rgba(245, 158, 11, 0.3)', color: '#fbbf24' }}
        >
          View Warranty Monitor →
        </button>
      </div>

      {/* USER-FOCUSED: EMPLOYEE CUSTODY & HARDWARE ALLOCATION HUB */}
      {employees && employees.length > 0 && (
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', border: '1px solid var(--border-default)' }}>
          {/* Hub Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.85rem',
              marginBottom: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(56, 189, 248, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38bdf8',
                }}
              >
                <Users size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Employee Custody & User Hardware Hub
                </h3>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  Live allocation tracking across {employees.length} corporate employees and their issued bundles.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              {/* Quick Employee Search */}
              <div style={{ position: 'relative', width: '240px' }}>
                <Search
                  size={13}
                  style={{
                    position: 'absolute',
                    left: '9px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-faint)',
                  }}
                />
                <input
                  type="text"
                  placeholder="Search staff or tag..."
                  value={empSearchQuery}
                  onChange={(e) => setEmpSearchQuery(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '28px', paddingRight: empSearchQuery ? '26px' : '8px', height: '32px', fontSize: '0.78rem' }}
                />
                {empSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setEmpSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: '6px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-faint)',
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '4px',
                    }}
                    title="Clear search"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => onNavigate('org-employees')}
                className="btn btn-outline btn-xs"
              >
                <Users size={12} />
                <span>Employee Directory ({employees.length}) →</span>
              </button>
            </div>
          </div>

          {/* Quick Roster Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '0.75rem',
            }}
          >
            {employees
              .filter((e) => {
                if (!empSearchQuery.trim()) return true;
                const q = empSearchQuery.toLowerCase();
                const empAssets = getEmployeeAssets(e, assets);
                return (
                  (e.name || '').toLowerCase().includes(q) ||
                  (e.employeeId || '').toLowerCase().includes(q) ||
                  (e.department || '').toLowerCase().includes(q) ||
                  empAssets.some((a) => (a.assetNo || '').toLowerCase().includes(q) || (a.sr || '').toLowerCase().includes(q))
                );
              })
              .slice(0, 6)
              .map((emp) => {
                const empAssets = getEmployeeAssets(emp, assets);
                const hasAssets = empAssets.length > 0;

                return (
                  <div
                    key={emp._id || emp.id || emp.name}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-surface-raised)',
                      border: '1px solid var(--border-default)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {emp.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>
                          {emp.employeeId || 'No ID'} • {emp.department || 'General'}
                        </div>
                      </div>

                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '0.12rem 0.45rem',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: hasAssets ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                          color: hasAssets ? '#34d399' : '#fbbf24',
                        }}
                      >
                        {hasAssets ? `${empAssets.length} Allocated` : '0 Assets'}
                      </span>
                    </div>

                    {/* Assigned Assets summary */}f
                    {hasAssets ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {empAssets.slice(0, 2).map((a, aIdx) => (
                          <span
                            key={aIdx}
                            style={{
                              fontSize: '0.7rem',
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 600,
                              color: '#38bdf8',
                              backgroundColor: 'rgba(56, 189, 248, 0.08)',
                              padding: '0.1rem 0.4rem',
                              borderRadius: 'var(--radius-xs)',
                              border: '1px solid rgba(56, 189, 248, 0.2)',
                            }}
                          >
                            #{a.assetNo || 'AST'} ({a.deviceType || a.make})
                          </span>
                        ))}
                        {empAssets.length > 2 && (
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)' }}>
                            +{empAssets.length - 2} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', fontStyle: 'italic' }}>
                        Ready for hardware allocation
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.25rem' }}>
                      <button
                        type="button"
                        onClick={() => onNavigate('org-employees')}
                        className="btn btn-ghost btn-xs"
                        style={{ fontSize: '0.7rem', color: '#38bdf8', padding: '0 0.35rem', height: '20px' }}
                      >
                        Manage User Fleet →
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Distribution Grids */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: '1.25rem',
          marginBottom: '1.5rem',
        }}
      >
        {/* Category Breakdown */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Layers size={16} color="#38bdf8" />
            <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>Hardware by Category</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {categoryData.length === 0 ? (
              <div style={{ color: 'var(--text-faint)', fontSize: '0.8rem', padding: '1rem 0' }}>No categories registered</div>
            ) : (
              categoryData.map((item, idx) => {
                const maxCount = Math.max(...categoryData.map((c) => c.count), 1);
                const pct = Math.round((item.count / maxCount) * 100);
                return (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                      <span style={{ color: '#38bdf8', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                        {item.count} units
                      </span>
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: '6px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: 'var(--radius-full)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${pct}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #0284c7, #38bdf8)',
                          borderRadius: 'var(--radius-full)',
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Department Breakdown */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Building2 size={16} color="#34d399" />
            <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>Top Department Deployments</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {deptData.slice(0, 6).map((d, idx) => {
              const maxCount = Math.max(...deptData.map((c) => c.count), 1);
              const pct = Math.round((d.count / maxCount) * 100);
              return (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{d.name}</span>
                    <span style={{ color: '#34d399', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                      {d.count} devices
                    </span>
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: '6px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #059669, #34d399)',
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Facility Distribution */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <MapPin size={16} color="#38bdf8" />
            <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>Facility & Plant Distribution</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {locData.map((l, idx) => {
              const maxCount = Math.max(...locData.map((c) => c.count), 1);
              const pct = Math.round((l.count / maxCount) * 100);
              return (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{l.name}</span>
                    <span style={{ color: '#38bdf8', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                      {l.count} assets
                    </span>
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: '6px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #0284c7, #38bdf8)',
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={16} color="#38bdf8" />
            <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>Recent Operational Activities</span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('audit-logs')}
            className="btn btn-ghost btn-xs"
            style={{ color: '#38bdf8' }}
          >
            View Complete Audit Log →
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {recentActs.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-faint)', fontSize: '0.8rem' }}>
              No recent activity entries recorded
            </div>
          ) : (
            recentActs.slice(0, 5).map((act, idx) => (
              <div
                key={act._id || idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--primary-light)',
                      color: '#a5b4fc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {act.user?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {act.action} {act.assetTag ? `• ${act.assetTag}` : ''}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                      {act.details}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-faint)', fontSize: '0.7rem' }}>
                  <Clock size={12} />
                  <span>{new Date(act.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Primary Operational Ledger: Corporate User Workstations or Hardware Depot */}
      <div style={{ marginTop: '2.5rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
                {ledgerMode === 'users' ? 'Corporate User Workstations Ledger' : 'Hardware Fleet Depot'}
              </h2>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.6rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: ledgerMode === 'users' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(52, 211, 153, 0.15)',
                  color: ledgerMode === 'users' ? '#38bdf8' : '#34d399',
                  border: `1px solid ${ledgerMode === 'users' ? 'rgba(56, 189, 248, 0.3)' : 'rgba(52, 211, 153, 0.3)'}`,
                }}
              >
                {ledgerMode === 'users' ? `${filteredEmployees.length} Employee Profiles` : `${assets.length} Hardware Units`}
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem', marginBottom: 0 }}>
              {ledgerMode === 'users'
                ? 'User-centric custody roster: assigned primary machines, dual displays, peripherals bundle, IP bindings, and legal undertaking sheets.'
                : 'Central inventory hardware register: serial numbers, purchase invoices, warranty health, and maintenance tracking.'}
            </p>
          </div>

          {/* View Mode Toggle + Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            {/* Toggle Switcher */}
            <div
              style={{
                display: 'flex',
                backgroundColor: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                padding: '3px',
              }}
            >
              <button
                type="button"
                onClick={() => setLedgerMode('users')}
                style={{
                  padding: '0.4rem 0.9rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  backgroundColor: ledgerMode === 'users' ? 'var(--primary)' : 'transparent',
                  color: ledgerMode === 'users' ? '#ffffff' : 'var(--text-muted)',
                  boxShadow: ledgerMode === 'users' ? '0 1px 4px rgba(0,0,0,0.2)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <Users size={14} />
                <span>By Users & Workstations</span>
              </button>

              <button
                type="button"
                onClick={() => setLedgerMode('assets')}
                style={{
                  padding: '0.4rem 0.9rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  backgroundColor: ledgerMode === 'assets' ? 'var(--primary)' : 'transparent',
                  color: ledgerMode === 'assets' ? '#ffffff' : 'var(--text-muted)',
                  boxShadow: ledgerMode === 'assets' ? '0 1px 4px rgba(0,0,0,0.2)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <Boxes size={14} />
                <span>By Hardware Depot</span>
              </button>
            </div>

            {ledgerMode === 'users' && (
              <button
                type="button"
                onClick={() => setShowBulkAddModal(true)}
                className="btn btn-outline btn-sm"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  borderColor: 'rgba(56, 189, 248, 0.4)',
                  color: '#38bdf8',
                }}
              >
                <Upload size={14} />
                <span>+ Bulk Add Users</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onNavigate(ledgerMode === 'users' ? 'asset-assign' : 'asset-add')}
              className="btn btn-primary btn-sm"
            >
              <Plus size={14} />
              <span>{ledgerMode === 'users' ? 'Allocate Workstation' : 'Inward Asset'}</span>
            </button>
          </div>
        </div>

        {/* LEDGER MODE 1: BY USERS & WORKSTATIONS */}
        {ledgerMode === 'users' && (
          <div className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border-default)' }}>
            {/* Filter Bar */}
            <div
              style={{
                padding: '0.85rem 1.25rem',
                borderBottom: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-surface-raised)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.85rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', flex: 1 }}>
                {/* Search */}
                <div style={{ position: 'relative', width: '260px' }}>
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
                    placeholder="Search staff, emp ID, or tag..."
                    value={empSearchQuery}
                    onChange={(e) => setEmpSearchQuery(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: '32px', paddingRight: empSearchQuery ? '28px' : '8px', height: '34px', fontSize: '0.8rem' }}
                  />
                  {empSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setEmpSearchQuery('')}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-faint)',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '4px',
                      }}
                      title="Clear search"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Department Filter */}
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="input-field"
                  style={{ width: '180px', height: '34px', fontSize: '0.8rem' }}
                >
                  <option value="All">All Departments</option>
                  {uniqueDepartments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>

                {/* Status Segmented Buttons */}
                <div
                  style={{
                    display: 'flex',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    padding: '2px',
                  }}
                >
                  {[
                    { id: 'All', label: 'All Staff' },
                    { id: 'equipped', label: 'Equipped' },
                    { id: 'pending', label: 'Pending Setup' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setAllocationFilter(tab.id)}
                      style={{
                        padding: '0.25rem 0.65rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        borderRadius: 'var(--radius-xs)',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: allocationFilter === tab.id ? 'var(--primary)' : 'transparent',
                        color: allocationFilter === tab.id ? '#ffffff' : 'var(--text-muted)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                Showing <strong style={{ color: 'var(--text-primary)' }}>{filteredEmployees.length}</strong> user profiles
              </div>
            </div>

            {/* User Workstations Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      backgroundColor: 'rgba(255, 255, 255, 0.015)',
                      fontSize: '0.72rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: 'var(--text-faint)',
                    }}
                  >
                    <th style={{ padding: '0.75rem 1.25rem' }}>Employee / Custodian</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Department & Facility</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Primary Workstation</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Displays & Peripherals Bundle</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Allocation Status</th>
                    <th style={{ padding: '0.75rem 1.25rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Users size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          No matching employee workstations found
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-faint)', marginTop: '0.25rem' }}>
                          Try clearing filters or search query.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((emp) => {
                      const empAssets = getEmployeeAssets(emp, assets);
                      const isEquipped = empAssets.length > 0;

                      // Identify Primary Machine (Laptop, Desktop, Workstation, AIO)
                      const primaryMachine =
                        empAssets.find((a) => {
                          const dt = (a.deviceType || a.category || '').toLowerCase();
                          return dt.includes('laptop') || dt.includes('desktop') || dt.includes('pc') || dt.includes('workstation');
                        }) || empAssets[0];

                      // Parse Displays and Peripherals
                      const displays = [];
                      const peripherals = [];

                      empAssets.forEach((a) => {
                        if (a.monitorDetails) {
                          displays.push(a.monitorDetails);
                        }
                        if (a.deviceType && a.deviceType.toLowerCase().includes('monitor')) {
                          displays.push(`${a.make || ''} ${a.model || ''} (${a.sr || a.assetNo})`);
                        }
                        if (a.accessories) {
                          const accs = a.accessories.split(',').map((s) => s.trim()).filter(Boolean);
                          accs.forEach((acc) => peripherals.push(acc));
                        }
                        const dt = (a.deviceType || a.category || '').toLowerCase();
                        if (dt.includes('printer')) peripherals.push(`Printer: ${a.make || ''} ${a.model || ''}`);
                        if (dt.includes('scanner')) peripherals.push(`Scanner: ${a.make || ''} ${a.model || ''}`);
                        if (dt.includes('ups')) peripherals.push(`UPS: ${a.make || ''} ${a.model || ''}`);
                      });

                      const initials = (emp.name || 'U')
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase();

                      return (
                        <tr
                          key={emp._id || emp.id || emp.name}
                          style={{
                            borderBottom: '1px solid var(--border-subtle)',
                            transition: 'background-color 0.15s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          {/* Col 1: Employee */}
                          <td style={{ padding: '0.85rem 1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div
                                style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: 'var(--radius-full)',
                                  backgroundColor: isEquipped ? 'rgba(56, 189, 248, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                  color: isEquipped ? '#38bdf8' : '#fbbf24',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.82rem',
                                  fontWeight: 800,
                                  flexShrink: 0,
                                }}
                              >
                                {initials}
                              </div>
                              <div>
                                <div
                                  style={{
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer',
                                  }}
                                  onClick={() => setSelectedEmployeeForModal(emp)}
                                >
                                  {emp.name}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: '2px', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                                    {emp.employeeId || 'ID Pending'}
                                  </span>
                                  {emp.designation && <span>• {emp.designation}</span>}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Col 2: Dept & Facility */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              <span
                                style={{
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  color: 'var(--text-secondary)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                }}
                              >
                                <Building2 size={12} color="#38bdf8" />
                                {emp.department || 'General Admin'}
                              </span>
                              <span
                                style={{
                                  fontSize: '0.7rem',
                                  color: 'var(--text-faint)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                }}
                              >
                                <MapPin size={11} />
                                {emp.location || 'Vitromed (Plant 1)'}
                              </span>
                            </div>
                          </td>

                          {/* Col 3: Primary Machine */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            {primaryMachine ? (
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                  <span
                                    style={{
                                      fontSize: '0.68rem',
                                      fontWeight: 800,
                                      fontFamily: 'var(--font-mono)',
                                      padding: '0.1rem 0.45rem',
                                      borderRadius: 'var(--radius-xs)',
                                      backgroundColor: 'rgba(56, 189, 248, 0.1)',
                                      color: '#38bdf8',
                                      border: '1px solid rgba(56, 189, 248, 0.25)',
                                    }}
                                  >
                                    #{primaryMachine.assetNo || 'AST'}
                                  </span>
                                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                    {primaryMachine.make} {primaryMachine.model}
                                  </span>
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)', marginTop: '3px', fontFamily: 'var(--font-mono)' }}>
                                  S/N: {primaryMachine.sr || 'N/A'} {primaryMachine.ipAddress ? `• IP: ${primaryMachine.ipAddress}` : ''}
                                </div>
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)', fontStyle: 'italic' }}>
                                No primary machine assigned
                              </span>
                            )}
                          </td>

                          {/* Col 4: Displays & Peripherals Bundle */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {displays.length > 0 ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: '#818cf8' }}>
                                  <Monitor size={12} />
                                  <span style={{ fontWeight: 600 }}>{displays.join(' + ')}</span>
                                </div>
                              ) : null}

                              {peripherals.length > 0 ? (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                                  {peripherals.slice(0, 3).map((p, pIdx) => (
                                    <span
                                      key={pIdx}
                                      style={{
                                        fontSize: '0.68rem',
                                        padding: '0.08rem 0.4rem',
                                        borderRadius: 'var(--radius-xs)',
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                        color: 'var(--text-secondary)',
                                        border: '1px solid var(--border-subtle)',
                                      }}
                                    >
                                      {p}
                                    </span>
                                  ))}
                                  {peripherals.length > 3 && (
                                    <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)' }}>
                                      +{peripherals.length - 3}
                                    </span>
                                  )}
                                </div>
                              ) : displays.length === 0 ? (
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>
                                  Standard kit
                                </span>
                              ) : null}
                            </div>
                          </td>

                          {/* Col 5: Allocation Status */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                padding: '0.2rem 0.6rem',
                                borderRadius: 'var(--radius-full)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                backgroundColor: isEquipped ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                                color: isEquipped ? '#34d399' : '#fbbf24',
                                border: `1px solid ${isEquipped ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`,
                              }}
                            >
                              <span
                                style={{
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: 'var(--radius-full)',
                                  backgroundColor: isEquipped ? '#34d399' : '#fbbf24',
                                }}
                              />
                              {isEquipped ? `${empAssets.length} System(s) In Custody` : 'Pending IT Allocation'}
                            </span>
                          </td>

                          {/* Col 6: Actions */}
                          <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                              <button
                                type="button"
                                onClick={() => setSelectedEmployeeForModal(emp)}
                                className="btn btn-outline btn-xs"
                                title="View User Fleet & Print Undertaking"
                                style={{ fontSize: '0.72rem' }}
                              >
                                <FileText size={12} color="#38bdf8" />
                                <span>Custody & Handover</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => onNavigate('asset-assign')}
                                className="btn btn-ghost btn-xs"
                                title="Allocate Equipment"
                                style={{ color: '#34d399' }}
                              >
                                <UserPlus size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* LEDGER MODE 2: BY HARDWARE DEPOT */}
        {ledgerMode === 'assets' && (
          <AssetTable
            assets={assets}
            categoryFilter="All"
            globalSearch={globalSearch}
            onViewDetails={onViewDetails}
            onAssign={onAssign}
            onTransfer={onTransfer}
            onReturn={onReturn}
            onMaintenanceReturn={onMaintenanceReturn}
            onMaintenance={onMaintenance}
            onEdit={onEdit}
            onRetire={onRetire}
            onDelete={onDelete}
          />
        )}
      </div>

      {/* Selected Employee Custody & Printable Undertaking Modal */}
      {selectedEmployeeForModal && (
        <EmployeeProfileModal
          employee={selectedEmployeeForModal}
          assets={assets}
          allEmployees={employees}
          onClose={() => setSelectedEmployeeForModal(null)}
          onViewAsset={onViewDetails}
          onAddNewAssign={() => {
            const emp = selectedEmployeeForModal;
            setSelectedEmployeeForModal(null);
            if (onAssign) onAssign(emp);
          }}
          onSuccess={() => {
            if (onNavigate) onNavigate('dashboard');
          }}
        />
      )}

      {/* Bulk Add Users Modal */}
      {showBulkAddModal && (
        <BulkAddEmployeesModal
          employees={employees}
          onClose={() => setShowBulkAddModal(false)}
          onSuccess={() => {
            setShowBulkAddModal(false);
            if (onNavigate) onNavigate('org-employees');
          }}
        />
      )}
    </div>
  );
}