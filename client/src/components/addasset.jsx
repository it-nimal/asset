import React, { useState, useRef } from 'react';
import { api } from '../services/api';

const PLANTS = [
  '22Godam',
  'Sitapura',
  'Plant 1 - Bangalore',
  'Plant 2 - Pune',
  'Plant 3 - Jaipur',
  'Vitromed HQ - Delhi NCR',
  'Remote / WFH',
];

const DEVICE_TYPES = ['Laptop', 'Desktop', 'All in One Desktop', 'Server', 'Workstation', 'Tablet', 'Network Switch', 'Printer', 'Monitor', 'Other'];
const COMMON_MAKES = ['Dell', 'HP', 'Apple', 'Lenovo', 'Asus', 'Acer', 'Cisco', 'Logitech', 'Other'];

export default function Addasset({ onAssetCreated, dbConnected }) {
  const [formData, setFormData] = useState({
    // Inward, Purchase & Invoice Details
    billNo: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    deliveryDate: new Date().toISOString().split('T')[0],
    vendorName: '',
    invoiceImage: '',

    // Machine & Hardware Specs
    plant: 'Plant 1 - Bangalore',
    deviceType: 'Laptop',
    make: 'Dell',
    customMake: '',
    model: '',
    sr: '',
    warrantyDetails: '3 Years Comprehensive On-Site',
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle Invoice Image Upload (JPG / PNG)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Allow image files or PDF documents
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      alert('Please upload a valid image (JPG, JPEG, PNG) or PDF file');
      return;
    }

    // Set size limits: 5 MB for images, 10 MB for PDFs
    const maxSize = file.type === 'application/pdf' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`File size should be under ${file.type === 'application/pdf' ? '10MB' : '5MB'}.`);
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
    };
    reader.readAsDataURL(file);
  };

  // Remove Invoice Photo
  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData((prev) => ({
      ...prev,
      invoiceImage: '',
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMessage({ type: '', text: '' });

    const finalMake = formData.make === 'Other' ? formData.customMake : formData.make;

    try {
      const result = await api.createAsset({
        ...formData,
        make: finalMake || 'Generic',
        status: 'Available',
        userName: 'Unassigned',
      });

      if (result.success) {
        setStatusMessage({
          type: 'success',
          text: `🎉 Asset "${finalMake} ${formData.model}" (SR: ${formData.sr}) with Bill No "${formData.billNo}" successfully saved to MongoDB!`,
        });

        // Reset
        setFormData({
          billNo: '',
          purchaseDate: new Date().toISOString().split('T')[0],
          deliveryDate: new Date().toISOString().split('T')[0],
          vendorName: '',
          invoiceImage: '',
          plant: 'Plant 1 - Bangalore',
          deviceType: 'Laptop',
          make: 'Dell',
          customMake: '',
          model: '',
          sr: '',
          warrantyDetails: '3 Years Comprehensive On-Site',
        });
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';

        if (onAssetCreated) onAssetCreated();
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: `⚠️ ${err.message}`,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '1.5rem auto 4rem', padding: '0 1rem' }}>
      <div
        style={{
          backgroundColor: '#0f172a',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '10px',
          padding: '1.75rem',
        }}
      >
        {/* Minimal Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            paddingBottom: '1rem',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
              Inward New Asset
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.15rem' }}>
              Register newly received hardware, verify invoice details, and attach document proof.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.25rem 0.65rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 500,
              backgroundColor: dbConnected ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
              color: dbConnected ? '#34d399' : '#fbbf24',
              border: `1px solid ${dbConnected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`,
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: dbConnected ? '#10b981' : '#f59e0b' }} />
            <span>Database {dbConnected ? 'Online' : 'Offline'}</span>
          </div>
        </div>

        {/* Status Message */}
        {statusMessage.text && (
          <div
            style={{
              backgroundColor:
                statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${
                statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'
              }`,
              color: statusMessage.type === 'success' ? '#34d399' : '#f87171',
              padding: '0.75rem 1rem',
              borderRadius: '6px',
              marginBottom: '1.25rem',
              fontSize: '0.825rem',
            }}
          >
            {statusMessage.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Section 1: Inward & Invoice Verification */}
          <div style={sectionBoxStyle}>
            <div style={sectionTitleStyle}>
              <div>
                <h3 style={{ fontSize: '0.95rem', color: '#f8fafc', fontWeight: 600 }}>
                  1. Purchase & Invoice Verification
                </h3>
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.1rem' }}>
                  Enter bill details, vendor, purchase & delivery dates, and attach bill copy
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              {/* 1. Bill No */}
              <div style={fieldStyle}>
                <label style={labelStyle}>Bill No. / Invoice No. <span style={reqStyle}>*</span></label>
                <input
                  type="text"
                  name="billNo"
                  required
                  placeholder="e.g. INV-99412"
                  value={formData.billNo}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              {/* 4. Vendor Name */}
              <div style={fieldStyle}>
                <label style={labelStyle}>Vendor / Supplier Name <span style={reqStyle}>*</span></label>
                <input
                  type="text"
                  name="vendorName"
                  required
                  placeholder="e.g. Dell Direct India Pvt Ltd, Chroma Infotech"
                  value={formData.vendorName}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              {/* 5. Date of Purchase */}
              <div style={fieldStyle}>
                <label style={labelStyle}>Date of Purchase (Invoice Date) <span style={reqStyle}>*</span></label>
                <input
                  type="date"
                  name="purchaseDate"
                  required
                  value={formData.purchaseDate}
                  onChange={handleChange}
                  style={{ ...inputStyle, colorScheme: 'dark' }}
                />
              </div>

              {/* 6. Date of Delivery */}
              <div style={fieldStyle}>
                <label style={labelStyle}>Date of Delivery (Inward Date) <span style={reqStyle}>*</span></label>
                <input
                  type="date"
                  name="deliveryDate"
                  required
                  value={formData.deliveryDate}
                  onChange={handleChange}
                  style={{ ...inputStyle, colorScheme: 'dark' }}
                />
              </div>
            </div>

            {/* Invoice Upload Box */}
            <div style={{ marginTop: '1.25rem', borderTop: '1px dashed rgba(255, 255, 255, 0.08)', paddingTop: '1rem' }}>
              <label style={{ ...labelStyle, display: 'block', marginBottom: '0.4rem' }}>
                Invoice Copy (PDF, JPG, PNG)
              </label>

              {!imagePreview ? (
                <div
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  style={{
                    border: '1px dashed rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '1.25rem',
                    textAlign: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.01)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#6366f1')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)')}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,application/pdf"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                  <div style={{ color: '#cbd5e1', fontWeight: 500, fontSize: '0.825rem' }}>
                    Click or drag invoice document here (PDF / JPG / PNG)
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.72rem', marginTop: '0.2rem' }}>
                    PDF documents & image files up to 10MB
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                  }}
                >
                  {imagePreview.startsWith('data:application/pdf') ? (
                    <div
                      onClick={() => setPreviewModalOpen(true)}
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '6px',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#f87171',
                      }}
                    >
                      <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>PDF</span>
                    </div>
                  ) : (
                    <img
                      src={imagePreview}
                      alt="Invoice Preview"
                      onClick={() => setPreviewModalOpen(true)}
                      style={{
                        width: '50px',
                        height: '50px',
                        objectFit: 'cover',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        cursor: 'pointer',
                      }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#34d399', fontWeight: 500, fontSize: '0.825rem' }}>
                      Document Attached
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.72rem', marginTop: '2px' }}>
                      Ready to be linked and saved with this asset record.
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setPreviewModalOpen(true)}
                      style={{
                        padding: '0.35rem 0.65rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        color: '#cbd5e1',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '5px',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      Preview
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      style={{
                        padding: '0.35rem 0.65rem',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: '#f87171',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        borderRadius: '5px',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Hardware & Machine Details */}
          <div style={{ ...sectionBoxStyle, marginTop: '1.25rem' }}>
            <div style={sectionTitleStyle}>
              <div>
                <h3 style={{ fontSize: '0.95rem', color: '#f8fafc', fontWeight: 600 }}>
                  2. Hardware Specifications
                </h3>
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.1rem' }}>
                  Register the machine hardware tag, model, and physical serial number
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              {/* Plant */}
              <div style={fieldStyle}>
                <label style={labelStyle}>Receiving Plant / Branch <span style={reqStyle}>*</span></label>
                <select name="plant" value={formData.plant} onChange={handleChange} style={inputStyle}>
                  {PLANTS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* Device Type */}
              <div style={fieldStyle}>
                <label style={labelStyle}>Device Type <span style={reqStyle}>*</span></label>
                <select name="deviceType" value={formData.deviceType} onChange={handleChange} style={inputStyle}>
                  {DEVICE_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Make */}
              <div style={fieldStyle}>
                <label style={labelStyle}>Make (Brand) <span style={reqStyle}>*</span></label>
                <select name="make" value={formData.make} onChange={handleChange} style={inputStyle}>
                  {COMMON_MAKES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {formData.make === 'Other' && (
                <div style={fieldStyle}>
                  <label style={labelStyle}>Specify Make <span style={reqStyle}>*</span></label>
                  <input
                    type="text"
                    name="customMake"
                    required
                    placeholder="e.g. Sony"
                    value={formData.customMake}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>
              )}

              {/* Model */}
              <div style={fieldStyle}>
                <label style={labelStyle}>Model No. <span style={reqStyle}>*</span></label>
                <input
                  type="text"
                  name="model"
                  required
                  placeholder="e.g. Latitude 5420 / ThinkPad T14"
                  value={formData.model}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              {/* Serial No (SR) */}
              <div style={fieldStyle}>
                <label style={labelStyle}>Serial Number (SR / Asset Tag) <span style={reqStyle}>*</span></label>
                <input
                  type="text"
                  name="sr"
                  required
                  placeholder="e.g. 8J92KM4 (Unique Machine S/N)"
                  value={formData.sr}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              {/* Warranty */}
              <div style={fieldStyle}>
                <label style={labelStyle}>Warranty Details</label>
                <input
                  type="text"
                  name="warrantyDetails"
                  placeholder="e.g. 3 Years Onsite ProSupport"
                  value={formData.warrantyDetails}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ marginTop: '1.75rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => {
                setFormData({
                  billNo: '',
                  purchaseDate: new Date().toISOString().split('T')[0],
                  deliveryDate: new Date().toISOString().split('T')[0],
                  vendorName: '',
                  invoiceImage: '',
                  plant: 'Plant 1 - Bangalore',
                  deviceType: 'Laptop',
                  make: 'Dell',
                  customMake: '',
                  model: '',
                  sr: '',
                  warrantyDetails: '3 Years Comprehensive On-Site',
                });
                setImagePreview(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                color: '#94a3b8',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Clear Form
            </button>

            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '0.5rem 1.25rem',
                backgroundColor: '#4f46e5',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: submitting ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? 'Saving...' : 'Inward Asset'}
            </button>
          </div>
        </form>
      </div>

      {/* Invoice Image Full-Size Modal Preview */}
      {previewModalOpen && imagePreview && (
        <div
          onClick={() => setPreviewModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            zIndex: 9999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              maxWidth: '90vw',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px rgba(0,0,0,0.7)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.85rem' }}>
                Document Preview (Bill: {formData.billNo || 'N/A'})
              </div>
              <button
                onClick={() => setPreviewModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.1rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: '1rem', overflow: 'auto', textAlign: 'center', height: '75vh' }}>
              {imagePreview.startsWith('data:application/pdf') ? (
                <iframe
                  src={imagePreview}
                  title="PDF Invoice Preview"
                  style={{ width: '80vw', height: '100%', border: 'none', borderRadius: '6px' }}
                />
              ) : (
                <img
                  src={imagePreview}
                  alt="Invoice Full Size"
                  style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: '6px', objectFit: 'contain' }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const sectionBoxStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.02)',
  border: '1px solid rgba(255, 255, 255, 0.06)',
  borderRadius: '8px',
  padding: '1.25rem',
};

const sectionTitleStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  paddingBottom: '0.5rem',
  marginBottom: '1rem',
};

const fieldStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.35rem',
};

const labelStyle = {
  fontSize: '0.75rem',
  fontWeight: 500,
  color: '#94a3b8',
};

const reqStyle = {
  color: '#f87171',
};

const inputStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '6px',
  padding: '0.5rem 0.75rem',
  color: '#f8fafc',
  fontSize: '0.825rem',
  outline: 'none',
};