import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  PackagePlus,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  Trash2,
  Plus,
  Check,
  Building,
  Calendar,
  Layers,
  Cpu,
  Monitor,
  HardDrive,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Boxes,
  ArrowRight,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../common/Toast';
import { useAuth } from '../../context/AuthContext';
import { getAccessoriesForDevice } from '../../constants/accessories';
import { getSpecFields } from '../../constants/specifications';

const CATEGORY_DEVICE_MAP = {
  'Computers & Laptops': ['Desktop PC', 'Laptop', 'All-in-One PC', 'Workstation'],
  'Enterprise Servers': ['Rack Server', 'Storage Server / NAS', 'Blade Server', 'Server'],
  'Network Infrastructure': ['Network Switch', 'Router / Gateway', 'Hardware Firewall', 'Wireless Access Point'],
  'Printers & Imaging': ['Printer', 'Scanner', 'MFP / Copier', 'Barcode / Label Printer'],
  'Monitors & Displays': ['External Monitor', 'Dual Monitor Setup', 'Interactive Display / Signage'],
  'Mobile & Handhelds': ['Tablet', 'Smartphone', 'Barcode PDA / Handheld'],
  'Power & Infrastructure': ['UPS / Inverter', 'PDU', 'Biometric Attendance Device'],
  'CCTV & Security': ['CCTV Camera', 'NVR', 'DVR', 'CCTV Monitor'],
  'Other Hardware': ['Digital Projector', 'Web Camera', 'Conference Bar', 'External Backup Drive', 'Docking Station', 'Laptop Bag', 'Custom Asset'],
};

