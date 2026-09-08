import {
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
  Asset,
} from '../models/Asset.js';

export const seedComprehensiveITAMData = async () => {
  console.log('[ITAM Seed] Clearing previous test data & generating enterprise dataset...');

  await Promise.all([
    User.deleteMany({}),
    Employee.deleteMany({}),
    Department.deleteMany({}),
    Location.deleteMany({}),
    Vendor.deleteMany({}),
    Software.deleteMany({}),
    NetworkDevice.deleteMany({}),
    Maintenance.deleteMany({}),
    AuditLog.deleteMany({}),
    Notification.deleteMany({}),
    Asset.deleteMany({}),
  ]);

  // 1. Seed Users (Roles)
  const users = await User.create([
    { name: 'Aditya Vikram', email: 'admin@vitromed.com', password: 'admin123', role: 'Super Admin', department: 'Executive Management' },
    { name: 'Pooja Verma', email: 'itadmin@vitromed.com', password: 'admin123', role: 'IT Admin', department: 'IT Infrastructure' },
    { name: 'Kunal Deshmukh', email: 'tech@vitromed.com', password: 'admin123', role: 'IT Technician', department: 'IT Hardware & Support' },
    { name: 'Neha Singhania', email: 'manager@vitromed.com', password: 'admin123', role: 'Manager', department: 'Engineering Operations' },
    { name: 'Rahul Sharma', email: 'employee@vitromed.com', password: 'admin123', role: 'Employee', department: 'Software Engineering' },
  ]);

  // 2. Seed Departments
  const departments = await Department.create([
    { name: 'IT Infrastructure & Software', code: 'DEPT-IT', manager: 'Pooja Verma', location: 'Vitromed HQ - Delhi NCR' },
    { name: 'Production & Manufacturing', code: 'DEPT-PRD', manager: 'Suresh Raina', location: 'Plant 1 - Bangalore' },
    { name: 'Quality Assurance & QC', code: 'DEPT-QA', manager: 'Dr. Anita Joshi', location: 'Plant 2 - Pune' },
    { name: 'Supply Chain & Logistics', code: 'DEPT-SCM', manager: 'Rajesh Mehra', location: 'Plant 3 - Jaipur' },
    { name: 'Human Resources & Finance', code: 'DEPT-HR', manager: 'Simran Chadha', location: 'Vitromed HQ - Delhi NCR' },
  ]);

  // 3. Seed Locations
  const locations = await Location.create([
    { name: 'Vitromed HQ - Delhi NCR', building: 'Cyber Tower 4', floor: '5th Floor', room: 'Server Room & Exec Bay', address: 'Plot 42, Udyog Vihar, Gurugram' },
    { name: 'Plant 1 - Bangalore', building: 'Factory Complex A', floor: 'Ground Floor', room: 'Plant IT Room', address: 'Peenya Industrial Area, Bengaluru' },
    { name: 'Plant 2 - Pune', building: 'Tech Park South', floor: '2nd Floor', room: 'QC Lab & Systems', address: 'Hinjawadi Phase 1, Pune' },
    { name: 'Plant 3 - Jaipur', building: 'Sitapura Facility', floor: '1st Floor', room: 'Admin Block', address: 'RIICO Industrial Area, Jaipur' },
    { name: 'Remote / Work From Home', building: 'Remote Cloud', floor: 'Distributed', room: 'Virtual Bay', address: 'All India Distributed' },
  ]);

  // 4. Seed Vendors
  const vendors = await Vendor.create([
    { name: 'Dell Direct Technologies India', contactPerson: 'Arun Khandelwal', email: 'sales@dell-india.com', phone: '+91-80-67123456', category: 'Laptops & Workstations' },
    { name: 'HP Enterprise India', contactPerson: 'Meera Nambiar', email: 'b2b@hpe.com', phone: '+91-11-49001122', category: 'Desktops & Printers' },
    { name: 'Cisco Systems India', contactPerson: 'Vikram Sethi', email: 'cisco.partner@cisco.com', phone: '+91-80-44220000', category: 'Networking Equipment' },
    { name: 'Apple Authorized Enterprise (Imagine)', contactPerson: 'Sunil Rao', email: 'enterprise@imagineonline.store', phone: '+91-9888012345', category: 'MacBooks & Tablets' },
    { name: 'Microsoft India Pvt Ltd', contactPerson: 'Karan Kapur', email: 'licensing@microsoft.com', phone: '+91-124-4158000', category: 'Cloud Software & OS' },
  ]);

  // 5. Seed Employees (20 Realistic Employees)
  const empList = [
    { employeeId: 'VIT-1001', name: 'Rahul Sharma', email: 'rahul.sharma@vitromed.com', phone: '+91-9876500001', department: 'IT Infrastructure & Software', designation: 'Sr. Software Architect', location: 'Vitromed HQ - Delhi NCR' },
    { employeeId: 'VIT-1002', name: 'Priya Pillai', email: 'priya.pillai@vitromed.com', phone: '+91-9876500002', department: 'IT Infrastructure & Software', designation: 'Full Stack Engineer', location: 'Vitromed HQ - Delhi NCR' },
    { employeeId: 'VIT-1003', name: 'Arjun Menon', email: 'arjun.menon@vitromed.com', phone: '+91-9876500003', department: 'Production & Manufacturing', designation: 'Plant Operations Lead', location: 'Plant 1 - Bangalore' },
    { employeeId: 'VIT-1004', name: 'Sneha Roy', email: 'sneha.roy@vitromed.com', phone: '+91-9876500004', department: 'Quality Assurance & QC', designation: 'Lead QC Auditor', location: 'Plant 2 - Pune' },
    { employeeId: 'VIT-1005', name: 'Vikas Gupta', email: 'vikas.gupta@vitromed.com', phone: '+91-9876500005', department: 'Supply Chain & Logistics', designation: 'Procurement Specialist', location: 'Plant 3 - Jaipur' },
    { employeeId: 'VIT-1006', name: 'Ananya Sen', email: 'ananya.sen@vitromed.com', phone: '+91-9876500006', department: 'Human Resources & Finance', designation: 'HR Business Partner', location: 'Vitromed HQ - Delhi NCR' },
    { employeeId: 'VIT-1007', name: 'Rohan Bose', email: 'rohan.bose@vitromed.com', phone: '+91-9876500007', department: 'IT Infrastructure & Software', designation: 'DevOps & Cloud Engineer', location: 'Remote / Work From Home' },
    { employeeId: 'VIT-1008', name: 'Divya Nair', email: 'divya.nair@vitromed.com', phone: '+91-9876500008', department: 'Production & Manufacturing', designation: 'Automation Engineer', location: 'Plant 1 - Bangalore' },
    { employeeId: 'VIT-1009', name: 'Manish Tiwari', email: 'manish.tiwari@vitromed.com', phone: '+91-9876500009', department: 'Quality Assurance & QC', designation: 'Senior QA Analyst', location: 'Plant 2 - Pune' },
    { employeeId: 'VIT-1010', name: 'Ritu Agarwal', email: 'ritu.agarwal@vitromed.com', phone: '+91-9876500010', department: 'Human Resources & Finance', designation: 'Finance Controller', location: 'Vitromed HQ - Delhi NCR' },
    { employeeId: 'VIT-1011', name: 'Karthik Raja', email: 'karthik.raja@vitromed.com', phone: '+91-9876500011', department: 'IT Infrastructure & Software', designation: 'Network Administrator', location: 'Vitromed HQ - Delhi NCR' },
    { employeeId: 'VIT-1012', name: 'Megha Singhal', email: 'megha.singhal@vitromed.com', phone: '+91-9876500012', department: 'Supply Chain & Logistics', designation: 'Warehouse In-charge', location: 'Plant 3 - Jaipur' },
    { employeeId: 'VIT-1013', name: 'Abhishek Das', email: 'abhishek.das@vitromed.com', phone: '+91-9876500013', department: 'Production & Manufacturing', designation: 'Safety & Compliance Lead', location: 'Plant 1 - Bangalore' },
    { employeeId: 'VIT-1014', name: 'Tanvi Saxena', email: 'tanvi.saxena@vitromed.com', phone: '+91-9876500014', department: 'Human Resources & Finance', designation: 'Talent Acquisition', location: 'Vitromed HQ - Delhi NCR' },
    { employeeId: 'VIT-1015', name: 'Siddharth Rao', email: 'siddharth.rao@vitromed.com', phone: '+91-9876500015', department: 'IT Infrastructure & Software', designation: 'Cybersecurity Analyst', location: 'Vitromed HQ - Delhi NCR' },
    { employeeId: 'VIT-1016', name: 'Ishaan Bajaj', email: 'ishaan.bajaj@vitromed.com', phone: '+91-9876500016', department: 'Quality Assurance & QC', designation: 'Lab Inward Officer', location: 'Plant 2 - Pune' },
    { employeeId: 'VIT-1017', name: 'Bhavna Kulkarni', email: 'bhavna.k@vitromed.com', phone: '+91-9876500017', department: 'Supply Chain & Logistics', designation: 'Dispatch Manager', location: 'Plant 3 - Jaipur' },
    { employeeId: 'VIT-1018', name: 'Varun Joshi', email: 'varun.joshi@vitromed.com', phone: '+91-9876500018', department: 'Production & Manufacturing', designation: 'Maintenance Supervisor', location: 'Plant 1 - Bangalore' },
    { employeeId: 'VIT-1019', name: 'Kavita Chawla', email: 'kavita.chawla@vitromed.com', phone: '+91-9876500019', department: 'Human Resources & Finance', designation: 'Accounts Executive', location: 'Vitromed HQ - Delhi NCR' },
    { employeeId: 'VIT-1020', name: 'Gaurav Dubey', email: 'gaurav.dubey@vitromed.com', phone: '+91-9876500020', department: 'IT Infrastructure & Software', designation: 'Helpdesk Technician', location: 'Vitromed HQ - Delhi NCR' },
  ];
  const employees = await Employee.create(empList);

  // 6. Seed Software (SAM - 10 Products)
  const softwareList = await Software.create([
    { softwareName: 'Microsoft 365 E5 Business', version: '2024 Cloud', vendor: 'Microsoft', licenseType: 'Subscription / Cloud', licenseKey: 'MS365-E5-VIT-9941', licenseCount: 150, usedLicenses: 86, cost: 450000, purchaseDate: new Date('2024-01-10'), expiryDate: new Date('2027-01-10') },
    { softwareName: 'QuickHeal Total Security Endpoint', version: 'v19.4', vendor: 'QuickHeal', licenseType: 'Volume', licenseKey: 'QH-EP-2024-8831', licenseCount: 120, usedLicenses: 95, cost: 180000, purchaseDate: new Date('2024-02-15'), expiryDate: new Date('2026-02-15') },
    { softwareName: 'Adobe Creative Cloud All Apps', version: '2024', vendor: 'Adobe Systems', licenseType: 'Subscription / Cloud', licenseKey: 'ADOBE-CC-VIT-041', licenseCount: 15, usedLicenses: 12, cost: 225000, purchaseDate: new Date('2024-03-01'), expiryDate: new Date('2025-03-01') },
    { softwareName: 'VMware vSphere Enterprise Plus', version: '8.0 Update 2', vendor: 'VMware / Broadcom', licenseType: 'Perpetual', licenseKey: 'VMW-VSPH-80-9921', licenseCount: 8, usedLicenses: 6, cost: 680000, purchaseDate: new Date('2023-06-20'), expiryDate: new Date('2028-06-20') },
    { softwareName: 'SAP S/4HANA Cloud ERP', version: '2308', vendor: 'SAP SE', licenseType: 'Subscription / Cloud', licenseKey: 'SAP-S4H-VIT-PROD', licenseCount: 200, usedLicenses: 142, cost: 1250000, purchaseDate: new Date('2023-11-15'), expiryDate: new Date('2026-11-15') },
    { softwareName: 'AutoCAD 2024 Plant Design', version: '2024.1', vendor: 'Autodesk', licenseType: 'Subscription / Cloud', licenseKey: 'ACAD-2024-VIT-44', licenseCount: 20, usedLicenses: 18, cost: 380000, purchaseDate: new Date('2024-04-10'), expiryDate: new Date('2025-04-10') },
    { softwareName: 'IntelliJ IDEA Ultimate', version: '2024.2', vendor: 'JetBrains', licenseType: 'Subscription / Cloud', licenseKey: 'JB-INTEL-VIT-88', licenseCount: 25, usedLicenses: 16, cost: 160000, purchaseDate: new Date('2024-05-12'), expiryDate: new Date('2025-05-12') },
    { softwareName: 'Jira Software & Confluence Cloud', version: 'Enterprise', vendor: 'Atlassian', licenseType: 'Subscription / Cloud', licenseKey: 'ATL-JIRA-VIT-99', licenseCount: 100, usedLicenses: 78, cost: 320000, purchaseDate: new Date('2024-01-01'), expiryDate: new Date('2025-12-31') },
    { softwareName: 'Veeam Backup & Replication v12', version: '12.1', vendor: 'Veeam Software', licenseType: 'Perpetual', licenseKey: 'VEEAM-BKP-VIT-12', licenseCount: 12, usedLicenses: 8, cost: 240000, purchaseDate: new Date('2023-08-15'), expiryDate: new Date('2026-08-15') },
    { softwareName: 'Red Hat Enterprise Linux Server', version: '9.3', vendor: 'Red Hat / IBM', licenseType: 'Subscription / Cloud', licenseKey: 'RHEL-93-VIT-SERVER', licenseCount: 16, usedLicenses: 14, cost: 280000, purchaseDate: new Date('2024-02-01'), expiryDate: new Date('2027-02-01') },
  ]);

  // 7. Seed Network Devices (10 Devices)
  const networkDevices = await NetworkDevice.create([
    { hostname: 'VIT-SW-CORE-01', deviceType: 'Switch', ipAddress: '192.168.1.1', managementIp: '10.10.1.1', macAddress: '00:1A:2B:3C:4D:01', serialNumber: 'CSCO-SW-9901', vendor: 'Cisco', model: 'Catalyst 9300-48P', firmwareVersion: '17.9.4', location: 'Vitromed HQ - Delhi NCR', rack: 'Rack-A01', uPosition: 'U40-U41', status: 'Online' },
    { hostname: 'VIT-SW-DIST-01', deviceType: 'Switch', ipAddress: '192.168.1.2', managementIp: '10.10.1.2', macAddress: '00:1A:2B:3C:4D:02', serialNumber: 'CSCO-SW-9902', vendor: 'Cisco', model: 'Catalyst 9200-24T', firmwareVersion: '17.9.4', location: 'Vitromed HQ - Delhi NCR', rack: 'Rack-A01', uPosition: 'U38', status: 'Online' },
    { hostname: 'VIT-FW-PALO-01', deviceType: 'Firewall', ipAddress: '192.168.1.254', managementIp: '10.10.1.254', macAddress: '00:1A:2B:3C:4D:03', serialNumber: 'PAN-FW-4401', vendor: 'Palo Alto Networks', model: 'PA-440 Next-Gen', firmwareVersion: 'PAN-OS 11.0', location: 'Vitromed HQ - Delhi NCR', rack: 'Rack-A01', uPosition: 'U42', status: 'Online' },
    { hostname: 'VIT-RTR-BORDER-01', deviceType: 'Router', ipAddress: '192.168.1.250', managementIp: '10.10.1.250', macAddress: '00:1A:2B:3C:4D:04', serialNumber: 'CSCO-ISR-4331', vendor: 'Cisco', model: 'ISR 4331 Security Gateway', firmwareVersion: '16.12.5', location: 'Vitromed HQ - Delhi NCR', rack: 'Rack-A01', uPosition: 'U36', status: 'Online' },
    { hostname: 'VIT-AP-FLOOR5-01', deviceType: 'Access Point', ipAddress: '192.168.1.15', managementIp: '10.10.1.15', macAddress: '00:1A:2B:3C:4D:05', serialNumber: 'CSCO-AP-9120-1', vendor: 'Cisco', model: 'Catalyst 9120AX Wi-Fi 6', firmwareVersion: 'v8.10', location: 'Vitromed HQ - Delhi NCR', rack: 'Ceiling Mount', uPosition: 'Bay-5', status: 'Online' },
    { hostname: 'BLR-SW-CORE-01', deviceType: 'Switch', ipAddress: '192.168.10.1', managementIp: '10.10.10.1', macAddress: '00:1A:2B:3C:4D:06', serialNumber: 'HPE-SW-BLR-01', vendor: 'HP Enterprise', model: 'Aruba CX 6200F 48G', firmwareVersion: '10.11.0001', location: 'Plant 1 - Bangalore', rack: 'Rack-B01', uPosition: 'U24', status: 'Online' },
    { hostname: 'PUN-SW-CORE-01', deviceType: 'Switch', ipAddress: '192.168.20.1', managementIp: '10.10.20.1', macAddress: '00:1A:2B:3C:4D:07', serialNumber: 'HPE-SW-PUN-01', vendor: 'HP Enterprise', model: 'Aruba CX 6100 24G', firmwareVersion: '10.11.0001', location: 'Plant 2 - Pune', rack: 'Rack-P01', uPosition: 'U20', status: 'Online' },
    { hostname: 'JAI-SW-CORE-01', deviceType: 'Switch', ipAddress: '192.168.30.1', managementIp: '10.10.30.1', macAddress: '00:1A:2B:3C:4D:08', serialNumber: 'CSCO-SW-JAI-01', vendor: 'Cisco', model: 'Catalyst 1000-24T', firmwareVersion: '15.2(7)E', location: 'Plant 3 - Jaipur', rack: 'Rack-J01', uPosition: 'U18', status: 'Online' },
    { hostname: 'VIT-SRV-HCI-01', deviceType: 'Server', ipAddress: '192.168.1.100', managementIp: '10.10.1.100', macAddress: '00:1A:2B:3C:4D:09', serialNumber: 'DELL-R750-01', vendor: 'Dell', model: 'PowerEdge R750 2U', firmwareVersion: 'iDRAC9 v7.0', location: 'Vitromed HQ - Delhi NCR', rack: 'Rack-A02', uPosition: 'U10-U11', status: 'Online' },
    { hostname: 'VIT-SRV-HCI-02', deviceType: 'Server', ipAddress: '192.168.1.101', managementIp: '10.10.1.101', macAddress: '00:1A:2B:3C:4D:10', serialNumber: 'DELL-R750-02', vendor: 'Dell', model: 'PowerEdge R750 2U', firmwareVersion: 'iDRAC9 v7.0', location: 'Vitromed HQ - Delhi NCR', rack: 'Rack-A02', uPosition: 'U12-U13', status: 'Online' },
  ]);

  // 8. Generate 52 Realistic Assets with varying categories, locations, assignees, and statuses
  const makesAndModels = {
    Laptop: [
      { make: 'Dell', model: 'Latitude 5440', proc: 'Intel Core i7-1365U', ram: '16 GB', storage: '512 GB NVMe SSD', price: 82000 },
      { make: 'Dell', model: 'XPS 15 9530', proc: 'Intel Core i9-13900H', ram: '32 GB', storage: '1 TB NVMe SSD', price: 165000 },
      { make: 'Lenovo', model: 'ThinkPad T14 Gen 4', proc: 'AMD Ryzen 7 PRO 7840U', ram: '16 GB', storage: '512 GB SSD', price: 89000 },
      { make: 'HP', model: 'EliteBook 840 G10', proc: 'Intel Core i5-1335U', ram: '16 GB', storage: '512 GB SSD', price: 78000 },
      { make: 'Apple', model: 'MacBook Pro 14" M3', proc: 'Apple M3 Pro 11-Core', ram: '18 GB', storage: '512 GB Unified SSD', price: 199000 },
      { make: 'Apple', model: 'MacBook Air 15" M2', proc: 'Apple M2 8-Core', ram: '16 GB', storage: '512 GB Unified SSD', price: 134000 },
    ],
    Desktop: [
      { make: 'Dell', model: 'OptiPlex 7010 Micro', proc: 'Intel Core i5-13500T', ram: '16 GB', storage: '512 GB SSD', price: 58000 },
      { make: 'HP', model: 'ProDesk 400 G9', proc: 'Intel Core i7-13700', ram: '32 GB', storage: '1 TB SSD', price: 72000 },
      { make: 'Lenovo', model: 'ThinkCentre M70q Tiny', proc: 'Intel Core i5-13400', ram: '16 GB', storage: '512 GB SSD', price: 55000 },
    ],
    Server: [
      { make: 'Dell', model: 'PowerEdge R750xs Rack Server', proc: '2x Intel Xeon Silver 4314 (32 Cores)', ram: '128 GB DDR4 ECC', storage: '4x 1.92TB Enterprise NVMe RAID-10', price: 450000 },
      { make: 'HP', model: 'ProLiant DL380 Gen10 Plus', proc: '2x Intel Xeon Gold 5318Y (48 Cores)', ram: '256 GB DDR4 ECC', storage: '8x 960GB SAS SSD RAID-5', price: 580000 },
    ],
    Workstation: [
      { make: 'Dell', model: 'Precision 5820 Tower', proc: 'Intel Xeon W-2245 (8 Cores, 4.5GHz)', ram: '64 GB ECC RAM', storage: '2 TB NVMe + NVIDIA RTX A4000 16GB', price: 245000 },
      { make: 'HP', model: 'Z4 G5 Workstation', proc: 'Intel Xeon W5-2455X', ram: '64 GB DDR5', storage: '2 TB NVMe + RTX A4500', price: 285000 },
    ],
    Monitor: [
      { make: 'Dell', model: 'UltraSharp U2723QE 27" 4K USB-C Hub', proc: 'N/A', ram: 'N/A', storage: 'N/A', price: 42000 },
      { make: 'HP', model: 'E24 G5 23.8" FHD IPS Monitor', proc: 'N/A', ram: 'N/A', storage: 'N/A', price: 16500 },
    ],
    Printer: [
      { make: 'HP', model: 'LaserJet Enterprise MFP M528dn', proc: 'N/A', ram: 'N/A', storage: 'N/A', price: 85000 },
      { make: 'Canon', model: 'imageRUNNER ADVANCE DX C3826i Color MFP', proc: 'N/A', ram: 'N/A', storage: 'N/A', price: 180000 },
    ],
    'Network Switch': [
      { make: 'Cisco', model: 'Catalyst 9200-48P PoE+ Switch', proc: 'N/A', ram: 'N/A', storage: 'N/A', price: 125000 },
    ],
    Tablet: [
      { make: 'Apple', model: 'iPad Air 11" M2 Wi-Fi 256GB', proc: 'Apple M2 Chip', ram: '8 GB', storage: '256 GB', price: 69000 },
    ],
  };

  const categories = Object.keys(makesAndModels);
  const assetDocs = [];
  const statusOptions = ['Assigned', 'Available', 'In Stock', 'Under Maintenance', 'Retired', 'Reserved'];

  for (let i = 1; i <= 52; i++) {
    // Determine category
    let cat = 'Laptop';
    if (i <= 26) cat = 'Laptop';
    else if (i <= 34) cat = 'Desktop';
    else if (i <= 38) cat = 'Monitor';
    else if (i <= 42) cat = 'Server';
    else if (i <= 45) cat = 'Workstation';
    else if (i <= 48) cat = 'Printer';
    else if (i <= 50) cat = 'Network Switch';
    else cat = 'Tablet';

    const models = makesAndModels[cat];
    const spec = models[i % models.length];

    // Status logic: first 20 assigned to the 20 employees
    let status = 'Available';
    let assignedEmp = null;
    if (i <= 20) {
      status = 'Assigned';
      assignedEmp = empList[i - 1];
    } else if (i === 21 || i === 22) {
      status = 'Under Maintenance';
    } else if (i === 23) {
      status = 'Retired';
    } else if (i === 24) {
      status = 'Reserved';
    } else {
      status = (i % 3 === 0) ? 'In Stock' : 'Available';
    }

    const pad = String(i).padStart(4, '0');
    const assetTag = `AST-VIT-${pad}`;
    const sr = `SR99${pad}XYZ`;
    const plant = assignedEmp ? assignedEmp.location : locations[i % locations.length].name;
    const dept = assignedEmp ? assignedEmp.department : departments[i % departments.length].name;

    // Purchase date (between 6 months and 2 years ago)
    const pDate = new Date();
    pDate.setDate(pDate.getDate() - (180 + (i * 12)));
    const wEndDate = new Date(pDate);
    wEndDate.setFullYear(pDate.getFullYear() + 3); // 3-year warranty

    assetDocs.push({
      assetNo: assetTag,
      sr: sr,
      plant: plant,
      deviceType: cat,
      make: spec.make,
      model: spec.model,
      processor: spec.proc,
      ramSize: spec.ram,
      storage: spec.storage,
      status: status,
      workingCondition: status === 'Retired' ? 'Fair' : (status === 'Under Maintenance' ? 'Damaged' : 'Excellent'),
      userName: assignedEmp ? assignedEmp.name : 'Unassigned',
      empCode: assignedEmp ? assignedEmp.employeeId : '',
      mailId: assignedEmp ? assignedEmp.email : '',
      department: dept,
      floorCabin: assignedEmp ? `${assignedEmp.designation} Station` : 'Main IT Stock Bay',
      indentNo: `IND-2024-${pad}`,
      po: `PO-VIT-2024-${pad}`,
      billNo: `INV-VIT-${9900 + i}`,
      vendorName: spec.make === 'Dell' ? 'Dell Direct Technologies India' : (spec.make === 'Apple' ? 'Apple Authorized Enterprise (Imagine)' : 'HP Enterprise India'),
      purchaseDate: pDate,
      deliveryDate: pDate,
      purchasePrice: spec.price,
      currentValue: Math.round(spec.price * 0.75),
      warrantyStartDate: pDate,
      warrantyEndDate: wEndDate,
      warrantyDetails: '3 Years Comprehensive On-Site ProSupport',
      osVersion: cat === 'Laptop' || cat === 'Desktop' || cat === 'Workstation' ? 'Windows 11 Pro Enterprise' : (cat === 'Server' ? 'Red Hat Enterprise Linux 9 / VMware ESXi' : 'Embedded Firmware'),
      windowsKey: `VK99-VIT-${pad}-KEY`,
      officeSoftware: 'Microsoft 365 E5 Apps',
      antivirus: 'QuickHeal Endpoint Security',
      hostName: `VIT-WKS-${pad}`,
      macAddress: `00:E0:4C:${String(i).padStart(2, '0')}:1A:8B`,
      ipAddress: `192.168.1.${100 + i}`,
      assignedDate: assignedEmp ? new Date('2024-03-01') : null,
      expectedReturnDate: assignedEmp ? new Date('2026-03-01') : null,
      remarks: `Enterprise IT asset provisioned by IT Support. Verified compliant with IT policy.`,
      history: [
        { action: 'Created', date: pDate, user: 'Pooja Verma (IT Admin)', details: `Inward gate entry completed against PO-VIT-2024-${pad}` },
        ...(assignedEmp ? [{ action: 'Assigned', date: new Date('2024-03-01'), user: 'Pooja Verma (IT Admin)', details: `Allocated to ${assignedEmp.name} (${assignedEmp.employeeId})` }] : []),
        ...(status === 'Under Maintenance' ? [{ action: 'Maintenance', date: new Date(), user: 'Kunal Deshmukh', details: 'Reported overheating issue. Sent for fan replacement.' }] : []),
      ],
    });
  }

  const assets = await Asset.create(assetDocs);

  // 9. Seed Maintenance Tickets
  const maintenanceTickets = await Maintenance.create([
    {
      ticketId: 'MNT-2024-001',
      assetTag: 'AST-VIT-0021',
      assetName: 'Dell Latitude 5440',
      technician: 'Kunal Deshmukh',
      issue: 'Intermittent screen flickering and battery draining fast',
      diagnosis: 'EDP display cable loose and battery health degraded to 64%',
      resolution: 'Replaced EDP display cable and installed genuine Dell 54Wh battery',
      cost: 5400,
      startDate: new Date('2024-08-10'),
      endDate: new Date('2024-08-12'),
      nextMaintenanceDate: new Date('2025-02-12'),
      status: 'Resolved',
    },
    {
      ticketId: 'MNT-2024-002',
      assetTag: 'AST-VIT-0022',
      assetName: 'HP EliteBook 840 G10',
      technician: 'Kunal Deshmukh',
      issue: 'CPU fan making loud grinding noise; thermal throttling under load',
      diagnosis: 'Bearing failure in primary cooling fan assembly',
      resolution: '',
      cost: 3200,
      startDate: new Date('2024-09-01'),
      status: 'In Progress',
    },
    {
      ticketId: 'MNT-2024-003',
      assetTag: 'AST-VIT-0048',
      assetName: 'HP LaserJet Enterprise MFP M528dn',
      technician: 'Arun Khandelwal (Vendor Tech)',
      issue: 'Paper jam sensor error 13.00.00 during high-speed batch printing',
      diagnosis: 'Paper pickup roller worn out and optical sensor dusty',
      resolution: 'Roller kit replaced and sensor cleaned',
      cost: 4500,
      startDate: new Date('2024-07-20'),
      endDate: new Date('2024-07-21'),
      nextMaintenanceDate: new Date('2025-01-20'),
      status: 'Resolved',
    },
  ]);

  // 10. Seed Audit Logs
  await AuditLog.create([
    { user: 'Aditya Vikram', role: 'Super Admin', action: 'System Initialized', assetTag: 'ALL', details: 'Full ITAM platform seeded with enterprise dataset', ipAddress: '127.0.0.1' },
    { user: 'Pooja Verma', role: 'IT Admin', action: 'Asset Assigned', assetTag: 'AST-VIT-0001', details: 'Assigned Dell Latitude 5440 to Rahul Sharma (VIT-1001)', ipAddress: '192.168.1.45' },
    { user: 'Pooja Verma', role: 'IT Admin', action: 'Asset Assigned', assetTag: 'AST-VIT-0005', details: 'Assigned MacBook Pro to Vikas Gupta (VIT-1005)', ipAddress: '192.168.1.45' },
    { user: 'Kunal Deshmukh', role: 'IT Technician', action: 'Maintenance Created', assetTag: 'AST-VIT-0022', details: 'Opened ticket MNT-2024-002 for fan thermal throttling', ipAddress: '192.168.1.88' },
    { user: 'Simran Chadha', role: 'Manager', action: 'Report Exported', assetTag: 'REPORTS', details: 'Exported Complete Asset Inventory CSV', ipAddress: '192.168.1.12' },
  ]);

  // 11. Seed Notifications
  await Notification.create([
    { title: '⚡ Warranty Expiry Alert', message: '3 hardware assets have warranties expiring within the next 30 days.', type: 'warranty', link: '/reports' },
    { title: '📜 Software License Alert', message: 'QuickHeal Endpoint has reached 80% license utilization (95/120 used).', type: 'license', link: '/software' },
    { title: '🔧 Active Maintenance', message: 'Ticket MNT-2024-002 (AST-VIT-0022) is currently In Progress.', type: 'maintenance', link: '/maintenance' },
    { title: '👤 New Asset Assigned', message: 'AST-VIT-0001 allocated to Rahul Sharma in IT Infrastructure.', type: 'assignment', link: '/assets' },
  ]);

  console.log(`[ITAM Seed] SUCCESS: Created ${assets.length} assets, ${employees.length} employees, ${softwareList.length} software, ${networkDevices.length} network devices!`);
  return {
    assetsCount: assets.length,
    employeesCount: employees.length,
    departmentsCount: departments.length,
    locationsCount: locations.length,
    vendorsCount: vendors.length,
    softwareCount: softwareList.length,
    networkDevicesCount: networkDevices.length,
  };
};