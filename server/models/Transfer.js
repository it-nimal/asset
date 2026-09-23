import mongoose from 'mongoose';

const transferSchema = new mongoose.Schema(
  {
    transferId: { type: String, required: true, unique: true, trim: true },
    assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
    assetTag: { type: String, trim: true },
    assetCategory: { type: String, trim: true },
    assetMake: { type: String, trim: true },
    assetModel: { type: String, trim: true },
    assetSerial: { type: String, trim: true },

    fromEmployeeId: { type: String, trim: true },
    fromEmployeeName: { type: String, trim: true },
    fromEmpCode: { type: String, trim: true },
    fromDepartment: { type: String, trim: true },
    fromLocation: { type: String, trim: true },
    fromDesignation: { type: String, trim: true },
    fromEmail: { type: String, trim: true },

    toEmployeeId: { type: String, required: true, trim: true },
    toEmployeeName: { type: String, required: true, trim: true },
    toEmpCode: { type: String, trim: true },
    toDepartment: { type: String, trim: true },
    toLocation: { type: String, trim: true },
    toDesignation: { type: String, trim: true },
    toEmail: { type: String, trim: true },

    transferDate: { type: Date, default: Date.now },
    reason: {
      type: String,
      enum: [
        'Employee Transfer',
        'Department Change',
        'Role Change',
        'Replacement',
        'Project Assignment',
        'Location Change',
        'Management Decision',
        'Other',
      ],
      default: 'Employee Transfer',
    },
    destinationLocation: { type: String, default: '', trim: true },
    remarks: { type: String, default: '', trim: true },

    assetCondition: {
      type: String,
      enum: ['Good', 'Minor Wear', 'Damaged'],
      default: 'Good',
    },
    accessoriesTransferred: { type: Boolean, default: true },
    accessoryNotes: { type: String, default: '', trim: true },

    status: {
      type: String,
      enum: [
        'Pending',
        'Approved',
        'Handover Pending',
        'Acknowledgement Pending',
        'Completed',
        'Cancelled',
      ],
      default: 'Pending',
    },

    approvedBy: { type: String, default: '', trim: true },
    approvedDate: { type: Date },

    handedOverBy: { type: String, default: '', trim: true },
    handoverDate: { type: Date },

    acknowledgedBy: { type: String, default: '', trim: true },
    acknowledgementDate: { type: Date },
    acknowledgementNotes: { type: String, default: '', trim: true },

    cancelledBy: { type: String, default: '', trim: true },
    cancelledDate: { type: Date },
    cancellationReason: { type: String, default: '', trim: true },

    history: [
      {
        date: { type: Date, default: Date.now },
        action: { type: String, required: true },
        performedBy: { type: String, default: 'IT Admin' },
        details: { type: String, default: '' },
      },
    ],

    createdBy: { type: String, default: 'IT Admin', trim: true },
    updatedBy: { type: String, default: 'IT Admin', trim: true },
  },
  { timestamps: true, autoIndex: false }
);

transferSchema.index({ assetId: 1 });
transferSchema.index({ status: 1 });
transferSchema.index({ fromEmployeeId: 1 });
transferSchema.index({ toEmployeeId: 1 });

export const Transfer = mongoose.models.Transfer || mongoose.model('Transfer', transferSchema);
export default Transfer;
