import React, { useState, useEffect, useMemo } from 'react';
import {
  Laptop,
  Monitor,
  CheckCircle2,
  AlertTriangle,
  Wrench,
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
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../common/Toast';
import { useAuth } from '../../context/AuthContext';

export default function EmployeeSelfService({ onRefresh }) {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [myAssets, setMyAssets] = useState([]);
  const [pendingTransfers, setPendingTransfers] = useState([]);
  const [acknowledgingTransferId, setAcknowledgingTransferId] = useState(null);
  const [selectedAssetForIssue, setSelectedAssetForIssue] = useState(null);
  const [issueDescription, setIssueDescription] = useState('');
  const [issueCategory, setIssueCategory] = useState('Hardware Performance');
  const [submittingIssue, setSubmittingIssue] = useState(false);

  // Fetch logged in employee's assets and pending incoming transfers
  const fetchMyAssets = async () => {
    setLoading(true);
    try {
      const [allAssetsRes, transfersRes] = await Promise.all([
        api.getAssets(),
        api.getTransfers({ status: 'Acknowledgement Pending' }),
      ]);
      const assetsList = allAssetsRes?.data || allAssetsRes || [];
      const transfersList = transfersRes?.data || transfersRes || [];

      const userEmail = (user?.email || '').trim().toLowerCase();
      const userName = (user?.name || '').trim().toLowerCase();

      // Match assets belonging to this user
      const filteredAssets = assetsList.filter((a) => {
        const aMail = (a.mailId || '').trim().toLowerCase();
        const aUser = (a.userName || '').trim().toLowerCase();
        if (userEmail && aMail === userEmail) return true;
        if (userName && aUser === userName) return true;
        return false;
      });

      // Match pending incoming transfers targeted to this user
      const matchingTransfers = transfersList.filter((t) => {
        const toMail = (t.toEmail || '').trim().toLowerCase();
        const toName = (t.toEmployeeName || '').trim().toLowerCase();
        if (userEmail && toMail === userEmail) return true;
        if (userName && toName === userName) return true;
        return false;
      });

      setMyAssets(filteredAssets);
      setPendingTransfers(matchingTransfers);
    } catch (err) {
      toast.error('Could not load assigned assets: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAssets();
  }, [user]);

  // Handle incoming transfer acknowledgement
  const handleAcknowledgeTransfer = async (transfer) => {
    setAcknowledgingTransferId(transfer.transferId || transfer._id);
    try {
      await api.acknowledgeTransfer(transfer.transferId || transfer._id, {
        actorName: user?.name || transfer.toEmployeeName || 'Employee',
        notes: `Transfer acknowledged by ${user?.name || 'Employee'} on ${new Date().toLocaleDateString('en-GB')}`,
      });
      toast.success(
        `Asset ${transfer.assetTag || transfer.assetSerial} custody acknowledged!`,
        'Transfer Completed'
      );
      fetchMyAssets();
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error('Failed to acknowledge transfer: ' + err.message);
    } finally {
      setAcknowledgingTransferId(null);
    }
  };

  // Handle receipt acknowledgement
  const handleAcknowledge = async (asset) => {
    try {
      await api.acknowledgeAssetReceipt(asset._id, {
        notes: `Acknowledged by ${user?.name || 'Employee'} on ${new Date().toLocaleDateString('en-GB')}`,
        actorName: user?.name || 'Employee',
      });
      toast.success(`Asset ${asset.assetNo} acknowledged successfully!`, 'Receipt Confirmed');
      fetchMyAssets();
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error('Failed to acknowledge: ' + err.message);
    }
  };

  // Handle issue submission
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
      fetchMyAssets();
    } catch (err) {
      toast.error('Failed to submit ticket: ' + err.message);
    } finally {
      setSubmittingIssue(false);
    }
  };

  return (
    <div style={{ padding: '1.5rem 2rem 4rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Employee Profile Header Card */}
      <div
        className="card"
        style={{
          padding: '1.5rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
          borderColor: 'rgba(56, 189, 248, 0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                fontWeight: 800,
                border: '1px solid rgba(56, 189, 248, 0.3)',
              }}
            >
              {(user?.name || 'E').charAt(0).toUpperCase()}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {user?.name || 'Employee'}
                </h1>
                <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                  Active Staff
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Mail size={13} color="var(--text-faint)" />
                  {user?.email || 'N/A'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Building2 size={13} color="var(--text-faint)" />
                  {user?.department || 'Vitromed Operations'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <MapPin size={13} color="var(--text-faint)" />
                  Vitromed Facility (22Godam)
                </span>
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Assigned Hardware</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8', lineHeight: 1.1, marginTop: '0.2rem' }}>
              {myAssets.length} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>Items</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Incoming Transfer Acknowledgements Alert */}
      {pendingTransfers.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <ArrowRightLeft size={18} color="#fb923c" />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fb923c', margin: 0 }}>
              Incoming Asset Transfers Awaiting Your Acknowledgement ({pendingTransfers.length})
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1rem' }}>
            {pendingTransfers.map((t) => {
              const isAcknowledging = acknowledgingTransferId === (t.transferId || t._id);

              return (
                <div
                  key={t._id || t.transferId}
                  className="card"
                  style={{
                    padding: '1.25rem',
                    backgroundColor: 'rgba(249, 115, 22, 0.04)',
                    borderColor: 'rgba(249, 115, 22, 0.35)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Laptop size={18} color="#fb923c" />
                        <div>
                          <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                            {t.assetMake} {t.assetModel}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {t.assetCategory || 'Hardware'}
                          </div>
                        </div>
                      </div>

                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: 'rgba(249, 115, 22, 0.15)',
                          color: '#fb923c',
                          padding: '0.2rem 0.5rem',
                          borderRadius: 'var(--radius-xs)',
                        }}
                      >
                        {t.assetTag || 'AST-N/A'}
                      </span>
                    </div>

                    <div
                      style={{
                        padding: '0.75rem',
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.78rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.35rem',
                        marginTop: '0.65rem',
                      }}
                    >
                      <div>
                        <span style={{ color: 'var(--text-faint)' }}>Transferred from: </span>
                        <strong style={{ color: '#f87171' }}>{t.fromEmployeeName}</strong> ({t.fromDepartment})
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-faint)' }}>Transfer ID: </span>
                        <span style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>{t.transferId}</span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-faint)' }}>Reason: </span>
                        <span style={{ color: 'var(--text-secondary)' }}>{t.reason || 'Employee Transfer'}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isAcknowledging}
                    onClick={() => handleAcknowledgeTransfer(t)}
                    className="btn btn-primary btn-sm"
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      backgroundColor: '#16a34a',
                      borderColor: '#16a34a',
                    }}
                  >
                    <CheckCircle2 size={16} />
                    {isAcknowledging ? 'Confirming Receipt...' : 'Acknowledge & Accept Custody'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Section Title */}
      <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            My Active Workstation & Assigned Assets
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Hardware issued by IT Administration for your daily operations.
          </p>
        </div>
      </div>

      {/* Assets Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading your assigned workstation...
        </div>
      ) : myAssets.length === 0 ? (
        <div
          className="card"
          style={{
            padding: '3.5rem 1.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Boxes size={24} color="var(--text-faint)" />
          </div>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>No IT Hardware Currently Assigned</div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '420px', margin: 0 }}>
            If you have been issued a Laptop, Desktop, or Peripherals that do not appear here, please contact the IT Administrator.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
          {myAssets.map((asset) => {
            const isAcknowledged = Boolean(asset.receiptAcknowledged);

            return (
              <div
                key={asset._id}
                className="card"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: isAcknowledged ? '1px solid var(--border-default)' : '1px solid rgba(245, 158, 11, 0.4)',
                }}
              >
                <div>
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'rgba(56, 189, 248, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {asset.deviceType?.toLowerCase().includes('laptop') ? (
                          <Laptop size={18} color="#38bdf8" />
                        ) : (
                          <Monitor size={18} color="#818cf8" />
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                          {asset.make} {asset.model}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>{asset.deviceType}</div>
                      </div>
                    </div>

                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: 'rgba(56, 189, 248, 0.12)',
                        color: '#38bdf8',
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-xs)',
                      }}
                    >
                      {asset.assetNo || 'AST-N/A'}
                    </span>
                  </div>

                  {/* Specs List */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '0.6rem',
                      padding: '0.75rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.78rem',
                      marginBottom: '1rem',
                    }}
                  >
                    <div>
                      <span style={{ color: 'var(--text-faint)', display: 'block', fontSize: '0.7rem' }}>Serial Number</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {asset.sr || 'N/A'}
                      </span>
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-faint)', display: 'block', fontSize: '0.7rem' }}>Assigned Date</span>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                        {asset.assignedDate ? new Date(asset.assignedDate).toLocaleDateString('en-GB') : 'Active'}
                      </span>
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-faint)', display: 'block', fontSize: '0.7rem' }}>Processor / RAM</span>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                        {asset.processor || 'Intel Core'} • {asset.ramSize || asset.ram || '8 GB'}
                      </span>
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-faint)', display: 'block', fontSize: '0.7rem' }}>Storage / OS</span>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                        {asset.storage || asset.hdd || 'SSD'} • {asset.osVersion || 'Win 10/11'}
                      </span>
                    </div>
                  </div>

                  {/* Bundled Accessories */}
                  {asset.accessories && (
                    <div style={{ marginBottom: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Attached Peripherals: </span>
                      {asset.accessories}
                    </div>
                  )}

                  {/* Acknowledgement Indicator */}
                  <div style={{ marginBottom: '1rem' }}>
                    {isAcknowledged ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#34d399' }}>
                        <CheckCircle2 size={14} />
                        <span>Receipt confirmed on {asset.receiptAcknowledgedAt ? new Date(asset.receiptAcknowledgedAt).toLocaleDateString('en-GB') : 'file'}</span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#fbbf24' }}>
                        <AlertTriangle size={14} />
                        <span>Pending your receipt acknowledgement</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Footer */}
                <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                  {!isAcknowledged && (
                    <button
                      type="button"
                      onClick={() => handleAcknowledge(asset)}
                      className="btn btn-primary btn-xs"
                      style={{ flex: 1 }}
                    >
                      <CheckCircle2 size={13} />
                      <span>Confirm Receipt</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedAssetForIssue(asset)}
                    className="btn btn-outline btn-xs"
                    style={{ flex: 1 }}
                  >
                    <Wrench size={13} />
                    <span>Report Issue</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Report Issue Modal */}
      {selectedAssetForIssue && (
        <div className="modal-overlay" onClick={() => setSelectedAssetForIssue(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Wrench size={18} color="#fbbf24" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Report Issue / Request Service</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAssetForIssue(null)}
                className="btn btn-ghost btn-icon btn-xs"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitIssue}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    {selectedAssetForIssue.make} {selectedAssetForIssue.model} ({selectedAssetForIssue.assetNo})
                  </div>
                  <div style={{ color: 'var(--text-faint)', fontSize: '0.72rem', marginTop: '0.15rem' }}>
                    Serial Number: {selectedAssetForIssue.sr}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Issue Category</label>
                  <select
                    className="form-select"
                    value={issueCategory}
                    onChange={(e) => setIssueCategory(e.target.value)}
                  >
                    <option value="Hardware Breakdown">Hardware Breakdown (Screen, Keyboard, Battery)</option>
                    <option value="Performance / Slow System">Performance / Slow System / Freezing</option>
                    <option value="Operating System / Software">Operating System / Software Crash</option>
                    <option value="Network / Wi-Fi / IP">Network / Wi-Fi / VPN Connection</option>
                    <option value="Accessories / Peripheral">Accessories / Charger / Mouse Issue</option>
                    <option value="Other">Other Maintenance Requirement</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Describe the Trouble / Symptoms <span style={{ color: '#f87171' }}>*</span></label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Please explain what is happening, error messages, or damaged parts..."
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setSelectedAssetForIssue(null)}
                  className="btn btn-outline btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingIssue}
                  className="btn btn-primary btn-sm"
                >
                  <Send size={13} />
                  <span>{submittingIssue ? 'Submitting...' : 'Submit to IT Desk'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
