import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    building: { type: String, default: 'Tower A', trim: true },
    floor: { type: String, default: '1st Floor', trim: true },
    room: { type: String, default: 'Room 101', trim: true },
    address: { type: String, trim: true },
  },
  { timestamps: true, autoIndex: false }
);

locationSchema.index({ name: 1 });

export const Location = mongoose.models.Location || mongoose.model('Location', locationSchema);
export default Location;
