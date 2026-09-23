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
  Plus,
  Edit3,
  Trash2,
  X,
  IdCard,
  Filter,
  LayoutGrid,
  List,
  Upload,
  Eye,
} from 'lucide-react';
import { COMPANY_DEPARTMENTS } from '../../constants/organization';
import BulkAddEmployeesModal from './BulkAddEmployeesModal';
import EmployeeProfileModal from './EmployeeProfileModal';
import DepartmentListTab from './DepartmentListTab';
import LocationListTab from './LocationListTab';
import VendorListTab from './VendorListTab';
import { AssignEmployeeIdModal, AddEmployeeModal, DeleteEmployeeModal } from './EmployeeModals';

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

    // 1. Match by Employee Code / ID
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

    // 3. Match by Name
    if (empName && aUser) {
      if (aUser === empName) return true;
      if (normEmpName && normEmpName === aUser.replace(/[^a-z0-9]/g, '')) return true;

      const parts = aUser.split(/[\/,;&+]+/).map((p) => p.trim());
      for (const part of parts) {
        if (!part) continue;
        if (part === empName) return true;
        const normPart = part.replace(/[^a-z0-9]/g, '');
        if (normEmpName && normPart && normEmpName === normPart) return true;

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
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    if (globalSearch !== undefined) setSearchTerm(globalSearch);
  }, [globalSearch]);

  // Modals state
  const [selectedEmpForId, setSelectedEmpForId] = useState(null);
  const [selectedEmpForAssetList, setSelectedEmpForAssetList] = useState(null);
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [showBulkAddModal, setShowBulkAddModal] = useState(Boolean(initialOpenBulkModal));
  const [empToDelete, setEmpToDelete] = useState(null);

  useEffect(() => {
    if (initialOpenBulkModal) setShowBulkAddModal(true);
  }, [initialOpenBulkModal]);

  // Filtered employees list
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
        empAssets.some((a) =>
          (a.assetNo || '').toLowerCase().includes(q) ||
          (a.sr || '').toLowerCase().includes(q) ||
          (a.make || '').toLowerCase().includes(q) ||
          (a.model || '').toLowerCase().includes(q)
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

  const totalEmployees = employees.length;
  const withHardwareCount = useMemo(() => employees.filter((e) => getEmployeeAssets(e, assets).length > 0).length, [employees, assets]);
  const withIdCount = useMemo(() => employees.filter((e) => Boolean(e.employeeId && e.employeeId.trim())).length, [employees]);

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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Employees Directory</h1>
                <span className="badge badge-info">{totalEmployees} Staff Members</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.35rem', marginBottom: 0 }}>
                Manage staff identification IDs, custodian profiles, and hardware assignments.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button type="button" onClick={() => setShowBulkAddModal(true)} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Upload size={15} /> <span>+ Bulk Add Users</span>
              </button>
              <button type="button" onClick={() => setShowAddEmpModal(true)} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Plus size={16} /> <span>+ Add Single Employee</span>
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="card" style={{ padding: '0.9rem 1.15rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '6px', backgroundColor: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Staff</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{totalEmployees}</div>
              </div>
            </div>

            <div className="card" style={{ padding: '0.9rem 1.15rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '6px', backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IdCard size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>IDs Assigned</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8' }}>{withIdCount} / {totalEmployees}</div>
              </div>
            </div>

            <div className="card" style={{ padding: '0.9rem 1.15rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '6px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Laptop size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Hardware Custody</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}>{withHardwareCount} Staff</div>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="card" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1 1 260px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
              <input
                type="text"
                placeholder="Search staff by name, employee ID, email, designation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '2rem', height: '36px', fontSize: '0.82rem' }}
              />
              {searchTerm && (
                <button type="button" onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer' }}>
                  <X size={14} />
                </button>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className="form-select" style={{ height: '36px', fontSize: '0.8rem' }}>
                <option value="All">All Departments ({deptList.length})</option>
                {deptList.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>

              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="form-select" style={{ height: '36px', fontSize: '0.8rem' }}>
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Resigned">Resigned</option>
              </select>

              <select value={fleetFilter} onChange={(e) => setFleetFilter(e.target.value)} className="form-select" style={{ height: '36px', fontSize: '0.8rem' }}>
                <option value="All">All Hardware</option>
                <option value="With Hardware">With Hardware ({withHardwareCount})</option>
                <option value="No Hardware">No Hardware ({totalEmployees - withHardwareCount})</option>
              </select>

              <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-surface-raised)', padding: '2px', borderRadius: '6px', border: '1px solid var(--border-default)' }}>
                <button type="button" onClick={() => setViewMode('grid')} className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '0.35rem 0.65rem' }}>
                  <LayoutGrid size={14} /> Cards
                </button>
                <button type="button" onClick={() => setViewMode('table')} className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '0.35rem 0.65rem' }}>
                  <List size={14} /> Table
                </button>
              </div>
            </div>
          </div>

          {/* Employee Directory Display */}
          {viewMode === 'grid' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {filteredEmployees.map((emp) => {
                const assignedAssets = getEmployeeAssets(emp, assets);
                const assignedCount = assignedAssets.length;
                return (
                  <div key={emp._id || emp.employeeId} className="card card-hoverable" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>
                            {(emp.name || 'E').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{emp.name}</h3>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{emp.designation || 'Staff'} • {emp.department}</div>
                          </div>
                        </div>
                        <span className={`badge ${emp.status === 'Active' ? 'badge-available' : 'badge-maintenance'}`}>{emp.status || 'Active'}</span>
                      </div>

                      <div style={{ marginTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><IdCard size={13} /> ID: <strong style={{ color: 'var(--text-primary)' }}>{emp.employeeId || 'N/A'}</strong></div>
                        {emp.email && <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Mail size={13} /> {emp.email}</div>}
                        {emp.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Phone size={13} /> {emp.phone}</div>}
                      </div>

                      <div style={{ marginTop: '0.85rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Assigned Devices:</span>
                        <span className="badge badge-info">{assignedCount} Devices</span>
                      </div>
                    </div>

                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.45rem' }}>
                      <button type="button" onClick={() => setSelectedEmpForAssetList(emp)} className="btn btn-outline btn-xs" style={{ flex: 1 }}>
                        <Eye size={13} /> View Profile
                      </button>
                      <button type="button" onClick={() => setSelectedEmpForId(emp)} className="btn btn-ghost btn-icon btn-xs" title="Edit Profile">
                        <Edit3 size={14} />
                      </button>
                      <button type="button" onClick={() => setEmpToDelete(emp)} className="btn btn-ghost btn-icon btn-xs" style={{ color: '#ef4444' }} title="Delete Employee">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="card" style={{ overflow: 'hidden' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Staff Name</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Hardware</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((emp) => {
                    const assignedAssets = getEmployeeAssets(emp, assets);
                    return (
                      <tr key={emp._id || emp.employeeId}>
                        <td><strong style={{ fontFamily: 'monospace' }}>{emp.employeeId || 'N/A'}</strong></td>
                        <td><strong>{emp.name}</strong></td>
                        <td>{emp.department}</td>
                        <td>{emp.designation || 'Staff'}</td>
                        <td>{emp.email || '—'}</td>
                        <td><span className={`badge ${emp.status === 'Active' ? 'badge-available' : 'badge-maintenance'}`}>{emp.status || 'Active'}</span></td>
                        <td><span className="badge badge-info">{assignedAssets.length} Devices</span></td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                            <button type="button" onClick={() => setSelectedEmpForAssetList(emp)} className="btn btn-ghost btn-icon btn-xs" title="View Profile"><Eye size={14} /></button>
                            <button type="button" onClick={() => setSelectedEmpForId(emp)} className="btn btn-ghost btn-icon btn-xs" title="Edit"><Edit3 size={14} /></button>
                            <button type="button" onClick={() => setEmpToDelete(emp)} className="btn btn-ghost btn-icon btn-xs" style={{ color: '#ef4444' }} title="Delete"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 2. DEPARTMENTS TAB */}
      {type === 'departments' && (
        <DepartmentListTab departments={departments} employees={employees} assets={assets} onSuccess={onSuccess} />
      )}

      {/* 3. LOCATIONS TAB */}
      {type === 'locations' && (
        <LocationListTab locations={locations} assets={assets} onSuccess={onSuccess} />
      )}

      {/* 4. VENDORS TAB */}
      {type === 'vendors' && (
        <VendorListTab vendors={vendors} assets={assets} onSuccess={onSuccess} />
      )}

      {/* MODALS */}
      {selectedEmpForId && (
        <AssignEmployeeIdModal employee={selectedEmpForId} departments={departments} locations={locations} onClose={() => setSelectedEmpForId(null)} onSuccess={onSuccess} />
      )}

      {showAddEmpModal && (
        <AddEmployeeModal departments={departments} locations={locations} employees={employees} onClose={() => setShowAddEmpModal(false)} onSuccess={onSuccess} />
      )}

      {showBulkAddModal && (
        <BulkAddEmployeesModal departments={departments} locations={locations} employees={employees} onClose={() => setShowBulkAddModal(false)} onSuccess={onSuccess} />
      )}

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
          onSuccess={onSuccess}
        />
      )}

      {empToDelete && (
        <DeleteEmployeeModal employee={empToDelete} assignedCount={getEmployeeAssets(empToDelete, assets).length} onClose={() => setEmpToDelete(null)} onSuccess={onSuccess} />
      )}
    </div>
  );
}
