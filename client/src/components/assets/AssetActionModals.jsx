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
  User,
  Cpu,
  Globe,
  Key,
  FileText,
  Shield,
  Layers,
  HardDrive,
  Calendar,
  DollarSign,
  Tag,
  Building2,
  MapPin,
} from "lucide-react";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../common/Toast";
import { COMPANY_DEPARTMENTS, COMPANY_PLANTS } from "../../constants/organization";

const formatDateInput = (d) => {
  if (!d) return "";
  try {
    return new Date(d).toISOString().split("T")[0];
  } catch {
    return "";
  }
};

// ----------------- ASSIGN MODAL -----------------
export function AssignModal({
  asset,
  employees = [],
  departments = [],
  locations = [],
  onClose,
  onSuccess,
}) {
  const { user } = useAuth();
  const toast = useToast();

  const [mode, setMode] = useState("select"); // "select" | "manual"
  const [selectedEmpId, setSelectedEmpId] = useState("");
  
  // Manual entry fields
  const [manualName, setManualName] = useState("");
  const [manualEmpCode, setManualEmpCode] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [manualDept, setManualDept] = useState(asset.department || COMPANY_DEPARTMENTS[0]);
  const [manualPlant, setManualPlant] = useState("Vitromed");
  const [floorCabin, setFloorCabin] = useState(asset.floorCabin || "Main Floor");

  const [expectedReturnDate, setExpectedReturnDate] = useState("");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let targetName = "";
    let targetCode = "";
    let targetEmail = "";
    let targetDept = manualDept;
    let targetPlant = manualPlant;

    if (mode === "select") {
      const emp = employees.find((e) => e.employeeId === selectedEmpId || e._id === selectedEmpId);
      if (!emp) {
        return toast.error("Please select an employee or switch to Enter Manually");
      }
      targetName = emp.name;
      targetCode = emp.employeeId;
      targetEmail = emp.email || "";
      targetDept = emp.department || asset.department;
      targetPlant = emp.location || asset.plant;
    } else {
      if (!manualName.trim()) {
        return toast.error("Please enter the custodian full name");
      }
      targetName = manualName.trim();
      targetCode = manualEmpCode.trim() || ("VIT-" + Math.floor(1000 + Math.random() * 9000));
      targetEmail = manualEmail.trim() || (targetName.toLowerCase().replace(/[^a-z0-9]/g, "") + "@vitromed.com");
    }

    setLoading(true);
    try {
      await api.assignAsset(asset._id, {
        userName: targetName,
        empCode: targetCode,
        mailId: targetEmail,
        department: targetDept,
        plant: targetPlant,
        floorCabin,
        expectedReturnDate,
        remarks: remarks || ("Assigned to " + targetName + " by " + (user?.name || "IT Admin")),
        actorName: user?.name || "IT Admin",
      });

      toast.success("Asset successfully allocated to " + targetName + "!", "Asset Assigned");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message, "Assignment Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "580px" }}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <UserCheck size={18} color="#34d399" />
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700 }}>Allocate Hardware to Custodian</h3>
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-icon btn-xs">
            <X size={16} />
          </button>
        </div>

        {/* Selected Asset Header Preview */}
        <div
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "rgba(9, 15, 26, 0.5)",
            borderBottom: "1px solid var(--border-default)",
          }}
        >
          <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
            {asset.make} {asset.model}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#818cf8", fontFamily: "var(--font-mono)" }}>
            Tag: {asset.assetNo || "AST-N/A"} • S/N: {asset.sr} • Current Plant: {asset.plant || "Vitromed"}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Toggle Mode: Directory vs Manual */}
            <div
              style={{
                display: "flex",
                backgroundColor: "rgba(0, 0, 0, 0.3)",
                padding: "3px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <button
                type="button"
                onClick={() => setMode("select")}
                style={{
                  flex: 1,
                  padding: "0.35rem 0.5rem",
                  fontSize: "0.8rem",
                  fontWeight: mode === "select" ? 700 : 500,
                  backgroundColor: mode === "select" ? "var(--color-primary)" : "transparent",
                  color: mode === "select" ? "#fff" : "var(--text-muted)",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                Choose from Staff Directory ({employees.length})
              </button>
              <button
                type="button"
                onClick={() => setMode("manual")}
                style={{
                  flex: 1,
                  padding: "0.35rem 0.5rem",
                  fontSize: "0.8rem",
                  fontWeight: mode === "manual" ? 700 : 500,
                  backgroundColor: mode === "manual" ? "var(--color-primary)" : "transparent",
                  color: mode === "manual" ? "#fff" : "var(--text-muted)",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                + Enter Custodian Manually
              </button>
            </div>

            {mode === "select" ? (
              <div className="form-group">
                <label className="form-label">
                  Select Employee Custodian <span style={{ color: "#f87171" }}>*</span>
                </label>
                <select
                  required
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="form-select"
                >
                  <option value="">-- Choose Employee ({employees.length} available) --</option>
                  {employees.map((emp) => (
                    <option key={emp._id || emp.employeeId} value={emp.employeeId}>
                      {emp.name} ({emp.employeeId}) • {emp.department} • {emp.location}
                    </option>
                  ))}
                </select>
                {employees.length === 0 && (
                  <div style={{ fontSize: "0.75rem", color: "#fbbf24", marginTop: "0.35rem" }}>
                    Staff directory is currently empty. Click "Enter Custodian Manually" above to assign.
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div className="form-group">
                    <label className="form-label">
                      Full Name <span style={{ color: "#f87171" }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Sharma"
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Employee Code / ID</label>
                    <input
                      type="text"
                      placeholder="e.g. VIT-1045"
                      value={manualEmpCode}
                      onChange={(e) => setManualEmpCode(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div className="form-group">
                    <label className="form-label">Work Email</label>
                    <input
                      type="email"
                      placeholder="e.g. ramesh@vitromed.com"
                      value={manualEmail}
                      onChange={(e) => setManualEmail(e.target.value)}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cabin / Desk / Floor</label>
                    <input
                      type="text"
                      placeholder="e.g. 1st Floor, Bay B"
                      value={floorCabin}
                      onChange={(e) => setFloorCabin(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <select
                      value={manualDept}
                      onChange={(e) => setManualDept(e.target.value)}
                      className="form-select"
                    >
                      {COMPANY_DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Plant / Facility</label>
                    <select
                      value={manualPlant}
                      onChange={(e) => setManualPlant(e.target.value)}
                      className="form-select"
                    >
                      <option value="Vitromed">Vitromed</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Expected Handover / Return Date</label>
              <input
                type="date"
                value={expectedReturnDate}
                onChange={(e) => setExpectedReturnDate(e.target.value)}
                className="form-control"
                style={{ colorScheme: "dark" }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Handover Checklist & Allocation Remarks</label>
              <textarea
                rows={2}
                placeholder="e.g. Issued with power adapter, mouse, and carrying bag. Verified working condition."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="form-control"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-outline btn-sm">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary btn-sm">
              {loading ? "Allocating..." : "Confirm Allocation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ----------------- TRANSFER MODAL -----------------
export function TransferModal({
  asset,
  employees = [],
  departments = [],
  locations = [],
  onClose,
  onSuccess,
}) {
  const { user } = useAuth();
  const toast = useToast();

  const [mode, setMode] = useState("select"); // "select" | "manual"
  const [newEmpId, setNewEmpId] = useState("");
  
  // Manual transfer fields
  const [manualName, setManualName] = useState("");
  const [manualEmpCode, setManualEmpCode] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [manualDept, setManualDept] = useState(asset.department || COMPANY_DEPARTMENTS[0]);
  const [manualPlant, setManualPlant] = useState("Vitromed");

  const [transferReason, setTransferReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTransfer = async (e) => {
    e.preventDefault();

    let targetName = "";
    let targetCode = "";
    let targetEmail = "";
    let targetDept = manualDept;
    let targetPlant = manualPlant;

    if (mode === "select") {
      const emp = employees.find((e) => e.employeeId === newEmpId || e._id === newEmpId);
      if (!emp) {
        return toast.error("Please select new employee recipient or enter details manually");
      }
      targetName = emp.name;
      targetCode = emp.employeeId;
      targetEmail = emp.email || "";
      targetDept = emp.department || asset.department;
      targetPlant = emp.location || asset.plant;
    } else {
      if (!manualName.trim()) {
        return toast.error("Please enter the recipient employee full name");
      }
      targetName = manualName.trim();
      targetCode = manualEmpCode.trim() || ("VIT-" + Math.floor(1000 + Math.random() * 9000));
      targetEmail = manualEmail.trim() || (targetName.toLowerCase().replace(/[^a-z0-9]/g, "") + "@vitromed.com");
    }

    setLoading(true);
    try {
      await api.transferAsset(asset._id, {
        newUserName: targetName,
        newEmpCode: targetCode,
        newMailId: targetEmail,
        newDepartment: targetDept,
        newLocation: targetPlant,
        transferReason: transferReason || ("Custody transferred from " + asset.userName + " to " + targetName + " by " + (user?.name || "IT Admin")),
        actorName: user?.name || "IT Admin",
      });

      toast.success("Custody transferred to " + targetName + " successfully!", "Asset Transferred");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message, "Transfer Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "580px" }}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ArrowRightLeft size={18} color="#818cf8" />
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700 }}>Transfer Hardware Custody</h3>
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-icon btn-xs">
            <X size={16} />
          </button>
        </div>

        <div
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "rgba(9, 15, 26, 0.5)",
            borderBottom: "1px solid var(--border-default)",
          }}
        >
          <div style={{ fontWeight: 600 }}>{asset.make} {asset.model}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Current Custodian: <strong style={{ color: "#38bdf8" }}>{asset.userName}</strong> ({asset.department} • {asset.plant})
          </div>
        </div>

        <form onSubmit={handleTransfer}>
          <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Mode switch */}
            <div
              style={{
                display: "flex",
                backgroundColor: "rgba(0, 0, 0, 0.3)",
                padding: "3px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <button
                type="button"
                onClick={() => setMode("select")}
                style={{
                  flex: 1,
                  padding: "0.35rem 0.5rem",
                  fontSize: "0.8rem",
                  fontWeight: mode === "select" ? 700 : 500,
                  backgroundColor: mode === "select" ? "var(--color-primary)" : "transparent",
                  color: mode === "select" ? "#fff" : "var(--text-muted)",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                Choose from Staff Directory
              </button>
              <button
                type="button"
                onClick={() => setMode("manual")}
                style={{
                  flex: 1,
                  padding: "0.35rem 0.5rem",
                  fontSize: "0.8rem",
                  fontWeight: mode === "manual" ? 700 : 500,
                  backgroundColor: mode === "manual" ? "var(--color-primary)" : "transparent",
                  color: mode === "manual" ? "#fff" : "var(--text-muted)",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                + Enter Recipient Manually
              </button>
            </div>

            {mode === "select" ? (
              <div className="form-group">
                <label className="form-label">
                  Transfer To Employee <span style={{ color: "#f87171" }}>*</span>
                </label>
                <select
                  required
                  value={newEmpId}
                  onChange={(e) => setNewEmpId(e.target.value)}
                  className="form-select"
                >
                  <option value="">-- Choose New Custodian ({employees.length} available) --</option>
                  {employees
                    .filter((emp) => emp.name !== asset.userName)
                    .map((emp) => (
                      <option key={emp._id || emp.employeeId} value={emp.employeeId}>
                        {emp.name} ({emp.employeeId}) • {emp.department} • {emp.location}
                      </option>
                    ))}
                </select>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div className="form-group">
                    <label className="form-label">
                      New Custodian Name <span style={{ color: "#f87171" }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Suresh Patel"
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Employee Code / ID</label>
                    <input
                      type="text"
                      placeholder="e.g. VIT-1088"
                      value={manualEmpCode}
                      onChange={(e) => setManualEmpCode(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div className="form-group">
                    <label className="form-label">New Department</label>
                    <select
                      value={manualDept}
                      onChange={(e) => setManualDept(e.target.value)}
                      className="form-select"
                    >
                      {COMPANY_DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">New Plant / Facility</label>
                    <select
                      value={manualPlant}
                      onChange={(e) => setManualPlant(e.target.value)}
                      className="form-select"
                    >
                      <option value="Vitromed">Vitromed</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Reason for Inter-Departmental Transfer</label>
              <textarea
                rows={2}
                placeholder="e.g. Employee departmental transfer, replacement of faulty unit, or plant reallocation."
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                className="form-control"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-outline btn-sm">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary btn-sm">
              {loading ? "Transferring..." : "Execute Transfer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ----------------- RETURN MODAL -----------------
export function ReturnModal({ asset, onClose, onSuccess }) {
  const { user } = useAuth();
  const toast = useToast();
  const [returnCondition, setReturnCondition] = useState("Good");
  const [returnNotes, setReturnNotes] = useState("");
  const [damageDetails, setDamageDetails] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReturn = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.returnAsset(asset._id, {
        returnCondition,
        workingCondition: returnCondition,
        notes: returnNotes || ("Returned to inventory by " + (asset.userName || "Employee")),
        remarks: returnNotes || ("Returned to inventory by " + (asset.userName || "Employee")),
        damageDetails: damageDetails || "",
        actorName: user?.name || "IT Admin",
      });

      toast.success("\"" + asset.make + " " + asset.model + "\" checked in to available stock!", "Asset Returned");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message, "Return Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "520px" }}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Undo2 size={18} color="#38bdf8" />
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700 }}>Asset Return & Stock Handover</h3>
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-icon btn-xs">
            <X size={16} />
          </button>
        </div>

        <div
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "rgba(9, 15, 26, 0.5)",
            borderBottom: "1px solid var(--border-default)",
          }}
        >
          <div style={{ fontWeight: 600 }}>{asset.make} {asset.model}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Returned by Custodian: <strong style={{ color: "var(--text-primary)" }}>{asset.userName}</strong> ({asset.department} • {asset.plant})
          </div>
        </div>

        <form onSubmit={handleReturn}>
          <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Inspected Physical Condition</label>
              <select
                value={returnCondition}
                onChange={(e) => setReturnCondition(e.target.value)}
                className="form-select"
              >
                <option value="Excellent">Excellent (Like New)</option>
                <option value="Good">Good (Normal Wear)</option>
                <option value="Needs Repair">Needs Repair / Diagnostics</option>
                <option value="Damaged">Damaged / Physical Fault</option>
              </select>
            </div>

            {returnCondition === "Damaged" && (
              <div className="form-group">
                <label className="form-label" style={{ color: "#f87171" }}>Damage Description</label>
                <input
                  type="text"
                  placeholder="e.g. Cracked bezel, missing keycap, faulty power port"
                  value={damageDetails}
                  onChange={(e) => setDamageDetails(e.target.value)}
                  className="form-control"
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Return Inspection Notes</label>
              <textarea
                rows={3}
                placeholder="e.g. Returned upon project handover. Checked power adapter, formatted OS, verified hardware."
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
                className="form-control"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-outline btn-sm">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary btn-sm">
              {loading ? "Processing..." : "Return to Available Stock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ----------------- FULL-ATTRIBUTE EDIT ASSET MODAL -----------------
export function EditAssetModal({
  asset,
  employees = [],
  departments = [],
  locations = [],
  onClose,
  onSuccess,
}) {
  const { user } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("custodian"); // custodian | hardware | network | software | procurement | notes

  const [formData, setFormData] = useState({
    // 1. Identification & Status
    make: asset.make || "",
    model: asset.model || "",
    deviceType: asset.deviceType || "Desktop",
    sr: asset.sr || "",
    assetNo: asset.assetNo || "",
    status: asset.status || "Available",
    workingCondition: asset.workingCondition || "Good",

    // 2. Custodian & Placement
    userName: asset.userName || "Unassigned",
    empCode: asset.empCode || "",
    mailId: asset.mailId || "",
    department: asset.department || COMPANY_DEPARTMENTS[0],
    plant: 'Vitromed',
    floorCabin: asset.floorCabin || "",
    assignedDate: formatDateInput(asset.assignedDate),
    expectedReturnDate: formatDateInput(asset.expectedReturnDate),

    // 3. Technical Specs
    processor: asset.processor || "",
    ramSize: asset.ramSize || "",
    storage: asset.storage || "",
    monitorDetails: asset.monitorDetails || "",
    monitorSerialNo: asset.monitorSerialNo || "",

    // 4. Network & Credentials
    hostName: asset.hostName || "",
    ipAddress: asset.ipAddress || "",
    macAddress: asset.macAddress || "",
    vncPassword: asset.vncPassword || "",

    // 5. Software & Licenses
    osVersion: asset.osVersion || "",
    windowsKey: asset.windowsKey || "",
    officeSoftware: asset.officeSoftware || "",
    officeKey: asset.officeKey || "",
    antivirus: asset.antivirus || "",
    antivirusKey: asset.antivirusKey || "",
    otherSoftware: asset.otherSoftware || "",

    // 6. Procurement & Financial
    billNo: asset.billNo || "",
    vendorName: asset.vendorName || "",
    purchasePrice: asset.purchasePrice || 0,
    currentValue: asset.currentValue || 0,
    purchaseDate: formatDateInput(asset.purchaseDate),
    deliveryDate: formatDateInput(asset.deliveryDate),
    warrantyDetails: asset.warrantyDetails || "",
    warrantyStartDate: formatDateInput(asset.warrantyStartDate),
    warrantyEndDate: formatDateInput(asset.warrantyEndDate),
    invoiceImage: asset.invoiceImage || "",

    // 7. Remarks
    remarks: asset.remarks || "",
    maintenanceNotes: asset.maintenanceNotes || "",
    serviceVendor: asset.serviceVendor || "",
    repairCost: asset.repairCost || 0,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? 0 : parseFloat(value)) : value,
    }));
  };

  // Quick autofill from selected staff member
  const handleSelectStaff = (empId) => {
    const emp = employees.find((e) => e.employeeId === empId || e._id === empId);
    if (emp) {
      setFormData((prev) => ({
        ...prev,
        userName: emp.name,
        empCode: emp.employeeId,
        mailId: emp.email || "",
        department: emp.department || prev.department,
        plant: emp.location || prev.plant,
        status: "Assigned",
      }));
      toast.success("Filled custodian details from " + emp.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.make.trim()) return toast.error("Hardware Make is required");
    if (!formData.model.trim()) return toast.error("Hardware Model is required");
    if (!formData.sr.trim()) return toast.error("Serial Number (SR) is required");

    setLoading(true);

    try {
      await api.updateAsset(asset._id, {
        ...formData,
        actorName: user?.name || "IT Admin",
      });

      toast.success(`Asset "${formData.make} ${formData.model}" updated successfully!`, "Changes Saved");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message, "Update Failed");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "custodian", label: "Custodian & User", icon: User },
    { id: "hardware", label: "Hardware & Specs", icon: Cpu },
    { id: "network", label: "Network & Access", icon: Globe },
    { id: "software", label: "Software & Keys", icon: Key },
    { id: "procurement", label: "Procurement & AMC", icon: DollarSign },
    { id: "notes", label: "Remarks & Notes", icon: FileText },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "860px", width: "95vw" }}
      >
        {/* Header */}
        <div className="modal-header" style={{ padding: "1rem 1.5rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <Edit3 size={18} color="#818cf8" />
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800 }}>
                Edit Asset: {asset.make} {asset.model}
              </h3>
              <span
                className="badge"
                style={{
                  fontSize: "0.72rem",
                  padding: "0.15rem 0.55rem",
                  borderRadius: "999px",
                  backgroundColor: formData.status === "Assigned" ? "rgba(56, 189, 248, 0.15)" : (formData.status === "Available" ? "rgba(52, 211, 153, 0.15)" : "rgba(251, 191, 36, 0.15)"),
                  color: formData.status === "Assigned" ? "#38bdf8" : (formData.status === "Available" ? "#34d399" : "#fbbf24"),
                  border: "1px solid currentColor",
                }}
              >
                ● {formData.status}
              </span>
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px", fontFamily: "var(--font-mono)" }}>
              Tag: {formData.assetNo || "AST-NEW"} • S/N: {formData.sr} • Custodian: <strong style={{ color: "#818cf8" }}>{formData.userName}</strong>
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-icon btn-xs">
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: "flex",
            gap: "0.25rem",
            padding: "0.5rem 1.5rem",
            backgroundColor: "rgba(0, 0, 0, 0.25)",
            borderBottom: "1px solid var(--border-default)",
            overflowX: "auto",
          }}
        >
          {tabs.map((t) => {
            const Icon = t.icon;
            const isAct = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.45rem 0.85rem",
                  fontSize: "0.8rem",
                  fontWeight: isAct ? 700 : 500,
                  backgroundColor: isAct ? "var(--bg-surface-elevated)" : "transparent",
                  color: isAct ? "#fff" : "var(--text-muted)",
                  border: isAct ? "1px solid var(--color-primary)" : "1px solid transparent",
                  borderRadius: "var(--radius-md)",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s ease",
                }}
              >
                <Icon size={14} color={isAct ? "#818cf8" : "currentColor"} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit}>
          <div
            className="modal-body"
            style={{
              maxHeight: "62vh",
              overflowY: "auto",
              padding: "1.25rem 1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
            }}
          >
            {/* TAB 1: CUSTODIAN & ASSIGNMENT */}
            {activeTab === "custodian" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {/* Staff Quick Picker */}
                {employees.length > 0 && (
                  <div
                    style={{
                      padding: "0.75rem 1rem",
                      backgroundColor: "rgba(129, 140, 248, 0.08)",
                      border: "1px solid rgba(129, 140, 248, 0.25)",
                      borderRadius: "var(--radius-md)",
                    }}
                  >
                    <label className="form-label" style={{ color: "#818cf8", marginBottom: "0.35rem" }}>
                      ⚡ Quick-Assign from Staff Directory
                    </label>
                    <select
                      className="form-select"
                      value=""
                      onChange={(e) => {
                        if (e.target.value) handleSelectStaff(e.target.value);
                      }}
                    >
                      <option value="">-- Choose employee to auto-fill fields --</option>
                      {employees.map((emp) => (
                        <option key={emp._id || emp.employeeId} value={emp.employeeId}>
                          {emp.name} ({emp.employeeId}) • {emp.department} • {emp.location}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label">
                      Custodian / User Name <span style={{ color: "#f87171" }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      name="userName"
                      value={formData.userName}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="e.g. sachin, Ramesh Sharma, Unassigned"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Employee Code / ID</label>
                    <input
                      type="text"
                      name="empCode"
                      value={formData.empCode}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="e.g. VIT-1045"
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label">Work Email Address</label>
                    <input
                      type="email"
                      name="mailId"
                      value={formData.mailId}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="e.g. employee@vitromed.com"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Cabin / Floor / Desk Location</label>
                    <input
                      type="text"
                      name="floorCabin"
                      value={formData.floorCabin}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="e.g. Main Floor, Bay 4, Exec Cabin"
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="form-select"
                    >
                      {COMPANY_DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Plant / Facility</label>
                    <select
                      name="plant"
                      value={formData.plant}
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="Vitromed">Vitromed</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label">Operational Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="form-select"
                      style={{
                        fontWeight: 600,
                        color: formData.status === "Assigned" ? "#38bdf8" : (formData.status === "Available" ? "#34d399" : "#fbbf24"),
                      }}
                    >
                      <option value="Assigned">Assigned (In Active Use)</option>
                      <option value="Available">Available (In Stock / Pool)</option>
                      <option value="Under Maintenance">Under Maintenance (In Repair)</option>
                      <option value="Retired">Retired (Decommissioned)</option>
                      <option value="Lost">Lost / Stolen</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Physical Working Condition</label>
                    <select
                      name="workingCondition"
                      value={formData.workingCondition}
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="New">New (Mint in box)</option>
                      <option value="Excellent">Excellent (Like new)</option>
                      <option value="Good">Good (Normal operational wear)</option>
                      <option value="Fair">Fair (Minor cosmetic wear)</option>
                      <option value="Needs Repair">Needs Repair / Diagnostics</option>
                      <option value="Damaged">Damaged (Faulty hardware)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label">Custody Handover / Assigned Date</label>
                    <input
                      type="date"
                      name="assignedDate"
                      value={formData.assignedDate}
                      onChange={handleChange}
                      className="form-control"
                      style={{ colorScheme: "dark" }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Expected Handover / Return Date</label>
                    <input
                      type="date"
                      name="expectedReturnDate"
                      value={formData.expectedReturnDate}
                      onChange={handleChange}
                      className="form-control"
                      style={{ colorScheme: "dark" }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: HARDWARE & SPECS */}
            {activeTab === "hardware" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label">
                      Manufacturer / Make <span style={{ color: "#f87171" }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      name="make"
                      value={formData.make}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="e.g. Dell, HP, Apple"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Model Number / Series <span style={{ color: "#f87171" }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      name="model"
                      value={formData.model}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="e.g. OptiPlex 7090, Latitude 5440"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Device Type</label>
                    <select
                      name="deviceType"
                      value={formData.deviceType}
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="Laptop">Laptop</option>
                      <option value="Desktop">Desktop</option>
                      <option value="All in One Desktop">All in One Desktop</option>
                      <option value="Server">Server</option>
                      <option value="Workstation">Workstation</option>
                      <option value="Monitor">Monitor</option>
                      <option value="Printer">Printer</option>
                      <option value="Tablet">Tablet</option>
                      <option value="Network Switch">Network Switch</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label">
                      Hardware Serial Number (SR) <span style={{ color: "#f87171" }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      name="sr"
                      value={formData.sr}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Unique serial number"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Internal Asset Tag Number</label>
                    <input
                      type="text"
                      name="assetNo"
                      value={formData.assetNo}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="e.g. AST-VIT-0114"
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label">Processor (CPU)</label>
                    <input
                      type="text"
                      name="processor"
                      value={formData.processor}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="e.g. Intel Core i5-12500"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">RAM Memory</label>
                    <input
                      type="text"
                      name="ramSize"
                      value={formData.ramSize}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="e.g. 16 GB DDR4"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Storage Drive</label>
                    <input
                      type="text"
                      name="storage"
                      value={formData.storage}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="e.g. 512 GB NVMe SSD"
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label">External Monitor Details</label>
                    <input
                      type="text"
                      name="monitorDetails"
                      value={formData.monitorDetails}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="e.g. Dell 24-inch FHD IPS (P2422H)"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">External Monitor S/N</label>
                    <input
                      type="text"
                      name="monitorSerialNo"
                      value={formData.monitorSerialNo}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="e.g. CN-0K98N2-72872"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: NETWORK & REMOTE ACCESS */}
            {activeTab === "network" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label">System Host Name</label>
                    <input
                      type="text"
                      name="hostName"
                      value={formData.hostName}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="e.g. sachin, PC-JPPL-114"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Assigned Local IP Address</label>
                    <input
                      type="text"
                      name="ipAddress"
                      value={formData.ipAddress}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="e.g. 192.168.8.75"
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label">Physical MAC Address</label>
                    <input
                      type="text"
                      name="macAddress"
                      value={formData.macAddress}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="e.g. 00:E0:4C:1A:8B:22"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">VNC / Remote Desktop Password</label>
                    <input
                      type="text"
                      name="vncPassword"
                      value={formData.vncPassword}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="e.g. V!tr0"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: SOFTWARE & KEYS */}
            {activeTab === "software" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label">Operating System</label>
                    <input
                      type="text"
                      name="osVersion"
                      value={formData.osVersion}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="e.g. Windows 11 Pro, Ubuntu 22.04"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Windows / OS License Key</label>
                    <input
                      type="text"
                      name="windowsKey"
                      value={formData.windowsKey}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="e.g. W269N-WFGWX-YVC9B-4J6C9-T83GX"
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label">Office Productivity Software</label>
                    <input
                      type="text"
                      name="officeSoftware"
                      value={formData.officeSoftware}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="e.g. MS Office 2021 Home & Business"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Office Product Key</label>
                    <input
                      type="text"
                      name="officeKey"
                      value={formData.officeKey}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Office activation code"
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label">Antivirus Endpoint Software</label>
                    <input
                      type="text"
                      name="antivirus"
                      value={formData.antivirus}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="e.g. QuickHeal Total Security Endpoint"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Antivirus License Key</label>
                    <input
                      type="text"
                      name="antivirusKey"
                      value={formData.antivirusKey}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Antivirus activation key"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Other Licensed Software & Tools</label>
                  <input
                    type="text"
                    name="otherSoftware"
                    value={formData.otherSoftware}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="e.g. AutoCAD 2024, SAP Client, Adobe Acrobat Pro"
                  />
                </div>
              </div>
            )}

            {/* TAB 5: PROCUREMENT & WARRANTY */}
            {activeTab === "procurement" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label">PO / Bill / Invoice Number</label>
                    <input
                      type="text"
                      name="billNo"
                      value={formData.billNo}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="e.g. INV-2024-8841"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Vendor / Supplier Name</label>
                    <input
                      type="text"
                      name="vendorName"
                      value={formData.vendorName}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="e.g. Dell Direct India, HP Enterprise"
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label">Purchase Price (₹)</label>
                    <input
                      type="number"
                      min="0"
                      name="purchasePrice"
                      value={formData.purchasePrice}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Current Book Value (₹)</label>
                    <input
                      type="number"
                      min="0"
                      name="currentValue"
                      value={formData.currentValue}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label">Purchase Date</label>
                    <input
                      type="date"
                      name="purchaseDate"
                      value={formData.purchaseDate}
                      onChange={handleChange}
                      className="form-control"
                      style={{ colorScheme: "dark" }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Delivery / Inward Date</label>
                    <input
                      type="date"
                      name="deliveryDate"
                      value={formData.deliveryDate}
                      onChange={handleChange}
                      className="form-control"
                      style={{ colorScheme: "dark" }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Warranty / AMC Terms</label>
                  <input
                    type="text"
                    name="warrantyDetails"
                    value={formData.warrantyDetails}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="e.g. 3 Years Comprehensive Next-Business-Day On-Site"
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label">Warranty Start Date</label>
                    <input
                      type="date"
                      name="warrantyStartDate"
                      value={formData.warrantyStartDate}
                      onChange={handleChange}
                      className="form-control"
                      style={{ colorScheme: "dark" }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Warranty Expiration Date</label>
                    <input
                      type="date"
                      name="warrantyEndDate"
                      value={formData.warrantyEndDate}
                      onChange={handleChange}
                      className="form-control"
                      style={{ colorScheme: "dark" }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Invoice Photo / Scanned Document URL</label>
                  <input
                    type="text"
                    name="invoiceImage"
                    value={formData.invoiceImage}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="https://... or data:image/..."
                  />
                </div>
              </div>
            )}

            {/* TAB 6: REMARKS & SERVICE */}
            {activeTab === "notes" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">System Remarks & Configuration Notes</label>
                  <textarea
                    rows={4}
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="e.g. VNC Password = V!tr0. High priority production system. Replaced SSD in Aug 2024."
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label">Latest Service / Repair Vendor</label>
                    <input
                      type="text"
                      name="serviceVendor"
                      value={formData.serviceVendor}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="e.g. Dell Support Partner, In-house IT"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Latest Repair Cost (₹)</label>
                    <input
                      type="number"
                      min="0"
                      name="repairCost"
                      value={formData.repairCost}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Service / Maintenance Notes</label>
                  <textarea
                    rows={3}
                    name="maintenanceNotes"
                    value={formData.maintenanceNotes}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Log historical repairs or unresolved faults..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div
            className="modal-footer"
            style={{
              padding: "0.85rem 1.5rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              Editing <strong style={{ color: "var(--text-primary)" }}>{formData.make} {formData.model}</strong> • {formData.status}
            </div>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button type="button" onClick={onClose} className="btn btn-outline btn-sm">
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-sm"
                style={{ padding: "0.45rem 1.25rem", fontWeight: 700 }}
              >
                {loading ? "Saving All Attributes..." : "Save All Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ----------------- QUICK MAINTENANCE MODAL -----------------
export function QuickMaintenanceModal({ asset, onClose, onSuccess }) {
  const toast = useToast();
  const [issue, setIssue] = useState("");
  const [serviceVendor, setServiceVendor] = useState("Authorized OEM Service Partner");
  const [repairCost, setRepairCost] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!issue.trim()) return toast.error("Please describe the maintenance issue");

    setLoading(true);
    try {
      await api.updateAsset(asset._id, {
        status: "Under Maintenance",
        remarks: "Maintenance Opened: " + issue + " (" + serviceVendor + ")",
      });

      // Also create formal ticket in maintenance collection
      await api.createMaintenance({
        ticketId: "MNT-" + Date.now().toString().slice(-6),
        assetTag: asset.sr || asset.assetNo || "AST-N/A",
        assetName: asset.make + " " + asset.model,
        technician: serviceVendor,
        issue,
        cost: parseFloat(repairCost) || 0,
        startDate: new Date(),
        status: "In Progress",
      }).catch(() => {});

      toast.success("Asset \"" + asset.make + " " + asset.model + "\" flagged Under Maintenance.", "Service Ticket Logged");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message, "Maintenance Request Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "520px" }}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Wrench size={18} color="#fbbf24" />
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700 }}>Log Maintenance / Repair Ticket</h3>
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-icon btn-xs">
            <X size={16} />
          </button>
        </div>

        <div
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "rgba(9, 15, 26, 0.5)",
            borderBottom: "1px solid var(--border-default)",
          }}
        >
          <div style={{ fontWeight: 600 }}>{asset.make} {asset.model}</div>
          <div style={{ fontSize: "0.75rem", color: "#fbbf24", fontFamily: "var(--font-mono)" }}>
            Tag: {asset.assetNo || "AST-N/A"} • S/N: {asset.sr} • Plant: {asset.plant}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">
                Reported Hardware / Software Fault <span style={{ color: "#f87171" }}>*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="e.g. Display backlight intermittent, fan making loud noise, thermal shutdown."
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                className="form-control"
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div className="form-group">
                <label className="form-label">Service Provider / Tech</label>
                <input
                  type="text"
                  value={serviceVendor}
                  onChange={(e) => setServiceVendor(e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Estimated Repair Cost (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={repairCost}
                  onChange={(e) => setRepairCost(e.target.value)}
                  className="form-control"
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-outline btn-sm">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary btn-sm" style={{ backgroundColor: "#d97706", borderColor: "#d97706" }}>
              {loading ? "Submitting..." : "Flag Under Maintenance"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
