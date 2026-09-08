import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Asset, Department, Location, AuditLog } from '../models/Asset.js';

// Exact 124 records provided by the user
const rawData = [
  { sn: 1, plant: '22Godam', department: 'Admin', hostName: 'sachin', deviceType: 'Laptop', ipAddress: '192.168.8.75', remark: '' },
  { sn: 2, plant: '22Godam', department: 'Admin', hostName: 'babu', deviceType: 'Desktop', ipAddress: '192.168.8.22', remark: 'VNC Password = V!tr0', vncPassword: 'V!tr0' },
  { sn: 3, plant: '22Godam', department: 'Admin', hostName: 'reception', deviceType: 'All in One Desktop', ipAddress: '192.168.8.146', remark: '' },
  { sn: 4, plant: '22Godam', department: 'Marketing', hostName: 'pandita', deviceType: 'Laptop', ipAddress: '192.168.8.163', remark: '' },
  { sn: 5, plant: '22Godam', department: 'Avacara', hostName: 'avacara2', deviceType: 'All in One Desktop', ipAddress: '192.168.8.62', remark: '' },
  { sn: 6, plant: '22Godam', department: 'Avacara', hostName: 'Avacara', deviceType: 'Laptop', ipAddress: '192.168.8.117', remark: '' },
  { sn: 7, plant: '22Godam', department: 'Avacara', hostName: 'avacara3', deviceType: 'Laptop', ipAddress: '192.168.8.156', remark: '' },
  { sn: 8, plant: '22Godam', department: 'Accounts', hostName: 'Oswal', deviceType: 'Laptop', ipAddress: '192.168.8.141', remark: '' },
  { sn: 9, plant: '22Godam', department: 'Accounts', hostName: 'manju', deviceType: 'All in One Desktop', ipAddress: '192.168.8.28', remark: '' },
  { sn: 10, plant: '22Godam', department: 'Accounts', hostName: 'mukeshac', deviceType: 'Desktop', ipAddress: '192.168.8.29', remark: '' },
  { sn: 11, plant: '22Godam', department: 'Accounts', hostName: 'acc13', deviceType: 'Desktop', ipAddress: '192.168.8.132', remark: '' },
  { sn: 12, plant: '22Godam', department: 'Accounts', hostName: 'cash', deviceType: 'Desktop', ipAddress: '192.168.8.39', remark: '' },
  { sn: 13, plant: '22Godam', department: 'Accounts', hostName: 'computax', deviceType: 'Desktop', ipAddress: '192.168.8.31', remark: '' },
  { sn: 14, plant: '22Godam', department: 'Accounts', hostName: 'balwant', deviceType: 'Desktop', ipAddress: '192.168.8.36', remark: '' },
  { sn: 15, plant: '22Godam', department: 'Accounts', hostName: 'account8', deviceType: 'Desktop', ipAddress: '192.168.8.79', remark: '' },
  { sn: 16, plant: '22Godam', department: 'Accounts', hostName: 'jaya', deviceType: 'Laptop', ipAddress: '192.168.8.144', remark: '' },
  { sn: 17, plant: '22Godam', department: 'Accounts', hostName: 'acc1', deviceType: 'Desktop', ipAddress: '192.168.8.133', remark: '' },
  { sn: 18, plant: '22Godam', department: 'Accounts', hostName: 'acc2', deviceType: 'Desktop', ipAddress: '192.168.8.84', remark: '' },
  { sn: 19, plant: '22Godam', department: 'Accounts', hostName: 'acc16', deviceType: 'Desktop', ipAddress: '192.168.8.55', remark: '' },
  { sn: 20, plant: '22Godam', department: 'Accounts', hostName: 'acc4', deviceType: 'Desktop', ipAddress: '192.168.8.30', remark: '' },
  { sn: 21, plant: '22Godam', department: 'Accounts', hostName: 'acc7', deviceType: 'Desktop', ipAddress: '192.168.8.26', remark: '' },
  { sn: 22, plant: '22Godam', department: 'Accounts', hostName: 'acc8', deviceType: 'Desktop', ipAddress: '192.168.8.37', remark: '' },
  { sn: 23, plant: '22Godam', department: 'Accounts', hostName: 'CA1', deviceType: 'Laptop', ipAddress: '192.168.8.124', remark: '' },
  { sn: 24, plant: '22Godam', department: 'Accounts', hostName: 'CA2', deviceType: 'Laptop', ipAddress: '192.168.8.38', remark: '' },
  { sn: 25, plant: '22Godam', department: 'Accounts', hostName: 'CA3', deviceType: 'Laptop', ipAddress: '192.168.8.93', remark: '' },
  { sn: 26, plant: '22Godam', department: 'Accounts', hostName: 'ERP', deviceType: 'Laptop', ipAddress: '192.168.8.80', remark: '' },
  { sn: 27, plant: '22Godam', department: 'Accounts', hostName: 'ERP', deviceType: 'Laptop', ipAddress: '192.168.8.43', remark: '' },
  { sn: 28, plant: '22Godam', department: 'Accounts', hostName: 'purchase2', deviceType: 'Desktop', ipAddress: '192.168.8.114', remark: '' },
  { sn: 29, plant: '22Godam', department: 'Audit', hostName: 'Auditor', deviceType: 'Desktop', ipAddress: '192.168.8.40', remark: '' },
  { sn: 30, plant: '22Godam', department: 'Audit', hostName: 'Audit', deviceType: 'Desktop', ipAddress: '192.168.8.86', remark: '' },
  { sn: 31, plant: '22Godam', department: 'HRD', hostName: 'rajnath', deviceType: 'Laptop', ipAddress: '192.168.8.69', remark: '' },
  { sn: 32, plant: '22Godam', department: 'HRD', hostName: 'hrd', deviceType: 'Desktop', ipAddress: '192.168.8.35', remark: '' },
  { sn: 33, plant: '22Godam', department: 'HRD', hostName: 'Hrd-sez', deviceType: 'Desktop', ipAddress: '192.168.8.34', remark: '' },
  { sn: 34, plant: '22Godam', department: 'HRD', hostName: 'Sserver', deviceType: 'Desktop', ipAddress: '192.168.8.41', remark: '' },
  { sn: 35, plant: '22Godam', department: 'HRD', hostName: 'hrd6', deviceType: 'Desktop', ipAddress: '192.168.8.153', remark: '' },
  { sn: 36, plant: '22Godam', department: 'HRD', hostName: 'hrd4', deviceType: 'Desktop', ipAddress: '192.168.8.42', remark: '' },
  { sn: 37, plant: '22Godam', department: 'HRD', hostName: 'hrd2', deviceType: 'Desktop', ipAddress: '192.168.8.33', remark: '' },
  { sn: 38, plant: 'Sitapura', department: 'HRD', hostName: 'Training', deviceType: 'Laptop', ipAddress: '192.168.8.120', remark: '' },
  { sn: 39, plant: '22Godam', department: 'HRD', hostName: 'EHS2', deviceType: 'Laptop', ipAddress: '192.168.8.128', remark: '' },
  { sn: 40, plant: 'Sitapura', department: 'HRD', hostName: 'EHS', deviceType: 'Laptop', ipAddress: '192.168.8.137', remark: '' },
  { sn: 41, plant: '22Godam', department: 'Purchase', hostName: 'Navin', deviceType: 'Desktop', ipAddress: '192.168.8.126', remark: '' },
  { sn: 42, plant: '22Godam', department: 'Purchase', hostName: 'purchase', deviceType: 'Desktop', ipAddress: '192.168.8.44', remark: '' },
  { sn: 43, plant: '22Godam', department: 'Purchase', hostName: 'pur03', deviceType: 'Laptop', ipAddress: '192.168.8.143', remark: '' },
  { sn: 44, plant: '22Godam', department: 'Purchase', hostName: 'purchase3', deviceType: 'Desktop', ipAddress: '192.168.8.157', remark: '' },
  { sn: 45, plant: '22Godam', department: 'Production', hostName: 'sitaram', deviceType: 'Laptop', ipAddress: '192.168.8.59', remark: '' },
  { sn: 46, plant: '22Godam', department: 'Production', hostName: 'BMR', deviceType: 'Desktop', ipAddress: '192.168.8.51', remark: '' },
  { sn: 47, plant: '22Godam', department: 'Production', hostName: 'Label', deviceType: 'Desktop', ipAddress: '192.168.8.129', remark: '' },
  { sn: 48, plant: '22Godam', department: 'Production', hostName: 'pankaj', deviceType: 'Desktop', ipAddress: '192.168.8.61', remark: '' },
  { sn: 49, plant: '22Godam', department: 'Production', hostName: 'IV', deviceType: 'Desktop', ipAddress: '192.168.8.150', remark: '' },
  { sn: 50, plant: '22Godam', department: 'Production', hostName: 'NCR', deviceType: 'Desktop', ipAddress: '192.168.8.151', remark: '' },
  { sn: 51, plant: '22Godam', department: 'Production', hostName: 'VISHAWPAL', deviceType: 'Laptop', ipAddress: '192.168.8.94', remark: '' },
  { sn: 52, plant: '22Godam', department: 'Production', hostName: 'PRABHAS', deviceType: 'Desktop', ipAddress: '192.168.8.58', remark: '' },
  { sn: 53, plant: '22Godam', department: 'Production', hostName: 'Madhuvan', deviceType: 'Desktop', ipAddress: '192.168.8.85', remark: '' },
  { sn: 54, plant: '22Godam', department: 'Production', hostName: 'cath1', deviceType: 'Desktop', ipAddress: '192.168.8.112', remark: '' },
  { sn: 55, plant: '22Godam', department: 'Production', hostName: 'Cath1', deviceType: 'Laptop', ipAddress: '192.168.8.119', remark: '' },
  { sn: 56, plant: '22Godam', department: 'Production', hostName: 'cath1sap', deviceType: 'Desktop', ipAddress: '192.168.8.115', remark: '' },
  { sn: 57, plant: '22Godam', department: 'Production', hostName: 'ETO', deviceType: 'Desktop', ipAddress: '192.168.8.53', remark: '' },
  { sn: 58, plant: '22Godam', department: 'Production', hostName: 'PC-PROD-58', deviceType: 'Desktop', ipAddress: '192.168.8.159', remark: '' },
  { sn: 59, plant: '22Godam', department: 'Production', hostName: 'PC-PROD-59', deviceType: 'Desktop', ipAddress: '192.168.8.160', remark: '' },
  { sn: 60, plant: '22Godam', department: 'Production', hostName: 'purchase3', deviceType: 'Desktop', ipAddress: '192.168.8.60', remark: '' },
  { sn: 61, plant: '22Godam', department: 'Production', hostName: 'premprakash', deviceType: 'Desktop', ipAddress: '192.168.8.57', remark: '' },
  { sn: 62, plant: '22Godam', department: 'Production', hostName: 'cath2', deviceType: 'Desktop', ipAddress: '192.168.8.97', remark: '' },
  { sn: 63, plant: '22Godam', department: 'Production', hostName: 'CATH2PC', deviceType: 'Desktop', ipAddress: '192.168.8.25', remark: '' },
  { sn: 64, plant: '22Godam', department: 'Production', hostName: 'Urinebag', deviceType: 'Desktop', ipAddress: '192.168.8.121', remark: '' },
  { sn: 65, plant: '22Godam', department: 'Production', hostName: 'ppc2-bg', deviceType: 'Desktop', ipAddress: '192.168.8.54', remark: '' },
  { sn: 66, plant: '22Godam', department: 'OPEX', hostName: 'dinesh', deviceType: 'Laptop', ipAddress: '192.168.8.27', remark: '' },
  { sn: 67, plant: 'Sitapura', department: 'Moulding', hostName: 'yagendra', deviceType: 'Laptop', ipAddress: '192.168.8.56', remark: '' },
  { sn: 68, plant: '22Godam', department: 'OPEX', hostName: 'priya', deviceType: 'Laptop', ipAddress: '192.168.8.184', remark: '' },
  { sn: 69, plant: 'Sitapura', department: 'Tool Room', hostName: 'anil', deviceType: 'Laptop', ipAddress: '192.168.8.78', remark: '' },
  { sn: 70, plant: '22Godam', department: 'Tool Room', hostName: 'TR1', deviceType: 'Desktop', ipAddress: '192.168.8.92', remark: '' },
  { sn: 71, plant: '22Godam', department: 'Tool Room', hostName: 'Pro-e', deviceType: 'Desktop', ipAddress: '192.168.8.96', remark: '' },
  { sn: 72, plant: '22Godam', department: 'Tool Room', hostName: 'TR2', deviceType: 'Desktop', ipAddress: '192.168.8.113', remark: '' },
  { sn: 73, plant: '22Godam', department: 'Trocar', hostName: 'trocar', deviceType: 'Desktop', ipAddress: '192.168.8.131', remark: '' },
  { sn: 74, plant: '22Godam', department: 'Tubing', hostName: 'Tubing-bg', deviceType: 'Desktop', ipAddress: '192.168.8.142', remark: '' },
  { sn: 75, plant: '22Godam', department: 'Tubing', hostName: 'tubing2', deviceType: 'Desktop', ipAddress: '192.168.8.98', remark: '' },
  { sn: 76, plant: 'Sitapura', department: 'Quality Lab', hostName: 'vinod', deviceType: 'Laptop', ipAddress: '192.168.8.87', remark: '' },
  { sn: 77, plant: '22Godam', department: 'Quality Lab', hostName: 'Jagan', deviceType: 'Laptop', ipAddress: '192.168.8.130', remark: '' },
  { sn: 78, plant: '22Godam', department: 'Quality Lab', hostName: 'QC-1', deviceType: 'Desktop', ipAddress: '192.168.8.72', remark: '' },
  { sn: 79, plant: '22Godam', department: 'Quality Lab', hostName: 'QC-2', deviceType: 'Desktop', ipAddress: '192.168.8.74', remark: '' },
  { sn: 80, plant: '22Godam', department: 'Quality Lab', hostName: 'QC-3', deviceType: 'Desktop', ipAddress: '192.168.8.73', remark: '' },
  { sn: 81, plant: '22Godam', department: 'Quality Lab', hostName: 'QC-4', deviceType: 'Desktop', ipAddress: '192.168.8.99', remark: '' },
  { sn: 82, plant: '22Godam', department: 'Quality Lab', hostName: 'QC-9', deviceType: 'Desktop', ipAddress: '192.168.8.49', remark: '' },
  { sn: 83, plant: '22Godam', department: 'Quality Lab', hostName: 'QC-5', deviceType: 'Desktop', ipAddress: '192.168.8.116', remark: '' },
  { sn: 84, plant: '22Godam', department: 'Quality Lab', hostName: 'QC-6', deviceType: 'Desktop', ipAddress: '192.168.8.118', remark: '' },
  { sn: 85, plant: '22Godam', department: 'Quality Lab', hostName: 'QC-7', deviceType: 'Desktop', ipAddress: '192.168.8.89', remark: '' },
  { sn: 86, plant: '22Godam', department: 'Quality Lab', hostName: 'QC-LAB', deviceType: 'Desktop', ipAddress: '192.168.8.138', remark: '' },
  { sn: 87, plant: '22Godam', department: 'ETO & Dispatch', hostName: 'Dispatch', deviceType: 'Desktop', ipAddress: '192.168.8.90', remark: '' },
  { sn: 88, plant: '22Godam', department: 'ETO & Dispatch', hostName: 'Dispatch', deviceType: 'Desktop', ipAddress: '192.168.8.52', remark: '' },
  { sn: 89, plant: '22Godam', department: 'ETO & Dispatch', hostName: 'Dispatch2', deviceType: 'Desktop', ipAddress: '192.168.8.32', remark: '' },
  { sn: 90, plant: '22Godam', department: 'ETO & Dispatch', hostName: 'Dispatch3', deviceType: 'Desktop', ipAddress: '192.168.8.125', remark: '' },
  { sn: 91, plant: '22Godam', department: 'ETO & Dispatch', hostName: 'Dispatch4', deviceType: 'Desktop', ipAddress: '192.168.8.176', remark: '' },
  { sn: 92, plant: '22Godam', department: 'ETO & Dispatch', hostName: 'subhash', deviceType: 'Desktop', ipAddress: '192.168.8.158', remark: '' },
  { sn: 93, plant: '22Godam', department: 'Store (Metal gate)', hostName: 'metalgate', deviceType: 'Desktop', ipAddress: '192.168.8.50', remark: '' },
  { sn: 94, plant: '22Godam', department: 'Store (Metal gate)', hostName: 'punit', deviceType: 'Desktop', ipAddress: '192.168.8.46', remark: '' },
  { sn: 95, plant: '22Godam', department: 'Store (Main Store)', hostName: 'Manoj', deviceType: 'Desktop', ipAddress: '192.168.8.48', remark: '' },
  { sn: 96, plant: '22Godam', department: 'Store (Main Store)', hostName: 'storepc', deviceType: 'Desktop', ipAddress: '192.168.8.47', remark: '' },
  { sn: 97, plant: '22Godam', department: 'Store (Component)', hostName: 'pandey', deviceType: 'Desktop', ipAddress: '192.168.8.63', remark: '' },
  { sn: 98, plant: '22Godam', department: 'Store (Component)', hostName: 'component2', deviceType: 'Desktop', ipAddress: '192.168.8.88', remark: '' },
  { sn: 99, plant: '22Godam', department: 'Store (Duplex & MFG)', hostName: 'Store5', deviceType: 'Desktop', ipAddress: '192.168.8.76', remark: '' },
  { sn: 100, plant: '22Godam', department: 'Maintenance', hostName: 'Trilok', deviceType: 'Laptop', ipAddress: '192.168.8.183', remark: '' },
  { sn: 101, plant: '22Godam', department: 'Maintenance', hostName: 'Arif', deviceType: 'Desktop', ipAddress: '192.168.8.83', remark: '' },
  { sn: 102, plant: '22Godam', department: 'Maintenance', hostName: 'BHISHAM', deviceType: 'Desktop', ipAddress: '192.168.8.82', remark: '' },
  { sn: 103, plant: '22Godam', department: 'Maintenance', hostName: 'maintstore', deviceType: 'Desktop', ipAddress: '192.168.8.45', remark: '' },
  { sn: 104, plant: '22Godam', department: 'JPPL', hostName: 'PC-JPPL-104', deviceType: 'Laptop', ipAddress: '192.168.8.177', remark: '' },
  { sn: 105, plant: '22Godam', department: 'JPPL', hostName: 'PC-JPPL-105', deviceType: 'Laptop', ipAddress: '192.168.8.178', remark: '' },
  { sn: 106, plant: '22Godam', department: 'JPPL', hostName: 'rajeshr', deviceType: 'Desktop', ipAddress: '192.168.8.23', remark: '' },
  { sn: 107, plant: '22Godam', department: 'JPPL', hostName: 'jpplstore', deviceType: 'Desktop', ipAddress: '192.168.8.161', remark: '' },
  { sn: 108, plant: '22Godam', department: 'JPPL', hostName: 'jpplqc', deviceType: 'Desktop', ipAddress: '192.168.8.162', remark: '' },
  { sn: 109, plant: '22Godam', department: 'JPPL', hostName: 'manoj', deviceType: 'Desktop', ipAddress: '192.168.8.24', remark: '' },
  { sn: 110, plant: '22Godam', department: 'JPPL', hostName: 'jppl', deviceType: 'Desktop', ipAddress: '192.168.8.127', remark: '' },
  { sn: 111, plant: '22Godam', department: 'JPPL', hostName: 'design', deviceType: 'Desktop', ipAddress: '192.168.8.140', remark: '' },
  { sn: 112, plant: '22Godam', department: 'JPPL', hostName: 'PC-JPPL-112', deviceType: 'Desktop', ipAddress: '192.168.8.179', remark: '' },
  { sn: 113, plant: '22Godam', department: 'JPPL', hostName: 'PC-JPPL-113', deviceType: 'Desktop', ipAddress: '192.168.8.180', remark: '' },
  { sn: 114, plant: '22Godam', department: 'JPPL', hostName: 'PC-JPPL-114', deviceType: 'Desktop', ipAddress: '192.168.8.181', remark: '' },
  { sn: 115, plant: '22Godam', department: 'JPPL', hostName: 'Damperlab', deviceType: 'Desktop', ipAddress: '192.168.8.149', remark: '' },
  { sn: 116, plant: '22Godam', department: 'JPPL', hostName: 'jppl2', deviceType: 'Desktop', ipAddress: '192.168.8.174', remark: '' },
  { sn: 117, plant: '22Godam', department: 'JPPL', hostName: 'Damper', deviceType: 'Desktop', ipAddress: '192.168.8.122', remark: '' },
  { sn: 118, plant: '22Godam', department: 'JPPL', hostName: 'Heico2', deviceType: 'Desktop', ipAddress: '192.168.8.182', remark: '' },
  { sn: 119, plant: '22Godam', department: 'Moulding', hostName: 'arsad', deviceType: 'Laptop', ipAddress: '192.168.8.152', remark: '' },
  { sn: 120, plant: '22Godam', department: 'Moulding', hostName: 'mld1', deviceType: 'Desktop', ipAddress: '192.168.8.71', remark: '' },
  { sn: 121, plant: '22Godam', department: 'Moulding', hostName: 'mld2', deviceType: 'Desktop', ipAddress: '192.168.8.77', remark: '' },
  { sn: 122, plant: '22Godam', department: 'IT', hostName: 'NTLIT', deviceType: 'Laptop', ipAddress: '192.168.8.221', remark: '' },
  { sn: 123, plant: '22Godam', department: 'IT', hostName: 'IT', deviceType: 'Desktop', ipAddress: '192.168.8.91', remark: '' },
  { sn: 124, plant: '22Godam', department: 'IT', hostName: 'CCTVIT', deviceType: 'Laptop', ipAddress: '192.168.8.123', remark: '' },
];

