import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building2,
  MapPin,
  Layers,
  Tag,
  Shield,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Sliders,
  Cpu,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../common/Toast';

export default function SettingsView({ onRefreshMaster }) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('plants'); // 'plants', 'departments', 'categories', 'makes', 'statuses', 'roles'
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Settings State
  const [plants, setPlants] = useState([
    { name: 'Vitromed', code: 'VIT', address: '22 Godam Industrial Area, Jaipur' },
    { name: 'JPPL', code: 'JPL', address: 'Jaipur Poly Plast, Sitapura' },
    { name: 'Avacara', code: 'AVC', address: 'Avacara Health, Mahindra World City' },
  ]);

  const [departments, setDepartments] = useState([
    { name: 'Vitromed Baisgodam 3rd Floor', code: 'V3F' },
    { name: 'Vitromed Baisgodam 2nd Floor', code: 'V2F' },
    { name: 'Vitromed Baisgodam 1st Floor', code: 'V1F' },
    { name: 'Accounts', code: 'ACC' },
    { name: 'Production', code: 'PROD' },
    { name: 'Quality Lab', code: 'QC' },
    { name: 'HR', code: 'HR' },
    { name: 'IT', code: 'IT' },
    { name: 'Admin', code: 'ADM' },
    { name: 'Purchase', code: 'PUR' },
    { name: 'Store (Main Store)', code: 'STR' },
    { name: 'Maintenance', code: 'MNT' },
  ]);

  const [categories, setCategories] = useState([
    { name: 'Laptop', group: 'Computing', description: 'Portable notebooks & ultrabooks' },
    { name: 'Desktop', group: 'Computing', description: 'Workstations & towers' },
    { name: 'All in One Desktop', group: 'Computing', description: 'Integrated display desktop PC' },
    { name: 'Server', group: 'Infrastructure', description: 'Rackmount & blade hosts' },
    { name: 'Monitor', group: 'Displays', description: 'Standalone desktop LCD/LED displays' },
    { name: 'Network Switch', group: 'Network', description: 'Managed L2/L3 access switches' },
    { name: 'Router / Firewall', group: 'Network', description: 'Core gateway & UTM appliances' },
    { name: 'Access Point', group: 'Network', description: 'Enterprise Wi-Fi APs' },
    { name: 'Printer / MFD', group: 'Peripherals', description: 'Laser printers & copiers' },
    { name: 'UPS / Inverter', group: 'Power', description: 'Central & rack power backup' },
    { name: 'Tablet / Mobile', group: 'Mobile', description: 'Field iPads & company smartphones' },
  ]);

  const [makes, setMakes] = useState([
    'HP',
    'Dell',
    'Lenovo',
    'Apple',
    'Acer',
    'Asus',
    'Cisco',
    'D-Link',
    'TP-Link',
    'Fortinet',
    'Canon',
    'Epson',
    'APC / Schneider',
    'Microtek',
    'Luminous',
    'Samsung',
    'LG',
  ]);

  const [statuses, setStatuses] = useState([
    { name: 'Available', color: '#10b981', description: 'In stock ready for deployment' },
    { name: 'Assigned', color: '#0284c7', description: 'Allocated to active employee' },
    { name: 'Reserved', color: '#8b5cf6', description: 'Reserved for upcoming project/joiner' },
    { name: 'Under Maintenance', color: '#f59e0b', description: 'Sent for hardware repair' },
    { name: 'Under QC', color: '#06b6d4', description: 'Quality inspection testing' },
    { name: 'Damaged', color: '#ef4444', description: 'Physical damage reported' },
    { name: 'Retired', color: '#64748b', description: 'End of lifecycle decommission' },
    { name: 'Disposed', color: '#475569', description: 'Safely scrapped or recycled' },
  ]);

  // Form Inputs for Adding Items
  const [newPlant, setNewPlant] = useState({ name: '', code: '', address: '' });
  const [newDept, setNewDept] = useState({ name: '', code: '' });
  const [newCat, setNewCat] = useState({ name: '', group: 'Computing', description: '' });
  const [newMake, setNewMake] = useState('');

  // Fetch Master Settings
  const loadSettings = async () => {
    setLoading(true);
    try {
      if (api.getMasterSettings) {
        const data = await api.getMasterSettings();
        if (data.plants && data.plants.length > 0) setPlants(data.plants);
        if (data.departments && data.departments.length > 0) setDepartments(data.departments);
        if (data.statuses && data.statuses.length > 0) setStatuses(data.statuses);
        if (data.categories && data.categories.length > 0) setCategories(data.categories);
        if (data.makes && data.makes.length > 0) setMakes(data.makes);
      }
    } catch (err) {
      console.warn('Using default master settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // Save Settings to Backend
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const payload = {
        plants,
        departments,
        statuses,
        categories,
        makes,
      };
      if (api.updateMasterSettings) {
        await api.updateMasterSettings(payload);
      }
      toast.success('Master configuration updated and persisted across the application!');
      if (onRefreshMaster) onRefreshMaster();
    } catch (err) {
      toast.error(err.message, 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  // Add Handlers
  const handleAddPlant = (e) => {
    e.preventDefault();
    if (!newPlant.name.trim()) return;
    setPlants([...plants, { ...newPlant }]);
    setNewPlant({ name: '', code: '', address: '' });
    toast.success(`Added plant "${newPlant.name}" (Click Save Changes to persist)`);
  };

  const handleAddDept = (e) => {
    e.preventDefault();
    if (!newDept.name.trim()) return;
    setDepartments([...departments, { ...newDept }]);
    setNewDept({ name: '', code: '' });
    toast.success(`Added department "${newDept.name}"`);
  };

  const handleAddCat = (e) => {
    e.preventDefault();
    if (!newCat.name.trim()) return;
    setCategories([...categories, { ...newCat }]);
    setNewCat({ name: '', group: 'Computing', description: '' });
    toast.success(`Added category "${newCat.name}"`);
  };

  const handleAddMake = (e) => {
    e.preventDefault();
    if (!newMake.trim()) return;
    if (makes.includes(newMake.trim())) return toast.warning('Brand already exists in list');
    setMakes([...makes, newMake.trim()]);
    setNewMake('');
    toast.success(`Added manufacturer "${newMake.trim()}"`);
  };

  return (
    <div className="page-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem 2rem 4rem' }}>
      {/* Header */}
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
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Enterprise Master Data & Dropdown Settings
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Configure corporate plants, business departments, hardware makes, device categories, and asset statuses.
          </p>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={handleSaveAll}
          className="btn btn-primary btn-sm"
          style={{ minWidth: '130px' }}
        >
          {saving ? (
            <>
              <RefreshCw size={14} className="spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save size={14} />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      {/* Tabs Row */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-default)',
          marginBottom: '1.5rem',
          gap: '0.5rem',
          overflowX: 'auto',
        }}
      >
        {[
          { id: 'plants', label: 'Plants & Facilities', icon: Building2, count: plants.length },
          { id: 'departments', label: 'Departments', icon: MapPin, count: departments.length },
          { id: 'categories', label: 'Asset Categories', icon: Layers, count: categories.length },
          { id: 'makes', label: 'Manufacturers & Brands', icon: Cpu, count: makes.length },
          { id: 'statuses', label: 'Asset Statuses', icon: Tag, count: statuses.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.15rem',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '0.84rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#38bdf8' : 'var(--text-muted)',
                borderBottom: isActive ? '2px solid #38bdf8' : '2px solid transparent',
                marginBottom: '-1px',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: '0.68rem',
                  padding: '0.1rem 0.45rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: isActive ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  color: isActive ? '#38bdf8' : 'var(--text-faint)',
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PLANTS */}
      {activeTab === 'plants' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '1.5rem', alignItems: 'flex-start' }}>
          {/* Add Plant Card */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.85rem' }}>
              Add New Facility / Plant
            </h3>
            <form onSubmit={handleAddPlant} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label className="form-label">Plant / Facility Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vitromed Plant 2"
                  value={newPlant.name}
                  onChange={(e) => setNewPlant({ ...newPlant, name: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="form-label">Plant Code / Acronym</label>
                <input
                  type="text"
                  placeholder="e.g. VP2"
                  value={newPlant.code}
                  onChange={(e) => setNewPlant({ ...newPlant, code: e.target.value.toUpperCase() })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="form-label">Physical Address</label>
                <textarea
                  rows={2}
                  placeholder="Full location address"
                  value={newPlant.address}
                  onChange={(e) => setNewPlant({ ...newPlant, address: e.target.value })}
                  className="input-field"
                />
              </div>
              <button type="submit" className="btn btn-primary btn-sm" style={{ marginTop: '0.25rem' }}>
                <Plus size={14} />
                <span>Add Plant</span>
              </button>
            </form>
          </div>

          {/* Plant List */}
          <div className="table-container">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Plant Name</th>
                  <th>Code</th>
                  <th>Address</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {plants.map((p, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>{p.code || '—'}</td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{p.address || '—'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setPlants(plants.filter((_, i) => i !== idx));
                          toast.info(`Removed plant "${p.name}"`);
                        }}
                        className="btn btn-ghost btn-xs"
                        style={{ color: '#f87171' }}
                        title="Delete Plant"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DEPARTMENTS */}
      {activeTab === 'departments' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '1.5rem', alignItems: 'flex-start' }}>
          {/* Add Dept Card */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.85rem' }}>
              Add New Department
            </h3>
            <form onSubmit={handleAddDept} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label className="form-label">Department Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Research & Development"
                  value={newDept.name}
                  onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="form-label">Department Code</label>
                <input
                  type="text"
                  placeholder="e.g. RND"
                  value={newDept.code}
                  onChange={(e) => setNewDept({ ...newDept, code: e.target.value.toUpperCase() })}
                  className="input-field"
                />
              </div>
              <button type="submit" className="btn btn-primary btn-sm" style={{ marginTop: '0.25rem' }}>
                <Plus size={14} />
                <span>Add Department</span>
              </button>
            </form>
          </div>

          {/* Department List */}
          <div className="table-container">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Department Name</th>
                  <th>Code</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((d, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{d.name}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>{d.code || '—'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setDepartments(departments.filter((_, i) => i !== idx));
                          toast.info(`Removed department "${d.name}"`);
                        }}
                        className="btn btn-ghost btn-xs"
                        style={{ color: '#f87171' }}
                        title="Delete Department"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CATEGORIES */}
      {activeTab === 'categories' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: '1.5rem', alignItems: 'flex-start' }}>
          {/* Add Category Card */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.85rem' }}>
              Add Asset Category
            </h3>
            <form onSubmit={handleAddCat} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label className="form-label">Category / Type Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Workstation"
                  value={newCat.name}
                  onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="form-label">Family / Group</label>
                <select
                  value={newCat.group}
                  onChange={(e) => setNewCat({ ...newCat, group: e.target.value })}
                  className="input-field"
                >
                  <option value="Computing">Computing</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Network">Network</option>
                  <option value="Displays">Displays</option>
                  <option value="Peripherals">Peripherals</option>
                  <option value="Power">Power</option>
                  <option value="Mobile">Mobile</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="form-label">Description</label>
                <input
                  type="text"
                  placeholder="Short description"
                  value={newCat.description}
                  onChange={(e) => setNewCat({ ...newCat, description: e.target.value })}
                  className="input-field"
                />
              </div>
              <button type="submit" className="btn btn-primary btn-sm" style={{ marginTop: '0.25rem' }}>
                <Plus size={14} />
                <span>Add Category</span>
              </button>
            </form>
          </div>

          {/* Category List */}
          <div className="table-container">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Group</th>
                  <th>Description</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          padding: '0.12rem 0.45rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'rgba(56, 189, 248, 0.1)',
                          color: '#38bdf8',
                        }}
                      >
                        {c.group || 'General'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{c.description || '—'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setCategories(categories.filter((_, i) => i !== idx));
                          toast.info(`Removed category "${c.name}"`);
                        }}
                        className="btn btn-ghost btn-xs"
                        style={{ color: '#f87171' }}
                        title="Delete Category"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: MAKES & MANUFACTURERS */}
      {activeTab === 'makes' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: '1.5rem', alignItems: 'flex-start' }}>
          {/* Add Make Card */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.85rem' }}>
              Add Manufacturer / Brand
            </h3>
            <form onSubmit={handleAddMake} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label className="form-label">Brand / OEM Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Logitech"
                  value={newMake}
                  onChange={(e) => setNewMake(e.target.value)}
                  className="input-field"
                />
              </div>
              <button type="submit" className="btn btn-primary btn-sm" style={{ marginTop: '0.25rem' }}>
                <Plus size={14} />
                <span>Add Brand</span>
              </button>
            </form>
          </div>

          {/* Makes Pill Grid */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Registered Hardware Brands ({makes.length})
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {makes.map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-surface-raised)',
                    border: '1px solid var(--border-default)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                  }}
                >
                  <span>{m}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setMakes(makes.filter((_, i) => i !== idx));
                      toast.info(`Removed brand "${m}"`);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-faint)',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title="Remove Brand"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: STATUSES */}
      {activeTab === 'statuses' && (
        <div className="table-container">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Lifecycle Status</th>
                <th>Color Indicator</th>
                <th>Operational Description</th>
              </tr>
            </thead>
            <tbody>
              {statuses.map((st, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        fontSize: '0.78rem',
                        padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: `${st.color}15`,
                        color: st.color,
                      }}
                    >
                      <span
                        style={{
                          width: '7px',
                          height: '7px',
                          borderRadius: '50%',
                          backgroundColor: st.color,
                        }}
                      />
                      {st.name}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: st.color }}>
                    {st.color}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {st.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
