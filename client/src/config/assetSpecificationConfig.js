/**
 * Startup-Friendly IT Asset Specification & Category Configuration
 * Supports 10 core categories with dynamic device types and field definitions.
 */

export const INWARD_CATEGORIES = [
  'Computers & Laptops',
  'Enterprise Servers',
  'Network Infrastructure',
  'Printers & Imaging',
  'Monitors & Displays',
  'Mobile & Handhelds',
  'Power & Infrastructure',
  'CCTV & Surveillance',
  'Cables & Connectivity',
  'Other Hardware',
];

export const DEVICE_TYPES_BY_CATEGORY = {
  'Computers & Laptops': [
    'Laptop',
    'Desktop',
    'Workstation',
    'Mini PC',
    'Thin Client',
    'Other',
  ],
  'Enterprise Servers': [
    'Rack Server',
    'Tower Server',
    'Blade Server',
    'Storage Server',
    'Other',
  ],
  'Network Infrastructure': [
    'Switch',
    'Router',
    'Firewall',
    'Access Point',
    'Wireless Controller',
    'Network Appliance',
    'Other',
  ],
  'Printers & Imaging': [
    'Laser Printer',
    'Inkjet Printer',
    'Multifunction Printer',
    'Scanner',
    'Barcode Printer',
    'Other',
  ],
  'Monitors & Displays': [
    'Monitor',
    'TV Display',
    'Projector',
    'Digital Display',
    'Other',
  ],
  'Mobile & Handhelds': [
    'Mobile Phone',
    'Tablet',
    'Handheld Scanner',
    'Other',
  ],
  'Power & Infrastructure': [
    'UPS',
    'Inverter',
    'PDU',
    'Power Backup',
    'Biometric Attendance Device',
    'Other',
  ],
  'CCTV & Surveillance': [
    'IP Camera',
    'CCTV Camera',
    'NVR',
    'DVR',
    'CCTV Monitor',
    'CCTV Storage',
    'Video Doorbell',
    'Other',
  ],
  'Cables & Connectivity': [
    'LAN Cable',
    'Fiber Cable',
    'HDMI Cable',
    'VGA Cable',
    'DisplayPort Cable',
    'USB Cable',
    'Power Cable',
    'Patch Cable',
    'Other',
  ],
  'Other Hardware': [
    'Other',
  ],
};

/**
 * Field specifications for each device type / category.
 * Each field definition contains: key, label, type, placeholder, options (optional).
 */
