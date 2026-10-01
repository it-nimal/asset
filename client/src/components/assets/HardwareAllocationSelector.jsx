import React, { useState, useEffect, useRef } from 'react';
import {
  Laptop,
  Monitor,
  Keyboard,
  Mouse,
  Zap,
  Headphones,
  Printer,
  Check,
  Tag,
  Box,
} from 'lucide-react';

export const STANDARD_PERIPHERALS = [
  {
    id: 'monitor',
    name: 'External Monitor / Display',
    shortName: 'Monitor',
    icon: Monitor,
    color: '#818cf8',
    defaultMake: 'Dell',
    defaultModel: '24" FHD IPS',
  },
  {
    id: 'keyboard',
    name: 'Keyboard',
    shortName: 'Keyboard',
    icon: Keyboard,
    color: '#38bdf8',
    defaultMake: 'Logitech',
    defaultModel: 'USB Wired',
  },
  {
    id: 'mouse',
    name: 'Mouse',
    shortName: 'Mouse',
    icon: Mouse,
    color: '#34d399',
    defaultMake: 'Logitech',
    defaultModel: 'Optical USB',
  },
  {
    id: 'ups',
    name: 'UPS Backup',
    shortName: 'UPS',
    icon: Zap,
    color: '#f87171',
    defaultMake: 'APC',
    defaultModel: '600VA Line-Interactive',
  },
  {
    id: 'headset',
    name: 'Headset / Headphone with Mic',
    shortName: 'Headset',
    icon: Headphones,
    color: '#ec4899',
    defaultMake: 'Jabra',
    defaultModel: 'USB Headset',
  },
  {
    id: 'printer',
    name: 'Printer',
    shortName: 'Printer',
    icon: Printer,
    color: '#fbbf24',
    defaultMake: 'HP',
    defaultModel: 'LaserJet',
  },
];

export const PERIPHERAL_OPTIONS = STANDARD_PERIPHERALS;