export const feedRealUserData = async () => {
  console.log('[Real Data Ingestion] Starting import of 124 hardware systems...');
  
  // Wipe current assets so only the user's real data is present
  await Asset.deleteMany({});

  const assetDocs = [];
  const deptSet = new Set();
  const locationSet = new Set();

  for (const item of rawData) {
    const pad = String(item.sn).padStart(4, '0');
    const assetTag = `AST-VIT-${pad}`;
    const serialNo = `SR-VIT-${pad}`;
    
    // Determine plausible custodian name or assign directly
    const custodian = item.hostName && !item.hostName.startsWith('PC-') && !item.hostName.includes('-') && !['Audit', 'Auditor', 'cash', 'computax', 'reception', 'metalgate', 'storepc', 'trocar', 'design', 'jppl', 'Damper', 'Damperlab', 'Heico2'].includes(item.hostName.toLowerCase())
      ? item.hostName
      : 'Unassigned';

    deptSet.add(item.department);
    locationSet.add(item.plant);

    assetDocs.push({
      plant: item.plant,
      assetNo: assetTag,
      userName: custodian,
      department: item.department,
      deviceType: item.deviceType,
      make: item.deviceType === 'Laptop' ? 'Dell' : (item.deviceType === 'All in One Desktop' ? 'HP' : 'Dell'),
      model: item.deviceType === 'Laptop' ? 'Latitude Series' : (item.deviceType === 'All in One Desktop' ? 'ProOne AIO' : 'OptiPlex Workstation'),
      sr: serialNo,
      processor: item.deviceType === 'Laptop' ? 'Intel Core i5' : 'Intel Core i3 / i5',
      ramSize: '8 GB',
      storage: '512 GB SSD',
      osVersion: 'Windows 10 / 11 Pro',
      hostName: item.hostName,
      ipAddress: item.ipAddress,
      vncPassword: item.vncPassword || '',
      status: custodian !== 'Unassigned' ? 'Assigned' : 'Available',
      workingCondition: 'Good',
      remarks: item.remark || (item.vncPassword ? `VNC Password = ${item.vncPassword}` : ''),
      history: [
        {
          action: 'Created',
          date: new Date(),
          user: 'System Ingestion',
          details: `Imported from company inventory master roster (S/N: ${item.sn}, Host: ${item.hostName}, IP: ${item.ipAddress})`,
        },
      ],
    });
  }

  const createdAssets = await Asset.create(assetDocs);

  // Sync Departments in DB
  let deptIdx = 1;
  for (const deptName of deptSet) {
    await Department.findOneAndUpdate(
      { name: deptName },
      { name: deptName, location: '22Godam', code: `DEPT-${deptIdx++}` },
      { upsert: true }
    );
  }

  // Sync Locations in DB
  for (const locName of locationSet) {
    await Location.findOneAndUpdate(
      { name: locName },
      { name: locName, address: `${locName} Industrial Facility, Jaipur`, building: 'Main Unit' },
      { upsert: true }
    );
  }

  // Record Audit Log entry
  await AuditLog.create({
    user: 'IT Administrator',
    role: 'IT Admin',
    action: 'Bulk Data Ingestion',
    assetTag: 'ALL-124',
    details: 'Imported 124 real company production systems from roster (22Godam & Sitapura plants)',
    ipAddress: '127.0.0.1',
  });

  console.log(`[Real Data Ingestion] SUCCESS: Imported ${createdAssets.length} systems successfully!`);
  return createdAssets.length;
};

// Run directly if invoked via node
if (process.argv[1]?.includes('feedUserData.js')) {
  connectDB().then(async (connected) => {
    if (connected) {
      await feedRealUserData();
      process.exit(0);
    } else {
      console.error('Failed to connect to database');
      process.exit(1);
    }
  });
}
