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
  Monitor,
  Keyboard,
  Headphones,
  Printer,
  Scan,
  Zap,
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
  Eye,
  Undo2,
  ArrowRightLeft,
  ExternalLink,
  LayoutGrid,
  List,
  Upload,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../common/Toast';
import { useAuth } from '../../context/AuthContext';
import { COMPANY_DEPARTMENTS, COMPANY_PLANTS } from '../../constants/organization';
import HardwareAllocationSelector from '../assets/HardwareAllocationSelector';
import BulkAddEmployeesModal from './BulkAddEmployeesModal';
import EmployeeProfileModal from './EmployeeProfileModal';

// Robust helper to find all hardware assets currently assigned to an employee
export function getEmployeeAssets(emp, allAssets = []) {
  if (!emp || !allAssets || allAssets.length === 0) return [];
  const empName = (emp.name || '').trim().toLowerCase();
  const empId = (emp.employeeId || '').trim().toLowerCase();
  const empEmail = (emp.email || '').trim().toLowerCase();

  const normEmpId = empId ? empId.replace(/[^a-z0-9]/g, '') : '';
  const normEmpName = empName ? empName.replace(/[^a-z0-9]/g, '') : '';

  return allAssets.filter((a) => {
    const aUser = (a.userName || '').trim().toLowerCase();
    const aStatus = (a.status || '').trim().toLowerCase();
    if (!aUser || aUser === 'unassigned' || aStatus === 'available' || aStatus === 'retired' || aStatus === 'disposed') {
      return false;
    }

    // 1. Match by Employee Code / ID (exact or alphanumeric normalized)
    const aCode = (a.empCode || '').trim().toLowerCase();
    if (empId && aCode) {
      if (empId === aCode) return true;
      const normACode = aCode.replace(/[^a-z0-9]/g, '');
      if (normEmpId && normACode && normEmpId === normACode) return true;
    }

    // 2. Match by Email
    const aMail = (a.mailId || '').trim().toLowerCase();
    if (empEmail && aMail) {
      if (empEmail === aMail) return true;
      const emails = aMail.split(/[,;\s]+/).map((m) => m.trim());
      if (emails.includes(empEmail)) return true;
    }

    // 3. Match by Name (exact, compound delimiters, or word token matching)
    if (empName && aUser) {
      if (aUser === empName) return true;
      if (normEmpName && normEmpName === aUser.replace(/[^a-z0-9]/g, '')) return true;

      // Handle legacy compound roster entries: e.g. "CCTV / Mahendra Yadav / Rajnath Singh"
      const parts = aUser.split(/[\/,;&+]+/).map((p) => p.trim());
      for (const part of parts) {
        if (!part) continue;
        if (part === empName) return true;
        const normPart = part.replace(/[^a-z0-9]/g, '');
        if (normEmpName && normPart && normEmpName === normPart) return true;

        // Word-level token matching (e.g. employee "Rajnath" matches "Rajnath Singh")
        const words = part.split(/\s+/).filter(Boolean);
        if (words.includes(empName)) return true;
        const empWords = empName.split(/\s+/).filter(Boolean);
        if (empWords.length > 1 && words.length > 0) {
          if (empWords.every((w) => words.includes(w))) return true;
        }
      }
    }

    return false;
  });
}

