import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    user: { type: String, required: true, default: 'System Admin', trim: true },
    role: { type: String, default: 'IT Admin', trim: true },
    action: { type: String, required: true, trim: true },
    assetTag: { type: String, trim: true },
    details: { type: String, trim: true },
    ipAddress: { type: String, default: '127.0.0.1', trim: true },
  },
  { timestamps: true, autoIndex: false }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ assetTag: 1 });

export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
