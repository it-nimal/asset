import React, { useState } from 'react';
import { X, UserCheck, ArrowRightLeft, Undo2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// ----------------- ASSIGN MODAL (Section 8) -----------------
export function AssignModal({ asset, employees = [], departments = [], locations = [], onClose, onSuccess }) {
  const { user } = useAuth();
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emp = employees.find((e) => e.employeeId === selectedEmpId || e._id === selectedEmpId);
    if (!emp) return alert('Please select an employee');

    setLoading(true);
    try {
      await api.assignAsset(asset._id, {
        userName: emp.name,
        empCode: emp.employeeId,
        mailId: emp.email,
        department: emp.department,
        plant: emp.location,
        expectedReturnDate,
        remarks: remarks || `Assigned to ${emp.name} by ${user?.name || 'IT Admin'}`,
        actorName: user?.name || 'IT Admin',
      });
      alert(`✅ Asset assigned to ${emp.name} successfully!`);
      onSuccess();
      onClose();
    } catch (err) {
      alert('Assignment failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div onClick={onClose} style={overlayStyle}>
      <div onClick={(e) => e.stopPropagation()} style={modalBoxStyle}>
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserCheck size={20} color="#34d399" />
            <span style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>Assign IT Asset</span>
          </div>
          <button onClick={onClose} style={closeBtnStyle}><X size={18} /></button>
        </div>

        <div style={{ padding: '0.75rem 1.5rem', backgroundColor: '#0b1329', borderBottom: '1px solid #1e293b' }}>
          <div style={{ fontWeight: 600, color: '#ffffff' }}>{asset.make} {asset.model}</div>
          <div style={{ fontSize: '0.78rem', color: '#818cf8' }}>Tag: {asset.assetNo || 'AST-N/A'} • Serial No: {asset.sr}</div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div>
            <label style={labelStyle}>Select Employee <span style={{ color: '#f87171' }}>*</span></label>
            <select
              required
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              style={inputStyle}
            >
              <option value="">-- Choose Employee --</option>
              {employees.map((emp) => (
                <option key={emp._id || emp.employeeId} value={emp.employeeId}>
                  {emp.name} ({emp.employeeId}) • {emp.department}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Expected Return Date</label>
            <input
              type="date"
              value={expectedReturnDate}
              onChange={(e) => setExpectedReturnDate(e.target.value)}
              style={{ ...inputStyle, colorScheme: 'dark' }}
            />
          </div>

          <div>
            <label style={labelStyle}>Handover Notes & Remarks</label>
            <textarea
              rows={3}
              placeholder="e.g. Handed over with charger, laptop bag, and power adapter in perfect working condition."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} style={cancelBtnStyle}>Cancel</button>
            <button type="submit" disabled={loading} style={submitBtnStyle}>
              {loading ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ----------------- TRANSFER MODAL (Section 10) -----------------
export function TransferModal({ asset, employees = [], departments = [], locations = [], onClose, onSuccess }) {
  const { user } = useAuth();
  const [newEmpId, setNewEmpId] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTransfer = async (e) => {
    e.preventDefault();
    const emp = employees.find((e) => e.employeeId === newEmpId || e._id === newEmpId);
    if (!emp) return alert('Please select new employee recipient');

    setLoading(true);
    try {
      await api.transferAsset(asset._id, {
        newUserName: emp.name,
        newEmpCode: emp.employeeId,
        newMailId: emp.email,
        newDepartment: emp.department,
        newLocation: emp.location,
        transferReason: transferReason || 'Departmental reorganization',
        actorName: user?.name || 'IT Admin',
      });
      alert(`✅ Asset transferred to ${emp.name} successfully!`);
      onSuccess();
      onClose();
    } catch (err) {
      alert('Transfer failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div onClick={onClose} style={overlayStyle}>
      <div onClick={(e) => e.stopPropagation()} style={modalBoxStyle}>
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowRightLeft size={20} color="#38bdf8" />
            <span style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>Transfer Asset Ownership</span>
          </div>
          <button onClick={onClose} style={closeBtnStyle}><X size={18} /></button>
        </div>

        <div style={{ padding: '0.75rem 1.5rem', backgroundColor: '#0b1329', borderBottom: '1px solid #1e293b' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Current Custodian:</div>
          <div style={{ fontWeight: 600, color: '#f8fafc' }}>{asset.userName} ({asset.department} • {asset.plant})</div>
        </div>

        <form onSubmit={handleTransfer} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div>
            <label style={labelStyle}>Transfer To (New Employee) <span style={{ color: '#f87171' }}>*</span></label>
            <select
              required
              value={newEmpId}
              onChange={(e) => setNewEmpId(e.target.value)}
              style={inputStyle}
            >
              <option value="">-- Choose Target Employee --</option>
              {employees
                .filter((emp) => emp.name !== asset.userName)
                .map((emp) => (
                  <option key={emp._id || emp.employeeId} value={emp.employeeId}>
                    {emp.name} ({emp.employeeId}) • {emp.department}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Reason for Transfer <span style={{ color: '#f87171' }}>*</span></label>
            <input
              type="text"
              required
              placeholder="e.g. Employee role change / project re-allocation"
              value={transferReason}
              onChange={(e) => setTransferReason(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} style={cancelBtnStyle}>Cancel</button>
            <button type="submit" disabled={loading} style={{ ...submitBtnStyle, backgroundColor: '#0284c7' }}>
              {loading ? 'Transferring...' : 'Execute Transfer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ----------------- RETURN MODAL (Section 9) -----------------
export function ReturnModal({ asset, onClose, onSuccess }) {
  const { user } = useAuth();
  const [returnCondition, setReturnCondition] = useState('Good');
  const [damageDetails, setDamageDetails] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReturn = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.returnAsset(asset._id, {
        returnCondition,
        damageDetails,
        notes,
        actorName: user?.name || 'IT Admin',
      });
      alert(`✅ Asset returned to stock in "${returnCondition}" condition.`);
      onSuccess();
      onClose();
    } catch (err) {
      alert('Return failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div onClick={onClose} style={overlayStyle}>
      <div onClick={(e) => e.stopPropagation()} style={modalBoxStyle}>
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Undo2 size={20} color="#fbbf24" />
            <span style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>Return Asset to Stock</span>
          </div>
          <button onClick={onClose} style={closeBtnStyle}><X size={18} /></button>
        </div>

        <div style={{ padding: '0.75rem 1.5rem', backgroundColor: '#0b1329', borderBottom: '1px solid #1e293b' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Returning from:</div>
          <div style={{ fontWeight: 600, color: '#f8fafc' }}>{asset.userName} ({asset.empCode || 'N/A'})</div>
        </div>

        <form onSubmit={handleReturn} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div>
            <label style={labelStyle}>Inspected Return Condition <span style={{ color: '#f87171' }}>*</span></label>
            <select
              value={returnCondition}
              onChange={(e) => setReturnCondition(e.target.value)}
              style={inputStyle}
            >
              <option value="New">New / Unused</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good (Working fine)</option>
              <option value="Fair">Fair (Normal cosmetic wear)</option>
              <option value="Damaged">Damaged (Needs repair)</option>
            </select>
          </div>

          {returnCondition === 'Damaged' && (
            <div>
              <label style={labelStyle}>Damage Information <span style={{ color: '#f87171' }}>*</span></label>
              <input
                type="text"
                required
                placeholder="e.g. Cracked hinge / missing charger pin"
                value={damageDetails}
                onChange={(e) => setDamageDetails(e.target.value)}
                style={inputStyle}
              />
            </div>
          )}

          <div>
            <label style={labelStyle}>Return Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. Device returned upon project closure, cleaned and ready for reassignment."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} style={cancelBtnStyle}>Cancel</button>
            <button type="submit" disabled={loading} style={{ ...submitBtnStyle, backgroundColor: '#d97706' }}>
              {loading ? 'Processing...' : 'Complete Return'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.8)',
  backdropFilter: 'blur(5px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1.5rem',
  zIndex: 999,
};

const modalBoxStyle = {
  backgroundColor: '#131d36',
  border: '1px solid #334155',
  borderRadius: '14px',
  width: '100%',
  maxWidth: '520px',
  overflow: 'hidden',
  boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
};

const headerStyle = {
  padding: '1.25rem 1.5rem',
  borderBottom: '1px solid #1e293b',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const closeBtnStyle = {
  background: 'none',
  border: 'none',
  color: '#94a3b8',
  cursor: 'pointer',
};

const labelStyle = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: '#cbd5e1',
  marginBottom: '0.35rem',
};

const inputStyle = {
  width: '100%',
  padding: '0.6rem 0.85rem',
  backgroundColor: '#070d1e',
  border: '1px solid #334155',
  borderRadius: '8px',
  color: '#f8fafc',
  fontSize: '0.85rem',
  outline: 'none',
};

const cancelBtnStyle = {
  padding: '0.55rem 1rem',
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  color: '#cbd5e1',
  borderRadius: '8px',
  fontSize: '0.82rem',
  fontWeight: 600,
  cursor: 'pointer',
};

const submitBtnStyle = {
  padding: '0.55rem 1.25rem',
  backgroundColor: '#4f46e5',
  border: 'none',
  color: '#ffffff',
  borderRadius: '8px',
  fontSize: '0.82rem',
  fontWeight: 700,
  cursor: 'pointer',
};