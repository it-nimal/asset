import React, { useState, useEffect } from 'react';
import {
  Laptop,
  Monitor,
  Keyboard,
  Headphones,
  Printer,
  Scan,
  Zap,
  Plus,
  Check,
} from 'lucide-react';

export const PERIPHERAL_OPTIONS = [
  {
    id: 'monitor',
    name: 'External Monitor / Display',
    shortName: 'Monitor',
    icon: Monitor,
    color: '#818cf8',
    defaultText: '24-inch FHD Monitor',
    hasDetailInput: true,
    detailPlaceholder: 'e.g. Dell 24" FHD (P2422H)',
  },
  {
    id: 'keyboard_mouse',
    name: 'Keyboard & Mouse',
    shortName: 'Keyboard & Mouse',
    icon: Keyboard,
    color: '#38bdf8',
    defaultText: 'Wireless Keyboard & Mouse',
    hasDetailInput: true,
    detailPlaceholder: 'e.g. Wireless K/B & Mouse (Logitech MK270)',
  },
  {
    id: 'headphone',
    name: 'Headphone / Headset',
    shortName: 'Headphone',
    icon: Headphones,
    color: '#ec4899',
    defaultText: 'Office Headset with Mic',
    hasDetailInput: true,
    detailPlaceholder: 'e.g. USB Headset with Mic',
  },
  {
    id: 'printer',
    name: 'Printer',
    shortName: 'Printer',
    icon: Printer,
    color: '#fbbf24',
    defaultText: 'Laser Printer',
    hasDetailInput: true,
    detailPlaceholder: 'e.g. HP LaserJet 1020 Plus',
  },
  {
    id: 'scanner',
    name: 'Document Scanner',
    shortName: 'Scanner',
    icon: Scan,
    color: '#34d399',
    defaultText: 'Document Scanner',
    hasDetailInput: true,
    detailPlaceholder: 'e.g. Flatbed / ADF Scanner',
  },
  {
    id: 'ups',
    name: 'UPS / Inverter Backup',
    shortName: 'UPS',
    icon: Zap,
    color: '#f87171',
    defaultText: 'UPS 600VA',
    hasDetailInput: true,
    detailPlaceholder: 'e.g. APC Back-UPS 600VA',
  },
];

/**
 * Parses an existing accessories string into structured peripheral states.
 */
export function parseAccessoriesString(accStr = '', monitorStr = '') {
  const str = (accStr || '').toLowerCase();
  const mon = (monitorStr || '').toLowerCase();

  return {
    monitor: mon.length > 0 || str.includes('monitor') || str.includes('lcd') || str.includes('screen'),
    monitorDetail: monitorStr || '',
    keyboard_mouse: str.includes('keyboard') || str.includes('k/b') || str.includes('mouse'),
    keyboard_mouseDetail: str.includes('wireless') ? 'Wireless Keyboard & Mouse' : 'Keyboard & Mouse',
    headphone: str.includes('headphone') || str.includes('headset') || str.includes('earphone'),
    headphoneDetail: 'Headset with Mic',
    printer: str.includes('printer') || str.includes('laserjet'),
    printerDetail: 'Laser Printer',
    scanner: str.includes('scanner') || str.includes('scan'),
    scannerDetail: 'Document Scanner',
    ups: str.includes('ups') || str.includes('inverter'),
    upsDetail: 'UPS 600VA',
    custom: '',
  };
}

/**
 * Compiles peripheral states back into a clean string for `accessories`.
 */
export function compileAccessoriesString(state) {
  const items = [];

  if (state.ups) items.push(state.upsDetail?.trim() || 'UPS');
  if (state.keyboard_mouse) items.push(state.keyboard_mouseDetail?.trim() || 'Keyboard & Mouse');
  if (state.headphone) items.push(state.headphoneDetail?.trim() || 'Headphone');
  if (state.printer) items.push(state.printerDetail?.trim() || 'Printer');
  if (state.scanner) items.push(state.scannerDetail?.trim() || 'Scanner');
  if (state.monitor && state.monitorDetail) items.push(`Monitor (${state.monitorDetail.trim()})`);
  if (state.custom && state.custom.trim()) items.push(state.custom.trim());

  return items.join(', ');
}

