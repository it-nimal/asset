// Device-type dynamic specifications field definitions
export const SPEC_FIELDS = {
  'Laptop': [
    { key: 'processor', label: 'Processor', type: 'text', placeholder: 'e.g. Intel Core i5-1340P' },
    { key: 'generation', label: 'Generation', type: 'text', placeholder: 'e.g. 13th Gen / Ryzen 5' },
    { key: 'ram', label: 'RAM Capacity', type: 'select', options: ['4 GB', '8 GB', '16 GB', '32 GB', '64 GB'] },
    { key: 'storage', label: 'Storage', type: 'text', placeholder: 'e.g. 512 GB NVMe SSD' },
    { key: 'screenSize', label: 'Screen Size', type: 'text', placeholder: 'e.g. 14" / 15.6"' },
    { key: 'os', label: 'Operating System', type: 'select', options: ['Windows 11 Pro', 'Windows 10 Pro', 'Ubuntu Linux', 'macOS', 'DOS / None'] },
  ],

  'Desktop PC': [
    { key: 'processor', label: 'Processor', type: 'text', placeholder: 'e.g. Intel Core i5-12400' },
    { key: 'generation', label: 'Generation', type: 'text', placeholder: 'e.g. 12th Gen' },
    { key: 'ram', label: 'RAM Capacity', type: 'select', options: ['4 GB', '8 GB', '16 GB', '32 GB', '64 GB'] },
    { key: 'ramType', label: 'RAM Type', type: 'select', options: ['DDR4', 'DDR5'] },
    { key: 'storage', label: 'Primary Storage', type: 'text', placeholder: 'e.g. 512 GB SSD' },
    { key: 'storageType', label: 'Storage Type', type: 'select', options: ['NVMe M.2 SSD', 'SATA SSD', 'HDD 1TB', 'SSD + HDD'] },
    { key: 'graphics', label: 'Graphics Card', type: 'select', options: ['Integrated Graphics', 'Dedicated NVIDIA', 'Dedicated AMD'] },
    { key: 'os', label: 'Operating System', type: 'select', options: ['Windows 11 Pro', 'Windows 10 Pro', 'Ubuntu Linux', 'DOS / None'] },
  ],

  'All-in-One PC': [
    { key: 'processor', label: 'Processor', type: 'text', placeholder: 'e.g. Intel Core i5' },
    { key: 'ram', label: 'RAM Capacity', type: 'select', options: ['8 GB', '16 GB', '32 GB'] },
    { key: 'storage', label: 'Storage', type: 'text', placeholder: 'e.g. 512 GB SSD' },
    { key: 'screenSize', label: 'Display Size', type: 'text', placeholder: 'e.g. 23.8" FHD' },
    { key: 'os', label: 'Operating System', type: 'select', options: ['Windows 11 Pro', 'Windows 10 Pro', 'Ubuntu', 'None'] },
  ],

  'Workstation': [
    { key: 'processor', label: 'Workstation CPU', type: 'text', placeholder: 'e.g. Intel Xeon / Core i7 / i9' },
    { key: 'ram', label: 'RAM Capacity', type: 'select', options: ['16 GB', '32 GB', '64 GB', '128 GB'] },
    { key: 'ramType', label: 'RAM Type', type: 'select', options: ['DDR4 ECC', 'DDR5 ECC', 'Non-ECC'] },
    { key: 'storage', label: 'Storage', type: 'text', placeholder: 'e.g. 1TB NVMe + 2TB HDD' },
    { key: 'graphics', label: 'GPU / Quadro', type: 'text', placeholder: 'e.g. NVIDIA RTX A2000 6GB' },
    { key: 'os', label: 'Operating System', type: 'select', options: ['Windows 11 Pro for Workstations', 'Windows 10 Pro', 'RHEL / Ubuntu', 'None'] },
  ],

  'Rack Server': [
    { key: 'cpuCount', label: 'CPU Sockets', type: 'select', options: ['1 Socket', '2 Sockets', '4 Sockets'] },
    { key: 'processor', label: 'Processor Model', type: 'text', placeholder: 'e.g. Intel Xeon Silver 4310' },
    { key: 'ram', label: 'Server RAM', type: 'select', options: ['32 GB', '64 GB', '128 GB', '256 GB', '512 GB'] },
    { key: 'raidController', label: 'RAID Controller', type: 'text', placeholder: 'e.g. PERC H740P 8GB' },
    { key: 'storageBays', label: 'Storage Configuration', type: 'text', placeholder: 'e.g. 8x 2.5" SAS / SATA' },
    { key: 'psu', label: 'Power Supply', type: 'select', options: ['Dual Redundant (Hot-plug)', 'Single PSU'] },
  ],

  'Storage Server / NAS': [
    { key: 'bays', label: 'Drive Bays', type: 'select', options: ['2-Bay', '4-Bay', '8-Bay', '12-Bay', '16-Bay', '24-Bay'] },
    { key: 'installedStorage', label: 'Installed Capacity', type: 'text', placeholder: 'e.g. 4x 4TB NAS Drives (16TB)' },
    { key: 'networkPorts', label: 'Network Ports', type: 'select', options: ['2x 1GbE', '4x 1GbE', '2x 10GbE SFP+'] },
    { key: 'raidSupport', label: 'RAID Levels', type: 'text', placeholder: 'RAID 0, 1, 5, 6, 10' },
  ],

  'Network Switch': [
    { key: 'ports', label: 'Port Count', type: 'select', options: ['8 Ports', '16 Ports', '24 Ports', '48 Ports'] },
    { key: 'portType', label: 'Port Speed', type: 'select', options: ['Gigabit 10/100/1000', 'Fast Ethernet', '10G SFP+'] },
    { key: 'poe', label: 'PoE Capability', type: 'select', options: ['Non-PoE', 'PoE+ (802.3at)', 'PoE (802.3af)'] },
    { key: 'poeBudget', label: 'PoE Power Budget', type: 'text', placeholder: 'e.g. 370W / N/A' },
    { key: 'uplinkPorts', label: 'Uplink Ports', type: 'text', placeholder: 'e.g. 4x 1G/10G SFP+' },
    { key: 'management', label: 'Switch Management', type: 'select', options: ['Managed Layer 2', 'Managed Layer 3', 'Smart / Web-Managed', 'Unmanaged'] },
  ],

  'Router / Gateway': [
    { key: 'wanPorts', label: 'WAN Ports', type: 'text', placeholder: 'e.g. 2x Gigabit WAN' },
    { key: 'lanPorts', label: 'LAN Ports', type: 'text', placeholder: 'e.g. 4x Gigabit LAN' },
    { key: 'throughput', label: 'Throughput', type: 'text', placeholder: 'e.g. 1 Gbps' },
    { key: 'vpnSupport', label: 'VPN Hardware Support', type: 'select', options: ['Yes (IPSec/SSL)', 'No'] },
    { key: 'formFactor', label: 'Form Factor', type: 'select', options: ['1U Rackmount', 'Desktop'] },
  ],

  'Hardware Firewall': [
    { key: 'firewallThroughput', label: 'Firewall Throughput', type: 'text', placeholder: 'e.g. 2 Gbps' },
    { key: 'threatProtection', label: 'IPS/Threat Throughput', type: 'text', placeholder: 'e.g. 800 Mbps' },
    { key: 'interfaces', label: 'Interfaces', type: 'text', placeholder: 'e.g. 8x GE RJ45, 2x SFP' },
    { key: 'licenseStatus', label: 'Bundled License', type: 'text', placeholder: 'e.g. 1-Year Unified Threat Protection' },
  ],

  'Wireless Access Point': [
    { key: 'wifiStandard', label: 'Wi-Fi Standard', type: 'select', options: ['Wi-Fi 6 (802.11ax)', 'Wi-Fi 5 (802.11ac Wave 2)', 'Wi-Fi 6E'] },
    { key: 'bands', label: 'Frequency Bands', type: 'select', options: ['Dual-Band (2.4 GHz + 5 GHz)', 'Tri-Band'] },
    { key: 'antenna', label: 'Antenna Type', type: 'select', options: ['Internal Omni', 'External Detachable'] },
    { key: 'poePowered', label: 'Power Source', type: 'select', options: ['PoE+ 802.3at', 'PoE 802.3af', '12V DC Adapter'] },
  ],

  'Printer': [
    { key: 'printType', label: 'Print Technology', type: 'select', options: ['Laser Monochrome', 'Laser Color', 'Ink Tank', 'Inkjet'] },
    { key: 'speed', label: 'Speed (PPM)', type: 'text', placeholder: 'e.g. 28 ppm' },
    { key: 'duplex', label: 'Automatic Duplex', type: 'select', options: ['Yes (Auto Two-Sided)', 'No (Manual)'] },
    { key: 'connectivity', label: 'Connectivity', type: 'select', options: ['USB Only', 'Network LAN + USB', 'Wi-Fi + Network + USB'] },
  ],

  'Scanner': [
    { key: 'scanType', label: 'Scanner Type', type: 'select', options: ['ADF Sheet-fed Scanner', 'Flatbed Scanner', 'Flatbed + ADF', 'Barcode Scanner'] },
    { key: 'speed', label: 'Scan Speed', type: 'text', placeholder: 'e.g. 35 ppm / 70 ipm' },
    { key: 'duplex', label: 'Duplex Scanning', type: 'select', options: ['Single-Pass Duplex', 'Simplex'] },
    { key: 'resolution', label: 'Optical Resolution', type: 'text', placeholder: 'e.g. 600 x 600 dpi' },
  ],

  'External Monitor': [
    { key: 'screenSize', label: 'Display Size', type: 'text', placeholder: 'e.g. 24" / 27"' },
    { key: 'resolution', label: 'Resolution', type: 'select', options: ['Full HD (1920x1080)', '2K QHD (2560x1440)', '4K UHD (3840x2160)'] },
    { key: 'panelType', label: 'Panel Type', type: 'select', options: ['IPS', 'VA', 'TN'] },
    { key: 'inputs', label: 'Input Ports', type: 'text', placeholder: 'e.g. HDMI + DisplayPort + VGA' },
  ],

  'Monitor': [
    { key: 'screenSize', label: 'Display Size', type: 'text', placeholder: 'e.g. 24"' },
    { key: 'resolution', label: 'Resolution', type: 'select', options: ['Full HD (1920x1080)', '2K QHD (2560x1440)', '4K UHD (3840x2160)'] },
    { key: 'panelType', label: 'Panel Type', type: 'select', options: ['IPS', 'VA', 'TN'] },
    { key: 'inputs', label: 'Input Ports', type: 'text', placeholder: 'e.g. HDMI + VGA' },
  ],

  'CCTV Camera': [
    { key: 'cameraType', label: 'Camera Technology', type: 'select', options: ['IP Network Camera', 'HD Analog (TVI/AHD)', 'PTZ Camera'] },
    { key: 'resolution', label: 'Resolution', type: 'select', options: ['2 MP (1080p)', '4 MP (2K)', '5 MP', '8 MP (4K UHD)'] },
    { key: 'lens', label: 'Focal Length', type: 'text', placeholder: 'e.g. 2.8 mm Fixed / 2.8-12 mm Varifocal' },
    { key: 'nightVision', label: 'Night Vision / IR Range', type: 'text', placeholder: 'e.g. IR 30 meters / ColorVu' },
    { key: 'housing', label: 'Form Factor / Rating', type: 'select', options: ['Dome (Indoor)', 'Bullet (Outdoor IP67)', 'Turret'] },
  ],

  'NVR': [
    { key: 'channels', label: 'Channel Capacity', type: 'select', options: ['4 Channels', '8 Channels', '16 Channels', '32 Channels', '64 Channels'] },
    { key: 'poePorts', label: 'Built-in PoE Ports', type: 'select', options: ['4 PoE Ports', '8 PoE Ports', '16 PoE Ports', 'None (Separate Switch)'] },
    { key: 'hddBays', label: 'SATA HDD Bays', type: 'select', options: ['1 HDD Bay', '2 HDD Bays', '4 HDD Bays', '8 HDD Bays'] },
    { key: 'maxResolution', label: 'Max Recording Resolution', type: 'select', options: ['4K / 8MP', '5 MP', '1080p'] },
  ],

  'DVR': [
    { key: 'channels', label: 'BNC Channels', type: 'select', options: ['4 Channels', '8 Channels', '16 Channels', '32 Channels'] },
    { key: 'hddBays', label: 'HDD Bays', type: 'select', options: ['1 HDD Bay', '2 HDD Bays'] },
    { key: 'resolution', label: 'Max Analog Resolution', type: 'select', options: ['5 MP Lite', '1080p FHD', '720p'] },
  ],

  'UPS / Inverter': [
    { key: 'capacity', label: 'Capacity (VA / Watts)', type: 'text', placeholder: 'e.g. 650 VA / 360W or 2 KVA / 1800W' },
    { key: 'topology', label: 'Topology', type: 'select', options: ['Line Interactive', 'Online Double Conversion', 'Offline / Standby'] },
    { key: 'batteryConfig', label: 'Battery Type', type: 'select', options: ['Internal SMF Battery', 'External Battery Bank (Tubular)'] },
  ],

  'UPS': [
    { key: 'capacity', label: 'Capacity (VA / Watts)', type: 'text', placeholder: 'e.g. 600 VA / 360W' },
    { key: 'topology', label: 'Topology', type: 'select', options: ['Line Interactive', 'Online Double Conversion'] },
    { key: 'batteryConfig', label: 'Battery Type', type: 'select', options: ['Internal SMF Battery', 'External Battery'] },
  ],

  'Tablet': [
    { key: 'screenSize', label: 'Screen Size', type: 'text', placeholder: 'e.g. 10.2" / 11"' },
    { key: 'storage', label: 'Internal Storage', type: 'select', options: ['32 GB', '64 GB', '128 GB', '256 GB'] },
    { key: 'connectivity', label: 'Connectivity', type: 'select', options: ['Wi-Fi Only', 'Wi-Fi + 4G/5G LTE'] },
    { key: 'os', label: 'Operating System', type: 'select', options: ['Android', 'iPadOS', 'Windows'] },
  ],

  'Smartphone': [
    { key: 'storage', label: 'Internal Storage', type: 'select', options: ['64 GB', '128 GB', '256 GB'] },
    { key: 'ram', label: 'RAM', type: 'select', options: ['4 GB', '6 GB', '8 GB'] },
    { key: 'sim', label: 'SIM Slots', type: 'select', options: ['Dual SIM', 'Single SIM + eSIM'] },
  ],

  'Barcode PDA / Handheld': [
    { key: 'scanEngine', label: 'Barcode Scan Engine', type: 'select', options: ['1D/2D Imager', 'Laser 1D Only'] },
    { key: 'os', label: 'Operating System', type: 'select', options: ['Android Enterprise', 'Windows CE/Embedded'] },
    { key: 'connectivity', label: 'Wireless', type: 'text', placeholder: 'Wi-Fi + Bluetooth + 4G' },
    { key: 'dropRating', label: 'IP / Drop Rating', type: 'text', placeholder: 'e.g. IP65, 1.5m drop' },
  ],

  'Biometric Attendance Device': [
    { key: 'authModes', label: 'Authentication Methods', type: 'text', placeholder: 'e.g. Fingerprint + Face + RFID Card' },
    { key: 'userCapacity', label: 'User Capacity', type: 'text', placeholder: 'e.g. 1,000 Faces / 3,000 Fingerprints' },
    { key: 'connectivity', label: 'Communication Interface', type: 'select', options: ['TCP/IP (LAN) + USB', 'Wi-Fi + LAN + USB', '4G Cellular'] },
  ],
};

