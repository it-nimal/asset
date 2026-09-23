import mongoose from 'mongoose';

const purchaseOrderSchema = new mongoose.Schema(
  {
    poNumber: { type: String, required: true, unique: true, trim: true },
    vendorName: { type: String, required: true, trim: true },
    orderDate: { type: Date, default: Date.now },
    expectedDeliveryDate: { type: Date },
    status: {
      type: String,
      enum: ['Draft', 'Ordered', 'Partially Received', 'Received', 'Cancelled'],
      default: 'Ordered',
    },
    totalAmount: { type: Number, default: 0 },
    currency: { type: String, default: 'INR', trim: true },
    items: [
      {
        itemDescription: { type: String, required: true, trim: true },
        category: { type: String, default: 'computing', trim: true },
        quantity: { type: Number, default: 1 },
        unitPrice: { type: Number, default: 0 },
        receivedQuantity: { type: Number, default: 0 },
      },
    ],
    notes: { type: String, trim: true },
  },
  { timestamps: true, autoIndex: false }
);

purchaseOrderSchema.index({ status: 1 });

export const PurchaseOrder = mongoose.models.PurchaseOrder || mongoose.model('PurchaseOrder', purchaseOrderSchema);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true, trim: true },
    poNumber: { type: String, trim: true },
    vendorName: { type: String, required: true, trim: true },
    invoiceDate: { type: Date, default: Date.now },
    amount: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Pending', 'Partially Paid', 'Cancelled'],
      default: 'Paid',
    },
    attachmentUrl: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true, autoIndex: false }
);

invoiceSchema.index({ poNumber: 1 });

export const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema);
