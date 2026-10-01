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
  X,
  Tag,
  Cpu,
  HardDrive,
  Activity,
  Check,
  Receipt,
  EyeOff,
  Search,
  ArrowRight,
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from './common/Toast';
import { useAuth } from '../context/AuthContext';
import { COMPANY_DEPARTMENTS, COMPANY_PLANTS } from '../constants/organization';
import { isNetworkDevice } from '../constants/specifications';

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
    sn: '',
    userStatus: 'Active',
    userName: 'Unassigned',
    empCode: '',
    mailId: '',
    officialNumber: '',
    department: COMPANY_DEPARTMENTS[0] || 'Vitromed Baisgodam 3rd Floor',

    // Technical Specs - Computing
    processor: 'Intel Core i5',
    ramSize: '16 GB',
    storage: '512 GB SSD',
    osVersion: 'Windows 11 Pro',
    windowsType: 'OPEN OS',
    windowsKey: '',
    officeSoftware: 'MS Office 2021',
    officeKey: '',
    mailSoftware: 'Online WPA',
    sapId: '',
    loginUserName: 'Vitromed',
    loginPassword: '',
    antivirus: 'eScan',
    escanPolicy: 'Profile',
    otherSoftware: '',
    monitorDetails: '',
    monitorSerialNo: '',
    dataBackup: 'Daily Backup',
    accessories: 'UPS, Wireless K/B & Mouse',
    billCopyDate: '',

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
    poNumber: '',
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

    // Power & Infrastructure Specifics
    upsCapacity: '1000 VA / 600W Pure Sine Wave',
    batteryConfig: '2x 12V 7.2Ah Sealed Lead-Acid',
    backupRuntime: '25-30 Minutes @ 50% Load',
    pduOutlets: '6x IEC C13 Sockets',
    biometricSensor: 'Optical Fingerprint + Face Recognition',

    // Other Hardware Specifics
    deviceSpecs: '',
    connectivityPorts: '',
    peripheralsList: [],
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [createdSuccessAsset, setCreatedSuccessAsset] = useState(null);
  const [empSearchQuery, setEmpSearchQuery] = useState('');
  const [showPassword, setShowPassword] = useState({
    loginPassword: false,
    vncPassword: false,
    windowsKey: false,
    officeKey: false,
  });
  const fileInputRef = useRef(null);

  // Real-time duplicate Serial Number detection
  const duplicateAsset = useMemo(() => {
    if (!formData.sr || !formData.sr.trim()) return null;
    const cleanSr = formData.sr.trim().toLowerCase();
    return assets.find((a) => a.sr && a.sr.trim().toLowerCase() === cleanSr);
  }, [formData.sr, assets]);

  // Real-time duplicate Asset Tag detection
  const duplicateTag = useMemo(() => {
    if (!formData.assetNo || !formData.assetNo.trim()) return null;
    const cleanTag = formData.assetNo.trim().toLowerCase();
    return assets.find((a) => a.assetNo && a.assetNo.trim().toLowerCase() === cleanTag);
  }, [formData.assetNo, assets]);

  // Warranty Date validation
  const warrantyDateError = useMemo(() => {
    if (!formData.warrantyStartDate || !formData.warrantyEndDate) return false;
    return formData.warrantyEndDate < formData.warrantyStartDate;
  }, [formData.warrantyStartDate, formData.warrantyEndDate]);

  // Searchable employees list
  const filteredEmployees = useMemo(() => {
    if (!empSearchQuery.trim()) return employees;
    const q = empSearchQuery.toLowerCase();
    return employees.filter(
      (e) =>
        (e.name && e.name.toLowerCase().includes(q)) ||
        (e.employeeId && e.employeeId.toLowerCase().includes(q)) ||
        (e.department && e.department.toLowerCase().includes(q)) ||
        (e.email && e.email.toLowerCase().includes(q))
    );
  }, [employees, empSearchQuery]);

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
    if (e && e.preventDefault) e.preventDefault();

    if (!formData.sr.trim()) {
      return toast.error('Serial Number (S/N) is required', 'Missing Serial Number');
    }
    if (!formData.model.trim()) {
      return toast.error('Model Name / Series is required', 'Missing Model');
    }
    if (warrantyDateError) {
      return toast.error('Warranty expiration date cannot precede warranty start date', 'Invalid Dates');
    }

    setSubmitting(true);
    const finalMake = formData.make === 'Other' ? formData.customMake : formData.make;

    // Build payload according to selected asset type
    const payload = {
      ...formData,
      category: activeCategory,
      make: finalMake || 'Generic',
      purchasePrice: formData.purchasePrice ? Number(formData.purchasePrice) : 0,
      currentValue: formData.currentValue ? Number(formData.currentValue) : Number(formData.purchasePrice || 0),
      peripheralsList: formData.peripheralsList || [],
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
      payload.ramSize = '';
      payload.storage = formData.portConfig;
      payload.processor = formData.networkRole;
      payload.osVersion = formData.firmwareVersion;
      payload.windowsType = '';
      payload.windowsKey = '';
      payload.officeSoftware = '';
      payload.officeKey = '';
      payload.accessories = '';
      payload.remarks = `[Network Device] Rack: ${formData.rackLocation}, Pos: ${formData.uPosition}. ${formData.remarks}`;
    } else if (activeCategory === 'printers') {
      payload.ramSize = '';
      payload.processor = formData.printTechnology;
      payload.storage = formData.tonerCartridge;
      payload.osVersion = formData.connectivity;
      payload.windowsType = '';
      payload.windowsKey = '';
      payload.officeSoftware = '';
      payload.officeKey = '';
      payload.accessories = '';
    } else if (activeCategory === 'displays') {
      payload.ramSize = '';
      payload.osVersion = '';
      payload.windowsType = '';
      payload.windowsKey = '';
      payload.officeSoftware = '';
      payload.officeKey = '';
      payload.accessories = '';
      payload.processor = `${formData.screenSize} • ${formData.panelType}`;
      payload.storage = formData.resolution;
      payload.monitorDetails = `${finalMake} ${formData.model} (${formData.screenSize})`;
      payload.monitorSerialNo = formData.sr;
    } else if (activeCategory === 'mobile') {
      payload.ramSize = '';
      payload.processor = formData.mobileOs;
      payload.storage = formData.screenSize;
      payload.osVersion = formData.mobileOs;
      payload.windowsType = '';
      payload.windowsKey = '';
      payload.officeSoftware = '';
      payload.officeKey = '';
      payload.remarks = `[Mobile] IMEI: ${formData.imeiNumber}. ${formData.remarks}`;
    } else if (activeCategory === 'power') {
      payload.ramSize = '';
      payload.osVersion = '';
      payload.windowsType = '';
      payload.windowsKey = '';
      payload.officeSoftware = '';
      payload.officeKey = '';
      payload.mailSoftware = '';
      payload.loginUserName = '';
      payload.loginPassword = '';
      payload.antivirus = '';
      payload.accessories = '';
      payload.processor = formData.upsCapacity || 'UPS Power Unit';
      payload.storage = formData.batteryConfig || 'Internal Batteries';
      payload.remarks = `[Power/Infrastructure] Runtime: ${formData.backupRuntime || 'N/A'}. Outlets: ${formData.pduOutlets || 'N/A'}. ${formData.remarks}`;
    } else if (activeCategory === 'other') {
      payload.ramSize = '';
      payload.osVersion = '';
      payload.windowsType = '';
      payload.windowsKey = '';
      payload.officeSoftware = '';
      payload.officeKey = '';
      payload.mailSoftware = '';
      payload.loginUserName = '';
      payload.loginPassword = '';
      payload.antivirus = '';
      payload.processor = formData.deviceSpecs || 'Custom Peripheral';
      payload.storage = formData.connectivityPorts || 'Standard I/O';
    }

    payload.specifications = {
      activeCategory,
      processor: payload.processor,
      ramSize: payload.ramSize,
      storage: payload.storage,
      osVersion: payload.osVersion,
      screenSize: formData.screenSize,
      resolution: formData.resolution,
      panelType: formData.panelType,
      videoPorts: formData.videoPorts,
      serverCpu: formData.serverCpu,
      serverRam: formData.serverRam,
      serverRaid: formData.serverRaid,
      serverOs: formData.serverOs,
      managementIp: formData.managementIp,
      rackLocation: formData.rackLocation,
      uPosition: formData.uPosition,
      portConfig: formData.portConfig,
      networkRole: formData.networkRole,
      firmwareVersion: formData.firmwareVersion,
      printTechnology: formData.printTechnology,
      tonerCartridge: formData.tonerCartridge,
      connectivity: formData.connectivity,
      imeiNumber: formData.imeiNumber,
      mobileOs: formData.mobileOs,
      upsCapacity: formData.upsCapacity,
      batteryConfig: formData.batteryConfig,
      backupRuntime: formData.backupRuntime,
      pduOutlets: formData.pduOutlets,
      biometricSensor: formData.biometricSensor,
      deviceSpecs: formData.deviceSpecs,
      connectivityPorts: formData.connectivityPorts,
    };

    try {
      const result = await api.createAsset(payload);

      if (result.success) {
        toast.success(
          `Asset "${finalMake} ${formData.model}" (Tag: ${payload.assetNo || payload.sr}) inwarded successfully!`,
          'Asset Inwarded'
        );
        setCreatedSuccessAsset(result.data || payload);
        setShowReviewModal(false);

        if (onAssetCreated) onAssetCreated();
      }
    } catch (err) {
      toast.error(err.message, 'Inwarding Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInwardNext = () => {
    setCreatedSuccessAsset(null);
    setShowReviewModal(false);
    setFormData((prev) => ({
      ...prev,
      assetNo: calculateNextAssetTag(),
      model: '',
      sr: '',
      status: 'Available',
      userName: 'Unassigned',
      selectedEmpId: '',
      empCode: '',
      mailId: '',
      peripheralsList: [],
      invoiceImage: '',
      remarks: '',
    }));
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="page-container" style={{ maxWidth: '1240px' }}>
      {/* Header & Title */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
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

      {/* SUCCESS CONFIRMATION RECEIPT CARD */}
      {createdSuccessAsset && (
        <div
          className="card"
          style={{
            padding: '1.75rem',
            backgroundColor: 'var(--bg-surface-raised)',
            border: '1.5px solid #10b981',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '1.75rem',
            boxShadow: '0 8px 32px rgba(16, 185, 129, 0.15)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '1rem',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#34d399',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Hardware Asset Inwarded Successfully!
                </h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                  The device record and serial number have been verified and posted to master inventory.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={handleInwardNext}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
              >
                <Plus size={14} />
                Inward Next Asset
              </button>
              {onAssetCreated && (
                <button
                  type="button"
                  onClick={onAssetCreated}
                  className="btn btn-outline btn-sm"
                >
                  View in Master Asset List
                </button>
              )}
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: '0.75rem',
            }}
          >
            <div style={{ padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-surface)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Asset Tag</div>
              <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace', marginTop: '0.15rem' }}>
                {createdSuccessAsset.assetNo}
              </div>
            </div>
            <div style={{ padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-surface)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Serial Number (S/N)</div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace', marginTop: '0.15rem' }}>
                {createdSuccessAsset.sr}
              </div>
            </div>
            <div style={{ padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-surface)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Make & Model</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.15rem' }}>
                {createdSuccessAsset.make} {createdSuccessAsset.model}
              </div>
            </div>
            <div style={{ padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-surface)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Status & Custody</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: createdSuccessAsset.status === 'Assigned' ? '#38bdf8' : '#34d399', marginTop: '0.15rem' }}>
                {createdSuccessAsset.status} • {createdSuccessAsset.userName || 'Unassigned'}
              </div>
            </div>
          </div>
        </div>
      )}

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
                  gap: '0.5rem',
                  padding: '0.85rem 0.65rem',
                  borderRadius: 'var(--radius-lg)',
                  border: isSelected
                    ? `1.5px solid ${cat.badgeColor}`
                    : '1px solid var(--border-default)',
                  backgroundColor: isSelected
                    ? `${cat.badgeColor}12`
                    : 'var(--bg-surface)',
                  boxShadow: isSelected ? `0 0 16px ${cat.badgeColor}25` : 'var(--shadow-sm)',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: `${cat.badgeColor}18`,
                    color: cat.badgeColor,
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
      <div className="two-col-responsive">
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

              {/* Serial Number with Duplicate Warning */}
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
                  style={{
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    borderColor: duplicateAsset ? '#f87171' : undefined,
                  }}
                  required
                />
                {duplicateAsset && (
                  <div
                    style={{
                      marginTop: '0.35rem',
                      padding: '0.4rem 0.65rem',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239, 68, 68, 0.35)',
                      color: '#f87171',
                      fontSize: '0.72rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <AlertCircle size={13} style={{ flexShrink: 0 }} />
                    <span>
                      Duplicate S/N detected! Already registered as <strong>{duplicateAsset.assetNo}</strong> ({duplicateAsset.make} {duplicateAsset.model} • {duplicateAsset.status}).
                    </span>
                  </div>
                )}
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
                  {(locations && locations.length > 0
                    ? locations.map((l) => (typeof l === 'object' ? l.name || l.plantName : l))
                    : COMPANY_PLANTS
                  ).map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
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
                  {(departments && departments.length > 0
                    ? departments.map((d) => (typeof d === 'object' ? d.name || d.departmentName : d))
                    : COMPANY_DEPARTMENTS
                  ).map((dept) => (
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

            {/* DYNAMIC FIELDS FOR POWER & INFRASTRUCTURE */}
            {activeCategory === 'power' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">UPS Capacity / VA Rating</label>
                  <input
                    type="text"
                    name="upsCapacity"
                    placeholder="e.g. 1000 VA / 600W Pure Sine Wave, 3KVA Online"
                    value={formData.upsCapacity}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Battery Configuration</label>
                  <input
                    type="text"
                    name="batteryConfig"
                    placeholder="e.g. 2x 12V 7.2Ah Sealed Lead-Acid (Internal)"
                    value={formData.batteryConfig}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Estimated Backup Runtime</label>
                  <input
                    type="text"
                    name="backupRuntime"
                    placeholder="e.g. 25-30 Minutes @ 50% Load"
                    value={formData.backupRuntime}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">PDU / Output Sockets</label>
                  <input
                    type="text"
                    name="pduOutlets"
                    placeholder="e.g. 4x India 3-Pin + 2x IEC C13 Sockets"
                    value={formData.pduOutlets}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                {formData.deviceType?.includes('Biometric') && (
                  <div className="form-group">
                    <label className="form-label">Biometric Sensor Technology</label>
                    <input
                      type="text"
                      name="biometricSensor"
                      placeholder="e.g. Optical Fingerprint + AI Face Recognition + RFID"
                      value={formData.biometricSensor}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                )}
              </div>
            )}

            {/* DYNAMIC FIELDS FOR OTHER HARDWARE */}
            {activeCategory === 'other' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Hardware Specifications & Key Features</label>
                  <textarea
                    name="deviceSpecs"
                    rows={2}
                    placeholder="Describe technical specs, resolution, audio/mic array, interface standards..."
                    value={formData.deviceSpecs}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Connectivity & Ports</label>
                  <input
                    type="text"
                    name="connectivityPorts"
                    placeholder="e.g. USB-C 3.2, HDMI 2.0, Bluetooth 5.2"
                    value={formData.connectivityPorts}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Included Accessories</label>
                  <input
                    type="text"
                    name="accessories"
                    placeholder="e.g. Power adapter, USB cables, Remote control"
                    value={formData.accessories}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
              </div>
            )}

            {/* Network Identity & Access Credentials - ONLY for network-capable devices */}
            {isNetworkDevice(formData.deviceType, {
              category: activeCategory,
              connectivity: formData.connectivity || formData.connectivityPorts,
            }) && (
              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                    Network Identity & System Credentials {formData.status !== 'Assigned' ? '(Optional — Typically Configured upon Handover)' : '(Assigned Configuration)'}
                  </div>
                  {formData.status !== 'Assigned' && (
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontStyle: 'italic' }}>
                      Leave blank if storing in stock depot; assign IP when handing over to staff
                    </span>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                  <div className="form-group">
                    <label className="form-label">Hostname (Optional)</label>
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
                    <label className="form-label">Assigned IP Address (Optional)</label>
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
                    <label className="form-label">Hardware MAC Address (Optional)</label>
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
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>System Login Password</span>
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => ({ ...p, loginPassword: !p.loginPassword }))}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem', padding: 0 }}
                      >
                        {showPassword.loginPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                        <span>{showPassword.loginPassword ? 'Hide' : 'Reveal'}</span>
                      </button>
                    </label>
                    <input
                      type={showPassword.loginPassword ? 'text' : 'password'}
                      name="loginPassword"
                      placeholder="Admin password"
                      value={formData.loginPassword}
                      onChange={handleChange}
                      className="form-control"
                      style={{ fontFamily: 'monospace' }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Remote / VNC Password</span>
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => ({ ...p, vncPassword: !p.vncPassword }))}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem', padding: 0 }}
                      >
                        {showPassword.vncPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                        <span>{showPassword.vncPassword ? 'Hide' : 'Reveal'}</span>
                      </button>
                    </label>
                    <input
                      type={showPassword.vncPassword ? 'text' : 'password'}
                      name="vncPassword"
                      placeholder="VNC / Remote access key"
                      value={formData.vncPassword}
                      onChange={handleChange}
                      className="form-control"
                      style={{ fontFamily: 'monospace' }}
                    />
                  </div>
                </div>
              </div>
            )}
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
                  <option value="Reserved">Reserved for Upcoming Onboarding</option>
                  <option value="Under QC">Under QC Testing / Burn-in</option>
                  <option value="Under Maintenance">Under Maintenance / Warranty Repair</option>
                  <option value="Damaged">Damaged / Needs Inspection</option>
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
                  <div>
                    {formData.selectedEmpId && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.5rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'rgba(16, 185, 129, 0.12)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          marginBottom: '0.65rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <CheckCircle2 size={14} color="#10b981" />
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#34d399' }}>
                            Selected Custodian: {formData.userName} ({formData.empCode}) • {formData.department}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleEmployeeSelect('')}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#f87171',
                            fontSize: '0.72rem',
                            cursor: 'pointer',
                            fontWeight: 600,
                          }}
                        >
                          Clear Selection
                        </button>
                      </div>
                    )}

                    <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
                      <Search
                        size={13}
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
                        placeholder="Search employee by name, ID badge, or department..."
                        value={empSearchQuery}
                        onChange={(e) => setEmpSearchQuery(e.target.value)}
                        className="form-control"
                        style={{ paddingLeft: '2rem', paddingRight: empSearchQuery ? '2rem' : '0.65rem', fontSize: '0.78rem' }}
                      />
                      {empSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setEmpSearchQuery('')}
                          style={{
                            position: 'absolute',
                            right: '8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-faint)',
                            padding: '3px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '4px',
                          }}
                          title="Clear search"
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>

                    <div className="form-group">
                      <select
                        value={formData.selectedEmpId}
                        onChange={(e) => handleEmployeeSelect(e.target.value)}
                        className="form-select"
                      >
                        <option value="">-- Choose Custodian ({filteredEmployees.length} found) --</option>
                        {filteredEmployees.map((emp) => (
                          <option key={emp._id || emp.employeeId} value={emp.employeeId}>
                            {emp.name} ({emp.employeeId}) • {emp.department} • {emp.location}
                          </option>
                        ))}
                      </select>
                    </div>
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
              <FileText size={16} color="#fbbf24" />
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
                <label className="form-label">Warranty Start Date</label>
                <input
                  type="date"
                  name="warrantyStartDate"
                  value={formData.warrantyStartDate}
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
                  style={{ borderColor: warrantyDateError ? '#f87171' : undefined }}
                />
                {warrantyDateError && (
                  <div style={{ marginTop: '0.25rem', color: '#f87171', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <AlertCircle size={12} />
                    <span>Expiration date cannot precede start date.</span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Warranty Terms / Coverage</label>
                <input
                  type="text"
                  name="warrantyDetails"
                  placeholder="e.g. 3 Years Comprehensive On-Site OEM"
                  value={formData.warrantyDetails}
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
                    padding: '1.75rem 1.5rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: 'var(--bg-surface-raised)',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-focus)';
                    e.currentTarget.style.backgroundColor = 'var(--primary-light)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-default)';
                    e.currentTarget.style.backgroundColor = 'var(--bg-surface-raised)';
                  }}
                >
                  <Upload size={24} color="var(--primary)" style={{ margin: '0 auto 0.5rem' }} />
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    Click to browse or drop purchase bill scan
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-faint)', marginTop: '0.2rem' }}>
                    Supports JPG, PNG, WebP images (up to 5MB) and PDF documents (up to 10MB)
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
                    flexDirection: 'column',
                    gap: '0.75rem',
                    padding: '1rem',
                    backgroundColor: 'var(--bg-surface-raised)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <Receipt size={18} color="var(--primary)" />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--text-primary)' }}>
                          Bill / Invoice Document Attached
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#059669' }}>
                          Ready to be stored with new hardware asset
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn btn-outline btn-xs"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="btn btn-ghost btn-xs"
                        style={{ color: '#ef4444' }}
                      >
                        <Trash2 size={13} />
                        Detach
                      </button>
                    </div>
                  </div>

                  {/* Thumbnail display */}
                  <div
                    style={{
                      maxHeight: '220px',
                      overflow: 'hidden',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-default)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0.5rem',
                    }}
                  >
                    {imagePreview.startsWith('data:application/pdf') ? (
                      <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                        <FileText size={32} color="var(--primary)" style={{ margin: '0 auto 0.35rem' }} />
                        <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>PDF Document Selected</span>
                      </div>
                    ) : (
                      <img
                        src={imagePreview}
                        alt="Bill Preview"
                        style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '4px' }}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setShowReviewModal(true)}
              className="btn btn-outline"
              disabled={submitting}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.7rem 1.25rem',
                fontSize: '0.9rem',
                fontWeight: 600,
              }}
            >
              <Eye size={15} />
              Review Summary
            </button>
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
                {activeCategory === 'power' && (
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {formData.upsCapacity} • {formData.backupRuntime}
                  </span>
                )}
                {activeCategory === 'other' && (
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {formData.deviceSpecs || 'Custom Peripheral'}
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

      {/* REVIEW & CONFIRMATION MODAL */}
      {showReviewModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '650px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '1.5rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-surface)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Review Asset Inward Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="btn btn-ghost btn-icon btn-sm"
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.82rem' }}>
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface-raised)', borderRadius: '6px' }}>
                <strong style={{ color: '#818cf8', display: 'block', marginBottom: '0.25rem' }}>1. Hardware Identification</strong>
                <div><strong>Asset Tag:</strong> {formData.assetNo}</div>
                <div><strong>Make & Model:</strong> {(formData.make === 'Other' ? formData.customMake : formData.make) || 'Generic'} {formData.model}</div>
                <div><strong>Serial (S/N):</strong> {formData.sr}</div>
                <div><strong>Facility & Department:</strong> {formData.plant} • {formData.department}</div>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface-raised)', borderRadius: '6px' }}>
                <strong style={{ color: '#38bdf8', display: 'block', marginBottom: '0.25rem' }}>2. Technical Specifications ({currentCategory.name})</strong>
                <div><strong>Device Sub-Type:</strong> {formData.deviceType}</div>
                {activeCategory === 'computing' && (
                  <div><strong>Specs:</strong> {formData.processor} • {formData.ramSize} RAM • {formData.storage} • {formData.osVersion}</div>
                )}
                {activeCategory === 'servers' && (
                  <div><strong>Specs:</strong> {formData.serverCpu} • {formData.serverRam} • {formData.serverRaid}</div>
                )}
                {activeCategory === 'network' && (
                  <div><strong>Config:</strong> {formData.portConfig} • {formData.networkRole}</div>
                )}
                {activeCategory === 'power' && (
                  <div><strong>Capacity:</strong> {formData.upsCapacity} • {formData.backupRuntime}</div>
                )}
                {formData.peripheralsList && formData.peripheralsList.length > 0 && (
                  <div style={{ marginTop: '0.35rem', color: '#a5b4fc' }}>
                    <strong>Allocated Bundle ({formData.peripheralsList.length} items):</strong>{' '}
                    {formData.peripheralsList.map((p) => {
                      const tag = p.assetTag ? ` [Tag: #${p.assetTag}]` : '';
                      const sn = p.serialNo ? ` (S/N: ${p.serialNo})` : '';
                      return `${p.itemType}${tag} (${p.make || ''} ${p.model || ''})${sn}`;
                    }).join(', ')}
                  </div>
                )}
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface-raised)', borderRadius: '6px' }}>
                <strong style={{ color: '#10b981', display: 'block', marginBottom: '0.25rem' }}>3. Custody & Status</strong>
                <div><strong>Status:</strong> {formData.status} ({formData.workingCondition})</div>
                <div><strong>Assigned Custodian:</strong> {formData.userName} {formData.empCode ? `(${formData.empCode})` : ''}</div>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface-raised)', borderRadius: '6px' }}>
                <strong style={{ color: '#fbbf24', display: 'block', marginBottom: '0.25rem' }}>4. Procurement & Warranty</strong>
                <div><strong>Invoice / Bill:</strong> {formData.billNo || 'N/A'}</div>
                <div><strong>Vendor:</strong> {formData.vendorName || 'N/A'}</div>
                <div><strong>Warranty Coverage:</strong> {formData.warrantyDetails || 'Standard'} (Valid: {formData.warrantyStartDate || 'N/A'} to {formData.warrantyEndDate || 'N/A'})</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="btn btn-outline btn-sm"
              >
                Back to Edit
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="btn btn-primary btn-sm"
                disabled={submitting}
                style={{ fontWeight: 700 }}
              >
                {submitting ? 'Recording...' : 'Confirm & Inward Asset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
