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
  Cpu,
  User,
  Globe,
  Key,
  Receipt,
  Tag,
  FileText,
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

// 4. COMPREHENSIVE EDIT ASSET MODAL (ALL ASSET FIELDS)
export function EditAssetModal({ asset, employees = [], departments = [], locations = [], vendors = [], onClose, onSuccess }) {
  const { user } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("hardware"); // hardware | custody | network | software | procurement
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    // 1. Identification & Hardware
    assetNo: asset.assetNo || "",
    sr: asset.sr || "",
    make: asset.make || "",
    model: asset.model || "",
    deviceType: asset.deviceType || "Laptop",
    category: asset.category || "computing",
    processor: asset.processor || "",
    generation: asset.generation || "",
    ramSize: asset.ramSize || "",
    storage: asset.storage || "",
    storageType: asset.storageType || "",
    graphics: asset.graphics || "",
    monitorDetails: asset.monitorDetails || "",
    monitorSerialNo: asset.monitorSerialNo || "",
    accessories: asset.accessories || "",
    workingCondition: asset.workingCondition || "Good",
    dataBackup: asset.dataBackup || "Daily",
    upsCapacity: asset.upsCapacity || "",
    backupRuntime: asset.backupRuntime || "",
    pduOutlets: asset.pduOutlets || "",
    serverCpu: asset.serverCpu || "",
    serverRam: asset.serverRam || "",
    serverRaid: asset.serverRaid || "",
    portConfig: asset.portConfig || "",
    networkRole: asset.networkRole || "",

    // 2. Custodian & Allocation
    status: asset.status || "Available",
    userName: asset.userName || "Unassigned",
    empCode: asset.empCode || "",
    mailId: asset.mailId || "",
    officialNumber: asset.officialNumber || asset.phone || "",
    department: asset.department || COMPANY_DEPARTMENTS[0],
    plant: asset.plant || "Vitromed",
    assignedDate: asset.assignedDate ? (asset.assignedDate.includes('T') ? asset.assignedDate.split('T')[0] : asset.assignedDate) : "",

    // 3. Network, PC Group & Security
    hostName: asset.hostName || "",
    ipAddress: asset.ipAddress || "",
    macAddress: asset.macAddress || "",
    pcGroup: asset.pcGroup || "Workgroup",
    antivirus: asset.antivirus || "eScan",
    escanPolicy: asset.escanPolicy || "Profile",

    // 4. Operating System, Software & Credentials
    osVersion: asset.osVersion || "",
    windowsType: asset.windowsType || "OPEN OS",
    windowsKey: asset.windowsKey || "",
    officeSoftware: asset.officeSoftware || "",
    officeKey: asset.officeKey || "",
    mailSoftware: asset.mailSoftware || "",
    sapId: asset.sapId || "",
    otherSoftware: asset.otherSoftware || "",
    loginUserName: asset.loginUserName || "",
    loginPassword: asset.loginPassword || "",
    vncPassword: asset.vncPassword || "",

    // 5. Procurement, Billing & Warranty
    billNo: asset.billNo || "",
    billDate: asset.billDate ? (asset.billDate.includes('T') ? asset.billDate.split('T')[0] : asset.billDate) : "",
    warranty: asset.warranty || "",
    vendor: asset.vendor || "",
    poNumber: asset.poNumber || "",
    purchaseCost: asset.purchaseCost || "",
    remarks: asset.remarks || "",
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectEmployee = (empId) => {
    if (!empId) return;
    const emp = (employees || []).find((e) => e.employeeId === empId || e._id === empId);
    if (emp) {
      setForm((prev) => ({
        ...prev,
        userName: emp.name || prev.userName,
        empCode: emp.employeeId || prev.empCode,
        mailId: emp.email || prev.mailId,
        department: emp.department || prev.department,
        plant: emp.location || prev.plant,
        status: prev.status === "Available" ? "Assigned" : prev.status,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.make.trim() || !form.model.trim() || !form.sr.trim()) {
      return toast.error("Make, Model, and Serial Number are required");
    }
    setLoading(true);
    try {
      const res = await api.updateAsset(asset._id, {
        ...form,
        actorName: user?.name || "IT Admin",
      });
      toast.success("Asset specifications & details updated successfully", "Asset Updated");
      if (onSuccess) onSuccess(res.data);
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to save asset modifications", "Update Failed");
    } finally {
      setLoading(false);
    }
  };

  const depts = departments.length > 0 ? departments.map(d => d.name || d) : COMPANY_DEPARTMENTS;
  const plants = locations.length > 0 ? locations.map(l => l.name || l) : COMPANY_PLANTS;

  return (
    <ModalContainer
      title={`Edit Asset Details • ${form.make || ''} ${form.model || ''} (${form.assetNo || form.sr || 'Asset'})`}
      icon={Edit3}
      iconColor="#0284c7"
      onClose={onClose}
      maxWidth="860px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', maxHeight: '80vh' }}>
        {/* Navigation Tabs */}
        <div
          style={{
            display: "flex",
            gap: "0.35rem",
            padding: "0.6rem 1rem",
            backgroundColor: "var(--bg-surface-raised, #f8fafc)",
            borderBottom: "1px solid var(--border-default, #e2e8f0)",
            overflowX: "auto",
          }}
        >
          {[
            { id: "hardware", label: "1. Hardware & Specs", icon: Cpu, color: "#818cf8" },
            { id: "custody", label: "2. Custody & Status", icon: User, color: "#34d399" },
            { id: "network", label: "3. Network & Security", icon: Globe, color: "#38bdf8" },
            { id: "software", label: "4. OS, Software & Login", icon: Key, color: "#f59e0b" },
            { id: "procurement", label: "5. Invoice & Warranty", icon: Receipt, color: "#fbbf24" },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.45rem 0.75rem",
                  fontSize: "0.78rem",
                  fontWeight: isActive ? 700 : 500,
                  borderRadius: "6px",
                  border: isActive ? `1px solid ${tab.color}` : "1px solid transparent",
                  backgroundColor: isActive ? "rgba(2, 132, 199, 0.08)" : "transparent",
                  color: isActive ? "var(--text-primary, #0f172a)" : "var(--text-muted, #64748b)",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s ease",
                }}
              >
                <Icon size={14} color={isActive ? tab.color : "currentColor"} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="modal-body" style={{ overflowY: "auto", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          
          {/* TAB 1: HARDWARE & SYSTEM SPECIFICATIONS */}
          {activeTab === "hardware" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem" }}>
                <div className="form-group">
                  <label className="form-label">Asset Tag / Asset Number</label>
                  <input
                    type="text"
                    placeholder="e.g. AST-00123"
                    value={form.assetNo}
                    onChange={(e) => handleChange("assetNo", e.target.value)}
                    className="form-control"
                    style={{ fontFamily: "monospace", fontWeight: 600 }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Hardware Serial (S/N) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5CD2340XYZ"
                    value={form.sr}
                    onChange={(e) => handleChange("sr", e.target.value)}
                    className="form-control"
                    style={{ fontFamily: "monospace", fontWeight: 700, color: "#fbbf24" }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">System Brand / Make *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dell / HP / Lenovo / Numeric"
                    value={form.make}
                    onChange={(e) => handleChange("make", e.target.value)}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Model Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Latitude 3420 / OptiPlex 7090 / 600VA"
                    value={form.model}
                    onChange={(e) => handleChange("model", e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem" }}>
                <div className="form-group">
                  <label className="form-label">Device Type</label>
                  <input
                    type="text"
                    placeholder="e.g. Laptop / Desktop PC / UPS / Server"
                    value={form.deviceType}
                    onChange={(e) => handleChange("deviceType", e.target.value)}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Working Condition</label>
                  <select
                    value={form.workingCondition}
                    onChange={(e) => handleChange("workingCondition", e.target.value)}
                    className="form-select"
                  >
                    <option value="Good">Good (Operational)</option>
                    <option value="Minor Wear">Minor Wear & Tear</option>
                    <option value="Needs Repair">Needs Repair / Service</option>
                    <option value="Damaged / Scrap">Damaged / Scrap</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Data Backup Policy</label>
                  <input
                    type="text"
                    placeholder="e.g. Daily / Weekly / None"
                    value={form.dataBackup}
                    onChange={(e) => handleChange("dataBackup", e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>

              {/* Computing Specs */}
              <div style={{ padding: "0.85rem", backgroundColor: "var(--bg-surface-raised, #f8fafc)", borderRadius: "8px", border: "1px solid var(--border-subtle, #e2e8f0)" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#818cf8", display: "block", marginBottom: "0.6rem" }}>
                  Processor, Memory & Storage Details
                </span>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem" }}>
                  <div className="form-group">
                    <label className="form-label">Processor / CPU</label>
                    <input
                      type="text"
                      placeholder="e.g. Intel Core i5-12400"
                      value={form.processor}
                      onChange={(e) => handleChange("processor", e.target.value)}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Generation</label>
                    <input
                      type="text"
                      placeholder="e.g. 12th Gen / Ryzen 5"
                      value={form.generation}
                      onChange={(e) => handleChange("generation", e.target.value)}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">RAM / Memory</label>
                    <input
                      type="text"
                      placeholder="e.g. 16 GB DDR4"
                      value={form.ramSize}
                      onChange={(e) => handleChange("ramSize", e.target.value)}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Storage / Drive</label>
                    <input
                      type="text"
                      placeholder="e.g. 512 GB NVMe SSD"
                      value={form.storage}
                      onChange={(e) => handleChange("storage", e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem", marginTop: "0.6rem" }}>
                  <div className="form-group">
                    <label className="form-label">Display / Monitor Model</label>
                    <input
                      type="text"
                      placeholder="e.g. Dell 24 Inch FHD"
                      value={form.monitorDetails}
                      onChange={(e) => handleChange("monitorDetails", e.target.value)}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Display Serial No (S/N)</label>
                    <input
                      type="text"
                      placeholder="Display S/N"
                      value={form.monitorSerialNo}
                      onChange={(e) => handleChange("monitorSerialNo", e.target.value)}
                      className="form-control"
                      style={{ fontFamily: "monospace" }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Accessories & Peripherals</label>
                    <input
                      type="text"
                      placeholder="e.g. Mouse, Laptop Bag, Power Adapter"
                      value={form.accessories}
                      onChange={(e) => handleChange("accessories", e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>
              </div>

              {/* Power / Specialized Specs */}
              {(form.deviceType.toLowerCase().includes('ups') || form.deviceType.toLowerCase().includes('inverter') || form.upsCapacity) && (
                <div style={{ padding: "0.85rem", backgroundColor: "var(--bg-surface-raised, #f8fafc)", borderRadius: "8px", border: "1px solid var(--border-subtle, #e2e8f0)" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#f87171", display: "block", marginBottom: "0.6rem" }}>
                    UPS & Power Equipment Parameters
                  </span>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem" }}>
                    <div className="form-group">
                      <label className="form-label">UPS Capacity / Rating</label>
                      <input
                        type="text"
                        placeholder="e.g. 600VA / 10kVA"
                        value={form.upsCapacity}
                        onChange={(e) => handleChange("upsCapacity", e.target.value)}
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Backup Runtime</label>
                      <input
                        type="text"
                        placeholder="e.g. 20-30 Mins"
                        value={form.backupRuntime}
                        onChange={(e) => handleChange("backupRuntime", e.target.value)}
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">PDU Outlets</label>
                      <input
                        type="text"
                        placeholder="e.g. 4x Sockets"
                        value={form.pduOutlets}
                        onChange={(e) => handleChange("pduOutlets", e.target.value)}
                        className="form-control"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CUSTODIAN & ALLOCATION */}
          {activeTab === "custody" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem" }}>
                <div className="form-group">
                  <label className="form-label">Asset Lifecycle Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                    className="form-select"
                    style={{ fontWeight: 700 }}
                  >
                    <option value="Available">Available (In Stock)</option>
                    <option value="Assigned">Assigned (In Use)</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Retired">Retired / Scrapped</option>
                    <option value="In Repair">In Repair</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Quick Select Employee Profile</label>
                  <select
                    onChange={(e) => handleSelectEmployee(e.target.value)}
                    className="form-select"
                  >
                    <option value="">-- Choose Existing Employee --</option>
                    {employees.map((emp) => (
                      <option key={emp._id || emp.employeeId} value={emp.employeeId || emp._id}>
                        {emp.name} ({emp.employeeId || 'No ID'}) - {emp.department}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem" }}>
                <div className="form-group">
                  <label className="form-label">Assigned User Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Nirmal Sharma / Unassigned"
                    value={form.userName}
                    onChange={(e) => handleChange("userName", e.target.value)}
                    className="form-control"
                    style={{ fontWeight: 600 }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Employee Code</label>
                  <input
                    type="text"
                    placeholder="e.g. os1154"
                    value={form.empCode}
                    onChange={(e) => handleChange("empCode", e.target.value)}
                    className="form-control"
                    style={{ fontFamily: "monospace" }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Official Email ID</label>
                  <input
                    type="email"
                    placeholder="e.g. nirmal@vitromed.com"
                    value={form.mailId}
                    onChange={(e) => handleChange("mailId", e.target.value)}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Official Contact / Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. 8000929236"
                    value={form.officialNumber}
                    onChange={(e) => handleChange("officialNumber", e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem" }}>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select
                    value={form.department}
                    onChange={(e) => handleChange("department", e.target.value)}
                    className="form-select"
                  >
                    {depts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Plant / Facility Location</label>
                  <select
                    value={form.plant}
                    onChange={(e) => handleChange("plant", e.target.value)}
                    className="form-select"
                  >
                    {plants.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Custody Handover / Assigned Date</label>
                  <input
                    type="date"
                    value={form.assignedDate}
                    onChange={(e) => handleChange("assignedDate", e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NETWORK & SECURITY */}
          {activeTab === "network" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem" }}>
                <div className="form-group">
                  <label className="form-label">Host Name</label>
                  <input
                    type="text"
                    placeholder="e.g. CCTV / IT-DESK-01"
                    value={form.hostName}
                    onChange={(e) => handleChange("hostName", e.target.value)}
                    className="form-control"
                    style={{ fontFamily: "monospace", fontWeight: 600 }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Static / Assigned IP Address</label>
                  <input
                    type="text"
                    placeholder="e.g. 192.168.8.123"
                    value={form.ipAddress}
                    onChange={(e) => handleChange("ipAddress", e.target.value)}
                    className="form-control"
                    style={{ fontFamily: "monospace", fontWeight: 700, color: "#38bdf8" }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">MAC Address</label>
                  <input
                    type="text"
                    placeholder="e.g. 00:1A:2B:3C:4D:5E"
                    value={form.macAddress}
                    onChange={(e) => handleChange("macAddress", e.target.value)}
                    className="form-control"
                    style={{ fontFamily: "monospace" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem" }}>
                <div className="form-group">
                  <label className="form-label">PC Group / Domain</label>
                  <select
                    value={form.pcGroup}
                    onChange={(e) => handleChange("pcGroup", e.target.value)}
                    className="form-select"
                  >
                    <option value="Workgroup">Workgroup</option>
                    <option value="Domain">Domain</option>
                    <option value="Production">Production Plant</option>
                    <option value="CCTV">CCTV Network</option>
                    <option value="Quality">Quality Lab</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Antivirus Software</label>
                  <input
                    type="text"
                    placeholder="e.g. eScan / Windows Defender / Quick Heal"
                    value={form.antivirus}
                    onChange={(e) => handleChange("antivirus", e.target.value)}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">eScan / Security Policy</label>
                  <input
                    type="text"
                    placeholder="e.g. Profile / Production Policy / Default"
                    value={form.escanPolicy}
                    onChange={(e) => handleChange("escanPolicy", e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: OS, SOFTWARE & CREDENTIALS */}
          {activeTab === "software" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ padding: "0.85rem", backgroundColor: "var(--bg-surface-raised, #f8fafc)", borderRadius: "8px", border: "1px solid var(--border-subtle, #e2e8f0)" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#f59e0b", display: "block", marginBottom: "0.6rem" }}>
                  Operating System & Productivity Licensing
                </span>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem" }}>
                  <div className="form-group">
                    <label className="form-label">Operating System</label>
                    <input
                      type="text"
                      placeholder="e.g. Windows 10 Professional 64-bit"
                      value={form.osVersion}
                      onChange={(e) => handleChange("osVersion", e.target.value)}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Windows License Type</label>
                    <select
                      value={form.windowsType}
                      onChange={(e) => handleChange("windowsType", e.target.value)}
                      className="form-select"
                    >
                      <option value="OPEN OS">OPEN OS</option>
                      <option value="OEM">OEM Factory Licensed</option>
                      <option value="Volume License">Volume License (VL)</option>
                      <option value="Retail">Retail</option>
                      <option value="DOS / None">DOS / None</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Windows Product Key</label>
                    <input
                      type="text"
                      placeholder="XXXXX-XXXXX-XXXXX-XXXXX"
                      value={form.windowsKey}
                      onChange={(e) => handleChange("windowsKey", e.target.value)}
                      className="form-control"
                      style={{ fontFamily: "monospace" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem", marginTop: "0.6rem" }}>
                  <div className="form-group">
                    <label className="form-label">MS Office Suite</label>
                    <input
                      type="text"
                      placeholder="e.g. MS Office 2013 Std / Office 2021"
                      value={form.officeSoftware}
                      onChange={(e) => handleChange("officeSoftware", e.target.value)}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Office Product Key</label>
                    <input
                      type="text"
                      placeholder="XXXXX-XXXXX-XXXXX-XXXXX"
                      value={form.officeKey}
                      onChange={(e) => handleChange("officeKey", e.target.value)}
                      className="form-control"
                      style={{ fontFamily: "monospace" }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mail Client</label>
                    <input
                      type="text"
                      placeholder="e.g. Online WPA / MS Outlook"
                      value={form.mailSoftware}
                      onChange={(e) => handleChange("mailSoftware", e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem", marginTop: "0.6rem" }}>
                  <div className="form-group">
                    <label className="form-label">SAP User ID</label>
                    <input
                      type="text"
                      placeholder="SAP ID if applicable"
                      value={form.sapId}
                      onChange={(e) => handleChange("sapId", e.target.value)}
                      className="form-control"
                      style={{ fontFamily: "monospace" }}
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Other Software / Applications</label>
                    <input
                      type="text"
                      placeholder="e.g. AutoCAD, CorelDraw, Tally"
                      value={form.otherSoftware}
                      onChange={(e) => handleChange("otherSoftware", e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>
              </div>

              {/* Local Machine Credentials */}
              <div style={{ padding: "0.85rem", backgroundColor: "var(--bg-surface-raised, #f8fafc)", borderRadius: "8px", border: "1px solid var(--border-subtle, #e2e8f0)" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#ef4444", display: "block", marginBottom: "0.6rem" }}>
                  Local Machine Credentials & Remote Access
                </span>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem" }}>
                  <div className="form-group">
                    <label className="form-label">Local Login Username</label>
                    <input
                      type="text"
                      placeholder="e.g. Vitromed / Administrator"
                      value={form.loginUserName}
                      onChange={(e) => handleChange("loginUserName", e.target.value)}
                      className="form-control"
                      style={{ fontFamily: "monospace" }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Machine Login Password</label>
                    <input
                      type="text"
                      placeholder="Login password"
                      value={form.loginPassword}
                      onChange={(e) => handleChange("loginPassword", e.target.value)}
                      className="form-control"
                      style={{ fontFamily: "monospace" }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">VNC / Remote Access Password</label>
                    <input
                      type="text"
                      placeholder="VNC password"
                      value={form.vncPassword}
                      onChange={(e) => handleChange("vncPassword", e.target.value)}
                      className="form-control"
                      style={{ fontFamily: "monospace" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PROCUREMENT, BILLING & WARRANTY */}
          {activeTab === "procurement" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem" }}>
                <div className="form-group">
                  <label className="form-label">Invoice / Bill Copy Number</label>
                  <input
                    type="text"
                    placeholder="e.g. pi/2026-27/310"
                    value={form.billNo}
                    onChange={(e) => handleChange("billNo", e.target.value)}
                    className="form-control"
                    style={{ fontFamily: "monospace", fontWeight: 600 }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Invoice / Purchase Date</label>
                  <input
                    type="date"
                    value={form.billDate}
                    onChange={(e) => handleChange("billDate", e.target.value)}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Warranty Details</label>
                  <input
                    type="text"
                    placeholder="e.g. 2 Years Comprehensive On-Site OEM"
                    value={form.warranty}
                    onChange={(e) => handleChange("warranty", e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem" }}>
                <div className="form-group">
                  <label className="form-label">Vendor / Source Supplier</label>
                  <input
                    type="text"
                    placeholder="e.g. Prince Infosys"
                    value={form.vendor}
                    onChange={(e) => handleChange("vendor", e.target.value)}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Purchase Order (PO) Number</label>
                  <input
                    type="text"
                    placeholder="e.g. PO-2026-0094"
                    value={form.poNumber}
                    onChange={(e) => handleChange("poNumber", e.target.value)}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Purchase Cost (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 45000"
                    value={form.purchaseCost}
                    onChange={(e) => handleChange("purchaseCost", e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">General Asset Remarks & Audit Notes</label>
                <textarea
                  placeholder="Notes, allocation history, physical condition remarks..."
                  value={form.remarks}
                  onChange={(e) => handleChange("remarks", e.target.value)}
                  className="form-control"
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ borderTop: "1px solid var(--border-default, #e2e8f0)", padding: "0.85rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
            Editing: <strong>{form.make} {form.model}</strong> • S/N: <span style={{ fontFamily: "monospace" }}>{form.sr}</span>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={loading} style={{ minWidth: "120px" }}>
              {loading ? "Saving Changes..." : "Save Asset Info"}
            </button>
          </div>
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
