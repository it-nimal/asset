import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Shield,
  X,
  Save,
  Check,
  RotateCcw,
  Info,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../common/Toast';

const MODULES_LIST = [
  'Dashboard',
  'Employees',
  'Employee Directory',
  'Employee Profile',
  'Asset Master',
  'Add New Asset',
  'Asset Allocation',
  'Asset Return',
  'Asset Transfer',
  'Inventory',
  'Inward Register',
  'Vendors',
  'Purchase Orders',
  'Invoices',
  'Maintenance',
  'Software and Licenses',
  'User Management',
  'Audit Trail',
  'Reports',
  'System Settings',
];

const ACTIONS_LIST = [
  'VIEW',
  'CREATE',
  'UPDATE',
  'DELETE',
  'EXPORT',
  'IMPORT',
  'APPROVE',
  'MANAGE',
];

export default function PermissionOverrideModal({ user, onClose, onSuccess }) {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [permissions, setPermissions] = useState({});

  useEffect(() => {
    const fetchPerms = async () => {
      setLoading(true);
      try {
        const res = await api.getUserPermissions(user._id || user.id);
        if (res && res.data) {
          const effective = res.data.effective || {};
          const overrides = res.data.overrides || {};
          // Start with effective permissions so the UI reflects current capabilities
          const initial = {};
          MODULES_LIST.forEach((mod) => {
            initial[mod] = Array.isArray(overrides[mod]) ? [...overrides[mod]] : Array.isArray(effective[mod]) ? [...effective[mod]] : [];
          });
          setPermissions(initial);
        }
      } catch (err) {
        toast.error('Failed to load user permissions: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchPerms();
    }
  }, [user]);

  const toggleAction = (mod, action) => {
    setPermissions((prev) => {
      const current = prev[mod] || [];
      let updated;
      if (current.includes(action)) {
        updated = current.filter((a) => a !== action);
      } else {
        updated = [...current, action];
      }
      return { ...prev, [mod]: updated };
    });
  };

  const toggleAllForModule = (mod) => {
    setPermissions((prev) => {
      const current = prev[mod] || [];
      const hasAll = ACTIONS_LIST.every((a) => current.includes(a));
      return {
        ...prev,
        [mod]: hasAll ? [] : [...ACTIONS_LIST],
      };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateUserPermissions(user._id || user.id, permissions);
      toast.success(`Permission overrides saved for ${user.name}!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '960px', width: '95vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ padding: '0.45rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Permission Overrides: {user.name}
              </h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Role: <strong>{user.canonicalRole || user.role}</strong> • Email: {user.email}
              </div>
            </div>
          </div>
          <button type="button" className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--bg-surface-raised)', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          <Info size={15} color="#38bdf8" />
          <span>
            Configure granular module and action permissions. User-level overrides take precedence over the base role template.
          </span>
        </div>

        <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              Loading user permissions matrix...
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%', fontSize: '0.78rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-surface-raised)' }}>
                    <th style={{ textAlign: 'left', padding: '0.75rem', width: '220px' }}>Module Name</th>
                    {ACTIONS_LIST.map((action) => (
                      <th key={action} style={{ textAlign: 'center', padding: '0.5rem 0.35rem', fontSize: '0.7rem' }}>
                        {action}
                      </th>
                    ))}
                    <th style={{ textAlign: 'center', padding: '0.5rem' }}>Full Mod</th>
                  </tr>
                </thead>
                <tbody>
                  {MODULES_LIST.map((mod) => {
                    const activeActions = permissions[mod] || [];
                    const hasAll = ACTIONS_LIST.every((a) => activeActions.includes(a));
                    return (
                      <tr key={mod} style={{ borderBottom: '1px solid var(--border-default)' }}>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)', padding: '0.65rem 0.75rem' }}>
                          {mod}
                        </td>
                        {ACTIONS_LIST.map((action) => {
                          const isChecked = activeActions.includes(action) || activeActions.includes('MANAGE');
                          return (
                            <td key={action} style={{ textAlign: 'center', padding: '0.5rem 0.25rem' }}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleAction(mod, action)}
                                style={{ cursor: 'pointer', width: '15px', height: '15px', accentColor: 'var(--primary)' }}
                              />
                            </td>
                          );
                        })}
                        <td style={{ textAlign: 'center', padding: '0.5rem' }}>
                          <button
                            type="button"
                            className="btn btn-ghost btn-xs"
                            onClick={() => toggleAllForModule(mod)}
                            style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem' }}
                          >
                            {hasAll ? 'Clear' : 'All'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ borderTop: '1px solid var(--border-default)', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Changes will create a permanent audit log entry and take effect immediately.
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={saving || loading}
              onClick={handleSave}
              style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
            >
              <Save size={15} />
              {saving ? 'Saving...' : 'Save Permission Overrides'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
