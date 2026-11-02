import mongoose from 'mongoose';
import crypto from 'crypto';

const auditLogSchema = new mongoose.Schema(
  {
    // 1. Unique Audit ID
    auditId: {
      type: String,
      unique: true,
      trim: true,
    },

    // 2. User ID
    userId: { type: String, trim: true },

    // 3. Username
    username: { type: String, required: true, trim: true },

    // 4. User Full Name
    userFullName: { type: String, trim: true },

    // 5. User Role at the time of action
    userRole: {
      type: String,
      enum: ['Super Admin', 'Admin', 'User', 'IT Admin', 'Employee'],
      default: 'Admin',
      trim: true,
    },
    role: { type: String, trim: true }, // Backward compatibility alias

    // 6. Action Type
    action: {
      type: String,
      required: true,
      trim: true,
    },

    // 7. Module Name
    module: {
      type: String,
      required: true,
      trim: true,
    },

    // 8. API Endpoint
    apiEndpoint: { type: String, trim: true },

    // 9. HTTP Method
    httpMethod: { type: String, trim: true },

    // 10. Record ID
    recordId: { type: String, trim: true },

    // 11. Record Reference / Asset ID / Employee ID
    recordIdentifier: { type: String, trim: true },

    // 12. Action Description
    description: { type: String, trim: true },
    details: { type: String, trim: true }, // Backward compatibility alias

    // 13. Previous Data
    oldValues: { type: mongoose.Schema.Types.Mixed, default: null },

    // 14. New Data
    newValues: { type: mongoose.Schema.Types.Mixed, default: null },

    // 15. Changed Fields structured array
    changedFields: [
      {
        field: { type: String, required: true },
        oldValue: { type: mongoose.Schema.Types.Mixed },
        newValue: { type: mongoose.Schema.Types.Mixed },
      },
    ],

    // 16. IP Address
    ipAddress: { type: String, default: '127.0.0.1', trim: true },

    // 17. User Agent / Browser Information
    userAgent: { type: String, trim: true },

    // 18. Request Timestamp (Server-generated UTC timestamp)
    timestamp: { type: Date, default: Date.now, required: true },

    // 19. Action Status
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED'],
      default: 'SUCCESS',
      trim: true,
    },

    // 20. Error Details
    errorDetails: { type: String, trim: true },

    // 21. Request Correlation ID
    correlationId: { type: String, trim: true },

    // Legacy fields for backward compatibility
    user: { type: String, trim: true },
    assetTag: { type: String, trim: true },
  },
  {
    timestamps: true,
    autoIndex: false,
    minimize: false, // Ensure empty objects are preserved
  }
);

// Pre-save hook: auto-generate unique auditId and synchronize compatibility fields
auditLogSchema.pre('save', function (next) {
  if (!this.auditId) {
    const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
    this.auditId = `AUD-${Date.now()}-${randomHex}`;
  }

  if (!this.userRole && this.role) {
    this.userRole = this.role;
  }
  if (!this.role && this.userRole) {
    this.role = this.userRole;
  }

  if (!this.user && this.username) {
    this.user = this.username;
  }
  if (!this.username && this.user) {
    this.username = this.user;
  }

  if (!this.userFullName && this.username) {
    this.userFullName = this.username;
  }

  if (!this.description && this.details) {
    this.description = this.details;
  }
  if (!this.details && this.description) {
    this.details = this.description;
  }

  if (!this.recordIdentifier && this.assetTag) {
    this.recordIdentifier = this.assetTag;
  }
  if (!this.assetTag && this.recordIdentifier) {
    this.assetTag = this.recordIdentifier;
  }

  if (!this.timestamp) {
    this.timestamp = new Date();
  }

  next();
});

// Indexes for high-performance filtering, search, and pagination
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ module: 1, action: 1 });
auditLogSchema.index({ username: 1 });
auditLogSchema.index({ userId: 1 });
auditLogSchema.index({ userRole: 1 });
auditLogSchema.index({ recordIdentifier: 1 });
auditLogSchema.index({ recordId: 1 });
auditLogSchema.index({ status: 1 });
auditLogSchema.index({ ipAddress: 1 });
auditLogSchema.index({ correlationId: 1 });

export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
