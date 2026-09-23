import React, { useState } from "react";
import {
  X,
  UserCheck,
  ArrowRightLeft,
  Undo2,
  AlertCircle,
  Laptop,
  Edit3,
  Wrench,
  CheckCircle2,
  Plus,
  Shield,
  Trash2,
} from "lucide-react";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../common/Toast";
import { COMPANY_DEPARTMENTS, COMPANY_PLANTS } from "../../constants/organization";

// Modal Wrapper Component
function ModalContainer({ title, icon: Icon, iconColor = "#38bdf8", onClose, children, maxWidth = "540px" }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth }}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {Icon && <Icon size={18} color={iconColor} />}
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0 }}>{title}</h3>
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-icon btn-xs">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// 1. ASSIGN MODAL
export function AssignModal({ asset, employees = [], departments = [], locations = [], onClose, onSuccess }) {
  const { user } = useAuth();
  const toast = useToast();
  const [mode, setMode] = useState("select");
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [manual, setManual] = useState({
    name: "",
    empCode: "",
    email: "",
    dept: asset.department || COMPANY_DEPARTMENTS[0],
    plant: "Vitromed",
  });
  const [assignedDate, setAssignedDate] = useState(new Date().toISOString().split("T")[0]);
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let target = { ...manual };
    if (mode === "select") {
      const emp = employees.find((e) => e.employeeId === selectedEmpId || e._id === selectedEmpId);
      if (!emp) return toast.error("Please select an employee");
      target = { name: emp.name, empCode: emp.employeeId, email: emp.email, dept: emp.department, plant: emp.location || "Vitromed" };
    }

    setLoading(true);
    try {
      const res = await api.assignAsset(asset._id, {
        userName: target.name,
        empCode: target.empCode,
        mailId: target.email,
        department: target.dept,
        plant: target.plant,
        assignedDate,
        remarks,
        actorName: user?.name || "IT Admin",
      });
      toast.success(`Allocated to ${target.name}!`, "Asset Assigned");
      if (onSuccess) onSuccess(res.data);
      onClose();
    } catch (err) {
      toast.error(err.message, "Assignment Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalContainer title="Assign Hardware Custodian" icon={UserCheck} iconColor="#34d399" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ padding: "0.65rem 0.85rem", backgroundColor: "var(--bg-surface-raised)", borderRadius: "6px", fontSize: "0.82rem" }}>
            <strong>{asset.make} {asset.model}</strong> • Tag: <span style={{ fontFamily: "monospace", color: "#0284c7" }}>#{asset.assetNo || asset.sr}</span>
          </div>

          <div style={{ display: "flex", backgroundColor: "var(--bg-surface-raised)", padding: "2px", borderRadius: "6px" }}>
            <button type="button" onClick={() => setMode("select")} className={`btn btn-sm ${mode === "select" ? "btn-primary" : "btn-ghost"}`} style={{ flex: 1 }}>
              Select Staff Member
            </button>
            <button type="button" onClick={() => setMode("manual")} className={`btn btn-sm ${mode === "manual" ? "btn-primary" : "btn-ghost"}`} style={{ flex: 1 }}>
              Enter Manually
            </button>
          </div>

          {mode === "select" ? (
            <div className="form-group">
              <label className="form-label">Select Employee *</label>
              <select value={selectedEmpId} onChange={(e) => setSelectedEmpId(e.target.value)} required className="form-select">
                <option value="">-- Choose Employee ({employees.length}) --</option>
                {employees.map((emp) => (
                  <option key={emp._id || emp.employeeId} value={emp.employeeId}>
                    {emp.name} ({emp.employeeId || "No ID"}) - {emp.department}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input type="text" required value={manual.name} onChange={(e) => setManual({ ...manual, name: e.target.value })} className="form-control" />
              </div>
              <div className="form-group">
                <label className="form-label">Employee Code</label>
                <input type="text" value={manual.empCode} onChange={(e) => setManual({ ...manual, empCode: e.target.value })} className="form-control" />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Assignment Date</label>
            <input type="date" value={assignedDate} onChange={(e) => setAssignedDate(e.target.value)} className="form-control" />
          </div>

          <div className="form-group">
            <label className="form-label">Remarks / Notes</label>
            <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Condition, handover notes..." className="form-control" rows={2} />
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn btn-secondary btn-sm" disabled={loading}>Cancel</button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>{loading ? "Assigning..." : "Assign Custodian"}</button>
        </div>
      </form>
    </ModalContainer>
  );
}

// 2. TRANSFER MODAL
export function TransferModal({ asset, employees = [], departments = [], locations = [], onClose, onSuccess }) {
  const { user } = useAuth();
  const toast = useToast();
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split("T")[0]);
  const [transferReason, setTransferReason] = useState("Employee Transfer");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTransfer = async (e) => {
    e.preventDefault();
    const emp = employees.find((e) => e.employeeId === selectedEmpId || e._id === selectedEmpId);
    if (!emp) return toast.error("Please select a target employee");

    setLoading(true);
    try {
      const res = await api.transferAsset(asset._id, {
        newUserName: emp.name,
        newEmpCode: emp.employeeId,
        newMailId: emp.email || "",
        newDepartment: emp.department || asset.department,
        newLocation: emp.location || asset.plant,
        transferDate,
        transferReason,
        remarks,
        actorName: user?.name || "IT Admin",
      });
      toast.success(`Custody transferred to ${emp.name}!`, "Asset Transferred");
      if (onSuccess) onSuccess(res.data);
      onClose();
    } catch (err) {
      toast.error(err.message, "Transfer Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalContainer title="Transfer Hardware Custody" icon={ArrowRightLeft} onClose={onClose}>
      <form onSubmit={handleTransfer}>
        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ padding: "0.65rem 0.85rem", backgroundColor: "var(--bg-surface-raised)", borderRadius: "6px", fontSize: "0.82rem" }}>
            Current: <strong>{asset.userName}</strong> ({asset.department} • {asset.plant})
          </div>

          <div className="form-group">
            <label className="form-label">Transfer To *</label>
            <select value={selectedEmpId} onChange={(e) => setSelectedEmpId(e.target.value)} required className="form-select">
              <option value="">-- Choose New Custodian --</option>
              {employees.filter((e) => e.name !== asset.userName).map((emp) => (
                <option key={emp._id || emp.employeeId} value={emp.employeeId}>
                  {emp.name} ({emp.employeeId || "No ID"}) - {emp.department}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Transfer Date</label>
            <input type="date" value={transferDate} onChange={(e) => setTransferDate(e.target.value)} className="form-control" />
          </div>

          <div className="form-group">
            <label className="form-label">Transfer Reason</label>
            <input type="text" value={transferReason} onChange={(e) => setTransferReason(e.target.value)} className="form-control" />
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn btn-secondary btn-sm" disabled={loading}>Cancel</button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>{loading ? "Transferring..." : "Complete Handover"}</button>
        </div>
      </form>
    </ModalContainer>
  );
}

// 3. RETURN MODAL
export function ReturnModal({ asset, onClose, onSuccess }) {
  const { user } = useAuth();
  const toast = useToast();
  const [returnCondition, setReturnCondition] = useState("Good");
  const [returnLocation, setReturnLocation] = useState(asset.plant || "Vitromed");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReturn = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.returnAsset(asset._id, {
        returnCondition,
        returnLocation,
        remarks,
        actorName: user?.name || "IT Admin",
      });
      toast.success("Asset returned to inventory pool", "Asset Returned");
      if (onSuccess) onSuccess(res.data);
      onClose();
    } catch (err) {
      toast.error(err.message, "Return Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalContainer title="Return Asset to Inventory" icon={Undo2} iconColor="#fbbf24" onClose={onClose}>
      <form onSubmit={handleReturn}>
        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0 }}>
            Return <strong>{asset.make} {asset.model}</strong> from <strong>{asset.userName}</strong> back to stock.
          </p>

          <div className="form-group">
            <label className="form-label">Return Working Condition</label>
            <select value={returnCondition} onChange={(e) => setReturnCondition(e.target.value)} className="form-select">
              <option value="Good">Good (Ready for Reassignment)</option>
              <option value="Minor Wear">Minor Wear & Tear</option>
              <option value="Needs Repair">Needs Repair / Maintenance</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Stock Location</label>
            <select value={returnLocation} onChange={(e) => setReturnLocation(e.target.value)} className="form-select">
              <option value="Vitromed">Vitromed IT Stockroom</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Return Notes</label>
            <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Physical condition, accessories returned..." className="form-control" rows={2} />
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn btn-secondary btn-sm" disabled={loading}>Cancel</button>
          <button type="submit" className="btn btn-warning btn-sm" disabled={loading}>{loading ? "Processing..." : "Return to Stock"}</button>
        </div>
      </form>
    </ModalContainer>
  );
}

// 4. EDIT ASSET MODAL
export function EditAssetModal({ asset, departments = [], locations = [], onClose, onSuccess }) {
  const { user } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    make: asset.make || "",
    model: asset.model || "",
    sr: asset.sr || "",
    plant: asset.plant || "Vitromed",
    department: asset.department || COMPANY_DEPARTMENTS[0],
    deviceType: asset.deviceType || "Laptop",
    status: asset.status || "Available",
    processor: asset.processor || "",
    ramSize: asset.ramSize || "",
    storage: asset.storage || "",
    osVersion: asset.osVersion || "",
    ipAddress: asset.ipAddress || "",
    hostName: asset.hostName || "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.make.trim() || !form.model.trim() || !form.sr.trim()) {
      return toast.error("Make, Model, and Serial Number are required");
    }
    setLoading(true);
    try {
      const res = await api.updateAsset(asset._id, { ...form, actorName: user?.name || "IT Admin" });
      toast.success("Asset specifications updated successfully");
      if (onSuccess) onSuccess(res.data);
      onClose();
    } catch (err) {
      toast.error(err.message, "Update Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalContainer title="Edit Hardware Asset" icon={Edit3} onClose={onClose} maxWidth="600px">
      <form onSubmit={handleSubmit}>
        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div className="form-group">
              <label className="form-label">Make *</label>
              <input type="text" required value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} className="form-control" />
            </div>
            <div className="form-group">
              <label className="form-label">Model *</label>
              <input type="text" required value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} className="form-control" />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div className="form-group">
              <label className="form-label">Serial Number (SR) *</label>
              <input type="text" required value={form.sr} onChange={(e) => setForm({ ...form, sr: e.target.value })} className="form-control" />
            </div>
            <div className="form-group">
              <label className="form-label">Device Type</label>
              <input type="text" value={form.deviceType} onChange={(e) => setForm({ ...form, deviceType: e.target.value })} className="form-control" />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
            <div className="form-group">
              <label className="form-label">Processor</label>
              <input type="text" value={form.processor} onChange={(e) => setForm({ ...form, processor: e.target.value })} className="form-control" />
            </div>
            <div className="form-group">
              <label className="form-label">RAM</label>
              <input type="text" value={form.ramSize} onChange={(e) => setForm({ ...form, ramSize: e.target.value })} className="form-control" />
            </div>
            <div className="form-group">
              <label className="form-label">Storage</label>
              <input type="text" value={form.storage} onChange={(e) => setForm({ ...form, storage: e.target.value })} className="form-control" />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div className="form-group">
              <label className="form-label">Department</label>
              <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="form-select">
                {COMPANY_DEPARTMENTS.map((dept) => <option key={dept} value={dept}>{dept}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="form-select">
                <option value="Available">Available</option>
                <option value="Assigned">Assigned</option>
                <option value="Under Maintenance">Under Maintenance</option>
                <option value="Retired">Retired</option>
              </select>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn btn-secondary btn-sm" disabled={loading}>Cancel</button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</button>
        </div>
      </form>
    </ModalContainer>
  );
}

// 5. QUICK MAINTENANCE MODAL
export function QuickMaintenanceModal({ asset, onClose, onSuccess }) {
  const { user } = useAuth();
  const toast = useToast();
  const [issueDescription, setIssueDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!issueDescription.trim()) return toast.error("Please enter issue details");
    setLoading(true);
    try {
      await api.reportAssetIssue(asset._id, {
        issueDescription,
        priority,
        reportedBy: user?.name || "IT Admin",
      });
      toast.success("Maintenance ticket logged successfully");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message, "Ticket Creation Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalContainer title="Log Maintenance Ticket" icon={Wrench} iconColor="#ef4444" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="form-group">
            <label className="form-label">Issue Description *</label>
            <textarea value={issueDescription} onChange={(e) => setIssueDescription(e.target.value)} required placeholder="Describe symptoms, boot failures, physical damage..." className="form-control" rows={3} />
          </div>

          <div className="form-group">
            <label className="form-label">Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className="form-select">
              <option value="Low">Low (Non-urgent)</option>
              <option value="Medium">Medium (Standard)</option>
              <option value="High">High (Immediate Action Required)</option>
            </select>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn btn-secondary btn-sm" disabled={loading}>Cancel</button>
          <button type="submit" className="btn btn-danger btn-sm" disabled={loading}>{loading ? "Logging..." : "Create Ticket"}</button>
        </div>
      </form>
    </ModalContainer>
  );
}

// 6. MAINTENANCE RETURN MODAL
export function MaintenanceReturnModal({ asset, onClose, onSuccess }) {
  const { user } = useAuth();
  const toast = useToast();
  const [resolution, setResolution] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.returnFromMaintenance(asset._id, {
        resolution: resolution || "Repaired and returned to inventory pool",
        actorName: user?.name || "IT Admin",
      });
      toast.success("Asset restored from maintenance to active pool");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message, "Resolution Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalContainer title="Complete Maintenance & Restore" icon={CheckCircle2} iconColor="#10b981" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="form-group">
            <label className="form-label">Repair Resolution Notes</label>
            <textarea value={resolution} onChange={(e) => setResolution(e.target.value)} placeholder="Parts replaced, OS reinstalled, diagnostic test pass..." className="form-control" rows={3} />
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn btn-secondary btn-sm" disabled={loading}>Cancel</button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>{loading ? "Restoring..." : "Restore to Stock"}</button>
        </div>
      </form>
    </ModalContainer>
  );
}

// 7. RETIRE ASSET MODAL
export function RetireAssetModal({ asset, onClose, onSuccess }) {
  const { user } = useAuth();
  const toast = useToast();
  const [reason, setReason] = useState("End of Lifecycle / Obsolete");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.retireAsset(asset._id, { reason, actorName: user?.name || "IT Admin" });
      toast.success("Asset retired from active inventory");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message, "Retire Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalContainer title="Retire Asset from Fleet" icon={Trash2} iconColor="#ef4444" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0 }}>
            Are you sure you want to retire <strong>{asset.make} {asset.model}</strong> (#{asset.assetNo || asset.sr})?
          </p>

          <div className="form-group">
            <label className="form-label">Retirement Reason</label>
            <select value={reason} onChange={(e) => setReason(e.target.value)} className="form-select">
              <option value="End of Lifecycle / Obsolete">End of Lifecycle / Obsolete</option>
              <option value="Damaged Beyond Repair">Damaged Beyond Repair</option>
              <option value="Scrapped / Recycled">Scrapped / Recycled</option>
              <option value="Sold / Transferred Off-Premises">Sold / Transferred Off-Premises</option>
            </select>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn btn-secondary btn-sm" disabled={loading}>Cancel</button>
          <button type="submit" className="btn btn-danger btn-sm" disabled={loading}>{loading ? "Retiring..." : "Retire Hardware"}</button>
        </div>
      </form>
    </ModalContainer>
  );
}
