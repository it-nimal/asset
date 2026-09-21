import React, { useState } from 'react';
import { CheckCircle2, XCircle, X, AlertTriangle, ShieldCheck, FileText } from 'lucide-react';
import { api } from '../../services/api';

export default function MaintenanceQCModal({ isOpen, onClose, ticket, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [qcResult, setQcResult] = useState('Passed');
  const [qcNotes, setQcNotes] = useState('');
  const [qcBy, setQcBy] = useState('QC Engineer');

  if (!isOpen || !ticket) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.qcMaintenance(ticket._id, {
        qcResult,
        qcNotes,
        qcBy,
      });
      if (onSuccess) onSuccess(res.data);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit QC evaluation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Quality Control (QC) Inspection</h3>
              <p className="text-xs text-slate-400">Validate hardware repair & test before return</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Ticket Summary Card */}
          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Ticket ID:</span>
              <strong className="text-white font-mono">{ticket.maintenanceId}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Equipment:</span>
              <span className="text-white">{ticket.assetMake} {ticket.assetModel} ({ticket.assetTag})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Original Fault:</span>
              <span className="text-slate-300 truncate max-w-[240px]">{ticket.issueDescription}</span>
            </div>
          </div>

          {/* Pass / Fail Buttons */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              QC Evaluation Outcome <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setQcResult('Passed')}
                className={`p-3.5 rounded-xl border flex items-center justify-center gap-2.5 font-medium text-sm transition-all ${
                  qcResult === 'Passed'
                    ? 'bg-teal-500/20 border-teal-500/60 text-teal-300 ring-2 ring-teal-500/20'
                    : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-5 h-5 text-teal-400" />
                <span>Passed & Ready</span>
              </button>

              <button
                type="button"
                onClick={() => setQcResult('Failed')}
                className={`p-3.5 rounded-xl border flex items-center justify-center gap-2.5 font-medium text-sm transition-all ${
                  qcResult === 'Failed'
                    ? 'bg-rose-500/20 border-rose-500/60 text-rose-300 ring-2 ring-rose-500/20'
                    : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <XCircle className="w-5 h-5 text-rose-400" />
                <span>Failed (Rework)</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              {qcResult === 'Passed'
                ? 'Equipment will be marked as "Ready for Return" to custodian or central stock.'
                : 'Equipment will be reverted back to "In Repair" for further technician rework.'}
            </p>
          </div>

          {/* QC Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              QC Checklist / Inspection Notes
            </label>
            <textarea
              rows={3}
              value={qcNotes}
              onChange={(e) => setQcNotes(e.target.value)}
              placeholder="e.g. Stress test passed, OS boots cleanly, display and ports fully verified..."
              className="w-full px-3.5 py-2 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 resize-none"
            />
          </div>

          {/* Inspector Name */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Inspected By
            </label>
            <input
              type="text"
              value={qcBy}
              onChange={(e) => setQcBy(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500/50"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2"
            >
              {loading ? 'Submitting...' : 'Record QC Result'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
