import React, { useState, useEffect, useMemo } from 'react';
import {
  Laptop,
  Monitor,
  Keyboard,
  Headphones,
  Printer,
  Scan,
  Zap,
  Network,
  Layers,
  Plus,
  Edit3,
  Trash2,
  X,
  IdCard,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Calendar,
  UserCheck,
  RefreshCw,
  Briefcase,
  BadgeCheck,
  Eye,
  Undo2,
  ArrowRightLeft,
  FileText,
  Clock,
  CheckCircle2,
  Building2,
  MapPin,
  Mail,
  Phone,
  UserX,
  AlertTriangle,
  Send,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../common/Toast';
import { hasSoftwareLicensing } from '../../constants/specifications';
import { useAuth } from '../../context/AuthContext';
import AssetAllocationModal from '../allocation/AssetAllocationModal';

export default function EmployeeProfileModal({
  employee,
  assets = [],
  allEmployees = [],
  onClose,
  onViewAsset,
  onAddNewAssign,
  onSuccess,
}) {
  const { user } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('assets'); // 'overview' | 'assets' | 'history' | 'software' | 'undertaking'
  const [historyEvents, setHistoryEvents] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Sub-action modals state
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [transferringAsset, setTransferringAsset] = useState(null);
  const [returningAsset, setReturningAsset] = useState(null);
  const [showOffboardModal, setShowOffboardModal] = useState(false);

  // Transfer form state
  const [targetEmployeeId, setTargetEmployeeId] = useState('');
  const [transferRemarks, setTransferRemarks] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);

  // Return form state
  const [returnCondition, setReturnCondition] = useState('Good');
  const [returnRemarks, setReturnRemarks] = useState('');
  const [returnLoading, setReturnLoading] = useState(false);

  // Offboard form state
  const [exitReason, setExitReason] = useState('Resigned');
  const [exitDate, setExitDate] = useState(new Date().toISOString().split('T')[0]);
  const [exitRemarks, setExitRemarks] = useState('');
  const [offboardLoading, setOffboardLoading] = useState(false);

  // Filter assets currently assigned to this employee
  const currentAssets = useMemo(() => {
    if (!employee || !assets) return [];
    const empName = (employee.name || '').trim().toLowerCase();
    const empId = (employee.employeeId || '').trim().toLowerCase();
    const empEmail = (employee.email || '').trim().toLowerCase();
    const normEmpId = empId ? empId.replace(/[^a-z0-9]/g, '') : '';
    const normEmpName = empName ? empName.replace(/[^a-z0-9]/g, '') : '';

    return assets.filter((a) => {
      const aUser = (a.userName || '').trim().toLowerCase();
      const aStatus = (a.status || '').trim().toLowerCase();
      if (!aUser || aUser === 'unassigned' || aStatus === 'available' || aStatus === 'retired' || aStatus === 'disposed') {
        return false;
      }

      // 1. Employee Code Match
      const aCode = (a.empCode || '').trim().toLowerCase();
      if (empId && aCode) {
        if (empId === aCode) return true;
        const normACode = aCode.replace(/[^a-z0-9]/g, '');
        if (normEmpId && normACode && normEmpId === normACode) return true;
      }

      // 2. Email Match
      const aMail = (a.mailId || '').trim().toLowerCase();
      if (empEmail && aMail) {
        if (empEmail === aMail) return true;
        const emails = aMail.split(/[,;\\s]+/).map((m) => m.trim());
        if (emails.includes(empEmail)) return true;
      }

      // 3. Name Match
      if (empName && aUser) {
        if (aUser === empName) return true;
        if (normEmpName && normEmpName === aUser.replace(/[^a-z0-9]/g, '')) return true;

        const parts = aUser.split(/[\\/,;&+]+/).map((p) => p.trim());
        for (const part of parts) {
          if (!part) continue;
          if (part === empName) return true;
          const normPart = part.replace(/[^a-z0-9]/g, '');
          if (normEmpName && normPart && normEmpName === normPart) return true;

          const words = part.split(/\\s+/).filter(Boolean);
          if (words.includes(empName)) return true;
        }
      }

      return false;
    });
  }, [employee, assets]);

  // Load chronological timeline history for this employee
  const loadEmployeeHistory = async () => {
    if (!employee) return;
    setLoadingHistory(true);
    try {
      const empIdentifier = employee._id || employee.employeeId || employee.name;
      const res = await api.getEmployeeHistory(empIdentifier);
      if (res && res.success && Array.isArray(res.data)) {
        setHistoryEvents(res.data);
      } else if (Array.isArray(res)) {
        setHistoryEvents(res);
      }
    } catch (err) {
      console.warn('Failed to load employee history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      loadEmployeeHistory();
    }
  }, [activeTab, employee]);

  // Helper to parse peripheral accessories badges
  const parsePeripherals = (asset) => {
    if (!asset) return [];
    const badges = [];
    const devCat = (asset.deviceCategory || asset.category || '').toLowerCase();
    const devType = (asset.deviceType || '').toLowerCase();
    const isPower = devCat === 'power' || devType.includes('ups') || devType.includes('inverter') || devType.includes('battery');
    const isNetwork = devCat === 'network' || devType.includes('switch') || devType.includes('router') || devType.includes('firewall');
    const isPrinter = devCat === 'printer' || devCat === 'printers' || devType.includes('printer');
    const isMonitor = devCat === 'display' || devCat === 'displays' || devType.includes('monitor');

    // Only show separate monitor badge if this is a computer and not a standalone monitor
    if (asset.monitorDetails && !isMonitor && !isPower && !isNetwork && !isPrinter) {
      badges.push({ name: `Monitor: ${asset.monitorDetails}`, icon: Monitor, color: '#818cf8' });
    }

    if (asset.accessories) {
      const items = asset.accessories.split(',').map((s) => s.trim()).filter(Boolean);
      items.forEach((item) => {
        const lower = item.toLowerCase();
        // Skip laptop-only accessories for non-computing assets
        if ((isPower || isNetwork || isPrinter || isMonitor) && 
            (lower.includes('bag') || lower.includes('mouse') || lower.includes('keyboard') || lower.includes('adapter') || lower.includes('k/b') || lower.includes('dock'))) {
          return;
        }

        let icon = Layers;
        let color = '#38bdf8';
        if (lower.includes('keyboard') || lower.includes('mouse') || lower.includes('k/b')) {
          icon = Keyboard;
          color = '#38bdf8';
        } else if (lower.includes('headphone') || lower.includes('headset')) {
          icon = Headphones;
          color = '#ec4899';
        } else if (lower.includes('printer')) {
          icon = Printer;
          color = '#fbbf24';
        } else if (lower.includes('scan')) {
          icon = Scan;
          color = '#34d399';
        } else if (lower.includes('ups') || lower.includes('inverter') || lower.includes('power')) {
          icon = Zap;
          color = '#f87171';
        }
        badges.push({ name: item, icon, color });
      });
    }
    return badges;
  };

  // Handle single asset return
  const handleConfirmReturn = async (e) => {
    e.preventDefault();
    if (!returningAsset) return;

    setReturnLoading(true);
    try {
      await api.returnAsset(returningAsset._id, {
        returnDate: new Date().toISOString().split('T')[0],
        returnCondition,
        remarks: returnRemarks || `Returned by ${employee.name} (${employee.employeeId || 'Staff'})`,
        actorName: user?.name || 'IT Admin',
      });

      toast.success(
        `Asset ${returningAsset.assetNo ? '#' + returningAsset.assetNo : returningAsset.sr} returned to stock successfully!`,
        'Asset Returned'
      );
      setReturningAsset(null);
      setReturnRemarks('');
      if (onSuccess) onSuccess();
      if (activeTab === 'history') loadEmployeeHistory();
    } catch (err) {
      toast.error(err.message || 'Failed to return asset', 'Return Error');
    } finally {
      setReturnLoading(false);
    }
  };

  // Handle single asset transfer to another user
  const handleConfirmTransfer = async (e) => {
    e.preventDefault();
    if (!transferringAsset) return;
    if (!targetEmployeeId) {
      return toast.error('Please select the recipient employee for transfer');
    }

    const targetEmp = allEmployees.find((e) => (e._id || e.employeeId) === targetEmployeeId);
    if (!targetEmp) {
      return toast.error('Selected recipient employee not found');
    }

    setTransferLoading(true);
    try {
      await api.transferAsset(transferringAsset._id, {
        newUserName: targetEmp.name,
        newEmpCode: targetEmp.employeeId || '',
        newMailId: targetEmp.email || '',
        newDepartment: targetEmp.department || '',
        newPlant: targetEmp.location || 'Vitromed',
        remarks: transferRemarks || `Transferred from ${employee.name} to ${targetEmp.name}`,
        actorName: user?.name || 'IT Admin',
      });

      toast.success(
        `Asset ${transferringAsset.assetNo ? '#' + transferringAsset.assetNo : transferringAsset.sr} transferred to ${targetEmp.name}!`,
        'Asset Transferred'
      );
      setTransferringAsset(null);
      setTargetEmployeeId('');
      setTransferRemarks('');
      if (onSuccess) onSuccess();
      if (activeTab === 'history') loadEmployeeHistory();
    } catch (err) {
      toast.error(err.message || 'Failed to transfer asset', 'Transfer Error');
    } finally {
      setTransferLoading(false);
    }
  };

  // Handle entire employee offboarding & asset recovery
  const handleConfirmOffboarding = async (e) => {
    e.preventDefault();
    setOffboardLoading(true);
    try {
      const empIdentifier = employee._id || employee.employeeId;
      await api.offboardEmployee(empIdentifier, {
        exitDate,
        reason: exitReason,
        remarks: exitRemarks || `Employee exit processed. All ${currentAssets.length} asset(s) checked back into inventory.`,
        actorName: user?.name || 'IT Admin',
      });

      toast.success(
        `Offboarding completed for ${employee.name}. ${currentAssets.length} asset(s) recovered to available stock.`,
        'Employee Offboarded'
      );
      setShowOffboardModal(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to complete employee offboarding', 'Offboarding Error');
    } finally {
      setOffboardLoading(false);
    }
  };

  const statusColor =
    employee.status === 'On Leave' ? '#fbbf24' : employee.status === 'Resigned' ? '#f87171' : '#10b981';
  const statusBg =
    employee.status === 'On Leave'
      ? 'rgba(251, 191, 36, 0.12)'
      : employee.status === 'Resigned'
      ? 'rgba(248, 113, 113, 0.12)'
      : 'rgba(16, 185, 129, 0.12)';

  return (
    <div className="modal-overlay employee-profile-modal-overlay" onClick={onClose}>
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 10mm 8mm 10mm;
          }

          body, html, #root {
            background: #ffffff !important;
            color: #0f172a !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .app-main-layout,
          .no-print,
          .sidebar,
          .app-header,
          .toast-container,
          .modal-header,
          .tabs-container,
          nav,
          aside {
            display: none !important;
          }

          .modal-overlay.employee-profile-modal-overlay {
            position: static !important;
            display: block !important;
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            inset: auto !important;
            width: 100% !important;
            height: auto !important;
          }

          .modal-content.employee-profile-modal-content {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
            max-height: none !important;
            overflow: visible !important;
            background: #ffffff !important;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
      <div
        className="modal-content employee-profile-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '960px',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: 'var(--radius-full)',
                background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '1.15rem',
                boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
                flexShrink: 0,
              }}
            >
              {(employee.name || 'E').charAt(0).toUpperCase()}
            </div>

            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                <h3
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    margin: 0,
                  }}
                >
                  {employee.name}
                </h3>

                <span
                  style={{
                    fontSize: '0.74rem',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    padding: '0.15rem 0.55rem',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(2, 132, 199, 0.12)',
                    color: '#0284c7',
                    border: '1px solid rgba(2, 132, 199, 0.25)',
                  }}
                >
                  ID: {employee.employeeId || 'Not Set'}
                </span>

                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.55rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: statusBg,
                    color: statusColor,
                    border: `1px solid ${statusColor}33`,
                  }}
                >
                  ● {employee.status || 'Active'}
                </span>

                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.55rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: currentAssets.length > 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(148, 163, 184, 0.12)',
                    color: currentAssets.length > 0 ? '#059669' : '#64748b',
                    border: currentAssets.length > 0 ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(148, 163, 184, 0.25)',
                  }}
                >
                  {currentAssets.length} Active {currentAssets.length === 1 ? 'Asset' : 'Assets'}
                </span>
              </div>

              <div
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  marginTop: '3px',
                  display: 'flex',
                  gap: '0.6rem',
                  flexWrap: 'wrap',
                }}
              >
                {employee.designation && <span>{employee.designation}</span>}
                <span>• {employee.department || 'General'}</span>
                <span>• {employee.location || 'Vitromed Plant'}</span>
                {employee.email && <span>• {employee.email}</span>}
              </div>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            {currentAssets.length > 0 && employee.status !== 'Resigned' && (
              <button
                type="button"
                onClick={() => setShowOffboardModal(true)}
                className="btn btn-outline btn-xs"
                style={{
                  borderColor: 'rgba(239, 68, 68, 0.4)',
                  color: '#ef4444',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
                title="Initiate Employee Offboarding & Recover All Hardware"
              >
                <UserX size={13} />
                <span>Offboard / Exit</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setActiveTab('undertaking');
                setTimeout(() => window.print(), 100);
              }}
              className="btn btn-outline btn-xs"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}
              title="Print official Employee IT Hardware Handover Undertaking"
            >
              <Printer size={13} />
              <span>Print Undertaking</span>
            </button>

            <button type="button" onClick={onClose} className="btn btn-ghost btn-icon btn-xs">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-default)',
            padding: '0 1.5rem',
            gap: '0.5rem',
            backgroundColor: 'var(--bg-surface-raised, #f8fafc)',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '0.7rem 1rem',
              border: 'none',
              background: 'none',
              fontSize: '0.82rem',
              fontWeight: activeTab === 'overview' ? 700 : 500,
              color: activeTab === 'overview' ? '#0284c7' : 'var(--text-muted)',
              borderBottom: activeTab === 'overview' ? '2px solid #0284c7' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Briefcase size={14} />
            <span>Profile Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('assets')}
            style={{
              padding: '0.7rem 1rem',
              border: 'none',
              background: 'none',
              fontSize: '0.82rem',
              fontWeight: activeTab === 'assets' ? 700 : 500,
              color: activeTab === 'assets' ? '#0284c7' : 'var(--text-muted)',
              borderBottom: activeTab === 'assets' ? '2px solid #0284c7' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Laptop size={14} />
            <span>Current Assets ({currentAssets.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            style={{
              padding: '0.7rem 1rem',
              border: 'none',
              background: 'none',
              fontSize: '0.82rem',
              fontWeight: activeTab === 'history' ? 700 : 500,
              color: activeTab === 'history' ? '#0284c7' : 'var(--text-muted)',
              borderBottom: activeTab === 'history' ? '2px solid #0284c7' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Clock size={14} />
            <span>Custody Timeline</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('software')}
            style={{
              padding: '0.7rem 1rem',
              border: 'none',
              background: 'none',
              fontSize: '0.82rem',
              fontWeight: activeTab === 'software' ? 700 : 500,
              color: activeTab === 'software' ? '#0284c7' : 'var(--text-muted)',
              borderBottom: activeTab === 'software' ? '2px solid #0284c7' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Layers size={14} />
            <span>Software & SAM</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('undertaking')}
            style={{
              padding: '0.7rem 1rem',
              border: 'none',
              background: 'none',
              fontSize: '0.82rem',
              fontWeight: activeTab === 'undertaking' ? 700 : 500,
              color: activeTab === 'undertaking' ? '#0284c7' : 'var(--text-muted)',
              borderBottom: activeTab === 'undertaking' ? '2px solid #0284c7' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <FileText size={14} />
            <span>Handover Sheet</span>
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div
          className="modal-body"
          style={{
            padding: '1.25rem 1.5rem',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Personnel Bio Card */}
              <div
                style={{
                  backgroundColor: 'var(--bg-surface-raised, #f8fafc)',
                  border: '1px solid var(--border-default, #e2e8f0)',
                  borderRadius: '8px',
                  padding: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <IdCard size={16} color="#0284c7" />
                    Employee Master Information
                  </h4>
                  <span
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.6rem',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: statusBg,
                      color: statusColor,
                      border: `1px solid ${statusColor}33`,
                    }}
                  >
                    {employee.status || 'Active'}
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1rem',
                    fontSize: '0.82rem',
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 600 }}>
                      Employee Code / ID
                    </span>
                    <strong style={{ fontFamily: 'monospace', color: '#0284c7', fontSize: '0.92rem' }}>
                      {employee.employeeId || 'Not Assigned'}
                    </strong>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 600 }}>
                      Full Name
                    </span>
                    <strong style={{ color: 'var(--text-primary)' }}>{employee.name}</strong>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 600 }}>
                      Department
                    </span>
                    <strong style={{ color: 'var(--text-primary)' }}>{employee.department || 'General'}</strong>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 600 }}>
                      Designation / Role
                    </span>
                    <strong style={{ color: 'var(--text-primary)' }}>{employee.designation || 'Staff'}</strong>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 600 }}>
                      Official Email
                    </span>
                    <span style={{ color: 'var(--text-primary)' }}>{employee.email || '—'}</span>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 600 }}>
                      Mobile / Phone
                    </span>
                    <span style={{ color: 'var(--text-primary)' }}>{employee.phone || '—'}</span>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 600 }}>
                      Plant Location
                    </span>
                    <span style={{ color: 'var(--text-primary)' }}>{employee.location || 'Vitromed'}</span>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 600 }}>
                      Reporting Manager
                    </span>
                    <span style={{ color: 'var(--text-primary)' }}>{employee.reportingManager || employee.manager || 'IT Head'}</span>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 600 }}>
                      Joining Date
                    </span>
                    <span style={{ color: 'var(--text-primary)' }}>
                      {employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString('en-GB') : '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Hardware Summary Metrics */}
              <div>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                  Hardware & Custody Summary
                </h4>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                    gap: '0.75rem',
                  }}
                >
                  <div
                    style={{
                      padding: '0.85rem 1rem',
                      backgroundColor: 'rgba(2, 132, 199, 0.08)',
                      border: '1px solid rgba(2, 132, 199, 0.25)',
                      borderRadius: '8px',
                    }}
                  >
                    <div style={{ fontSize: '0.7rem', color: '#0284c7', fontWeight: 700, textTransform: 'uppercase' }}>
                      Primary Workstations
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0284c7', marginTop: '2px' }}>
                      {currentAssets.filter((a) => ['Laptop', 'Desktop', 'Workstation', 'All in One Desktop'].includes(a.deviceType)).length}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '0.85rem 1rem',
                      backgroundColor: 'rgba(129, 140, 248, 0.08)',
                      border: '1px solid rgba(129, 140, 248, 0.25)',
                      borderRadius: '8px',
                    }}
                  >
                    <div style={{ fontSize: '0.7rem', color: '#818cf8', fontWeight: 700, textTransform: 'uppercase' }}>
                      Monitors / Displays
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#818cf8', marginTop: '2px' }}>
                      {currentAssets.filter((a) => a.deviceType === 'Monitor' || Boolean(a.monitorDetails)).length}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '0.85rem 1rem',
                      backgroundColor: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      borderRadius: '8px',
                    }}
                  >
                    <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 700, textTransform: 'uppercase' }}>
                      Bundled Accessories
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#059669', marginTop: '2px' }}>
                      {currentAssets.reduce((acc, a) => acc + (a.accessories ? a.accessories.split(',').length : 0), 0)}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '0.85rem 1rem',
                      backgroundColor: 'rgba(245, 158, 11, 0.08)',
                      border: '1px solid rgba(245, 158, 11, 0.25)',
                      borderRadius: '8px',
                    }}
                  >
                    <div style={{ fontSize: '0.7rem', color: '#d97706', fontWeight: 700, textTransform: 'uppercase' }}>
                      Total Inventory Tagged
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#d97706', marginTop: '2px' }}>
                      {currentAssets.length}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CURRENT ASSETS & WORKSTATION BUNDLE */}
          {activeTab === 'assets' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Active Hardware Held by {employee.name}
                  </h4>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                    Corporate laptops, desktops, and peripherals checked out under this custodian.
                  </p>
                </div>

                {employee.status !== 'Resigned' && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onAddNewAssign) onAddNewAssign();
                      else setShowAllocationModal(true);
                    }}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}
                  >
                    <Plus size={14} />
                    <span>+ Allocate Another Device</span>
                  </button>
                )}
              </div>

              {currentAssets.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '3rem 1.5rem',
                    backgroundColor: 'var(--bg-surface-raised, #f8fafc)',
                    borderRadius: '8px',
                    border: '1px dashed var(--border-default)',
                  }}
                >
                  <Laptop size={38} color="var(--text-faint)" style={{ margin: '0 auto 0.75rem' }} />
                  <h4 style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.35rem' }}>
                    No Hardware Assets Currently Issued
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 1rem' }}>
                    {employee.name} does not have any corporate computers or equipment allocated.
                  </p>
                  {employee.status !== 'Resigned' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (onAddNewAssign) onAddNewAssign();
                        else setShowAllocationModal(true);
                      }}
                      className="btn btn-primary btn-sm"
                    >
                      <Plus size={14} />
                      + Allocate Hardware Device
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {currentAssets.map((asset, idx) => {
                    const peripherals = parsePeripherals(asset);
                    const devCat = (asset.deviceCategory || asset.category || '').toLowerCase();
                    const devType = (asset.deviceType || '').toLowerCase();
                    const isPower = devCat === 'power' || devType.includes('ups') || devType.includes('inverter') || devType.includes('power') || devType.includes('battery');
                    const isNetwork = devCat === 'network' || devType.includes('switch') || devType.includes('router') || devType.includes('firewall') || devType.includes('access point');
                    const isPrinter = devCat === 'printer' || devCat === 'printers' || devType.includes('printer') || devType.includes('scanner');
                    const isMonitor = devCat === 'display' || devCat === 'displays' || devType.includes('monitor') || devType.includes('display');
                    const isLaptop = devType.includes('laptop');
                    const isDesktop = devType.includes('desktop');
                    const Icon = isPower ? Zap : isNetwork ? Network : isPrinter ? Printer : isMonitor ? Monitor : isLaptop ? Laptop : isDesktop ? Monitor : Layers;

                    return (
                      <div
                        key={asset._id || idx}
                        style={{
                          backgroundColor: 'var(--bg-surface, #ffffff)',
                          border: '1px solid var(--border-default, #cbd5e1)',
                          borderRadius: '8px',
                          padding: '1.1rem 1.25rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.75rem',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                        }}
                      >
                        {/* Top Tag Strip */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                padding: '0.2rem 0.6rem',
                                borderRadius: '4px',
                                backgroundColor: isPower ? 'rgba(239, 68, 68, 0.12)' : isNetwork ? 'rgba(16, 185, 129, 0.12)' : 'rgba(2, 132, 199, 0.12)',
                                color: isPower ? '#dc2626' : isNetwork ? '#059669' : 'var(--color-primary, #0284c7)',
                                border: isPower ? '1px solid rgba(239, 68, 68, 0.25)' : isNetwork ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(2, 132, 199, 0.25)',
                              }}
                            >
                              <Icon size={13} />
                              <span>{asset.deviceType || (isPower ? 'UPS / Power Unit' : 'Hardware')}</span>
                            </span>

                            <span
                              style={{
                                fontFamily: 'monospace',
                                fontWeight: 800,
                                fontSize: '0.8rem',
                                color: 'var(--text-primary)',
                                backgroundColor: 'var(--bg-surface-raised, #f1f5f9)',
                                padding: '0.2rem 0.55rem',
                                borderRadius: '4px',
                                border: '1px solid var(--border-subtle, #e2e8f0)',
                              }}
                            >
                              Tag: #{asset.assetNo || 'N/A'}
                            </span>

                            <span
                              style={{
                                fontFamily: 'monospace',
                                fontSize: '0.76rem',
                                fontWeight: 600,
                                color: 'var(--text-muted)',
                              }}
                            >
                              S/N: <strong>{asset.sr}</strong>
                            </span>
                          </div>

                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              backgroundColor: 'rgba(16, 185, 129, 0.12)',
                              color: '#059669',
                              border: '1px solid rgba(16, 185, 129, 0.25)',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '4px',
                            }}
                          >
                            ● Active Custody
                          </span>
                        </div>

                        {/* Make / Model & Specs */}
                        <div>
                          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                            {asset.make} {asset.model}
                          </div>
                          <div
                            style={{
                              fontSize: '0.76rem',
                              color: 'var(--text-muted)',
                              marginTop: '0.25rem',
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '0.75rem',
                            }}
                          >
                            {isPower ? (
                              <>
                                {(asset.specifications?.upsCapacity || (asset.processor && !asset.processor.toLowerCase().includes('intel') && !asset.processor.toLowerCase().includes('amd') && !asset.processor.toLowerCase().includes('core'))) && (
                                  <span>
                                    <strong>Capacity:</strong> {asset.specifications?.upsCapacity || asset.processor}
                                  </span>
                                )}
                                {(asset.specifications?.batteryConfig || (asset.storage && !asset.storage.toLowerCase().includes('ssd') && !asset.storage.toLowerCase().includes('hdd'))) && (
                                  <span>
                                    <strong>Battery Config:</strong> {asset.specifications?.batteryConfig || asset.storage}
                                  </span>
                                )}
                                {asset.specifications?.backupRuntime && (
                                  <span>
                                    <strong>Runtime:</strong> {asset.specifications.backupRuntime}
                                  </span>
                                )}
                                {asset.specifications?.pduOutlets && (
                                  <span>
                                    <strong>Outlets:</strong> {asset.specifications.pduOutlets}
                                  </span>
                                )}
                              </>
                            ) : isNetwork ? (
                              <>
                                {(asset.specifications?.portCount || asset.portCount) && (
                                  <span>
                                    <strong>Ports:</strong> {asset.specifications?.portCount || asset.portCount}
                                  </span>
                                )}
                                {asset.specifications?.networkRole && (
                                  <span>
                                    <strong>Role:</strong> {asset.specifications.networkRole}
                                  </span>
                                )}
                                {asset.specifications?.poeSupport && (
                                  <span>
                                    <strong>PoE:</strong> {asset.specifications.poeSupport}
                                  </span>
                                )}
                                {asset.hostName && (
                                  <span style={{ fontFamily: 'monospace' }}>
                                    <strong>Host:</strong> {asset.hostName}
                                  </span>
                                )}
                                {asset.ipAddress && (
                                  <span style={{ fontFamily: 'monospace', color: '#059669' }}>
                                    <strong>IP:</strong> {asset.ipAddress}
                                  </span>
                                )}
                              </>
                            ) : isPrinter ? (
                              <>
                                {(asset.specifications?.printTechnology || (asset.processor && !asset.processor.toLowerCase().includes('intel') && !asset.processor.toLowerCase().includes('amd'))) && (
                                  <span>
                                    <strong>Technology:</strong> {asset.specifications?.printTechnology || asset.processor}
                                  </span>
                                )}
                                {asset.specifications?.tonerCartridgeModel && (
                                  <span>
                                    <strong>Toner/Cartridge:</strong> {asset.specifications.tonerCartridgeModel}
                                  </span>
                                )}
                                {asset.hostName && (
                                  <span style={{ fontFamily: 'monospace' }}>
                                    <strong>Host:</strong> {asset.hostName}
                                  </span>
                                )}
                                {asset.ipAddress && (
                                  <span style={{ fontFamily: 'monospace', color: '#059669' }}>
                                    <strong>IP:</strong> {asset.ipAddress}
                                  </span>
                                )}
                              </>
                            ) : isMonitor ? (
                              <>
                                {(asset.specifications?.screenSize || asset.monitorDetails) && (
                                  <span>
                                    <strong>Screen Size:</strong> {asset.specifications?.screenSize || asset.monitorDetails}
                                  </span>
                                )}
                                {asset.specifications?.resolution && (
                                  <span>
                                    <strong>Resolution:</strong> {asset.specifications.resolution}
                                  </span>
                                )}
                                {asset.specifications?.panelType && (
                                  <span>
                                    <strong>Panel:</strong> {asset.specifications.panelType}
                                  </span>
                                )}
                              </>
                            ) : (
                              <>
                                {asset.processor && (
                                  <span>
                                    <strong>CPU:</strong> {asset.processor}
                                  </span>
                                )}
                                {asset.ramSize && (
                                  <span>
                                    <strong>RAM:</strong> {asset.ramSize}
                                  </span>
                                )}
                                {asset.storage && (
                                  <span>
                                    <strong>Storage:</strong> {asset.storage}
                                  </span>
                                )}
                                {asset.osVersion && (
                                  <span>
                                    <strong>OS:</strong> {asset.osVersion}
                                  </span>
                                )}
                                {asset.hostName && (
                                  <span style={{ fontFamily: 'monospace' }}>
                                    <strong>Host:</strong> {asset.hostName}
                                  </span>
                                )}
                                {asset.ipAddress && (
                                  <span style={{ fontFamily: 'monospace', color: '#059669' }}>
                                    <strong>IP:</strong> {asset.ipAddress}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        {/* Peripherals & Accessories */}
                        {peripherals.length > 0 && (
                          <div
                            style={{
                              backgroundColor: 'var(--bg-surface-raised, #f8fafc)',
                              padding: '0.5rem 0.75rem',
                              borderRadius: '6px',
                              border: '1px solid var(--border-subtle, #e2e8f0)',
                            }}
                          >
                            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                              Allocated Peripherals & Workstation Bundle:
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                              {peripherals.map((p, pIdx) => {
                                const PIcon = p.icon;
                                return (
                                  <span
                                    key={pIdx}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.35rem',
                                      fontSize: '0.72rem',
                                      fontWeight: 600,
                                      backgroundColor: 'rgba(2, 132, 199, 0.08)',
                                      color: '#0284c7',
                                      border: '1px solid rgba(2, 132, 199, 0.2)',
                                      padding: '0.18rem 0.5rem',
                                      borderRadius: '4px',
                                    }}
                                  >
                                    <PIcon size={12} color={p.color} />
                                    <span>{p.name}</span>
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Footer with Inline Action Controls */}
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderTop: '1px solid var(--border-subtle, #e2e8f0)',
                            paddingTop: '0.65rem',
                            flexWrap: 'wrap',
                            gap: '0.5rem',
                          }}
                        >
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>
                            {asset.assignedDate ? (
                              <span>
                                Issued on: <strong style={{ color: 'var(--text-secondary)' }}>{new Date(asset.assignedDate).toLocaleDateString('en-GB')}</strong>
                              </span>
                            ) : (
                              <span>Issued without specific timestamp</span>
                            )}
                            {asset.remarks && (
                              <span style={{ marginLeft: '0.5rem', fontStyle: 'italic' }}>
                                • "{asset.remarks}"
                              </span>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            {onViewAsset && (
                              <button
                                type="button"
                                onClick={() => onViewAsset(asset)}
                                className="btn btn-primary btn-xs"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}
                                title="View full 38-column specifications sheet and print handover document"
                              >
                                <Eye size={12} />
                                <span>View Spec Sheet</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => setTransferringAsset(asset)}
                              className="btn btn-outline btn-xs"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}
                              title="Transfer this machine to another user"
                            >
                              <ArrowRightLeft size={12} />
                              <span>Transfer to User</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setReturningAsset(asset)}
                              className="btn btn-ghost btn-xs"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#f87171', fontWeight: 600 }}
                              title="Return asset back into available inventory"
                            >
                              <Undo2 size={12} />
                              <span>Return to Stock</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: IMMUTABLE CUSTODY TIMELINE & AUDIT HISTORY */}
          {activeTab === 'history' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Asset Custody Timeline & Lifecycle Log
                  </h4>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                    Chronological audit trail of all assets assigned, returned, transferred, or serviced for {employee.name}.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadEmployeeHistory}
                  className="btn btn-ghost btn-xs"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <RefreshCw size={12} className={loadingHistory ? 'spin' : ''} />
                  <span>Refresh</span>
                </button>
              </div>

              {loadingHistory ? (
                <div style={{ textAlign: 'center', padding: '2.5rem' }}>
                  <RefreshCw size={24} className="spin" color="#0284c7" style={{ margin: '0 auto 0.5rem' }} />
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Loading timeline records...</p>
                </div>
              ) : historyEvents.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '3rem 1.5rem',
                    backgroundColor: 'var(--bg-surface-raised, #f8fafc)',
                    borderRadius: '8px',
                    border: '1px dashed var(--border-default)',
                  }}
                >
                  <Clock size={36} color="var(--text-faint)" style={{ margin: '0 auto 0.75rem' }} />
                  <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.35rem' }}>
                    No Custody History Recorded
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                    Future allocations, returns, and transfers will be logged here chronologically.
                  </p>
                </div>
              ) : (
                <div style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid var(--border-default)', marginLeft: '0.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {historyEvents.map((evt, idx) => {
                    const actionType = evt.action || evt.status || 'Allocated';
                    const isAssign = actionType.toLowerCase().includes('assign') || actionType.toLowerCase().includes('inward');
                    const isReturn = actionType.toLowerCase().includes('return');
                    const isTransfer = actionType.toLowerCase().includes('transfer');
                    const isMaintenance = actionType.toLowerCase().includes('maintenance') || actionType.toLowerCase().includes('repair');

                    const dotColor = isAssign ? '#10b981' : isReturn ? '#f87171' : isTransfer ? '#38bdf8' : '#fbbf24';

                    return (
                      <div key={idx} style={{ position: 'relative' }}>
                        {/* Timeline Pin */}
                        <div
                          style={{
                            position: 'absolute',
                            left: '-1.85rem',
                            top: '4px',
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: dotColor,
                            border: '2px solid #ffffff',
                            boxShadow: `0 0 0 2px ${dotColor}`,
                          }}
                        />

                        <div
                          style={{
                            backgroundColor: 'var(--bg-surface, #ffffff)',
                            border: '1px solid var(--border-default, #e2e8f0)',
                            borderRadius: '6px',
                            padding: '0.85rem 1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.35rem',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  padding: '0.15rem 0.5rem',
                                  borderRadius: '4px',
                                  backgroundColor: `${dotColor}18`,
                                  color: dotColor,
                                  border: `1px solid ${dotColor}44`,
                                  textTransform: 'uppercase',
                                }}
                              >
                                {actionType}
                              </span>

                              {evt.assetNo && (
                                <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.8rem', color: '#0284c7' }}>
                                  #{evt.assetNo}
                                </span>
                              )}

                              {evt.sr && (
                                <span style={{ fontFamily: 'monospace', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                                  ({evt.sr})
                                </span>
                              )}
                            </div>

                            <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>
                              {evt.date ? new Date(evt.date).toLocaleString('en-GB') : evt.timestamp ? new Date(evt.timestamp).toLocaleString('en-GB') : 'Recorded Event'}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                            {evt.description || evt.details || `${actionType} event for hardware asset`}
                          </div>

                          {evt.remarks && (
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                              "{evt.remarks}"
                            </div>
                          )}

                          <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)', marginTop: '2px' }}>
                            Logged by: <strong>{evt.actor || evt.actorName || evt.performedBy || 'IT Admin'}</strong>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SOFTWARE & SAM */}
          {activeTab === 'software' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--bg-surface-raised, #f8fafc)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-default, #e2e8f0)',
                }}
              >
                <div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    Software & Digital Entitlements
                  </h4>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                    Operating systems, productivity licenses, and enterprise access tied to {employee.name}'s hardware.
                  </p>
                </div>
              </div>

              {currentAssets.filter((a) => hasSoftwareLicensing(a.deviceType, a)).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-faint)' }}>
                  No software license keys registered on the assigned machines.
                </div>
              ) : (
                <div className="table-responsive" style={{ overflowX: 'auto' }}>
                  <table className="table" style={{ width: '100%', fontSize: '0.8rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--bg-surface-raised, #f8fafc)' }}>
                        <th>Machine Tag</th>
                        <th>Operating System</th>
                        <th>OS Key / License</th>
                        <th>Office Software</th>
                        <th>Office Key</th>
                        <th>SAP / ERP ID</th>
                        <th>Mail Software</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentAssets
                        .filter((a) => hasSoftwareLicensing(a.deviceType, a))
                        .map((a, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: 700, fontFamily: 'monospace', color: '#0284c7' }}>
                              #{a.assetNo || 'AST'}
                            </td>
                            <td style={{ fontSize: '0.8rem', fontWeight: 600 }}>{a.osVersion || '—'}</td>
                            <td style={{ fontFamily: 'monospace', fontSize: '0.74rem' }}>
                              {a.windowsKey ? '••••-••••-••••' : (a.windowsType || '—')}
                            </td>
                            <td style={{ fontSize: '0.8rem' }}>{a.officeSoftware || '—'}</td>
                            <td style={{ fontFamily: 'monospace', fontSize: '0.74rem' }}>
                              {a.officeKey ? '••••-••••-••••' : '—'}
                            </td>
                            <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#8b5cf6' }}>
                              {a.sapId || '—'}
                            </td>
                            <td style={{ fontSize: '0.78rem' }}>{a.mailSoftware || '—'}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: OFFICIAL HANDOVER UNDERTAKING (A4 PRINTABLE) */}
          {activeTab === 'undertaking' && (
            <div
              style={{
                backgroundColor: '#ffffff',
                color: '#0f172a',
                padding: '2rem 2.25rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}
            >
              {/* Official Letterhead Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0f172a', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
                    Vitromed Healthcare
                  </h2>
                  <div style={{ fontSize: '0.74rem', color: '#475569', fontWeight: 600, marginTop: '2px' }}>
                    IT Infrastructure & Asset Management Division
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '1px' }}>
                    Facility: {employee.location || 'Vitromed Corporate Plant'} • Document Code: VTR/IT/REC/{employee.employeeId || 'GEN'}/{new Date().getFullYear()}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase' }}>
                    Hardware Handover Undertaking
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '2px' }}>
                    Date: <strong>{new Date().toLocaleDateString('en-GB')}</strong>
                  </div>
                </div>
              </div>

              {/* Employee Details Box */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', backgroundColor: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '1.25rem', fontSize: '0.78rem' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Employee Name</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>{employee.name}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Employee Code / ID</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0284c7', fontFamily: 'monospace' }}>{employee.employeeId || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Designation</div>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{employee.designation || 'Staff'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Department</div>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{employee.department || 'General'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Official Email</div>
                  <div style={{ color: '#0f172a' }}>{employee.email || '—'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Mobile Contact</div>
                  <div style={{ color: '#0f172a' }}>{employee.phone || '—'}</div>
                </div>
              </div>

              {/* Hardware Schedule Table */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
                  1. Schedule of Issued IT Assets & Peripherals
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                      <th style={{ padding: '6px 8px', textAlign: 'left', color: '#334155' }}>#</th>
                      <th style={{ padding: '6px 8px', textAlign: 'left', color: '#334155' }}>Asset Tag</th>
                      <th style={{ padding: '6px 8px', textAlign: 'left', color: '#334155' }}>Serial Number</th>
                      <th style={{ padding: '6px 8px', textAlign: 'left', color: '#334155' }}>Machine / Model</th>
                      <th style={{ padding: '6px 8px', textAlign: 'left', color: '#334155' }}>Type</th>
                      <th style={{ padding: '6px 8px', textAlign: 'left', color: '#334155' }}>Accessories & Peripherals</th>
                      <th style={{ padding: '6px 8px', textAlign: 'left', color: '#334155' }}>Condition</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentAssets.map((a, aIdx) => (
                      <tr key={aIdx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '6px 8px', color: '#64748b' }}>{aIdx + 1}</td>
                        <td style={{ padding: '6px 8px', fontWeight: 800, fontFamily: 'monospace', color: '#0284c7' }}>#{a.assetNo || 'AST'}</td>
                        <td style={{ padding: '6px 8px', fontFamily: 'monospace', color: '#334155' }}>{a.sr || 'N/A'}</td>
                        <td style={{ padding: '6px 8px', fontWeight: 600, color: '#0f172a' }}>{a.make} {a.model}</td>
                        <td style={{ padding: '6px 8px', color: '#475569' }}>{a.deviceType || 'Hardware'}</td>
                        <td style={{ padding: '6px 8px', color: '#475569' }}>{a.accessories || a.monitorDetails || 'Standard peripherals bundle'}</td>
                        <td style={{ padding: '6px 8px', color: '#059669', fontWeight: 600 }}>{a.condition || 'Good / Working'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Terms & Custodian Policy */}
              <div style={{ backgroundColor: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '1.75rem', fontSize: '0.72rem', color: '#334155', lineHeight: 1.5 }}>
                <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '4px', textTransform: 'uppercase' }}>
                  2. Custodian Declaration & Policy Terms
                </div>
                <p style={{ margin: '0 0 4px' }}>
                  1. I acknowledge receipt of the IT equipment and bundled accessories listed above in good working condition.
                </p>
                <p style={{ margin: '0 0 4px' }}>
                  2. I undertake to utilize this equipment strictly for official company work and adhere to IT security policies.
                </p>
                <p style={{ margin: '0 0 4px' }}>
                  3. I understand that I am responsible for the physical care and reasonable custody of these assets, and will immediately report any loss, damage, or malfunction to the IT department.
                </p>
                <p style={{ margin: 0 }}>
                  4. I agree to return all listed hardware and peripherals in good condition upon reassignment, project conclusion, or separation from employment.
                </p>
              </div>

              {/* Signatures */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #cbd5e1' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ height: '40px', borderBottom: '1px dashed #94a3b8', marginBottom: '6px' }} />
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0f172a' }}>{employee.name}</div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Employee / Custodian Signature</div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ height: '40px', borderBottom: '1px dashed #94a3b8', marginBottom: '6px' }} />
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0f172a' }}>IT Infrastructure Engineer</div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Issued & Verified By</div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ height: '40px', borderBottom: '1px dashed #94a3b8', marginBottom: '6px' }} />
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0f172a' }}>IT Admin / Manager</div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Authorized Approval & Stamp</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className="modal-footer"
          style={{
            padding: '0.85rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--bg-surface-raised, #f8fafc)',
            borderTop: '1px solid var(--border-default)',
          }}
        >
          {onAddNewAssign && employee.status !== 'Resigned' ? (
            <button
              type="button"
              onClick={onAddNewAssign}
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
            >
              <Plus size={14} />
              <span>+ Assign Another Asset to {employee.name}</span>
            </button>
          ) : (
            <div />
          )}

          <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
            Close Profile
          </button>
        </div>
      </div>

      {/* SUB-MODAL 1: TRANSFER ASSET */}
      {transferringAsset && (
        <div
          className="modal-overlay"
          style={{ zIndex: 60 }}
          onClick={() => setTransferringAsset(null)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '500px', width: '95vw' }}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ArrowRightLeft size={18} color="#0284c7" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
                  Transfer Hardware Asset
                </h3>
              </div>
              <button type="button" onClick={() => setTransferringAsset(null)} className="btn btn-ghost btn-icon btn-xs">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleConfirmTransfer}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ backgroundColor: 'rgba(2, 132, 199, 0.08)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem' }}>
                  <div>Asset: <strong>{transferringAsset.make} {transferringAsset.model}</strong> (#{transferringAsset.assetNo || transferringAsset.sr})</div>
                  <div>Current Custodian: <strong>{employee.name}</strong></div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Transfer To Recipient Employee <span style={{ color: '#f87171' }}>*</span>
                  </label>
                  <select
                    required
                    value={targetEmployeeId}
                    onChange={(e) => setTargetEmployeeId(e.target.value)}
                    className="form-select"
                  >
                    <option value="">Select Recipient Employee...</option>
                    {allEmployees
                      .filter((e) => (e._id || e.employeeId) !== (employee._id || employee.employeeId))
                      .map((emp) => (
                        <option key={emp._id || emp.employeeId} value={emp._id || emp.employeeId}>
                          {emp.name} ({emp.employeeId || 'No ID'}) • {emp.department} • {emp.location || 'Vitromed'}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Transfer Remarks</label>
                  <input
                    type="text"
                    placeholder="e.g. Departmental reassignment"
                    value={transferRemarks}
                    onChange={(e) => setTransferRemarks(e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setTransferringAsset(null)} className="btn btn-secondary btn-sm" disabled={transferLoading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={transferLoading || !targetEmployeeId}>
                  {transferLoading ? 'Transferring...' : 'Confirm Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-MODAL 2: RETURN ASSET */}
      {returningAsset && (
        <div
          className="modal-overlay"
          style={{ zIndex: 60 }}
          onClick={() => setReturningAsset(null)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '480px', width: '95vw' }}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Undo2 size={18} color="#f87171" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
                  Return Asset to Inventory Stock
                </h3>
              </div>
              <button type="button" onClick={() => setReturningAsset(null)} className="btn btn-ghost btn-icon btn-xs">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleConfirmReturn}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem' }}>
                  <div>Asset: <strong>{returningAsset.make} {returningAsset.model}</strong> (#{returningAsset.assetNo || returningAsset.sr})</div>
                  <div>Returning From: <strong>{employee.name}</strong></div>
                </div>

                <div className="form-group">
                  <label className="form-label">Return Hardware Condition</label>
                  <select
                    value={returnCondition}
                    onChange={(e) => setReturnCondition(e.target.value)}
                    className="form-select"
                  >
                    <option value="Good">Good / Working (Ready for re-assignment)</option>
                    <option value="Needs Maintenance">Needs Maintenance / Servicing</option>
                    <option value="Damaged">Damaged / Defective</option>
                    <option value="Scrapped">Scrap / Disposed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Return Remarks</label>
                  <input
                    type="text"
                    placeholder="e.g. Standard return upon project completion"
                    value={returnRemarks}
                    onChange={(e) => setReturnRemarks(e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setReturningAsset(null)} className="btn btn-secondary btn-sm" disabled={returnLoading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-danger btn-sm" disabled={returnLoading}>
                  {returnLoading ? 'Returning...' : 'Confirm Return to Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-MODAL 3: EMPLOYEE OFFBOARDING CLEARANCE */}
      {showOffboardModal && (
        <div
          className="modal-overlay"
          style={{ zIndex: 60 }}
          onClick={() => setShowOffboardModal(false)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '540px', width: '95vw' }}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserX size={18} color="#ef4444" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#ef4444' }}>
                  Employee Exit & Asset Recovery Clearance
                </h3>
              </div>
              <button type="button" onClick={() => setShowOffboardModal(false)} className="btn btn-ghost btn-icon btn-xs">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleConfirmOffboarding}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    padding: '0.85rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    lineHeight: 1.5,
                  }}
                >
                  <div style={{ fontWeight: 700, color: '#ef4444', marginBottom: '4px' }}>
                    Automated IT Clearance for {employee.name}:
                  </div>
                  <div>
                    Processing this exit clearance will mark the employee status as <strong>Resigned</strong> and automatically return all <strong>{currentAssets.length} active hardware asset(s)</strong> back to Available central stock with audit logs.
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Separation Type</label>
                    <select
                      value={exitReason}
                      onChange={(e) => setExitReason(e.target.value)}
                      className="form-select"
                    >
                      <option value="Resigned">Voluntary Resignation</option>
                      <option value="Contract Ended">Contract Completed</option>
                      <option value="Terminated">Employment Terminated</option>
                      <option value="Transferred">Transferred to External Branch</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Exit Clearance Date</label>
                    <input
                      type="date"
                      required
                      value={exitDate}
                      onChange={(e) => setExitDate(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Asset Recovery Checklist ({currentAssets.length} Devices)</label>
                  <div
                    style={{
                      maxHeight: '140px',
                      overflowY: 'auto',
                      backgroundColor: 'var(--bg-surface-raised, #f8fafc)',
                      border: '1px solid var(--border-default)',
                      borderRadius: '6px',
                      padding: '0.5rem 0.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem',
                    }}
                  >
                    {currentAssets.map((a, i) => (
                      <div key={i} style={{ fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <CheckCircle2 size={13} color="#10b981" />
                        <span>#{a.assetNo || a.sr} • {a.make} {a.model} ({a.deviceType})</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Clearance Handover Remarks</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Returned all company equipment in working condition, email account archived."
                    value={exitRemarks}
                    onChange={(e) => setExitRemarks(e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowOffboardModal(false)} className="btn btn-secondary btn-sm" disabled={offboardLoading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-danger btn-sm" disabled={offboardLoading}>
                  {offboardLoading ? 'Processing Clearance...' : 'Confirm Exit & Recover All Assets'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Asset Allocation Modal */}
      {showAllocationModal && (
        <AssetAllocationModal
          initialEmployee={employee}
          employees={allEmployees.length > 0 ? allEmployees : [employee]}
          assets={assets}
          onClose={() => setShowAllocationModal(false)}
          onSuccess={(newAssets) => {
            setShowAllocationModal(false);
            if (onSuccess) onSuccess(newAssets);
          }}
        />
      )}
    </div>
  );
}
