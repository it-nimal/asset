import React, { useState } from 'react';
import { Users, Building2, MapPin, Truck, Plus, Mail, Phone, MapPinOff } from 'lucide-react';

export default function OrganizationView({
  type = 'employees',
  employees = [],
  departments = [],
  locations = [],
  vendors = [],
  assets = [],
}) {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div style={{ padding: '1.75rem 2rem 4rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* 1. EMPLOYEES DIRECTORY (Section 11) */}
      {type === 'employees' && (
        <div>
          <div style={headerFlexStyle}>
            <div>
              <h2 style={titleStyle}>👥 Employees Directory ({employees.length})</h2>
              <p style={subTitleStyle}>Active personnel registered for corporate IT hardware custody and provisioning.</p>
            </div>
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={searchBoxStyle}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {employees
              .filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()) || e.employeeId.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((emp) => {
                const assignedCount = assets.filter(a => a.userName === emp.name).length;
                return (
                  <div key={emp._id || emp.employeeId} style={cardBoxStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div style={avatarStyle}>{emp.name.charAt(0)}</div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.95rem' }}>{emp.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 600 }}>{emp.employeeId} • {emp.designation}</div>
                      </div>
                    </div>

                    <div style={{ marginTop: '1rem', borderTop: '1px solid #1e293b', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.78rem', color: '#94a3b8' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <Mail size={13} color="#64748b" />
                        <span>{emp.email}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <Building2 size={13} color="#64748b" />
                        <span>{emp.department}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <MapPin size={13} color="#64748b" />
                        <span>{emp.location}</span>
                      </div>
                    </div>

                    <div style={{ marginTop: '1rem', backgroundColor: '#0b1329', padding: '0.5rem 0.75rem', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Assigned Assets:</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: assignedCount > 0 ? '#34d399' : '#94a3b8' }}>
                        {assignedCount} {assignedCount === 1 ? 'Device' : 'Devices'}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* 2. DEPARTMENTS (Section 12) */}
      {type === 'departments' && (
        <div>
          <div style={headerFlexStyle}>
            <div>
              <h2 style={titleStyle}>🏢 Department Management ({departments.length})</h2>
              <p style={subTitleStyle}>Operational business units with budget, allocated devices, and department leads.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {departments.map((dept) => {
              const deptAssets = assets.filter(a => a.department === dept.name);
              const totalVal = deptAssets.reduce((acc, a) => acc + (a.purchasePrice || 0), 0);
              return (
                <div key={dept._id || dept.code} style={cardBoxStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '4px', backgroundColor: '#1e293b', color: '#818cf8', fontWeight: 700 }}>
                        {dept.code}
                      </span>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginTop: '0.4rem' }}>{dept.name}</h3>
                    </div>
                  </div>

                  <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', color: '#cbd5e1' }}>
                    <div><span style={{ color: '#64748b' }}>Department Head:</span> <strong>{dept.manager}</strong></div>
                    <div><span style={{ color: '#64748b' }}>Base Location:</span> {dept.location}</div>
                  </div>

                  <div style={{ marginTop: '1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', backgroundColor: '#0b1329', padding: '0.75rem', borderRadius: '8px' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Allocated Assets</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#38bdf8' }}>{deptAssets.length}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Asset Value</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#34d399' }}>₹{(totalVal / 1000).toFixed(0)}k</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. LOCATIONS & PLANTS (Section 13) */}
      {type === 'locations' && (
        <div>
          <div style={headerFlexStyle}>
            <div>
              <h2 style={titleStyle}>📍 Locations, Plants & Facilities ({locations.length})</h2>
              <p style={subTitleStyle}>Enterprise branch offices, manufacturing plants, and server rooms.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {locations.map((loc) => {
              const locAssets = assets.filter(a => a.plant === loc.name);
              return (
                <div key={loc._id || loc.name} style={cardBoxStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{ ...avatarStyle, backgroundColor: '#0ea5e9' }}>🏭</div>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>{loc.name}</h3>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{loc.building} • {loc.floor} • {loc.room}</div>
                    </div>
                  </div>

                  <div style={{ marginTop: '0.85rem', fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.4 }}>
                    {loc.address || 'Vitromed Corporate Facility Location'}
                  </div>

                  <div style={{ marginTop: '1rem', borderTop: '1px solid #1e293b', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Active Hardware in Facility:</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#34d399' }}>{locAssets.length} Assets</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. VENDORS & SUPPLIERS */}
      {type === 'vendors' && (
        <div>
          <div style={headerFlexStyle}>
            <div>
              <h2 style={titleStyle}>🚚 IT Hardware & Software Vendors ({vendors.length})</h2>
              <p style={subTitleStyle}>Authorized OEM vendors, distributors, and support partners.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {vendors.map((ven) => (
              <div key={ven._id || ven.name} style={cardBoxStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ ...avatarStyle, backgroundColor: '#8b5cf6' }}>📦</div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>{ven.name}</h3>
                    <span style={{ fontSize: '0.72rem', color: '#818cf8', fontWeight: 600 }}>{ven.category}</span>
                  </div>
                </div>

                <div style={{ marginTop: '1rem', borderTop: '1px solid #1e293b', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                  <div><span style={{ color: '#64748b' }}>Contact Person:</span> <strong>{ven.contactPerson || 'Vendor Rep'}</strong></div>
                  <div><span style={{ color: '#64748b' }}>Email:</span> {ven.email || 'sales@vendor.com'}</div>
                  <div><span style={{ color: '#64748b' }}>Phone:</span> {ven.phone || '+91 80 0000 0000'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const headerFlexStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '1.75rem',
  flexWrap: 'wrap',
  gap: '1rem',
};

const titleStyle = {
  fontSize: '1.6rem',
  fontWeight: 800,
  color: '#ffffff',
  letterSpacing: '-0.02em',
};

const subTitleStyle = {
  fontSize: '0.85rem',
  color: '#94a3b8',
  marginTop: '0.2rem',
};

const searchBoxStyle = {
  padding: '0.55rem 1rem',
  backgroundColor: '#070d1e',
  border: '1px solid #334155',
  borderRadius: '8px',
  color: '#f8fafc',
  fontSize: '0.85rem',
  outline: 'none',
  minWidth: '240px',
};

const cardBoxStyle = {
  backgroundColor: '#131d36',
  border: '1px solid #1e293b',
  borderRadius: '12px',
  padding: '1.25rem',
  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
};

const avatarStyle = {
  width: '40px',
  height: '40px',
  borderRadius: '10px',
  backgroundColor: '#4f46e5',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#ffffff',
  fontWeight: 700,
  fontSize: '1.1rem',
};