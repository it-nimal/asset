import React, { useState } from 'react';
import { Building2, Plus, Edit3, Trash2, Users, Layers } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../common/Toast';

export default function DepartmentListTab({ departments = [], employees = [], assets = [], onSuccess }) {
  const toast = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [deptToEdit, setDeptToEdit] = useState(null);
  const [deptToDelete, setDeptToDelete] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    code: '',
    manager: '',
    location: 'Vitromed',
  });

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) {
      toast.error('Department name and code are required');
      return;
    }
    setLoading(true);
    try {
      if (deptToEdit) {
        await api.updateDepartment(deptToEdit._id, form);
        toast.success('Department updated successfully');
      } else {
        await api.createDepartment(form);
        toast.success('Department created successfully');
      }
      setShowAddModal(false);
      setDeptToEdit(null);
      setForm({ name: '', code: '', manager: '', location: 'Vitromed' });
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err.message || 'Failed to save department');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await api.deleteDepartment(id);
      toast.success('Department removed successfully');
      setDeptToDelete(null);
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err.message || 'Failed to delete department');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Departments Directory
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem', marginBottom: 0 }}>
            Configure organizational divisions, department managers, and location sites.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setDeptToEdit(null);
            setForm({ name: '', code: '', manager: '', location: 'Vitromed' });
            setShowAddModal(true);
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
        >
          <Plus size={16} />
          <span>Add Department</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {departments.map((dept) => {
          const deptEmps = employees.filter((e) => e.department === dept.name);
          const deptAssets = assets.filter((a) => a.department === dept.name);

          return (
            <div key={dept._id || dept.code} className="card card-hoverable" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(99, 102, 241, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#6366f1',
                    }}
                  >
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                      {dept.name}
                    </h3>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Code: {dept.code}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button
                    type="button"
                    className="btn btn-icon btn-ghost"
                    onClick={() => {
                      setDeptToEdit(dept);
                      setForm({
                        name: dept.name,
                        code: dept.code,
                        manager: dept.manager || '',
                        location: dept.location || 'Vitromed',
                      });
                      setShowAddModal(true);
                    }}
                    title="Edit Department"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-icon btn-ghost"
                    onClick={() => setDeptToDelete(dept)}
                    title="Delete Department"
                    style={{ color: '#ef4444' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ backgroundColor: 'var(--bg-surface-raised)', padding: '0.65rem', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Staff Members</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{deptEmps.length}</div>
                </div>
                <div style={{ backgroundColor: 'var(--bg-surface-raised)', padding: '0.65rem', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Assigned Assets</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0284c7' }}>{deptAssets.length}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3>{deptToEdit ? 'Edit Department' : 'Add New Department'}</h3>
              <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateOrUpdate} style={{ padding: '1.25rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Department Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Information Technology"
                  required
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Department Code *</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="e.g. IT"
                  required
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Department Manager</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.manager}
                  onChange={(e) => setForm({ ...form, manager: e.target.value })}
                  placeholder="e.g. John Doe"
                />
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Plant / Location</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Vitromed"
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : deptToEdit ? 'Update Department' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
