import React, { useState, useMemo } from 'react';
import { X, ArrowRightLeft, Laptop, User, CheckCircle2, AlertCircle, Building2, MapPin, Tag } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../common/Toast';
import { useAuth } from '../../context/AuthContext';
import EmployeeSelector from '../allocation/EmployeeSelector';
import TransferReview from './TransferReview';

const REASON_OPTIONS = [
  'Employee Transfer',
  'Department Change',
  'Role Change',
  'Replacement',
  'Project Assignment',
  'Location Change',
  'Management Decision',
  'Other',
];

export default function TransferForm({
  initialAsset = null,
  assets = [],
  employees = [],
  departments = [],
  locations = [],
  onClose,
  onSuccess,
}) {
  const { user } = useAuth();
  const toast = useToast();

  const [step, setStep] = useState(1); // 1: Form, 2: Review
  const [loading, setLoading] = useState(false);

  // Asset selection
  const [selectedAssetId, setSelectedAssetId] = useState(initialAsset?._id || '');
  const selectedAsset = useMemo(() => {
    if (initialAsset && initialAsset._id === selectedAssetId) return initialAsset;
    return assets.find((a) => a._id === selectedAssetId) || initialAsset;
  }, [selectedAssetId, assets, initialAsset]);

  // Destination Employee selection
  const [selectedDestinationEmployee, setSelectedDestinationEmployee] = useState(null);

  // Transfer parameters
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('Employee Transfer');
  const [destinationLocation, setDestinationLocation] = useState('');
  const [assetCondition, setAssetCondition] = useState(selectedAsset?.workingCondition || 'Good');
  const [accessoriesTransferred, setAccessoriesTransferred] = useState(true);
  const [accessoryNotes, setAccessoryNotes] = useState(selectedAsset?.accessories || '');
  const [remarks, setRemarks] = useState('');

  // Available assigned assets for dropdown (if not preselected)
  const assignedAssetsList = useMemo(() => {
    return assets.filter((a) => a.status === 'Assigned');
  }, [assets]);

  // Destination employee options (filter out current custodian)
  const eligibleEmployees = useMemo(() => {
    if (!selectedAsset) return employees;
    const currName = (selectedAsset.userName || '').trim().toLowerCase();
    const currCode = (selectedAsset.empCode || '').trim().toLowerCase();

    return employees.filter((e) => {
      const eName = (e.name || '').trim().toLowerCase();
      const eCode = (e.employeeId || '').trim().toLowerCase();
      if (currCode && eCode === currCode) return false;
      if (currName && eName === currName) return false;
      return true;
    });
  }, [employees, selectedAsset]);

  const handleNextStep = (e) => {
    e.preventDefault();

    if (!selectedAsset) {
      toast.error('Please select an assigned asset to transfer');
      return;
    }

    if (selectedAsset.status !== 'Assigned') {
      toast.error(`Only Assigned assets can be transferred. Selected asset status is "${selectedAsset.status}".`);
      return;
    }

    if (!selectedDestinationEmployee) {
      toast.error('Please select the destination employee recipient');
      return;
    }

    // Check same employee
    const currentCustodianCode = (selectedAsset.empCode || '').trim().toLowerCase();
    const currentCustodianName = (selectedAsset.userName || '').trim().toLowerCase();
    const destCode = (selectedDestinationEmployee.employeeId || '').trim().toLowerCase();
    const destName = (selectedDestinationEmployee.name || '').trim().toLowerCase();

    if (
      (currentCustodianCode && destCode && currentCustodianCode === destCode) ||
      (currentCustodianName && destName && currentCustodianName === destName)
    ) {
      toast.error('The destination employee is already the current custodian.');
      return;
    }

    setStep(2);
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        assetId: selectedAsset._id,
        toEmployeeId: selectedDestinationEmployee.employeeId,
        toEmployeeName: selectedDestinationEmployee.name,
        toEmpCode: selectedDestinationEmployee.employeeId,
        toDepartment: selectedDestinationEmployee.department || selectedAsset.department,
        toLocation: destinationLocation || selectedDestinationEmployee.location || selectedAsset.plant,
        toDesignation: selectedDestinationEmployee.designation || 'Associate',
        toEmail: selectedDestinationEmployee.email || '',
        transferDate,
        reason,
        destinationLocation: destinationLocation || selectedDestinationEmployee.location || selectedAsset.plant,
        remarks,
        assetCondition,
        accessoriesTransferred,
        accessoryNotes,
        actorName: user?.name || 'IT Admin',
      };

      const res = await api.createTransfer(payload);
      toast.success(
        `Transfer request ${res?.data?.transferId || ''} created successfully!`,
        'Transfer Initiated'
      );

      if (onSuccess) onSuccess(res.data);
      onClose();
    } catch (err) {
      toast.error(err.message, 'Transfer Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 100 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '680px', width: '95vw', maxHeight: '92vh', overflowY: 'auto' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowRightLeft size={18} color="#38bdf8" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
              {step === 1 ? 'Initiate Asset Custody Transfer' : 'Review & Confirm Transfer'}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-icon btn-xs">
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '1.25rem 1.5rem' }}>
          {step === 1 ? (
            <form onSubmit={handleNextStep} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {/* 1. Asset Selection */}
              <div>
                <label className="form-label" style={{ fontWeight: 700, marginBottom: '0.35rem' }}>
                  1. Select Assigned Asset to Transfer <span style={{ color: '#f87171' }}>*</span>
                </label>

                {initialAsset ? (
                  <div
                    style={{
                      padding: '0.85rem 1rem',
                      backgroundColor: 'rgba(56, 189, 248, 0.06)',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {selectedAsset.make} {selectedAsset.model}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontFamily: 'var(--font-mono)', marginTop: '0.15rem' }}>
                        Tag: {selectedAsset.assetNo || 'AST-N/A'} • S/N: {selectedAsset.sr} • Type: {selectedAsset.deviceType}
                      </div>
                    </div>
                    <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                      Assigned
                    </span>
                  </div>
                ) : (
                  <select
                    required
                    value={selectedAssetId}
                    onChange={(e) => setSelectedAssetId(e.target.value)}
                    className="form-select"
                  >
                    <option value="">-- Choose Assigned Asset ({assignedAssetsList.length} currently assigned) --</option>
                    {assignedAssetsList.map((a) => (
                      <option key={a._id} value={a._id}>
                        {a.assetNo || 'NO-TAG'} — {a.make} {a.model} (Custodian: {a.userName} • {a.department})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Current Custodian Display (Read-Only) */}
              {selectedAsset && (
                <div
                  style={{
                    padding: '0.85rem 1rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Current Custodian (Read-Only from Asset Master)
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.35rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                        {selectedAsset.userName || 'Unassigned'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontFamily: 'var(--font-mono)', marginLeft: '0.5rem' }}>
                        {selectedAsset.empCode || 'NO-CODE'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {selectedAsset.department || 'IT'} • {selectedAsset.plant || 'Vitromed'}
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Destination Employee Selection */}
              <div>
                <label className="form-label" style={{ fontWeight: 700, marginBottom: '0.35rem' }}>
                  2. Select New Employee Custodian <span style={{ color: '#f87171' }}>*</span>
                </label>
                <EmployeeSelector
                  employees={eligibleEmployees}
                  assets={assets}
                  selectedEmployee={selectedDestinationEmployee}
                  onSelectEmployee={(emp) => setSelectedDestinationEmployee(emp)}
                  onClearEmployee={() => setSelectedDestinationEmployee(null)}
                />
              </div>

              {/* 3. Transfer Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label">
                    Transfer Date <span style={{ color: '#f87171' }}>*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={transferDate}
                    onChange={(e) => setTransferDate(e.target.value)}
                    className="form-control"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Transfer Reason <span style={{ color: '#f87171' }}>*</span>
                  </label>
                  <select
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="form-select"
                  >
                    {REASON_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label">Destination Location / Plant</label>
                  <input
                    type="text"
                    value={destinationLocation}
                    onChange={(e) => setDestinationLocation(e.target.value)}
                    placeholder="e.g. Jaipur, Vitromed Plant 2"
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Asset Condition During Handover</label>
                  <select
                    value={assetCondition}
                    onChange={(e) => setAssetCondition(e.target.value)}
                    className="form-select"
                  >
                    <option value="Good">Good — Full working order</option>
                    <option value="Minor Wear">Minor Wear — Cosmetic scratches</option>
                    <option value="Damaged">Damaged — Partial functional issues</option>
                  </select>
                </div>
              </div>

              {/* Accessories Confirmation */}
              <div
                style={{
                  padding: '0.85rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                }}
              >
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={accessoriesTransferred}
                    onChange={(e) => setAccessoriesTransferred(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#0284c7' }}
                  />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Transfer associated accessories with this asset (Power adapter, cables, mouse, bag)
                  </span>
                </label>

                <input
                  type="text"
                  value={accessoryNotes}
                  onChange={(e) => setAccessoryNotes(e.target.value)}
                  placeholder="Notes on accessories (e.g. Original 65W Dell Type-C Charger + Bag included)"
                  className="form-control form-control-sm"
                />
              </div>

              {/* Remarks */}
              <div className="form-group">
                <label className="form-label">Transfer Remarks & Handover Notes</label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Transferred for new role assignment. Verified physical condition and system password reset."
                  className="form-control"
                />
              </div>

              {/* Form Footer */}
              <div className="modal-footer" style={{ marginTop: '0.5rem', padding: '0.75rem 0 0 0' }}>
                <button type="button" onClick={onClose} className="btn btn-outline btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Review Transfer →
                </button>
              </div>
            </form>
          ) : (
            <TransferReview
              transferData={{
                transferDate,
                reason,
                destinationLocation,
                assetCondition,
                accessoriesTransferred,
                accessoryNotes,
                remarks,
                toEmployeeName: selectedDestinationEmployee?.name,
                toEmpCode: selectedDestinationEmployee?.employeeId,
                toDepartment: selectedDestinationEmployee?.department,
              }}
              asset={selectedAsset}
              fromEmployee={{
                name: selectedAsset?.userName,
                employeeId: selectedAsset?.empCode,
                department: selectedAsset?.department,
                location: selectedAsset?.plant,
              }}
              toEmployee={selectedDestinationEmployee}
              onBack={() => setStep(1)}
              onConfirm={handleFinalSubmit}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
