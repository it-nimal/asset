import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true, unique: true, trim: true },
    empCode: { type: String, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    phone: { type: String, trim: true },
    department: { type: String, required: true, trim: true },
    designation: { type: String, default: 'Associate', trim: true },
    plant: { type: String, default: 'Vitromed', trim: true },
    location: { type: String, default: 'Vitromed', trim: true },
    joiningDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['Active', 'On Leave', 'Resigned', 'Notice Period', 'Exited'], default: 'Active' },
    allocatedAssetsCount: { type: Number, default: 0 },
  },
  { timestamps: true, autoIndex: false }
);

employeeSchema.index({ department: 1 });
employeeSchema.index({ status: 1 });
employeeSchema.index({ name: 1 });

export const Employee = mongoose.models.Employee || mongoose.model('Employee', employeeSchema);
export default Employee;