export function getSpecFields(deviceType) {
  if (!deviceType) return [];
  const trimmed = deviceType.trim();
  if (SPEC_FIELDS[trimmed]) return SPEC_FIELDS[trimmed];

  const lower = trimmed.toLowerCase();
  for (const [key, fields] of Object.entries(SPEC_FIELDS)) {
    if (key.toLowerCase() === lower || lower.includes(key.toLowerCase())) {
      return fields;
    }
  }
  return [];
}

/**
 * Intelligently determines whether a hardware asset logically requires or supports
 * an IP address, Hostname, and LAN network configuration.
 *
 * Devices that DO NOT take an IP address:
 * - Mobile Phones / Smartphones
 * - USB / Thermal / Label / Barcode Printers
 * - Document / Barcode Scanners
 * - Monitors / LCD Displays
 * - Keyboards, Mice, Webcams, Headsets
 * - UPS / Inverters, PDUs
 *
 * Devices that DO take an IP address:
 * - Desktop PC, Laptop, All-in-One PC, Workstation
 * - Rack Server, Storage Server / NAS
 * - Managed Switches, Routers, Hardware Firewalls, Wireless APs
 * - Network / LAN Printers (only if explicitly networked LAN/Ethernet, not USB)
 * - IP CCTV Cameras, NVRs
 * - Biometric Attendance Devices (TCP/IP LAN)
 */
