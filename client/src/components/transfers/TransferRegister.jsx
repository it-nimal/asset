import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowRightLeft,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  Printer,
  Eye,
  RefreshCw,
  Send,
  Boxes,
  FileSpreadsheet,
  AlertTriangle,
  X,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../common/Toast';
import TransferStatusBadge from './TransferStatusBadge';
import TransferForm from './TransferForm';
import TransferDetailsModal from './TransferDetailsModal';
import TransferHandoverDocument from './TransferHandoverDocument';

const STATUS_TABS = [
  'All',
  'Pending',
  'Approved',
  'Handover Pending',
  'Acknowledgement Pending',
  'Completed',
  'Cancelled',
];

export default function TransferRegister({ onRefresh }) {
  const toast = useToast();
  const [transfers, setTransfers] = useState([]);
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTransferForDetails, setSelectedTransferForDetails] = useState(null);
  const [selectedTransferForPrint, setSelectedTransferForPrint] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [transfersRes, assetsRes, employeesRes] = await Promise.all([
        api.getTransfers(),
        api.getAssets(),
        api.getEmployees(),
      ]);

      setTransfers(transfersRes?.data || transfersRes || []);
      setAssets(assetsRes?.data || assetsRes || []);
      setEmployees(employeesRes?.data || employeesRes || []);
    } catch (err) {
      toast.error('Failed to load transfer register: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered transfers list
  const filteredTransfers = useMemo(() => {
    return transfers.filter((t) => {
      if (activeTab !== 'All' && t.status !== activeTab) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const tId = (t.transferId || '').toLowerCase();
        const tag = (t.assetTag || '').toLowerCase();
        const fromName = (t.fromEmployeeName || '').toLowerCase();
        const toName = (t.toEmployeeName || '').toLowerCase();
        const fromCode = (t.fromEmpCode || '').toLowerCase();
        const toCode = (t.toEmpCode || '').toLowerCase();
        const reason = (t.reason || '').toLowerCase();
        return (
          tId.includes(q) ||
          tag.includes(q) ||
          fromName.includes(q) ||
          toName.includes(q) ||
          fromCode.includes(q) ||
          toCode.includes(q) ||
          reason.includes(q)
        );
      }
      return true;
    });
  }, [transfers, activeTab, searchTerm]);

  // Counts for KPI Cards & Tabs
  const kpis = useMemo(() => {
    const counts = {
      total: transfers.length,
      pending: 0,
      approved: 0,
      handoverPending: 0,
      ackPending: 0,
      completed: 0,
      cancelled: 0,
    };

    transfers.forEach((t) => {
      if (t.status === 'Pending') counts.pending++;
      else if (t.status === 'Approved') counts.approved++;
      else if (t.status === 'Handover Pending') counts.handoverPending++;
      else if (t.status === 'Acknowledgement Pending') counts.ackPending++;
      else if (t.status === 'Completed') counts.completed++;
      else if (t.status === 'Cancelled') counts.cancelled++;
    });

    return counts;
  }, [transfers]);

  return (
    <div className="page-container" style={{ paddingBottom: '3rem' }}>
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(56, 189, 248, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8',
              }}
            >
              <ArrowRightLeft size={20} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
                Asset Transfer & Handover Register
              </h1>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.15rem', margin: 0 }}>
                Manage physical equipment transitions between employees with verifiable custody tracking and handover documentation.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="btn btn-outline btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Plus size={16} />
            Initiate Custody Transfer
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Total Transfers
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
            {kpis.total}
          </div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#fbbf24', textTransform: 'uppercase' }}>
            Pending Approval
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fbbf24', marginTop: '0.2rem' }}>
            {kpis.pending}
          </div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem', borderColor: 'rgba(168, 85, 247, 0.3)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#c084fc', textTransform: 'uppercase' }}>
            Awaiting Handover
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#c084fc', marginTop: '0.2rem' }}>
            {kpis.approved + kpis.handoverPending}
          </div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem', borderColor: 'rgba(249, 115, 22, 0.3)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#fb923c', textTransform: 'uppercase' }}>
            Awaiting Ack.
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fb923c', marginTop: '0.2rem' }}>
            {kpis.ackPending}
          </div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#34d399', textTransform: 'uppercase' }}>
            Completed Transfers
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399', marginTop: '0.2rem' }}>
            {kpis.completed}
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div
        className="card"
        style={{
          padding: '0.85rem 1.25rem',
          marginBottom: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        {/* Status Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflowX: 'auto', maxWidth: '100%' }}>
          {STATUS_TABS.map((tab) => {
            const isActive = activeTab === tab;
            let count = 0;
            if (tab === 'All') count = kpis.total;
            else if (tab === 'Pending') count = kpis.pending;
            else if (tab === 'Approved') count = kpis.approved;
            else if (tab === 'Handover Pending') count = kpis.handoverPending;
            else if (tab === 'Acknowledgement Pending') count = kpis.ackPending;
            else if (tab === 'Completed') count = kpis.completed;
            else if (tab === 'Cancelled') count = kpis.cancelled;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.78rem',
                  fontWeight: isActive ? 700 : 500,
                  backgroundColor: isActive ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.04)',
                  color: isActive ? '#fff' : 'var(--text-muted)',
                  border: '1px solid',
                  borderColor: isActive ? 'var(--color-primary)' : 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{tab}</span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    padding: '0.1rem 0.35rem',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: isActive ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                    color: isActive ? '#fff' : 'var(--text-faint)',
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={14} color="var(--text-faint)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search transfer ID, tag, user..."
            className="form-control form-control-sm"
            style={{ paddingLeft: '2rem', paddingRight: searchTerm ? '2rem' : '0.65rem' }}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-faint)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: 0,
              }}
              title="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Transfers Data Table */}
      <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Loading transfer register records...
          </div>
        ) : filteredTransfers.length === 0 ? (
          <div
            style={{
              padding: '3.5rem 1.5rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowRightLeft size={22} color="var(--text-faint)" />
            </div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
              No Transfer Records Found
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, maxWidth: '380px' }}>
              {searchTerm || activeTab !== 'All'
                ? 'No transfer records matched your filter or search query.'
                : 'No asset transfers have been initiated yet. Click "Initiate Custody Transfer" to get started.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th style={{ width: '130px' }}>Transfer ID</th>
                  <th>Transferred Asset</th>
                  <th>From Custodian</th>
                  <th>To Custodian</th>
                  <th>Reason</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransfers.map((t) => {
                  const tDate = t.transferDate
                    ? new Date(t.transferDate).toLocaleDateString('en-GB')
                    : 'N/A';

                  return (
                    <tr key={t._id || t.transferId}>
                      {/* Transfer ID */}
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#38bdf8', fontSize: '0.82rem' }}>
                        {t.transferId}
                      </td>

                      {/* Transferred Asset */}
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                          {t.assetMake} {t.assetModel}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          Tag: {t.assetTag || 'N/A'} • {t.assetCategory || 'Computing'}
                        </div>
                      </td>

                      {/* From Custodian */}
                      <td>
                        <div style={{ fontWeight: 600, color: '#f87171', fontSize: '0.82rem' }}>
                          {t.fromEmployeeName}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>
                          {t.fromEmpCode} • {t.fromDepartment}
                        </div>
                      </td>

                      {/* To Custodian */}
                      <td>
                        <div style={{ fontWeight: 600, color: '#34d399', fontSize: '0.82rem' }}>
                          {t.toEmployeeName}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>
                          {t.toEmpCode} • {t.toDepartment}
                        </div>
                      </td>

                      {/* Reason */}
                      <td>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          {t.reason || 'Employee Transfer'}
                        </span>
                      </td>

                      {/* Date */}
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {tDate}
                      </td>

                      {/* Status */}
                      <td>
                        <TransferStatusBadge status={t.status} size="sm" />
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedTransferForPrint(t)}
                            title="Print Handover Sheet"
                            className="btn btn-ghost btn-icon btn-xs"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            <Printer size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedTransferForDetails(t)}
                            title="Inspect Details & Workflow"
                            className="btn btn-outline btn-xs"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                          >
                            <Eye size={13} />
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showCreateModal && (
        <TransferForm
          assets={assets}
          employees={employees}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            loadData();
            if (onRefresh) onRefresh();
          }}
        />
      )}

      {/* Details Modal */}
      {selectedTransferForDetails && (
        <TransferDetailsModal
          transfer={selectedTransferForDetails}
          onClose={() => setSelectedTransferForDetails(null)}
          onUpdate={() => {
            loadData();
            if (onRefresh) onRefresh();
          }}
        />
      )}

      {/* Handover Printable Modal */}
      {selectedTransferForPrint && (
        <TransferHandoverDocument
          transfer={selectedTransferForPrint}
          asset={{
            assetNo: selectedTransferForPrint.assetTag,
            make: selectedTransferForPrint.assetMake,
            model: selectedTransferForPrint.assetModel,
            sr: selectedTransferForPrint.assetSerial,
            deviceType: selectedTransferForPrint.assetCategory,
          }}
          onClose={() => setSelectedTransferForPrint(null)}
        />
      )}
    </div>
  );
}
