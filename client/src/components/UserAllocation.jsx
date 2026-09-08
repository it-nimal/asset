import React, { useState } from 'react';
import { api } from '../services/api';

const DEPARTMENTS = [
  'IT & Software Engineering',
  'Production & Plant Operations',
  'Quality Control (QA/QC)',
  'HR & Admin',
  'Sales & Marketing',
  'Finance & Accounts',
  'Supply Chain & Procurement',
  'Management & Executive',
];

const PLANTS = [
  'Plant 1 - Bangalore',
  'Plant 2 - Pune',
  'Plant 3 - Jaipur',
  'Vitromed HQ - Delhi NCR',
  'Remote / WFH',
];

const DEVICE_TYPES = ['Laptop', 'Desktop', 'Server', 'Workstation', 'Tablet', 'Network Switch', 'Other'];

export default function UserAllocation({ assets, onRefresh, loading }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [plantFilter, setPlantFilter] = useState('All');

  // Multi-tab section inside the Assign Modal
  const [modalTab, setModalTab] = useState('employee');

  // Assign Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [assignData, setAssignData] = useState({
    // Employee & Location
    userName: '',
    empCode: '',
    mailId: '',
    department: 'IT & Software Engineering',
    plant: 'Plant 1 - Bangalore',
    floorCabin: '1st Floor - IT Bay',
    assetNo: '',

    // Hardware Specs
    deviceType: 'Laptop',
    processor: 'Intel Core i5 (12th Gen)',
    ramSize: '16 GB',
    storage: '512 GB SSD',
    monitorDetails: 'Dell 24" Full HD',
    monitorSerialNo: '',

    // Software & Licenses
    osVersion: 'Windows 11 Pro',
    windowsKey: '',
    officeSoftware: 'MS Office 2021 Pro Plus',
    officeKey: '',
    antivirus: 'QuickHeal Endpoint Security',

    // Network Config
    hostName: '',
    macAddress: '',
    ipAddress: '',

    // Condition & Remarks
    workingCondition: 'Good',
    remarks: 'Device configured and handed over with original charger and bag.',
  });

  const [assigning, setAssigning] = useState(false);

  // View Full Handover Sheet Modal
  const [viewSpecsModalOpen, setViewSpecsModalOpen] = useState(false);
  const [viewAsset, setViewAsset] = useState(null);

  // Invoice Photo Fullscreen Preview Modal
  const [invoicePhotoModal, setInvoicePhotoModal] = useState(null);

  // Open Assign Modal and pre-fill existing asset info
  const handleOpenAssignModal = (asset) => {
    setSelectedAsset(asset);
    setModalTab('employee');
    setAssignData({
      userName: asset.userName !== 'Unassigned' ? asset.userName : '',
      empCode: asset.empCode || '',
      mailId: asset.mailId || '',
      department: asset.department || 'IT & Software Engineering',
      plant: asset.plant || 'Plant 1 - Bangalore',
      floorCabin: asset.floorCabin || '1st Floor - Main Office',
      assetNo: asset.assetNo || `AST-${asset.sr}`,

      deviceType: asset.deviceType || 'Laptop',
      processor: asset.processor || 'Intel Core i5 (12th Gen)',
      ramSize: asset.ramSize || '16 GB',
      storage: asset.storage || '512 GB SSD',
      monitorDetails: asset.monitorDetails || '',
      monitorSerialNo: asset.monitorSerialNo || '',

      osVersion: asset.osVersion || 'Windows 11 Pro',
      windowsKey: asset.windowsKey || '',
      officeSoftware: asset.officeSoftware || 'MS Office 2021',
      officeKey: asset.officeKey || '',
      antivirus: asset.antivirus || 'QuickHeal Endpoint',

      hostName: asset.hostName || '',
      macAddress: asset.macAddress || '',
      ipAddress: asset.ipAddress || '',

      workingCondition: asset.workingCondition || 'Good',
      remarks: asset.remarks || 'Device handed over with charger and bag.',
    });
    setIsAssignModalOpen(true);
  };

  // Submit complete assignment to MongoDB
  const handleConfirmAssignment = async (e) => {
    e.preventDefault();
    if (!selectedAsset) return;
    setAssigning(true);

    try {
      await api.updateAsset(selectedAsset._id, {
        status: 'In Use',
        ...assignData,
      });

      setIsAssignModalOpen(false);
      setSelectedAsset(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(`Assignment failed: ${err.message}`);
    } finally {
      setAssigning(false);
    }
  };

  // Return to Stock
  const handleReturnToStock = async (asset) => {
    if (!window.confirm(`Return "${asset.make} ${asset.model}" (SR: ${asset.sr}) back to available stock?`)) return;

    try {
      await api.updateAsset(asset._id, {
        status: 'Available',
        userName: 'Unassigned',
        empCode: '',
        mailId: '',
        remarks: `Returned to stock on ${new Date().toLocaleDateString()}`,
      });

      if (onRefresh) onRefresh();
    } catch (err) {
      alert(`Return failed: ${err.message}`);
    }
  };

  // Export to Excel CSV
  const handleExportCSV = () => {
    if (!assets || assets.length === 0) {
      alert('No assets to export!');
      return;
    }

    const headers = [
      'S.N.',
      'Plant',
      'Asset No.',
      'Against Indent No.',
      'PO Number',
      'Bill / Invoice No.',
      'Date of Purchase',
      'Date of Delivery',
      'Vendor Name',
      'User Name',
      'Emp. Code',
      'Mail Id',
      'Department',
      'Floor / Cabin',
      'Type of System',
      'System Make',
      'Model No.',
      'Serial Number',
      'Processor',
      'Ram Size',
      'Storage (HDD/SSD)',
      'Monitor Details',
      'Windows OS',
      'Windows License Key',
      'Office Software',
      'Office License Key',
      'Antivirus Installed',
      'Host Name',
      'MAC Address',
      'IP Address',
      'Warranty Details',
      'Status',
      'Working Condition',
      'Remark',
    ];

    const rows = assets.map((a, index) => [
      index + 1,
      `"${a.plant || ''}"`,
      `"${a.assetNo || ''}"`,
      `"${a.indentNo || ''}"`,
      `"${a.po || ''}"`,
      `"${a.billNo || ''}"`,
      `"${a.purchaseDate ? new Date(a.purchaseDate).toLocaleDateString() : ''}"`,
      `"${a.deliveryDate ? new Date(a.deliveryDate).toLocaleDateString() : ''}"`,
      `"${a.vendorName || ''}"`,
      `"${a.userName || 'Unassigned'}"`,
      `"${a.empCode || ''}"`,
      `"${a.mailId || ''}"`,
      `"${a.department || ''}"`,
      `"${a.floorCabin || ''}"`,
      `"${a.deviceType || ''}"`,
      `"${a.make || ''}"`,
      `"${a.model || ''}"`,
      `"${a.sr || ''}"`,
      `"${a.processor || ''}"`,
      `"${a.ramSize || ''}"`,
      `"${a.storage || ''}"`,
      `"${a.monitorDetails || ''}"`,
      `"${a.osVersion || ''}"`,
      `"${a.windowsKey || ''}"`,
      `"${a.officeSoftware || ''}"`,
      `"${a.officeKey || ''}"`,
      `"${a.antivirus || ''}"`,
      `"${a.hostName || ''}"`,
      `"${a.macAddress || ''}"`,
      `"${a.ipAddress || ''}"`,
      `"${a.warrantyDetails || ''}"`,
      `"${a.status || ''}"`,
      `"${a.workingCondition || 'Good'}"`,
      `"${a.remarks || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Vitromed_IT_Asset_Master_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Assets
  const filtered = assets.filter((item) => {
    const matchesSearch =
      (item.make || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.model || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.sr || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.billNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.indentNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.po || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.vendorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.empCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.department || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'All'
        ? true
        : statusFilter === 'Available'
        ? item.status === 'Available'
        : item.status === 'In Use';

    const matchesPlant = plantFilter === 'All' || (item.plant || 'Plant 1 - Bangalore') === plantFilter;

    return matchesSearch && matchesStatus && matchesPlant;
  });

  return (
    <div style={{ maxWidth: '1300px', margin: '2rem auto 5rem', padding: '0 1.5rem' }}>
      <div
        style={{
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 20px 35px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Header & Controls */}
        <div
          style={{
            padding: '1.75rem 2rem',
            borderBottom: '1px solid #334155',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.25rem',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                color: '#22d3ee',
                letterSpacing: '0.05em',
              }}
            >
              Enterprise IT Asset Master Allocation
            </span>
            <h2 style={{ fontSize: '1.5rem', color: '#ffffff', fontWeight: 700, marginTop: '0.2rem' }}>
              👤 User Allocation & Hardware Configuration Hub ({filtered.length})
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="🔍 Search User, Indent, Bill No, SR..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={filterInputStyle}
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={filterSelectStyle}
            >
              <option value="All">Status: All</option>
              <option value="Available">🟢 Available in Stock</option>
              <option value="In Use">🔵 Allocated to User</option>
            </select>

            <select
              value={plantFilter}
              onChange={(e) => setPlantFilter(e.target.value)}
              style={filterSelectStyle}
            >
              <option value="All">Plant: All</option>
              {PLANTS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            <button
              onClick={handleExportCSV}
              style={{
                padding: '0.55rem 1rem',
                backgroundColor: '#059669',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                boxShadow: '0 2px 8px rgba(5, 150, 105, 0.3)',
              }}
            >
              📥 Export Excel (CSV)
            </button>
          </div>
        </div>

        {/* Master Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', color: '#94a3b8', borderBottom: '1px solid #334155' }}>
                <th style={{ padding: '1rem 1.25rem' }}>Device Details</th>
                <th style={{ padding: '1rem 1.25rem' }}>Serial No (SR)</th>
                <th style={{ padding: '1rem 1.25rem' }}>Bill & Indent Ref</th>
                <th style={{ padding: '1rem 1.25rem' }}>Invoice Copy</th>
                <th style={{ padding: '1rem 1.25rem' }}>Assigned User</th>
                <th style={{ padding: '1rem 1.25rem' }}>Status</th>
                <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3.5rem', color: '#94a3b8' }}>
                    Loading data from MongoDB...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '4rem 1rem', color: '#94a3b8' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📦</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc' }}>No matching IT assets found</div>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isAssigned = item.status === 'In Use' && item.userName !== 'Unassigned';

                  return (
                    <tr key={item._id} style={{ borderBottom: '1px solid #334155' }}>
                      {/* Device */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ color: '#ffffff', fontWeight: 600 }}>
                          {item.make} {item.model}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          {item.plant || 'Plant 1'} • {item.deviceType || 'Laptop'}
                        </div>
                      </td>

                      {/* SR */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <code style={{ backgroundColor: '#0f172a', padding: '3px 8px', borderRadius: '4px', color: '#818cf8', fontWeight: 600 }}>
                          {item.sr}
                        </code>
                      </td>

                      {/* Bill & Indent */}
                      <td style={{ padding: '1rem 1.25rem', color: '#cbd5e1' }}>
                        <div>Bill: <strong>{item.billNo || '—'}</strong></div>
                        <div style={{ fontSize: '0.75rem', color: '#818cf8' }}>
                          Indent: {item.indentNo || '—'} • PO: {item.po || '—'}
                        </div>
                      </td>

                      {/* Invoice Copy Thumbnail */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        {item.invoiceImage ? (
                          <div
                            onClick={() => setInvoicePhotoModal({ src: item.invoiceImage, billNo: item.billNo, make: `${item.make} ${item.model}` })}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '6px',
                              backgroundColor: 'rgba(79, 70, 229, 0.15)',
                              border: '1px solid rgba(79, 70, 229, 0.3)',
                              color: '#818cf8',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            {item.invoiceImage?.startsWith('data:application/pdf') ? (
                              <span style={{ fontSize: '1rem', color: '#f87171' }}>📄</span>
                            ) : (
                              <img
                                src={item.invoiceImage}
                                alt="Bill"
                                style={{ width: '22px', height: '22px', borderRadius: '4px', objectFit: 'cover' }}
                              />
                            )}
                            <span>{item.invoiceImage?.startsWith('data:application/pdf') ? '📄 View PDF' : '🧾 View Bill'}</span>
                          </div>
                        ) : (
                          <span style={{ color: '#64748b', fontSize: '0.75rem' }}>No Bill Attached</span>
                        )}
                      </td>

                      {/* User */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        {isAssigned ? (
                          <div>
                            <div style={{ color: '#ffffff', fontWeight: 600 }}>{item.userName}</div>
                            <div style={{ fontSize: '0.75rem', color: '#818cf8' }}>
                              {item.empCode ? `Emp: ${item.empCode} • ` : ''}{item.department || 'IT'}
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: '#64748b', fontStyle: 'italic' }}>Unassigned (In Stock)</span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        {isAssigned ? (
                          <span
                            style={{
                              padding: '0.25rem 0.65rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              backgroundColor: 'rgba(6, 182, 212, 0.15)',
                              color: '#22d3ee',
                              border: '1px solid rgba(6, 182, 212, 0.3)',
                            }}
                          >
                            🔵 Allocated
                          </span>
                        ) : (
                          <span
                            style={{
                              padding: '0.25rem 0.65rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              backgroundColor: 'rgba(16, 185, 129, 0.15)',
                              color: '#34d399',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                            }}
                          >
                            🟢 In Stock
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
                          <button
                            onClick={() => {
                              setViewAsset(item);
                              setViewSpecsModalOpen(true);
                            }}
                            title="View all 30+ Excel specs for this machine"
                            style={{
                              backgroundColor: '#334155',
                              color: '#cbd5e1',
                              border: 'none',
                              padding: '0.4rem 0.65rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                            }}
                          >
                            👁️ Specs
                          </button>

                          {isAssigned ? (
                            <button
                              onClick={() => handleReturnToStock(item)}
                              title="Return device back to available stock"
                              style={{
                                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                                color: '#fbbf24',
                                border: '1px solid rgba(245, 158, 11, 0.4)',
                                padding: '0.4rem 0.75rem',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: 500,
                              }}
                            >
                              ↩️ Return
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenAssignModal(item)}
                              title="Assign this device to employee and configure all specs"
                              style={{
                                backgroundColor: '#4f46e5',
                                color: '#ffffff',
                                border: 'none',
                                padding: '0.4rem 0.85rem',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                              }}
                            >
                              👤 Assign
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

      {/* 1. Modal: Assign Asset & Machine Configuration */}
      {isAssignModalOpen && selectedAsset && (
        <div onClick={() => setIsAssignModalOpen(false)} style={modalOverlayStyle}>
          <div onClick={(e) => e.stopPropagation()} style={{ ...modalContentStyle, maxWidth: '850px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', color: '#ffffff', fontWeight: 700 }}>
                  👤 Assign IT Asset & Configure Machine Details
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#818cf8', marginTop: '2px' }}>
                  {selectedAsset.make} {selectedAsset.model} • Serial No: {selectedAsset.sr} • Bill No: {selectedAsset.billNo || 'N/A'}
                </p>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Internal Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setModalTab('employee')}
                style={modalTabBtn(modalTab === 'employee')}
              >
                👤 1. Employee & Location
              </button>
              <button
                type="button"
                onClick={() => setModalTab('hardware')}
                style={modalTabBtn(modalTab === 'hardware')}
              >
                💻 2. Hardware Specs
              </button>
              <button
                type="button"
                onClick={() => setModalTab('software')}
                style={modalTabBtn(modalTab === 'software')}
              >
                🔑 3. Software & OS Keys
              </button>
              <button
                type="button"
                onClick={() => setModalTab('network')}
                style={modalTabBtn(modalTab === 'network')}
              >
                🌐 4. Host & Network Setup
              </button>
            </div>

            <form onSubmit={handleConfirmAssignment}>
              <div style={{ maxHeight: '55vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {/* Section 1: Employee & Location */}
                {modalTab === 'employee' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <div style={fieldStyle}>
                      <label style={modalLabelStyle}>User Full Name <span style={{ color: '#f87171' }}>*</span></label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={assignData.userName}
                        onChange={(e) => setAssignData({ ...assignData, userName: e.target.value })}
                        style={modalInputStyle}
                      />
                    </div>

                    <div style={fieldStyle}>
                      <label style={modalLabelStyle}>Employee Code (Emp. Code) <span style={{ color: '#f87171' }}>*</span></label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. VIT-1048"
                        value={assignData.empCode}
                        onChange={(e) => setAssignData({ ...assignData, empCode: e.target.value })}
                        style={modalInputStyle}
                      />
                    </div>

                    <div style={{ ...fieldStyle, gridColumn: '1 / -1' }}>
                      <label style={modalLabelStyle}>Official Email (Mail Id)</label>
                      <input
                        type="email"
                        placeholder="e.g. rahul.sharma@vitromed.com"
                        value={assignData.mailId}
                        onChange={(e) => setAssignData({ ...assignData, mailId: e.target.value })}
                        style={modalInputStyle}
                      />
                    </div>

                    <div style={fieldStyle}>
                      <label style={modalLabelStyle}>Department <span style={{ color: '#f87171' }}>*</span></label>
                      <select
                        value={assignData.department}
                        onChange={(e) => setAssignData({ ...assignData, department: e.target.value })}
                        style={modalInputStyle}
                      >
                        {DEPARTMENTS.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <div style={fieldStyle}>
                      <label style={modalLabelStyle}>Plant <span style={{ color: '#f87171' }}>*</span></label>
                      <select
                        value={assignData.plant}
                        onChange={(e) => setAssignData({ ...assignData, plant: e.target.value })}
                        style={modalInputStyle}
                      >
                        {PLANTS.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ ...fieldStyle, gridColumn: '1 / -1' }}>
                      <label style={modalLabelStyle}>Floor / Cabin Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Floor 2 - Software Bay Cabin #04"
                        value={assignData.floorCabin}
                        onChange={(e) => setAssignData({ ...assignData, floorCabin: e.target.value })}
                        style={modalInputStyle}
                      />
                    </div>
                  </div>
                )}

                {/* Section 2: Hardware Specs */}
                {modalTab === 'hardware' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <div style={fieldStyle}>
                      <label style={modalLabelStyle}>Type of System</label>
                      <select
                        value={assignData.deviceType}
                        onChange={(e) => setAssignData({ ...assignData, deviceType: e.target.value })}
                        style={modalInputStyle}
                      >
                        {DEVICE_TYPES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    <div style={fieldStyle}>
                      <label style={modalLabelStyle}>Processor</label>
                      <input
                        type="text"
                        placeholder="e.g. Intel Core i5 12th Gen, M3 Pro"
                        value={assignData.processor}
                        onChange={(e) => setAssignData({ ...assignData, processor: e.target.value })}
                        style={modalInputStyle}
                      />
                    </div>

                    <div style={fieldStyle}>
                      <label style={modalLabelStyle}>RAM Size</label>
                      <input
                        type="text"
                        placeholder="e.g. 16 GB DDR4"
                        value={assignData.ramSize}
                        onChange={(e) => setAssignData({ ...assignData, ramSize: e.target.value })}
                        style={modalInputStyle}
                      />
                    </div>

                    <div style={fieldStyle}>
                      <label style={modalLabelStyle}>HDD / SSD Storage</label>
                      <input
                        type="text"
                        placeholder="e.g. 512 GB NVMe SSD"
                        value={assignData.storage}
                        onChange={(e) => setAssignData({ ...assignData, storage: e.target.value })}
                        style={modalInputStyle}
                      />
                    </div>

                    <div style={fieldStyle}>
                      <label style={modalLabelStyle}>Screen / Monitor Make & Model</label>
                      <input
                        type="text"
                        placeholder="e.g. Dell 24-inch UltraSharp"
                        value={assignData.monitorDetails}
                        onChange={(e) => setAssignData({ ...assignData, monitorDetails: e.target.value })}
                        style={modalInputStyle}
                      />
                    </div>

                    <div style={fieldStyle}>
                      <label style={modalLabelStyle}>LED Screen / Monitor Serial No</label>
                      <input
                        type="text"
                        placeholder="e.g. MON-SR-99214"
                        value={assignData.monitorSerialNo}
                        onChange={(e) => setAssignData({ ...assignData, monitorSerialNo: e.target.value })}
                        style={modalInputStyle}
                      />
                    </div>
                  </div>
                )}

                {/* Section 3: Software & OS Keys */}
                {modalTab === 'software' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <div style={fieldStyle}>
                      <label style={modalLabelStyle}>Windows / OS Version</label>
                      <input
                        type="text"
                        placeholder="e.g. Windows 11 Pro 64-bit"
                        value={assignData.osVersion}
                        onChange={(e) => setAssignData({ ...assignData, osVersion: e.target.value })}
                        style={modalInputStyle}
                      />
                    </div>

                    <div style={fieldStyle}>
                      <label style={modalLabelStyle}>Windows License Key (Product Key)</label>
                      <input
                        type="text"
                        placeholder="e.g. W269N-WFGWX-YVC9B-4J6C9-T83GX"
                        value={assignData.windowsKey}
                        onChange={(e) => setAssignData({ ...assignData, windowsKey: e.target.value })}
                        style={modalInputStyle}
                      />
                    </div>

                    <div style={fieldStyle}>
                      <label style={modalLabelStyle}>Office Software Installed</label>
                      <input
                        type="text"
                        placeholder="e.g. MS Office 2021 / Microsoft 365"
                        value={assignData.officeSoftware}
                        onChange={(e) => setAssignData({ ...assignData, officeSoftware: e.target.value })}
                        style={modalInputStyle}
                      />
                    </div>

                    <div style={fieldStyle}>
                      <label style={modalLabelStyle}>Office License Key</label>
                      <input
                        type="text"
                        placeholder="e.g. Office Product Key or Assigned ID"
                        value={assignData.officeKey}
                        onChange={(e) => setAssignData({ ...assignData, officeKey: e.target.value })}
                        style={modalInputStyle}
                      />
                    </div>

                    <div style={{ ...fieldStyle, gridColumn: '1 / -1' }}>
                      <label style={modalLabelStyle}>Antivirus Installed & Key</label>
                      <input
                        type="text"
                        placeholder="e.g. QuickHeal Endpoint Security (Key: QH-2024-99)"
                        value={assignData.antivirus}
                        onChange={(e) => setAssignData({ ...assignData, antivirus: e.target.value })}
                        style={modalInputStyle}
                      />
                    </div>
                  </div>
                )}

                {/* Section 4: Network & Host Setup */}
                {modalTab === 'network' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <div style={fieldStyle}>
                      <label style={modalLabelStyle}>Host Name / Computer Name</label>
                      <input
                        type="text"
                        placeholder="e.g. VITRO-BLR-LAP04"
                        value={assignData.hostName}
                        onChange={(e) => setAssignData({ ...assignData, hostName: e.target.value })}
                        style={modalInputStyle}
                      />
                    </div>

                    <div style={fieldStyle}>
                      <label style={modalLabelStyle}>MAC (LAN / WiFi) Address</label>
                      <input
                        type="text"
                        placeholder="e.g. 00:1A:2B:3C:4D:5E"
                        value={assignData.macAddress}
                        onChange={(e) => setAssignData({ ...assignData, macAddress: e.target.value })}
                        style={modalInputStyle}
                      />
                    </div>

                    <div style={fieldStyle}>
                      <label style={modalLabelStyle}>IP Address (Static / DHCP)</label>
                      <input
                        type="text"
                        placeholder="e.g. 192.168.1.104"
                        value={assignData.ipAddress}
                        onChange={(e) => setAssignData({ ...assignData, ipAddress: e.target.value })}
                        style={modalInputStyle}
                      />
                    </div>

                    <div style={fieldStyle}>
                      <label style={modalLabelStyle}>Working Condition</label>
                      <select
                        value={assignData.workingCondition}
                        onChange={(e) => setAssignData({ ...assignData, workingCondition: e.target.value })}
                        style={modalInputStyle}
                      >
                        <option value="Excellent">Excellent</option>
                        <option value="Good">Good</option>
                        <option value="Fair">Fair</option>
                      </select>
                    </div>

                    <div style={{ ...fieldStyle, gridColumn: '1 / -1' }}>
                      <label style={modalLabelStyle}>Remarks / Handover Notes</label>
                      <textarea
                        rows="2"
                        placeholder="e.g. Laptop + Original Charger + Laptop Bag handed over in good condition."
                        value={assignData.remarks}
                        onChange={(e) => setAssignData({ ...assignData, remarks: e.target.value })}
                        style={modalInputStyle}
                      ></textarea>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer Controls */}
              <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #334155', paddingTop: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {modalTab !== 'employee' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (modalTab === 'hardware') setModalTab('employee');
                        if (modalTab === 'software') setModalTab('hardware');
                        if (modalTab === 'network') setModalTab('software');
                      }}
                      style={secondaryBtnStyle}
                    >
                      ← Back
                    </button>
                  )}

                  {modalTab !== 'network' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (modalTab === 'employee') setModalTab('hardware');
                        if (modalTab === 'hardware') setModalTab('software');
                        if (modalTab === 'software') setModalTab('network');
                      }}
                      style={secondaryBtnStyle}
                    >
                      Next Step →
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsAssignModalOpen(false)}
                    style={secondaryBtnStyle}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={assigning}
                    style={{
                      padding: '0.7rem 2rem',
                      backgroundColor: '#4f46e5',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      cursor: assigning ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)',
                    }}
                  >
                    {assigning ? 'Saving...' : '✅ Confirm & Allocate Asset'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal: View Complete Excel Specs Sheet */}
      {viewSpecsModalOpen && viewAsset && (
        <div onClick={() => setViewSpecsModalOpen(false)} style={modalOverlayStyle}>
          <div onClick={(e) => e.stopPropagation()} style={{ ...modalContentStyle, maxWidth: '820px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', color: '#ffffff', fontWeight: 700 }}>
                  📋 Complete IT Machine Specification Sheet
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#818cf8', marginTop: '2px' }}>
                  {viewAsset.make} {viewAsset.model} (SR: {viewAsset.sr})
                </p>
              </div>
              <button
                onClick={() => setViewSpecsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', maxHeight: '65vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {/* Box 1: Inward, Indent & Purchase */}
              <div style={specSectionBox}>
                <h4 style={specSectionTitle}>🧾 Procurement & Inward</h4>
                <div style={specRow}><span style={specLabel}>Against Indent:</span> <span style={{ color: '#818cf8', fontWeight: 600 }}>{viewAsset.indentNo || '—'}</span></div>
                <div style={specRow}><span style={specLabel}>PO Number:</span> <span>{viewAsset.po || '—'}</span></div>
                <div style={specRow}><span style={specLabel}>Bill / Invoice No:</span> <span style={{ color: '#ffffff', fontWeight: 600 }}>{viewAsset.billNo || '—'}</span></div>
                <div style={specRow}><span style={specLabel}>Purchase Date:</span> <span>{viewAsset.purchaseDate ? new Date(viewAsset.purchaseDate).toLocaleDateString() : '—'}</span></div>
                <div style={specRow}><span style={specLabel}>Delivery Date:</span> <span>{viewAsset.deliveryDate ? new Date(viewAsset.deliveryDate).toLocaleDateString() : '—'}</span></div>
                <div style={specRow}><span style={specLabel}>Vendor Name:</span> <span>{viewAsset.vendorName || '—'}</span></div>
                <div style={specRow}><span style={specLabel}>Warranty:</span> <span>{viewAsset.warrantyDetails || '—'}</span></div>

                {viewAsset.invoiceImage && (
                  <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #334155' }}>
                    <button
                      type="button"
                      onClick={() => setInvoicePhotoModal({ src: viewAsset.invoiceImage, billNo: viewAsset.billNo, make: `${viewAsset.make} ${viewAsset.model}` })}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        backgroundColor: '#4f46e5',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <span>📸 View Attached Invoice Copy</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Box 2: User & Location */}
              <div style={specSectionBox}>
                <h4 style={specSectionTitle}>👤 User & Plant Info</h4>
                <div style={specRow}><span style={specLabel}>Plant:</span> <span>{viewAsset.plant || '—'}</span></div>
                <div style={specRow}><span style={specLabel}>User Name:</span> <span style={{ color: '#ffffff', fontWeight: 600 }}>{viewAsset.userName || 'Unassigned'}</span></div>
                <div style={specRow}><span style={specLabel}>Emp Code:</span> <span>{viewAsset.empCode || '—'}</span></div>
                <div style={specRow}><span style={specLabel}>Mail Id:</span> <span>{viewAsset.mailId || '—'}</span></div>
                <div style={specRow}><span style={specLabel}>Department:</span> <span>{viewAsset.department || '—'}</span></div>
                <div style={specRow}><span style={specLabel}>Floor / Cabin:</span> <span>{viewAsset.floorCabin || '—'}</span></div>
              </div>

              {/* Box 3: Hardware Specs */}
              <div style={specSectionBox}>
                <h4 style={specSectionTitle}>💻 Hardware Specifications</h4>
                <div style={specRow}><span style={specLabel}>System Type:</span> <span>{viewAsset.deviceType || 'Laptop'}</span></div>
                <div style={specRow}><span style={specLabel}>Make & Model:</span> <span>{viewAsset.make} {viewAsset.model}</span></div>
                <div style={specRow}><span style={specLabel}>Serial Number (SR):</span> <code style={{ color: '#818cf8' }}>{viewAsset.sr}</code></div>
                <div style={specRow}><span style={specLabel}>Processor:</span> <span>{viewAsset.processor || '—'}</span></div>
                <div style={specRow}><span style={specLabel}>RAM Size:</span> <span>{viewAsset.ramSize || '—'}</span></div>
                <div style={specRow}><span style={specLabel}>HDD / SSD:</span> <span>{viewAsset.storage || '—'}</span></div>
              </div>

              {/* Box 4: Software & Network */}
              <div style={specSectionBox}>
                <h4 style={specSectionTitle}>🔑 Software & Network</h4>
                <div style={specRow}><span style={specLabel}>Windows / OS:</span> <span>{viewAsset.osVersion || '—'}</span></div>
                <div style={specRow}><span style={specLabel}>Windows Key:</span> <code style={{ fontSize: '0.75rem', color: '#34d399' }}>{viewAsset.windowsKey || '—'}</code></div>
                <div style={specRow}><span style={specLabel}>MS Office:</span> <span>{viewAsset.officeSoftware || '—'}</span></div>
                <div style={specRow}><span style={specLabel}>Antivirus:</span> <span>{viewAsset.antivirus || '—'}</span></div>
                <div style={specRow}><span style={specLabel}>Host Name:</span> <span>{viewAsset.hostName || '—'}</span></div>
                <div style={specRow}><span style={specLabel}>MAC Address:</span> <span>{viewAsset.macAddress || '—'}</span></div>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #334155', paddingTop: '1rem' }}>
              <button onClick={() => setViewSpecsModalOpen(false)} style={secondaryBtnStyle}>
                Close Specification Sheet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal: View Attached Invoice Photo in Full Size */}
      {invoicePhotoModal && (
        <div
          onClick={() => setInvoicePhotoModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(6px)',
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
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '16px',
              maxWidth: '90vw',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px rgba(0,0,0,0.7)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid #334155' }}>
              <div>
                <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '1.1rem' }}>
                  🧾 Attached Invoice Photo Copy
                </div>
                <div style={{ fontSize: '0.8rem', color: '#818cf8', marginTop: '2px' }}>
                  {invoicePhotoModal.make} • Bill No: {invoicePhotoModal.billNo || 'N/A'}
                </div>
              </div>
              <button
                onClick={() => setInvoicePhotoModal(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: '1.25rem', overflow: 'auto', textAlign: 'center', height: '75vh' }}>
              {invoicePhotoModal.src?.startsWith('data:application/pdf') ? (
                <iframe
                  src={invoicePhotoModal.src}
                  title="Invoice PDF"
                  style={{ width: '80vw', height: '100%', border: 'none', borderRadius: '8px' }}
                />
              ) : (
                <img
                  src={invoicePhotoModal.src}
                  alt="Invoice Copy"
                  style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: '8px', objectFit: 'contain' }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const filterInputStyle = {
  backgroundColor: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '8px',
  padding: '0.55rem 1rem',
  color: '#f8fafc',
  fontSize: '0.85rem',
  minWidth: '240px',
  outline: 'none',
};

const filterSelectStyle = {
  backgroundColor: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '8px',
  padding: '0.55rem 0.75rem',
  color: '#f8fafc',
  fontSize: '0.85rem',
  outline: 'none',
  cursor: 'pointer',
};

const modalOverlayStyle = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.75)',
  backdropFilter: 'blur(5px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1rem',
  zIndex: 999,
};

const modalContentStyle = {
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '16px',
  width: '100%',
  padding: '2rem',
  boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
};

const fieldStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.4rem',
};

const modalLabelStyle = {
  fontSize: '0.825rem',
  fontWeight: 600,
  color: '#cbd5e1',
};

const modalInputStyle = {
  backgroundColor: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '8px',
  padding: '0.65rem 0.9rem',
  color: '#f8fafc',
  fontSize: '0.875rem',
  outline: 'none',
};

const secondaryBtnStyle = {
  padding: '0.65rem 1.25rem',
  backgroundColor: '#334155',
  color: '#cbd5e1',
  border: 'none',
  borderRadius: '8px',
  fontSize: '0.875rem',
  fontWeight: 600,
  cursor: 'pointer',
};

const modalTabBtn = (active) => ({
  padding: '0.55rem 1rem',
  borderRadius: '8px',
  border: 'none',
  fontSize: '0.85rem',
  fontWeight: active ? 600 : 500,
  color: active ? '#ffffff' : '#94a3b8',
  backgroundColor: active ? '#4f46e5' : '#0f172a',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
});

const specSectionBox = {
  backgroundColor: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '10px',
  padding: '1rem',
};

const specSectionTitle = {
  fontSize: '0.875rem',
  color: '#818cf8',
  fontWeight: 700,
  marginBottom: '0.75rem',
  borderBottom: '1px solid #334155',
  paddingBottom: '0.4rem',
};

const specRow = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '0.825rem',
  padding: '0.25rem 0',
  color: '#cbd5e1',
};

const specLabel = {
  color: '#94a3b8',
  fontWeight: 500,
};
