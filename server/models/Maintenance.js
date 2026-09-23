import mongoose from 'mongoose';

const maintenanceSchema = new mongoose.Schema(
  {
    maintenanceId: { type: String, required: true, unique: true, trim: true },
    ticketId: { type: String, trim: true },
    assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
    assetTag: { type: String, trim: true },
    assetCategory: { type: String, trim: true },
    assetMake: { type: String, trim: true },
    assetModel: { type: String, trim: true },
    assetSerial: { type: String, trim: true },

    employeeId: { type: String, trim: true },
    employeeName: { type: String, trim: true },
    empCode: { type: String, trim: true },
    department: { type: String, trim: true },

    reportedBy: { type: String, default: 'IT Staff', trim: true },
    reportedDate: { type: Date, default: Date.now },

    issueCategory: {
      type: String,
      enum: ['Hardware', 'Software', 'Network', 'Power', 'Physical Damage', 'Performance', 'Other'],
      default: 'Hardware',
    },
    issueDescription: { type: String, required: true, trim: true },
    issue: { type: String, trim: true },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },

    status: {
      type: String,
      enum: [
        'Reported',
        'Under Diagnosis',
        'In Repair',
        'Awaiting Vendor',
        'Awaiting Parts',
        'QC Pending',
        'Ready',
        'Returned',
        'Cancelled',
        'Open',
        'In Progress',
        'Resolved',
        'Closed',
      ],
      default: 'Reported',
    },

    diagnosis: { type: String, default: '', trim: true },
    rootCause: { type: String, default: '', trim: true },
    recommendedAction: { type: String, default: '', trim: true },
    diagnosedBy: { type: String, default: '', trim: true },
    diagnosisDate: { type: Date },

    repairType: {
      type: String,
      enum: ['Internal IT Repair', 'Vendor Repair', 'Warranty Repair', 'Replacement', ''],
      default: '',
    },
    vendor: { type: String, default: '', trim: true },
    serviceVendor: { type: String, default: '', trim: true },
    warrantyStatus: {
      type: String,
      enum: ['In Warranty', 'Out of Warranty', 'Unknown', ''],
      default: '',
    },
    sentDate: { type: Date },
    expectedReturnDate: { type: Date },
    completedDate: { type: Date },
    partsReplaced: { type: String, default: '', trim: true },
    serviceNotes: { type: String, default: '', trim: true },
    repairCost: { type: Number, default: 0 },
    cost: { type: Number, default: 0 },

    qcResult: { type: String, enum: ['Passed', 'Failed', 'Pending', ''], default: '' },
    qcNotes: { type: String, default: '', trim: true },
    qcBy: { type: String, default: '', trim: true },
    qcDate: { type: Date },

    finalDisposition: {
      type: String,
      enum: ['Return to Employee', 'Return to Stock', 'Retire', ''],
      default: '',
    },
    returnedDate: { type: Date },
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        fileType: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    technician: { type: String, default: 'IT Support', trim: true },
    resolution: { type: String, default: '', trim: true },
    history: [
      {
        date: { type: Date, default: Date.now },
        action: String,
        performedBy: String,
        details: String,
      },
    ],
    createdBy: { type: String, default: 'IT Admin', trim: true },
    updatedBy: { type: String, default: 'IT Admin', trim: true },
  },
  { timestamps: true, autoIndex: false }
);

maintenanceSchema.index({ assetId: 1 });
maintenanceSchema.index({ status: 1 });
maintenanceSchema.index({ employeeId: 1 });

export const Maintenance = mongoose.models.Maintenance || mongoose.model('Maintenance', maintenanceSchema);
export default Maintenance;
