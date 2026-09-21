import React, { useState } from 'react';
import { 
  Wrench, 
  X, 
  User, 
  Laptop, 
  Clock, 
  ShieldCheck, 
  DollarSign, 
  Truck, 
  Calendar, 
  FileText, 
  Activity,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import MaintenanceStatusBadge from './MaintenanceStatusBadge';
import MaintenanceQCModal from './MaintenanceQCModal';
import MaintenanceReturnModal from './MaintenanceReturnModal';
import { api } from '../../services/api';

export default function MaintenanceDetailsModal({ isOpen, onClose, ticket, onUpdated }) {
  const [showQCModal, setShowQCModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosisData, setDiagnosisData] = useState({
    diagnosis: ticket?.diagnosis || '',
    rootCause: ticket?.rootCause || '',
    recommendedAction: ticket?.recommendedAction || '',
  });

  if (!isOpen || !ticket) return null;

  const handleSaveDiagnosis = async () => {
    try {
      const res = await api.diagnoseMaintenance(ticket._id, diagnosisData);
      setIsDiagnosing(false);
      if (onUpdated) onUpdated(res.data);
    } catch (err) {
      alert('Failed to save diagnosis: ' + err.message);
    }
  };

  const handleStartRepair = async (type) => {
    try {
      const res = await api.startRepairMaintenance(ticket._id, {
        repairType: type || ticket.repairType || 'Internal IT Repair',
      });
      if (onUpdated) onUpdated(res.data);
    } catch (err) {
      alert('Failed to start repair: ' + err.message);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
        <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-white">{ticket.maintenanceId}</h3>
                  <MaintenanceStatusBadge status={ticket.status} />
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                    ticket.priority === 'High' ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {ticket.priority} Priority
                  </span>
                </div>
                <p className="text-xs text-slate-400">Reported on {new Date(ticket.reportedDate || ticket.createdAt).toLocaleDateString('en-GB')}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Quick Action Bar */}
            <div className="flex flex-wrap items-center gap-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
              <span className="text-xs text-slate-400 font-medium mr-2">Workflow Actions:</span>

              {ticket.status === 'Reported' && (
                <button
                  onClick={() => setIsDiagnosing(true)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
                >
                  Start Diagnosis
                </button>
              )}

              {(ticket.status === 'Reported' || ticket.status === 'Under Diagnosis') && (
                <button
                  onClick={() => handleStartRepair('Internal IT Repair')}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-medium text-xs transition-colors"
                >
                  Send to Repair
                </button>
              )}

              {['Reported', 'Under Diagnosis', 'In Repair', 'Awaiting Vendor', 'Awaiting Parts', 'QC Pending'].includes(ticket.status) && (
                <button
                  onClick={() => setShowQCModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-colors"
                >
                  Perform QC Inspection
                </button>
              )}

              {ticket.status === 'Ready' && (
                <button
                  onClick={() => setShowReturnModal(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-teal-500/20"
                >
                  Return / Complete Disposition
                </button>
              )}
            </div>

            {/* Grid Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Asset Details */}
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                  <Laptop className="w-4 h-4 text-amber-400" />
                  Equipment Details
                </div>
                <div className="text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Make & Model:</span>
                    <strong className="text-white">{ticket.assetMake} {ticket.assetModel}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Asset Tag / ID:</span>
                    <span className="font-mono text-slate-200">{ticket.assetTag || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Serial Number (SR):</span>
                    <span className="font-mono text-slate-200">{ticket.assetSerial || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Category:</span>
                    <span className="text-slate-300">{ticket.assetCategory || 'Computing'}</span>
                  </div>
                </div>
              </div>

              {/* Custodian Details */}
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                  <User className="w-4 h-4 text-blue-400" />
                  Custodian & Report Info
                </div>
                <div className="text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Custodian:</span>
                    <strong className="text-white">{ticket.employeeName || 'Unassigned / Central Stock'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Employee Code:</span>
                    <span className="text-slate-200">{ticket.empCode || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Department:</span>
                    <span className="text-slate-300">{ticket.department || 'Vitromed'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Reported By:</span>
                    <span className="text-slate-300">{ticket.reportedBy || 'IT Staff'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Issue Description */}
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                Issue Description & Fault
              </div>
              <p className="text-sm text-slate-200 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                {ticket.issueDescription}
              </p>
            </div>

            {/* Diagnosis Section */}
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  Technical Diagnosis
                </div>
                {!isDiagnosing && (
                  <button
                    onClick={() => setIsDiagnosing(true)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 underline"
                  >
                    Edit Diagnosis
                  </button>
                )}
              </div>

              {isDiagnosing ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Diagnosis Findings</label>
                    <input
                      type="text"
                      value={diagnosisData.diagnosis}
                      onChange={(e) => setDiagnosisData({ ...diagnosisData, diagnosis: e.target.value })}
                      placeholder="e.g. Defective cooling fan causing overheating"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Root Cause</label>
                      <input
                        type="text"
                        value={diagnosisData.rootCause}
                        onChange={(e) => setDiagnosisData({ ...diagnosisData, rootCause: e.target.value })}
                        placeholder="e.g. Dust clogging / bearing failure"
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Recommended Action</label>
                      <input
                        type="text"
                        value={diagnosisData.recommendedAction}
                        onChange={(e) => setDiagnosisData({ ...diagnosisData, recommendedAction: e.target.value })}
                        placeholder="e.g. Fan replacement and thermal repasting"
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setIsDiagnosing(false)}
                      className="px-3 py-1 rounded text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveDiagnosis}
                      className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                    >
                      Save Diagnosis
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block mb-1">Finding:</span>
                    <strong className="text-slate-200">{ticket.diagnosis || 'Pending inspection'}</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block mb-1">Root Cause:</span>
                    <span className="text-slate-300">{ticket.rootCause || 'N/A'}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block mb-1">Action:</span>
                    <span className="text-slate-300">{ticket.recommendedAction || 'N/A'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Repair & QC Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs space-y-2">
                <div className="flex items-center gap-2 font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  <Truck className="w-4 h-4 text-sky-400" />
                  Service & Vendor Details
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Repair Type:</span>
                  <span className="text-slate-200">{ticket.repairType || 'Internal IT'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Vendor:</span>
                  <span className="text-slate-200">{ticket.vendor || ticket.serviceVendor || 'None (Internal)'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Repair Cost:</span>
                  <strong className="text-teal-400">₹{ticket.repairCost || ticket.cost || 0}</strong>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs space-y-2">
                <div className="flex items-center gap-2 font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  QC & Inspection Results
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">QC Status:</span>
                  <span className={`font-semibold px-2 py-0.5 rounded ${
                    ticket.qcResult === 'Passed' ? 'bg-teal-500/20 text-teal-300' : 
                    ticket.qcResult === 'Failed' ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-700 text-slate-400'
                  }`}>
                    {ticket.qcResult || 'Not Tested'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">QC Notes:</span>
                  <span className="text-slate-300 truncate max-w-[180px]">{ticket.qcNotes || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Inspector:</span>
                  <span className="text-slate-300">{ticket.qcBy || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Timeline History */}
            {ticket.history && ticket.history.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  Activity History & Audit Trail
                </div>
                <div className="space-y-3">
                  {ticket.history.map((h, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs border-l-2 border-slate-700 pl-3 py-0.5">
                      <div className="min-w-[120px] text-slate-500">
                        {new Date(h.date).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
                      </div>
                      <div>
                        <span className="font-semibold text-white mr-2">{h.action}</span>
                        <span className="text-slate-400">{h.details}</span>
                        {h.performedBy && <span className="text-slate-500 ml-2">by {h.performedBy}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showQCModal && (
        <MaintenanceQCModal
          isOpen={showQCModal}
          ticket={ticket}
          onClose={() => setShowQCModal(false)}
          onSuccess={(updated) => {
            setShowQCModal(false);
            if (onUpdated) onUpdated(updated);
          }}
        />
      )}

      {showReturnModal && (
        <MaintenanceReturnModal
          isOpen={showReturnModal}
          ticket={ticket}
          onClose={() => setShowReturnModal(false)}
          onSuccess={(updated) => {
            setShowReturnModal(false);
            if (onUpdated) onUpdated(updated.maintenance || updated);
          }}
        />
      )}
    </>
  );
}
