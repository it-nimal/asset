import React, { useState, useEffect } from 'react';
import { X, UserCheck, CheckCircle2, ArrowRight, ShieldCheck, Printer, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import EmployeeSelector from './EmployeeSelector';
import AvailableAssetSelector from './AvailableAssetSelector';
import AllocationDetailsForm from './AllocationDetailsForm';
import AllocationReview from './AllocationReview';
import HandoverDocument from './HandoverDocument';

export default function AssetAllocationModal({
  initialEmployee = null,
  initialAsset = null,
  initialAssets = [],
  employees = [],
  assets = [],
  departments = [],
  locations = [],
  onClose,
  onSuccess,
}) {
  const { user } = useAuth();
  const toast = useToast();

  // Wizard Step: 1 = Form, 2 = Review, 3 = Handover Document
  const [step, setStep] = useState(1);

  // Selected State
  const [selectedEmployee, setSelectedEmployee] = useState(initialEmployee);
  const [selectedAssets, setSelectedAssets] = useState(() => {
    if (initialAssets && initialAssets.length > 0) return initialAssets;
    if (initialAsset) return [initialAsset];
    return [];
  });

  // Allocation Parameters
  const [allocationDate, setAllocationDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState(
    initialEmployee?.location || initialAsset?.plant || 'Vitromed'
  );
  const [purpose, setPurpose] = useState('Regular Work');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [remarks, setRemarks] = useState('');

  // Available stock cache from API
  const [availableStock, setAvailableStock] = useState([]);
  const [loadingStock, setLoadingStock] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Success result state
  const [allocationResult, setAllocationResult] = useState(null);

  // Fetch fresh available inventory
  useEffect(() => {
    let mounted = true;
    setLoadingStock(true);
    api
      .getAvailableAssets()
      .then((data) => {
        if (mounted) {
          // If initialAssets provided, ensure they are in the available list even if state is fresh
          const list = Array.isArray(data) ? data : [];
          if (initialAsset && !list.some((a) => a._id === initialAsset._id)) {
            list.unshift(initialAsset);
          }
          (initialAssets || []).forEach((ia) => {
            if (!list.some((a) => a._id === ia._id)) list.unshift(ia);
          });
          setAvailableStock(list);
        }
      })
      .catch((err) => {
        console.warn('Failed to load available assets:', err);
        // Fallback to in-memory assets with status Available
        const fallback = assets.filter((a) => a.status === 'Available');
        setAvailableStock(fallback);
      })
      .finally(() => {
        if (mounted) setLoadingStock(false);
      });

    return () => {
      mounted = false;
    };
  }, [initialAsset, initialAssets, assets]);

  // Handle toggling asset in selection tray
  const handleToggleAsset = (asset) => {
    setSelectedAssets((prev) => {
      const exists = prev.some((a) => a._id === asset._id);
      if (exists) {
        return prev.filter((a) => a._id !== asset._id);
      } else {
        return [...prev, asset];
      }
    });
  };

  const handleRemoveAsset = (assetId) => {
    setSelectedAssets((prev) => prev.filter((a) => a._id !== assetId));
  };

  // Validate step 1 before proceeding to Review
  const handleProceedToReview = (e) => {
    e.preventDefault();
    if (!selectedEmployee) {
      return toast.error('Please select an active employee recipient');
    }
    if (selectedAssets.length === 0) {
      return toast.error('Please select at least one available asset to allocate');
    }
    setStep(2);
  };

  // Commit allocation transaction
  const handleConfirmAllocation = async () => {
    if (!selectedEmployee || selectedAssets.length === 0) return;

    setSubmitting(true);
    try {
      const payload = {
        employeeId: selectedEmployee._id || selectedEmployee.employeeId,
        employeeName: selectedEmployee.name,
        employeeCode: selectedEmployee.employeeId,
        email: selectedEmployee.email,
        department: selectedEmployee.department || 'General',
        location: location || selectedEmployee.location || 'Vitromed',
        assetIds: selectedAssets.map((a) => a._id),
        allocationDate,
        purpose,
        expectedReturnDate: expectedReturnDate || null,
        remarks: remarks || ('Allocated to ' + selectedEmployee.name + ' by ' + (user?.name || 'IT Admin')),
        actorName: user?.name || 'IT Admin',
      };

      const res = await api.allocateAssets(payload);

      toast.success(
        'Successfully allocated ' + selectedAssets.length + ' asset(s) to ' + selectedEmployee.name + '!',
        'Allocation Confirmed'
      );

      setAllocationResult({
        allocationRef: res.allocationId || ('ALC-VIT-' + Math.floor(100000 + Math.random() * 900000)),
        employee: selectedEmployee,
        issuedAssets: res.assets || selectedAssets,
        allocationDate,
        location,
        purpose,
        remarks,
      });

      if (onSuccess) {
        onSuccess(res.assets || selectedAssets);
      }

      // Transition to Handover Document view
      setStep(3);
    } catch (err) {
      toast.error(err.message || 'Failed to complete allocation', 'Allocation Error');
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 3 && allocationResult) {
    return (
      <HandoverDocument
        allocationRef={allocationResult.allocationRef}
        employee={allocationResult.employee}
        issuedAssets={allocationResult.issuedAssets}
        allocationDate={allocationResult.allocationDate}
        location={allocationResult.location}
        purpose={allocationResult.purpose}
        remarks={allocationResult.remarks}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '780px',
          width: '95vw',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-surface, #ffffff)',
          borderRadius: '10px',
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
            <UserCheck size={20} color="#0284c7" />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {step === 1 ? 'Allocate Hardware to Employee' : 'Review & Confirm Allocation'}
              </h3>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                {step === 1
                  ? 'Issue available workstations, monitors, and peripherals from depot to employee custody.'
                  : 'Verify allocation bundle before generating custody and undertaking records.'}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-icon btn-xs">
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div
          className="modal-body"
          style={{
            padding: '1.25rem 1.5rem',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          {step === 1 && (
            <form id="allocation-form" onSubmit={handleProceedToReview} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Section 1: Employee Selector */}
              <EmployeeSelector
                employees={employees}
                assets={assets}
                selectedEmployee={selectedEmployee}
                onSelectEmployee={(emp) => {
                  setSelectedEmployee(emp);
                  if (emp.location) setLocation(emp.location);
                }}
                onClearEmployee={() => setSelectedEmployee(null)}
                disabled={Boolean(initialEmployee)}
              />

              {/* Section 2: Available Asset Selector & Multi-Select */}
              <AvailableAssetSelector
                availableAssets={availableStock}
                selectedAssets={selectedAssets}
                onToggleAsset={handleToggleAsset}
                onRemoveAsset={handleRemoveAsset}
              />

              {/* Section 3: Allocation Parameters */}
              <AllocationDetailsForm
                allocationDate={allocationDate}
                setAllocationDate={setAllocationDate}
                location={location}
                setLocation={setLocation}
                purpose={purpose}
                setPurpose={setPurpose}
                expectedReturnDate={expectedReturnDate}
                setExpectedReturnDate={setExpectedReturnDate}
                remarks={remarks}
                setRemarks={setRemarks}
              />
            </form>
          )}

          {step === 2 && (
            <AllocationReview
              employee={selectedEmployee}
              selectedAssets={selectedAssets}
              allocationDate={allocationDate}
              location={location}
              purpose={purpose}
              expectedReturnDate={expectedReturnDate}
              remarks={remarks}
              onBack={() => setStep(1)}
              onConfirm={handleConfirmAllocation}
              loading={submitting}
            />
          )}
        </div>

        {/* Footer (For Step 1) */}
        {step === 1 && (
          <div
            className="modal-footer"
            style={{
              padding: '0.85rem 1.5rem',
              borderTop: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-surface-raised, #f8fafc)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <button type="button" onClick={onClose} className="btn btn-outline btn-sm">
              Cancel
            </button>

            <button
              type="submit"
              form="allocation-form"
              disabled={!selectedEmployee || selectedAssets.length === 0}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}
            >
              <span>Review Allocation ({selectedAssets.length})</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
