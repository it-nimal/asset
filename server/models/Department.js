import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true },
    manager: { type: String, default: 'Head of Department', trim: true },
    location: { type: String, default: 'Vitromed', trim: true },
  },
  { timestamps: true, autoIndex: false }
);

export const Department = mongoose.models.Department || mongoose.model('Department', departmentSchema);
export default Department;
