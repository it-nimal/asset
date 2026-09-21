import React, { useState } from 'react';
import { ArrowLeftRight, X, AlertTriangle, CheckCircle, Package, UserCheck, Trash2 } from 'lucide-react';
import { api } from '../../services/api';

export default function MaintenanceReturnModal({ isOpen, onClose, ticket, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [disposition, setDisposition] = useState(
    ticket?.employeeName ? 'Return to Employee' : 'Return to Stock'
  );
  const [serviceNotes, setServiceNotes] = useState(ticket?.serviceNotes || '');
  const [repairCost, setRepairCost] = useState(ticket?.repairCost || 0);

  if (!isOpen || !ticket) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.completeMaintenance(ticket._id, {
        finalDisposition: disposition,
        serviceNotes,
        repairCost: Number(repairCost) || 0,
        actorName: 'IT Admin',
      });
      if (onSuccess) onSuccess(res.data);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to complete maintenance return');
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
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Maintenance Completion & Return</h3>
              <p className="text-xs text-slate-400">Restore equipment to employee or stock</p>
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
          {/* Equipment Info */}
          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Equipment:</span>
              <strong className="text-white">{ticket.assetMake} {ticket.assetModel} ({ticket.assetTag})</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Original Custodian:</span>
              <span className="text-slate-200">{ticket.employeeName || 'None (Central Stock)'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">QC Status:</span>
              <span className="text-teal-400 font-semibold">{ticket.qcResult || 'Passed'}</span>
            </div>
          </div>

          {/* Disposition Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Final Disposition Action <span className="text-rose-400">*</span>
            </label>
            <div className="space-y-2">
              {ticket.employeeName && (
                <div
                  onClick={() => setDisposition('Return to Employee')}
                  className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                    disposition === 'Return to Employee'
                      ? 'bg-teal-500/10 border-teal-500 text-white'
                      : 'bg-slate-800/40 border-slate-700/70 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <UserCheck className="w-4 h-4 text-teal-400 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold">Return to {ticket.employeeName}</div>
                      <div className="text-[11px] text-slate-400">Restores asset status to "Assigned" under custodian</div>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="disposition"
                    checked={disposition === 'Return to Employee'}
                    onChange={() => {}}
                    className="text-teal-500"
                  />
                </div>
              )}

              <div
                onClick={() => setDisposition('Return to Stock')}
                className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                  disposition === 'Return to Stock'
                    ? 'bg-blue-500/10 border-blue-500 text-white'
                    : 'bg-slate-800/40 border-slate-700/70 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4 text-blue-400 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold">Return to Central Stock (Available)</div>
                    <div className="text-[11px] text-slate-400">Unlinks custodian; makes asset available for new allocation</div>
                  </div>
                </div>
                <input
                  type="radio"
                  name="disposition"
                  checked={disposition === 'Return to Stock'}
                  onChange={() => {}}
                  className="text-blue-500"
                />
              </div>

              <div
                onClick={() => setDisposition('Retire')}
                className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                  disposition === 'Retire'
                    ? 'bg-rose-500/10 border-rose-500 text-white'
                    : 'bg-slate-800/40 border-slate-700/70 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Trash2 className="w-4 h-4 text-rose-400 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold">Retire / Decommission Equipment</div>
                    <div className="text-[11px] text-slate-400">Permanently mark asset as Retired/Scrapped</div>
                  </div>
                </div>
                <input
                  type="radio"
                  name="disposition"
                  checked={disposition === 'Retire'}
                  onChange={() => {}}
                  className="text-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Cost & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Total Repair Cost (₹)
              </label>
              <input
                type="number"
                min="0"
                value={repairCost}
                onChange={(e) => setRepairCost(e.target.value)}
                placeholder="0"
                className="w-full px-3.5 py-2 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Service Completion Notes
              </label>
              <input
                type="text"
                value={serviceNotes}
                onChange={(e) => setServiceNotes(e.target.value)}
                placeholder="e.g. Battery replaced under warranty"
                className="w-full px-3.5 py-2 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500/50"
              />
            </div>
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
              className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-sm transition-all shadow-lg shadow-teal-500/20 flex items-center gap-2"
            >
              {loading ? 'Completing...' : 'Complete & Return Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
