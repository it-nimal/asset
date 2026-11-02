import mongoose from 'mongoose';

export const SYSTEM_MODULES = [
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

export const PERMISSION_ACTIONS = [
  'VIEW',
  'CREATE',
  'UPDATE',
  'DELETE',
  'EXPORT',
  'IMPORT',
  'APPROVE',
  'MANAGE',
];

export const DEFAULT_ROLE_PERMISSIONS = {
  'Super Admin': SYSTEM_MODULES.reduce((acc, mod) => {
    acc[mod] = [...PERMISSION_ACTIONS];
    return acc;
  }, {}),

  Admin: {
    Dashboard: ['VIEW', 'MANAGE'],
    Employees: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'IMPORT'],
    'Employee Directory': ['VIEW', 'EXPORT'],
    'Employee Profile': ['VIEW', 'UPDATE'],
    'Asset Master': ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'IMPORT'],
    'Add New Asset': ['VIEW', 'CREATE'],
    'Asset Allocation': ['VIEW', 'CREATE', 'UPDATE', 'APPROVE', 'MANAGE'],
    'Asset Return': ['VIEW', 'CREATE', 'UPDATE', 'APPROVE', 'MANAGE'],
    'Asset Transfer': ['VIEW', 'CREATE', 'UPDATE', 'APPROVE', 'MANAGE'],
    Inventory: ['VIEW', 'CREATE', 'UPDATE', 'EXPORT', 'MANAGE'],
    'Inward Register': ['VIEW', 'CREATE', 'UPDATE', 'APPROVE', 'MANAGE'],
    Vendors: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT'],
    'Purchase Orders': ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT'],
    Invoices: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT'],
    Maintenance: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'MANAGE'],
    'Software and Licenses': ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'MANAGE'],
    'User Management': ['VIEW', 'CREATE', 'UPDATE'], // Handled at controller level: normal users only
    'Audit Trail': ['VIEW'],
    Reports: ['VIEW', 'EXPORT'],
    'System Settings': ['VIEW'],
  },

  User: {
    Dashboard: ['VIEW'],
    Employees: [],
    'Employee Directory': [],
    'Employee Profile': ['VIEW', 'UPDATE'],
    'Asset Master': ['VIEW'],
    'Add New Asset': [],
    'Asset Allocation': ['VIEW', 'APPROVE'],
    'Asset Return': ['VIEW'],
    'Asset Transfer': ['VIEW', 'APPROVE'],
    Inventory: ['VIEW'],
    'Inward Register': [],
    Vendors: [],
    'Purchase Orders': [],
    Invoices: [],
    Maintenance: ['VIEW', 'CREATE'],
    'Software and Licenses': [],
    'User Management': [],
    'Audit Trail': ['VIEW'], // Restricted to own user activity
    Reports: [],
    'System Settings': [],
  },
};

const rolePermissionSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      unique: true,
      enum: ['Super Admin', 'Admin', 'User'],
      trim: true,
    },
    // Map of Module Name -> Array of Actions
    permissions: {
      type: Map,
      of: [String],
      required: true,
    },
    description: { type: String, trim: true },
    updatedBy: { type: String, trim: true },
  },
  { timestamps: true }
);

export const RolePermission =
  mongoose.models.RolePermission || mongoose.model('RolePermission', rolePermissionSchema);
export default RolePermission;
