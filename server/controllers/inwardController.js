import {
  Asset,
  User,
  Employee,
  Department,
  Location,
  Vendor,
  Software,
  NetworkDevice,
  Maintenance,
  AuditLog,
  Notification,
  PurchaseOrder,
  Invoice,
  MasterSetting,
  Inward,
  Transfer,
} from '../models/Asset.js';
import { isDBConnected } from '../config/db.js';

// ==========================================
// INWARDCONTROLLER
// ==========================================

export const getInwards = async (req, res) => {
  try {
    const { status, vendor, category, search } = req.query;
    const query = {};
    if (status && status !== 'All') query.status = status;
    if (vendor && vendor !== 'All') query.vendor = vendor;
    if (category && category !== 'All') query.category = category;

    if (search && search.trim()) {
      const q = search.trim();
      query.$or = [
        { inwardNumber: { $regex: q, $options: 'i' } },
        { vendor: { $regex: q, $options: 'i' } },
        { invoiceNumber: { $regex: q, $options: 'i' } },
        { purchaseOrderNumber: { $regex: q, $options: 'i' } },
        { poNumber: { $regex: q, $options: 'i' } },
        { manufacturer: { $regex: q, $options: 'i' } },
        { model: { $regex: q, $options: 'i' } },
        { remarks: { $regex: q, $options: 'i' } },
      ];
    }

    const inwards = await Inward.find(query).sort({ receivedDate: -1, createdAt: -1 });
    res.status(200).json({ success: true, data: inwards });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getInwardById = async (req, res) => {
  try {
    const inward = await Inward.findById(req.params.id).populate('createdAssets');
    if (!inward) return res.status(404).json({ success: false, message: 'Inward entry not found' });
    res.status(200).json({ success: true, data: inward });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createInward = async (req, res) => {
  try {
    let { inwardNumber } = req.body;
    if (!inwardNumber) {
      const year = new Date().getFullYear();
      const count = await Inward.countDocuments();
      inwardNumber = `INW-VIT-${year}-${String(count + 1).padStart(4, '0')}`;
    }
    const inward = await Inward.create({ ...req.body, inwardNumber });
    res.status(201).json({ success: true, data: inward, message: 'Inward procurement entry logged successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateInward = async (req, res) => {
  try {
    const inward = await Inward.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!inward) return res.status(404).json({ success: false, message: 'Inward entry not found' });
    res.status(200).json({ success: true, data: inward, message: 'Inward entry updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyInward = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      verifiedBy = 'IT Admin',
      verificationNotes = '',
      items = [],
      hasDiscrepancy = false,
      discrepancyReason = '',
    } = req.body;

    const inward = await Inward.findById(id);
    if (!inward) return res.status(404).json({ success: false, message: 'Inward entry not found' });

    inward.status = hasDiscrepancy ? 'Discrepancy' : 'Verified';
    inward.verificationDetails = {
      verifiedBy,
      verifiedAt: new Date(),
      verificationNotes,
      hasDiscrepancy,
      discrepancyReason,
    };
    if (items && items.length > 0) {
      inward.items = items;
    }
    await inward.save();

    res.status(200).json({
      success: true,
      data: inward,
      message: `Inward entry marked as ${inward.status}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAssetsFromInward = async (req, res) => {
  try {
    const { id } = req.params;
    const { assetList = [], actorName = 'IT Admin' } = req.body;

    const inward = await Inward.findById(id);
    if (!inward) return res.status(404).json({ success: false, message: 'Inward entry not found' });

    const createdAssets = [];
    const highestSnDoc = await Asset.findOne().sort({ sn: -1 });
    let nextSn = (highestSnDoc?.sn || 0) + 1;

    for (const item of assetList) {
      const serial = (item.serialNumber || item.sr || `SR-${Math.floor(100000 + Math.random() * 900000)}`).trim();
      const existingAsset = await Asset.findOne({ sr: serial });
      if (existingAsset) {
        continue;
      }

      const assetTag = item.assetTag || `AST-VIT-${String(nextSn).padStart(4, '0')}`;

      const newAsset = await Asset.create({
        sn: nextSn++,
        plant: inward.receivedAt || 'Vitromed',
        assetNo: assetTag,
        deviceType: item.deviceType || inward.deviceType || 'Laptop',
        category: item.category || inward.category || 'computing',
        make: item.make || item.manufacturer || inward.manufacturer || 'Dell',
        model: item.model || inward.model || 'Standard',
        sr: serial,
        vendorName: inward.vendor,
        inwardNumber: inward.inwardNumber,
        billNo: inward.invoiceNumber,
        po: inward.purchaseOrderNumber || inward.poNumber,
        purchaseDate: inward.invoiceDate || inward.inwardDate || new Date(),
        deliveryDate: inward.receivedDate || new Date(),
        status: 'Available',
        workingCondition: item.condition || 'Good',
        remarks: `Inwarded via ${inward.inwardNumber}`,
        specifications: { ...inward.specifications, ...item.specifications },
        history: [
          {
            action: 'Inward Created',
            date: new Date(),
            user: actorName,
            details: `Asset auto-created from Inward Receipt ${inward.inwardNumber} (Vendor: ${inward.vendor})`,
          },
        ],
      });

      createdAssets.push(newAsset);
      inward.createdAssets.push(newAsset._id);
    }

    inward.status = 'Asset Created';
    await inward.save();

    await AuditLog.create({
      user: actorName,
      role: 'IT Admin',
      action: 'Assets Generated from Inward',
      details: `Generated ${createdAssets.length} asset records from inward ${inward.inwardNumber}`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(201).json({
      success: true,
      count: createdAssets.length,
      data: createdAssets,
      inward,
      message: `Successfully created ${createdAssets.length} new inventory asset(s)!`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteInward = async (req, res) => {
  try {
    const inward = await Inward.findByIdAndDelete(req.params.id);
    if (!inward) return res.status(404).json({ success: false, message: 'Inward entry not found' });
    res.status(200).json({ success: true, message: `Inward entry ${inward.inwardNumber} deleted` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 10. PURCHASE ORDER CONTROLLERS
// ==========================================

