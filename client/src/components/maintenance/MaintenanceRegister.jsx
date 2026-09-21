import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Search, 
  Plus, 
  Filter, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  User, 
  Laptop, 
  ChevronRight,
  ShieldCheck,
  ArrowLeftRight,
  Eye
} from 'lucide-react';
import MaintenanceStatusBadge from './MaintenanceStatusBadge';
import MaintenanceForm from './MaintenanceForm';
import MaintenanceQCModal from './MaintenanceQCModal';
import MaintenanceReturnModal from './MaintenanceReturnModal';
import MaintenanceDetailsModal from './MaintenanceDetailsModal';
import { api } from '../../services/api';

export default function MaintenanceRegister() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Active');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showQCModal, setShowQCModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);

  useEffect(() => {
    loadTickets();
  }, [statusFilter, priorityFilter, categoryFilter]);

  const loadTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMaintenance({
        status: statusFilter,
        priority: priorityFilter,
        issueCategory: categoryFilter,
        search,
      });
      setTickets(Array.isArray(data) ? data : (data.data || []));
    } catch (err) {
      setError(err.message || 'Failed to load maintenance records');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadTickets();
  };

  // Metrics counters
  const totalInMaintenance = tickets.filter(t => !['Returned', 'Cancelled', 'Resolved', 'Closed'].includes(t.status)).length;
  const inRepairCount = tickets.filter(t => ['In Repair', 'Under Diagnosis'].includes(t.status)).length;
  const awaitingCount = tickets.filter(t => ['Awaiting Vendor', 'Awaiting Parts'].includes(t.status)).length;
  const readyCount = tickets.filter(t => t.status === 'Ready').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400">
            <Wrench className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Maintenance & Repair Register</h1>
            <p className="text-sm text-slate-400">
              Track physical equipment repair lifecycle, vendor claims, QC testing, and custodian returns.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadTickets}
            className="p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-all shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Log Maintenance Request</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active In Maintenance</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-white">{totalInMaintenance}</div>
          <div className="text-[11px] text-slate-400 mt-1">Total active repair tickets</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">In Repair / Diagnosis</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-amber-400">{inRepairCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Technician bench testing & repairs</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Vendor / Parts Pending</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-sky-400">{awaitingCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Awaiting vendor or spare parts</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">QC Passed / Ready</span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-teal-400">{readyCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Ready for employee/stock return</div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/60 rounded-xl border border-slate-800 overflow-x-auto max-w-full">
            {[
              { id: 'Active', label: 'Active Repairs' },
              { id: 'Reported', label: 'Reported' },
              { id: 'In Repair', label: 'In Repair' },
              { id: 'QC Pending', label: 'QC Pending' },
              { id: 'Ready', label: 'Ready for Return' },
              { id: 'Returned', label: 'Returned & Closed' },
              { id: 'All', label: 'All Records' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  statusFilter === tab.id
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="relative min-w-[280px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Ticket, Tag, Serial, Custodian..."
              className="w-full pl-9.5 pr-4 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </form>
        </div>

        {/* Priority & Category Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/60">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-amber-500/50"
          >
            <option value="All">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-amber-500/50"
          >
            <option value="All">All Issue Categories</option>
            <option value="Hardware">Hardware Fault</option>
            <option value="Software">Software / OS</option>
            <option value="Power">Power & Battery</option>
            <option value="Physical Damage">Physical Damage</option>
            <option value="Performance">Performance</option>
          </select>
        </div>
      </div>

      {/* Maintenance Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-amber-400" />
            Loading maintenance register...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-400 text-sm flex items-center justify-center gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm space-y-2">
            <Wrench className="w-8 h-8 mx-auto text-slate-600" />
            <p>No maintenance tickets match the selected filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="p-3.5 pl-6">Ticket ID</th>
                  <th className="p-3.5">Equipment / Tag</th>
                  <th className="p-3.5">Custodian</th>
                  <th className="p-3.5">Issue Description</th>
                  <th className="p-3.5">Priority</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Vendor / Cost</th>
                  <th className="p-3.5 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tickets.map((t) => (
                  <tr
                    key={t._id}
                    className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => {
                      setSelectedTicket(t);
                      setShowDetailsModal(true);
                    }}
                  >
                    <td className="p-3.5 pl-6 font-mono font-semibold text-white">
                      {t.maintenanceId}
                    </td>

                    <td className="p-3.5">
                      <div className="font-medium text-slate-200">{t.assetMake} {t.assetModel}</div>
                      <div className="text-[11px] font-mono text-slate-400">{t.assetTag || t.assetSerial}</div>
                    </td>

                    <td className="p-3.5">
                      <div className="font-medium text-slate-200">{t.employeeName || 'Unassigned'}</div>
                      <div className="text-[11px] text-slate-400">{t.department || 'Vitromed'}</div>
                    </td>

                    <td className="p-3.5 max-w-[220px]">
                      <div className="text-slate-300 truncate font-medium">{t.issueDescription}</div>
                      <div className="text-[11px] text-slate-500">{t.issueCategory || 'Hardware'}</div>
                    </td>

                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded font-medium text-[11px] ${
                        t.priority === 'High' ? 'bg-rose-500/20 text-rose-300' : 
                        t.priority === 'Medium' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {t.priority || 'Medium'}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <MaintenanceStatusBadge status={t.status} size="sm" />
                    </td>

                    <td className="p-3.5">
                      <div className="text-slate-300">{t.vendor || t.serviceVendor || 'Internal'}</div>
                      {(t.repairCost > 0 || t.cost > 0) && (
                        <div className="text-[11px] text-teal-400 font-semibold">₹{t.repairCost || t.cost}</div>
                      )}
                    </td>

                    <td className="p-3.5 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        {['Reported', 'Under Diagnosis', 'In Repair', 'Awaiting Vendor', 'Awaiting Parts', 'QC Pending'].includes(t.status) && (
                          <button
                            onClick={() => {
                              setSelectedTicket(t);
                              setShowQCModal(true);
                            }}
                            className="p-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20"
                            title="Perform QC Testing"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                        )}

                        {t.status === 'Ready' && (
                          <button
                            onClick={() => {
                              setSelectedTicket(t);
                              setShowReturnModal(true);
                            }}
                            className="p-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/20"
                            title="Return to Custodian / Stock"
                          >
                            <ArrowLeftRight className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setSelectedTicket(t);
                            setShowDetailsModal(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <MaintenanceForm
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadTickets();
          }}
        />
      )}

      {showDetailsModal && selectedTicket && (
        <MaintenanceDetailsModal
          isOpen={showDetailsModal}
          ticket={selectedTicket}
          onClose={() => setShowDetailsModal(false)}
          onUpdated={() => {
            setShowDetailsModal(false);
            loadTickets();
          }}
        />
      )}

      {showQCModal && selectedTicket && (
        <MaintenanceQCModal
          isOpen={showQCModal}
          ticket={selectedTicket}
          onClose={() => setShowQCModal(false)}
          onSuccess={() => {
            setShowQCModal(false);
            loadTickets();
          }}
        />
      )}

      {showReturnModal && selectedTicket && (
        <MaintenanceReturnModal
          isOpen={showReturnModal}
          ticket={selectedTicket}
          onClose={() => setShowReturnModal(false)}
          onSuccess={() => {
            setShowReturnModal(false);
            loadTickets();
          }}
        />
      )}
    </div>
  );
}