export const SPECIFICATION_CONFIG = {
  // Computers & Laptops
  Laptop: [
    { key: 'processor', label: 'Processor / CPU', type: 'text', placeholder: 'e.g. Intel Core i5-1135G7 / AMD Ryzen 5' },
    { key: 'ram', label: 'RAM / Memory', type: 'select', options: ['4 GB', '8 GB', '16 GB', '32 GB', '64 GB'], placeholder: 'Select RAM' },
    { key: 'storage', label: 'Primary Storage', type: 'text', placeholder: 'e.g. 512 GB NVMe SSD / 1 TB HDD' },
    { key: 'display', label: 'Display Size / Resolution', type: 'text', placeholder: 'e.g. 14" FHD IPS / 15.6" 1080p' },
    { key: 'operatingSystem', label: 'Operating System', type: 'select', options: ['Windows 11 Pro', 'Windows 10 Pro', 'Ubuntu Linux', 'macOS', 'None / DOS'], placeholder: 'Select OS' },
    { key: 'graphics', label: 'Graphics Card (GPU)', type: 'text', placeholder: 'e.g. Intel Iris Xe / NVIDIA RTX 3050' },
  ],
  Desktop: [
    { key: 'processor', label: 'Processor / CPU', type: 'text', placeholder: 'e.g. Intel Core i7-12700 / AMD Ryzen 7' },
    { key: 'ram', label: 'RAM / Memory', type: 'select', options: ['4 GB', '8 GB', '16 GB', '32 GB', '64 GB', '128 GB'], placeholder: 'Select RAM' },
    { key: 'storage', label: 'Primary Storage', type: 'text', placeholder: 'e.g. 512 GB SSD + 1 TB HDD' },
    { key: 'formFactor', label: 'Cabinet Form Factor', type: 'select', options: ['Tower', 'Small Form Factor (SFF)', 'Micro / Tiny', 'All-in-One'], placeholder: 'Select Form Factor' },
    { key: 'operatingSystem', label: 'Operating System', type: 'select', options: ['Windows 11 Pro', 'Windows 10 Pro', 'Ubuntu Linux', 'DOS / No OS'], placeholder: 'Select OS' },
    { key: 'powerSupply', label: 'Power Supply (PSU)', type: 'text', placeholder: 'e.g. 260W 80 Plus Bronze' },
  ],
  Workstation: [
    { key: 'processor', label: 'Workstation Processor', type: 'text', placeholder: 'e.g. Intel Xeon W-2223 / AMD Threadripper' },
    { key: 'ram', label: 'ECC RAM', type: 'select', options: ['16 GB', '32 GB', '64 GB', '128 GB', '256 GB'], placeholder: 'Select RAM' },
    { key: 'storage', label: 'Storage Config', type: 'text', placeholder: 'e.g. 1 TB NVMe SSD + 2 TB Enterprise HDD' },
    { key: 'graphics', label: 'Dedicated GPU', type: 'text', placeholder: 'e.g. NVIDIA Quadro RTX A4000 16GB' },
    { key: 'operatingSystem', label: 'Operating System', type: 'select', options: ['Windows 11 Pro for Workstations', 'Red Hat Enterprise Linux', 'Ubuntu Desktop'], placeholder: 'Select OS' },
  ],
  'Mini PC': [
    { key: 'processor', label: 'Processor', type: 'text', placeholder: 'e.g. Intel Core i3 / Celeron' },
    { key: 'ram', label: 'RAM', type: 'select', options: ['4 GB', '8 GB', '16 GB', '32 GB'], placeholder: 'Select RAM' },
    { key: 'storage', label: 'Storage', type: 'text', placeholder: 'e.g. 256 GB SSD' },
    { key: 'operatingSystem', label: 'OS', type: 'select', options: ['Windows 11 Pro', 'Windows 10 IoT', 'Linux'], placeholder: 'Select OS' },
  ],
  'Thin Client': [
    { key: 'processor', label: 'Embedded Processor', type: 'text', placeholder: 'e.g. AMD GX-215JJ' },
    { key: 'ram', label: 'Flash RAM', type: 'select', options: ['2 GB', '4 GB', '8 GB', '16 GB'], placeholder: 'Select RAM' },
    { key: 'storage', label: 'Flash Storage', type: 'text', placeholder: 'e.g. 16 GB / 32 GB eMMC' },
    { key: 'thinClientOS', label: 'ThinOS / Firmware', type: 'text', placeholder: 'e.g. Dell ThinOS / HP ThinPro / Windows 10 IoT' },
  ],

  // Enterprise Servers
  'Rack Server': [
    { key: 'processor', label: 'Processor(s)', type: 'text', placeholder: 'e.g. 2x Intel Xeon Silver 4314' },
    { key: 'ram', label: 'Server Memory', type: 'select', options: ['32 GB', '64 GB', '128 GB', '256 GB', '512 GB', '1 TB'], placeholder: 'Select RAM' },
    { key: 'storage', label: 'Drive Bays & Disks', type: 'text', placeholder: 'e.g. 8x 1.2TB 10K SAS Hot-Plug' },
    { key: 'raid', label: 'RAID Controller', type: 'text', placeholder: 'e.g. PERC H750 8GB Cache' },
    { key: 'powerSupply', label: 'Redundant PSU', type: 'text', placeholder: 'e.g. Dual 800W Hot-Plug Platinum' },
    { key: 'rackUnits', label: 'Chassis Height', type: 'select', options: ['1U', '2U', '4U'], placeholder: 'Select Rack Units' },
  ],
  'Tower Server': [
    { key: 'processor', label: 'Processor', type: 'text', placeholder: 'e.g. Intel Xeon E-2324' },
    { key: 'ram', label: 'RAM', type: 'select', options: ['16 GB', '32 GB', '64 GB', '128 GB'], placeholder: 'Select RAM' },
    { key: 'storage', label: 'Storage', type: 'text', placeholder: 'e.g. 2x 2TB SATA 7.2K' },
    { key: 'raid', label: 'RAID Level', type: 'text', placeholder: 'e.g. RAID 1 / RAID 5' },
  ],
  'Storage Server': [
    { key: 'rawCapacity', label: 'Raw Storage Capacity', type: 'text', placeholder: 'e.g. 24 TB / 48 TB' },
    { key: 'driveType', label: 'Drive Interface', type: 'select', options: ['SAS', 'SATA', 'NVMe', 'Hybrid'], placeholder: 'Select Drive Type' },
    { key: 'networkPorts', label: 'Storage Network Ports', type: 'text', placeholder: 'e.g. 2x 10GbE SFP+ / 4x 1GbE RJ45' },
  ],

  // Network Infrastructure
  Switch: [
    { key: 'ports', label: 'Total Ports', type: 'select', options: ['8-Port', '16-Port', '24-Port', '48-Port'], placeholder: 'Select Port Count' },
    { key: 'speed', label: 'Port Speed', type: 'select', options: ['10/100/1000 Mbps Gigabit', '10G Multi-Gigabit', '100 Mbps Fast Ethernet'], placeholder: 'Select Speed' },
    { key: 'poe', label: 'PoE Capability', type: 'select', options: ['Non-PoE', 'PoE (802.3af)', 'PoE+ (802.3at)', 'PoE++ (802.3bt)'], placeholder: 'Select PoE' },
    { key: 'management', label: 'Management Type', type: 'select', options: ['Managed (L2/L3)', 'Smart Managed', 'Unmanaged'], placeholder: 'Select Management' },
    { key: 'uplink', label: 'Uplink Ports', type: 'text', placeholder: 'e.g. 4x 10G SFP+' },
  ],
  Router: [
    { key: 'interfaces', label: 'WAN/LAN Interfaces', type: 'text', placeholder: 'e.g. 2x Gigabit WAN + 4x Gigabit LAN' },
    { key: 'throughput', label: 'NAT Throughput', type: 'text', placeholder: 'e.g. 1 Gbps / 2.5 Gbps' },
    { key: 'vpnSupport', label: 'VPN Capability', type: 'text', placeholder: 'e.g. IPsec, OpenVPN, WireGuard' },
  ],
  Firewall: [
    { key: 'throughput', label: 'Threat Protection Throughput', type: 'text', placeholder: 'e.g. 1.5 Gbps' },
    { key: 'licenseTier', label: 'License Bundle', type: 'text', placeholder: 'e.g. UTM / Enterprise Protection 1-Year' },
    { key: 'interfaces', label: 'Physical Interfaces', type: 'text', placeholder: 'e.g. 8x GE RJ45 + 2x SFP' },
  ],
  'Access Point': [
    { key: 'wifiStandard', label: 'Wi-Fi Generation', type: 'select', options: ['Wi-Fi 6 (802.11ax)', 'Wi-Fi 6E', 'Wi-Fi 5 (802.11ac)', 'Wi-Fi 7'], placeholder: 'Select Wi-Fi Standard' },
    { key: 'speedRating', label: 'Speed Rating', type: 'text', placeholder: 'e.g. AX3000 / AX1800 Dual Band' },
    { key: 'deployment', label: 'Deployment Mode', type: 'select', options: ['Ceiling Mount Indoor', 'Wall Mount', 'Outdoor Weatherproof'], placeholder: 'Select Deployment' },
  ],

  // Printers & Imaging
  'Laser Printer': [
    { key: 'printType', label: 'Color / Monochrome', type: 'select', options: ['Monochrome (Black & White)', 'Color Laser'], placeholder: 'Select Color Mode' },
    { key: 'printSpeed', label: 'Print Speed', type: 'text', placeholder: 'e.g. 30 ppm / 40 ppm' },
    { key: 'duplex', label: 'Auto Duplex', type: 'select', options: ['Yes (Automatic Double-sided)', 'No (Manual)'], placeholder: 'Duplex' },
    { key: 'connectivity', label: 'Connectivity', type: 'text', placeholder: 'e.g. USB 2.0, Ethernet LAN, Wi-Fi' },
  ],
  'Multifunction Printer': [
    { key: 'functions', label: 'Functions Supported', type: 'text', placeholder: 'e.g. Print, Scan, Copy, Fax' },
    { key: 'printType', label: 'Print Technology', type: 'select', options: ['Monochrome Laser', 'Color Laser', 'Ink Tank'], placeholder: 'Select Type' },
    { key: 'adf', label: 'Automatic Document Feeder', type: 'select', options: ['Yes (50-Sheet ADF)', 'No'], placeholder: 'ADF' },
    { key: 'connectivity', label: 'Network Connectivity', type: 'text', placeholder: 'e.g. Gigabit Ethernet, Wi-Fi Direct, USB' },
  ],
  Scanner: [
    { key: 'scanType', label: 'Scanner Type', type: 'select', options: ['Flatbed + ADF', 'Sheet-fed Document Scanner', 'Handheld / Portable'], placeholder: 'Select Scanner Type' },
    { key: 'scanResolution', label: 'Optical Resolution', type: 'text', placeholder: 'e.g. 600 x 600 dpi / 1200 dpi' },
    { key: 'scanSpeed', label: 'Scan Speed', type: 'text', placeholder: 'e.g. 40 ppm / 80 ipm Duplex' },
  ],
  'Barcode Printer': [
    { key: 'printTechnology', label: 'Printing Method', type: 'select', options: ['Direct Thermal', 'Thermal Transfer'], placeholder: 'Select Method' },
    { key: 'maxLabelWidth', label: 'Max Print Width', type: 'text', placeholder: 'e.g. 4 inch (104 mm)' },
    { key: 'resolution', label: 'Print Resolution', type: 'select', options: ['203 dpi', '300 dpi', '600 dpi'], placeholder: 'Resolution' },
  ],

  // Monitors & Displays
  Monitor: [
    { key: 'screenSize', label: 'Screen Size', type: 'select', options: ['18.5 inch', '21.5 inch', '23.8 inch', '27 inch', '32 inch', '34 inch Curved'], placeholder: 'Select Size' },
    { key: 'panelType', label: 'Panel Type', type: 'select', options: ['IPS', 'VA', 'TN', 'OLED'], placeholder: 'Select Panel' },
    { key: 'resolution', label: 'Native Resolution', type: 'select', options: ['1920x1080 Full HD', '2560x1440 2K QHD', '3840x2160 4K UHD'], placeholder: 'Select Resolution' },
    { key: 'inputPorts', label: 'Input Ports', type: 'text', placeholder: 'e.g. HDMI, DisplayPort, VGA, USB-C' },
    { key: 'refreshRate', label: 'Refresh Rate', type: 'select', options: ['60 Hz', '75 Hz', '100 Hz', '144 Hz', '165 Hz'], placeholder: 'Refresh Rate' },
  ],
  'TV Display': [
    { key: 'screenSize', label: 'Display Size', type: 'select', options: ['43 inch', '50 inch', '55 inch', '65 inch', '75 inch', '85 inch'], placeholder: 'Select Size' },
    { key: 'resolution', label: 'Resolution', type: 'select', options: ['4K Ultra HD', 'Full HD'], placeholder: 'Select Resolution' },
    { key: 'smartPlatform', label: 'Smart OS', type: 'text', placeholder: 'e.g. Google TV / Android / webOS' },
  ],
  Projector: [
    { key: 'brightness', label: 'Brightness (Lumens)', type: 'text', placeholder: 'e.g. 3500 ANSI Lumens' },
    { key: 'nativeResolution', label: 'Native Resolution', type: 'select', options: ['1080p Full HD', 'WXGA (1280x800)', '4K UHD'], placeholder: 'Select Resolution' },
    { key: 'lightSource', label: 'Lamp / Light Source', type: 'select', options: ['Laser', 'LED', 'Lamp'], placeholder: 'Select Source' },
  ],

  // Mobile & Handhelds
  'Mobile Phone': [
    { key: 'ram', label: 'RAM', type: 'select', options: ['4 GB', '6 GB', '8 GB', '12 GB'], placeholder: 'Select RAM' },
    { key: 'storage', label: 'Internal Storage', type: 'select', options: ['64 GB', '128 GB', '256 GB', '512 GB'], placeholder: 'Select Storage' },
    { key: 'networkType', label: 'Cellular Connectivity', type: 'select', options: ['5G Dual SIM', '4G LTE Dual SIM', '4G VoLTE'], placeholder: 'Select Network' },
    { key: 'operatingSystem', label: 'Mobile OS', type: 'select', options: ['Android 14', 'Android 13', 'iOS 17', 'iOS 16'], placeholder: 'Select OS' },
  ],
  Tablet: [
    { key: 'screenSize', label: 'Screen Size', type: 'select', options: ['8.7 inch', '10.1 inch', '10.9 inch', '11 inch', '12.9 inch'], placeholder: 'Select Size' },
    { key: 'connectivity', label: 'Network', type: 'select', options: ['Wi-Fi + Cellular (LTE/5G)', 'Wi-Fi Only'], placeholder: 'Select Network' },
    { key: 'storage', label: 'Storage', type: 'select', options: ['64 GB', '128 GB', '256 GB'], placeholder: 'Select Storage' },
    { key: 'operatingSystem', label: 'OS', type: 'text', placeholder: 'e.g. iPadOS / Android' },
  ],
  'Handheld Scanner': [
    { key: 'barcodeType', label: 'Scanning Capability', type: 'select', options: ['1D Barcode & 2D QR Code', '1D Laser Barcode Only'], placeholder: 'Select Capability' },
    { key: 'connectivity', label: 'Interface', type: 'select', options: ['Wireless (2.4GHz + Bluetooth)', 'USB Wired Cable'], placeholder: 'Select Interface' },
  ],

  // Power & Infrastructure
  UPS: [
    { key: 'capacity', label: 'Power Rating (VA / Watts)', type: 'select', options: ['600 VA / 360W', '1000 VA / 600W', '2 kVA', '3 kVA Online', '5 kVA', '10 kVA Online'], placeholder: 'Select Capacity' },
    { key: 'topology', label: 'UPS Topology', type: 'select', options: ['Line-Interactive', 'Online Double-Conversion', 'Offline / Standby'], placeholder: 'Select Topology' },
    { key: 'batteryConfig', label: 'Battery Configuration', type: 'text', placeholder: 'e.g. Internal 12V 7Ah x2 / External SMF Bank' },
    { key: 'backupTime', label: 'Approx Backup Time', type: 'text', placeholder: 'e.g. 15-20 mins on full load' },
  ],
  Inverter: [
    { key: 'capacity', label: 'Capacity Rating', type: 'text', placeholder: 'e.g. 1500 VA / 24V Pure Sine Wave' },
    { key: 'batterySupport', label: 'Battery Type Supported', type: 'text', placeholder: 'e.g. Tubular 150Ah x2' },
  ],
  'Biometric Attendance Device': [
    { key: 'authModes', label: 'Authentication Modes', type: 'text', placeholder: 'e.g. Fingerprint + RFID Card + Face Recognition' },
    { key: 'userCapacity', label: 'User Record Capacity', type: 'text', placeholder: 'e.g. 3,000 Fingerprints / 50,000 Logs' },
    { key: 'connectivity', label: 'Data Sync Interface', type: 'text', placeholder: 'e.g. TCP/IP LAN, Wi-Fi, USB Host' },
  ],

  // CCTV & Surveillance
  'IP Camera': [
    { key: 'resolution', label: 'Sensor Resolution', type: 'select', options: ['2 MP (1080p)', '4 MP (2K Quad HD)', '5 MP', '8 MP (4K UHD)'], placeholder: 'Select Resolution' },
    { key: 'formFactor', label: 'Camera Form Factor', type: 'select', options: ['Dome Camera (Indoor)', 'Bullet Camera (Outdoor IP67)', 'PTZ Speed Dome'], placeholder: 'Select Form Factor' },
    { key: 'lens', label: 'Focal Length / Lens', type: 'select', options: ['2.8mm Wide Angle', '3.6mm Standard', '4mm', '2.8-12mm Motorized Varifocal'], placeholder: 'Select Lens' },
    { key: 'nightVision', label: 'Night Vision IR Range', type: 'text', placeholder: 'e.g. 30 Meters IR / Color Night Vision' },
    { key: 'powerSupply', label: 'Power Source', type: 'select', options: ['PoE (802.3af)', '12V DC Adapter'], placeholder: 'Select Power' },
  ],
  NVR: [
    { key: 'channels', label: 'Video Channels', type: 'select', options: ['4 Channels', '8 Channels', '16 Channels', '32 Channels', '64 Channels'], placeholder: 'Select Channels' },
    { key: 'storageBays', label: 'SATA HDD Bays', type: 'select', options: ['1 SATA Bay (Up to 8TB)', '2 SATA Bays (Up to 16TB)', '4 SATA Bays', '8 SATA Bays'], placeholder: 'Select Bays' },
    { key: 'poePorts', label: 'Built-in PoE Ports', type: 'text', placeholder: 'e.g. 8x PoE Ports / Non-PoE' },
    { key: 'maxBandwidth', label: 'Incoming Bandwidth', type: 'text', placeholder: 'e.g. 80 Mbps / 160 Mbps' },
  ],

  // Cables & Connectivity
  'LAN Cable': [
    { key: 'categoryRating', label: 'Category Standard', type: 'select', options: ['Cat 6 UTP', 'Cat 6A STP/FTP', 'Cat 5e UTP', 'Cat 7 S/FTP'], placeholder: 'Select Standard' },
    { key: 'length', label: 'Length / Roll Size', type: 'text', placeholder: 'e.g. 305 Meter Box / 1 Meter Patch / 3 Meter' },
    { key: 'color', label: 'Color Code', type: 'text', placeholder: 'e.g. Blue / Grey / Yellow' },
  ],
  'Fiber Cable': [
    { key: 'fiberType', label: 'Fiber Mode', type: 'select', options: ['Single Mode (OS2)', 'Multi Mode (OM3)', 'Multi Mode (OM4)'], placeholder: 'Select Mode' },
    { key: 'coreCount', label: 'Cores Count', type: 'select', options: ['2-Core Simplex/Duplex', '6-Core', '12-Core', '24-Core'], placeholder: 'Select Cores' },
    { key: 'length', label: 'Cable Length', type: 'text', placeholder: 'e.g. 500 Meters / 1000 Meters Roll' },
  ],
  'HDMI Cable': [
    { key: 'version', label: 'HDMI Version', type: 'select', options: ['HDMI 2.0 (4K@60Hz)', 'HDMI 2.1 (8K@60Hz)', 'HDMI 1.4'], placeholder: 'Select Version' },
    { key: 'length', label: 'Length', type: 'text', placeholder: 'e.g. 1.5m / 3m / 5m / 10m / 15m' },
  ],
  'Power Cable': [
    { key: 'plugType', label: 'Plug / Connector Type', type: 'text', placeholder: 'e.g. Indian 3-Pin to IEC C13 / C19' },
    { key: 'gaugeRating', label: 'Gauge / Amperage', type: 'select', options: ['16A Heavy Duty', '10A Standard', '6A Desktop'], placeholder: 'Select Gauge' },
  ],
};