export function isNetworkDevice(deviceType, details = {}) {
  if (!deviceType && !details.category) return false;
  const dt = String(deviceType || '').trim().toLowerCase();
  const cat = String(details.category || '').trim().toLowerCase();

  // 1. Explicit non-network categories
  if (cat === 'displays' || cat === 'mobile' || cat === 'power') {
    if (!dt.includes('biometric')) {
      return false;
    }
  }

  // 2. Explicit non-network devices and peripherals
  if (
    dt.includes('phone') ||
    dt.includes('smartphone') ||
    dt.includes('mobile') ||
    dt.includes('scanner') ||
    dt.includes('barcode') ||
    dt.includes('label') ||
    dt.includes('thermal') ||
    dt.includes('monitor') ||
    dt.includes('display') ||
    dt.includes('lcd') ||
    dt.includes('ups') ||
    dt.includes('inverter') ||
    dt.includes('pdu') ||
    dt.includes('keyboard') ||
    dt.includes('mouse') ||
    dt.includes('headset') ||
    dt.includes('headphone') ||
    dt.includes('webcam') ||
    dt.includes('projector') ||
    dt.includes('drive') ||
    dt.includes('dock') ||
    dt.includes('dongle') ||
    dt.includes('cable') ||
    dt.includes('adapter')
  ) {
    return false;
  }

  // 3. Printers: Only network-enabled printers (never USB or label printers)
  if (cat === 'printers' || dt.includes('printer') || dt.includes('copier')) {
    if (dt.includes('usb') || dt.includes('label') || dt.includes('barcode') || dt.includes('thermal')) {
      return false;
    }
    const conn = String(details.connectivity || details.connectivityPorts || '').toLowerCase();
    if (
      conn.includes('usb only') ||
      (conn.includes('usb') && !conn.includes('lan') && !conn.includes('ethernet') && !conn.includes('network') && !conn.includes('wi-fi') && !conn.includes('wifi'))
    ) {
      return false;
    }
    return (
      dt.includes('network') ||
      dt.includes('copier') ||
      dt.includes('lan') ||
      conn.includes('lan') ||
      conn.includes('ethernet') ||
      conn.includes('network')
    );
  }

  // 4. Computing, Servers & Network Infrastructure
  if (
    cat === 'computing' ||
    cat === 'servers' ||
    cat === 'network' ||
    dt.includes('desktop') ||
    dt.includes('laptop') ||
    dt.includes('all-in-one') ||
    dt.includes('all in one') ||
    dt.includes('workstation') ||
    dt.includes('server') ||
    dt.includes('nas') ||
    dt.includes('switch') ||
    dt.includes('router') ||
    dt.includes('gateway') ||
    dt.includes('firewall') ||
    dt.includes('access point') ||
    dt.includes('nvr') ||
    dt.includes('ip camera') ||
    dt.includes('biometric')
  ) {
    return true;
  }

  return false;
}

