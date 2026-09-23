import mongoose from 'mongoose';

const softwareSchema = new mongoose.Schema(
  {
    softwareName: { type: String, required: true, trim: true },
    version: { type: String, default: '1.0', trim: true },
    vendor: { type: String, default: 'Microsoft', trim: true },
    licenseType: {
      type: String,
      enum: ['Volume', 'Perpetual', 'Subscription / Cloud', 'Open Source', 'OEM'],
      default: 'Subscription / Cloud',
    },
    licenseKey: { type: String, trim: true },
    licenseCount: { type: Number, default: 10 },
    usedLicenses: { type: Number, default: 0 },
    purchaseDate: { type: Date, default: Date.now },
    expiryDate: { type: Date },
    cost: { type: Number, default: 0 },
    notes: { type: String, trim: true },
  },
  { timestamps: true, autoIndex: false }
);

softwareSchema.index({ softwareName: 1 });
softwareSchema.index({ vendor: 1 });

export const Software = mongoose.models.Software || mongoose.model('Software', softwareSchema);
export default Software;
