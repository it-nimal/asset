import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  X, 
  AlertTriangle, 
  Search, 
  User, 
  Laptop, 
  Tag, 
  Calendar,
  Building,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { api } from '../../services/api';

export default function MaintenanceForm({ isOpen, onClose, onSuccess, initialAsset = null }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [assets, setAssets] = useState([]);
  const [searchAsset, setSearchAsset] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(initialAsset);
  const [vendors, setVendors] = useState([]);

  const [formData, setFormData] = useState({
    issueDescription: '',
    issueCategory: 'Hardware',
    priority: 'Medium',
    reportedBy: 'IT Staff',
    repairType: 'Internal IT Repair',
    vendor: '',
    warrantyStatus: 'In Warranty',
    expectedReturnDate: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
      if (initialAsset) {
        setSelectedAsset(initialAsset);
      }
    }
  }, [isOpen, initialAsset]);

  const loadInitialData = async () => {
    try {
      const [assetsRes, vendorsRes] = await Promise.all([
        api.getAssets ? api.getAssets() : [],
        api.getVendors ? api.getVendors() : [],
      ]);
      setAssets(Array.isArray(assetsRes) ? assetsRes : (assetsRes?.data || []));
      setVendors(Array.isArray(vendorsRes) ? vendorsRes : (vendorsRes?.data || []));
    } catch (err) {
      console.error('Failed to load asset list for maintenance:', err);
    }
  };

  if (!isOpen) return null;

  const filteredAssets = assets.filter((a) => {
    if (a.status === 'Under Maintenance' || a.status === 'Retired' || a.status === 'Disposed') return false;
    if (!searchAsset) return true;
    const q = searchAsset.toLowerCase();
    return (
      (a.assetNo && a.assetNo.toLowerCase().includes(q)) ||
      (a.sr && a.sr.toLowerCase().includes(q)) ||
      (a.make && a.make.toLowerCase().includes(q)) ||
      (a.model && a.model.toLowerCase().includes(q)) ||
      (a.userName && a.userName.toLowerCase().includes(q))
    );
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAsset) {
      setError('Please select an asset to log maintenance for.');
      return;
    }
    if (!formData.issueDescription.trim()) {
      setError('Please provide a detailed issue description.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        assetId: selectedAsset._id,
        issueDescription: formData.issueDescription,
        issueCategory: formData.issueCategory,
        priority: formData.priority,
        reportedBy: formData.reportedBy,
        repairType: formData.repairType,
        vendor: formData.vendor,
        serviceVendor: formData.vendor,
        warrantyStatus: formData.warrantyStatus,
        expectedReturnDate: formData.expectedReturnDate || undefined,
        employeeName: selectedAsset.userName !== 'Unassigned' ? selectedAsset.userName : '',
        empCode: selectedAsset.empCode || '',
        department: selectedAsset.department || '',
      };

      const res = await api.createMaintenance(payload);
      if (onSuccess) onSuccess(res.data);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit maintenance request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Log Maintenance Request</h3>
              <p className="text-xs text-slate-400">Initiate equipment repair & service workflow</p>
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
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Asset Selection */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Select Target Equipment <span className="text-rose-400">*</span>
            </label>

            {selectedAsset ? (
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-amber-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-700/60 text-slate-300">
                    <Laptop className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">
                        {selectedAsset.make} {selectedAsset.model}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">
                        {selectedAsset.assetNo || selectedAsset.sr}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        Custodian: <strong className="text-slate-200">{selectedAsset.userName || 'Unassigned'}</strong>
                      </span>
                      {selectedAsset.department && (
                        <span>Dept: {selectedAsset.department}</span>
                      )}
                    </div>
                  </div>
                </div>
                {!initialAsset && (
                  <button
                    type="button"
                    onClick={() => setSelectedAsset(null)}
                    className="text-xs text-slate-400 hover:text-rose-400 underline ml-3"
                  >
                    Change
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={searchAsset}
                    onChange={(e) => setSearchAsset(e.target.value)}
                    placeholder="Search by Asset Tag, Serial, Model, Custodian..."
                    className="w-full pl-9.5 pr-4 py-2 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/40 divide-y divide-slate-800/60">
                  {filteredAssets.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No eligible assets found.
                    </div>
                  ) : (
                    filteredAssets.slice(0, 15).map((a) => (
                      <div
                        key={a._id}
                        onClick={() => setSelectedAsset(a)}
                        className="p-2.5 px-3 flex items-center justify-between hover:bg-slate-800/80 cursor-pointer transition-colors"
                      >
                        <div>
                          <div className="text-xs font-medium text-white flex items-center gap-2">
                            <span>{a.make} {a.model}</span>
                            <span className="font-mono text-slate-400 text-[11px] bg-slate-800 px-1.5 py-0.5 rounded">
                              {a.assetNo || a.sr}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Custodian: {a.userName || 'Unassigned'} • {a.department || 'Vitromed'}
                          </div>
                        </div>
                        <span className="text-xs text-amber-400 font-medium hover:underline">Select</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Issue Category & Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Issue Category <span className="text-rose-400">*</span>
              </label>
              <select
                value={formData.issueCategory}
                onChange={(e) => setFormData({ ...formData, issueCategory: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500/50"
              >
                <option value="Hardware">Hardware Fault</option>
                <option value="Software">Software / OS Issue</option>
                <option value="Network">Network / WiFi</option>
                <option value="Power">Power / Battery / Adapter</option>
                <option value="Physical Damage">Physical Screen / Body Damage</option>
                <option value="Performance">Performance / Overheating</option>
                <option value="Other">Other Maintenance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Priority Level <span className="text-rose-400">*</span>
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500/50"
              >
                <option value="Low">Low - Minor issue / Can work</option>
                <option value="Medium">Medium - Normal workflow affected</option>
                <option value="High">High - Critical / Work blocked</option>
              </select>
            </div>
          </div>

          {/* Issue Description */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Issue Symptoms & Detailed Description <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={3}
              value={formData.issueDescription}
              onChange={(e) => setFormData({ ...formData, issueDescription: e.target.value })}
              placeholder="Describe the exact fault, error messages, broken parts or behavior observed..."
              className="w-full px-3.5 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 resize-none"
            />
          </div>

          {/* Repair Channel & Vendor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Repair Pathway
              </label>
              <select
                value={formData.repairType}
                onChange={(e) => setFormData({ ...formData, repairType: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500/50"
              >
                <option value="Internal IT Repair">Internal IT Support</option>
                <option value="Vendor Repair">External Vendor Service</option>
                <option value="Warranty Repair">OEM / Brand Warranty Claim</option>
                <option value="Replacement">Equipment Replacement</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Service Vendor / OEM Partner
              </label>
              <input
                type="text"
                list="vendor-options"
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                placeholder="e.g. Dell Support, Vitromed IT Desk..."
                className="w-full px-3.5 py-2 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500/50"
              />
              <datalist id="vendor-options">
                {vendors.map((v) => (
                  <option key={v._id || v.name} value={v.name} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Reported By & Expected Return */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Reported By (Technician / Custodian)
              </label>
              <input
                type="text"
                value={formData.reportedBy}
                onChange={(e) => setFormData({ ...formData, reportedBy: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Target Estimated Completion Date
              </label>
              <input
                type="date"
                value={formData.expectedReturnDate}
                onChange={(e) => setFormData({ ...formData, expectedReturnDate: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedAsset}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Initiate Maintenance</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
