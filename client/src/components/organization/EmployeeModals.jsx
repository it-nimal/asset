import React, { useState } from 'react';
import { IdCard, Users, Trash2, X, Sparkles, ShieldCheck, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../common/Toast';
import { useAuth } from '../../context/AuthContext';
import { COMPANY_DEPARTMENTS } from '../../constants/organization';

// ----------------- MODAL 1: ASSIGN / EDIT EMPLOYEE ID -----------------
export function AssignEmployeeIdModal({ employee, departments = [], locations = [], onClose, onSuccess }) {
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
    if (!formData.employeeId.trim()) return toast.error('Employee ID is required', 'Missing ID');
    if (!formData.name.trim()) return toast.error('Employee Name is required', 'Missing Name');

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
            <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IdCard size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Assign & Update Employee ID</h3>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: 0 }}>Set official personnel identification code and sync records.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-icon btn-xs"><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Official Employee ID Code <span style={{ color: '#f87171' }}>*</span></span>
                <button type="button" onClick={handleGenerateId} style={{ background: 'none', border: 'none', color: '#818cf8', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Sparkles size={11} /> ⚡ Auto-Generate ID
                </button>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. VIT-1045"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="form-control"
                style={{ fontWeight: 700, fontFamily: 'monospace' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="form-control" />
              </div>
              <div className="form-group">
                <label className="form-label">Designation</label>
                <input type="text" value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} className="form-control" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="form-control" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="form-control" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Department</label>
                <select value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="form-select">
                  {COMPANY_DEPARTMENTS.map((dept) => <option key={dept} value={dept}>{dept}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <select value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="form-select">
                  <option value="Vitromed">Vitromed</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="form-select">
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Resigned">Resigned</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm" disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>{loading ? 'Saving...' : 'Save Employee Profile'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ----------------- MODAL 2: ADD NEW EMPLOYEE -----------------
export function AddEmployeeModal({ departments = [], locations = [], employees = [], onClose, onSuccess }) {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

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
    if (!formData.name.trim() || !formData.employeeId.trim()) {
      return toast.error('Name and Employee ID are required');
    }
    setLoading(true);
    try {
      await api.createEmployee({
        ...formData,
        actorName: user?.name || 'IT Admin',
      });
      toast.success(`Employee "${formData.name}" added successfully!`);
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
            <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(79, 70, 229, 0.15)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Register New Employee</h3>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: 0 }}>Enroll staff member and assign official ID.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-icon btn-xs"><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Assigned Employee ID *</label>
              <input type="text" required value={formData.employeeId} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} className="form-control" style={{ fontWeight: 700, fontFamily: 'monospace' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="form-control" />
              </div>
              <div className="form-group">
                <label className="form-label">Designation</label>
                <input type="text" value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} className="form-control" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="form-control" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="form-control" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Department</label>
                <select value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="form-select">
                  {COMPANY_DEPARTMENTS.map((dept) => <option key={dept} value={dept}>{dept}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <select value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="form-select">
                  <option value="Vitromed">Vitromed</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm" disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>{loading ? 'Registering...' : '+ Register Employee'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ----------------- MODAL 3: DELETE EMPLOYEE CONFIRMATION -----------------
export function DeleteEmployeeModal({ employee, assignedCount = 0, onClose, onSuccess }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.deleteEmployee(employee._id);
      toast.success(`Employee "${employee.name}" removed successfully.`);
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444' }}>
            <Trash2 size={18} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Delete Employee</h3>
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-icon btn-xs"><X size={16} /></button>
        </div>
        <div className="modal-body" style={{ padding: '1.25rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            Are you sure you want to delete <strong>{employee.name}</strong> ({employee.employeeId || 'No ID'})?
          </p>
          {assignedCount > 0 && (
            <div style={{ marginTop: '0.85rem', padding: '0.65rem 0.85rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px', fontSize: '0.78rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={15} />
              <span>This employee currently holds <strong>{assignedCount} assigned hardware device(s)</strong>.</span>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn btn-secondary btn-sm" disabled={loading}>Cancel</button>
          <button type="button" onClick={handleDelete} className="btn btn-danger btn-sm" disabled={loading}>{loading ? 'Deleting...' : 'Delete Employee'}</button>
        </div>
      </div>
    </div>
  );
}
