import mongoose from 'mongoose';

const inwardItemSchema = new mongoose.Schema({
  category: { type: String, trim: true },
  deviceType: { type: String, trim: true },
  manufacturer: { type: String, default: '', trim: true },
  model: { type: String, default: '', trim: true },
  quantity: { type: Number, default: 1 },
  specifications: { type: mongoose.Schema.Types.Mixed, default: {} },
  accessories: { type: mongoose.Schema.Types.Mixed, default: {} },
  otherAccessories: [
    {
      name: { type: String, required: true, trim: true },
      quantity: { type: Number, default: 1 },
    },
  ],
  verifiedAssets: [
    {
      serialNumber: { type: String, default: '', trim: true },
      assetTag: { type: String, default: '', trim: true },
      condition: { type: String, default: 'Good', trim: true },
      status: { type: String, default: 'Pending', trim: true },
      specOverrides: { type: mongoose.Schema.Types.Mixed, default: {} },
      assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset' },
    },
  ],
});

const inwardSchema = new mongoose.Schema(
  {
    inwardNumber: { type: String, required: true, unique: true, trim: true },
    receivedDate: { type: Date, default: Date.now },
    inwardDate: { type: Date, default: Date.now },
    vendor: { type: String, required: true, trim: true },
    invoiceNumber: { type: String, default: '', trim: true },
    purchaseOrderNumber: { type: String, default: '', trim: true },
    poNumber: { type: String, default: '', trim: true },
    invoiceDate: { type: Date },
    receivedAt: { type: String, default: 'Vitromed', trim: true },

    category: { type: String, default: 'Computers & Laptops', trim: true },
    deviceType: { type: String, default: 'Laptop', trim: true },
    quantity: { type: Number, default: 1, min: 1 },
    manufacturer: { type: String, default: '', trim: true },
    model: { type: String, default: '', trim: true },

    specifications: { type: mongoose.Schema.Types.Mixed, default: {} },

    accessories: {
      monitor: { received: { type: Boolean, default: false }, description: { type: String, default: '' } },
      keyboard: { received: { type: Boolean, default: false }, description: { type: String, default: '' } },
      mouse: { received: { type: Boolean, default: false }, description: { type: String, default: '' } },
      powerAdapter: { received: { type: Boolean, default: false }, description: { type: String, default: '' } },
      cables: { received: { type: Boolean, default: false }, description: { type: String, default: '' } },
      other: { received: { type: Boolean, default: false }, description: { type: String, default: '' } },
    },

    attachments: [
      {
        fileName: { type: String },
        fileUrl: { type: String },
        fileType: { type: String, default: 'Invoice' },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    documents: [
      {
        docType: { type: String, default: 'Invoice' },
        fileName: { type: String },
        fileUrl: { type: String },
        fileSize: { type: Number },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    notes: { type: String, default: '', trim: true },
    remarks: { type: String, default: '', trim: true },

    status: {
      type: String,
      enum: [
        'Received',
        'Verification Pending',
        'Verified',
        'Discrepancy',
        'Asset Created',
        'Draft',
        'Pending Asset Verification',
        'Verified & Created',
        'Cancelled',
      ],
      default: 'Received',
    },

    verificationDetails: {
      verifiedBy: { type: String, default: '', trim: true },
      verifiedAt: { type: Date },
      verificationNotes: { type: String, default: '', trim: true },
      hasDiscrepancy: { type: Boolean, default: false },
      discrepancyReason: { type: String, default: '', trim: true },
    },

    createdAssets: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Asset',
      },
    ],

    items: [inwardItemSchema],
    createdBy: { type: String, default: 'IT Admin', trim: true },
  },
  { timestamps: true, autoIndex: false }
);

inwardSchema.index({ status: 1 });
inwardSchema.index({ vendor: 1 });

export const Inward = mongoose.models.Inward || mongoose.model('Inward', inwardSchema);
export default Inward;