/**
 * Returns list of relevant specification fields for a given category and device type.
 */
export function getSpecificationsForDevice(category, deviceType) {
  if (deviceType && SPECIFICATION_CONFIG[deviceType]) {
    return SPECIFICATION_CONFIG[deviceType];
  }

  // Fallback defaults for general categories
  if (category === 'Cables & Connectivity') {
    return [
      { key: 'cableType', label: 'Cable Specification', type: 'text', placeholder: 'e.g. Shielded Copper Wire / Standard Gauge' },
      { key: 'length', label: 'Length / Packaging', type: 'text', placeholder: 'e.g. 1.8 Meters / 100 Meter Drum' },
      { key: 'connectorType', label: 'End Connectors', type: 'text', placeholder: 'e.g. Male to Male / RJ45' },
    ];
  }

  if (category === 'Other Hardware') {
    return [
      { key: 'technicalSpecs', label: 'Technical Specifications', type: 'text', placeholder: 'e.g. Key technical parameters' },
      { key: 'powerRequirement', label: 'Power Rating', type: 'text', placeholder: 'e.g. 230V AC / 12V DC 2A' },
      { key: 'dimensions', label: 'Physical Dimensions / Weight', type: 'text', placeholder: 'e.g. 250 x 180 x 45 mm' },
    ];
  }

  // Default general specification fields
  return [
    { key: 'specificationDetails', label: 'Technical Specifications', type: 'text', placeholder: 'e.g. Core hardware parameters & ratings' },
    { key: 'interfacePorts', label: 'Connectivity / Ports', type: 'text', placeholder: 'e.g. USB, LAN, HDMI' },
  ];
}
