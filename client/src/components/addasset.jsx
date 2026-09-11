import React, { useState, useRef, useMemo } from 'react';
import {
  Upload,
  FileText,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Plus,
  ShieldCheck,
  Building2,
  Layers,
  Laptop,
  Server,
  Network,
  Printer,
  Monitor,
  Smartphone,
  Zap,
  Package,
  Sparkles,
  Calendar,
  MapPin,
  User,
  DollarSign,
  X,
  Tag,
  Cpu,
  HardDrive,
  Activity,
  Check,
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from './common/Toast';
import { useAuth } from '../context/AuthContext';
import { COMPANY_DEPARTMENTS, COMPANY_PLANTS } from '../constants/organization';

// ASSET CATEGORIES CONFIGURATION
const ASSET_CATEGORIES = [
  {
    id: 'computing',
    name: 'Computers & Laptops',
    icon: Laptop,
    badgeColor: '#818cf8',
    defaultType: 'Laptop',
    types: ['Laptop', 'Desktop', 'All in One Desktop', 'Workstation'],
    popularMakes: ['Dell', 'HP', 'Lenovo', 'Apple', 'Asus', 'Acer', 'Other'],
  },
  {
    id: 'servers',
    name: 'Enterprise Servers',
    icon: Server,
    badgeColor: '#38bdf8',
    defaultType: 'Server',
    types: ['Server', 'Storage Server / NAS', 'Blade Server'],
    popularMakes: ['Dell PowerEdge', 'HPE ProLiant', 'Lenovo ThinkSystem', 'Supermicro', 'Cisco UCS', 'Other'],
  },
  {
    id: 'network',
    name: 'Network Infrastructure',
    icon: Network,
    badgeColor: '#34d399',
    defaultType: 'Network Switch',
    types: ['Network Switch', 'Router / Gateway', 'Firewall', 'Wireless Access Point'],
    popularMakes: ['Cisco', 'Aruba / HPE', 'TP-Link Omada', 'Ubiquiti UniFi', 'Fortinet', 'Sophos', 'MikroTik', 'Other'],
  },
  {
    id: 'printers',
    name: 'Printers & Imaging',
    icon: Printer,
    badgeColor: '#fbbf24',
    defaultType: 'Printer',
    types: ['Printer', 'Scanner', 'Multi-Function Copier', 'Barcode / Label Printer'],
    popularMakes: ['HP LaserJet', 'Canon', 'Epson', 'Brother', 'Zebra', 'TVS Electronics', 'Other'],
  },
  {
    id: 'displays',
    name: 'Monitors & Displays',
    icon: Monitor,
    badgeColor: '#c084fc',
    defaultType: 'Monitor',
    types: ['Monitor', 'Interactive Display / Signage'],
    popularMakes: ['Dell', 'HP', 'Samsung', 'LG', 'ViewSonic', 'BenQ', 'Acer', 'Other'],
  },
  {
    id: 'mobile',
    name: 'Mobile & Handhelds',
    icon: Smartphone,
    badgeColor: '#f472b6',
    defaultType: 'Tablet',
    types: ['Tablet', 'Smartphone', 'Barcode Terminal / PDA'],
    popularMakes: ['Samsung Galaxy', 'Apple iPad', 'Zebra', 'Honeywell', 'Lenovo Tab', 'Other'],
  },
  {
    id: 'power',
    name: 'Power & Infrastructure',
    icon: Zap,
    badgeColor: '#f87171',
    defaultType: 'UPS / Inverter',
    types: ['UPS / Inverter', 'PDU / Power Distribution', 'Biometric Attendance Device'],
    popularMakes: ['APC / Schneider', 'Microtek', 'Luminous', 'Eaton', 'eSSL / ZKTeco', 'Other'],
  },
  {
    id: 'other',
    name: 'Other Hardware',
    icon: Package,
    badgeColor: '#94a3b8',
    defaultType: 'Other',
    types: ['Other', 'Projector', 'Webcam / Conference System', 'External Storage / Backup Drive'],
    popularMakes: ['Logitech', 'Sony', 'Seagate', 'Western Digital', 'Other'],
  },
];

export default function Addasset({
  onAssetCreated,
  dbConnected = true,
  employees = [],
  departments = [],
  locations = [],
  vendors = [],
  assets = [],
}) {
  const { user } = useAuth();
  const toast = useToast();

  // Active Category selection
  const [activeCategory, setActiveCategory] = useState('computing');

  // Auto calculate next sequential Asset Tag (AST-VIT-XXXX)
  const calculateNextAssetTag = () => {
    let maxNum = 124;
    assets.forEach((a) => {
      const match = (a.assetNo || '').match(/AST-VIT-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    });
    return `AST-VIT-${String(maxNum + 1).padStart(4, '0')}`;
  };

  const currentCategory = useMemo(() => {
    return ASSET_CATEGORIES.find((c) => c.id === activeCategory) || ASSET_CATEGORIES[0];
  }, [activeCategory]);

  const [formData, setFormData] = useState({
    // Core Identity
    assetNo: calculateNextAssetTag(),
    deviceType: 'Laptop',
    make: 'Dell',
    customMake: '',
    model: '',
    sr: '',
    plant: 'Vitromed',
    floorCabin: 'Main Floor',

    // Custody & Status
    status: 'Available', // Available | Assigned | Under Maintenance
    workingCondition: 'Good',
    custodianMode: 'select', // select | manual
    selectedEmpId: '',
    userName: 'Unassigned',
    empCode: '',
    mailId: '',
    department: COMPANY_DEPARTMENTS[0] || 'Vitromed Baisgodam 3rd Floor',

    // Technical Specs - Computing
    processor: 'Intel Core i5',
    ramSize: '16 GB',
    storage: '512 GB SSD',
    osVersion: 'Windows 11 Pro',
    windowsKey: '',
    officeSoftware: 'MS Office 2021',
    officeKey: '',
    antivirus: 'QuickHeal Endpoint',
    monitorDetails: '',
    monitorSerialNo: '',

    // Technical Specs - Server & Infrastructure
    serverCpu: '2x Intel Xeon Silver 4310 24-Core',
    serverRam: '64 GB ECC DDR4',
    serverRaid: '4x 2TB SAS 12G RAID 5',
    serverOs: 'VMware ESXi 8.0',
    managementIp: '',
    rackLocation: 'Rack-01',
    uPosition: 'U12-U14',

    // Technical Specs - Network
    portConfig: '24-Port Gigabit PoE+ (370W) with 4x 10G SFP+',
    networkRole: 'Access Layer Switch',
    firmwareVersion: 'v17.6.4',

    // Technical Specs - Printers & Peripherals
    printTechnology: 'Monochrome Laser Network MFP',
    connectivity: 'Ethernet LAN + USB 3.0',
    tonerCartridge: 'HP 88A / Canon 057',

    // Technical Specs - Monitors & Displays
    screenSize: '24 Inch (60.9 cm)',
    resolution: '1920 x 1080 Full HD (1080p)',
    panelType: 'IPS Anti-Glare, 75Hz',
    videoPorts: 'HDMI 1.4, DisplayPort 1.2, VGA',

    // Technical Specs - Mobile & Tablets
    imeiNumber: '',
    mobileOs: 'Android 14 (Enterprise Managed)',

    // Network Identity
    hostName: '',
    ipAddress: '',
    macAddress: '',
    vncPassword: '',

    // Procurement & Billing
    billNo: '',
    vendorName: vendors[0]?.name || 'Authorized OEM Distributor',
    purchasePrice: '',
    currentValue: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    deliveryDate: new Date().toISOString().split('T')[0],
    warrantyDetails: '3 Years Comprehensive On-Site OEM',
    warrantyStartDate: new Date().toISOString().split('T')[0],
    warrantyEndDate: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    invoiceImage: '',
    remarks: '',
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  // Switch category
  const handleCategorySelect = (category) => {
    setActiveCategory(category.id);
    setFormData((prev) => ({
      ...prev,
      deviceType: category.defaultType,
      make: category.popularMakes[0] || 'Generic',
      customMake: '',
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // When custodian employee is selected in 'Assigned' mode
  const handleEmployeeSelect = (empId) => {
    const emp = employees.find((e) => e.employeeId === empId || e._id === empId);
    if (emp) {
      setFormData((prev) => ({
        ...prev,
        selectedEmpId: emp.employeeId,
        userName: emp.name,
        empCode: emp.employeeId,
        mailId: emp.email || `${emp.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@vitromed.com`,
        department: emp.department || prev.department,
        plant: emp.location || prev.plant,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        selectedEmpId: '',
        userName: 'Unassigned',
        empCode: '',
        mailId: '',
      }));
    }
  };

  // Image / PDF Attachment Handler
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast.error('Please upload a valid image (JPG, PNG) or PDF document');
      return;
    }

    const maxSize = file.type === 'application/pdf' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`File exceeds size limit (${file.type === 'application/pdf' ? '10MB' : '5MB'}).`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result;
      setImagePreview(base64Data);
      setFormData((prev) => ({
        ...prev,
        invoiceImage: base64Data,
      }));
      toast.info('Invoice document attached');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData((prev) => ({
      ...prev,
      invoiceImage: '',
    }));
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast.info('Invoice document detached');
  };

  // Generate Next Asset Tag
  const handleRegenerateTag = () => {
    setFormData((prev) => ({ ...prev, assetNo: calculateNextAssetTag() }));
    toast.success('Generated sequential asset tag', 'Tag Created');
  };

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.sr.trim()) {
      return toast.error('Serial Number (S/N) is required', 'Missing Serial Number');
    }
    if (!formData.model.trim()) {
      return toast.error('Model Name / Series is required', 'Missing Model');
    }

    setSubmitting(true);
    const finalMake = formData.make === 'Other' ? formData.customMake : formData.make;

    // Build payload according to selected asset type
    const payload = {
      ...formData,
      make: finalMake || 'Generic',
      purchasePrice: formData.purchasePrice ? Number(formData.purchasePrice) : 0,
      currentValue: formData.currentValue ? Number(formData.currentValue) : Number(formData.purchasePrice || 0),
      actorName: user?.name || 'IT Admin',
    };

    // Synthesize specialized specifications into core model fields for cross-compatibility
    if (activeCategory === 'servers') {
      payload.processor = formData.serverCpu;
      payload.ramSize = formData.serverRam;
      payload.storage = formData.serverRaid;
      payload.osVersion = formData.serverOs;
      payload.remarks = `[Server] Rack: ${formData.rackLocation}, Pos: ${formData.uPosition}. Mgmt IP: ${formData.managementIp}. ${formData.remarks}`;
    } else if (activeCategory === 'network') {
      payload.storage = formData.portConfig;
      payload.processor = formData.networkRole;
      payload.osVersion = formData.firmwareVersion;
      payload.remarks = `[Network Device] Rack: ${formData.rackLocation}, Pos: ${formData.uPosition}. ${formData.remarks}`;
    } else if (activeCategory === 'printers') {
      payload.processor = formData.printTechnology;
      payload.storage = formData.tonerCartridge;
      payload.osVersion = formData.connectivity;
    } else if (activeCategory === 'displays') {
      payload.processor = `${formData.screenSize} • ${formData.panelType}`;
      payload.storage = formData.resolution;
      payload.monitorDetails = `${finalMake} ${formData.model} (${formData.screenSize})`;
      payload.monitorSerialNo = formData.sr;
    } else if (activeCategory === 'mobile') {
      payload.processor = formData.mobileOs;
      payload.storage = formData.screenSize;
      payload.remarks = `[Mobile] IMEI: ${formData.imeiNumber}. ${formData.remarks}`;
    }

    try {
      const result = await api.createAsset(payload);

      if (result.success) {
        toast.success(
          `Asset "${finalMake} ${formData.model}" (Tag: ${payload.assetNo || payload.sr}) inwarded successfully!`,
          'Asset Inwarded'
        );

        if (onAssetCreated) onAssetCreated();
      }
    } catch (err) {
      toast.error(err.message, 'Inwarding Failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '1.5rem auto 4rem', padding: '0 1.5rem' }}>
      {/* Header & Title */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
            Inward New Hardware Asset
          </h1>
          <span
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '0.2rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.76rem',
              fontWeight: 700,
            }}
          >
            Multi-Category Inward Form
          </span>
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.35rem', marginBottom: 0 }}>
          Select asset type to activate tailored hardware specifications, OEM warranty verification, and stock provisioning.
        </p>
      </div>

      {/* 1. ASSET CATEGORY SELECTOR CARDS (CORE USER REQUEST) */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Select Asset Category:
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '0.75rem',
          }}
        >
          {ASSET_CATEGORIES.map((cat) => {
            const IconComp = cat.icon;
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategorySelect(cat)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.9rem 0.6rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.14)' : 'var(--bg-surface)',
                  border: isSelected ? '2px solid #6366f1' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 4px 14px rgba(99, 102, 241, 0.25)' : 'none',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                    color: isSelected ? '#a5b4fc' : cat.badgeColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconComp size={18} />
                </div>
                <span
                  style={{
                    fontSize: '0.76rem',
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)',
                    lineHeight: 1.2,
                  }}
                >
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Inward Form & Live Preview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '1.75rem', alignItems: 'start' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* SECTION 1: CORE HARDWARE IDENTIFICATION */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers size={16} color="#818cf8" />
                <span style={{ fontWeight: 700, fontSize: '0.94rem' }}>1. Hardware Identification & Location</span>
              </div>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: currentCategory.badgeColor,
                  backgroundColor: `${currentCategory.badgeColor}18`,
                  border: `1px solid ${currentCategory.badgeColor}33`,
                  padding: '0.15rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                Category: {currentCategory.name}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              {/* Asset Tag / Asset No with Auto-Gen */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Asset Tag / Inventory Code</span>
                  <button
                    type="button"
                    onClick={handleRegenerateTag}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#818cf8',
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                      padding: 0,
                    }}
                  >
                    <Sparkles size={11} />
                    Auto-Generate
                  </button>
                </label>
                <div style={{ position: 'relative' }}>
                  <Tag size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
                  <input
                    type="text"
                    name="assetNo"
                    value={formData.assetNo}
                    onChange={handleChange}
                    className="form-control"
                    style={{ paddingLeft: '2rem', fontFamily: 'monospace', fontWeight: 700, color: '#38bdf8' }}
                  />
                </div>
              </div>

              {/* Specific Subtype */}
              <div className="form-group">
                <label className="form-label">
                  Device Sub-Type <span style={{ color: '#f87171' }}>*</span>
                </label>
                <select
                  name="deviceType"
                  value={formData.deviceType}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  {currentCategory.types.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Manufacturer / Make */}
              <div className="form-group">
                <label className="form-label">
                  Manufacturer (Make) <span style={{ color: '#f87171' }}>*</span>
                </label>
                <select
                  name="make"
                  value={formData.make}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  {currentCategory.popularMakes.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {formData.make === 'Other' && (
                <div className="form-group">
                  <label className="form-label">
                    Specify Custom Make <span style={{ color: '#f87171' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="customMake"
                    placeholder="e.g. Ubiquiti, Supermicro, Barcode Systems"
                    value={formData.customMake}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>
              )}

              {/* Model Name */}
              <div className="form-group">
                <label className="form-label">
                  Model Name / Series <span style={{ color: '#f87171' }}>*</span>
                </label>
                <input
                  type="text"
                  name="model"
                  placeholder={
                    activeCategory === 'computing'
                      ? 'e.g. Latitude 5430, OptiPlex 7090'
                      : activeCategory === 'servers'
                      ? 'e.g. PowerEdge R750xs, DL380 Gen10'
                      : activeCategory === 'network'
                      ? 'e.g. Catalyst 2960X-24PS-L, UniFi Pro 24'
                      : activeCategory === 'printers'
                      ? 'e.g. LaserJet Pro M404dn, ZT230'
                      : 'e.g. UltraSharp U2422H, Galaxy Tab S9'
                  }
                  value={formData.model}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              {/* Serial Number */}
              <div className="form-group">
                <label className="form-label">
                  Serial Number (S/N) <span style={{ color: '#f87171' }}>*</span>
                </label>
                <input
                  type="text"
                  name="sr"
                  placeholder="e.g. CN-0XYZ12-12345-ABC"
                  value={formData.sr}
                  onChange={handleChange}
                  className="form-control"
                  style={{ fontFamily: 'monospace', fontWeight: 600 }}
                  required
                />
              </div>

              {/* Plant / Facility */}
              <div className="form-group">
                <label className="form-label">Stationed Facility / Plant</label>
                <select
                  name="plant"
                  value={formData.plant}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="Vitromed">Vitromed</option>
                </select>
              </div>

              {/* Department */}
              <div className="form-group">
                <label className="form-label">Assigned Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="form-select"
                >
                  {COMPANY_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Floor / Cabin */}
              <div className="form-group">
                <label className="form-label">Floor / Cabin Placement</label>
                <input
                  type="text"
                  name="floorCabin"
                  placeholder="e.g. Ground Floor Cabin 4 or Server Room"
                  value={formData.floorCabin}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: ADAPTIVE TECHNICAL SPECIFICATIONS (DYNAMICALLY MORPHS BY CATEGORY) */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <Cpu size={16} color="#38bdf8" />
              <span style={{ fontWeight: 700, fontSize: '0.94rem' }}>
                2. Technical Specifications ({currentCategory.name})
              </span>
            </div>

            {/* DYNAMIC FIELDS FOR COMPUTING (Laptops / Desktops / Workstations) */}
            {activeCategory === 'computing' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Processor / CPU</label>
                  <input
                    type="text"
                    name="processor"
                    placeholder="e.g. Intel Core i5-12400 / Apple M2"
                    value={formData.processor}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">RAM Memory</label>
                  <input
                    type="text"
                    name="ramSize"
                    placeholder="e.g. 16 GB DDR4"
                    value={formData.ramSize}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Primary Storage</label>
                  <input
                    type="text"
                    name="storage"
                    placeholder="e.g. 512 GB NVMe SSD"
                    value={formData.storage}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Operating System</label>
                  <input
                    type="text"
                    name="osVersion"
                    placeholder="e.g. Windows 11 Pro 64-bit"
                    value={formData.osVersion}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Windows / OS Product Key</label>
                  <input
                    type="text"
                    name="windowsKey"
                    placeholder="e.g. W269N-WFGWX-YVC9B-4J6C9-T83GX"
                    value={formData.windowsKey}
                    onChange={handleChange}
                    className="form-control"
                    style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Office Productivity Suite</label>
                  <input
                    type="text"
                    name="officeSoftware"
                    placeholder="e.g. MS Office 2021 Pro Plus"
                    value={formData.officeSoftware}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Antivirus Protection</label>
                  <input
                    type="text"
                    name="antivirus"
                    placeholder="e.g. QuickHeal Total Security"
                    value={formData.antivirus}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                {(formData.deviceType === 'Desktop' || formData.deviceType === 'Workstation') && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Monitor Details (For Desktop)</label>
                      <input
                        type="text"
                        name="monitorDetails"
                        placeholder="e.g. Dell 22-Inch IPS Full HD"
                        value={formData.monitorDetails}
                        onChange={handleChange}
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Monitor Serial Number</label>
                      <input
                        type="text"
                        name="monitorSerialNo"
                        placeholder="e.g. CN-0MN123-45678"
                        value={formData.monitorSerialNo}
                        onChange={handleChange}
                        className="form-control"
                        style={{ fontFamily: 'monospace' }}
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* DYNAMIC FIELDS FOR SERVERS */}
            {activeCategory === 'servers' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Server CPU Configuration</label>
                  <input
                    type="text"
                    name="serverCpu"
                    placeholder="e.g. 2x Intel Xeon Silver 4310 24-Core"
                    value={formData.serverCpu}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Server RAM (ECC Registered)</label>
                  <input
                    type="text"
                    name="serverRam"
                    placeholder="e.g. 64 GB / 128 GB ECC DDR4"
                    value={formData.serverRam}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Storage / RAID Array</label>
                  <input
                    type="text"
                    name="serverRaid"
                    placeholder="e.g. 4x 2TB SAS 12G in Hardware RAID 5"
                    value={formData.serverRaid}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Server OS / Hypervisor</label>
                  <input
                    type="text"
                    name="serverOs"
                    placeholder="e.g. VMware ESXi 8.0, Windows Server 2022"
                    value={formData.serverOs}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Out-of-Band Management IP (iDRAC/iLO)</label>
                  <input
                    type="text"
                    name="managementIp"
                    placeholder="e.g. 192.168.10.50"
                    value={formData.managementIp}
                    onChange={handleChange}
                    className="form-control"
                    style={{ fontFamily: 'monospace' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Rack Location & U-Position</label>
                  <input
                    type="text"
                    name="rackLocation"
                    placeholder="e.g. Server Room Rack-01 (U12-U14)"
                    value={formData.rackLocation}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
              </div>
            )}

            {/* DYNAMIC FIELDS FOR NETWORKING */}
            {activeCategory === 'network' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Port & Uplink Configuration</label>
                  <input
                    type="text"
                    name="portConfig"
                    placeholder="e.g. 24-Port Gigabit PoE+ with 4x 10G SFP+"
                    value={formData.portConfig}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Network Layer / Device Role</label>
                  <select
                    name="networkRole"
                    value={formData.networkRole}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="Access Layer Switch">Access Layer Switch (Edge)</option>
                    <option value="Distribution Switch">Distribution / Aggregation Switch</option>
                    <option value="Core Backbone Switch">Core Backbone Switch</option>
                    <option value="Perimeter Firewall">Perimeter UTM Firewall</option>
                    <option value="Wireless Access Point">Enterprise Wi-Fi Access Point</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Firmware / Network OS Version</label>
                  <input
                    type="text"
                    name="firmwareVersion"
                    placeholder="e.g. Cisco IOS-XE 17.6.4"
                    value={formData.firmwareVersion}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Rack Mount Location</label>
                  <input
                    type="text"
                    name="rackLocation"
                    placeholder="e.g. Rack-02, U24"
                    value={formData.rackLocation}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
              </div>
            )}

            {/* DYNAMIC FIELDS FOR PRINTERS */}
            {activeCategory === 'printers' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Print Technology</label>
                  <input
                    type="text"
                    name="printTechnology"
                    placeholder="e.g. Monochrome Network Laser MFP, Barcode Thermal"
                    value={formData.printTechnology}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Toner / Cartridge Model</label>
                  <input
                    type="text"
                    name="tonerCartridge"
                    placeholder="e.g. HP 88A / Canon 057 / Ribbon Roll"
                    value={formData.tonerCartridge}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Connectivity Interfaces</label>
                  <input
                    type="text"
                    name="connectivity"
                    placeholder="e.g. Ethernet LAN 10/100 + USB 2.0"
                    value={formData.connectivity}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
              </div>
            )}

            {/* DYNAMIC FIELDS FOR MONITORS & DISPLAYS */}
            {activeCategory === 'displays' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Diagonal Screen Size</label>
                  <input
                    type="text"
                    name="screenSize"
                    placeholder="e.g. 24 Inch (60.9 cm)"
                    value={formData.screenSize}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Display Resolution</label>
                  <input
                    type="text"
                    name="resolution"
                    placeholder="e.g. 1920 x 1080 Full HD (1080p)"
                    value={formData.resolution}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Panel Type & Refresh Rate</label>
                  <input
                    type="text"
                    name="panelType"
                    placeholder="e.g. IPS Anti-Glare, 75Hz"
                    value={formData.panelType}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Video Input Ports</label>
                  <input
                    type="text"
                    name="videoPorts"
                    placeholder="e.g. HDMI 1.4, DisplayPort, VGA"
                    value={formData.videoPorts}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
              </div>
            )}

            {/* DYNAMIC FIELDS FOR MOBILE & TABLETS */}
            {activeCategory === 'mobile' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Display & Storage Capacity</label>
                  <input
                    type="text"
                    name="screenSize"
                    placeholder="e.g. 10.4-inch Screen, 128 GB Storage"
                    value={formData.screenSize}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mobile OS & Version</label>
                  <input
                    type="text"
                    name="mobileOs"
                    placeholder="e.g. Android 14 (Knox Managed), iPadOS 17"
                    value={formData.mobileOs}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">IMEI / Cellular Number (if applicable)</label>
                  <input
                    type="text"
                    name="imeiNumber"
                    placeholder="e.g. 863456041234567"
                    value={formData.imeiNumber}
                    onChange={handleChange}
                    className="form-control"
                    style={{ fontFamily: 'monospace' }}
                  />
                </div>
              </div>
            )}

            {/* Network Identity (Applicable to all types) */}
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                Network Identity & IP Allocation (Optional)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label">Hostname</label>
                  <input
                    type="text"
                    name="hostName"
                    placeholder="e.g. ACC-DELL-14"
                    value={formData.hostName}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Assigned IP Address</label>
                  <input
                    type="text"
                    name="ipAddress"
                    placeholder="e.g. 192.168.8.150"
                    value={formData.ipAddress}
                    onChange={handleChange}
                    className="form-control"
                    style={{ fontFamily: 'monospace' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Hardware MAC Address</label>
                  <input
                    type="text"
                    name="macAddress"
                    placeholder="e.g. 00:1A:2B:3C:4D:5E"
                    value={formData.macAddress}
                    onChange={handleChange}
                    className="form-control"
                    style={{ fontFamily: 'monospace' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: INITIAL STATUS & CUSTODIAN PROVISIONING */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <User size={16} color="#10b981" />
              <span style={{ fontWeight: 700, fontSize: '0.94rem' }}>3. Initial Status & Custody Allocation</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Initial Hardware Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="Available">Available in Central Stock Depot</option>
                  <option value="Assigned">Directly Assign to Staff Member</option>
                  <option value="Under Maintenance">Under Maintenance / QC Testing</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Working Condition</label>
                <select
                  name="workingCondition"
                  value={formData.workingCondition}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="New">Brand New / Factory Sealed</option>
                  <option value="Good">Good / Ready for Operation</option>
                  <option value="Fair">Fair / Minor Scratches</option>
                  <option value="Refurbished">OEM Refurbished</option>
                </select>
              </div>
            </div>

            {/* Direct Custodian Allocation Sub-form */}
            {formData.status === 'Assigned' && (
              <div
                style={{
                  marginTop: '1.25rem',
                  padding: '1rem',
                  backgroundColor: 'rgba(99, 102, 241, 0.06)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#a5b4fc' }}>
                    Assign Directly to Employee
                  </span>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, custodianMode: 'select' }))}
                      className={`btn btn-xs ${formData.custodianMode === 'select' ? 'btn-primary' : 'btn-ghost'}`}
                    >
                      From Directory ({employees.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, custodianMode: 'manual' }))}
                      className={`btn btn-xs ${formData.custodianMode === 'manual' ? 'btn-primary' : 'btn-ghost'}`}
                    >
                      Manual Entry
                    </button>
                  </div>
                </div>

                {formData.custodianMode === 'select' ? (
                  <div className="form-group">
                    <label className="form-label">Select Registered Employee</label>
                    <select
                      value={formData.selectedEmpId}
                      onChange={(e) => handleEmployeeSelect(e.target.value)}
                      className="form-select"
                    >
                      <option value="">-- Choose Custodian ({employees.length} available) --</option>
                      {employees.map((emp) => (
                        <option key={emp._id || emp.employeeId} value={emp.employeeId}>
                          {emp.name} ({emp.employeeId}) • {emp.department} • {emp.location}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                    <div className="form-group">
                      <label className="form-label">Custodian Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Ramesh Sharma"
                        value={formData.userName === 'Unassigned' ? '' : formData.userName}
                        onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Employee ID Code</label>
                      <input
                        type="text"
                        placeholder="e.g. VIT-1045"
                        value={formData.empCode}
                        onChange={(e) => setFormData({ ...formData, empCode: e.target.value })}
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Work Email</label>
                      <input
                        type="email"
                        placeholder="ramesh@vitromed.com"
                        value={formData.mailId}
                        onChange={(e) => setFormData({ ...formData, mailId: e.target.value })}
                        className="form-control"
                      />
                    </div>
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
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SECTION 4: PROCUREMENT, BILLING & INVOICE DOCUMENT */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <DollarSign size={16} color="#fbbf24" />
              <span style={{ fontWeight: 700, fontSize: '0.94rem' }}>4. Procurement & Invoice Records</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Invoice / Bill Number</label>
                <input
                  type="text"
                  name="billNo"
                  placeholder="e.g. INV-2024-0891"
                  value={formData.billNo}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Supplier / Vendor Name</label>
                <input
                  type="text"
                  name="vendorName"
                  list="vendor-list-options"
                  placeholder="e.g. Softcell Technologies"
                  value={formData.vendorName}
                  onChange={handleChange}
                  className="form-control"
                />
                <datalist id="vendor-list-options">
                  {vendors.map((v) => (
                    <option key={v._id || v.name} value={v.name} />
                  ))}
                </datalist>
              </div>

              <div className="form-group">
                <label className="form-label">Purchase Price (₹)</label>
                <input
                  type="number"
                  name="purchasePrice"
                  placeholder="e.g. 58500"
                  value={formData.purchasePrice}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Purchase Date</label>
                <input
                  type="date"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Warranty Terms</label>
                <input
                  type="text"
                  name="warrantyDetails"
                  placeholder="e.g. 3 Years Comprehensive On-Site OEM"
                  value={formData.warrantyDetails}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Warranty Expiration Date</label>
                <input
                  type="date"
                  name="warrantyEndDate"
                  value={formData.warrantyEndDate}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
            </div>

            {/* Interactive Invoice Dropzone */}
            <div style={{ marginTop: '1.25rem' }}>
              <label className="form-label">OEM Bill / Invoice Document Scan (Optional)</label>
              {!imagePreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.5rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Upload size={24} color="#818cf8" style={{ margin: '0 auto 0.5rem' }} />
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    Click to browse or drop purchase bill scan
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-faint)', marginTop: '0.2rem' }}>
                    Supports JPG, PNG images (up to 5MB) and PDF documents (up to 10MB)
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    backgroundColor: 'rgba(99, 102, 241, 0.08)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <FileText size={20} color="#818cf8" />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--text-primary)' }}>
                        Invoice Document Attached
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#34d399' }}>Verified & ready for archive</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="btn btn-ghost btn-xs"
                    style={{ color: '#f87171' }}
                  >
                    <Trash2 size={14} />
                    Detach
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.7rem 1.75rem',
                fontSize: '0.92rem',
                fontWeight: 700,
                boxShadow: '0 4px 16px rgba(99, 102, 241, 0.35)',
              }}
            >
              {submitting ? (
                'Recording into Inventory...'
              ) : (
                <>
                  <Check size={16} />
                  Confirm & Inward Asset
                </>
              )}
            </button>
          </div>
        </form>

        {/* STICKY LIVE ASSET PREVIEW CARD */}
        <div style={{ position: 'sticky', top: '80px' }}>
          <div
            className="card"
            style={{
              padding: '1.25rem',
              border: `1px solid ${currentCategory.badgeColor}44`,
              boxShadow: `0 8px 24px ${currentCategory.badgeColor}15`,
            }}
          >
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.04em' }}>
              Live Inward Preview
            </div>

            {/* Asset Identity Card */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: `${currentCategory.badgeColor}22`,
                  color: currentCategory.badgeColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {React.createElement(currentCategory.icon, { size: 22 })}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.96rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {(formData.make === 'Other' ? formData.customMake : formData.make) || 'Make'}{' '}
                  {formData.model || 'Model Name'}
                </div>
                <div style={{ fontSize: '0.72rem', color: currentCategory.badgeColor, fontWeight: 600 }}>
                  {formData.deviceType} • {formData.plant}
                </div>
              </div>
            </div>

            {/* Tag & Serial Badge */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.65rem 0.85rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
                fontSize: '0.76rem',
                marginBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Asset Tag:</span>
                <strong style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{formData.assetNo || 'Auto'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Serial (S/N):</span>
                <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                  {formData.sr || 'Pending S/N'}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Initial Status:</span>
                <span
                  style={{
                    color: formData.status === 'Assigned' ? '#38bdf8' : '#34d399',
                    fontWeight: 700,
                  }}
                >
                  {formData.status}
                </span>
              </div>
            </div>

            {/* Live Specs Summary */}
            <div
              style={{
                fontSize: '0.74rem',
                color: 'var(--text-muted)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '0.75rem',
              }}
            >
              <div>
                <span style={{ color: 'var(--text-faint)' }}>Specs Summary: </span>
                {activeCategory === 'computing' && (
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {formData.processor || 'CPU'} • {formData.ramSize || 'RAM'} • {formData.storage || 'Storage'}
                  </span>
                )}
                {activeCategory === 'servers' && (
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {formData.serverCpu} • {formData.serverRam}
                  </span>
                )}
                {activeCategory === 'network' && (
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {formData.portConfig}
                  </span>
                )}
                {activeCategory === 'printers' && (
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {formData.printTechnology}
                  </span>
                )}
                {activeCategory === 'displays' && (
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {formData.screenSize} ({formData.resolution})
                  </span>
                )}
                {activeCategory === 'mobile' && (
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {formData.mobileOs}
                  </span>
                )}
              </div>

              <div>
                <span style={{ color: 'var(--text-faint)' }}>Custodian: </span>
                <span style={{ color: formData.userName !== 'Unassigned' ? '#a5b4fc' : 'var(--text-muted)', fontWeight: formData.userName !== 'Unassigned' ? 600 : 400 }}>
                  {formData.userName} {formData.empCode ? `(${formData.empCode})` : ''}
                </span>
              </div>

              <div>
                <span style={{ color: 'var(--text-faint)' }}>Warranty: </span>
                <span>{formData.warrantyDetails}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
