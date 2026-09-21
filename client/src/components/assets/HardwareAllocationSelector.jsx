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
  Plus,
  Trash2,
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

  // Keyboard & Mouse Combo (No Serial Number needed)
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

  // Laptop standard accessories
  const [hasBag, setHasBag] = useState(() => {
    const acc = (accessories || '').toLowerCase();
    return acc.includes('bag') || acc.includes('backpack') || !isDesktopLike;
  });

  const [hasAdapter, setHasAdapter] = useState(() => {
    const acc = (accessories || '').toLowerCase();
    return acc.includes('adapter') || acc.includes('charger') || !isDesktopLike;
  });

  const [hasLaptopMouse, setHasLaptopMouse] = useState(() => {
    const acc = (accessories || '').toLowerCase();
    return acc.includes('mouse');
  });

  // Optional extra peripherals (e.g. UPS, Headset)
  const [extraItems, setExtraItems] = useState(() => {
    if (!Array.isArray(peripheralsList)) return [];
    return peripheralsList.filter(
      (p) =>
        p.type !== 'monitor' &&
        !['keyboard', 'mouse', 'keyboard_mouse', 'laptop_bag', 'power_adapter'].includes(p.type) &&
        !(p.name || '').toLowerCase().includes('monitor') &&
        !(p.name || '').toLowerCase().includes('lcd') &&
        !(p.name || '').toLowerCase().includes('keyboard') &&
        !(p.name || '').toLowerCase().includes('mouse')
    );
  });

  const [showExtraMenu, setShowExtraMenu] = useState(false);

  // Sync outwards when any field changes
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const compiledList = [];
    const summaryParts = [];

    // 1. LCD / Monitor (with Serial Number)
    if (hasMonitor) {
      const monName = `${monitorMake || 'Dell'} ${monitorModel || '24" FHD'}`.trim();
      compiledList.push({
        id: 'monitor',
        type: 'monitor',
        itemType: 'Monitor / LCD Display',
        name: 'External Monitor / LCD',
        make: monitorMake || 'Dell',
        model: monitorModel || '24" FHD',
        serialNo: monitorSerial.trim(),
        condition: 'Good',
      });
      summaryParts.push(
        monitorSerial.trim()
          ? `Monitor: ${monName} (S/N: ${monitorSerial.trim()})`
          : `Monitor: ${monName}`
      );

      if (onMonitorDetailsChange) onMonitorDetailsChange(monName);
      if (onMonitorSerialNoChange) onMonitorSerialNoChange(monitorSerial.trim());
    } else {
      if (onMonitorDetailsChange) onMonitorDetailsChange('');
      if (onMonitorSerialNoChange) onMonitorSerialNoChange('');
    }

    // 2. Keyboard & Mouse (No Serial Number needed)
    if (isDesktopLike && hasKbMouse) {
      compiledList.push({
        id: 'keyboard_mouse',
        type: 'keyboard_mouse',
        itemType: 'Keyboard & Mouse',
        name: 'Keyboard & Mouse',
        make: kbMouseCombo.split(' ')[0] || 'Logitech',
        model: kbMouseCombo || 'Logitech USB Wired',
        serialNo: '', // No serial number
        condition: 'Good',
      });
      summaryParts.push(`${kbMouseCombo} Keyboard & Mouse`);
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
          serialNo: '',
          condition: 'Good',
        });
        summaryParts.push('Power Adapter / Charger');
      }

      if (hasBag) {
        compiledList.push({
          id: 'laptop_bag',
          type: 'laptop_bag',
          itemType: 'Laptop Bag',
          name: 'Laptop Backpack / Bag',
          make: 'OEM / Targus',
          model: 'Backpack',
          serialNo: '',
          condition: 'Good',
        });
        summaryParts.push('Laptop Bag');
      }

      if (hasLaptopMouse) {
        compiledList.push({
          id: 'mouse',
          type: 'mouse',
          itemType: 'Mouse',
          name: 'External USB Mouse',
          make: 'Logitech',
          model: 'Optical Mouse',
          serialNo: '',
          condition: 'Good',
        });
        summaryParts.push('External Mouse');
      }
    }

    // 4. Extra peripherals
    extraItems.forEach((ex) => {
      compiledList.push(ex);
      summaryParts.push(ex.serialNo ? `${ex.name} (S/N: ${ex.serialNo})` : ex.name);
    });

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
    hasKbMouse,
    kbMouseCombo,
    hasBag,
    hasAdapter,
    hasLaptopMouse,
    extraItems,
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

  const addExtraPeripheral = (type) => {
    setShowExtraMenu(false);
    if (type === 'ups') {
      setExtraItems((prev) => [
        ...prev,
        {
          id: `ups_${Date.now()}`,
          type: 'ups',
          itemType: 'UPS Backup',
          name: 'UPS Backup',
          make: 'APC',
          model: '600VA Line-Interactive',
          serialNo: '',
          condition: 'Good',
        },
      ]);
    } else if (type === 'headset') {
      setExtraItems((prev) => [
        ...prev,
        {
          id: `headset_${Date.now()}`,
          type: 'headset',
          itemType: 'Headset',
          name: 'Headset with Mic',
          make: 'Jabra',
          model: 'USB Headset',
          serialNo: '',
          condition: 'Good',
        },
      ]);
    } else if (type === 'printer') {
      setExtraItems((prev) => [
        ...prev,
        {
          id: `printer_${Date.now()}`,
          type: 'printer',
          itemType: 'Printer',
          name: 'Desk Printer',
          make: 'HP',
          model: 'LaserJet',
          serialNo: '',
          condition: 'Good',
        },
      ]);
    }
  };

  const removeExtraPeripheral = (id) => {
    setExtraItems((prev) => prev.filter((it) => it.id !== id));
  };

  const updateExtraPeripheral = (id, field, value) => {
    setExtraItems((prev) => prev.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
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
              {hasMonitor ? '★ Has Serial Number' : 'Not Included'}
            </span>
          </div>

          {hasMonitor && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.65rem', marginTop: '0.5rem' }}>
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

              {/* Monitor Serial Number (REQUIRED/CRUCIAL) */}
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
                  <span>Monitor Serial No (S/N)</span>
                  <span style={{ color: '#ef4444' }}>*</span>
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
                    fontWeight: 600,
                    borderColor: monitorSerial ? '#0284c7' : 'var(--border-default)',
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ================= KEYBOARD & MOUSE SECTION (NO SERIAL NUMBER) ================= */}
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
                Standard accessory — no serial number needed
              </span>
            </div>

            {hasKbMouse && (
              <div style={{ marginTop: '0.6rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
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
              gap: '0.45rem',
            }}
          >
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.15rem' }}>
              Standard Laptop Inclusions:
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={hasAdapter}
                  onChange={(e) => setHasAdapter(e.target.checked)}
                  style={{ accentColor: '#0284c7' }}
                />
                <span>Power Adapter / Charger</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={hasBag}
                  onChange={(e) => setHasBag(e.target.checked)}
                  style={{ accentColor: '#0284c7' }}
                />
                <span>Laptop Carrying Bag</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={hasLaptopMouse}
                  onChange={(e) => setHasLaptopMouse(e.target.checked)}
                  style={{ accentColor: '#0284c7' }}
                />
                <span>External USB Mouse</span>
              </label>
            </div>
          </div>
        )}

        {/* ================= EXTRA PERIPHERALS (OPTIONAL) ================= */}
        {extraItems.map((item) => (
          <div
            key={item.id}
            style={{
              border: '1px solid var(--border-default, #cbd5e1)',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-surface, #ffffff)',
              padding: '0.65rem 0.75rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {item.name}
              </span>
              <button
                type="button"
                onClick={() => removeExtraPeripheral(item.id)}
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                title="Remove extra peripheral"
              >
                <Trash2 size={13} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.68rem', marginBottom: '0.15rem' }}>Make / Model</label>
                <input
                  type="text"
                  placeholder="e.g. APC 600VA / Jabra"
                  value={item.model || ''}
                  onChange={(e) => updateExtraPeripheral(item.id, 'model', e.target.value)}
                  className="input-field"
                  style={{ fontSize: '0.76rem', height: '30px' }}
                />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.68rem', marginBottom: '0.15rem' }}>Serial Number (Optional)</label>
                <input
                  type="text"
                  placeholder="S/N if applicable"
                  value={item.serialNo || ''}
                  onChange={(e) => updateExtraPeripheral(item.id, 'serialNo', e.target.value)}
                  className="input-field"
                  style={{ fontSize: '0.76rem', height: '30px', fontFamily: 'var(--font-mono, monospace)' }}
                />
              </div>
            </div>
          </div>
        ))}

        {/* Add Extra Button */}
        <div style={{ position: 'relative', alignSelf: 'flex-start' }}>
          <button
            type="button"
            onClick={() => setShowExtraMenu(!showExtraMenu)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.3rem 0.6rem',
              borderRadius: '4px',
              border: '1px dashed var(--border-default, #cbd5e1)',
              background: 'none',
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            <Plus size={12} />
            <span>+ Add Extra (UPS, Headset, Printer)</span>
          </button>

          {showExtraMenu && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '4px',
                backgroundColor: 'var(--bg-surface, #ffffff)',
                border: '1px solid var(--border-default, #cbd5e1)',
                borderRadius: '6px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                zIndex: 20,
                minWidth: '150px',
                padding: '0.25rem 0',
              }}
            >
              <button
                type="button"
                onClick={() => addExtraPeripheral('ups')}
                style={{ width: '100%', textAlign: 'left', padding: '0.4rem 0.75rem', fontSize: '0.74rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
              >
                ⚡ UPS Backup
              </button>
              <button
                type="button"
                onClick={() => addExtraPeripheral('headset')}
                style={{ width: '100%', textAlign: 'left', padding: '0.4rem 0.75rem', fontSize: '0.74rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
              >
                🎧 Headset with Mic
              </button>
              <button
                type="button"
                onClick={() => addExtraPeripheral('printer')}
                style={{ width: '100%', textAlign: 'left', padding: '0.4rem 0.75rem', fontSize: '0.74rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
              >
                🖨️ Printer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
