import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['Super Admin', 'IT Admin', 'IT Technician', 'Manager', 'Employee'],
      default: 'Employee',
    },
    department: { type: String, default: 'IT' },
    avatar: { type: String },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, autoIndex: false }
);

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
