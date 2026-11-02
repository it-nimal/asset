import React, { useState, useEffect } from 'react';
import {
  Laptop,
  Monitor,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  KeyRound,
  FileText,
  User,
  Building2,
  Mail,
  MapPin,
  Calendar,
  X,
  Send,
  Boxes,
  ArrowRightLeft,
  Activity,
  Lock,
  Globe,
  RefreshCw,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../common/Toast';
import { useAuth } from '../../context/AuthContext';
import { formatDateTimeIST } from '../../utils/date';

export default function UserDashboard({ onNavigate, onRefresh }) {
  const { user } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [myAssets, setMyAssets] = useState([]);
  const [pendingTransfers, setPendingTransfers] = useState([]);
  const [activityStats, setActivityStats] = useState(null);
  const [acknowledgingTransferId, setAcknowledgingTransferId] = useState(null);

  // Modals
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const [selectedAssetForIssue, setSelectedAssetForIssue] = useState(null);
  const [issueDescription, setIssueDescription] = useState('');
  const [issueCategory, setIssueCategory] = useState('Hardware Performance');
  const [submittingIssue, setSubmittingIssue] = useState(false);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const userEmail = (user?.email || '').trim().toLowerCase();
      const userName = (user?.name || '').trim().toLowerCase();

      const [allAssetsRes, transfersRes, statsRes] = await Promise.allSettled([
        api.getAssets(),
        api.getTransfers({ status: 'Acknowledgement Pending' }),
        user?.id ? api.getUserActivity(user.id) : Promise.resolve(null),
      ]);

      if (allAssetsRes.status === 'fulfilled') {
        const assetsList = allAssetsRes.value?.data || allAssetsRes.value || [];
        const filtered = assetsList.filter((a) => {
          const aMail = (a.mailId || '').trim().toLowerCase();
          const aUser = (a.userName || '').trim().toLowerCase();
          return (userEmail && aMail === userEmail) || (userName && aUser === userName);
        });
        setMyAssets(filtered);
      }

      if (transfersRes.status === 'fulfilled') {
        const transfersList = transfersRes.value?.data || transfersRes.value || [];
        const matching = transfersList.filter((t) => {
          const toMail = (t.toEmail || '').trim().toLowerCase();
          const toName = (t.toEmployeeName || '').trim().toLowerCase();
          return (userEmail && toMail === userEmail) || (userName && toName === userName);
        });
        setPendingTransfers(matching);
      }

      if (statsRes.status === 'fulfilled' && statsRes.value?.data) {
        setActivityStats(statsRes.value.data);
      }
    } catch (err) {
      console.warn('Could not load user workspace:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [user]);

  const handleAcknowledgeTransfer = async (transfer) => {
    const tId = transfer.transferId || transfer._id;
    setAcknowledgingTransferId(tId);
    try {
      await api.acknowledgeTransfer(tId, {
        actorName: user?.name || 'Employee',
        notes: `Transfer acknowledged by ${user?.name || 'Employee'} on ${new Date().toLocaleDateString('en-GB')}`,
      });
      toast.success(`Asset ${transfer.assetTag || transfer.assetSerial} custody confirmed!`, 'Transfer Acknowledged');
      loadUserData();
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error('Failed to acknowledge transfer: ' + err.message);
    } finally {
      setAcknowledgingTransferId(null);
    }
  };

  const handleAcknowledgeAsset = async (asset) => {
    try {
      await api.acknowledgeAssetReceipt(asset._id, {
        notes: `Receipt confirmed by ${user?.name || 'Employee'} on ${new Date().toLocaleDateString('en-GB')}`,
        actorName: user?.name || 'Employee',
      });
      toast.success(`Asset ${asset.assetNo} receipt confirmed!`, 'Receipt Confirmed');
      loadUserData();
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error('Failed to confirm receipt: ' + err.message);
    }
  };

  const handleSubmitIssue = async (e) => {
    e.preventDefault();
    if (!selectedAssetForIssue || !issueDescription.trim()) return;

    setSubmittingIssue(true);
    try {
      await api.reportAssetIssue(selectedAssetForIssue._id, {
        issueDescription: issueDescription.trim(),
        issueCategory,
        priority: 'Medium',
        employeeName: user?.name || selectedAssetForIssue.userName || 'Employee',
        reportedBy: user?.name || 'Employee',
      });

      toast.success('Support ticket submitted to IT Maintenance Helpdesk!', 'Ticket Created');
      setSelectedAssetForIssue(null);
      setIssueDescription('');
      loadUserData();
    } catch (err) {
      toast.error('Failed to submit ticket: ' + err.message);
    } finally {
      setSubmittingIssue(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      return toast.error('Please enter both current and new password');
    }
    if (newPassword !== confirmPassword) {
      return toast.error('New password and confirmation do not match');
    }
    if (newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters long');
    }

    setChangingPassword(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      toast.success('Your password has been changed successfully!');
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      loadUserData();
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '4rem' }}>
      {/* Header Profile Banner */}
      <div
        className="card"
        style={{
          padding: '1.75rem 2rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
          borderColor: 'rgba(56, 189, 248, 0.25)',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.65rem',
                fontWeight: 800,
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em', margin: 0 }}>
                  {user?.name || 'Staff User'}
                </h1>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '9999px',
                    background: 'rgba(56, 189, 248, 0.15)',
                    color: '#38bdf8',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                  }}
                >
                  Standard User Profile
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: '0.4rem', color: '#94a3b8', fontSize: '0.82rem', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Mail size={14} color="#38bdf8" />
                  {user?.email || 'user@vitromed.com'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Building2 size={14} color="#38bdf8" />
                  {user?.department || 'Operations'}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setShowPasswordModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
            >
              <KeyRound size={15} />
              Change Password
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={loadUserData}
              style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              Sync Workspace
            </button>
          </div>
        </div>
      </div>

      {/* Pending Custody Acknowledgement Alert */}
      {pendingTransfers.length > 0 && (
        <div
          style={{
            marginBottom: '2rem',
            padding: '1.25rem 1.5rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(234, 88, 12, 0.1)',
            border: '1px solid rgba(234, 88, 12, 0.3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
            <AlertTriangle size={18} color="#ea580c" />
            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ea580c', margin: 0 }}>
              Action Required: Pending Custody Acknowledgements ({pendingTransfers.length})
            </h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Hardware has been transferred to you and requires your formal acknowledgement of physical receipt.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {pendingTransfers.map((t, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-default)',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Asset Tag: {t.assetTag || t.assetSerial}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Transferred from: {t.fromEmployeeName || 'IT Depot'} • Reason: {t.reason || 'Workplace re-assignment'}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  disabled={acknowledgingTransferId === (t.transferId || t._id)}
                  onClick={() => handleAcknowledgeTransfer(t)}
                >
                  {acknowledgingTransferId === (t.transferId || t._id) ? 'Confirming...' : 'Acknowledge Custody'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Stats Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #0284c7' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              My Assigned Hardware
            </span>
            <Laptop size={18} color="#0284c7" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.4rem' }}>
            {myAssets.length}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Systems under your custody
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Total Authentications
            </span>
            <ShieldCheck size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.4rem' }}>
            {activityStats?.totalLogins || user?.loginCount || 1}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Successful system logins
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Last Login IP
            </span>
            <Globe size={18} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.4rem', fontFamily: 'monospace' }}>
            {activityStats?.lastLoginIp || user?.lastLoginIp || '127.0.0.1'}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            {activityStats?.lastLoginDate ? formatDateTimeIST(activityStats.lastLoginDate) : 'Current session active'}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Operations Performed
            </span>
            <Activity size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.4rem' }}>
            {activityStats?.totalOperations || 0}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Recorded in Audit Trail
          </div>
        </div>
      </div>

      {/* Main Workspace: My Assigned Hardware Fleet */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              My Assigned Hardware Fleet
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
              Physical equipment registered under your direct custody. Report hardware issues or confirm receipts here.
            </p>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Showing {myAssets.length} asset{myAssets.length !== 1 ? 's' : ''}
          </span>
        </div>

        {myAssets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <Laptop size={44} style={{ color: 'var(--text-faint)', margin: '0 auto 0.75rem' }} />
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              No hardware currently assigned to your account
            </div>
            <p style={{ fontSize: '0.8rem', maxWidth: '420px', margin: '0.35rem auto 0' }}>
              If you have physically received hardware, please ask your IT Administrator to issue the asset tag to your email address ({user?.email}).
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
            {myAssets.map((asset) => (
              <div
                key={asset._id}
                className="card"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  backgroundColor: 'var(--bg-surface-raised)',
                  border: '1px solid var(--border-default)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'rgba(2, 132, 199, 0.12)',
                        color: '#0284c7',
                        border: '1px solid rgba(2, 132, 199, 0.25)',
                      }}
                    >
                      {asset.deviceType || 'Hardware'}
                    </span>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor:
                          asset.workingCondition === 'Good' || asset.workingCondition === 'New'
                            ? 'rgba(16, 185, 129, 0.12)'
                            : 'rgba(245, 158, 11, 0.12)',
                        color:
                          asset.workingCondition === 'Good' || asset.workingCondition === 'New'
                            ? '#10b981'
                            : '#f59e0b',
                      }}
                    >
                      {asset.workingCondition || 'Good'} Condition
                    </span>
                  </div>

                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {asset.make} {asset.model}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem', fontFamily: 'monospace' }}>
                    Tag: {asset.assetNo || 'N/A'} • S/N: {asset.sr || asset.serialNo || 'N/A'}
                  </div>

                  <div style={{ margin: '0.85rem 0', fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {asset.processor && <div>• CPU: {asset.processor}</div>}
                    {asset.ramSize && <div>• Memory: {asset.ramSize}</div>}
                    {asset.storage && <div>• Storage: {asset.storage}</div>}
                    {asset.accessories && <div>• Accessories: {asset.accessories}</div>}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleAcknowledgeAsset(asset)}
                    style={{ flex: 1, fontSize: '0.75rem' }}
                  >
                    Confirm Receipt
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setSelectedAssetForIssue(asset)}
                    style={{ flex: 1, fontSize: '0.75rem', color: '#ea580c', borderColor: 'rgba(234, 88, 12, 0.3)' }}
                  >
                    Report Issue
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Activity Timeline (Real Audit Log Events) */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              My Activity History
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
              Real-time audit log of your actions and authentication sessions.
            </p>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Latest {activityStats?.recentActivity?.length || 0} events
          </span>
        </div>

        {(!activityStats?.recentActivity || activityStats.recentActivity.length === 0) ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No recent activity records found.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', fontSize: '0.8rem' }}>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Module</th>
                  <th>Description</th>
                  <th>IP Address</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {activityStats.recentActivity.map((log, idx) => (
                  <tr key={idx}>
                    <td style={{ whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                      {formatDateTimeIST(log.timestamp || log.createdAt)}
                    </td>
                    <td>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          padding: '0.15rem 0.45rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor:
                            log.action === 'CREATE'
                              ? 'rgba(16, 185, 129, 0.15)'
                              : log.action === 'UPDATE'
                              ? 'rgba(2, 132, 199, 0.15)'
                              : log.action === 'LOGIN'
                              ? 'rgba(100, 116, 139, 0.15)'
                              : 'rgba(239, 68, 68, 0.15)',
                          color:
                            log.action === 'CREATE'
                              ? '#10b981'
                              : log.action === 'UPDATE'
                              ? '#0284c7'
                              : log.action === 'LOGIN'
                              ? '#94a3b8'
                              : '#ef4444',
                        }}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td>{log.module}</td>
                    <td style={{ maxWidth: '340px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {log.description || log.details || 'User operation'}
                    </td>
                    <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          color: log.status === 'SUCCESS' ? '#10b981' : '#ef4444',
                        }}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="modal-backdrop" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Change Password
              </h3>
              <button
                type="button"
                className="btn btn-ghost btn-icon"
                onClick={() => setShowPasswordModal(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleChangePassword}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    className="form-control"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter existing password"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">New Password (min 6 characters)</label>
                  <input
                    type="password"
                    className="form-control"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowPasswordModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={changingPassword}
                >
                  {changingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Issue Modal */}
      {selectedAssetForIssue && (
        <div className="modal-backdrop" onClick={() => setSelectedAssetForIssue(null)}>
          <div className="modal-content" style={{ maxWidth: '460px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Report Hardware Issue
              </h3>
              <button
                type="button"
                className="btn btn-ghost btn-icon"
                onClick={() => setSelectedAssetForIssue(null)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmitIssue}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-surface-raised)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
                  <strong>{selectedAssetForIssue.make} {selectedAssetForIssue.model}</strong> ({selectedAssetForIssue.assetNo})
                </div>
                <div className="form-group">
                  <label className="form-label">Issue Category</label>
                  <select
                    className="form-control"
                    value={issueCategory}
                    onChange={(e) => setIssueCategory(e.target.value)}
                  >
                    <option value="Hardware Performance">Hardware Performance / Slowdown</option>
                    <option value="Screen / Display">Screen / Display Flickering or Broken</option>
                    <option value="Power / Battery">Battery Dying / Not Charging</option>
                    <option value="Keyboard / Mouse">Keyboard / Mouse / Input Fault</option>
                    <option value="Network / Wi-Fi">Network / Wi-Fi Disconnecting</option>
                    <option value="Physical Damage">Physical Casing Damage</option>
                    <option value="Software / OS Crash">Blue Screen / OS Crashing</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Issue Description</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    required
                    placeholder="Please explain the issue or error symptoms you are experiencing..."
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSelectedAssetForIssue(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={submittingIssue}
                >
                  {submittingIssue ? 'Submitting...' : 'Submit Support Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