export default function HardwareAllocationSelector({
  deviceType = 'Desktop PC',
  onDeviceTypeChange,
  accessories = '',
  onAccessoriesChange,
  monitorDetails = '',
  onMonitorDetailsChange,
  monitorSerialNo = '',
  onMonitorSerialNoChange,
  peripheralsList = [],
  onPeripheralsListChange,
  compact = false,
  title = 'Workstation Hardware & Peripherals',
  assets = [],
}) {
  const isDesktopLike = ['desktop', 'desktop pc', 'all-in-one pc', 'all-in-one', 'workstation'].some((t) =>
    (deviceType || '').toLowerCase().includes(t)
  );

  // Initialize state from existing props
  const [hasMonitor, setHasMonitor] = useState(() => {
    if (monitorSerialNo || monitorDetails) return true;
    if (
      Array.isArray(peripheralsList) &&
      peripheralsList.some(
        (p) =>
          p.type === 'monitor' ||
          (p.name || '').toLowerCase().includes('monitor') ||
          (p.name || '').toLowerCase().includes('lcd')
      )
    ) {
      return true;
    }
    // Desktop default: true
    return isDesktopLike;
  });

  const [monitorMake, setMonitorMake] = useState(() => {
    if (monitorDetails) {
      const parts = monitorDetails.trim().split(' ');
      return parts[0] || 'Dell';
    }
    const mon = Array.isArray(peripheralsList)
      ? peripheralsList.find((p) => p.type === 'monitor' || (p.name || '').toLowerCase().includes('monitor'))
      : null;
    return mon?.make || 'Dell';
  });

  const [monitorModel, setMonitorModel] = useState(() => {
    if (monitorDetails) {
      const parts = monitorDetails.trim().split(' ');
      return parts.slice(1).join(' ') || '24" FHD IPS';
    }
    const mon = Array.isArray(peripheralsList)
      ? peripheralsList.find((p) => p.type === 'monitor' || (p.name || '').toLowerCase().includes('monitor'))
      : null;
    return mon?.model || '24" FHD IPS';
  });

  const [monitorSerial, setMonitorSerial] = useState(() => {
    if (monitorSerialNo) return monitorSerialNo;
    const mon = Array.isArray(peripheralsList)
      ? peripheralsList.find((p) => p.type === 'monitor' || (p.name || '').toLowerCase().includes('monitor'))
      : null;
    return mon?.serialNo || mon?.serialNumber || '';
  });

  const [monitorAssetNo, setMonitorAssetNo] = useState(() => {
    const mon = Array.isArray(peripheralsList)
      ? peripheralsList.find((p) => p.type === 'monitor' || (p.name || '').toLowerCase().includes('monitor'))
      : null;
    return mon?.assetTag || mon?.assetNo || '';
  });

  // Keyboard & Mouse Combo
  const [hasKbMouse, setHasKbMouse] = useState(() => {
    if (
      Array.isArray(peripheralsList) &&
      peripheralsList.some(
        (p) =>
          (p.name || '').toLowerCase().includes('keyboard') ||
          (p.name || '').toLowerCase().includes('mouse')
      )
    ) {
      return true;
    }
    const acc = (accessories || '').toLowerCase();
    if (acc.includes('keyboard') || acc.includes('mouse') || acc.includes('k/b')) return true;
    return isDesktopLike;
  });

  const [kbMouseCombo, setKbMouseCombo] = useState(() => {
    const acc = accessories || '';
    if (acc.toLowerCase().includes('dell')) return 'Dell USB Wired';
    if (acc.toLowerCase().includes('hp')) return 'HP USB Wired';
    if (acc.toLowerCase().includes('wireless')) return 'Wireless Keyboard & Mouse Combo';
    return 'Logitech USB Wired';
  });

  const [kbMouseAssetNo, setKbMouseAssetNo] = useState(() => {
    const km = Array.isArray(peripheralsList)
      ? peripheralsList.find((p) => p.type === 'keyboard_mouse' || p.type === 'keyboard')
      : null;
    return km?.assetTag || km?.assetNo || '';
  });

  // Laptop standard accessories
  const [hasBag, setHasBag] = useState(() => {
    const acc = (accessories || '').toLowerCase();
    return acc.includes('bag') || acc.includes('backpack') || !isDesktopLike;
  });
  const [bagAssetNo, setBagAssetNo] = useState(() => {
    const b = Array.isArray(peripheralsList) ? peripheralsList.find((p) => p.type === 'laptop_bag') : null;
    return b?.assetTag || b?.assetNo || '';
  });

  const [hasAdapter, setHasAdapter] = useState(() => {
    const acc = (accessories || '').toLowerCase();
    return acc.includes('adapter') || acc.includes('charger') || !isDesktopLike;
  });
  const [adapterAssetNo, setAdapterAssetNo] = useState(() => {
    const a = Array.isArray(peripheralsList) ? peripheralsList.find((p) => p.type === 'power_adapter') : null;
    return a?.assetTag || a?.assetNo || '';
  });

  const [hasLaptopMouse, setHasLaptopMouse] = useState(() => {
    const acc = (accessories || '').toLowerCase();
    return acc.includes('mouse');
  });
  const [laptopMouseAssetNo, setLaptopMouseAssetNo] = useState(() => {
    const m = Array.isArray(peripheralsList) ? peripheralsList.find((p) => p.type === 'mouse') : null;
    return m?.assetTag || m?.assetNo || '';
  });

  // Sync outwards when any field changes
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const compiledList = [];
    const summaryParts = [];

    // 1. LCD / Monitor (with Asset Number & Serial Number)
    if (hasMonitor) {
      const monName = `${monitorMake || 'Dell'} ${monitorModel || '24" FHD'}`.trim();
      compiledList.push({
        id: 'monitor',
        type: 'monitor',
        itemType: 'Monitor / LCD Display',
        name: 'External Monitor / LCD',
        make: monitorMake || 'Dell',
        model: monitorModel || '24" FHD',
        assetTag: (monitorAssetNo || '').trim(),
        serialNo: (monitorSerial || '').trim(),
        condition: 'Good',
      });

      const tagPart = monitorAssetNo.trim() ? ` [Tag: #${monitorAssetNo.trim()}]` : '';
      const snPart = monitorSerial.trim() ? ` (S/N: ${monitorSerial.trim()})` : '';
      summaryParts.push(`Monitor: ${monName}${tagPart}${snPart}`);

      if (onMonitorDetailsChange) onMonitorDetailsChange(monName);
      if (onMonitorSerialNoChange) onMonitorSerialNoChange(monitorSerial.trim());
    } else {
      if (onMonitorDetailsChange) onMonitorDetailsChange('');
      if (onMonitorSerialNoChange) onMonitorSerialNoChange('');
    }

    // 2. Keyboard & Mouse
    if (isDesktopLike && hasKbMouse) {
      compiledList.push({
        id: 'keyboard_mouse',
        type: 'keyboard_mouse',
        itemType: 'Keyboard & Mouse',
        name: 'Keyboard & Mouse',
        make: kbMouseCombo.split(' ')[0] || 'Logitech',
        model: kbMouseCombo || 'Logitech USB Wired',
        assetTag: (kbMouseAssetNo || '').trim(),
        serialNo: '',
        condition: 'Good',
      });
      const tagPart = kbMouseAssetNo.trim() ? ` [Tag: #${kbMouseAssetNo.trim()}]` : '';
      summaryParts.push(`${kbMouseCombo} Keyboard & Mouse${tagPart}`);
    }

    // 3. Laptop standard accessories
    if (!isDesktopLike) {
      if (hasAdapter) {
        compiledList.push({
          id: 'power_adapter',
          type: 'power_adapter',
          itemType: 'Power Adapter',
          name: 'Power Adapter / Charger',
          make: 'OEM',
          model: 'Standard Adapter',
          assetTag: (adapterAssetNo || '').trim(),
          serialNo: '',
          condition: 'Good',
        });
        const tagPart = adapterAssetNo.trim() ? ` [Tag: #${adapterAssetNo.trim()}]` : '';
        summaryParts.push(`Power Adapter${tagPart}`);
      }

      if (hasBag) {
        compiledList.push({
          id: 'laptop_bag',
          type: 'laptop_bag',
          itemType: 'Laptop Bag',
          name: 'Laptop Backpack / Bag',
          make: 'OEM / Targus',
          model: 'Backpack',
          assetTag: (bagAssetNo || '').trim(),
          serialNo: '',
          condition: 'Good',
        });
        const tagPart = bagAssetNo.trim() ? ` [Tag: #${bagAssetNo.trim()}]` : '';
        summaryParts.push(`Laptop Bag${tagPart}`);
      }

      if (hasLaptopMouse) {
        compiledList.push({
          id: 'mouse',
          type: 'mouse',
          itemType: 'Mouse',
          name: 'External USB Mouse',
          make: 'Logitech',
          model: 'Optical Mouse',
          assetTag: (laptopMouseAssetNo || '').trim(),
          serialNo: '',
          condition: 'Good',
        });
        const tagPart = laptopMouseAssetNo.trim() ? ` [Tag: #${laptopMouseAssetNo.trim()}]` : '';
        summaryParts.push(`External Mouse${tagPart}`);
      }
    }

    if (onPeripheralsListChange) {
      onPeripheralsListChange(compiledList);
    }

    if (onAccessoriesChange) {
      onAccessoriesChange(summaryParts.join(', '));
    }
  }, [
    hasMonitor,
    monitorMake,
    monitorModel,
    monitorSerial,
    monitorAssetNo,
    hasKbMouse,
    kbMouseCombo,
    kbMouseAssetNo,
    hasBag,
    bagAssetNo,
    hasAdapter,
    adapterAssetNo,
    hasLaptopMouse,
    laptopMouseAssetNo,
    isDesktopLike,
  ]);

  // Adjust defaults when primary device type changes
  const handleDeviceChange = (newType) => {
    if (onDeviceTypeChange) {
      onDeviceTypeChange(newType);
    }
    const isNewDesktop = ['desktop', 'desktop pc', 'all-in-one pc', 'all-in-one', 'workstation'].some((t) =>
      newType.toLowerCase().includes(t)
    );
    if (isNewDesktop) {
      setHasMonitor(true);
      setHasKbMouse(true);
    } else {
      setHasAdapter(true);
      setHasBag(true);
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface-raised, rgba(255,255,255,0.03))',
        border: '1px solid var(--border-default, #cbd5e1)',
        borderRadius: '8px',
        padding: compact ? '0.75rem' : '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
      }}
    >
      {/* Existing Assets Datalist for autocomplete if available */}
      {Array.isArray(assets) && assets.length > 0 && (
        <datalist id="peripherals-asset-tags">
          {assets.map((a) => (
            <option key={a._id || a.assetNo || a.sr} value={a.assetNo || a.sr}>
              {a.make} {a.model} ({a.assetNo || a.sr})
            </option>
          ))}
        </datalist>
      )}

      {/* 1. Header & Primary Machine Selection */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <label className="form-label" style={{ fontWeight: 700, margin: 0, fontSize: '0.84rem', color: 'var(--text-primary)' }}>
            {title}
          </label>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              padding: '0.1rem 0.5rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(56, 189, 248, 0.12)',
              color: '#38bdf8',
            }}
          >
            {deviceType || 'Primary Machine'}
          </span>
        </div>

        {onDeviceTypeChange && (
          <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
            {[
              { id: 'Desktop PC', label: 'Desktop PC', icon: Monitor },
              { id: 'Laptop', label: 'Laptop', icon: Laptop },
              { id: 'All-in-One PC', label: 'All-in-One PC', icon: Monitor },
              { id: 'Workstation', label: 'Workstation', icon: Monitor },
            ].map((dev) => {
              const Icon = dev.icon;
              const isSel = (deviceType || '').toLowerCase().replace(/[^a-z]/g, '') === dev.id.toLowerCase().replace(/[^a-z]/g, '');
              return (
                <button
                  key={dev.id}
                  type="button"
                  onClick={() => handleDeviceChange(dev.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.76rem',
                    fontWeight: isSel ? 700 : 500,
                    borderRadius: '5px',
                    cursor: 'pointer',
                    border: isSel ? '1.5px solid var(--color-primary, #0284c7)' : '1px solid var(--border-default, #cbd5e1)',
                    backgroundColor: isSel ? 'rgba(2, 132, 199, 0.12)' : 'var(--bg-surface, #ffffff)',
                    color: isSel ? 'var(--color-primary, #0284c7)' : 'var(--text-primary)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Icon size={13} color={isSel ? 'var(--color-primary, #0284c7)' : 'var(--text-muted)'} />
                  <span>{dev.label}</span>
                  {isSel && <Check size={11} strokeWidth={3} />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Primary Peripherals Layout */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {/* ================= MONITOR / LCD SECTION ================= */}
        <div
          style={{
            border: '1px solid var(--border-default, #cbd5e1)',
            borderRadius: '6px',
            backgroundColor: 'var(--bg-surface, #ffffff)',
            padding: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: hasMonitor ? '0.65rem' : 0 }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                userSelect: 'none',
                margin: 0,
                fontSize: '0.82rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
              }}
            >
              <input
                type="checkbox"
                checked={hasMonitor}
                onChange={(e) => setHasMonitor(e.target.checked)}
                style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: '#0284c7' }}
              />
              <Monitor size={15} color="#818cf8" />
              <span>{isDesktopLike ? 'Monitor / LCD Display (Included with Desktop)' : 'External Monitor / LCD Screen'}</span>
            </label>
            <span style={{ fontSize: '0.7rem', color: '#818cf8', fontWeight: 600 }}>
              {hasMonitor ? '★ Assigned with Asset' : 'Not Included'}
            </span>
          </div>

          {hasMonitor && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.65rem', marginTop: '0.5rem' }}>
              {/* Monitor Make */}
              <div>
                <label className="form-label" style={{ fontSize: '0.7rem', marginBottom: '0.2rem', color: 'var(--text-muted)' }}>
                  Monitor Make / Brand
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dell, HP, Samsung"
                  value={monitorMake}
                  onChange={(e) => setMonitorMake(e.target.value)}
                  className="input-field"
                  style={{ fontSize: '0.78rem', height: '32px' }}
                />
              </div>

              {/* Monitor Model */}
              <div>
                <label className="form-label" style={{ fontSize: '0.7rem', marginBottom: '0.2rem', color: 'var(--text-muted)' }}>
                  Monitor Model / Size
                </label>
                <input
                  type="text"
                  placeholder="e.g. 24-inch FHD IPS"
                  value={monitorModel}
                  onChange={(e) => setMonitorModel(e.target.value)}
                  className="input-field"
                  style={{ fontSize: '0.78rem', height: '32px' }}
                />
              </div>

              {/* Monitor Asset Number (Tag) */}
              <div>
                <label
                  className="form-label"
                  style={{
                    fontSize: '0.7rem',
                    marginBottom: '0.2rem',
                    color: '#0284c7',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  <Tag size={11} />
                  <span>Monitor Asset Number</span>
                </label>
                <input
                  type="text"
                  list="peripherals-asset-tags"
                  placeholder="e.g. AST-0021"
                  value={monitorAssetNo}
                  onChange={(e) => setMonitorAssetNo(e.target.value)}
                  className="input-field"
                  style={{
                    fontSize: '0.78rem',
                    height: '32px',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontWeight: 600,
                    borderColor: monitorAssetNo ? '#0284c7' : undefined,
                  }}
                />
              </div>

              {/* Monitor Serial Number */}
              <div>
                <label
                  className="form-label"
                  style={{
                    fontSize: '0.7rem',
                    marginBottom: '0.2rem',
                    color: 'var(--text-muted)',
                    fontWeight: 600,
                  }}
                >
                  Monitor Serial No (S/N)
                </label>
                <input
                  type="text"
                  placeholder="e.g. CN-0K3T9-88192"
                  value={monitorSerial}
                  onChange={(e) => setMonitorSerial(e.target.value)}
                  className="input-field"
                  style={{
                    fontSize: '0.78rem',
                    height: '32px',
                    fontFamily: 'var(--font-mono, monospace)',
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ================= KEYBOARD & MOUSE SECTION ================= */}
        {isDesktopLike && (
          <div
            style={{
              border: '1px solid var(--border-default, #cbd5e1)',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-surface, #ffffff)',
              padding: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  userSelect: 'none',
                  margin: 0,
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                }}
              >
                <input
                  type="checkbox"
                  checked={hasKbMouse}
                  onChange={(e) => setHasKbMouse(e.target.checked)}
                  style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: '#0284c7' }}
                />
                <Keyboard size={15} color="#38bdf8" />
                <span>Keyboard & Mouse Set (Included)</span>
              </label>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)' }}>
                Standard workstation accessory
              </span>
            </div>

            {hasKbMouse && (
              <div style={{ marginTop: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Type / Preset:</span>
                  {[
                    'Logitech USB Wired',
                    'Dell USB Wired',
                    'HP USB Wired',
                    'Wireless Keyboard & Mouse Combo',
                  ].map((combo) => (
                    <button
                      key={combo}
                      type="button"
                      onClick={() => setKbMouseCombo(combo)}
                      style={{
                        padding: '0.25rem 0.55rem',
                        fontSize: '0.72rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        border: kbMouseCombo === combo ? '1.5px solid #0284c7' : '1px solid var(--border-default, #cbd5e1)',
                        backgroundColor: kbMouseCombo === combo ? 'rgba(2, 132, 199, 0.1)' : 'transparent',
                        color: kbMouseCombo === combo ? '#0284c7' : 'var(--text-secondary)',
                        fontWeight: kbMouseCombo === combo ? 700 : 500,
                      }}
                    >
                      {combo}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', maxWidth: '300px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Asset Tag (Optional):</span>
                  <input
                    type="text"
                    list="peripherals-asset-tags"
                    placeholder="e.g. AST-KB-01"
                    value={kbMouseAssetNo}
                    onChange={(e) => setKbMouseAssetNo(e.target.value)}
                    className="input-field"
                    style={{ fontSize: '0.74rem', height: '28px', fontFamily: 'var(--font-mono, monospace)' }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= LAPTOP STANDARD INCLUSIONS ================= */}
        {!isDesktopLike && (
          <div
            style={{
              border: '1px solid var(--border-default, #cbd5e1)',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-surface, #ffffff)',
              padding: '0.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
            }}
          >
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Standard Laptop Inclusions:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              {/* Power Adapter */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', cursor: 'pointer', margin: 0 }}>
                  <input
                    type="checkbox"
                    checked={hasAdapter}
                    onChange={(e) => setHasAdapter(e.target.checked)}
                    style={{ accentColor: '#0284c7' }}
                  />
                  <Zap size={13} color="#f59e0b" />
                  <span>Power Adapter / Charger</span>
                </label>
                {hasAdapter && (
                  <input
                    type="text"
                    list="peripherals-asset-tags"
                    placeholder="Asset # / S/N (Optional)"
                    value={adapterAssetNo}
                    onChange={(e) => setAdapterAssetNo(e.target.value)}
                    className="input-field"
                    style={{ fontSize: '0.72rem', height: '26px', fontFamily: 'monospace' }}
                  />
                )}
              </div>

              {/* Laptop Bag */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', cursor: 'pointer', margin: 0 }}>
                  <input
                    type="checkbox"
                    checked={hasBag}
                    onChange={(e) => setHasBag(e.target.checked)}
                    style={{ accentColor: '#0284c7' }}
                  />
                  <Box size={13} color="#3b82f6" />
                  <span>Laptop Carrying Bag</span>
                </label>
                {hasBag && (
                  <input
                    type="text"
                    list="peripherals-asset-tags"
                    placeholder="Bag Tag / Ref (Optional)"
                    value={bagAssetNo}
                    onChange={(e) => setBagAssetNo(e.target.value)}
                    className="input-field"
                    style={{ fontSize: '0.72rem', height: '26px', fontFamily: 'monospace' }}
                  />
                )}
              </div>

              {/* External Mouse */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', cursor: 'pointer', margin: 0 }}>
                  <input
                    type="checkbox"
                    checked={hasLaptopMouse}
                    onChange={(e) => setHasLaptopMouse(e.target.checked)}
                    style={{ accentColor: '#0284c7' }}
                  />
                  <Mouse size={13} color="#10b981" />
                  <span>External USB Mouse</span>
                </label>
                {hasLaptopMouse && (
                  <input
                    type="text"
                    list="peripherals-asset-tags"
                    placeholder="Mouse Asset # (Optional)"
                    value={laptopMouseAssetNo}
                    onChange={(e) => setLaptopMouseAssetNo(e.target.value)}
                    className="input-field"
                    style={{ fontSize: '0.72rem', height: '26px', fontFamily: 'monospace' }}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
