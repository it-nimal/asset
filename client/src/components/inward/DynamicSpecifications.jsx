import React from 'react';
import { getSpecificationsForDevice } from '../../config/assetSpecificationConfig';
import { Cpu, HardDrive, Monitor, Layers, Settings, Radio } from 'lucide-react';

export default function DynamicSpecifications({
  category = 'Computers & Laptops',
  deviceType = 'Laptop',
  specifications = {},
  onChange,
}) {
  const fields = getSpecificationsForDevice(category, deviceType);

  const handleFieldChange = (key, value) => {
    onChange({
      ...specifications,
      [key]: value,
    });
  };

  if (!fields || fields.length === 0) {
    return (
      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic', padding: '0.5rem 0' }}>
        No special technical parameters required for this item type.
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '0.85rem',
      }}
    >
      {fields.map((f) => {
        const val = specifications[f.key] || '';

        return (
          <div key={f.key} className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {f.label}
            </label>

            {f.type === 'select' ? (
              <select
                value={val}
                onChange={(e) => handleFieldChange(f.key, e.target.value)}
                className="form-select"
                style={{ fontSize: '0.82rem', padding: '0.45rem 0.65rem' }}
              >
                <option value="">-- {f.placeholder || 'Select ' + f.label} --</option>
                {(f.options || []).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={val}
                placeholder={f.placeholder || ''}
                onChange={(e) => handleFieldChange(f.key, e.target.value)}
                className="form-control"
                style={{ fontSize: '0.82rem', padding: '0.45rem 0.65rem' }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
