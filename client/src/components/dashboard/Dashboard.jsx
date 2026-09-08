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
} from 'lucide-react';

export default function Dashboard({ stats, assets = [], onNavigate }) {
  const cards = [
    { title: 'Total Assets', value: stats?.total || 0, icon: Boxes, color: '#818cf8', target: 'assets-all' },
    { title: 'Assigned', value: stats?.assigned || 0, icon: UserCheck, color: '#38bdf8', target: 'asset-assign' },
    { title: 'Available in Stock', value: stats?.available || 0, icon: CheckCircle2, color: '#34d399', target: 'assets-all' },
    { title: 'Under Maintenance', value: stats?.maintenance || 0, icon: Wrench, color: '#fbbf24', target: 'asset-maintenance' },
    { title: 'Retired / Disposed', value: stats?.retired || 0, icon: Archive, color: '#94a3b8', target: 'assets-all' },
    { title: 'Lost or Stolen', value: stats?.lost || 0, icon: AlertOctagon, color: '#f87171', target: 'assets-all' },
    { title: 'Warranty Expiring (30d)', value: stats?.warrantyExpiringSoon || 3, icon: ShieldAlert, color: '#fb923c', target: 'asset-warranty' },
    { title: 'Licenses Expiring', value: stats?.licensesExpiringSoon || 0, icon: KeyRound, color: '#f472b6', target: 'software-licenses' },
  ];

  const categoryData = stats?.categoryBreakdown || [];
  const deptData = stats?.departmentBreakdown || [];
  const locData = stats?.locationBreakdown || [];
  const recentActs = stats?.recentActivities || [];

  return (
    <div style={{ padding: '1.5rem 2rem 4rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Sleek Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            System Overview
          </h1>
          <p style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '0.15rem' }}>
            Hardware lifecycle, warranty deadlines, and facility distribution across plants.
          </p>
        </div>

        {/* Minimal Quick Actions */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => onNavigate('reports')}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              color: '#cbd5e1',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '0.78rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <FileText size={14} />
            <span>Reports</span>
          </button>
          <button
            onClick={() => onNavigate('asset-add')}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '6px',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Plus size={14} />
            <span>Inward Asset</span>
          </button>
        </div>
      </div>

      {/* 8 Stat Cards Minimal Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '0.85rem',
          marginBottom: '1.5rem',
        }}
      >
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              onClick={() => onNavigate(c.target)}
              style={{
                backgroundColor: '#0f172a',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '8px',
                padding: '1rem',
                cursor: 'pointer',
                transition: 'border-color 0.15s, transform 0.15s',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>
                  {c.title}
                </span>
                <Icon size={16} color={c.color} />
              </div>

              <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '1.65rem', fontWeight: 700, color: '#f8fafc', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                  {c.value}
                </span>
                <ArrowUpRight size={13} color="#475569" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Minimal Attention Required Banner */}
      <div
        style={{
          backgroundColor: 'rgba(239, 68, 68, 0.04)',
          border: '1px solid rgba(239, 68, 68, 0.15)',
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <AlertTriangle size={16} color="#f87171" />
          <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>
            <strong style={{ color: '#f87171', fontWeight: 600 }}>Attention:</strong> 3 hardware warranties and 2 software licenses expire within 30 days.
          </span>
        </div>
        <button
          onClick={() => onNavigate('asset-warranty')}
          style={{
            backgroundColor: 'transparent',
            color: '#f87171',
            border: 'none',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            padding: 0,
            textDecoration: 'underline',
          }}
        >
          View Expiring Assets →
        </button>
      </div>

      {/* Analytical Breakdown Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* Category Breakdown */}
        <div style={chartCardStyle}>
          <div style={chartTitleStyle}>
            <Layers size={15} color="#818cf8" />
            <span>Devices by Category</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.85rem' }}>
            {categoryData.map((item, idx) => {
              const maxCount = Math.max(...categoryData.map(c => c.count), 1);
              const pct = Math.round((item.count / maxCount) * 100);
              return (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                    <span style={{ color: '#cbd5e1' }}>{item.name}</span>
                    <span style={{ color: '#818cf8', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{item.count}</span>
                  </div>
                  <div style={{ width: '100%', height: '5px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        backgroundColor: '#6366f1',
                        borderRadius: '9999px',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Department Breakdown */}
        <div style={chartCardStyle}>
          <div style={chartTitleStyle}>
            <Building2 size={15} color="#34d399" />
            <span>Department Deployment</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.85rem' }}>
            {deptData.slice(0, 6).map((d, idx) => {
              const maxCount = Math.max(...deptData.map(c => c.count), 1);
              const pct = Math.round((d.count / maxCount) * 100);
              return (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                    <span style={{ color: '#cbd5e1' }}>{d.name}</span>
                    <span style={{ color: '#34d399', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{d.count}</span>
                  </div>
                  <div style={{ width: '100%', height: '5px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', backgroundColor: '#10b981', borderRadius: '9999px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Plant / Location Breakdown */}
        <div style={chartCardStyle}>
          <div style={chartTitleStyle}>
            <MapPin size={15} color="#38bdf8" />
            <span>Facility Distribution</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.85rem' }}>
            {locData.map((l, idx) => {
              const maxCount = Math.max(...locData.map(c => c.count), 1);
              const pct = Math.round((l.count / maxCount) * 100);
              return (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                    <span style={{ color: '#cbd5e1' }}>{l.name}</span>
                    <span style={{ color: '#38bdf8', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{l.count}</span>
                  </div>
                  <div style={{ width: '100%', height: '5px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', backgroundColor: '#06b6d4', borderRadius: '9999px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity Log */}
      <div style={chartCardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '0.65rem', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#f8fafc', fontWeight: 600, fontSize: '0.85rem' }}>
            <Clock size={15} color="#818cf8" />
            <span>Recent Activity</span>
          </div>
          <button
            onClick={() => onNavigate('audit-logs')}
            style={{
              background: 'none',
              border: 'none',
              color: '#818cf8',
              fontSize: '0.75rem',
              fontWeight: 500,
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Audit Log →
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {recentActs.slice(0, 5).map((act, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.55rem 0.75rem',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    backgroundColor: act.action.includes('Assigned')
                      ? 'rgba(6, 182, 212, 0.12)'
                      : act.action.includes('Maintenance')
                      ? 'rgba(245, 158, 11, 0.12)'
                      : 'rgba(99, 102, 241, 0.12)',
                    color: act.action.includes('Assigned')
                      ? '#38bdf8'
                      : act.action.includes('Maintenance')
                      ? '#fbbf24'
                      : '#818cf8',
                  }}
                >
                  {act.action}
                </span>
                <div>
                  <span style={{ color: '#f8fafc', fontWeight: 500, fontSize: '0.78rem' }}>
                    {act.assetTag}
                  </span>
                  <span style={{ color: '#64748b', fontSize: '0.75rem', marginLeft: '0.45rem' }}>
                    {act.details}
                  </span>
                </div>
              </div>

              <div style={{ fontSize: '0.7rem', color: '#64748b', textAlign: 'right' }}>
                <span>{act.user}</span> • <span>{new Date(act.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const chartCardStyle = {
  backgroundColor: '#0f172a',
  border: '1px solid rgba(255, 255, 255, 0.06)',
  borderRadius: '8px',
  padding: '1rem 1.15rem',
};

const chartTitleStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.45rem',
  fontSize: '0.825rem',
  fontWeight: 600,
  color: '#f8fafc',
  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  paddingBottom: '0.5rem',
};