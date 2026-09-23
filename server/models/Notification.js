import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['warranty', 'license', 'maintenance', 'assignment', 'alert'],
      default: 'alert',
    },
    read: { type: Boolean, default: false },
    link: { type: String, trim: true },
  },
  { timestamps: true, autoIndex: false }
);

notificationSchema.index({ read: 1, createdAt: -1 });

export const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
export default Notification;
