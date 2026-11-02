import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    username: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
      index: true,
    },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['Super Admin', 'Admin', 'User', 'IT Admin', 'IT Technician', 'Manager', 'Employee'],
      default: 'User',
      trim: true,
      index: true,
    },
    department: { type: String, default: 'IT', trim: true },
    employeeId: { type: String, trim: true }, // Optional link to employee record for User role self-service
    avatar: { type: String },
    active: { type: Boolean, default: true, index: true },
    lastLogin: { type: Date },
    lastLoginIp: { type: String },
    loginCount: { type: Number, default: 0 },
    // Granular module-level permission overrides for individual user
    // e.g. { "Employees": ["VIEW", "CREATE"], "Assets": ["VIEW", "UPDATE"] }
    permissions: {
      type: Map,
      of: [String],
      default: {},
    },
  },
  { timestamps: true, autoIndex: false }
);

// Virtual for fullName
userSchema.virtual('fullName').get(function () {
  return this.name;
});

// Pre-save hook: ensure username is populated and hash password if modified
userSchema.pre('save', async function (next) {
  if (!this.username && this.email) {
    this.username = this.email.split('@')[0].toLowerCase().trim();
  }

  if (!this.isModified('password')) {
    return next();
  }

  try {
    // If already hashed by bcrypt (starts with $2a$ or $2b$), do not double-hash
    if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
      return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method supporting both bcrypt and seamless legacy migration
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!candidatePassword) return false;
  const isBcrypt = this.password.startsWith('$2a$') || this.password.startsWith('$2b$');
  if (isBcrypt) {
    return await bcrypt.compare(candidatePassword, this.password);
  }
  // Fallback for existing unhashed accounts in DB
  const isMatch = this.password === candidatePassword;
  if (isMatch) {
    // Transparently upgrade to bcrypt hash
    this.password = candidatePassword;
    await this.save();
  }
  return isMatch;
};

// Canonical role normalizer
userSchema.methods.getCanonicalRole = function () {
  const r = (this.role || '').trim();
  if (r === 'Super Admin') return 'Super Admin';
  if (r === 'Admin' || r === 'IT Admin') return 'Admin';
  return 'User';
};

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
