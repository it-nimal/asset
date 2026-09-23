import mongoose from 'mongoose';

const networkDeviceSchema = new mongoose.Schema(
  {
    hostname: { type: String, required: true, trim: true },
    deviceType: {
      type: String,
      enum: ['Switch', 'Router', 'Firewall', 'Access Point', 'Wireless Controller', 'Server'],
      default: 'Switch',
    },
    ipAddress: { type: String, required: true, trim: true },
    managementIp: { type: String, trim: true },
    macAddress: { type: String, trim: true },
    serialNumber: { type: String, unique: true, trim: true },
    vendor: { type: String, default: 'Cisco', trim: true },
    model: { type: String, default: 'Catalyst 2960', trim: true },
    firmwareVersion: { type: String, default: 'v15.2', trim: true },
    location: { type: String, default: 'Vitromed HQ - Server Room', trim: true },
    rack: { type: String, default: 'Rack-01', trim: true },
    uPosition: { type: String, default: 'U12', trim: true },
    status: {
      type: String,
      enum: ['Online', 'Offline', 'Maintenance', 'Decommissioned'],
      default: 'Online',
    },
  },
  { timestamps: true, autoIndex: false }
);

networkDeviceSchema.index({ hostname: 1 });
networkDeviceSchema.index({ ipAddress: 1 });

export const NetworkDevice = mongoose.models.NetworkDevice || mongoose.model('NetworkDevice', networkDeviceSchema);
export default NetworkDevice;