export default function OrganizationView({
  type = 'employees',
  employees = [],
  departments = [],
  locations = [],
  vendors = [],
  assets = [],
  globalSearch = '',
  onSuccess,
  onViewAsset,
  onAssign,
  onTransfer,
  onReturn,
  initialOpenBulkModal = false,
}) {
  const [searchTerm, setSearchTerm] = useState(globalSearch || '');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [fleetFilter, setFleetFilter] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  useEffect(() => {
    if (globalSearch !== undefined) {
      setSearchTerm(globalSearch);
    }
  }, [globalSearch]);

  // Modals state
  const [selectedEmpForId, setSelectedEmpForId] = useState(null);
  const [selectedEmpForAsset, setSelectedEmpForAsset] = useState(null);
  const [selectedEmpForAssetList, setSelectedEmpForAssetList] = useState(null);
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [showBulkAddModal, setShowBulkAddModal] = useState(Boolean(initialOpenBulkModal));

  useEffect(() => {
    if (initialOpenBulkModal) {
      setShowBulkAddModal(true);
    }
  }, [initialOpenBulkModal]);
  const [empToDelete, setEmpToDelete] = useState(null);
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [deptToEdit, setDeptToEdit] = useState(null);
  const [deptToDelete, setDeptToDelete] = useState(null);

  // Filtered employees list (with asset-level search capability)
  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      const q = searchTerm.trim().toLowerCase();
      const empAssets = getEmployeeAssets(e, assets);
      const assignedCount = empAssets.length;

      const matchesSearch =
        !q ||
        (e.name || '').toLowerCase().includes(q) ||
        (e.employeeId || '').toLowerCase().includes(q) ||
        (e.department || '').toLowerCase().includes(q) ||
        (e.email || '').toLowerCase().includes(q) ||
        (e.designation || '').toLowerCase().includes(q) ||
        // Search across assigned assets (Asset Tag, S/N, Make, Model, Type, Host, IP)
        empAssets.some((a) =>
          (a.assetNo || '').toLowerCase().includes(q) ||
          (a.sr || '').toLowerCase().includes(q) ||
          (a.make || '').toLowerCase().includes(q) ||
          (a.model || '').toLowerCase().includes(q) ||
          (a.deviceType || '').toLowerCase().includes(q) ||
          (a.hostName || '').toLowerCase().includes(q) ||
          (a.ipAddress || '').toLowerCase().includes(q) ||
          (a.accessories || '').toLowerCase().includes(q) ||
          (a.monitorDetails || '').toLowerCase().includes(q)
        );

      const matchesDept = departmentFilter === 'All' || e.department === departmentFilter;
      const matchesStatus = statusFilter === 'All' || (e.status || 'Active') === statusFilter;

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
    return employees.filter((e) => getEmployeeAssets(e, assets).length > 0).length;
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setShowBulkAddModal(true)}
                className="btn btn-outline btn-sm"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.5rem 0.95rem',
                  fontWeight: 700,
                  borderColor: 'rgba(56, 189, 248, 0.4)',
                  color: '#38bdf8',
                }}
              >
                <Upload size={15} />
                <span>+ Bulk Add Users</span>
              </button>

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
                <span>+ Add Single Employee</span>
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
                <option value="With Hardware">With Hardware ({withHardwareCount})</option>
                <option value="No Hardware">No Hardware ({totalEmployees - withHardwareCount})</option>
              </select>

              {/* View Mode Toggle (Grid vs Table) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'var(--bg-surface-raised, #f1f5f9)',
                  padding: '2px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-default, #e2e8f0)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.35rem 0.65rem',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backgroundColor: viewMode === 'grid' ? 'var(--bg-surface, #ffffff)' : 'transparent',
                    color: viewMode === 'grid' ? 'var(--color-primary, #0284c7)' : 'var(--text-muted, #64748b)',
                    boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                  title="Card Grid View"
                >
                  <LayoutGrid size={14} />
                  <span>Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.35rem 0.65rem',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backgroundColor: viewMode === 'table' ? 'var(--bg-surface, #ffffff)' : 'transparent',
                    color: viewMode === 'table' ? 'var(--color-primary, #0284c7)' : 'var(--text-muted, #64748b)',
                    boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                  title="Directory Table View"
                >
                  <List size={14} />
                  <span>Table View</span>
                </button>
              </div>
            </div>
          </div>

          {/* VIEW MODE 1: GRID VIEW */}
          {viewMode === 'grid' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {filteredEmployees.map((emp) => {
                const assignedAssets = getEmployeeAssets(emp, assets);
                const assignedCount = assignedAssets.length;

                const statusColor =
                  emp.status === 'On Leave' ? '#fbbf24' : emp.status === 'Resigned' ? '#f87171' : '#10b981';
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
                      backgroundColor: 'var(--bg-surface, #ffffff)',
                      border: '1px solid var(--border-default, #e2e8f0)',
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
                              background: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#ffffff',
                              fontWeight: 800,
                              fontSize: '0.96rem',
                              flexShrink: 0,
                              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
                            }}
                          >
                            {(emp.name || 'E').charAt(0).toUpperCase()}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                fontWeight: 700,
                                color: 'var(--text-primary, #000000)',
                                fontSize: '0.96rem',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                              title={emp.name}
                            >
                              {emp.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #475569)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '2px' }}>
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
                          backgroundColor: 'rgba(2, 132, 199, 0.06)',
                          border: '1px solid rgba(2, 132, 199, 0.2)',
                          borderRadius: 'var(--radius-md)',
                          padding: '0.55rem 0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.5rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0 }}>
                          <IdCard size={15} color="var(--color-primary, #0284c7)" style={{ flexShrink: 0 }} />
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted, #475569)', fontWeight: 600 }}>Employee ID:</span>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              fontSize: '0.84rem',
                              color: emp.employeeId ? 'var(--color-primary, #0284c7)' : '#d97706',
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
                            color: 'var(--color-primary, #0284c7)',
                            padding: '0.2rem 0.5rem',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'rgba(2, 132, 199, 0.08)',
                            border: '1px solid rgba(2, 132, 199, 0.2)',
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
                          marginTop: '0.85rem',
                          borderTop: '1px solid var(--border-subtle, #f1f5f9)',
                          paddingTop: '0.75rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.45rem',
                          fontSize: '0.78rem',
                          color: 'var(--text-muted, #475569)',
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
                          backgroundColor: 'var(--bg-surface-raised, #f8fafc)',
                          border: '1px solid var(--border-default, #e2e8f0)',
                          padding: '0.75rem',
                          borderRadius: 'var(--radius-md)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: assignedCount > 0 ? '0.5rem' : 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Laptop size={13} color="var(--color-primary, #0284c7)" />
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-primary, #000000)', fontWeight: 700 }}>
                              Assigned Hardware ({assignedCount}):
                            </span>
                          </div>
                          {assignedCount > 0 && (
                            <button
                              type="button"
                              onClick={() => setSelectedEmpForAssetList(emp)}
                              className="btn btn-ghost btn-xs"
                              style={{
                                fontSize: '0.7rem',
                                padding: '2px 7px',
                                height: '22px',
                                color: 'var(--color-primary, #0284c7)',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                backgroundColor: 'rgba(2, 132, 199, 0.08)',
                                borderRadius: '4px',
                                border: '1px solid rgba(2, 132, 199, 0.2)',
                              }}
                            >
                              <span>View All ({assignedCount})</span>
                              <ArrowRight size={11} />
                            </button>
                          )}
                        </div>

                        {assignedCount > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                            {assignedAssets.map((a) => {
                              const isLaptop = (a.deviceType || '').toLowerCase().includes('laptop');
                              const isPrinter = (a.deviceType || '').toLowerCase().includes('printer');
                              const isMonitor = (a.deviceType || '').toLowerCase().includes('monitor');
                              const DevIcon = isLaptop ? Laptop : isPrinter ? Printer : isMonitor ? Monitor : Layers;

                              // Extract peripheral chips
                              const peripheralChips = [];
                              if (a.monitorDetails) peripheralChips.push(a.monitorDetails);
                              if (a.accessories) {
                                a.accessories.split(',').forEach((acc) => {
                                  const trim = acc.trim();
                                  if (trim && !peripheralChips.includes(trim)) peripheralChips.push(trim);
                                });
                              }

                              return (
                                <div
                                  key={a._id}
                                  style={{
                                    fontSize: '0.74rem',
                                    color: 'var(--text-primary, #000000)',
                                    backgroundColor: 'var(--bg-surface, #ffffff)',
                                    padding: '0.5rem 0.65rem',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--border-default, #cbd5e1)',
                                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.3rem',
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                                    <div
                                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 0, cursor: onViewAsset ? 'pointer' : 'default' }}
                                      onClick={() => onViewAsset && onViewAsset(a)}
                                      title="Click to view full master specifications and print profile"
                                    >
                                      <DevIcon size={13} color="#0284c7" style={{ flexShrink: 0 }} />
                                      <span style={{ fontFamily: 'monospace', color: '#0284c7', fontWeight: 800 }}>
                                        {a.assetNo ? `#${a.assetNo}` : a.sr}
                                      </span>
                                      <span style={{ fontWeight: 700, color: 'var(--text-primary, #000000)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {a.make} {a.model}
                                      </span>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                      <span
                                        style={{
                                          fontSize: '0.68rem',
                                          color: 'var(--color-primary, #0284c7)',
                                          backgroundColor: 'rgba(2, 132, 199, 0.08)',
                                          border: '1px solid rgba(2, 132, 199, 0.18)',
                                          padding: '0.1rem 0.4rem',
                                          borderRadius: '3px',
                                          fontWeight: 700,
                                          flexShrink: 0,
                                        }}
                                      >
                                        {a.deviceType || 'Hardware'}
                                      </span>
                                      {onViewAsset && (
                                        <button
                                          type="button"
                                          onClick={() => onViewAsset(a)}
                                          className="btn btn-ghost btn-icon btn-xs"
                                          style={{ width: '22px', height: '22px', padding: 0 }}
                                          title="View Full Profile / Print"
                                        >
                                          <Eye size={12} color="var(--color-primary, #0284c7)" />
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {/* Quick specs subtitle */}
                                  {(a.processor || a.ramSize || a.storage) && (
                                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted, #475569)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                      {a.processor && <span>{a.processor}</span>}
                                      {a.ramSize && <span>• {a.ramSize}</span>}
                                      {a.storage && <span>• {a.storage}</span>}
                                    </div>
                                  )}

                                  {/* Peripherals badges */}
                                  {peripheralChips.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '1px' }}>
                                      {peripheralChips.map((chip, cIdx) => (
                                        <span
                                          key={cIdx}
                                          style={{
                                            fontSize: '0.66rem',
                                            color: '#0369a1',
                                            backgroundColor: 'rgba(2, 132, 199, 0.08)',
                                            border: '1px solid rgba(2, 132, 199, 0.22)',
                                            padding: '0.1rem 0.35rem',
                                            borderRadius: '3px',
                                            fontWeight: 600,
                                          }}
                                        >
                                          + {chip}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                            <span style={{ fontSize: '0.74rem', color: 'var(--text-faint, #64748b)' }}>
                              No hardware currently checked out.
                            </span>
                            <button
                              type="button"
                              onClick={() => setSelectedEmpForAsset(emp)}
                              className="btn btn-ghost btn-xs"
                              style={{ fontSize: '0.7rem', color: 'var(--color-primary, #0284c7)', padding: '2px 6px', height: '22px' }}
                            >
                              + Assign
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Action Buttons (Enterprise Footer) */}
                    <div
                      style={{
                        marginTop: '1rem',
                        borderTop: '1px solid var(--border-default, #e2e8f0)',
                        paddingTop: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        flexWrap: 'wrap',
                      }}
                    >
                      {assignedCount > 0 ? (
                        <button
                          type="button"
                          onClick={() => setSelectedEmpForAssetList(emp)}
                          className="btn btn-primary btn-xs"
                          style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.35rem',
                            fontWeight: 700,
                            fontSize: '0.74rem',
                            height: '28px',
                          }}
                          title="View all assets and peripherals held by this employee"
                        >
                          <Laptop size={12} />
                          <span>All Assets ({assignedCount})</span>
                        </button>
                      ) : (
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
                            fontWeight: 700,
                            fontSize: '0.74rem',
                            height: '28px',
                          }}
                          title="Assign hardware asset to this employee"
                        >
                          <Laptop size={12} />
                          <span>Assign Hardware</span>
                        </button>
                      )}

                      {assignedCount > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedEmpForAsset(emp)}
                          className="btn btn-outline btn-xs"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontWeight: 600,
                            fontSize: '0.72rem',
                            height: '28px',
                          }}
                          title="Assign another hardware device"
                        >
                          <Plus size={11} />
                          <span>Assign More</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setSelectedEmpForId(emp)}
                        className="btn btn-outline btn-xs"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          fontWeight: 600,
                          fontSize: '0.72rem',
                          height: '28px',
                          borderColor: 'var(--border-default, #cbd5e1)',
                          color: 'var(--text-secondary, #0f172a)',
                        }}
                        title="Assign or Edit Employee ID"
                      >
                        <IdCard size={12} />
                        <span>Edit ID</span>
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
          )}

          {/* VIEW MODE 2: TABLE VIEW */}
          {viewMode === 'table' && (
            <div
              className="card"
              style={{
                padding: 0,
                overflow: 'hidden',
                border: '1px solid var(--border-default, #cbd5e1)',
                backgroundColor: 'var(--bg-surface, #ffffff)',
                borderRadius: '8px',
              }}
            >
              <div className="table-responsive" style={{ overflowX: 'auto' }}>
                <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-surface-raised, #f8fafc)', borderBottom: '2px solid var(--border-default, #e2e8f0)' }}>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-secondary, #0f172a)' }}>Employee</th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-secondary, #0f172a)' }}>ID</th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-secondary, #0f172a)' }}>Department</th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-secondary, #0f172a)' }}>Contact</th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-secondary, #0f172a)', minWidth: '320px' }}>
                        All Assigned Assets & Peripherals
                      </th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'center', fontWeight: 700, color: 'var(--text-secondary, #0f172a)' }}>Total Assets</th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 700, color: 'var(--text-secondary, #0f172a)' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map((emp) => {
                      const assignedAssets = getEmployeeAssets(emp, assets);
                      const assignedCount = assignedAssets.length;

                      return (
                        <tr
                          key={emp._id || emp.employeeId}
                          style={{
                            borderBottom: '1px solid var(--border-subtle, #f1f5f9)',
                            transition: 'background 0.15s ease',
                          }}
                        >
                          {/* 1. Employee Info */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                              <div
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: 'var(--radius-full)',
                                  background: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#ffffff',
                                  fontWeight: 800,
                                  fontSize: '0.82rem',
                                  flexShrink: 0,
                                }}
                              >
                                {(emp.name || 'E').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, color: 'var(--text-primary, #000000)' }}>
                                  {emp.name}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #475569)' }}>
                                  {emp.designation || 'Staff'}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* 2. Employee ID */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span
                              style={{
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                fontSize: '0.78rem',
                                color: emp.employeeId ? 'var(--color-primary, #0284c7)' : '#d97706',
                                backgroundColor: 'rgba(2, 132, 199, 0.08)',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                                border: '1px solid rgba(2, 132, 199, 0.2)',
                              }}
                            >
                              {emp.employeeId || 'None'}
                            </span>
                          </td>

                          {/* 3. Department & Plant */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary, #000000)' }}>{emp.department || 'General'}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #475569)' }}>{emp.location || 'Vitromed'}</div>
                          </td>

                          {/* 4. Contact */}
                          <td style={{ padding: '0.85rem 1rem', fontSize: '0.76rem', color: 'var(--text-muted, #475569)' }}>
                            <div>{emp.email || '—'}</div>
                            {emp.phone && <div style={{ color: 'var(--text-faint)' }}>{emp.phone}</div>}
                          </td>

                          {/* 5. ALL ASSIGNED ASSETS & PERIPHERALS LIST */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            {assignedCount > 0 ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                {assignedAssets.map((a) => {
                                  const isLaptop = (a.deviceType || '').toLowerCase().includes('laptop');
                                  const isPrinter = (a.deviceType || '').toLowerCase().includes('printer');
                                  const isMonitor = (a.deviceType || '').toLowerCase().includes('monitor');
                                  const DevIcon = isLaptop ? Laptop : isPrinter ? Printer : isMonitor ? Monitor : Layers;

                                  const peripheralChips = [];
                                  if (a.monitorDetails) peripheralChips.push(a.monitorDetails);
                                  if (a.accessories) {
                                    a.accessories.split(',').forEach((acc) => {
                                      const trim = acc.trim();
                                      if (trim && !peripheralChips.includes(trim)) peripheralChips.push(trim);
                                    });
                                  }

                                  return (
                                    <div
                                      key={a._id}
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.4rem',
                                        backgroundColor: 'var(--bg-surface-raised, #f8fafc)',
                                        border: '1px solid var(--border-default, #cbd5e1)',
                                        borderRadius: '4px',
                                        padding: '0.25rem 0.55rem',
                                        fontSize: '0.74rem',
                                        flexWrap: 'wrap',
                                      }}
                                    >
                                      <DevIcon size={12} color="#0284c7" />
                                      <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0284c7' }}>
                                        {a.assetNo ? `#${a.assetNo}` : a.sr}
                                      </span>
                                      <span style={{ fontWeight: 700, color: 'var(--text-primary, #000000)' }}>
                                        {a.make} {a.model}
                                      </span>
                                      <span
                                        style={{
                                          fontSize: '0.66rem',
                                          color: 'var(--color-primary, #0284c7)',
                                          backgroundColor: 'rgba(2, 132, 199, 0.08)',
                                          padding: '0.05rem 0.35rem',
                                          borderRadius: '3px',
                                        }}
                                      >
                                        {a.deviceType || 'Hardware'}
                                      </span>

                                      {peripheralChips.map((chip, cIdx) => (
                                        <span
                                          key={cIdx}
                                          style={{
                                            fontSize: '0.64rem',
                                            color: '#0369a1',
                                            backgroundColor: 'rgba(2, 132, 199, 0.06)',
                                            border: '1px solid rgba(2, 132, 199, 0.18)',
                                            padding: '0.05rem 0.3rem',
                                            borderRadius: '3px',
                                            fontWeight: 600,
                                          }}
                                        >
                                          + {chip}
                                        </span>
                                      ))}

                                      {onViewAsset && (
                                        <button
                                          type="button"
                                          onClick={() => onViewAsset(a)}
                                          className="btn btn-ghost btn-icon btn-xs"
                                          style={{ width: '18px', height: '18px', padding: 0, marginLeft: 'auto' }}
                                          title="View Specification Profile"
                                        >
                                          <Eye size={11} color="var(--color-primary, #0284c7)" />
                                        </button>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.74rem', color: 'var(--text-faint, #94a3b8)' }}>
                                No assets assigned
                              </span>
                            )}
                          </td>

                          {/* 6. Total Assets Pill */}
                          <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                            <span
                              style={{
                                fontSize: '0.76rem',
                                fontWeight: 800,
                                padding: '0.2rem 0.6rem',
                                borderRadius: '12px',
                                backgroundColor: assignedCount > 0 ? 'rgba(2, 132, 199, 0.12)' : 'rgba(0,0,0,0.04)',
                                color: assignedCount > 0 ? 'var(--color-primary, #0284c7)' : 'var(--text-faint)',
                                border: assignedCount > 0 ? '1px solid rgba(2, 132, 199, 0.25)' : '1px solid var(--border-default)',
                              }}
                            >
                              {assignedCount} {assignedCount === 1 ? 'Asset' : 'Assets'}
                            </span>
                          </td>

                          {/* 7. Row Actions */}
                          <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                              {assignedCount > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedEmpForAssetList(emp)}
                                  className="btn btn-primary btn-xs"
                                  style={{ fontWeight: 700 }}
                                  title="View full hardware portfolio modal"
                                >
                                  Portfolio ({assignedCount})
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setSelectedEmpForAsset(emp)}
                                className="btn btn-outline btn-xs"
                                title="Assign new hardware"
                              >
                                <Plus size={12} />
                                <span>Assign</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedEmpForId(emp)}
                                className="btn btn-ghost btn-xs"
                                title="Edit ID"
                              >
                                <Edit3 size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEmpToDelete(emp)}
                                className="btn btn-ghost btn-icon btn-xs"
                                title="Delete"
                              >
                                <Trash2 size={12} color="#f87171" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

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

      {/* MODAL 2B: BULK ADD & IMPORT EMPLOYEES */}
      {showBulkAddModal && (
        <BulkAddEmployeesModal
          departments={departments}
          locations={locations}
          employees={employees}
          onClose={() => setShowBulkAddModal(false)}
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

      {/* MODAL 3B: COMPREHENSIVE EMPLOYEE PROFILE (OVERVIEW, ASSETS, HISTORY, OFFBOARDING, UNDERTAKING) */}
      {selectedEmpForAssetList && (
        <EmployeeProfileModal
          employee={selectedEmpForAssetList}
          assets={assets}
          allEmployees={employees}
          onClose={() => setSelectedEmpForAssetList(null)}
          onViewAsset={(asset) => {
            setSelectedEmpForAssetList(null);
            if (onViewAsset) onViewAsset(asset);
          }}
          onAddNewAssign={() => {
            const emp = selectedEmpForAssetList;
            setSelectedEmpForAssetList(null);
            setSelectedEmpForAsset(emp);
          }}
          onSuccess={onSuccess}
        />
      )}

      {/* MODAL 4: DELETE CONFIRMATION */}
      {empToDelete && (
        <DeleteEmployeeModal
          employee={empToDelete}
          assignedCount={getEmployeeAssets(empToDelete, assets).length}
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

// ----------------- MODAL 3B: VIEW ALL ASSETS HELD BY EMPLOYEE -----------------
export function EmployeeAssetsModal({
  employee,
  assets = [],
  onClose,
  onViewAsset,
  onAssign,
  onTransfer,
  onReturn,
  onAddNewAssign,
}) {
  const parsePeripherals = (asset) => {
    const badges = [];
    if (asset.monitorDetails) {
      badges.push({ name: `Monitor: ${asset.monitorDetails}`, icon: Monitor, color: '#818cf8' });
    }
    if (asset.accessories) {
      const items = asset.accessories.split(',').map((s) => s.trim()).filter(Boolean);
      items.forEach((item) => {
        const lower = item.toLowerCase();
        let icon = Layers;
        let color = '#38bdf8';
        if (lower.includes('keyboard') || lower.includes('mouse') || lower.includes('k/b')) {
          icon = Keyboard;
          color = '#38bdf8';
        } else if (lower.includes('headphone') || lower.includes('headset')) {
          icon = Headphones;
          color = '#ec4899';
        } else if (lower.includes('printer')) {
          icon = Printer;
          color = '#fbbf24';
        } else if (lower.includes('scan')) {
          icon = Scan;
          color = '#34d399';
        } else if (lower.includes('ups') || lower.includes('inverter')) {
          icon = Zap;
          color = '#f87171';
        }
        badges.push({ name: item, icon, color });
      });
    }
    return badges;
  };

  const [modalTab, setModalTab] = useState('hardware');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '880px', width: '95vw', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div className="modal-header" style={{ padding: '1rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-full)',
                background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '1rem',
                boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
                flexShrink: 0,
              }}
            >
              {(employee.name || 'E').charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {employee.name}
                </h3>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    padding: '0.15rem 0.55rem',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(2, 132, 199, 0.12)',
                    color: '#0284c7',
                    border: '1px solid rgba(2, 132, 199, 0.25)',
                  }}
                >
                  ID: {employee.employeeId || 'N/A'}
                </span>
                <span
                  className="badge"
                  style={{
                    fontSize: '0.72rem',
                    backgroundColor: 'var(--status-assigned-bg)',
                    color: 'var(--status-assigned-text)',
                    border: '1px solid var(--status-assigned-border)',
                  }}
                >
                  ● {assets.length} {assets.length === 1 ? 'Hardware Device' : 'Hardware Devices'} Held
                </span>
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {employee.designation ? `${employee.designation} • ` : ''}{employee.department || 'General'} • {employee.location || 'Vitromed'} • {employee.email || 'No email'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => {
                setModalTab('undertaking');
                setTimeout(() => window.print(), 100);
              }}
              className="btn btn-outline btn-xs"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              title="Print official Employee IT Hardware Handover Undertaking"
            >
              <Printer size={13} />
              <span>Print Handover Sheet</span>
            </button>
            <button type="button" onClick={onClose} className="btn btn-ghost btn-icon btn-xs">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* User Profile Sub-Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-default)', padding: '0 1.5rem', gap: '0.5rem', backgroundColor: 'var(--bg-surface-raised)' }}>
          <button
            type="button"
            onClick={() => setModalTab('hardware')}
            style={{
              padding: '0.65rem 1rem',
              border: 'none',
              background: 'none',
              fontSize: '0.82rem',
              fontWeight: modalTab === 'hardware' ? 700 : 500,
              color: modalTab === 'hardware' ? '#0284c7' : 'var(--text-muted)',
              borderBottom: modalTab === 'hardware' ? '2px solid #0284c7' : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            Assigned Hardware ({assets.length})
          </button>
          <button
            type="button"
            onClick={() => setModalTab('software')}
            style={{
              padding: '0.65rem 1rem',
              border: 'none',
              background: 'none',
              fontSize: '0.82rem',
              fontWeight: modalTab === 'software' ? 700 : 500,
              color: modalTab === 'software' ? '#0284c7' : 'var(--text-muted)',
              borderBottom: modalTab === 'software' ? '2px solid #0284c7' : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            Software & Licenses
          </button>
          <button
            type="button"
            onClick={() => setModalTab('undertaking')}
            style={{
              padding: '0.65rem 1rem',
              border: 'none',
              background: 'none',
              fontSize: '0.82rem',
              fontWeight: modalTab === 'undertaking' ? 700 : 500,
              color: modalTab === 'undertaking' ? '#0284c7' : 'var(--text-muted)',
              borderBottom: modalTab === 'undertaking' ? '2px solid #0284c7' : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            Official Handover Undertaking
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div
          className="modal-body"
          style={{
            padding: '1.25rem 1.5rem',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {modalTab === 'hardware' && (
            assets.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '3rem 1.5rem',
                backgroundColor: 'var(--bg-surface-raised, rgba(255,255,255,0.03))',
                borderRadius: '8px',
                border: '1px dashed var(--border-default)',
              }}
            >
              <Laptop size={36} color="var(--text-faint)" style={{ margin: '0 auto 0.75rem' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.35rem' }}>
                No Assets Assigned to this Employee
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 1rem' }}>
                {employee.name} does not currently have any laptops, desktops, or peripherals checked out.
              </p>
              {onAddNewAssign && (
                <button
                  type="button"
                  onClick={onAddNewAssign}
                  className="btn btn-primary btn-sm"
                >
                  <Plus size={14} />
                  + Allocate Hardware Device
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Summary Metrics Bar */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '0.65rem',
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--bg-surface-raised, rgba(255,255,255,0.04))',
                  borderRadius: '8px',
                  border: '1px solid var(--border-default)',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Primary Computers
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {assets.filter((a) => ['Laptop', 'Desktop', 'Workstation', 'All in One Desktop'].includes(a.deviceType)).length}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Monitors & Displays
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#818cf8', marginTop: '2px' }}>
                    {assets.filter((a) => a.deviceType === 'Monitor' || Boolean(a.monitorDetails)).length}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Peripherals Assigned
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#34d399', marginTop: '2px' }}>
                    {assets.reduce((acc, a) => acc + (a.accessories ? a.accessories.split(',').length : 0), 0)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Facility Plant
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>
                    {employee.location || 'Vitromed'}
                  </div>
                </div>
              </div>

              {/* Complete Assets List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {assets.map((asset, idx) => {
                  const peripherals = parsePeripherals(asset);
                  const isLaptop = (asset.deviceType || '').toLowerCase().includes('laptop');
                  const isDesktop = (asset.deviceType || '').toLowerCase().includes('desktop');
                  const isPrinter = (asset.deviceType || '').toLowerCase().includes('printer');
                  const isMonitor = (asset.deviceType || '').toLowerCase().includes('monitor');
                  const Icon = isLaptop ? Laptop : isDesktop ? Monitor : isPrinter ? Printer : isMonitor ? Monitor : Layers;

                  return (
                    <div
                      key={asset._id || idx}
                      style={{
                        backgroundColor: 'var(--bg-surface, #ffffff)',
                        border: '1px solid var(--border-default, #cbd5e1)',
                        borderRadius: '8px',
                        padding: '1rem 1.15rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        transition: 'all 0.15s ease',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      }}
                    >
                      {/* Top Header Strip: Badges & Tags */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '0.2rem 0.6rem',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(2, 132, 199, 0.12)',
                              color: 'var(--color-primary, #0284c7)',
                              border: '1px solid rgba(2, 132, 199, 0.25)',
                            }}
                          >
                            <Icon size={13} />
                            <span>{asset.deviceType || 'Hardware'}</span>
                          </span>

                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontWeight: 800,
                              fontSize: '0.78rem',
                              color: 'var(--text-primary)',
                              backgroundColor: 'var(--bg-surface-raised, rgba(0,0,0,0.04))',
                              padding: '0.2rem 0.55rem',
                              borderRadius: '4px',
                              border: '1px solid var(--border-subtle, #e2e8f0)',
                            }}
                          >
                            Tag: #{asset.assetNo || 'N/A'}
                          </span>

                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              color: 'var(--text-muted)',
                            }}
                          >
                            S/N: <strong>{asset.sr}</strong>
                          </span>
                        </div>

                        <span
                          className="badge"
                          style={{
                            fontSize: '0.7rem',
                            backgroundColor: 'rgba(16, 185, 129, 0.12)',
                            color: '#059669',
                            border: '1px solid rgba(16, 185, 129, 0.25)',
                          }}
                        >
                          ● Active Custody
                        </span>
                      </div>

                      {/* Main Asset Title & Specs */}
                      <div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {asset.make} {asset.model}
                        </div>
                        <div
                          style={{
                            fontSize: '0.78rem',
                            color: 'var(--text-muted)',
                            marginTop: '0.25rem',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.75rem',
                          }}
                        >
                          {asset.processor && (
                            <span>
                              <strong>CPU:</strong> {asset.processor}
                            </span>
                          )}
                          {asset.ramSize && (
                            <span>
                              <strong>RAM:</strong> {asset.ramSize}
                            </span>
                          )}
                          {asset.storage && (
                            <span>
                              <strong>Storage:</strong> {asset.storage}
                            </span>
                          )}
                          {asset.osVersion && (
                            <span>
                              <strong>OS:</strong> {asset.osVersion}
                            </span>
                          )}
                          {asset.hostName && (
                            <span style={{ fontFamily: 'monospace' }}>
                              <strong>Host:</strong> {asset.hostName}
                            </span>
                          )}
                          {asset.ipAddress && (
                            <span style={{ fontFamily: 'monospace', color: '#059669' }}>
                              <strong>IP:</strong> {asset.ipAddress}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Assigned Peripherals & Accessories Chips */}
                      {peripherals.length > 0 && (
                        <div
                          style={{
                            backgroundColor: 'var(--bg-surface-raised, rgba(0,0,0,0.02))',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '6px',
                            border: '1px solid var(--border-subtle, #e2e8f0)',
                          }}
                        >
                          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                            Peripherals & Equipment Assigned with this Machine:
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                            {peripherals.map((p, pIdx) => {
                              const PIcon = p.icon;
                              return (
                                <span
                                  key={pIdx}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                    backgroundColor: 'rgba(2, 132, 199, 0.08)',
                                    color: 'var(--color-primary, #0284c7)',
                                    border: '1px solid rgba(2, 132, 199, 0.2)',
                                    padding: '0.18rem 0.5rem',
                                    borderRadius: '4px',
                                  }}
                                >
                                  <PIcon size={12} color={p.color} />
                                  <span>{p.name}</span>
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Bottom Details & Action Controls */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderTop: '1px solid var(--border-subtle, #e2e8f0)',
                          paddingTop: '0.6rem',
                          flexWrap: 'wrap',
                          gap: '0.5rem',
                        }}
                      >
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>
                          {asset.assignedDate ? (
                            <span>
                              Allocated on: <strong style={{ color: 'var(--text-secondary)' }}>{new Date(asset.assignedDate).toLocaleDateString('en-GB')}</strong>
                            </span>
                          ) : (
                            <span>Allocated without specific timestamp</span>
                          )}
                          {asset.remarks && (
                            <span style={{ marginLeft: '0.5rem', fontStyle: 'italic' }}>
                              • "{asset.remarks}"
                            </span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          {onViewAsset && (
                            <button
                              type="button"
                              onClick={() => onViewAsset(asset)}
                              className="btn btn-primary btn-xs"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                              title="View full 38-column specifications sheet and print handover document"
                            >
                              <Eye size={12} />
                              <span>View Profile / Print</span>
                            </button>
                          )}

                          {onTransfer && (
                            <button
                              type="button"
                              onClick={() => onTransfer(asset)}
                              className="btn btn-outline btn-xs"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                              title="Transfer asset to another custodian"
                            >
                              <ArrowRightLeft size={12} />
                              <span>Transfer</span>
                            </button>
                          )}

                          {onReturn && (
                            <button
                              type="button"
                              onClick={() => onReturn(asset)}
                              className="btn btn-ghost btn-xs"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#f87171' }}
                              title="Return asset back to central stock"
                            >
                              <Undo2 size={12} />
                              <span>Return</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ))}

          {/* TAB 2: SOFTWARE & LICENSES */}
          {modalTab === 'software' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--bg-surface-raised, rgba(0,0,0,0.02))',
                  borderRadius: '8px',
                  border: '1px solid var(--border-default, #e2e8f0)',
                }}
              >
                <div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    Software & Digital Entitlements
                  </h4>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                    Operating systems, productivity licenses, and enterprise access tied to {employee.name}'s hardware.
                  </p>
                </div>
              </div>

              {assets.filter((a) => a.osVersion || a.officeSoftware || a.sapId || a.mailSoftware).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-faint)' }}>
                  No software license keys registered on the assigned machines.
                </div>
              ) : (
                <div className="table-container">
                  <table className="table-modern">
                    <thead>
                      <tr>
                        <th>Machine Tag</th>
                        <th>Operating System</th>
                        <th>OS Key / License</th>
                        <th>Office Software</th>
                        <th>Office Key</th>
                        <th>SAP / ERP ID</th>
                        <th>Mail Software</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assets.map((a, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#0284c7' }}>
                            #{a.assetNo || 'AST'}
                          </td>
                          <td style={{ fontSize: '0.8rem', fontWeight: 600 }}>{a.osVersion || '—'}</td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem' }}>
                            {a.windowsKey ? '••••-••••-••••' : (a.windowsType || 'OEM')}
                          </td>
                          <td style={{ fontSize: '0.8rem' }}>{a.officeSoftware || '—'}</td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem' }}>
                            {a.officeKey ? '••••-••••-••••' : '—'}
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#8b5cf6' }}>
                            {a.sapId || '—'}
                          </td>
                          <td style={{ fontSize: '0.78rem' }}>{a.mailSoftware || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: OFFICIAL HANDOVER UNDERTAKING (A4 PRINTABLE) */}
          {modalTab === 'undertaking' && (
            <div
              style={{
                backgroundColor: '#ffffff',
                color: '#0f172a',
                padding: '2rem 2.25rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}
            >
              {/* Official Letterhead Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0f172a', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
                    Vitromed Healthcare
                  </h2>
                  <div style={{ fontSize: '0.74rem', color: '#475569', fontWeight: 600, marginTop: '2px' }}>
                    IT Infrastructure & Asset Management Division
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '1px' }}>
                    Facility: {employee.location || 'Vitromed Corporate Plant'} • Document Code: VTR/IT/REC/{employee.employeeId || 'GEN'}/{new Date().getFullYear()}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase' }}>
                    Hardware Handover Undertaking
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '2px' }}>
                    Date: <strong>{new Date().toLocaleDateString('en-GB')}</strong>
                  </div>
                </div>
              </div>

              {/* Employee Details Box */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', backgroundColor: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '1.25rem', fontSize: '0.78rem' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Employee Name</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>{employee.name}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Employee Code / ID</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0284c7', fontFamily: 'monospace' }}>{employee.employeeId || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Designation</div>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{employee.designation || 'Staff'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Department</div>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{employee.department || 'General'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Official Email</div>
                  <div style={{ color: '#0f172a' }}>{employee.email || '—'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Mobile Contact</div>
                  <div style={{ color: '#0f172a' }}>{employee.phone || '—'}</div>
                </div>
              </div>

              {/* Hardware Schedule Table */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
                  1. Schedule of Issued IT Assets & Peripherals
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                      <th style={{ padding: '6px 8px', textAlign: 'left', color: '#334155' }}>#</th>
                      <th style={{ padding: '6px 8px', textAlign: 'left', color: '#334155' }}>Asset Tag</th>
                      <th style={{ padding: '6px 8px', textAlign: 'left', color: '#334155' }}>Serial Number</th>
                      <th style={{ padding: '6px 8px', textAlign: 'left', color: '#334155' }}>Machine / Model</th>
                      <th style={{ padding: '6px 8px', textAlign: 'left', color: '#334155' }}>Type</th>
                      <th style={{ padding: '6px 8px', textAlign: 'left', color: '#334155' }}>Accessories & Peripherals</th>
                      <th style={{ padding: '6px 8px', textAlign: 'left', color: '#334155' }}>Condition</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assets.map((a, aIdx) => (
                      <tr key={aIdx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '6px 8px', color: '#64748b' }}>{aIdx + 1}</td>
                        <td style={{ padding: '6px 8px', fontWeight: 800, fontFamily: 'monospace', color: '#0284c7' }}>#{a.assetNo || 'AST'}</td>
                        <td style={{ padding: '6px 8px', fontFamily: 'monospace', color: '#334155' }}>{a.sr || 'N/A'}</td>
                        <td style={{ padding: '6px 8px', fontWeight: 600, color: '#0f172a' }}>{a.make} {a.model}</td>
                        <td style={{ padding: '6px 8px', color: '#475569' }}>{a.deviceType || 'Hardware'}</td>
                        <td style={{ padding: '6px 8px', color: '#475569' }}>{a.accessories || a.monitorDetails || 'Standard peripherals bundle'}</td>
                        <td style={{ padding: '6px 8px', color: '#059669', fontWeight: 600 }}>{a.condition || 'Good / Working'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Terms & Undertaking */}
              <div style={{ backgroundColor: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '1.75rem', fontSize: '0.72rem', color: '#334155', lineHeight: 1.5 }}>
                <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '4px', textTransform: 'uppercase' }}>
                  2. Custodian Declaration & Policy Terms
                </div>
                <p style={{ margin: '0 0 4px' }}>
                  1. I acknowledge receipt of the IT equipment and bundled accessories listed above in good working condition.
                </p>
                <p style={{ margin: '0 0 4px' }}>
                  2. I undertake to utilize this equipment strictly for official company work and adhere to IT security policies.
                </p>
                <p style={{ margin: '0 0 4px' }}>
                  3. I understand that I am responsible for the physical care and reasonable custody of these assets, and will immediately report any loss, damage, or malfunction to the IT department.
                </p>
                <p style={{ margin: 0 }}>
                  4. I agree to return all listed hardware and peripherals in good condition upon reassignment, project conclusion, or separation from employment.
                </p>
              </div>

              {/* Signatures */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #cbd5e1' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ height: '40px', borderBottom: '1px dashed #94a3b8', marginBottom: '6px' }} />
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0f172a' }}>{employee.name}</div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Employee / Custodian Signature</div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ height: '40px', borderBottom: '1px dashed #94a3b8', marginBottom: '6px' }} />
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0f172a' }}>IT Infrastructure Engineer</div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Issued & Verified By</div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ height: '40px', borderBottom: '1px dashed #94a3b8', marginBottom: '6px' }} />
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0f172a' }}>IT Admin / Manager</div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Authorized Approval & Stamp</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className="modal-footer"
          style={{
            padding: '0.85rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {onAddNewAssign ? (
            <button
              type="button"
              onClick={onAddNewAssign}
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Plus size={14} />
              <span>+ Assign Another Asset to {employee.name}</span>
            </button>
          ) : (
            <div />
          )}

          <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
            Close
          </button>
        </div>
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

  // Peripherals Allocation Bundle
  const [deviceType, setDeviceType] = useState('Desktop PC');
  const [accessories, setAccessories] = useState('');
  const [monitorDetails, setMonitorDetails] = useState('');
  const [monitorSerialNo, setMonitorSerialNo] = useState('');
  const [peripheralsList, setPeripheralsList] = useState([]);

  useEffect(() => {
    if (selectedAsset) {
      setDeviceType(selectedAsset.deviceType || 'Desktop PC');
      setAccessories(selectedAsset.accessories || '');
      setMonitorDetails(selectedAsset.monitorDetails || '');
      setMonitorSerialNo(selectedAsset.monitorSerialNo || '');
      setPeripheralsList(selectedAsset.peripheralsList || []);
    }
  }, [selectedAsset]);

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
        deviceType,
        accessories,
        monitorDetails,
        monitorSerialNo,
        peripheralsList,
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
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px', width: '95vw' }}>
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
                  All hardware systems are currently assigned or in maintenance. Inward a new asset or check in returned equipment first.
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
                        {a.assetNo ? `#${a.assetNo} - ` : ''}{a.sr} • {a.make} {a.model} ({a.deviceType}) • {a.processor || 'CPU'} • {a.plant}
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

                {/* Peripherals Allocation Bundle */}
                <HardwareAllocationSelector
                  deviceType={deviceType}
                  onDeviceTypeChange={setDeviceType}
                  accessories={accessories}
                  onAccessoriesChange={setAccessories}
                  monitorDetails={monitorDetails}
                  onMonitorDetailsChange={setMonitorDetails}
                  monitorSerialNo={monitorSerialNo}
                  onMonitorSerialNoChange={setMonitorSerialNo}
                  peripheralsList={peripheralsList}
                  onPeripheralsListChange={setPeripheralsList}
                  compact={false}
                  title="Workstation Peripherals & Equipment Allocated to this Employee"
                />

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
