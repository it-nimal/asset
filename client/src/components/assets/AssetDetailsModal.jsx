import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Laptop,
  User,
  History,
  Wrench,
  ShieldCheck,
  FileText,
  Clock,
  Calendar,
  Cpu,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  Layers,
  MapPin,
  Building2,
  ExternalLink,
  UserCheck,
  ArrowRightLeft,
  Undo2,
  Edit3,
  Trash2,
  Printer,
  FileSpreadsheet,
  Key,
  Shield,
  Wifi,
  Monitor,
  Database,
  Mail,
  Phone,
  Tag,
  Upload,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Receipt,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import { STATUS_COLORS } from './AssetTable';
import { useToast } from '../common/Toast';
import { api } from '../../services/api';
import logo from '../photos/VitromedLogo.png';

export default function AssetDetailsModal({
  asset,
  onClose,
  initialTab = 'overview',
  onAssign,
  onTransfer,
  onReturn,
  onMaintenanceReturn,
  onEdit,
  onMaintenance,
  onRetire,
  onDelete,
  onUpdate,
}) {
  const toast = useToast();
  // Local state for dynamic updates (e.g. uploading/removing bill image)
  const [currentAsset, setCurrentAsset] = useState(asset);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [uploadingBill, setUploadingBill] = useState(false);
  const billFileInputRef = useRef(null);

  useEffect(() => {
    setCurrentAsset(asset);
  }, [asset]);

  // Default to 'single-page' to show all details in one page!
  const [viewMode, setViewMode] = useState('single-page'); // 'single-page' | 'tabs'
  const [tab, setTab] = useState(initialTab === 'overview' ? 'overview' : initialTab);
  const [includeBillInPrint, setIncludeBillInPrint] = useState(Boolean(asset?.invoiceImage));

  useEffect(() => {
    if (currentAsset?.invoiceImage) {
      setIncludeBillInPrint(true);
    } else {
      setIncludeBillInPrint(false);
    }
  }, [currentAsset?.invoiceImage]);

  const isPdfDocument = currentAsset?.invoiceImage?.startsWith('data:application/pdf');

  const handleBillUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast.error('Please upload an image (PNG, JPG, WebP) or PDF document');
      return;
    }

    const maxSize = file.type === 'application/pdf' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`File is too large (max ${file.type === 'application/pdf' ? '10MB' : '5MB'})`);
      return;
    }

    setUploadingBill(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result;
      try {
        const updatePayload = {
          invoiceImage: base64Data,
          billCopyDate: currentAsset.billCopyDate || new Date().toISOString().split('T')[0],
        };
        const res = await api.updateAsset(currentAsset._id, updatePayload);
        const updated = res.data || { ...currentAsset, ...updatePayload };
        setCurrentAsset(updated);
        if (onUpdate) onUpdate(updated);
        toast.success('Bill copy attached successfully!');
      } catch (err) {
        toast.error(err.message || 'Failed to upload bill');
      } finally {
        setUploadingBill(false);
        if (billFileInputRef.current) billFileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadBill = () => {
    if (!currentAsset.invoiceImage) return;
    const a = document.createElement('a');
    a.href = currentAsset.invoiceImage;
    const ext = isPdfDocument ? 'pdf' : 'png';
    a.download = `Bill_${currentAsset.assetNo || currentAsset.sr || 'Asset'}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.info('Bill document downloaded');
  };

  const handleDeleteBill = async () => {
    if (!window.confirm('Are you sure you want to detach this bill copy?')) return;
    setUploadingBill(true);
    try {
      const res = await api.updateAsset(currentAsset._id, { invoiceImage: '' });
      const updated = res.data || { ...currentAsset, invoiceImage: '' };
      setCurrentAsset(updated);
      if (onUpdate) onUpdate(updated);
      toast.info('Bill copy detached');
      setLightboxOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to remove bill');
    } finally {
      setUploadingBill(false);
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (lightboxOpen) setLightboxOpen(false);
        else onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, onClose]);

  if (!asset) return null;

  const formatMakeModel = (make, model) => {
    if (!make && !model) return 'N/A';
    if (!make) return model;
    if (!model) return make;
    const m = make.trim();
    const mo = model.trim();
    if (mo.toLowerCase().startsWith(m.toLowerCase())) {
      return mo;
    }
    return `${m} ${mo}`;
  };

  const st = STATUS_COLORS[asset.status] || STATUS_COLORS.Available;

  const handlePrint = () => {
    window.print();
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Laptop },
    { id: 'specs', label: 'Hardware & Display', icon: Cpu },
    { id: 'software', label: 'OS & Licenses', icon: ShieldCheck },
    { id: 'assignment', label: 'Custodian & User', icon: User },
    { id: 'warranty', label: 'Warranty & Inward', icon: FileText },
    { id: 'history', label: 'Audit Trail', icon: History },
  ];

  return (
    <div className="modal-overlay asset-details-modal-overlay" onClick={onClose}>
      {/* Embedded Print CSS: Modern Executive Corporate Styling */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 6mm 8mm 6mm 8mm;
          }

          /* Completely hide the background application and non-printable elements */
          .app-main-layout,
          .no-print,
          .toast-container,
          aside,
          header,
          #mobile-nav-toggle {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* Reset page margins and layout */
          html, body, #root {
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            min-height: auto !important;
            overflow: visible !important;
            background: #ffffff !important;
            color: #0f172a !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
          }

          /* Modal overlay MUST be static (never fixed, avoids repeating header bug) */
          .modal-overlay.asset-details-modal-overlay {
            position: static !important;
            display: block !important;
            width: 100% !important;
            height: auto !important;
            min-height: auto !important;
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            inset: auto !important;
            backdrop-filter: none !important;
            z-index: auto !important;
          }

          .modal-content.asset-details-modal-content {
            position: static !important;
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
            box-shadow: none !important;
            border: none !important;
            background: #ffffff !important;
            color: #0f172a !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          /* Hide interactive screen modal elements in print */
          .modal-header,
          .modal-body,
          .modal-footer {
            display: none !important;
          }

          /* Display the Dedicated Official Print Document */
          .official-print-document {
            display: block !important;
            width: 100% !important;
            background: #ffffff !important;
            color: #0f172a !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .print-page {
            width: 100% !important;
            box-sizing: border-box !important;
            background: #ffffff !important;
          }

          .print-page-1 {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          .print-page-bill {
            page-break-before: always !important;
            break-before: page !important;
            min-height: 96vh !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
          }

          /* Executive Brand Header */
          .doc-header {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            border-bottom: 2.5px solid #0284c7 !important;
            padding-bottom: 6px !important;
            margin-bottom: 7px !important;
          }

          .doc-brand-block {
            display: flex !important;
            align-items: center !important;
            gap: 12px !important;
          }

          .doc-logo {
            height: 38px !important;
            width: auto !important;
            object-fit: contain !important;
          }

          .doc-org-name {
            font-size: 14pt !important;
            font-weight: 800 !important;
            letter-spacing: 0.04em !important;
            color: #0f172a !important;
            line-height: 1.15 !important;
          }

          .doc-dept-name {
            font-size: 7.2pt !important;
            font-weight: 700 !important;
            color: #0284c7 !important;
            letter-spacing: 0.05em !important;
            text-transform: uppercase !important;
            margin-top: 1px !important;
          }

          .doc-title {
            font-size: 8.8pt !important;
            font-weight: 700 !important;
            color: #334155 !important;
            letter-spacing: 0.02em !important;
            margin-top: 1px !important;
            text-transform: uppercase !important;
          }

          .doc-meta-card {
            border: 1px solid #cbd5e1 !important;
            border-radius: 5px !important;
            background: #f8fafc !important;
            padding: 4px 10px !important;
            font-size: 7.2pt !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 2px !important;
            min-width: 175px !important;
          }

          .doc-meta-row {
            display: flex !important;
            justify-content: space-between !important;
            gap: 10px !important;
          }

          .meta-lbl {
            font-weight: 700 !important;
            color: #64748b !important;
          }

          .meta-val {
            font-weight: 700 !important;
            color: #0f172a !important;
          }

          .status-pill {
            padding: 0 5px !important;
            border-radius: 3px !important;
            background: #e0f2fe !important;
            color: #0369a1 !important;
            font-weight: 800 !important;
          }

          /* Executive Hero Overview Bar */
          .doc-hero-bar {
            display: flex !important;
            justify-content: space-between !important;
            background: #f8fafc !important;
            border: 1px solid #cbd5e1 !important;
            border-left: 4.5px solid #0284c7 !important;
            border-radius: 5px !important;
            padding: 5px 12px !important;
            margin-bottom: 7px !important;
          }

          .hero-stat {
            display: flex !important;
            flex-direction: column !important;
          }

          .hero-lbl {
            font-size: 6.2pt !important;
            font-weight: 700 !important;
            color: #64748b !important;
            letter-spacing: 0.04em !important;
            text-transform: uppercase !important;
          }

          .hero-val {
            font-size: 8.2pt !important;
            font-weight: 700 !important;
            color: #0f172a !important;
          }

          .hero-val-lg {
            font-size: 10.5pt !important;
            font-weight: 800 !important;
            color: #0284c7 !important;
            font-family: Consolas, "Courier New", monospace !important;
          }

          .hero-val-mono {
            font-size: 8.2pt !important;
            font-weight: 700 !important;
            color: #0f172a !important;
            font-family: Consolas, "Courier New", monospace !important;
          }

          /* Perfectly Balanced 3-Row Section Grid */
          .doc-section-row {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 7px !important;
            margin-bottom: 7px !important;
          }

          /* Clean Modern Section Card */
          .doc-card {
            border: 1px solid #cbd5e1 !important;
            border-radius: 5px !important;
            background: #ffffff !important;
            overflow: hidden !important;
            display: flex !important;
            flex-direction: column !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .doc-card-header {
            background: #f1f5f9 !important;
            border-bottom: 1px solid #cbd5e1 !important;
            padding: 3.5px 8px !important;
            font-size: 7.6pt !important;
            font-weight: 800 !important;
            color: #0f172a !important;
            text-transform: uppercase !important;
            letter-spacing: 0.03em !important;
            display: flex !important;
            align-items: center !important;
            gap: 5px !important;
          }

          .card-dot {
            width: 5px !important;
            height: 5px !important;
            border-radius: 50% !important;
            background: #0284c7 !important;
            display: inline-block !important;
          }

          .doc-card-body {
            padding: 4px 8px !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 2.5px !important;
            flex: 1 !important;
          }

          .kv-row {
            display: flex !important;
            border-bottom: 1px solid #f1f5f9 !important;
            padding: 2.5px 0 !important;
            gap: 8px !important;
          }

          .kv-row:last-child {
            border-bottom: none !important;
          }

          .kv-item {
            flex: 1 !important;
            display: flex !important;
            flex-direction: column !important;
            min-width: 0 !important;
          }

          .kv-item.full-width {
            flex: 100% !important;
          }

          .kv-lbl {
            font-size: 6.4pt !important;
            font-weight: 700 !important;
            color: #64748b !important;
            text-transform: uppercase !important;
            letter-spacing: 0.02em !important;
            line-height: 1 !important;
            margin-bottom: 1px !important;
          }

          .kv-val {
            font-size: 8.2pt !important;
            color: #0f172a !important;
            line-height: 1.25 !important;
            word-break: break-word !important;
          }

          .font-bold {
            font-weight: 700 !important;
          }

          .font-mono {
            font-family: Consolas, "Courier New", monospace !important;
          }

          /* Signatures Block */
          .doc-sign-block {
            display: flex !important;
            justify-content: space-between !important;
            gap: 10px !important;
            margin-top: 8px !important;
            margin-bottom: 5px !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .sign-box {
            flex: 1 !important;
            border: 1px solid #cbd5e1 !important;
            border-radius: 5px !important;
            padding: 5px 8px !important;
            background: #f8fafc !important;
            text-align: center !important;
          }

          .sign-title {
            font-size: 6.8pt !important;
            font-weight: 800 !important;
            color: #475569 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.03em !important;
          }

          .sign-spacer {
            height: 24px !important;
          }

          .sign-line {
            border-top: 1px solid #94a3b8 !important;
            margin-bottom: 3px !important;
          }

          .sign-role {
            font-size: 7.4pt !important;
            font-weight: 700 !important;
            color: #0f172a !important;
          }

          .sign-date {
            font-size: 6.5pt !important;
            color: #64748b !important;
            margin-top: 1px !important;
          }

          /* Legal Notice & Footer */
          .doc-disclaimer {
            font-size: 6.4pt !important;
            color: #64748b !important;
            text-align: center !important;
            border-top: 1px dashed #cbd5e1 !important;
            padding-top: 3px !important;
            margin-top: 4px !important;
            line-height: 1.3 !important;
          }

          .doc-footer {
            display: flex !important;
            justify-content: space-between !important;
            font-size: 6.5pt !important;
            color: #64748b !important;
            border-top: 1px solid #cbd5e1 !important;
            padding-top: 3px !important;
            margin-top: 3px !important;
          }

          /* Full size bill on Page 2 */
          .bill-meta-ribbon {
            display: flex !important;
            justify-content: space-between !important;
            background: #f8fafc !important;
            border: 1px solid #cbd5e1 !important;
            border-radius: 4px !important;
            padding: 3px 8px !important;
            font-size: 7pt !important;
            margin-bottom: 6px !important;
          }

          .bill-fullsize-container {
            flex: 1 !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            border: 1px solid #cbd5e1 !important;
            border-radius: 6px !important;
            padding: 4mm !important;
            margin: 2mm 0 !important;
            background: #ffffff !important;
          }

          .bill-fullsize-image {
            max-width: 100% !important;
            max-height: 205mm !important;
            width: auto !important;
            height: auto !important;
            object-fit: contain !important;
            display: block !important;
            border-radius: 4px !important;
          }

          .bill-caption {
            font-size: 7.2pt !important;
            color: #64748b !important;
            margin-top: 6px !important;
            text-align: center !important;
            font-weight: 600 !important;
          }

          .bill-pdf-notice {
            padding: 35px !important;
            text-align: center !important;
            border: 1px dashed #64748b !important;
            border-radius: 6px !important;
            background: #f8fafc !important;
          }

          * {
            color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }

        @media screen {
          .official-print-document {
            display: none !important;
          }
        }
      `}</style>

      <div
        className="modal-content asset-details-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '1060px',
          width: '95vw',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          className="modal-header"
          style={{
            padding: '1.15rem 1.5rem',
            borderBottom: '1px solid var(--border-default)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8',
              }}
            >
              <Laptop size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {asset.make} {asset.model}
                </h2>
                <span
                  className="badge"
                  style={{
                    color: st.text,
                    backgroundColor: st.bg,
                    borderColor: st.border,
                    border: `1px solid ${st.border}`,
                    fontSize: '0.74rem',
                    padding: '0.15rem 0.55rem',
                  }}
                >
                  ● {asset.status}
                </span>
                {asset.userStatus && (
                  <span
                    style={{
                      fontSize: '0.72rem',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      backgroundColor: asset.userStatus.toLowerCase() === 'active' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                      color: asset.userStatus.toLowerCase() === 'active' ? '#34d399' : '#f87171',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      fontWeight: 600,
                    }}
                  >
                    User: {asset.userStatus}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 600, marginTop: '3px', fontFamily: 'var(--font-mono)' }}>
                S/N: {asset.sn || '109'} • Asset Tag: {asset.assetNo || '21'} • Hardware S/N: {asset.sr || 'N/A'} • Facility: {asset.plant || 'Vitromed'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {currentAsset?.invoiceImage && (
              <label
                className="no-print"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.35rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: includeBillInPrint ? 'var(--primary-light)' : 'var(--bg-surface-raised)',
                  border: '1px solid',
                  borderColor: includeBillInPrint ? 'var(--primary)' : 'var(--border-default)',
                  cursor: 'pointer',
                  fontSize: '0.76rem',
                  userSelect: 'none',
                  color: includeBillInPrint ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: includeBillInPrint ? 700 : 500,
                  transition: 'all 0.15s ease',
                }}
                title="When enabled, purchase bill is attached full-size on Page 2 in official printout. When disabled, bill is completely removed from print."
              >
                <input
                  type="checkbox"
                  checked={includeBillInPrint}
                  onChange={(e) => setIncludeBillInPrint(e.target.checked)}
                  style={{ cursor: 'pointer', accentColor: 'var(--primary)' }}
                />
                <span>Attach Bill ({includeBillInPrint ? 'Full Size (Page 2)' : 'Off'})</span>
              </label>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="btn btn-outline btn-sm no-print"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--primary)',
                borderColor: 'var(--border-focus)',
                fontSize: '0.78rem',
                fontWeight: 600,
              }}
              title={includeBillInPrint && currentAsset?.invoiceImage ? 'Print 2-page executive profile with full-size bill' : 'Print clean 1-page executive profile'}
            >
              <Printer size={14} />
              <span>{includeBillInPrint && currentAsset?.invoiceImage ? 'Print (2 Pages)' : 'Print Asset Sheet (1 Page)'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost btn-icon btn-sm no-print"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* View Mode Toolbar: Toggle between "All Details (One Page)" and "Tabbed View" */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.6rem 1.5rem',
            backgroundColor: 'var(--bg-surface-raised)',
            borderBottom: '1px solid var(--border-default)',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          {/* Mode Switcher */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '6px',
              padding: '2px',
              border: '1px solid var(--border-default)',
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode('single-page')}
              style={{
                padding: '0.35rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: viewMode === 'single-page' ? 700 : 500,
                borderRadius: '4px',
                border: 'none',
                backgroundColor: viewMode === 'single-page' ? 'var(--primary-light)' : 'transparent',
                color: viewMode === 'single-page' ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <FileText size={13} />
              <span>All Details (One Page)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('tabs')}
              style={{
                padding: '0.35rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: viewMode === 'tabs' ? 700 : 500,
                borderRadius: '4px',
                border: 'none',
                backgroundColor: viewMode === 'tabs' ? 'var(--primary-light)' : 'transparent',
                color: viewMode === 'tabs' ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Layers size={13} />
              <span>Tabs View</span>
            </button>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Complete 38-Column IT Asset Master Profile
          </div>
        </div>

        {/* Tab Navigation if user switches to Tabs View */}
        {viewMode === 'tabs' && (
          <div
            className="no-print"
            style={{
              display: 'flex',
              gap: '0.35rem',
              padding: '0.65rem 1.5rem',
              borderBottom: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-surface-raised)',
              overflowX: 'auto',
            }}
          >
            {tabs.map((t) => {
              const Icon = t.icon;
              const isAct = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.42rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid',
                    borderColor: isAct ? 'rgba(99, 102, 241, 0.3)' : 'transparent',
                    backgroundColor: isAct ? 'var(--primary-light)' : 'transparent',
                    color: isAct ? '#ffffff' : 'var(--text-muted)',
                    fontSize: '0.78rem',
                    fontWeight: isAct ? 700 : 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Icon size={14} color={isAct ? '#38bdf8' : 'var(--text-faint)'} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div
          className="modal-body"
          style={{
            padding: '1.5rem',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          {/* ============================================================== */}
          {/* OPTION A: UNIFIED DETAILED PAGE IN ONE PAGE (ALL 38 COLUMNS)  */}
          {/* ============================================================== */}
          {viewMode === 'single-page' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* TOP MASTER IDENTITY STRIP */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                  gap: '0.75rem',
                  backgroundColor: 'var(--bg-surface-raised)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '10px',
                  padding: '1rem 1.25rem',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)', textTransform: 'uppercase' }}>1. S/N Index</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                    #{asset.sn || '109'}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)', textTransform: 'uppercase' }}>2. Plant Facility</span>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {asset.plant || 'Vitromed'}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)', textTransform: 'uppercase' }}>3. Assest No.</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                    {asset.assetNo || '21'}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)', textTransform: 'uppercase' }}>17. Serial Number</span>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fbbf24', fontFamily: 'var(--font-mono)' }}>
                    {asset.sr || 'CND744D8ZH'}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)', textTransform: 'uppercase' }}>11. Host-Name</span>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                    {asset.hostName || 'CCTV'}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)', textTransform: 'uppercase' }}>12. IP Address</span>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                    {asset.ipAddress || '192.168.8.123'}
                  </div>
                </div>
              </div>

              {/* SECTION 1: CUSTODIAN & USER ALLOCATION (Cols 4, 5, 6, 7, 8, 9) */}
              <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
                  <User size={16} color="#38bdf8" />
                  <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    1. Custodian & Allocation Details
                  </h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.85rem', fontSize: '0.8rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-faint)', fontSize: '0.72rem' }}>5. User Name (Assigned):</span>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {asset.userName || 'CCTV / Mahendra Yadav / Rajnath Singh'}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-faint)', fontSize: '0.72rem' }}>4. User Status:</span>
                    <div style={{ fontWeight: 700, color: '#34d399', marginTop: '2px' }}>
                      {asset.userStatus || 'Active'}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-faint)', fontSize: '0.72rem' }}>6. Emp. Code:</span>
                    <div style={{ fontWeight: 700, color: '#38bdf8', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                      {asset.empCode || 'OS1130'}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-faint)', fontSize: '0.72rem' }}>7. Mail Id's:</span>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {asset.mailId || 'cctvit@vitromed.co.in'}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-faint)', fontSize: '0.72rem' }}>8. Department:</span>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {asset.department || 'IT'}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-faint)', fontSize: '0.72rem' }}>9. Official Number:</span>
                    <div style={{ fontWeight: 700, color: '#fbbf24', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                      {asset.officialNumber || '8000929236'}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: NETWORK & ENDPOINT IDENTITY (Cols 10, 11, 12, 13, 29) */}
              <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
                  <Wifi size={16} color="#34d399" />
                  <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    2. Network, PC Group & Security Policy
                  </h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.85rem', fontSize: '0.8rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-faint)', fontSize: '0.72rem' }}>10. PC Group:</span>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {asset.pcGroup || 'Workgroup'}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-faint)', fontSize: '0.72rem' }}>11. Host-Name:</span>
                    <div style={{ fontWeight: 700, color: '#38bdf8', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                      {asset.hostName || 'CCTV'}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-faint)', fontSize: '0.72rem' }}>12. IP Address:</span>
                    <div style={{ fontWeight: 700, color: '#34d399', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                      {asset.ipAddress || '192.168.8.123'}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-faint)', fontSize: '0.72rem' }}>13. eScan Policy:</span>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {asset.escanPolicy || 'Profile'}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-faint)', fontSize: '0.72rem' }}>29. Antivirus:</span>
                    <div style={{ fontWeight: 700, color: '#38bdf8', marginTop: '2px' }}>
                      {asset.antivirus || 'eScan'}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-faint)', fontSize: '0.72rem' }}>MAC Address:</span>
                    <div style={{ fontWeight: 600, color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                      {asset.macAddress || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: HARDWARE SPECIFICATIONS & DISPLAY (Cols 14, 15, 16, 17, 31, 32, 33, 34, 35, 36, 37) */}
              <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
                  <Cpu size={16} color="#fbbf24" />
                  <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    3. Hardware Specifications & Peripherals
                  </h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.85rem', fontSize: '0.8rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-faint)', fontSize: '0.72rem' }}>14. System Type:</span>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {asset.deviceType || 'Laptop'}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-faint)', fontSize: '0.72rem' }}>15. System Brand:</span>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {asset.make || 'HP'}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-faint)', fontSize: '0.72rem' }}>16. Model No.:</span>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {asset.model || 'HP Laptop 15-bs1xx'}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-faint)', fontSize: '0.72rem' }}>17. Serial Number:</span>
                    <div style={{ fontWeight: 800, color: '#fbbf24', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                      {asset.sr || 'CND744D8ZH'}
                    </div>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span style={{ color: 'var(--text-faint)', fontSize: '0.72rem' }}>31. Processor Full Detail's:</span>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {asset.processor || '8th Gen Intel(R) Core(TM) i5-8250 CPU @ 1.60GHz 1.80 GHz'}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-faint)', fontSize: '0.72rem' }}>32. RAM:</span>
                    <div style={{ fontWeight: 700, color: '#38bdf8', marginTop: '2px' }}>
                      {asset.ramSize || '8 GB'}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-faint)', fontSize: '0.72rem' }}>33. HDD / Storage:</span>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {asset.storage || '120 GB M.2 SSD + 1 TB HDD'}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-faint)', fontSize: '0.72rem' }}>34. LCD Screen:</span>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {asset.monitorDetails || '22 inch'}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-faint)', fontSize: '0.72rem' }}>35. LCD Sr. No:</span>
                    <div style={{ fontWeight: 600, color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                      {asset.monitorSerialNo || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-faint)', fontSize: '0.72rem' }}>36. Data Backup:</span>
                    <div style={{ fontWeight: 700, color: '#34d399', marginTop: '2px' }}>
                      {asset.dataBackup || 'Daily Backup'}
                    </div>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span style={{ color: 'var(--text-faint)', fontSize: '0.72rem' }}>37. Mobiles, Accessories & Peripherals:</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '4px' }}>
                      {asset.accessories ? (
                        asset.accessories.split(',').map((acc, idx) => {
                          const item = acc.trim();
                          if (!item) return null;
                          return (
                            <span
                              key={idx}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                fontSize: '0.74rem',
                                fontWeight: 600,
                                backgroundColor: 'rgba(2, 132, 199, 0.09)',
                                color: 'var(--color-primary, #0284c7)',
                                border: '1px solid rgba(2, 132, 199, 0.22)',
                                padding: '0.2rem 0.55rem',
                                borderRadius: '4px',
                              }}
                            >
                              ✓ {item}
                            </span>
                          );
                        })
                      ) : (
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>None</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 4: OPERATING SYSTEM & SOFTWARE LICENSES (Cols 20, 21, 22, 23, 24, 25, 26, 30) */}
              <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
                  <ShieldCheck size={16} color="#38bdf8" />
                  <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    4. Operating System & Software Licensing
                  </h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.85rem', fontSize: '0.8rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-faint)', fontSize: '0.72rem' }}>20. Windows:</span>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {asset.osVersion || 'Windows 10 Professional 64-bit'}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-faint)', fontSize: '0.72rem' }}>21. Windows Type:</span>
                    <div style={{ fontWeight: 700, color: '#38bdf8', marginTop: '2px' }}>
                      {asset.windowsType || 'OPEN OS'}
                    </div>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: 'var(--text-faint)', fontSize: '0.72rem' }}>22. Windows License Keys:</span>
                    <div style={{ fontWeight: 700, color: '#38bdf8', marginTop: '2px', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
                      {asset.windowsKey || '9QN27-QC4RM-YQ3TD-MV6RH-KHJXM'}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-faint)', fontSize: '0.72rem' }}>23. Office Software’s:</span>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {asset.officeSoftware || 'MS Office 2013 Std'}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-faint)', fontSize: '0.72rem' }}>25. Mail Software:</span>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {asset.mailSoftware || 'Online WPA'}
                    </div>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: 'var(--text-faint)', fontSize: '0.72rem' }}>24. Office License Keys:</span>
                    <div style={{ fontWeight: 700, color: '#38bdf8', marginTop: '2px', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
                      {asset.officeKey || 'XWNTF-9DHKH-B48X3-PJ4C2-27GYG'}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-faint)', fontSize: '0.72rem' }}>26. SAP ID:</span>
                    <div style={{ fontWeight: 600, color: 'var(--text-muted)', marginTop: '2px' }}>
                      {asset.sapId || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-faint)', fontSize: '0.72rem' }}>30. Other Software:</span>
                    <div style={{ fontWeight: 600, color: 'var(--text-muted)', marginTop: '2px' }}>
                      {asset.otherSoftware || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 5: SYSTEM LOGIN & CREDENTIALS (Cols 27, 28) */}
              <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
                  <Key size={16} color="#f472b6" />
                  <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    5. Local Machine Credentials & Security Access
                  </h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.85rem', fontSize: '0.8rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-faint)', fontSize: '0.72rem' }}>27. User Name (Login):</span>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {asset.loginUserName || 'Vitromed'}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-faint)', fontSize: '0.72rem' }}>28. New ID/Login Password:</span>
                    <div style={{ fontWeight: 800, color: '#fbbf24', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                      {asset.loginPassword || 'Vitromed / CCTV@121'}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-faint)', fontSize: '0.72rem' }}>VNC Remote Password:</span>
                    <div style={{ fontWeight: 700, color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                      {asset.vncPassword || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 6: PROCUREMENT, WARRANTY & REMARKS (Cols 18, 19, 38) */}
              <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
                  <FileText size={16} color="#c084fc" />
                  <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    6. Procurement, Inward & Warranty
                  </h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.85rem', fontSize: '0.8rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-faint)', fontSize: '0.72rem' }}>18. Bill Copy & Date:</span>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {asset.billCopyDate || asset.billNo || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-faint)', fontSize: '0.72rem' }}>19. Warranty Details:</span>
                    <div style={{ fontWeight: 700, color: '#38bdf8', marginTop: '2px' }}>
                      {asset.warrantyDetails || '13-12-2017 to 10-02-2019'}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-faint)', fontSize: '0.72rem' }}>Working Condition:</span>
                    <div style={{ fontWeight: 700, color: '#34d399', marginTop: '2px' }}>
                      {asset.workingCondition || 'Good'}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-faint)', fontSize: '0.72rem' }}>Vendor / Source:</span>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {asset.vendorName || 'Authorized OEM Partner'}
                    </div>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span style={{ color: 'var(--text-faint)', fontSize: '0.72rem' }}>38. Remark:</span>
                    <div style={{ fontWeight: 500, color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {currentAsset.remarks || 'No remarks recorded.'}
                    </div>
                  </div>
                </div>

                {/* --- DEDICATED BILL & INVOICE IMAGE SECTION --- */}
                <div
                  style={{
                    marginTop: '1.25rem',
                    paddingTop: '1.15rem',
                    borderTop: '1px solid var(--border-default)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '0.65rem',
                      marginBottom: '0.85rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Receipt size={16} color="var(--primary)" />
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        18. Official Bill & Invoice Copy
                      </span>
                      {currentAsset.invoiceImage ? (
                        <>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              padding: '0.12rem 0.5rem',
                              borderRadius: 'var(--radius-full)',
                              backgroundColor: 'rgba(16, 185, 129, 0.12)',
                              color: '#059669',
                              border: '1px solid rgba(16, 185, 129, 0.28)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                            }}
                          >
                            <Check size={11} /> Bill Scan Attached
                          </span>
                          <label
                            className="no-print"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              fontSize: '0.72rem',
                              cursor: 'pointer',
                              color: includeBillInPrint ? 'var(--primary)' : 'var(--text-muted)',
                              fontWeight: includeBillInPrint ? 700 : 500,
                              marginLeft: '0.35rem',
                              userSelect: 'none',
                            }}
                            title="Attach full-size bill copy as Page 2 when printing"
                          >
                            <input
                              type="checkbox"
                              checked={includeBillInPrint}
                              onChange={(e) => setIncludeBillInPrint(e.target.checked)}
                              style={{ cursor: 'pointer', accentColor: 'var(--primary)' }}
                            />
                            <span>Include Full-Size in Print (Page 2)</span>
                          </label>
                        </>
                      ) : (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            padding: '0.12rem 0.5rem',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: 'rgba(239, 68, 68, 0.08)',
                            color: '#dc2626',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                          }}
                        >
                          No Bill Attached
                        </span>
                      )}
                    </div>

                    {/* Action Controls (Upload, Enlarge, Download, Detach) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }} className="no-print">
                      <input
                        ref={billFileInputRef}
                        type="file"
                        accept="image/*,application/pdf"
                        style={{ display: 'none' }}
                        onChange={handleBillUpload}
                      />
                      <button
                        type="button"
                        onClick={() => billFileInputRef.current?.click()}
                        disabled={uploadingBill}
                        className="btn btn-outline btn-xs"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <Upload size={12} />
                        <span>{uploadingBill ? 'Uploading...' : currentAsset.invoiceImage ? 'Change Bill Scan' : 'Attach Bill Image'}</span>
                      </button>

                      {currentAsset.invoiceImage && (
                        <>
                          <button
                            type="button"
                            onClick={() => setLightboxOpen(true)}
                            className="btn btn-primary btn-xs"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                          >
                            <ZoomIn size={12} />
                            <span>View Fullscreen</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleDownloadBill}
                            className="btn btn-outline btn-xs"
                            title="Download Bill Image / File"
                          >
                            <Download size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={handleDeleteBill}
                            disabled={uploadingBill}
                            className="btn btn-ghost btn-xs"
                            style={{ color: '#ef4444' }}
                            title="Remove Bill Document"
                          >
                            <Trash2 size={12} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Thumbnail Preview or Empty Upload Dropzone */}
                  {currentAsset.invoiceImage ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      <div
                        onClick={() => setLightboxOpen(true)}
                        style={{
                          position: 'relative',
                          borderRadius: 'var(--radius-md)',
                          overflow: 'hidden',
                          border: '1px solid var(--border-default)',
                          backgroundColor: 'var(--bg-surface-raised)',
                          cursor: 'pointer',
                          maxHeight: '340px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0.5rem',
                          transition: 'border-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-focus)')}
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-default)')}
                        title="Click to view full screen with zoom and rotate"
                      >
                        {isPdfDocument ? (
                          <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
                            <FileText size={44} color="var(--primary)" style={{ margin: '0 auto 0.5rem' }} />
                            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                              PDF Invoice Document Attached
                            </div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                              Click to view PDF in full screen lightbox or download
                            </div>
                          </div>
                        ) : (
                          <>
                            <img
                              src={currentAsset.invoiceImage}
                              alt="Asset Purchase Bill"
                              style={{
                                maxWidth: '100%',
                                maxHeight: '320px',
                                objectFit: 'contain',
                                borderRadius: 'var(--radius-sm)',
                                display: 'block',
                              }}
                            />
                            <div
                              style={{
                                position: 'absolute',
                                bottom: '12px',
                                right: '12px',
                                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                                color: '#ffffff',
                                padding: '0.3rem 0.65rem',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.72rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                pointerEvents: 'none',
                                backdropFilter: 'blur(4px)',
                              }}
                            >
                              <ZoomIn size={12} /> Click to Enlarge / Zoom
                            </div>
                          </>
                        )}
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '0.72rem',
                          color: 'var(--text-faint)',
                        }}
                      >
                        <span>
                          Reference: <strong>{currentAsset.billCopyDate || currentAsset.billNo || 'Official Purchase Bill'}</strong>
                        </span>
                        <span>Click preview to zoom in, rotate 90°, print, or download</span>
                      </div>
                    </div>
                  ) : (
                    /* Clean Dropzone for Missing Bill */
                    <div
                      onClick={() => billFileInputRef.current?.click()}
                      style={{
                        border: '2px dashed var(--border-default)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1.75rem 1.5rem',
                        textAlign: 'center',
                        backgroundColor: 'var(--bg-surface-raised)',
                        cursor: 'pointer',
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
                      <ImageIcon size={30} color="var(--primary)" style={{ margin: '0 auto 0.45rem', opacity: 0.8 }} />
                      <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                        No Bill or Invoice Scan Attached
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        Click here to upload OEM purchase bill photo, scanned invoice, or receipt
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)', marginTop: '0.3rem' }}>
                        Supports JPG, PNG, WebP image scans & PDF documents (up to 10MB)
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* OPTION B: TABBED VIEW (IF USER CHOOSES TABS MODE)              */}
          {/* ============================================================== */}
          {viewMode === 'tabs' && (
            <div>
              {tab === 'overview' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div className="card" style={{ padding: '1rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>Current Custodian</span>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                      {asset.userName || 'Unassigned'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: '2px' }}>
                      {asset.empCode ? `Code: ${asset.empCode}` : ''}
                    </div>
                  </div>
                  <div className="card" style={{ padding: '1rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>Department & Plant</span>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                      {asset.department}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {asset.plant}
                    </div>
                  </div>
                  <div className="card" style={{ padding: '1rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>Network Host</span>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>
                      {asset.hostName || 'CCTV'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                      {asset.ipAddress || '192.168.8.123'}
                    </div>
                  </div>
                </div>
              )}

              {tab === 'specs' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div className="card" style={{ padding: '1rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>Processor Full Detail's</span>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>{asset.processor}</div>
                  </div>
                  <div className="card" style={{ padding: '1rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>RAM</span>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>{asset.ramSize}</div>
                  </div>
                  <div className="card" style={{ padding: '1rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>HDD / Storage</span>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>{asset.storage}</div>
                  </div>
                  <div className="card" style={{ padding: '1rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>LCD Screen</span>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>{asset.monitorDetails}</div>
                  </div>
                  <div className="card" style={{ padding: '1rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>Accessories & Other</span>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>{asset.accessories}</div>
                  </div>
                  <div className="card" style={{ padding: '1rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>Data Backup</span>
                    <div style={{ fontWeight: 700, color: '#34d399', marginTop: '0.25rem' }}>{asset.dataBackup}</div>
                  </div>
                </div>
              )}

              {tab === 'software' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div className="card" style={{ padding: '1rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>Windows Edition</span>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>{asset.osVersion}</div>
                  </div>
                  <div className="card" style={{ padding: '1rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>Windows License Key</span>
                    <div style={{ fontWeight: 700, color: '#38bdf8', marginTop: '0.25rem', fontFamily: 'var(--font-mono)' }}>{asset.windowsKey}</div>
                  </div>
                  <div className="card" style={{ padding: '1rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>Office Software</span>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>{asset.officeSoftware}</div>
                  </div>
                  <div className="card" style={{ padding: '1rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>Office License Key</span>
                    <div style={{ fontWeight: 700, color: '#38bdf8', marginTop: '0.25rem', fontFamily: 'var(--font-mono)' }}>{asset.officeKey}</div>
                  </div>
                  <div className="card" style={{ padding: '1rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>Local Login ID/Password</span>
                    <div style={{ fontWeight: 700, color: '#fbbf24', marginTop: '0.25rem', fontFamily: 'var(--font-mono)' }}>{asset.loginPassword}</div>
                  </div>
                </div>
              )}

              {tab === 'assignment' && (
                <div className="card" style={{ padding: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem' }}>Employee Allocation</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem' }}>
                    <div><span style={{ color: 'var(--text-faint)' }}>Custodian:</span> <strong>{asset.userName}</strong></div>
                    <div><span style={{ color: 'var(--text-faint)' }}>Code:</span> <strong>{asset.empCode}</strong></div>
                    <div><span style={{ color: 'var(--text-faint)' }}>Email:</span> <strong>{asset.mailId}</strong></div>
                    <div><span style={{ color: 'var(--text-faint)' }}>Official Number:</span> <strong>{asset.officialNumber}</strong></div>
                  </div>
                </div>
              )}

              {tab === 'warranty' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="card" style={{ padding: '1.25rem' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem' }}>Warranty & Procurement</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem' }}>
                      <div><span style={{ color: 'var(--text-faint)' }}>Warranty Details:</span> <strong>{currentAsset.warrantyDetails || 'Standard Warranty'}</strong></div>
                      <div><span style={{ color: 'var(--text-faint)' }}>Bill Copy & Date:</span> <strong>{currentAsset.billCopyDate || currentAsset.billNo || 'N/A'}</strong></div>
                      <div><span style={{ color: 'var(--text-faint)' }}>Working Condition:</span> <strong>{currentAsset.workingCondition || 'Good'}</strong></div>
                      <div><span style={{ color: 'var(--text-faint)' }}>Vendor / Source:</span> <strong>{currentAsset.vendorName || 'Authorized OEM Partner'}</strong></div>
                    </div>
                  </div>

                  {/* Bill Image Viewer in Warranty Tab */}
                  <div className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Receipt size={16} color="var(--primary)" />
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0 }}>Official Bill & Invoice Copy</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => billFileInputRef.current?.click()}
                        disabled={uploadingBill}
                        className="btn btn-outline btn-xs"
                      >
                        <Upload size={12} />
                        <span>{uploadingBill ? 'Uploading...' : currentAsset.invoiceImage ? 'Change Bill Scan' : 'Attach Bill Image'}</span>
                      </button>
                    </div>

                    {currentAsset.invoiceImage ? (
                      <div
                        onClick={() => setLightboxOpen(true)}
                        style={{
                          borderRadius: 'var(--radius-md)',
                          overflow: 'hidden',
                          border: '1px solid var(--border-default)',
                          backgroundColor: 'var(--bg-surface-raised)',
                          cursor: 'pointer',
                          maxHeight: '280px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0.5rem',
                        }}
                      >
                        {isPdfDocument ? (
                          <div style={{ padding: '2rem', textAlign: 'center' }}>
                            <FileText size={36} color="var(--primary)" style={{ margin: '0 auto 0.5rem' }} />
                            <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>PDF Invoice Document Attached</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Click to view full screen</div>
                          </div>
                        ) : (
                          <img
                            src={currentAsset.invoiceImage}
                            alt="Asset Purchase Bill"
                            style={{ maxWidth: '100%', maxHeight: '260px', objectFit: 'contain' }}
                          />
                        )}
                      </div>
                    ) : (
                      <div
                        onClick={() => billFileInputRef.current?.click()}
                        style={{
                          border: '2px dashed var(--border-default)',
                          borderRadius: 'var(--radius-md)',
                          padding: '1.5rem',
                          textAlign: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <ImageIcon size={26} color="var(--primary)" style={{ margin: '0 auto 0.4rem', opacity: 0.8 }} />
                        <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>No bill image attached</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Click to upload invoice or purchase receipt</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {tab === 'history' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {(!asset.history || asset.history.length === 0) ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-faint)' }}>
                      No historical lifecycle logs recorded for this machine.
                    </div>
                  ) : (
                    asset.history.map((h, i) => (
                      <div
                        key={h._id || i}
                        style={{
                          padding: '0.75rem 1rem',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: '1rem',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                            {h.action}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {h.details}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)', marginTop: '4px' }}>
                            Actor: {h.user || 'System Ingestion'}
                          </div>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)', whiteSpace: 'nowrap' }}>
                          {h.date ? new Date(h.date).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer with Actions */}
        <div
          className="modal-footer no-print"
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border-default)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {asset.status === 'Available' && onAssign && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onAssign(asset);
                }}
                className="btn btn-primary btn-sm"
                style={{ backgroundColor: '#059669', borderColor: '#059669' }}
              >
                <UserCheck size={14} />
                <span>Assign to Staff</span>
              </button>
            )}

            {asset.status === 'Assigned' && onTransfer && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onTransfer(asset);
                }}
                className="btn btn-primary btn-sm"
                style={{ backgroundColor: '#4f46e5', borderColor: '#4f46e5' }}
              >
                <ArrowRightLeft size={14} />
                <span>Transfer Custody</span>
              </button>
            )}

            {asset.status === 'Assigned' && onReturn && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onReturn(asset);
                }}
                className="btn btn-outline btn-sm"
                style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)' }}
              >
                <Undo2 size={14} />
                <span>Return to Stock</span>
              </button>
            )}

            {asset.status === 'Under Maintenance' && (onMaintenanceReturn || onReturn) && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onMaintenanceReturn) onMaintenanceReturn(asset);
                  else onReturn(asset);
                }}
                className="btn btn-primary btn-sm"
                style={{ backgroundColor: '#059669', borderColor: '#059669' }}
              >
                <CheckCircle2 size={14} />
                <span>Record Return from Repair</span>
              </button>
            )}

            {onMaintenance && asset.status !== 'Under Maintenance' && asset.status !== 'Retired' && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onMaintenance(asset);
                }}
                className="btn btn-outline btn-sm"
                style={{ color: '#fbbf24', borderColor: 'rgba(251, 191, 36, 0.4)' }}
              >
                <Wrench size={14} />
                <span>Log Service</span>
              </button>
            )}

            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(asset);
                }}
                className="btn btn-outline btn-sm"
              >
                <Edit3 size={14} />
                <span>Edit Asset</span>
              </button>
            )}

            {onRetire && asset.status !== 'Retired' && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRetire(asset);
                }}
                className="btn btn-outline btn-sm"
                style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.35)' }}
                title="Decommission or retire asset"
              >
                <span>📦 Retire Asset</span>
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDelete(asset);
                }}
                className="btn btn-ghost btn-sm"
                style={{ color: '#f87171' }}
                title="Permanently remove asset record"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            )}
          </div>

          <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
            Close
          </button>
        </div>

        {/* ============================================================== */}
        {/* OFFICIAL CORPORATE IT ASSET PRINT DOCUMENT (PRINT-ONLY)        */}
        {/* Modern Executive Corporate Styling — Clean, Balanced, Proportional */}
        {/* ============================================================== */}
        <div className="official-print-document">
          {/* --- PAGE 1: IT ASSET SPECIFICATION & ALLOCATION RECORD --- */}
          <div className="print-page print-page-1">
            {/* Corporate Brand Header with Actual Vitromed Logo */}
            <div className="doc-header">
              <div className="doc-brand-block">
                <img src={logo} alt="Vitromed Logo" className="doc-logo" />
                <div>
                  <div className="doc-org-name">VITROMED HEALTHCARE</div>
                  <div className="doc-dept-name">INFORMATION TECHNOLOGY DIVISION • ASSET OPERATIONS</div>
                  <div className="doc-title">IT Asset Specification & Verification Record</div>
                </div>
              </div>
              <div className="doc-meta-card">
                <div className="doc-meta-row">
                  <span className="meta-lbl">DOC REF:</span>
                  <span className="meta-val font-mono">VTR/IT/{currentAsset.assetNo || currentAsset.sn || '001'}</span>
                </div>
                <div className="doc-meta-row">
                  <span className="meta-lbl">PRINT DATE:</span>
                  <span className="meta-val">{new Date().toLocaleDateString('en-GB')}</span>
                </div>
                <div className="doc-meta-row">
                  <span className="meta-lbl">FACILITY:</span>
                  <span className="meta-val">{currentAsset.plant || 'Vitromed'}</span>
                </div>
                <div className="doc-meta-row">
                  <span className="meta-lbl">STATUS:</span>
                  <span className="meta-val status-pill">{currentAsset.status || 'Active'}</span>
                </div>
              </div>
            </div>

            {/* Executive Hero Overview Strip */}
            <div className="doc-hero-bar">
              <div className="hero-stat">
                <span className="hero-lbl">ASSET TAG</span>
                <span className="hero-val-lg">#{currentAsset.assetNo || 'N/A'}</span>
              </div>
              <div className="hero-stat">
                <span className="hero-lbl">HARDWARE SERIAL NO.</span>
                <span className="hero-val-mono">{currentAsset.sr || 'N/A'}</span>
              </div>
              <div className="hero-stat">
                <span className="hero-lbl">SYSTEM MAKE & MODEL</span>
                <span className="hero-val">{formatMakeModel(currentAsset.make, currentAsset.model)}</span>
              </div>
              <div className="hero-stat">
                <span className="hero-lbl">CURRENT CUSTODIAN</span>
                <span className="hero-val">{currentAsset.userName || 'Unassigned'}</span>
              </div>
              <div className="hero-stat">
                <span className="hero-lbl">HOSTNAME & IP ADDRESS</span>
                <span className="hero-val-mono">{currentAsset.hostName || 'N/A'} • {currentAsset.ipAddress || 'N/A'}</span>
              </div>
            </div>

            {/* 3 Balanced Symmetrical Rows */}
            {/* ROW 1: CUSTODIAN & ALLOCATION (Left) + NETWORK & SECURITY (Right) */}
            <div className="doc-section-row">
              {/* 1. Custodian & Allocation Details */}
              <div className="doc-card">
                <div className="doc-card-header">
                  <span className="card-dot"></span>
                  <span>1. Custodian & Allocation Details</span>
                </div>
                <div className="doc-card-body">
                  <div className="kv-row">
                    <div className="kv-item"><span className="kv-lbl">Assigned User:</span><span className="kv-val font-bold">{currentAsset.userName || 'Unassigned'}</span></div>
                    <div className="kv-item"><span className="kv-lbl">User Status:</span><span className="kv-val font-bold" style={{ color: currentAsset.userStatus?.toLowerCase() === 'active' ? '#059669' : '#dc2626' }}>{currentAsset.userStatus || 'Active'}</span></div>
                  </div>
                  <div className="kv-row">
                    <div className="kv-item"><span className="kv-lbl">Emp. Code:</span><span className="kv-val font-mono font-bold">{currentAsset.empCode || 'N/A'}</span></div>
                    <div className="kv-item"><span className="kv-lbl">Department:</span><span className="kv-val font-bold">{currentAsset.department || 'IT'}</span></div>
                  </div>
                  <div className="kv-row">
                    <div className="kv-item"><span className="kv-lbl">Official Email:</span><span className="kv-val">{currentAsset.mailId || 'N/A'}</span></div>
                    <div className="kv-item"><span className="kv-lbl">Official Phone:</span><span className="kv-val font-mono">{currentAsset.officialNumber || 'N/A'}</span></div>
                  </div>
                </div>
              </div>

              {/* 2. Network & Endpoint Configuration */}
              <div className="doc-card">
                <div className="doc-card-header">
                  <span className="card-dot"></span>
                  <span>2. Network & Endpoint Security</span>
                </div>
                <div className="doc-card-body">
                  <div className="kv-row">
                    <div className="kv-item"><span className="kv-lbl">Host-Name:</span><span className="kv-val font-bold font-mono">{currentAsset.hostName || 'N/A'}</span></div>
                    <div className="kv-item"><span className="kv-lbl">IP Address:</span><span className="kv-val font-bold font-mono">{currentAsset.ipAddress || 'N/A'}</span></div>
                  </div>
                  <div className="kv-row">
                    <div className="kv-item"><span className="kv-lbl">PC Group / Workgroup:</span><span className="kv-val">{currentAsset.pcGroup || 'Workgroup'}</span></div>
                    <div className="kv-item"><span className="kv-lbl">MAC Address:</span><span className="kv-val font-mono">{currentAsset.macAddress || 'N/A'}</span></div>
                  </div>
                  <div className="kv-row">
                    <div className="kv-item"><span className="kv-lbl">Antivirus Suite:</span><span className="kv-val font-bold">{currentAsset.antivirus || 'eScan'}</span></div>
                    <div className="kv-item"><span className="kv-lbl">eScan Policy:</span><span className="kv-val">{currentAsset.escanPolicy || 'Profile'}</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 2: HARDWARE SPECIFICATIONS (Left) + OPERATING SYSTEM & SOFTWARE (Right) */}
            <div className="doc-section-row">
              {/* 3. Hardware Specifications & Peripherals */}
              <div className="doc-card">
                <div className="doc-card-header">
                  <span className="card-dot"></span>
                  <span>3. Hardware Specifications & Peripherals</span>
                </div>
                <div className="doc-card-body">
                  <div className="kv-row">
                    <div className="kv-item"><span className="kv-lbl">System Type:</span><span className="kv-val font-bold">{currentAsset.deviceType || 'Laptop'}</span></div>
                    <div className="kv-item"><span className="kv-lbl">Brand / Make:</span><span className="kv-val font-bold">{currentAsset.make || 'N/A'}</span></div>
                  </div>
                  <div className="kv-row">
                    <div className="kv-item"><span className="kv-lbl">Model No:</span><span className="kv-val">{currentAsset.model || 'N/A'}</span></div>
                    <div className="kv-item"><span className="kv-lbl">Hardware Serial:</span><span className="kv-val font-mono font-bold">{currentAsset.sr || 'N/A'}</span></div>
                  </div>
                  <div className="kv-row">
                    <div className="kv-item full-width"><span className="kv-lbl">Processor:</span><span className="kv-val">{currentAsset.processor || 'N/A'}</span></div>
                  </div>
                  <div className="kv-row">
                    <div className="kv-item"><span className="kv-lbl">RAM Capacity:</span><span className="kv-val font-bold">{currentAsset.ramSize || 'N/A'}</span></div>
                    <div className="kv-item"><span className="kv-lbl">Storage (HDD/SSD):</span><span className="kv-val">{currentAsset.storage || 'N/A'}</span></div>
                  </div>
                  <div className="kv-row">
                    <div className="kv-item"><span className="kv-lbl">LCD Screen:</span><span className="kv-val">{currentAsset.monitorDetails || 'N/A'}</span></div>
                    <div className="kv-item"><span className="kv-lbl">LCD Sr. No:</span><span className="kv-val font-mono">{currentAsset.monitorSerialNo || 'N/A'}</span></div>
                  </div>
                  <div className="kv-row">
                    <div className="kv-item"><span className="kv-lbl">Data Backup:</span><span className="kv-val font-bold">{currentAsset.dataBackup || 'Daily Backup'}</span></div>
                    <div className="kv-item"><span className="kv-lbl">Accessories:</span><span className="kv-val">{currentAsset.accessories || 'N/A'}</span></div>
                  </div>
                </div>
              </div>

              {/* 4. Operating System & Software Licensing */}
              <div className="doc-card">
                <div className="doc-card-header">
                  <span className="card-dot"></span>
                  <span>4. Operating System & Software Licenses</span>
                </div>
                <div className="doc-card-body">
                  <div className="kv-row">
                    <div className="kv-item"><span className="kv-lbl">Windows OS:</span><span className="kv-val font-bold">{currentAsset.osVersion || 'N/A'}</span></div>
                    <div className="kv-item"><span className="kv-lbl">License Type:</span><span className="kv-val">{currentAsset.windowsType || 'OPEN OS'}</span></div>
                  </div>
                  <div className="kv-row">
                    <div className="kv-item full-width"><span className="kv-lbl">Windows Key:</span><span className="kv-val font-mono font-bold">{currentAsset.windowsKey || 'N/A'}</span></div>
                  </div>
                  <div className="kv-row">
                    <div className="kv-item"><span className="kv-lbl">Office Suite:</span><span className="kv-val font-bold">{currentAsset.officeSoftware || 'N/A'}</span></div>
                    <div className="kv-item"><span className="kv-lbl">SAP User ID:</span><span className="kv-val font-mono">{currentAsset.sapId || 'N/A'}</span></div>
                  </div>
                  <div className="kv-row">
                    <div className="kv-item full-width"><span className="kv-lbl">Office Key:</span><span className="kv-val font-mono font-bold">{currentAsset.officeKey || 'N/A'}</span></div>
                  </div>
                  <div className="kv-row">
                    <div className="kv-item"><span className="kv-lbl">Mail Client:</span><span className="kv-val">{currentAsset.mailSoftware || 'N/A'}</span></div>
                    <div className="kv-item"><span className="kv-lbl">Other Software:</span><span className="kv-val">{currentAsset.otherSoftware || 'N/A'}</span></div>
                  </div>
                  <div className="kv-row">
                    <div className="kv-item"><span className="kv-lbl">Working Condition:</span><span className="kv-val font-bold" style={{ color: '#059669' }}>{currentAsset.workingCondition || 'Good'}</span></div>
                    <div className="kv-item"><span className="kv-lbl">Vendor / Partner:</span><span className="kv-val">{currentAsset.vendorName || 'Authorized OEM Partner'}</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 3: LOCAL MACHINE CREDENTIALS (Left) + PROCUREMENT & INWARD (Right) */}
            <div className="doc-section-row">
              {/* 5. System Login & Credentials */}
              <div className="doc-card">
                <div className="doc-card-header">
                  <span className="card-dot"></span>
                  <span>5. Local Machine Access & Credentials</span>
                </div>
                <div className="doc-card-body">
                  <div className="kv-row">
                    <div className="kv-item"><span className="kv-lbl">Login User:</span><span className="kv-val font-mono font-bold">{currentAsset.loginUserName || 'N/A'}</span></div>
                    <div className="kv-item"><span className="kv-lbl">Login Password:</span><span className="kv-val font-mono font-bold">{currentAsset.loginPassword || 'N/A'}</span></div>
                  </div>
                  <div className="kv-row">
                    <div className="kv-item full-width"><span className="kv-lbl">VNC Remote Password:</span><span className="kv-val font-mono">{currentAsset.vncPassword || 'N/A'}</span></div>
                  </div>
                </div>
              </div>

              {/* 6. Procurement, Warranty & Inward */}
              <div className="doc-card">
                <div className="doc-card-header">
                  <span className="card-dot"></span>
                  <span>6. Procurement, Warranty & Inward</span>
                </div>
                <div className="doc-card-body">
                  <div className="kv-row">
                    <div className="kv-item"><span className="kv-lbl">Bill Date / Ref:</span><span className="kv-val font-bold">{currentAsset.billCopyDate || currentAsset.billNo || 'N/A'}</span></div>
                    <div className="kv-item"><span className="kv-lbl">Warranty Details:</span><span className="kv-val font-bold">{currentAsset.warrantyDetails || 'N/A'}</span></div>
                  </div>
                  <div className="kv-row">
                    <div className="kv-item full-width"><span className="kv-lbl">IT Remarks:</span><span className="kv-val">{currentAsset.remarks || 'No remarks recorded.'}</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Official 3-Column Signatures Block */}
            <div className="doc-sign-block">
              <div className="sign-box">
                <div className="sign-title">PREPARED & ISSUED BY</div>
                <div className="sign-spacer"></div>
                <div className="sign-line"></div>
                <div className="sign-role">IT Infrastructure Engineer</div>
                <div className="sign-date">Sign & Date: ____________________</div>
              </div>
              <div className="sign-box">
                <div className="sign-title">VERIFIED & AUDITED BY</div>
                <div className="sign-spacer"></div>
                <div className="sign-line"></div>
                <div className="sign-role">IT Head / Plant Manager</div>
                <div className="sign-date">Sign & Date: ____________________</div>
              </div>
              <div className="sign-box">
                <div className="sign-title">ACKNOWLEDGED & RECEIVED BY</div>
                <div className="sign-spacer"></div>
                <div className="sign-line"></div>
                <div className="sign-role">{currentAsset.userName || 'Assigned Custodian'}</div>
                <div className="sign-date">Sign & Date: ____________________</div>
              </div>
            </div>

            {/* Legal / Confidential Disclaimer Notice */}
            <div className="doc-disclaimer">
              This document certifies the official allocation, specification, and verification of the above IT asset belonging to Vitromed Healthcare.
              The custodian acknowledges receipt and accepts responsibility for asset care, security compliance, and physical protection.
            </div>

            {/* Document Footer */}
            <div className="doc-footer">
              <span>Official Asset Property of Vitromed Healthcare • Confidential IT Asset Registry</span>
              <span>Page 1 of {includeBillInPrint && currentAsset?.invoiceImage ? '2' : '1'}</span>
            </div>
          </div>

          {/* --- PAGE 2: OPTIONAL FULL-SIZE BILL / INVOICE COPY --- */}
          {includeBillInPrint && currentAsset?.invoiceImage && (
            <div className="print-page print-page-bill">
              <div className="doc-header">
                <div className="doc-brand-block">
                  <img src={logo} alt="Vitromed Logo" className="doc-logo" />
                  <div>
                    <div className="doc-org-name">VITROMED HEALTHCARE</div>
                    <div className="doc-dept-name">INFORMATION TECHNOLOGY DIVISION • ASSET OPERATIONS</div>
                    <div className="doc-title">ANNEXURE: ORIGINAL PURCHASE INVOICE / BILL COPY</div>
                  </div>
                </div>
                <div className="doc-meta-card">
                  <div className="doc-meta-row">
                    <span className="meta-lbl">ASSET TAG:</span>
                    <span className="meta-val font-mono">#{currentAsset.assetNo || 'N/A'}</span>
                  </div>
                  <div className="doc-meta-row">
                    <span className="meta-lbl">HARDWARE S/N:</span>
                    <span className="meta-val font-mono">{currentAsset.sr || 'N/A'}</span>
                  </div>
                  <div className="doc-meta-row">
                    <span className="meta-lbl">EQUIPMENT:</span>
                    <span className="meta-val">{formatMakeModel(currentAsset.make, currentAsset.model)}</span>
                  </div>
                  <div className="doc-meta-row">
                    <span className="meta-lbl">BILL REF:</span>
                    <span className="meta-val">{currentAsset.billCopyDate || currentAsset.billNo || 'Official Bill'}</span>
                  </div>
                </div>
              </div>

              {/* Metadata ribbon under header */}
              <div className="bill-meta-ribbon">
                <span>Custodian: <strong>{currentAsset.userName || 'Unassigned'}</strong> ({currentAsset.department || 'IT'})</span>
                <span>Facility: <strong>{currentAsset.plant || 'Vitromed'}</strong></span>
                <span>Vendor: <strong>{currentAsset.vendorName || 'Authorized Partner'}</strong></span>
              </div>

              {/* Centered Bill Container */}
              <div className="bill-fullsize-container">
                {isPdfDocument ? (
                  <div className="bill-pdf-notice">
                    <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#0f172a' }}>PDF Invoice Document Attached</div>
                    <div style={{ marginTop: '5px', fontSize: '11px', color: '#475569' }}>Reference: {currentAsset.billCopyDate || currentAsset.billNo || 'Purchase Invoice'}</div>
                    <div style={{ fontSize: '9.5px', color: '#64748b', marginTop: '8px' }}>
                      Note: Embedded PDF document is attached to this asset record and can be viewed or printed in the interactive system lightbox.
                    </div>
                  </div>
                ) : (
                  <>
                    <img
                      src={currentAsset.invoiceImage}
                      alt={`Purchase Bill - Asset #${currentAsset.assetNo || currentAsset.sr}`}
                      className="bill-fullsize-image"
                    />
                    <div className="bill-caption">
                      Purchase Invoice / Billing Document Scan • Asset #{currentAsset.assetNo || currentAsset.sr}
                    </div>
                  </>
                )}
              </div>

              <div className="doc-footer">
                <span>Official Property of Vitromed Healthcare • Annexure: Purchase Bill Record</span>
                <span>Page 2 of 2</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* INTERACTIVE FULLSCREEN BILL LIGHTBOX MODAL                      */}
      {/* ============================================================== */}
      {lightboxOpen && currentAsset.invoiceImage && (
        <div
          className="modal-overlay"
          style={{
            zIndex: 1200,
            padding: '1.25rem',
            backgroundColor: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(10px)',
          }}
          onClick={() => setLightboxOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '960px',
              maxHeight: '92vh',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-default)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.75)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Lightbox Toolbar Header */}
            <div
              style={{
                padding: '0.85rem 1.25rem',
                borderBottom: '1px solid var(--border-default)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'var(--bg-surface-raised)',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Receipt size={18} color="var(--primary)" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    Purchase Bill / Invoice — {currentAsset.assetNo ? `Asset #${currentAsset.assetNo}` : currentAsset.sr}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {currentAsset.make} {currentAsset.model} • {currentAsset.plant || 'Vitromed'}
                  </div>
                </div>
              </div>

              {/* Action & Zoom Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {!isPdfDocument && (
                  <>
                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.max(0.5, parseFloat((z - 0.25).toFixed(2))))}
                      className="btn btn-outline btn-xs"
                      title="Zoom Out"
                    >
                      <ZoomOut size={13} />
                    </button>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        minWidth: '46px',
                        textAlign: 'center',
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {Math.round(zoomLevel * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.min(3, parseFloat((z + 0.25).toFixed(2))))}
                      className="btn btn-outline btn-xs"
                      title="Zoom In"
                    >
                      <ZoomIn size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setRotation((r) => (r + 90) % 360)}
                      className="btn btn-outline btn-xs"
                      title="Rotate 90 Degrees"
                    >
                      <RotateCw size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => { setZoomLevel(1); setRotation(0); }}
                      className="btn btn-ghost btn-xs"
                      title="Reset Zoom & Rotation"
                    >
                      Reset
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={handleDownloadBill}
                  className="btn btn-primary btn-xs"
                  title="Download Bill File"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Download size={13} />
                  <span>Download</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn btn-outline btn-xs"
                  title="Print Bill"
                >
                  <Printer size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxOpen(false)}
                  className="btn btn-ghost btn-icon btn-xs"
                  title="Close (Esc)"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Lightbox Body Viewport */}
            <div
              style={{
                flex: 1,
                overflow: 'auto',
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.45)',
                minHeight: '450px',
              }}
            >
              {isPdfDocument ? (
                <iframe
                  src={currentAsset.invoiceImage}
                  title="Bill PDF"
                  style={{ width: '100%', height: '580px', border: 'none', borderRadius: 'var(--radius-md)' }}
                />
              ) : (
                <div style={{ overflow: 'auto', maxWidth: '100%', maxHeight: '100%', textAlign: 'center' }}>
                  <img
                    src={currentAsset.invoiceImage}
                    alt="Full Size Bill Scan"
                    style={{
                      transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                      transformOrigin: 'center center',
                      transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      maxWidth: '100%',
                      maxHeight: '75vh',
                      objectFit: 'contain',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: '0 12px 36px rgba(0, 0, 0, 0.5)',
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}