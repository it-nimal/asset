import mongoose from 'mongoose';

const masterSettingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    categories: [
      {
        id: String,
        name: String,
        icon: String,
        badgeColor: String,
        defaultType: String,
        types: [String],
        popularMakes: [String],
      },
    ],
    plants: [{ name: String, code: String, address: String }],
    departments: [{ name: String, code: String, manager: String, location: String }],
    locations: [{ name: String, building: String, floor: String, room: String }],
    vendors: [{ name: String, contactPerson: String, email: String, phone: String, category: String }],
    statuses: [{ name: String, color: String, description: String }],
    roles: [{ name: String, description: String, permissions: [String] }],
  },
  { timestamps: true, autoIndex: false }
);

export const MasterSetting = mongoose.models.MasterSetting || mongoose.model('MasterSetting', masterSettingSchema);
export default MasterSetting;
