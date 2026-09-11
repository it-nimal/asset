import React from 'react';
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
} from 'lucide-react';
import AssetTable from '../assets/AssetTable';

export default function Dashboard({
  stats,
  assets = [],
  onNavigate,
  onViewDetails,
  onAssign,
  onTransfer,
  onReturn,
  onMaintenance,
  onEdit,
  onDelete,
}) {
  const cards = [
    {
      title: 'Total Hardware Fleet',
      value: stats?.total || 0,
      subtext: 'Across all plants',
      icon: Boxes,
      color: '#818cf8',
      bgGlow: 'rgba(99, 102, 241, 0.12)',
      target: 'assets-all',
    },
    {
      title: 'Assigned Custodians',
      value: stats?.assigned || 0,
      subtext: `${stats?.total ? Math.round(((stats?.assigned || 0) / stats.total) * 100) : 0}% fleet utilization`,
      icon: UserCheck,
      color: '#38bdf8',
      bgGlow: 'rgba(56, 189, 248, 0.12)',
      target: 'asset-assign',
    },
    {
      title: 'Available in Stock',
      value: stats?.available || 0,
      subtext: 'Ready for allocation',
      icon: CheckCircle2,
      color: '#34d399',
      bgGlow: 'rgba(16, 185, 129, 0.12)',
      target: 'assets-all',
    },
    {
      title: 'Under Maintenance',
      value: stats?.maintenance || 0,
      subtext: 'In service centers',
      icon: Wrench,
      color: '#fbbf24',
      bgGlow: 'rgba(245, 158, 11, 0.12)',
      target: 'asset-maintenance',
    },
    {
      title: 'Retired / Disposed',
      value: stats?.retired || 0,
      subtext: 'Decommissioned units',
      icon: Archive,
      color: '#94a3b8',
      bgGlow: 'rgba(148, 163, 184, 0.12)',
      target: 'assets-all',
    },
    {
      title: 'Lost or Stolen',
      value: stats?.lost || 0,
      subtext: 'Security incidents',
      icon: AlertOctagon,
      color: '#f87171',
      bgGlow: 'rgba(239, 68, 68, 0.12)',
      target: 'assets-all',
    },
    {
      title: 'Warranty Expiring (30d)',
      value: stats?.warrantyExpiringSoon || 3,
      subtext: 'Requires AMC review',
      icon: ShieldAlert,
      color: '#fb923c',
      bgGlow: 'rgba(251, 146, 60, 0.12)',
      target: 'asset-warranty',
    },
    {
      title: 'Licenses Expiring',
      value: stats?.licensesExpiringSoon || 0,
      subtext: 'SAM renewal notice',
      icon: KeyRound,
      color: '#f472b6',
      bgGlow: 'rgba(244, 114, 182, 0.12)',
      target: 'software-licenses',
    },
  ];

  const categoryData = stats?.categoryBreakdown || [];
  const deptData = stats?.departmentBreakdown || [];
  const locData = stats?.locationBreakdown || [];
  const recentActs = stats?.recentActivities || [];

  return (
    <div style={{ padding: '1.5rem 2rem 4rem', maxWidth: '1440px', margin: '0 auto' }}>
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
            System Infrastructure Overview
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Hardware lifecycle health, warranty tracking, and facility deployment across corporate plants.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button
            type="button"
            onClick={() => onNavigate('reports')}
            className="btn btn-outline btn-sm"
          >
            <FileText size={14} />
            <span>Audit Reports</span>
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

      {/* Distribution Grids */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.25rem',
          marginBottom: '1.5rem',
        }}
      >
        {/* Category Breakdown */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Layers size={16} color="#818cf8" />
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
                      <span style={{ color: '#818cf8', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
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
                          background: 'linear-gradient(90deg, #4f46e5, #818cf8)',
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
            <Activity size={16} color="#818cf8" />
            <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>Recent Operational Activities</span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('audit-logs')}
            className="btn btn-ghost btn-xs"
            style={{ color: '#818cf8' }}
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

      {/* Live Hardware Inventory Fleet */}
      <div style={{ marginTop: '2.5rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Hardware Fleet Inventory ({assets.length} Systems)
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Direct MongoDB inventory: physical workstations, laptops, static IP assignments, and custodians across corporate plants.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('asset-add')}
            className="btn btn-primary btn-sm"
          >
            <span>+ Inward Asset</span>
          </button>
        </div>

        <AssetTable
          assets={assets}
          categoryFilter="All"
          onViewDetails={onViewDetails}
          onAssign={onAssign}
          onTransfer={onTransfer}
          onReturn={onReturn}
          onMaintenance={onMaintenance}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}