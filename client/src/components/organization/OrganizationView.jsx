import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Building2,
  MapPin,
  Truck,
  Mail,
  Phone,
  Search,
  Laptop,
  CheckCircle2,
  Layers,
  Plus,
  Edit3,
  Trash2,
  X,
  IdCard,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Filter,
  ArrowRight,
  Calendar,
  UserCheck,
  RefreshCw,
  Briefcase,
  BadgeCheck,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../common/Toast';
import { useAuth } from '../../context/AuthContext';
import { COMPANY_DEPARTMENTS, COMPANY_PLANTS } from '../../constants/organization';

export default function OrganizationView({
  type = 'employees',
  employees = [],
  departments = [],
  locations = [],
  vendors = [],
  assets = [],
  globalSearch = '',
  onSuccess,
}) {
  const [searchTerm, setSearchTerm] = useState(globalSearch || '');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [fleetFilter, setFleetFilter] = useState('All');

  useEffect(() => {
    if (globalSearch !== undefined) {
      setSearchTerm(globalSearch);
    }
  }, [globalSearch]);

  // Modals state
  const [selectedEmpForId, setSelectedEmpForId] = useState(null);
  const [selectedEmpForAsset, setSelectedEmpForAsset] = useState(null);
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [empToDelete, setEmpToDelete] = useState(null);
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [deptToEdit, setDeptToEdit] = useState(null);
  const [deptToDelete, setDeptToDelete] = useState(null);

  // Filtered employees list
  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        (e.name || '').toLowerCase().includes(q) ||
        (e.employeeId || '').toLowerCase().includes(q) ||
        (e.department || '').toLowerCase().includes(q) ||
        (e.email || '').toLowerCase().includes(q) ||
        (e.designation || '').toLowerCase().includes(q);

      const matchesDept = departmentFilter === 'All' || e.department === departmentFilter;
      const matchesStatus = statusFilter === 'All' || (e.status || 'Active') === statusFilter;

      const assignedCount = assets.filter(
        (a) =>
          (a.userName || '').toLowerCase() === (e.name || '').toLowerCase() ||
          (a.empCode && e.employeeId && a.empCode.toLowerCase() === e.employeeId.toLowerCase())
      ).length;

      const matchesFleet =
        fleetFilter === 'All' ||
        (fleetFilter === 'With Hardware' && assignedCount > 0) ||
        (fleetFilter === 'No Hardware' && assignedCount === 0);

      return matchesSearch && matchesDept && matchesStatus && matchesFleet;
    });
  }, [employees, assets, searchTerm, departmentFilter, statusFilter, fleetFilter]);

  // Statistics
  const totalEmployees = employees.length;
  const withHardwareCount = useMemo(() => {
    return employees.filter((e) =>
      assets.some(
        (a) =>
          (a.userName || '').toLowerCase() === (e.name || '').toLowerCase() ||
          (a.empCode && e.employeeId && a.empCode.toLowerCase() === e.employeeId.toLowerCase())
      )
    ).length;
  }, [employees, assets]);

  const withIdCount = useMemo(() => {
    return employees.filter((e) => Boolean(e.employeeId && e.employeeId.trim())).length;
  }, [employees]);

  // Department list for dropdown
  const deptList = useMemo(() => {
    const fromDepts = departments.map((d) => d.name);
    const fromEmps = employees.map((e) => e.department).filter(Boolean);
    return Array.from(new Set([...COMPANY_DEPARTMENTS, ...fromDepts, ...fromEmps])).sort();
  }, [departments, employees]);

  return (
    <div className="page-container">
      {/* 1. EMPLOYEES DIRECTORY */}
      {type === 'employees' && (
        <div>
          {/* Header & Title */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '1.25rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
                  Employees Directory
                </h1>
                <span
                  style={{
                    backgroundColor: 'rgba(99, 102, 241, 0.15)',
                    color: '#a5b4fc',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    padding: '0.2rem 0.65rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                  }}
                >
                  {totalEmployees} Staff Members
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.35rem', marginBottom: 0 }}>
                Manage staff identification IDs, custodian profiles, and directly assign corporate hardware devices.
              </p>
            </div>

            {/* Quick Actions & Add Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setShowAddEmpModal(true)}
                className="btn btn-primary btn-sm"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.5rem 1rem',
                  fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
                }}
              >
                <Plus size={16} />
                + Add Employee & Assign ID
              </button>
            </div>
          </div>

          {/* KPI Stat Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div
              className="card"
              style={{
                padding: '0.9rem 1.15rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                borderLeft: '3px solid #6366f1',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(99, 102, 241, 0.15)',
                  color: '#818cf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Users size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Total Staff
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '1px' }}>
                  {totalEmployees}
                </div>
              </div>
            </div>

            <div
              className="card"
              style={{
                padding: '0.9rem 1.15rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                borderLeft: '3px solid #38bdf8',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IdCard size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  IDs Assigned
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8', marginTop: '1px' }}>
                  {withIdCount} <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)', fontWeight: 500 }}>/ {totalEmployees}</span>
                </div>
              </div>
            </div>

            <div
              className="card"
              style={{
                padding: '0.9rem 1.15rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                borderLeft: '3px solid #10b981',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#34d399',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Laptop size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Hardware Custody
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399', marginTop: '1px' }}>
                  {withHardwareCount} <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)', fontWeight: 500 }}>Staff</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div
            className="card"
            style={{
              padding: '0.85rem 1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1 1 260px' }}>
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
                placeholder="Search by name, employee ID, email, designation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '2rem', height: '36px', fontSize: '0.82rem' }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-faint)',
                    cursor: 'pointer',
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Department Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <Filter size={13} />
                <span>Dept:</span>
              </div>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="form-select"
                style={{ height: '36px', fontSize: '0.8rem', padding: '0 1.8rem 0 0.65rem' }}
              >
                <option value="All">All Departments ({deptList.length})</option>
                {deptList.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-select"
                style={{ height: '36px', fontSize: '0.8rem', padding: '0 1.8rem 0 0.65rem' }}
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Resigned">Resigned</option>
              </select>

              {/* Hardware Custody Filter */}
              <select
                value={fleetFilter}
                onChange={(e) => setFleetFilter(e.target.value)}
                className="form-select"
                style={{ height: '36px', fontSize: '0.8rem', padding: '0 1.8rem 0 0.65rem' }}
              >
                <option value="All">All Hardware</option>
                <option value="With Hardware">With Hardware</option>
                <option value="No Hardware">No Hardware</option>
              </select>
            </div>
          </div>

          {/* Employees Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {filteredEmployees.map((emp) => {
              const assignedAssets = assets.filter(
                (a) =>
                  (a.userName || '').toLowerCase() === (emp.name || '').toLowerCase() ||
                  (a.empCode && emp.employeeId && a.empCode.toLowerCase() === emp.employeeId.toLowerCase())
              );
              const assignedCount = assignedAssets.length;

              const statusColor =
                emp.status === 'On Leave' ? '#fbbf24' : emp.status === 'Resigned' ? '#f87171' : '#34d399';
              const statusBg =
                emp.status === 'On Leave'
                  ? 'rgba(251, 191, 36, 0.12)'
                  : emp.status === 'Resigned'
                  ? 'rgba(248, 113, 113, 0.12)'
                  : 'rgba(16, 185, 129, 0.12)';

              return (
                <div
                  key={emp._id || emp.employeeId}
                  className="card card-hoverable"
                  style={{
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div>
                    {/* Top Row: Avatar, Name & Status */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0 }}>
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: 'var(--radius-full)',
                            background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            fontWeight: 800,
                            fontSize: '0.96rem',
                            flexShrink: 0,
                            boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)',
                          }}
                        >
                          {(emp.name || 'E').charAt(0).toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: 700,
                              color: 'var(--text-primary)',
                              fontSize: '0.94rem',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                            title={emp.name}
                          >
                            {emp.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '2px' }}>
                            <Briefcase size={11} color="var(--text-faint)" />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {emp.designation || 'Staff'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.5rem',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: statusBg,
                          color: statusColor,
                          border: `1px solid ${statusColor}33`,
                          flexShrink: 0,
                        }}
                      >
                        {emp.status || 'Active'}
                      </span>
                    </div>

                    {/* PROMINENT EMPLOYEE ID SECTION */}
                    <div
                      style={{
                        marginTop: '1rem',
                        backgroundColor: 'rgba(99, 102, 241, 0.08)',
                        border: '1px solid rgba(99, 102, 241, 0.25)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.55rem 0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.5rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0 }}>
                        <IdCard size={15} color="#818cf8" style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Employee ID:</span>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            fontSize: '0.84rem',
                            color: emp.employeeId ? '#c7d2fe' : '#fbbf24',
                            letterSpacing: '0.02em',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {emp.employeeId || 'Not Assigned'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedEmpForId(emp)}
                        className="btn btn-ghost btn-xs"
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: '#818cf8',
                          padding: '0.2rem 0.5rem',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'rgba(99, 102, 241, 0.12)',
                          border: '1px solid rgba(99, 102, 241, 0.2)',
                          flexShrink: 0,
                        }}
                        title="Assign or Edit Employee ID"
                      >
                        <Edit3 size={11} />
                        Assign / Edit ID
                      </button>
                    </div>

                    {/* Contact & Placement Details */}
                    <div
                      style={{
                        marginTop: '0.9rem',
                        borderTop: '1px solid var(--border-subtle)',
                        paddingTop: '0.75rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.45rem',
                        fontSize: '0.78rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <Mail size={13} color="var(--text-faint)" style={{ flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {emp.email || 'No email registered'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <Building2 size={13} color="var(--text-faint)" style={{ flexShrink: 0 }} />
                        <span>{emp.department || 'General'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <MapPin size={13} color="var(--text-faint)" style={{ flexShrink: 0 }} />
                        <span>{emp.location || 'Vitromed'}</span>
                      </div>
                      {emp.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <Phone size={13} color="var(--text-faint)" style={{ flexShrink: 0 }} />
                          <span>{emp.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Assigned Hardware Fleet Section */}
                    <div
                      style={{
                        marginTop: '0.9rem',
                        backgroundColor: 'rgba(9, 15, 26, 0.6)',
                        border: '1px solid var(--border-subtle)',
                        padding: '0.65rem 0.75rem',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: assignedCount > 0 ? '0.45rem' : 0 }}>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                          Assigned Hardware:
                        </span>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: assignedCount > 0 ? 'var(--status-assigned-bg)' : 'rgba(255,255,255,0.05)',
                            color: assignedCount > 0 ? 'var(--status-assigned-text)' : 'var(--text-faint)',
                            border: `1px solid ${assignedCount > 0 ? 'var(--status-assigned-border)' : 'transparent'}`,
                            fontSize: '0.7rem',
                          }}
                        >
                          {assignedCount} {assignedCount === 1 ? 'Device' : 'Devices'}
                        </span>
                      </div>

                      {assignedCount > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.35rem' }}>
                          {assignedAssets.slice(0, 3).map((a) => (
                            <div
                              key={a._id}
                              style={{
                                fontSize: '0.72rem',
                                color: 'var(--text-secondary)',
                                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                padding: '0.25rem 0.45rem',
                                borderRadius: 'var(--radius-sm)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '0.5rem',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', minWidth: 0 }}>
                                <Laptop size={11} color="#38bdf8" style={{ flexShrink: 0 }} />
                                <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: 600 }}>
                                  {a.assetNo || a.sr || 'Asset'}
                                </span>
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {a.make} {a.model}
                                </span>
                              </div>
                              <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)', flexShrink: 0 }}>
                                {a.deviceType}
                              </span>
                            </div>
                          ))}
                          {assignedCount > 3 && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)', textAlign: 'center', marginTop: '2px' }}>
                              +{assignedCount - 3} more systems assigned
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: '0.2rem' }}>
                          No equipment currently checked out.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Action Buttons (Enterprise Footer) */}
                  <div
                    style={{
                      marginTop: '1.2rem',
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedEmpForAsset(emp)}
                      className="btn btn-primary btn-xs"
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                        fontWeight: 600,
                        fontSize: '0.74rem',
                        height: '28px',
                      }}
                      title="Assign a hardware device to this employee"
                    >
                      <Laptop size={12} />
                      Assign Hardware
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedEmpForId(emp)}
                      className="btn btn-outline btn-xs"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontWeight: 600,
                        fontSize: '0.74rem',
                        height: '28px',
                        borderColor: 'rgba(99, 102, 241, 0.4)',
                        color: '#a5b4fc',
                      }}
                      title="Assign or Edit Employee ID"
                    >
                      <IdCard size={12} />
                      Edit ID
                    </button>

                    <button
                      type="button"
                      onClick={() => setEmpToDelete(emp)}
                      className="btn btn-ghost btn-icon btn-xs"
                      style={{
                        height: '28px',
                        width: '28px',
                        color: 'var(--text-faint)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                      title="Delete Employee Record"
                    >
                      <Trash2 size={13} color="#f87171" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredEmployees.length === 0 && (
            <div
              className="card"
              style={{
                padding: '3rem 2rem',
                textAlign: 'center',
                marginTop: '1rem',
              }}
            >
              <Users size={36} color="var(--text-faint)" style={{ margin: '0 auto 0.75rem' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                No matching employees found
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '400px', margin: '0.25rem auto 1.25rem' }}>
                No personnel match your search filters. Try adjusting your query or register a new staff member.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setDepartmentFilter('All');
                  setStatusFilter('All');
                  setFleetFilter('All');
                }}
                className="btn btn-outline btn-sm"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2. DEPARTMENTS */}
      {type === 'departments' && (
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '1.75rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
                Department Management ({departments.length})
              </h1>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem', marginBottom: 0 }}>
                Operational cost centers, departmental managers, and assigned device counts.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddDeptModal(true)}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700 }}
            >
              <Plus size={16} />
              + Add Department
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {departments.map((dept) => {
              const deptAssets = assets.filter((a) => a.department === dept.name);
              return (
                <div key={dept._id || dept.code} className="card card-hoverable" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          padding: '0.15rem 0.5rem',
                          borderRadius: 'var(--radius-xs)',
                          backgroundColor: 'var(--primary-light)',
                          color: '#a5b4fc',
                          fontWeight: 700,
                        }}
                      >
                        {dept.code}
                      </span>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.45rem' }}>
                        {dept.name}
                      </h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <button
                        type="button"
                        onClick={() => setDeptToEdit(dept)}
                        className="btn btn-ghost btn-icon btn-xs"
                        title="Edit Department"
                      >
                        <Edit3 size={13} color="var(--text-muted)" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeptToDelete(dept)}
                        className="btn btn-ghost btn-icon btn-xs"
                        title="Delete Department"
                      >
                        <Trash2 size={13} color="#f87171" />
                      </button>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem',
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <div>
                      <span style={{ color: 'var(--text-faint)' }}>Department Head: </span>
                      <strong>{dept.manager}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-faint)' }}>Base Location: </span>
                      {dept.location}
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: '1.25rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: 'rgba(99, 102, 241, 0.05)',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Allocated Systems</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>
                        {deptAssets.length} {deptAssets.length === 1 ? 'Device' : 'Devices'}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: deptAssets.length > 0 ? '#34d399' : 'var(--text-faint)',
                        backgroundColor: deptAssets.length > 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.05)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-xs)',
                      }}
                    >
                      {deptAssets.length > 0 ? 'Active Fleet' : 'No Devices'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. LOCATIONS & PLANTS */}
      {type === 'locations' && (
        <div>
          <div style={{ marginBottom: '1.75rem' }}>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Locations & Facilities ({locations.length})
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Manufacturing sites, corporate campus buildings, and regional inventory depots.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {locations.map((loc) => {
              const locAssets = assets.filter((a) => a.plant === loc.name);
              return (
                <div key={loc._id || loc.name} className="card card-hoverable" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'rgba(56, 189, 248, 0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#38bdf8',
                        flexShrink: 0,
                      }}
                    >
                      <Building2 size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {loc.name}
                      </h3>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {loc.building} • {loc.floor} • {loc.room}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '0.85rem', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {loc.address || 'Vitromed Corporate Production & Facility Site'}
                  </div>

                  <div
                    style={{
                      marginTop: '1rem',
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: '0.75rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-faint)' }}>Total Stationed Assets:</span>
                    <span className="badge badge-available">
                      {locAssets.length} Devices
                    </span>
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
          <div style={{ marginBottom: '1.75rem' }}>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Vendors & OEM Partners ({vendors.length})
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Authorized hardware procurement partners, distributors, and certified AMC maintenance suppliers.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {vendors.map((v) => (
              <div key={v._id || v.name} className="card card-hoverable" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(99, 102, 241, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#818cf8',
                      flexShrink: 0,
                    }}
                  >
                    <Truck size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {v.name}
                    </h3>
                    <div style={{ fontSize: '0.72rem', color: '#818cf8', fontWeight: 600 }}>
                      {v.contactPerson} • {v.phone}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '0.85rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Email: <span style={{ color: 'var(--text-secondary)' }}>{v.email}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------- MODALS ------------------- */}

      {/* MODAL 1: ASSIGN / EDIT EMPLOYEE ID & PROFILE */}
      {selectedEmpForId && (
        <AssignEmployeeIdModal
          employee={selectedEmpForId}
          departments={departments}
          locations={locations}
          onClose={() => setSelectedEmpForId(null)}
          onSuccess={onSuccess}
        />
      )}

      {/* MODAL 2: REGISTER NEW EMPLOYEE & ASSIGN ID */}
      {showAddEmpModal && (
        <AddEmployeeModal
          departments={departments}
          locations={locations}
          employees={employees}
          onClose={() => setShowAddEmpModal(false)}
          onSuccess={onSuccess}
        />
      )}

      {/* MODAL 3: ASSIGN HARDWARE ASSET TO EMPLOYEE */}
      {selectedEmpForAsset && (
        <AssignAssetToEmployeeModal
          employee={selectedEmpForAsset}
          assets={assets}
          onClose={() => setSelectedEmpForAsset(null)}
          onSuccess={onSuccess}
        />
      )}

      {/* MODAL 4: DELETE CONFIRMATION */}
      {empToDelete && (
        <DeleteEmployeeModal
          employee={empToDelete}
          assignedCount={
            assets.filter(
              (a) =>
                (a.userName || '').toLowerCase() === (empToDelete.name || '').toLowerCase() ||
                (a.empCode && empToDelete.employeeId && a.empCode.toLowerCase() === empToDelete.employeeId.toLowerCase())
            ).length
          }
          onClose={() => setEmpToDelete(null)}
          onSuccess={onSuccess}
        />
      )}

      {/* MODAL 5: ADD / EDIT DEPARTMENT */}
      {(showAddDeptModal || deptToEdit) && (
        <AddEditDepartmentModal
          dept={deptToEdit}
          locations={locations}
          onClose={() => {
            setShowAddDeptModal(false);
            setDeptToEdit(null);
          }}
          onSuccess={onSuccess}
        />
      )}

      {/* MODAL 6: DELETE DEPARTMENT */}
      {deptToDelete && (
        <DeleteDepartmentModal
          dept={deptToDelete}
          assetCount={assets.filter((a) => a.department === deptToDelete.name).length}
          onClose={() => setDeptToDelete(null)}
          onSuccess={onSuccess}
        />
      )}
    </div>
  );
}

// ----------------- MODAL 1: ASSIGN / EDIT EMPLOYEE ID -----------------
function AssignEmployeeIdModal({ employee, departments = [], locations = [], onClose, onSuccess }) {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    employeeId: employee.employeeId || '',
    name: employee.name || '',
    email: employee.email || '',
    department: employee.department || COMPANY_DEPARTMENTS[0],
    location: employee.location || 'Vitromed',
    designation: employee.designation || 'Staff',
    phone: employee.phone || '',
    status: employee.status || 'Active',
  });

  const handleGenerateId = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setFormData((prev) => ({ ...prev, employeeId: `VIT-${randomSuffix}` }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.employeeId.trim()) {
      return toast.error('Employee ID is required', 'Missing ID');
    }
    if (!formData.name.trim()) {
      return toast.error('Employee Name is required', 'Missing Name');
    }

    setLoading(true);
    try {
      await api.updateEmployee(employee._id, {
        ...formData,
        actorName: user?.name || 'IT Admin',
      });

      toast.success(`Assigned ID "${formData.employeeId}" to ${formData.name}!`, 'Employee ID Updated');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message, 'Update Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                color: '#818cf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IdCard size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Assign & Update Employee ID</h3>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: 0 }}>
                Set official personnel identification code and synchronize custodian records.
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-icon btn-xs">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Live ID Card Preview */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.8), rgba(15, 23, 42, 0.9))',
                border: '1px solid rgba(99, 102, 241, 0.35)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-full)',
                    background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    color: '#fff',
                    fontSize: '0.9rem',
                  }}
                >
                  {(formData.name || 'E').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.88rem' }}>
                    {formData.name || 'Employee Full Name'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    {formData.designation || 'Staff'} • {formData.department || 'Department'}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.66rem', color: '#818cf8', fontWeight: 600, textTransform: 'uppercase' }}>
                  Assigned ID
                </div>
                <div
                  style={{
                    fontFamily: 'monospace',
                    fontWeight: 800,
                    fontSize: '0.92rem',
                    color: '#38bdf8',
                    letterSpacing: '0.04em',
                  }}
                >
                  {formData.employeeId || 'NOT ASSIGNED'}
                </div>
              </div>
            </div>

            {/* EMPLOYEE ID INPUT (CORE FEATURE) */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>
                  Official Employee ID Code <span style={{ color: '#f87171' }}>*</span>
                </span>
                <button
                  type="button"
                  onClick={handleGenerateId}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#818cf8',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: 0,
                  }}
                >
                  <Sparkles size={11} />
                  ⚡ Auto-Generate ID
                </button>
              </label>
              <div style={{ position: 'relative' }}>
                <IdCard
                  size={15}
                  style={{
                    position: 'absolute',
                    left: '11px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#818cf8',
                  }}
                />
                <input
                  type="text"
                  required
                  placeholder="e.g. VIT-1045 or EMP-029"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="form-control"
                  style={{
                    paddingLeft: '2.2rem',
                    fontWeight: 700,
                    fontFamily: 'monospace',
                    letterSpacing: '0.03em',
                    borderColor: 'rgba(99, 102, 241, 0.4)',
                  }}
                />
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: '0.35rem' }}>
                This code uniquely identifies the custodian across all hardware rosters, maintenance logs, and print reports.
              </div>
            </div>

            {/* Full Name & Designation */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">
                  Full Name <span style={{ color: '#f87171' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Designation / Role</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Accounts Executive"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="form-control"
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Work Email</label>
                <input
                  type="email"
                  placeholder="name@vitromed.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Phone</label>
                <input
                  type="text"
                  placeholder="+91-9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="form-control"
                />
              </div>
            </div>

            {/* Department & Location */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="form-select"
                >
                  {COMPANY_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Plant / Facility</label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="form-select"
                >
                  <option value="Vitromed">Vitromed</option>
                </select>
              </div>
            </div>

            {/* Status */}
            <div className="form-group">
              <label className="form-label">Employment Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="form-select"
              >
                <option value="Active">Active (Eligible for Hardware Custody)</option>
                <option value="On Leave">On Leave</option>
                <option value="Resigned">Resigned / Former Staff</option>
              </select>
            </div>

            {/* Notice Alert */}
            <div
              style={{
                backgroundColor: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.65rem 0.85rem',
                fontSize: '0.74rem',
                color: '#7dd3fc',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
              }}
            >
              <ShieldCheck size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                Assigning or changing this Employee ID automatically syncs all current and historical hardware asset assignments in the database.
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
              {loading ? 'Saving ID...' : 'Save Employee ID & Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ----------------- MODAL 2: REGISTER NEW EMPLOYEE -----------------
function AddEmployeeModal({ departments = [], locations = [], employees = [], onClose, onSuccess }) {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  // Auto calculate next sequential ID
  const suggestNextId = () => {
    let maxNum = 1000;
    employees.forEach((e) => {
      if (e.employeeId && e.employeeId.startsWith('VIT-')) {
        const num = parseInt(e.employeeId.replace('VIT-', ''), 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    });
    return `VIT-${maxNum + 1}`;
  };

  const [formData, setFormData] = useState({
    employeeId: suggestNextId(),
    name: '',
    email: '',
    department: COMPANY_DEPARTMENTS[0],
    location: 'Vitromed',
    designation: 'Staff Associate',
    phone: '',
    status: 'Active',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      return toast.error('Employee Name is required');
    }
    if (!formData.employeeId.trim()) {
      return toast.error('Employee ID is required');
    }

    setLoading(true);
    try {
      await api.createEmployee({
        ...formData,
        actorName: user?.name || 'IT Admin',
      });

      toast.success(`Employee "${formData.name}" registered with ID "${formData.employeeId}"!`, 'Employee Added');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message, 'Registration Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(79, 70, 229, 0.15)',
                color: '#818cf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Register New Employee</h3>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: 0 }}>
                Enroll staff member and assign official ID for hardware custody.
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-icon btn-xs">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">
                Assigned Employee ID <span style={{ color: '#f87171' }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. VIT-1092"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="form-control"
                style={{ fontWeight: 700, fontFamily: 'monospace' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">
                  Full Name <span style={{ color: '#f87171' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={formData.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    const autoEmail = val ? `${val.toLowerCase().replace(/[^a-z0-9]/g, '')}@vitromed.com` : '';
                    setFormData((prev) => ({
                      ...prev,
                      name: val,
                      email: prev.email ? prev.email : autoEmail,
                    }));
                  }}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Designation</label>
                <input
                  type="text"
                  placeholder="e.g. Quality Engineer"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="form-control"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  placeholder="priya@vitromed.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Phone</label>
                <input
                  type="text"
                  placeholder="+91-9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="form-control"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="form-select"
                >
                  {COMPANY_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Plant Location</label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="form-select"
                >
                  <option value="Vitromed">Vitromed</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
              {loading ? 'Registering...' : '+ Register & Assign ID'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ----------------- MODAL 3: ASSIGN HARDWARE TO EMPLOYEE -----------------
function AssignAssetToEmployeeModal({ employee, assets = [], onClose, onSuccess }) {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  // Available unassigned hardware assets
  const availableAssets = useMemo(() => {
    return assets.filter((a) => a.status === 'Available');
  }, [assets]);

  const [selectedAssetId, setSelectedAssetId] = useState(availableAssets[0]?._id || '');
  const [floorCabin, setFloorCabin] = useState('Main Floor');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [remarks, setRemarks] = useState('');

  const selectedAsset = useMemo(() => {
    return assets.find((a) => a._id === selectedAssetId);
  }, [assets, selectedAssetId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedAssetId) {
      return toast.error('Please select an available hardware asset to allocate');
    }

    setLoading(true);
    try {
      await api.assignAsset(selectedAssetId, {
        userName: employee.name,
        empCode: employee.employeeId,
        mailId: employee.email,
        department: employee.department,
        plant: employee.location,
        floorCabin,
        expectedReturnDate,
        remarks: remarks || `Assigned to ${employee.name} (ID: ${employee.employeeId}) via Employee Section`,
        actorName: user?.name || 'IT Admin',
      });

      toast.success(
        `Asset "${selectedAsset?.assetNo || selectedAsset?.make + ' ' + selectedAsset?.model}" successfully allocated to ${employee.name}!`,
        'Hardware Assigned'
      );
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message, 'Allocation Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Laptop size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                Assign Hardware to {employee.name}
              </h3>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: 0 }}>
                Custodian ID: <strong style={{ color: '#818cf8' }}>{employee.employeeId}</strong> • {employee.department}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-icon btn-xs">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {availableAssets.length === 0 ? (
              <div
                style={{
                  backgroundColor: 'rgba(251, 191, 36, 0.1)',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                }}
              >
                <AlertCircle size={24} color="#fbbf24" style={{ margin: '0 auto 0.5rem' }} />
                <div style={{ fontWeight: 700, color: '#fbbf24', fontSize: '0.88rem' }}>
                  No Available Assets in Stock
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  All 124 hardware systems are currently assigned or in maintenance. Inward a new asset or check in returned equipment first.
                </div>
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">
                    Select Available Hardware Asset <span style={{ color: '#f87171' }}>*</span>
                  </label>
                  <select
                    required
                    value={selectedAssetId}
                    onChange={(e) => setSelectedAssetId(e.target.value)}
                    className="form-select"
                  >
                    {availableAssets.map((a) => (
                      <option key={a._id} value={a._id}>
                        {a.assetNo || a.sr} • {a.make} {a.model} ({a.deviceType}) • {a.processor || 'CPU'} • {a.plant}
                      </option>
                    ))}
                  </select>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    {availableAssets.length} available system(s) ready for allocation.
                  </div>
                </div>

                {selectedAsset && (
                  <div
                    style={{
                      backgroundColor: 'rgba(99, 102, 241, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.75rem',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '0.5rem',
                      fontSize: '0.75rem',
                    }}
                  >
                    <div>
                      <span style={{ color: 'var(--text-faint)' }}>Make / Model: </span>
                      <strong>{selectedAsset.make} {selectedAsset.model}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-faint)' }}>Serial No: </span>
                      <span style={{ fontFamily: 'monospace' }}>{selectedAsset.sr}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-faint)' }}>Specs: </span>
                      <span>{selectedAsset.processor}, {selectedAsset.ramSize}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-faint)' }}>Current Plant: </span>
                      <span>{selectedAsset.plant}</span>
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Floor / Cabin Placement</label>
                    <input
                      type="text"
                      placeholder="e.g. Ground Floor Cabin 4"
                      value={floorCabin}
                      onChange={(e) => setFloorCabin(e.target.value)}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Expected Return Date</label>
                    <input
                      type="date"
                      value={expectedReturnDate}
                      onChange={(e) => setExpectedReturnDate(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Allocation Remarks</label>
                  <input
                    type="text"
                    placeholder="e.g. Standard issue workstation for corporate duty"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="form-control"
                  />
                </div>
              </>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm" disabled={loading}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={loading || availableAssets.length === 0}
            >
              {loading ? 'Allocating...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ----------------- MODAL 4: DELETE EMPLOYEE -----------------
function DeleteEmployeeModal({ employee, assignedCount, onClose, onSuccess }) {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (assignedCount > 0) {
      return toast.error(
        `Cannot delete ${employee.name} because they have ${assignedCount} active hardware asset(s). Return or transfer them first.`,
        'Cannot Delete'
      );
    }

    setLoading(true);
    try {
      await api.deleteEmployee(employee._id, user?.name || 'IT Admin');
      toast.success(`Employee ${employee.name} deleted successfully`, 'Employee Deleted');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message, 'Delete Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f87171', margin: 0 }}>
            Delete Employee Record
          </h3>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-icon btn-xs">
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {assignedCount > 0 ? (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '0.85rem',
                borderRadius: 'var(--radius-sm)',
                color: '#f87171',
                fontSize: '0.82rem',
                lineHeight: 1.5,
              }}
            >
              <strong>Cannot Delete Active Custodian:</strong>
              <div style={{ marginTop: '0.25rem' }}>
                {employee.name} (ID: {employee.employeeId}) currently has{' '}
                <strong>{assignedCount} hardware device(s)</strong> assigned. You must check in or transfer these devices before deleting this employee.
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--text-primary)', fontSize: '0.88rem', margin: 0 }}>
              Are you sure you want to remove <strong>{employee.name}</strong> (Employee ID:{' '}
              <strong style={{ fontFamily: 'monospace' }}>{employee.employeeId}</strong>) from the directory?
            </p>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn btn-secondary btn-sm" disabled={loading}>
            Cancel
          </button>
          {assignedCount === 0 && (
            <button type="button" onClick={handleDelete} className="btn btn-danger btn-sm" disabled={loading}>
              {loading ? 'Deleting...' : 'Confirm Delete'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ----------------- MODAL 5: ADD / EDIT DEPARTMENT -----------------
function AddEditDepartmentModal({ dept, locations = [], onClose, onSuccess }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(dept && dept._id);

  const [formData, setFormData] = useState({
    name: dept?.name || '',
    code: dept?.code || '',
    manager: dept?.manager || '',
    location: dept?.location || 'Vitromed',
    budget: dept?.budget || '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      return toast.error('Department Name is required', 'Missing Name');
    }

    setLoading(true);
    try {
      if (isEdit) {
        await api.updateDepartment(dept._id, formData);
        toast.success(`Department "${formData.name}" updated successfully!`, 'Department Updated');
      } else {
        await api.createDepartment(formData);
        toast.success(`Department "${formData.name}" added successfully!`, 'Department Created');
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save department', 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                color: '#818cf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Building2 size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                {isEdit ? 'Edit Department' : 'Add New Department'}
              </h3>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: 0 }}>
                {isEdit ? 'Modify department parameters and leadership' : 'Register a new operational department & cost center'}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-icon btn-xs">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <div className="form-group">
              <label className="form-label">
                Department Name <span style={{ color: '#f87171' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Quality Control, Tool Room"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="form-control"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Department Code</label>
                <input
                  type="text"
                  placeholder="e.g. QC, TR, HRD"
                  value={formData.code}
                  onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department Head / Manager</label>
                <input
                  type="text"
                  placeholder="e.g. Head of Dept"
                  value={formData.manager}
                  onChange={(e) => setFormData((prev) => ({ ...prev, manager: e.target.value }))}
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Base Location / Plant</label>
              <select
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                className="form-select"
              >
                <option value="Vitromed">Vitromed</option>
                {locations
                  .filter((l) => l.name !== 'Vitromed')
                  .map((l) => (
                    <option key={l._id || l.name} value={l.name}>
                      {l.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Update Department' : 'Save Department'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ----------------- MODAL 6: DELETE DEPARTMENT -----------------
function DeleteDepartmentModal({ dept, assetCount, onClose, onSuccess }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (assetCount > 0) {
      return toast.error(
        `Cannot delete department "${dept.name}" because ${assetCount} hardware asset(s) are currently tagged with it. Reassign or edit those assets first.`,
        'Cannot Delete'
      );
    }

    setLoading(true);
    try {
      await api.deleteDepartment(dept._id);
      toast.success(`Department "${dept.name}" deleted successfully!`, 'Department Deleted');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to delete department', 'Delete Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f87171', margin: 0 }}>
            Delete Department
          </h3>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-icon btn-xs">
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {assetCount > 0 ? (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '0.85rem',
                borderRadius: 'var(--radius-sm)',
                color: '#f87171',
                fontSize: '0.82rem',
                lineHeight: 1.5,
              }}
            >
              <strong>Cannot Delete Department:</strong>
              <div style={{ marginTop: '0.25rem' }}>
                Department <strong>{dept.name}</strong> has{' '}
                <strong>{assetCount} hardware asset(s)</strong> assigned. Please reassign those systems before removing this department.
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--text-primary)', fontSize: '0.88rem', margin: 0 }}>
              Are you sure you want to remove <strong>{dept.name}</strong> ({dept.code || 'Dept'}) from the departments list?
            </p>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn btn-secondary btn-sm" disabled={loading}>
            Cancel
          </button>
          {assetCount === 0 && (
            <button type="button" onClick={handleDelete} className="btn btn-danger btn-sm" disabled={loading}>
              {loading ? 'Deleting...' : 'Confirm Delete'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
