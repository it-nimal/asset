import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  UserCheck,
  UserX,
  Search,
  Filter,
  RefreshCw,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Mail,
  Building,
  Key,
  X,
  Clock,
  Globe,
  Activity,
  SlidersHorizontal,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import { formatDateTimeIST } from '../../utils/date';
import PermissionOverrideModal from './PermissionOverrideModal';
import UserActivityModal from './UserActivityModal';

export default function UserManagement() {
  const { user: currentUser, isSuperAdmin, isAdmin } = useAuth();
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [selectedUserForPermissions, setSelectedUserForPermissions] = useState(null);
  const [selectedUserForActivity, setSelectedUserForActivity] = useState(null);
  const [selectedUserForResetPassword, setSelectedUserForResetPassword] = useState(null);
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form State for Create User
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'User',
    department: 'IT Infrastructure',
  });

  // Form State for Edit User
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'User',
    department: '',
    password: '',
    active: true,
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.getUsers();
      const list = res?.data || (Array.isArray(res) ? res : []);
      setUsers(list);
    } catch (err) {
      toast.error(err.message || 'Failed to load user list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Compute counts
  const totalUsers = users.length;
  const superAdminCount = users.filter((u) => u.canonicalRole === 'Super Admin' || u.role === 'Super Admin').length;
  const adminCount = users.filter((u) => u.canonicalRole === 'Admin' || u.role === 'Admin' || u.role === 'IT Admin').length;
  const regularUserCount = users.filter((u) => (u.canonicalRole || u.role) === 'User' || u.role === 'Employee').length;
  const activeCount = users.filter((u) => u.active !== false).length;

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const role = u.canonicalRole || u.role;
    const matchesSearch =
      !searchTerm ||
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      roleFilter === 'All' ||
      role === roleFilter ||
      (roleFilter === 'Admin' && (u.role === 'Admin' || u.role === 'IT Admin'));

    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Active' && u.active !== false) ||
      (statusFilter === 'Inactive' && u.active === false);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (roleName) => {
    const r = roleName === 'Super Admin' ? 'Super Admin' : (roleName === 'Admin' || roleName === 'IT Admin' ? 'Admin' : 'User');
    if (r === 'Super Admin') {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.25rem 0.65rem',
            borderRadius: '9999px',
            fontSize: '0.72rem',
            fontWeight: 700,
            background: 'rgba(139, 92, 246, 0.15)',
            color: '#a78bfa',
            border: '1px solid rgba(139, 92, 246, 0.3)',
          }}
        >
          <ShieldCheck size={12} />
          Super Admin
        </span>
      );
    }
    if (r === 'Admin') {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.25rem 0.65rem',
            borderRadius: '9999px',
            fontSize: '0.72rem',
            fontWeight: 700,
            background: 'rgba(14, 165, 233, 0.15)',
            color: '#38bdf8',
            border: '1px solid rgba(14, 165, 233, 0.3)',
          }}
        >
          <Shield size={12} />
          Admin
        </span>
      );
    }
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0.25rem 0.65rem',
          borderRadius: '9999px',
          fontSize: '0.72rem',
          fontWeight: 700,
          background: 'rgba(100, 116, 139, 0.15)',
          color: '#94a3b8',
          border: '1px solid rgba(100, 116, 139, 0.3)',
        }}
      >
        <Users size={12} />
        User
      </span>
    );
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.name || !createForm.email || !createForm.password) {
      return toast.error('Please fill in all required fields');
    }

    if (!isSuperAdmin && createForm.role !== 'User') {
      return toast.error('Administrators can only create normal User accounts.');
    }

    setSubmitting(true);
    try {
      await api.createUser(createForm);
      toast.success(`User "${createForm.name}" created successfully!`);
      setShowCreateModal(false);
      setCreateForm({
        name: '',
        email: '',
        password: '',
        role: 'User',
        department: 'IT Infrastructure',
      });
      await loadUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (targetUser) => {
    if (!isSuperAdmin && (targetUser.canonicalRole === 'Super Admin' || targetUser.canonicalRole === 'Admin')) {
      return toast.error('Forbidden: You can only edit normal User accounts.');
    }

    setEditingUser(targetUser);
    setEditForm({
      name: targetUser.name || '',
      email: targetUser.email || '',
      role: targetUser.canonicalRole || targetUser.role || 'User',
      department: targetUser.department || 'IT Infrastructure',
      password: '',
      active: targetUser.active !== false,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    if (!isSuperAdmin && editForm.role !== 'User') {
      return toast.error('Administrators cannot elevate accounts to Admin or Super Admin.');
    }

    setSubmitting(true);
    try {
      const payload = { ...editForm };
      if (!payload.password.trim()) {
        delete payload.password;
      }
      await api.updateUser(editingUser._id || editingUser.id, payload);
      toast.success(`User profile for "${payload.name}" updated!`);
      setEditingUser(null);
      await loadUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to update user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (targetUser) => {
    if (!isSuperAdmin && (targetUser.canonicalRole === 'Super Admin' || targetUser.canonicalRole === 'Admin')) {
      return toast.error('Forbidden: You cannot modify Super Admin or Admin accounts.');
    }

    const newActiveState = targetUser.active === false;
    const isDemotingSuper = targetUser.role === 'Super Admin' && !newActiveState;

    if (isDemotingSuper && superAdminCount <= 1) {
      return toast.error('Security Protection: Cannot deactivate the last active Super Admin in the system.');
    }

    if (String(targetUser._id || targetUser.id) === String(currentUser?._id || currentUser?.id) && !newActiveState) {
      return toast.error('Security Protection: You cannot deactivate your own logged-in account.');
    }

    try {
      await api.updateUser(targetUser._id || targetUser.id, { active: newActiveState });
      toast.success(`Account for "${targetUser.name}" ${newActiveState ? 'activated' : 'deactivated'}.`);
      await loadUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to change status');
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserForResetPassword || !resetNewPassword || resetNewPassword.length < 6) {
      return toast.error('New password must be at least 6 characters long.');
    }

    setSubmitting(true);
    try {
      await api.resetPassword(selectedUserForResetPassword._id || selectedUserForResetPassword.id, resetNewPassword);
      toast.success(`Password for ${selectedUserForResetPassword.name} reset successfully!`);
      setSelectedUserForResetPassword(null);
      setResetNewPassword('');
    } catch (err) {
      toast.error(err.message || 'Failed to reset password');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    if (!isSuperAdmin) {
      return toast.error('Forbidden: Only Super Administrators can delete user accounts.');
    }

    if (deletingUser.role === 'Super Admin' && superAdminCount <= 1) {
      setDeletingUser(null);
      return toast.error('Security Protection: Cannot delete the last active Super Admin.');
    }

    if (String(deletingUser._id || deletingUser.id) === String(currentUser?._id || currentUser?.id)) {
      setDeletingUser(null);
      return toast.error('Security Protection: You cannot delete your own logged-in account.');
    }

    setSubmitting(true);
    try {
      await api.deleteUser(deletingUser._id || deletingUser.id);
      toast.success(`User account "${deletingUser.name}" deleted.`);
      setDeletingUser(null);
      await loadUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to delete user');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1.5rem 2rem 4rem' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.45rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
            }}
          >
            <ShieldCheck size={24} style={{ color: '#8b5cf6' }} />
            Enterprise Role & User Access Management
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Manage staff authentication, assign enterprise roles, configure module permission overrides, and inspect audit activity.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            type="button"
            onClick={loadUsers}
            disabled={loading}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          {(isSuperAdmin || isAdmin) && (
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary btn-sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
                border: 'none',
              }}
            >
              <UserPlus size={14} />
              <span>Create New User</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>TOTAL USERS</span>
            <Users size={16} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.4rem' }}>
            {totalUsers}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>All registered credentials</div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '3px solid #8b5cf6' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>SUPER ADMINS</span>
            <ShieldCheck size={16} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#8b5cf6', marginTop: '0.4rem' }}>
            {superAdminCount}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Full system ownership</div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '3px solid #0ea5e9' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>ADMINISTRATORS</span>
            <Shield size={16} color="#0ea5e9" />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0ea5e9', marginTop: '0.4rem' }}>
            {adminCount}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Hardware & operations ops</div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '3px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>ACTIVE ACCOUNTS</span>
            <CheckCircle2 size={16} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#10b981', marginTop: '0.4rem' }}>
            {activeCount}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            {regularUserCount} standard staff users
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder="Search by name, email, username or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem 0.5rem 2.25rem',
              backgroundColor: 'var(--bg-surface-raised)',
              border: '1px solid var(--border-default)',
              borderRadius: '6px',
              fontSize: '0.85rem',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                padding: '0.45rem 0.75rem',
                backgroundColor: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-default)',
                borderRadius: '6px',
                fontSize: '0.8rem',
                color: 'var(--text-primary)',
              }}
            >
              <option value="All">All Roles</option>
              <option value="Super Admin">Super Admin</option>
              <option value="Admin">Admin</option>
              <option value="User">User</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '0.45rem 0.75rem',
                backgroundColor: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-default)',
                borderRadius: '6px',
                fontSize: '0.8rem',
                color: 'var(--text-primary)',
              }}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Deactivated Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid var(--border-default)',
                  backgroundColor: 'var(--bg-surface-raised)',
                  color: 'var(--text-muted)',
                  fontSize: '0.72rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                <th style={{ padding: '0.85rem 1rem' }}>User / Credentials</th>
                <th style={{ padding: '0.85rem 1rem' }}>Assigned Role</th>
                <th style={{ padding: '0.85rem 1rem' }}>Department</th>
                <th style={{ padding: '0.85rem 1rem' }}>Account Status</th>
                <th style={{ padding: '0.85rem 1rem' }}>Last Login / Origin IP</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Users size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                    <div style={{ fontWeight: 600 }}>No users found matching current filters.</div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isCurrent = String(u._id || u.id) === String(currentUser?._id || currentUser?.id);
                  const isActive = u.active !== false;
                  const displayRole = u.canonicalRole || u.role;
                  const isTargetSuper = displayRole === 'Super Admin';
                  const isTargetAdmin = displayRole === 'Admin';
                  const canEditThis = isSuperAdmin || (!isTargetSuper && !isTargetAdmin);

                  return (
                    <tr
                      key={u._id || u.id}
                      style={{
                        borderBottom: '1px solid var(--border-default)',
                        backgroundColor: !isActive ? 'rgba(239, 68, 68, 0.04)' : undefined,
                        opacity: !isActive ? 0.75 : 1,
                      }}
                    >
                      {/* Name & Email */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--bg-surface-raised)',
                              border: '1px solid var(--border-default)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              color: 'var(--text-primary)',
                              fontSize: '0.8rem',
                            }}
                          >
                            {(u.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                              {u.name}
                              {isCurrent && (
                                <span
                                  style={{
                                    marginLeft: '0.4rem',
                                    fontSize: '0.68rem',
                                    padding: '0.1rem 0.4rem',
                                    borderRadius: '4px',
                                    background: 'rgba(56, 189, 248, 0.15)',
                                    color: '#38bdf8',
                                  }}
                                >
                                  You
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {u.email} {u.username ? `(@${u.username})` : ''}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td style={{ padding: '0.85rem 1rem' }}>{getRoleBadge(displayRole)}</td>

                      {/* Department */}
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                        {u.department || 'IT Infrastructure'}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        {isActive ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              color: '#10b981',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                            }}
                          >
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                            Active
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              color: '#ef4444',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                            }}
                          >
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                            Deactivated
                          </span>
                        )}
                      </td>

                      {/* Last Login & IP */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-primary)' }}>
                          {u.lastLogin ? formatDateTimeIST(u.lastLogin) : 'Not logged in recently'}
                        </div>
                        {u.lastLoginIp && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                            <Globe size={11} />
                            <span>{u.lastLoginIp}</span>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
                          {/* Activity History Button */}
                          <button
                            type="button"
                            onClick={() => setSelectedUserForActivity(u)}
                            title="View Audit Activity History"
                            style={{
                              padding: '0.35rem 0.5rem',
                              borderRadius: '5px',
                              border: '1px solid var(--border-default)',
                              backgroundColor: 'var(--bg-surface-raised)',
                              color: '#38bdf8',
                              cursor: 'pointer',
                            }}
                          >
                            <Activity size={13} />
                          </button>

                          {/* Super Admin Permissions Override Button */}
                          {isSuperAdmin && (
                            <button
                              type="button"
                              onClick={() => setSelectedUserForPermissions(u)}
                              title="Configure Granular Permission Overrides"
                              style={{
                                padding: '0.35rem 0.5rem',
                                borderRadius: '5px',
                                border: '1px solid var(--border-default)',
                                backgroundColor: 'var(--bg-surface-raised)',
                                color: '#a855f7',
                                cursor: 'pointer',
                              }}
                            >
                              <SlidersHorizontal size={13} />
                            </button>
                          )}

                          {/* Reset Password Button */}
                          {canEditThis && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedUserForResetPassword(u);
                                setResetNewPassword('');
                              }}
                              title="Reset Password"
                              style={{
                                padding: '0.35rem 0.5rem',
                                borderRadius: '5px',
                                border: '1px solid var(--border-default)',
                                backgroundColor: 'var(--bg-surface-raised)',
                                color: '#f59e0b',
                                cursor: 'pointer',
                              }}
                            >
                              <Key size={13} />
                            </button>
                          )}

                          {/* Activate / Deactivate Toggle Button */}
                          {canEditThis && !isCurrent && (
                            <button
                              type="button"
                              onClick={() => handleToggleActive(u)}
                              title={isActive ? 'Deactivate Account' : 'Activate Account'}
                              style={{
                                padding: '0.35rem 0.5rem',
                                borderRadius: '5px',
                                border: '1px solid var(--border-default)',
                                backgroundColor: 'var(--bg-surface-raised)',
                                color: isActive ? '#ea580c' : '#10b981',
                                cursor: 'pointer',
                              }}
                            >
                              {isActive ? <UserX size={13} /> : <UserCheck size={13} />}
                            </button>
                          )}

                          {/* Edit User Button */}
                          {canEditThis && (
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(u)}
                              title="Edit User Profile"
                              style={{
                                padding: '0.35rem 0.5rem',
                                borderRadius: '5px',
                                border: '1px solid var(--border-default)',
                                backgroundColor: 'var(--bg-surface-raised)',
                                color: '#0ea5e9',
                                cursor: 'pointer',
                              }}
                            >
                              <Edit2 size={13} />
                            </button>
                          )}

                          {/* Delete Account (Super Admin only) */}
                          {isSuperAdmin && !isCurrent && (
                            <button
                              type="button"
                              onClick={() => setDeletingUser(u)}
                              title="Delete Account"
                              style={{
                                padding: '0.35rem 0.5rem',
                                borderRadius: '5px',
                                border: '1px solid var(--border-default)',
                                backgroundColor: 'var(--bg-surface-raised)',
                                color: '#ef4444',
                                cursor: 'pointer',
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
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

      {/* CREATE USER MODAL */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Create New System User
              </h2>
              <button type="button" className="btn btn-ghost btn-icon" onClick={() => setShowCreateModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Rahul Sharma"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    required
                    className="form-control"
                    placeholder="name@vitromed.com"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Initial Password *</label>
                  <input
                    type="password"
                    required
                    className="form-control"
                    placeholder="Min 6 characters"
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div className="form-group">
                    <label className="form-label">Role Assignment *</label>
                    <select
                      className="form-control"
                      value={createForm.role}
                      onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                    >
                      <option value="User">User (Self-service only)</option>
                      {isSuperAdmin && <option value="Admin">Admin (Asset & Ops control)</option>}
                      {isSuperAdmin && <option value="Super Admin">Super Admin (Full privileges)</option>}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. IT, Operations"
                      value={createForm.department}
                      onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="modal-backdrop" onClick={() => setEditingUser(null)}>
          <div className="modal-content" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Edit User: {editingUser.name}
              </h2>
              <button type="button" className="btn btn-ghost btn-icon" onClick={() => setEditingUser(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    required
                    className="form-control"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <select
                      className="form-control"
                      value={editForm.role}
                      disabled={!isSuperAdmin}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    >
                      <option value="User">User</option>
                      {isSuperAdmin && <option value="Admin">Admin</option>}
                      {isSuperAdmin && <option value="Super Admin">Super Admin</option>}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.department}
                      onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">New Password (leave blank to keep current)</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter new password"
                    value={editForm.password}
                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditingUser(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {selectedUserForResetPassword && (
        <div className="modal-backdrop" onClick={() => setSelectedUserForResetPassword(null)}>
          <div className="modal-content" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                Reset Password: {selectedUserForResetPassword.name}
              </h3>
              <button type="button" className="btn btn-ghost btn-icon" onClick={() => setSelectedUserForResetPassword(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleResetPasswordSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                  This will immediately reset the user's login password and record a security event in the Audit Trail.
                </p>
                <div className="form-group">
                  <label className="form-label">New Password (min 6 characters) *</label>
                  <input
                    type="password"
                    required
                    className="form-control"
                    placeholder="Enter new secure password"
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedUserForResetPassword(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                  {submitting ? 'Resetting...' : 'Confirm Password Reset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingUser && (
        <div className="modal-backdrop" onClick={() => setDeletingUser(null)}>
          <div className="modal-content" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ef4444', margin: 0 }}>
                Confirm Account Deletion
              </h3>
              <button type="button" className="btn btn-ghost btn-icon" onClick={() => setDeletingUser(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                Are you sure you want to permanently delete the user account for <strong>{deletingUser.name}</strong> ({deletingUser.email})?
                This action cannot be undone and will be permanently recorded in the Audit Trail.
              </p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setDeletingUser(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-sm"
                style={{ backgroundColor: '#ef4444', color: '#ffffff', border: 'none' }}
                disabled={submitting}
                onClick={handleDeleteUser}
              >
                {submitting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PERMISSION OVERRIDES MODAL */}
      {selectedUserForPermissions && (
        <PermissionOverrideModal
          user={selectedUserForPermissions}
          onClose={() => setSelectedUserForPermissions(null)}
          onSuccess={loadUsers}
        />
      )}

      {/* USER ACTIVITY HISTORY MODAL */}
      {selectedUserForActivity && (
        <UserActivityModal
          user={selectedUserForActivity}
          onClose={() => setSelectedUserForActivity(null)}
        />
      )}
    </div>
  );
}
