// Device-type to standard accessory checklist master
export const ACCESSORY_MASTER = {
  // Computers & Laptops
  'Laptop': ['Charger', 'Bag', 'Mouse', 'Docking Station'],
  'Desktop PC': ['Monitor/LCD', 'Keyboard', 'Mouse', 'Power Cable'],
  'All-in-One PC': ['Keyboard', 'Mouse', 'Power Cable'],
  'Workstation': ['Monitor/LCD', 'Keyboard', 'Mouse', 'Power Cable'],

  // Enterprise Servers
  'Rack Server': ['Power Cable', 'Network Cable', 'Rack Mount Kit'],
  'Storage Server / NAS': ['Power Cable', 'Network Cable', 'Rack Mount Kit'],
  'Blade Server': ['Power Cable', 'Rack Mount Kit', 'Chassis'],
  'Server': ['Power Cable', 'Network Cable', 'Rack Mount Kit'],

  // Network Infrastructure
  'Network Switch': ['Power Cable', 'Network/LAN Cable', 'Console Cable', 'Rack Mount Kit'],
  'Router / Gateway': ['Power Adapter', 'Network/LAN Cable', 'Console Cable', 'Rack Mount Kit'],
  'Hardware Firewall': ['Power Cable', 'Network/LAN Cable', 'Console Cable', 'Rack Mount Kit'],
  'Wireless Access Point': ['Power Adapter', 'PoE Injector', 'Network/LAN Cable', 'Mounting Kit'],
  'Access Point': ['Power Adapter', 'PoE Injector', 'Network/LAN Cable', 'Mounting Kit'],
  'Router': ['Power Adapter', 'Network/LAN Cable', 'Console Cable', 'Rack Mount Kit'],

  // Printers & Imaging
  'Printer': ['Power Cable', 'USB Cable', 'Network/LAN Cable', 'Toner/Cartridge'],
  'Scanner': ['Power Adapter', 'USB Cable'],
  'MFP / Copier': ['Power Cable', 'Network/LAN Cable', 'Toner'],
  'Barcode / Label Printer': ['Power Adapter', 'USB/LAN Cable', 'Label Roll'],
  'Barcode Scanner': ['USB Cable', 'Stand'],

  // Monitors & Displays
  'External Monitor': ['Power Cable', 'HDMI Cable', 'DisplayPort Cable', 'VGA Cable', 'Stand'],
  'Monitor': ['Power Cable', 'HDMI Cable', 'DisplayPort Cable', 'VGA Cable', 'Stand'],
  'Dual Monitor Setup': ['Monitor 2', 'Power Cable', 'Display Cable', 'Monitor Stand/Arm'],
  'Interactive Display / Signage': ['Power Cable', 'HDMI Cable', 'Remote', 'Mount/Stand'],

  // Mobile & Handhelds
  'Tablet': ['Charger', 'USB Cable', 'Case', 'Stylus'],
  'Smartphone': ['Charger', 'USB Cable', 'Case'],
  'Mobile': ['Charger', 'USB Cable', 'Case'],
  'Barcode PDA / Handheld': ['Charger', 'USB Cable', 'Charging Dock', 'Battery'],

  // Power & Infrastructure
  'UPS / Inverter': ['Power Cable', 'Battery', 'Battery Cable'],
  'UPS': ['Power Cable', 'Battery', 'Battery Cable'],
  'PDU': ['Power Cable', 'Rack Mount Kit'],
  'Biometric Attendance Device': ['Power Adapter', 'Network/LAN Cable', 'USB Cable', 'Mounting Kit'],

  // CCTV & Security
  'CCTV Camera': ['Power Adapter', 'Network/LAN Cable', 'Mount/Bracket', 'Junction Box'],
  'NVR': ['Power Cable', 'Hard Disk', 'Network/LAN Cable', 'HDMI/VGA Cable', 'Mouse'],
  'DVR': ['Power Cable', 'Hard Disk', 'Coaxial Cable', 'HDMI/VGA Cable', 'Mouse'],
  'CCTV Monitor': ['Power Cable', 'HDMI/VGA Cable'],

  // Other Hardware
  'Digital Projector': ['Power Cable', 'HDMI Cable', 'Remote', 'Mounting Kit', 'Carrying Bag'],
  'Projector': ['Power Cable', 'HDMI Cable', 'Remote', 'Mounting Kit', 'Carrying Bag'],
  'Web Camera': ['USB Cable', 'Mount'],
  'Conference Bar': ['Power Cable', 'USB Cable', 'HDMI Cable', 'Remote'],
  'External Backup Drive': ['USB Cable', 'Power Adapter', 'Carrying Case'],
  'Docking Station': ['Power Adapter', 'USB-C/Thunderbolt Cable', 'Display Cable'],
  'Laptop Bag': ['Bag Received'],
  'Custom Asset': [],
};

export function getAccessoriesForDevice(deviceType) {
  if (!deviceType) return ['Power Cable', 'Power Adapter'];
  const trimmed = deviceType.trim();
  if (ACCESSORY_MASTER[trimmed]) {
    return ACCESSORY_MASTER[trimmed];
  }
  // Case-insensitive lookup
  const lower = trimmed.toLowerCase();
  for (const [key, accs] of Object.entries(ACCESSORY_MASTER)) {
    if (key.toLowerCase() === lower || lower.includes(key.toLowerCase())) {
      return accs;
    }
  }
  return ['Power Cable', 'Power Adapter'];
}
