import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Truck,
  Calendar,
  FileText,
  Upload,
  Layers,
  Laptop,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  Trash2,
} from 'lucide-react';
import { INWARD_CATEGORIES, DEVICE_TYPES_BY_CATEGORY } from '../../config/assetSpecificationConfig';
import DynamicSpecifications from './DynamicSpecifications';
import AccessoryChecklist from './AccessoryChecklist';
import { api } from '../../services/api';
import { useToast } from '../common/Toast';
import { useAuth } from '../../context/AuthContext';

export default function InwardForm({
  inward = null, // if editing existing
  vendors = [],
  onClose,
  onSuccess,
}) {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const isEdit = Boolean(inward && inward._id);

  // SECTION 1: Receipt Details
  const [receivedDate, setReceivedDate] = useState(
    inward?.receivedDate
      ? new Date(inward.receivedDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [vendor, setVendor] = useState(inward?.vendor || '');
  const [invoiceNumber, setInvoiceNumber] = useState(inward?.invoiceNumber || '');
  const [purchaseOrderNumber, setPurchaseOrderNumber] = useState(
    inward?.purchaseOrderNumber || inward?.poNumber || ''
  );
  const [invoiceAttachment, setInvoiceAttachment] = useState(
    inward?.attachments?.find((a) => a.fileType === 'Invoice') || null
  );

  // SECTION 2: Received Item
  const [category, setCategory] = useState(inward?.category || 'Computers & Laptops');
  const [deviceType, setDeviceType] = useState(inward?.deviceType || 'Laptop');
  const [quantity, setQuantity] = useState(inward?.quantity || 1);
  const [manufacturer, setManufacturer] = useState(inward?.manufacturer || '');
  const [model, setModel] = useState(inward?.model || '');
  const [specifications, setSpecifications] = useState(inward?.specifications || {});

  // SECTION 3: Accessories Received
  const [accessories, setAccessories] = useState(
    inward?.accessories || {
      monitor: { received: false, description: '' },
      keyboard: { received: false, description: '' },
      mouse: { received: false, description: '' },
      powerAdapter: { received: false, description: '' },
      cables: { received: false, description: '' },
      other: { received: false, description: '' },
    }
  );

  // SECTION 4: Notes / Documents
  const [notes, setNotes] = useState(inward?.notes || inward?.remarks || '');
  const [attachments, setAttachments] = useState(inward?.attachments || []);

  // Update device type options when category changes
  const availableDeviceTypes = DEVICE_TYPES_BY_CATEGORY[category] || ['Other'];

  useEffect(() => {
    if (!availableDeviceTypes.includes(deviceType)) {
      setDeviceType(availableDeviceTypes[0] || 'Other');
    }
  }, [category]);

  // Handle invoice file upload
  const handleInvoiceUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const doc = {
        fileName: file.name,
        fileUrl: uploadEvent.target.result,
        fileType: 'Invoice',
        uploadedAt: new Date(),
      };
      setInvoiceAttachment(doc);
    };
    reader.readAsDataURL(file);
  };

  // Handle additional supporting document upload
  const handleSupportingDocUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const doc = {
        fileName: file.name,
        fileUrl: uploadEvent.target.result,
        fileType: 'Delivery Challan',
        uploadedAt: new Date(),
      };
      setAttachments((prev) => [...prev, doc]);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!vendor.trim()) {
      return toast.error('Please specify a vendor name');
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1) {
      return toast.error('Quantity must be at least 1 unit');
    }

    setLoading(true);

    const allAttachments = [...attachments];
    if (invoiceAttachment && !allAttachments.some((a) => a.fileName === invoiceAttachment.fileName)) {
      allAttachments.unshift(invoiceAttachment);
    }

    const payload = {
      receivedDate,
      vendor: vendor.trim(),
      invoiceNumber: invoiceNumber.trim(),
      purchaseOrderNumber: purchaseOrderNumber.trim(),
      category,
      deviceType,
      quantity: qty,
      manufacturer: manufacturer.trim(),
      model: model.trim(),
      specifications,
      accessories,
      notes: notes.trim(),
      attachments: allAttachments,
      actorName: user?.name || 'IT Admin',
    };

    try {
      if (isEdit) {
        await api.updateInward(inward._id, payload);
        toast.success('Inward receipt record updated successfully', 'Inward Updated');
      } else {
        const res = await api.createInward(payload);
        toast.success(
          `Inward ${res.data?.inwardNumber || ''} recorded successfully!`,
          'Shipment Received'
        );
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save Inward record', 'Save Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '860px',
          width: '95vw',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-surface, #ffffff)',
        }}
      >
        {/* Header */}
        <div
          className="modal-header"
          style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid var(--border-default)',
            backgroundColor: 'var(--bg-surface-raised, #f8fafc)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(2, 132, 199, 0.12)',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Truck size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                {isEdit ? `Edit Inward Receipt (${inward.inwardNumber})` : 'Record Inward / Received Hardware'}
              </h3>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: 0 }}>
                Log newly arrived IT items, specifications, accessories, and vendor invoice details.
              </p>
            </div>
          </div>

          <button type="button" onClick={onClose} className="btn btn-ghost btn-icon btn-xs">
            <X size={18} />
          </button>
        </div>

        {/* Form Body with 4 Logical Sections */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div
            className="modal-body"
            style={{
              padding: '1.25rem 1.5rem',
              overflowY: 'auto',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}
          >
            {/* ════════ SECTION 1: RECEIPT DETAILS ════════ */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface, #ffffff)',
                border: '1px solid var(--border-default, #e2e8f0)',
                borderRadius: '8px',
                padding: '1.1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
                <span
                  style={{
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                  }}
                >
                  1
                </span>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Receipt & Vendor Details
                </h4>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                    Received Date <span style={{ color: '#f87171' }}>*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={receivedDate}
                    onChange={(e) => setReceivedDate(e.target.value)}
                    className="form-control"
                    style={{ fontSize: '0.82rem' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                    Vendor / Supplier <span style={{ color: '#f87171' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    list="vendor-options"
                    placeholder="e.g. Dell India / Shweta Computers"
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    className="form-control"
                    style={{ fontSize: '0.82rem' }}
                  />
                  <datalist id="vendor-options">
                    {vendors.map((v) => (
                      <option key={v._id || v.name} value={v.name} />
                    ))}
                  </datalist>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                    Invoice / Bill Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. INV-2026-9812"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="form-control"
                    style={{ fontSize: '0.82rem' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                    Purchase Order (PO) Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PO-VIT-2026-041"
                    value={purchaseOrderNumber}
                    onChange={(e) => setPurchaseOrderNumber(e.target.value)}
                    className="form-control"
                    style={{ fontSize: '0.82rem' }}
                  />
                </div>
              </div>

              {/* Invoice Attachment Strip */}
              <div style={{ marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    Invoice / Delivery Challan File:
                  </label>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {invoiceAttachment ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'rgba(2, 132, 199, 0.08)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', color: '#0284c7' }}>
                        <Paperclip size={13} />
                        <span style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {invoiceAttachment.fileName}
                        </span>
                        <button
                          type="button"
                          onClick={() => setInvoiceAttachment(null)}
                          className="btn btn-ghost btn-icon btn-xs"
                          style={{ padding: 0, width: '18px', height: '18px' }}
                        >
                          <X size={12} color="#f87171" />
                        </button>
                      </div>
                    ) : (
                      <label
                        className="btn btn-outline btn-xs"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.72rem' }}
                      >
                        <Upload size={12} />
                        <span>Upload Invoice Copy</span>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={handleInvoiceUpload}
                          style={{ display: 'none' }}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ════════ SECTION 2: RECEIVED ITEM & DYNAMIC SPECS ════════ */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface, #ffffff)',
                border: '1px solid var(--border-default, #e2e8f0)',
                borderRadius: '8px',
                padding: '1.1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
                <span
                  style={{
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                  }}
                >
                  2
                </span>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Received Item & Technical Specifications
                </h4>
              </div>

              {/* Core Item Selectors */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                    Category <span style={{ color: '#f87171' }}>*</span>
                  </label>
                  <select
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="form-select"
                    style={{ fontSize: '0.82rem' }}
                  >
                    {INWARD_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                    Device / Item Type <span style={{ color: '#f87171' }}>*</span>
                  </label>
                  <select
                    required
                    value={deviceType}
                    onChange={(e) => setDeviceType(e.target.value)}
                    className="form-select"
                    style={{ fontSize: '0.82rem' }}
                  >
                    {availableDeviceTypes.map((dt) => (
                      <option key={dt} value={dt}>
                        {dt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                    Quantity Received <span style={{ color: '#f87171' }}>*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="form-control"
                    style={{ fontSize: '0.82rem' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                    Manufacturer / Make
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dell / HP / Cisco"
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    className="form-control"
                    style={{ fontSize: '0.82rem' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                    Model Name / Series
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Latitude 5420 / Catalyst 2960"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="form-control"
                    style={{ fontSize: '0.82rem' }}
                  />
                </div>
              </div>

              {/* Dynamic Specifications Box */}
              <div
                style={{
                  backgroundColor: 'var(--bg-surface-raised, #f8fafc)',
                  border: '1px solid var(--border-default, #e2e8f0)',
                  borderRadius: '6px',
                  padding: '0.85rem 1rem',
                }}
              >
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
                  Specifications of Received Item ({deviceType}):
                </div>

                <DynamicSpecifications
                  category={category}
                  deviceType={deviceType}
                  specifications={specifications}
                  onChange={setSpecifications}
                />
              </div>
            </div>

            {/* ════════ SECTION 3: ACCESSORIES RECEIVED ════════ */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface, #ffffff)',
                border: '1px solid var(--border-default, #e2e8f0)',
                borderRadius: '8px',
                padding: '1.1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
                <span
                  style={{
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                  }}
                >
                  3
                </span>
                <div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Accessories Received Checklist
                  </h4>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                    Select Yes/No for bundled peripherals (Monitor, Keyboard, Mouse, Power Adapter, Cables).
                  </p>
                </div>
              </div>

              <AccessoryChecklist
                accessories={accessories}
                onChange={setAccessories}
              />
            </div>

            {/* ════════ SECTION 4: NOTES & DOCUMENTS ════════ */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface, #ffffff)',
                border: '1px solid var(--border-default, #e2e8f0)',
                borderRadius: '8px',
                padding: '1.1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
                <span
                  style={{
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                  }}
                >
                  4
                </span>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Notes & Supporting Attachments
                </h4>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                  Inward Remarks / Inspection Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Received in original sealed packaging. Tested and ready for technical verification."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="form-control"
                  style={{ fontSize: '0.82rem' }}
                />
              </div>

              {/* Supporting Document List & Upload */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Additional Documents (Challan, Warranty etc.):
                  </span>
                  <label
                    className="btn btn-ghost btn-xs"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', color: '#0284c7', fontSize: '0.72rem' }}
                  >
                    <Plus size={12} />
                    <span>Add Document</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleSupportingDocUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>

                {attachments.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {attachments.map((doc, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          backgroundColor: 'var(--bg-surface-raised, #f8fafc)',
                          border: '1px solid var(--border-default)',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '4px',
                          fontSize: '0.74rem',
                        }}
                      >
                        <Paperclip size={12} color="#0284c7" />
                        <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {doc.fileName}
                        </span>
                        <button
                          type="button"
                          onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                          className="btn btn-ghost btn-icon btn-xs"
                          style={{ padding: 0, width: '18px', height: '18px' }}
                        >
                          <X size={12} color="#f87171" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div
            className="modal-footer"
            style={{
              padding: '0.85rem 1.5rem',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.65rem',
              borderTop: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-surface-raised, #f8fafc)',
            }}
          >
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={loading} style={{ fontWeight: 700 }}>
              {loading ? 'Saving...' : isEdit ? 'Update Inward Record' : 'Record Inward Shipment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