export default function NewInwardModal({
  existingInward = null,
  initialMode = 'form', // 'form' | 'verify'
  vendors = [],
  locations = [],
  assets = [],
  onClose,
  onSuccess,
  onNavigateToInventory,
}) {
  const { user } = useAuth();
  const toast = useToast();

  // Current workflow step: 'form' | 'verify' | 'success'
  const [step, setStep] = useState(existingInward ? (initialMode || 'verify') : 'form');
  const [loading, setLoading] = useState(false);
  const [savedInward, setSavedInward] = useState(existingInward);

  // Auto-calculate next Inward Number
  const generateInwardNumber = () => {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    return `INW-VIT-${randomSuffix}`;
  };

  // Section 1: Inward Details
  const [inwardDetails, setInwardDetails] = useState({
    inwardNumber: existingInward?.inwardNumber || generateInwardNumber(),
    inwardDate: existingInward?.inwardDate ? new Date(existingInward.inwardDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    vendor: existingInward?.vendor || (vendors[0]?.name || 'ABC Computers'),
    poNumber: existingInward?.poNumber || '',
    invoiceNumber: existingInward?.invoiceNumber || '',
    invoiceDate: existingInward?.invoiceDate ? new Date(existingInward.invoiceDate).toISOString().split('T')[0] : '',
    receivedAt: existingInward?.receivedAt || '22Godam',
    remarks: existingInward?.remarks || '',
  });

  // Section 2: Asset Received
  const existingItem = existingInward?.items?.[0] || {};
  const [category, setCategory] = useState(existingItem.category || 'Computers & Laptops');
  const [deviceType, setDeviceType] = useState(existingItem.deviceType || 'Desktop PC');
  const [manufacturer, setManufacturer] = useState(existingItem.manufacturer || 'Dell');
  const [model, setModel] = useState(existingItem.model || 'OptiPlex 7020');
  const [quantity, setQuantity] = useState(existingItem.quantity || 1);

  // Section 3: Specifications (Dynamic per Device Type)
  const [specifications, setSpecifications] = useState(existingItem.specifications || {});

  // When device type changes, reset specifications to defaults
  const currentSpecFields = useMemo(() => getSpecFields(deviceType), [deviceType]);

  const handleDeviceTypeChange = (newType) => {
    setDeviceType(newType);
    setSpecifications({});
    // Reset accessories checklist for new device type
    const standardAccs = getAccessoriesForDevice(newType);
    const initialAccMap = {};
    standardAccs.forEach((acc) => {
      initialAccMap[acc] = true; // default Yes
    });
    setAccessoriesReceived(initialAccMap);
  };

  // Section 4: Accessories Received (YES / NO)
  const standardAccessories = useMemo(() => getAccessoriesForDevice(deviceType), [deviceType]);
  const [accessoriesReceived, setAccessoriesReceived] = useState(() => {
    const map = {};
    standardAccessories.forEach((acc) => {
      map[acc] = true;
    });
    return map;
  });

  // Section 5: Other Accessories (YES / NO)
  const [hasOtherAccessories, setHasOtherAccessories] = useState(
    Boolean(existingItem.otherAccessories && existingItem.otherAccessories.length > 0)
  );
  const [otherAccessoriesList, setOtherAccessoriesList] = useState(
    existingItem.otherAccessories || [{ name: '', quantity: 1 }]
  );

  // Section 6: Documents
  const [documents, setDocuments] = useState(existingInward?.documents || []);

  const handleFileUpload = (e, docType = 'Invoice') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvt) => {
      const base64Url = uploadEvt.target?.result;
      setDocuments((prev) => [
        ...prev.filter((d) => d.docType !== docType),
        {
          docType,
          fileName: file.name,
          fileSize: file.size,
          fileUrl: base64Url,
          uploadedAt: new Date(),
        },
      ]);
      toast.success(`${docType} file "${file.name}" uploaded successfully!`);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeDocument = (docType) => {
    setDocuments((prev) => prev.filter((d) => d.docType !== docType));
  };

  // Calculate next sequential Asset Tag (AST-VIT-XXXXX)
  const calculateNextAssetTag = (offset = 0) => {
    let maxNum = 420;
    assets.forEach((a) => {
      const match = (a.assetNo || '').match(/^AST-VIT-(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    });
    return `AST-VIT-${String(maxNum + 1 + offset).padStart(5, '0')}`;
  };

  // Verification rows state
  const [verificationRows, setVerificationRows] = useState([]);

  // Initialize verification rows whenever entering verify step
  useEffect(() => {
    if (step === 'verify') {
      const targetQty = parseInt(quantity, 10) || 1;
      const existingVerified = savedInward?.items?.[0]?.verifiedAssets || [];
      const rows = [];
      for (let i = 0; i < targetQty; i++) {
        const existingRow = existingVerified[i];
        rows.push({
          index: i + 1,
          serialNumber: existingRow?.serialNumber || '',
          assetTag: existingRow?.assetTag || calculateNextAssetTag(i),
          condition: existingRow?.condition || 'Good',
          status: existingRow?.status || 'Pending',
        });
      }
      setVerificationRows(rows);
    }
  }, [step, quantity, savedInward]);

  // Handle Save Inward (Draft or Pending Verification)
  const handleSaveInward = async (isDraft = false) => {
    if (!inwardDetails.vendor?.trim()) {
      return toast.error('Vendor is required');
    }
    if (!manufacturer.trim()) {
      return toast.error('Manufacturer is required');
    }
    if (!model.trim()) {
      return toast.error('Model is required');
    }
    if (quantity < 1) {
      return toast.error('Quantity must be at least 1');
    }

    setLoading(true);
    try {
      // Format accessories
      const accessoriesPayload = standardAccessories.map((name) => ({
        name,
        received: Boolean(accessoriesReceived[name]),
        quantity: 1,
      }));

      const otherAccessoriesPayload = hasOtherAccessories
        ? otherAccessoriesList.filter((o) => o.name && o.name.trim().length > 0)
        : [];

      const payload = {
        ...inwardDetails,
        status: isDraft ? 'Draft' : 'Pending Asset Verification',
        actorName: user?.name || 'IT Admin',
        items: [
          {
            category,
            deviceType,
            manufacturer,
            model,
            quantity: parseInt(quantity, 10),
            specifications,
            accessories: accessoriesPayload,
            otherAccessories: otherAccessoriesPayload,
          },
        ],
        documents,
      };

      let result;
      if (savedInward?._id) {
        result = await api.updateInward(savedInward._id, payload);
      } else {
        result = await api.createInward(payload);
      }

      const inwardData = result.data || result;
      setSavedInward(inwardData);

      toast.success(
        `Inward "${inwardDetails.inwardNumber}" ${isDraft ? 'saved as Draft' : 'created successfully'}!`
      );

      if (isDraft) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        // Move to Verification Step
        setStep('verify');
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save Inward entry');
    } finally {
      setLoading(false);
    }
  };

  // Confirm and Create Assets
  const handleConfirmCreateAssets = async () => {
    if (!savedInward?._id) {
      return toast.error('Please save the inward record first');
    }

    setLoading(true);
    try {
      const verificationPayload = {
        items: [
          {
            ...savedInward.items[0],
            verifiedAssets: verificationRows.map((r) => ({
              serialNumber: r.serialNumber.trim(),
              assetTag: r.assetTag.trim(),
              condition: r.condition,
              status: 'Created',
            })),
          },
        ],
      };

      const result = await api.createAssetsFromInward(savedInward._id, {
        verificationData: verificationPayload,
        actorName: user?.name || 'IT Admin',
      });

      toast.success(
        result.message || `Successfully created ${verificationRows.length} assets in Central Inventory!`
      );

      setStep('success');
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err.message || 'Failed to create assets from Inward');
    } finally {
      setLoading(false);
    }
  };

  // Compact Specs summary line
  const specsSummaryLine = useMemo(() => {
    const parts = [];
    if (specifications.processor) parts.push(specifications.processor);
    if (specifications.generation) parts.push(specifications.generation);
    if (specifications.ram) parts.push(specifications.ram);
    if (specifications.ramType) parts.push(specifications.ramType);
    if (specifications.storage) parts.push(specifications.storage);
    if (specifications.ports) parts.push(specifications.ports);
    if (specifications.resolution) parts.push(specifications.resolution);
    if (specifications.capacity) parts.push(specifications.capacity);
    if (specifications.os) parts.push(specifications.os);
    return parts.length > 0 ? parts.join(' · ') : 'Standard Configuration';
  }, [specifications]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '960px',
          width: '95%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* MODAL HEADER */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface-raised)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PackagePlus size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {step === 'verify' ? 'Asset Verification & Tagging' : 'New Inward Receiving Entry'}
                </h3>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    padding: '0.15rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'rgba(56, 189, 248, 0.12)',
                    color: '#38bdf8',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                  }}
                >
                  {inwardDetails.inwardNumber}
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                {step === 'verify'
                  ? 'Verify incoming serial numbers, inspect physical condition, and create active inventory assets.'
                  : 'Receive hardware deliveries from vendors, record device specs, accessories, and invoice details.'}
              </p>
            </div>
          </div>

          <button type="button" onClick={onClose} className="btn btn-ghost btn-icon btn-sm">
            <X size={18} />
          </button>
        </div>

        {/* MODAL BODY */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {/* STEP 1: INWARD ENTRY FORM */}
          {step === 'form' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* SECTION 1: INWARD DETAILS */}
              <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--primary)',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    1
                  </span>
                  <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Inward Details
                  </h4>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  <div className="form-group">
                    <label className="form-label">Inward Number</label>
                    <input
                      type="text"
                      readOnly
                      value={inwardDetails.inwardNumber}
                      className="input-field"
                      style={{ fontFamily: 'var(--font-mono)', backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Inward Date *</label>
                    <input
                      type="date"
                      value={inwardDetails.inwardDate}
                      onChange={(e) => setInwardDetails({ ...inwardDetails, inwardDate: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Vendor / Supplier *</label>
                    <input
                      type="text"
                      list="vendors-list"
                      placeholder="Select or enter vendor"
                      value={inwardDetails.vendor}
                      onChange={(e) => setInwardDetails({ ...inwardDetails, vendor: e.target.value })}
                      className="input-field"
                    />
                    <datalist id="vendors-list">
                      {vendors.map((v) => (
                        <option key={v._id || v.name} value={v.name} />
                      ))}
                      <option value="ABC Computers" />
                      <option value="Dell India Official" />
                      <option value="HP Enterprise Solutions" />
                      <option value="Lenovo Commercial" />
                      <option value="Hikvision Security" />
                    </datalist>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Received At / Plant Location</label>
                    <select
                      value={inwardDetails.receivedAt}
                      onChange={(e) => setInwardDetails({ ...inwardDetails, receivedAt: e.target.value })}
                      className="input-field"
                    >
                      <option value="22Godam">22Godam Plant</option>
                      <option value="Sitapura">Sitapura Plant</option>
                      <option value="Vitromed">Vitromed Central</option>
                      {locations.map((l) => (
                        <option key={l._id || l.name} value={l.name}>
                          {l.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">PO Number (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. PO-2024-0891"
                      value={inwardDetails.poNumber}
                      onChange={(e) => setInwardDetails({ ...inwardDetails, poNumber: e.target.value })}
                      className="input-field"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Invoice Number</label>
                    <input
                      type="text"
                      placeholder="e.g. INV-45821"
                      value={inwardDetails.invoiceNumber}
                      onChange={(e) => setInwardDetails({ ...inwardDetails, invoiceNumber: e.target.value })}
                      className="input-field"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Invoice Date</label>
                    <input
                      type="date"
                      value={inwardDetails.invoiceDate}
                      onChange={(e) => setInwardDetails({ ...inwardDetails, invoiceDate: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Remarks / Gate Note</label>
                    <input
                      type="text"
                      placeholder="e.g. Received in 2 cartons via BlueDart"
                      value={inwardDetails.remarks}
                      onChange={(e) => setInwardDetails({ ...inwardDetails, remarks: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: ASSET RECEIVED */}
              <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--primary)',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    2
                  </span>
                  <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Asset Received
                  </h4>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  <div className="form-group">
                    <label className="form-label">Asset Category *</label>
                    <select
                      value={category}
                      onChange={(e) => {
                        const newCat = e.target.value;
                        setCategory(newCat);
                        const defaultType = (CATEGORY_DEVICE_MAP[newCat] || [])[0] || 'Custom Asset';
                        handleDeviceTypeChange(defaultType);
                      }}
                      className="input-field"
                    >
                      {Object.keys(CATEGORY_DEVICE_MAP).map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Device Type *</label>
                    <select
                      value={deviceType}
                      onChange={(e) => handleDeviceTypeChange(e.target.value)}
                      className="input-field"
                    >
                      {(CATEGORY_DEVICE_MAP[category] || [deviceType]).map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Manufacturer *</label>
                    <input
                      type="text"
                      list="make-suggestions"
                      placeholder="e.g. Dell, HP, Lenovo"
                      value={manufacturer}
                      onChange={(e) => setManufacturer(e.target.value)}
                      className="input-field"
                    />
                    <datalist id="make-suggestions">
                      <option value="Dell" />
                      <option value="HP" />
                      <option value="Lenovo" />
                      <option value="Apple" />
                      <option value="Cisco" />
                      <option value="Hikvision" />
                      <option value="Canon" />
                      <option value="APC" />
                    </datalist>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Model Name / Number *</label>
                    <input
                      type="text"
                      placeholder="e.g. OptiPlex 7020"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="input-field"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Quantity Received *</label>
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="input-field"
                      style={{ fontWeight: 800, color: '#38bdf8' }}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: SPECIFICATIONS (DYNAMIC PER DEVICE TYPE) */}
              {currentSpecFields.length > 0 && (
                <div className="card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: 'var(--primary)',
                          color: '#ffffff',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        3
                      </span>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {deviceType} Specifications
                        </h4>
                        <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Configuration details will automatically pre-fill created inventory assets.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                      gap: '1rem',
                    }}
                  >
                    {currentSpecFields.map((field) => (
                      <div key={field.key} className="form-group">
                        <label className="form-label">{field.label}</label>
                        {field.type === 'select' ? (
                          <select
                            value={specifications[field.key] || ''}
                            onChange={(e) =>
                              setSpecifications({ ...specifications, [field.key]: e.target.value })
                            }
                            className="input-field"
                          >
                            <option value="">-- Select {field.label} --</option>
                            {field.options.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            placeholder={field.placeholder || `Enter ${field.label}`}
                            value={specifications[field.key] || ''}
                            onChange={(e) =>
                              setSpecifications({ ...specifications, [field.key]: e.target.value })
                            }
                            className="input-field"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 4: ACCESSORIES RECEIVED (YES / NO) */}
              <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.65rem' }}>
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--primary)',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    4
                  </span>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Accessories Received ({deviceType})
                    </h4>
                    <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Select whether standard accessories were delivered in the package. No serial numbers needed.
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '0.75rem',
                    marginTop: '1rem',
                  }}
                >
                  {standardAccessories.map((accName) => {
                    const isYes = Boolean(accessoriesReceived[accName]);
                    return (
                      <div
                        key={accName}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.65rem 0.85rem',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--bg-surface-raised)',
                          border: `1px solid ${isYes ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'}`,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {accName}
                        </span>

                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <button
                            type="button"
                            onClick={() =>
                              setAccessoriesReceived({ ...accessoriesReceived, [accName]: true })
                            }
                            style={{
                              padding: '0.2rem 0.6rem',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              borderRadius: 'var(--radius-xs)',
                              border: 'none',
                              cursor: 'pointer',
                              backgroundColor: isYes ? '#10b981' : 'rgba(255, 255, 255, 0.05)',
                              color: isYes ? '#ffffff' : 'var(--text-muted)',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            YES
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setAccessoriesReceived({ ...accessoriesReceived, [accName]: false })
                            }
                            style={{
                              padding: '0.2rem 0.6rem',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              borderRadius: 'var(--radius-xs)',
                              border: 'none',
                              cursor: 'pointer',
                              backgroundColor: !isYes ? '#64748b' : 'rgba(255, 255, 255, 0.05)',
                              color: !isYes ? '#ffffff' : 'var(--text-muted)',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            NO
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 5: OTHER ACCESSORIES */}
              <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--primary)',
                        color: '#ffffff',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      5
                    </span>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Other Accessories?
                      </h4>
                      <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Did this delivery include any non-standard accessories (e.g. USB Hub, adapter cables)?
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button
                      type="button"
                      onClick={() => setHasOtherAccessories(true)}
                      style={{
                        padding: '0.25rem 0.8rem',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        borderRadius: 'var(--radius-xs)',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: hasOtherAccessories ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                        color: hasOtherAccessories ? '#ffffff' : 'var(--text-muted)',
                      }}
                    >
                      YES
                    </button>
                    <button
                      type="button"
                      onClick={() => setHasOtherAccessories(false)}
                      style={{
                        padding: '0.25rem 0.8rem',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        borderRadius: 'var(--radius-xs)',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: !hasOtherAccessories ? '#64748b' : 'rgba(255, 255, 255, 0.05)',
                        color: !hasOtherAccessories ? '#ffffff' : 'var(--text-muted)',
                      }}
                    >
                      NO
                    </button>
                  </div>
                </div>

                {hasOtherAccessories && (
                  <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {otherAccessoriesList.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <input
                          type="text"
                          placeholder="Accessory Name (e.g. USB-C Multiport Hub)"
                          value={item.name}
                          onChange={(e) => {
                            const updated = [...otherAccessoriesList];
                            updated[idx].name = e.target.value;
                            setOtherAccessoriesList(updated);
                          }}
                          className="input-field"
                          style={{ flex: 2 }}
                        />
                        <input
                          type="number"
                          min={1}
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => {
                            const updated = [...otherAccessoriesList];
                            updated[idx].quantity = parseInt(e.target.value, 10) || 1;
                            setOtherAccessoriesList(updated);
                          }}
                          className="input-field"
                          style={{ width: '90px' }}
                        />
                        {otherAccessoriesList.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setOtherAccessoriesList(otherAccessoriesList.filter((_, i) => i !== idx))
                            }
                            className="btn btn-ghost btn-icon btn-xs"
                            style={{ color: '#f87171' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}

                    <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '0.25rem' }}>
                      <button
                        type="button"
                        onClick={() =>
                          setOtherAccessoriesList([...otherAccessoriesList, { name: '', quantity: 1 }])
                        }
                        className="btn btn-ghost btn-xs"
                        style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <Plus size={13} />
                        <span>+ Add Another Accessory</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 6: DOCUMENTS */}
              <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--primary)',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    6
                  </span>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Inward Documents
                    </h4>
                    <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Attach delivery bills, supplier invoices, or purchase orders (PDF, JPG, PNG).
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  {['Invoice', 'Purchase Order', 'Other Document'].map((docType) => {
                    const existingDoc = documents.find((d) => d.docType === docType);
                    return (
                      <div
                        key={docType}
                        style={{
                          border: '1px dashed var(--border-default)',
                          borderRadius: 'var(--radius-md)',
                          padding: '1rem',
                          backgroundColor: existingDoc ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-surface-raised)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem',
                        }}
                      >
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {docType} {docType === 'Invoice' ? '(Recommended)' : '(Optional)'}
                        </div>

                        {existingDoc ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', overflow: 'hidden' }}>
                              <CheckCircle2 size={16} color="#10b981" />
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                {existingDoc.fileName}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeDocument(docType)}
                              className="btn btn-ghost btn-icon btn-xs"
                              style={{ color: '#f87171' }}
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ) : (
                          <label
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.45rem',
                              padding: '0.45rem 0.75rem',
                              borderRadius: 'var(--radius-xs)',
                              backgroundColor: 'rgba(255, 255, 255, 0.04)',
                              border: '1px solid var(--border-subtle)',
                              fontSize: '0.74rem',
                              cursor: 'pointer',
                              color: 'var(--text-secondary)',
                            }}
                          >
                            <Upload size={13} />
                            <span>Upload {docType}</span>
                            <input
                              type="file"
                              accept=".pdf, image/jpeg, image/png, image/jpg"
                              style={{ display: 'none' }}
                              onChange={(e) => handleFileUpload(e, docType)}
                            />
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 7: INWARD SUMMARY CARD */}
              <div
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(56, 189, 248, 0.06)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#38bdf8' }}>
                    INWARD SUMMARY: {inwardDetails.inwardNumber}
                  </span>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Vendor: <strong style={{ color: 'var(--text-primary)' }}>{inwardDetails.vendor}</strong>
                  </span>
                </div>

                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {manufacturer} {model} × {quantity} Unit(s) ({deviceType})
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                  Config: {specsSummaryLine}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.25rem' }}>
                  {standardAccessories
                    .filter((acc) => accessoriesReceived[acc])
                    .map((acc) => (
                      <span
                        key={acc}
                        style={{
                          fontSize: '0.68rem',
                          padding: '0.1rem 0.45rem',
                          borderRadius: 'var(--radius-xs)',
                          backgroundColor: 'rgba(16, 185, 129, 0.15)',
                          color: '#34d399',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                        }}
                      >
                        ✓ {acc}
                      </span>
                    ))}
                  {hasOtherAccessories &&
                    otherAccessoriesList
                      .filter((o) => o.name)
                      .map((o, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: '0.68rem',
                            padding: '0.1rem 0.45rem',
                            borderRadius: 'var(--radius-xs)',
                            backgroundColor: 'rgba(99, 102, 241, 0.15)',
                            color: '#818cf8',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                          }}
                        >
                          + {o.name} (x{o.quantity})
                        </span>
                      ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: ASSET VERIFICATION SCREEN */}
          {step === 'verify' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div
                style={{
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#fbbf24' }}>
                    Asset Verification: {manufacturer} {model} ({quantity} Units)
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Enter serial numbers for each received unit. Asset Tags (`AST-VIT-XXXXX`) are auto-generated.
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'rgba(245, 158, 11, 0.15)',
                    color: '#fbbf24',
                  }}
                >
                  Pending Asset Verification
                </span>
              </div>

              {/* Read-only specs recap */}
              <div
                style={{
                  padding: '0.65rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface-raised)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.76rem',
                  color: 'var(--text-muted)',
                }}
              >
                <strong>Pre-filled Hardware Specs:</strong> {specsSummaryLine}
              </div>

              {/* Verification Table */}
              <div
                style={{
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-surface-raised)', borderBottom: '1px solid var(--border-subtle)' }}>
                      <th style={{ padding: '0.65rem 0.85rem', textAlign: 'center', width: '45px' }}>#</th>
                      <th style={{ padding: '0.65rem 0.85rem', textAlign: 'left', minWidth: '220px' }}>
                        Serial Number *
                      </th>
                      <th style={{ padding: '0.65rem 0.85rem', textAlign: 'left', width: '170px' }}>
                        Asset Tag (Auto)
                      </th>
                      <th style={{ padding: '0.65rem 0.85rem', textAlign: 'left', width: '140px' }}>
                        Physical Condition
                      </th>
                      <th style={{ padding: '0.65rem 0.85rem', textAlign: 'center', width: '100px' }}>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {verificationRows.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '0.55rem 0.85rem', textAlign: 'center', color: 'var(--text-faint)' }}>
                          {row.index}
                        </td>
                        <td style={{ padding: '0.45rem 0.85rem' }}>
                          <input
                            type="text"
                            placeholder="Enter hardware serial number"
                            value={row.serialNumber}
                            onChange={(e) => {
                              const updated = [...verificationRows];
                              updated[idx].serialNumber = e.target.value;
                              setVerificationRows(updated);
                            }}
                            className="input-field"
                            style={{ fontFamily: 'var(--font-mono)', height: '32px' }}
                          />
                        </td>
                        <td style={{ padding: '0.45rem 0.85rem' }}>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              color: '#38bdf8',
                              fontWeight: 700,
                              fontSize: '0.78rem',
                            }}
                          >
                            {row.assetTag}
                          </span>
                        </td>
                        <td style={{ padding: '0.45rem 0.85rem' }}>
                          <select
                            value={row.condition}
                            onChange={(e) => {
                              const updated = [...verificationRows];
                              updated[idx].condition = e.target.value;
                              setVerificationRows(updated);
                            }}
                            className="input-field"
                            style={{ height: '32px', fontSize: '0.76rem' }}
                          >
                            <option value="Good">Good</option>
                            <option value="Fair">Fair / Minor Scratches</option>
                            <option value="Damaged">Damaged / Reject</option>
                          </select>
                        </td>
                        <td style={{ padding: '0.45rem 0.85rem', textAlign: 'center' }}>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              padding: '0.12rem 0.5rem',
                              borderRadius: 'var(--radius-full)',
                              backgroundColor: row.serialNumber ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                              color: row.serialNumber ? '#34d399' : '#fbbf24',
                            }}
                          >
                            {row.serialNumber ? 'Ready' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS CONFIRMATION */}
          {step === 'success' && (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircle2 size={36} />
              </div>

              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Assets Created & Inward Verified!
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  <strong>{verificationRows.length} assets</strong> for{' '}
                  <strong style={{ color: 'var(--text-primary)' }}>{manufacturer} {model}</strong> have been
                  verified and added to Central Inventory as Available stock.
                </p>
              </div>

              <div
                style={{
                  padding: '1rem 1.5rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface-raised)',
                  border: '1px solid var(--border-subtle)',
                  textAlign: 'left',
                  width: '100%',
                  maxWidth: '520px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  fontSize: '0.78rem',
                }}
              >
                <div>
                  <strong>Inward ID:</strong> {inwardDetails.inwardNumber}
                </div>
                <div>
                  <strong>Vendor:</strong> {inwardDetails.vendor}
                </div>
                <div>
                  <strong>Tags Created:</strong> {verificationRows.map((r) => r.assetTag).join(', ')}
                </div>
                <div>
                  <strong>Bundled Accessories:</strong>{' '}
                  {standardAccessories.filter((a) => accessoriesReceived[a]).join(', ') || 'Standard Kit'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-outline btn-sm"
                >
                  Close & View Inwards
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onNavigateToInventory) onNavigateToInventory();
                  }}
                  className="btn btn-primary btn-sm"
                >
                  <Boxes size={15} />
                  <span>View in Central Inventory →</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        {step !== 'success' && (
          <div
            style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-surface-raised)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {step === 'form' ? (
              <>
                <button
                  type="button"
                  onClick={() => handleSaveInward(true)}
                  className="btn btn-outline btn-sm"
                  disabled={loading}
                >
                  Save Draft
                </button>

                <div style={{ display: 'flex', gap: '0.65rem' }}>
                  <button type="button" onClick={onClose} className="btn btn-secondary btn-sm" disabled={loading}>
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveInward(false)}
                    className="btn btn-primary btn-sm"
                    disabled={loading}
                    style={{ minWidth: '170px' }}
                  >
                    {loading ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <RefreshCw size={14} className="spin" />
                        <span>Saving Inward...</span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span>Save Inward & Verify</span>
                        <ArrowRight size={14} />
                      </div>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="btn btn-outline btn-sm"
                  disabled={loading}
                >
                  ← Back to Inward Form
                </button>

                <div style={{ display: 'flex', gap: '0.65rem' }}>
                  <button type="button" onClick={onClose} className="btn btn-secondary btn-sm" disabled={loading}>
                    Save for Later
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmCreateAssets}
                    className="btn btn-primary btn-sm"
                    disabled={loading}
                    style={{ minWidth: '190px' }}
                  >
                    {loading ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <RefreshCw size={14} className="spin" />
                        <span>Creating Assets...</span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Check size={14} />
                        <span>Confirm & Create Assets</span>
                      </div>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