export default function HardwareAllocationSelector({
  deviceType = 'Laptop',
  onDeviceTypeChange,
  accessories = '',
  onAccessoriesChange,
  monitorDetails = '',
  onMonitorDetailsChange,
  compact = false,
  title = 'Hardware & Peripherals Assigned to User',
}) {
  const [selectedItems, setSelectedItems] = useState(() =>
    parseAccessoriesString(accessories, monitorDetails)
  );

  const [expandedDetails, setExpandedDetails] = useState({});

  // Synchronize internal state if external accessories string changes from outside
  useEffect(() => {
    const parsed = parseAccessoriesString(accessories, monitorDetails);
    setSelectedItems((prev) => ({
      ...parsed,
      custom: prev.custom || '',
    }));
  }, [accessories, monitorDetails]);

  // Handle toggling a peripheral item
  const handleToggle = (opt) => {
    const nextChecked = !selectedItems[opt.id];
    const updated = {
      ...selectedItems,
      [opt.id]: nextChecked,
      [`${opt.id}Detail`]: selectedItems[`${opt.id}Detail`] || opt.defaultText,
    };

    setSelectedItems(updated);

    // If it's monitor, also sync monitorDetails
    if (opt.id === 'monitor' && onMonitorDetailsChange) {
      onMonitorDetailsChange(nextChecked ? updated.monitorDetail || opt.defaultText : '');
    }

    if (onAccessoriesChange) {
      onAccessoriesChange(compileAccessoriesString(updated));
    }
  };

  // Handle editing the detail text for a peripheral
  const handleDetailChange = (optId, value) => {
    const updated = {
      ...selectedItems,
      [`${optId}Detail`]: value,
    };
    setSelectedItems(updated);

    if (optId === 'monitor' && onMonitorDetailsChange) {
      onMonitorDetailsChange(value);
    }

    if (onAccessoriesChange) {
      onAccessoriesChange(compileAccessoriesString(updated));
    }
  };

  const handleCustomChange = (value) => {
    const updated = {
      ...selectedItems,
      custom: value,
    };
    setSelectedItems(updated);

    if (onAccessoriesChange) {
      onAccessoriesChange(compileAccessoriesString(updated));
    }
  };

  const toggleExpand = (optId) => {
    setExpandedDetails((prev) => ({
      ...prev,
      [optId]: !prev[optId],
    }));
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface-raised, rgba(255,255,255,0.04))',
        border: '1px solid var(--border-default, #cbd5e1)',
        borderRadius: '8px',
        padding: compact ? '0.75rem' : '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
      }}
    >
      {/* SECTION HEADER & PRIMARY MACHINE TYPE */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <label className="form-label" style={{ fontWeight: 700, margin: 0, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
            {title}
          </label>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Select items provided to user
          </span>
        </div>

        {/* 1. Primary Device Selector (Laptop vs Desktop) */}
        {onDeviceTypeChange && (
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              Primary Machine:
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[
                { id: 'Laptop', label: 'Laptop', icon: Laptop },
                { id: 'Desktop', label: 'Desktop PC', icon: Monitor },
                { id: 'All in One Desktop', label: 'All-in-One PC', icon: Monitor },
                { id: 'Workstation', label: 'Workstation', icon: Laptop },
              ].map((dev) => {
                const Icon = dev.icon;
                const isSel = (deviceType || '').toLowerCase() === dev.id.toLowerCase();
                return (
                  <button
                    key={dev.id}
                    type="button"
                    onClick={() => onDeviceTypeChange(dev.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.4rem 0.75rem',
                      fontSize: '0.78rem',
                      fontWeight: isSel ? 700 : 500,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      border: isSel ? '1.5px solid var(--color-primary, #0284c7)' : '1px solid var(--border-default, #cbd5e1)',
                      backgroundColor: isSel ? 'rgba(2, 132, 199, 0.12)' : 'var(--bg-surface, #ffffff)',
                      color: isSel ? 'var(--color-primary, #0284c7)' : 'var(--text-primary)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Icon size={14} color={isSel ? 'var(--color-primary, #0284c7)' : 'var(--text-muted)'} />
                    <span>{dev.label}</span>
                    {isSel && <Check size={12} strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2. Peripheral Checklist / Option Chips */}
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
          Peripherals & Accessories Assigned:
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: compact ? 'repeat(auto-fit, minmax(130px, 1fr))' : 'repeat(auto-fit, minmax(155px, 1fr))',
            gap: '0.5rem',
          }}
        >
          {PERIPHERAL_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isChecked = !!selectedItems[opt.id];
            const isExpanded = !!expandedDetails[opt.id];

            return (
              <div
                key={opt.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  padding: '0.5rem 0.6rem',
                  borderRadius: '6px',
                  border: isChecked ? '1.5px solid var(--color-primary, #0284c7)' : '1px solid var(--border-default, #cbd5e1)',
                  backgroundColor: isChecked ? 'rgba(2, 132, 199, 0.08)' : 'var(--bg-surface, #ffffff)',
                  transition: 'all 0.15s ease',
                }}
              >
                <div
                  onClick={() => handleToggle(opt)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '4px',
                        border: isChecked ? 'none' : '1.5px solid var(--border-default, #94a3b8)',
                        backgroundColor: isChecked ? 'var(--color-primary, #0284c7)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {isChecked && <Check size={13} color="#fff" strokeWidth={3} />}
                    </div>
                    <Icon size={14} color={isChecked ? 'var(--color-primary, #0284c7)' : 'var(--text-muted)'} />
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: isChecked ? 700 : 500,
                        color: isChecked ? 'var(--text-primary)' : 'var(--text-muted)',
                      }}
                    >
                      {opt.shortName}
                    </span>
                  </div>

                  {isChecked && opt.hasDetailInput && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(opt.id);
                      }}
                      title="Edit item specifications"
                      style={{
                        border: 'none',
                        background: 'transparent',
                        padding: '1px 4px',
                        fontSize: '0.68rem',
                        color: 'var(--color-primary, #0284c7)',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      {isExpanded ? 'Hide' : 'Edit'}
                    </button>
                  )}
                </div>

                {/* Inline detail input if item is checked and expanded */}
                {isChecked && opt.hasDetailInput && (isExpanded || !compact) && (
                  <div style={{ marginTop: '0.2rem' }}>
                    <input
                      type="text"
                      className="form-control"
                      value={selectedItems[`${opt.id}Detail`] || ''}
                      onChange={(e) => handleDetailChange(opt.id, e.target.value)}
                      placeholder={opt.detailPlaceholder}
                      style={{
                        fontSize: '0.72rem',
                        padding: '0.25rem 0.45rem',
                        height: 'auto',
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Custom / Other Accessories Input */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
          <Plus size={12} color="var(--text-muted)" />
          <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Other Accessories / Peripherals:
          </span>
        </div>
        <input
          type="text"
          className="form-control"
          value={selectedItems.custom || ''}
          onChange={(e) => handleCustomChange(e.target.value)}
          placeholder="e.g. Web Camera, USB Docking Station, Laptop Bag, HDMI Cable"
          style={{ fontSize: '0.78rem', padding: '0.35rem 0.6rem' }}
        />
      </div>

      {/* Compiled Summary Pill */}
      {accessories && (
        <div
          style={{
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            backgroundColor: 'var(--bg-surface, #ffffff)',
            border: '1px dashed var(--border-default, #cbd5e1)',
            padding: '0.35rem 0.65rem',
            borderRadius: '5px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontWeight: 700, color: 'var(--color-primary, #0284c7)' }}>
            Bundle Summary:
          </span>
          <span>{accessories}</span>
        </div>
      )}
    </div>
  );
}
