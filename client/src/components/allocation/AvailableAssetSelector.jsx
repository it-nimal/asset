import React, { useState, useMemo } from 'react';
import { Search, Laptop, Monitor, Server, Printer, HardDrive, Radio, CheckSquare, Square, X, Cpu, Tag, Layers, Check } from 'lucide-react';

const CATEGORY_TABS = [
  { id: 'All', label: 'All Stock' },
  { id: 'Computers & Laptops', label: 'Laptops & Desktops' },
  { id: 'Monitors & Displays', label: 'Monitors' },
  { id: 'Enterprise Servers', label: 'Servers' },
  { id: 'Network Infrastructure', label: 'Network' },
  { id: 'Printers & Imaging', label: 'Printers' },
  { id: 'Cables & Peripherals', label: 'Peripherals & Accessories' },
];

export default function AvailableAssetSelector({
  availableAssets = [],
  selectedAssets = [],
  onToggleAsset,
  onRemoveAsset,
}) {
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter available assets based on search and category tab
  const filteredAssets = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return availableAssets.filter((a) => {
      // Must be Available
      if (a.status !== 'Available') return false;

      // Category tab match
      if (activeTab !== 'All') {
        const cat = (a.category || '').toLowerCase();
        const devType = (a.deviceType || '').toLowerCase();
        if (activeTab === 'Computers & Laptops') {
          if (!cat.includes('comp') && !cat.includes('laptop') && !devType.includes('laptop') && !devType.includes('desktop')) return false;
        } else if (activeTab === 'Monitors & Displays') {
          if (!cat.includes('display') && !cat.includes('monitor') && !devType.includes('monitor')) return false;
        } else if (activeTab === 'Enterprise Servers') {
          if (!cat.includes('server') && !devType.includes('server')) return false;
        } else if (activeTab === 'Network Infrastructure') {
          if (!cat.includes('network') && !devType.includes('switch') && !devType.includes('router')) return false;
        } else if (activeTab === 'Printers & Imaging') {
          if (!cat.includes('print') && !devType.includes('printer')) return false;
        } else if (activeTab === 'Cables & Peripherals') {
          if (!cat.includes('cable') && !cat.includes('periph') && !devType.includes('mouse') && !devType.includes('keyboard')) return false;
        }
      }

      // Search match
      if (q) {
        const tag = (a.assetNo || '').toLowerCase();
        const sr = (a.sr || '').toLowerCase();
        const make = (a.make || '').toLowerCase();
        const model = (a.model || '').toLowerCase();
        const type = (a.deviceType || '').toLowerCase();
        const loc = (a.plant || '').toLowerCase();
        return tag.includes(q) || sr.includes(q) || make.includes(q) || model.includes(q) || type.includes(q) || loc.includes(q);
      }

      return true;
    });
  }, [availableAssets, activeTab, searchTerm]);

  const isSelected = (assetId) => selectedAssets.some((a) => a._id === assetId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Select Available Asset(s) to Allocate <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <span style={{ fontSize: '0.74rem', color: '#0284c7', fontWeight: 600 }}>
          {selectedAssets.length} asset(s) chosen for issuance
        </span>
      </div>

      {/* Category Pills & Search */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Asset Tag (AST-VIT-XXXXX), Serial, Model, Device Type..."
            className="form-input"
            style={{ paddingLeft: '2.2rem', paddingRight: searchTerm ? '2.2rem' : '0.65rem', fontSize: '0.82rem', width: '100%' }}
          />
          <Search
            size={15}
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: 0,
              }}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '2px' }}>
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.28rem 0.65rem',
                fontSize: '0.72rem',
                fontWeight: activeTab === tab.id ? 700 : 500,
                borderRadius: 'var(--radius-full)',
                border: '1px solid',
                borderColor: activeTab === tab.id ? '#0284c7' : 'var(--border-default)',
                backgroundColor: activeTab === tab.id ? 'rgba(2, 132, 199, 0.12)' : 'transparent',
                color: activeTab === tab.id ? '#0284c7' : 'var(--text-muted)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Available Inventory List */}
      <div
        style={{
          maxHeight: '220px',
          overflowY: 'auto',
          border: '1px solid var(--border-default)',
          borderRadius: '8px',
          backgroundColor: 'var(--bg-surface-raised, #f8fafc)',
        }}
      >
        {filteredAssets.length === 0 ? (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            No available stock matching criteria in inventory depot.
          </div>
        ) : (
          filteredAssets.map((asset) => {
            const selected = isSelected(asset._id);
            return (
              <div
                key={asset._id}
                onClick={() => onToggleAsset(asset)}
                style={{
                  padding: '0.65rem 0.9rem',
                  borderBottom: '1px solid var(--border-default)',
                  backgroundColor: selected ? 'rgba(2, 132, 199, 0.08)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!selected) e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover, #f1f5f9)';
                }}
                onMouseLeave={(e) => {
                  if (!selected) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => {}}
                    style={{ cursor: 'pointer', accentColor: '#0284c7' }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0284c7', fontSize: '0.84rem' }}>
                        {asset.assetNo || 'AST-N/A'}
                      </span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {asset.make} {asset.model}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {asset.deviceType || 'Hardware'} • S/N: {asset.sr || 'N/A'} • Location: {asset.plant || 'Vitromed'}
                    </div>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '0.68rem',
                    padding: '0.15rem 0.45rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    color: '#059669',
                    fontWeight: 700,
                  }}
                >
                  Available
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Selected Assets Tray & Compact Specs Preview */}
      {selectedAssets.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
            Selected Hardware Tray & Specifications ({selectedAssets.length})
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {selectedAssets.map((asset) => {
              const specs = asset.specifications || {};
              const cpu = asset.processor || specs.processor || specs.cpu || '';
              const ram = asset.ramSize || specs.ram || specs.memory || '';
              const storage = asset.storage || specs.storage || specs.ssd || specs.hdd || '';
              const os = asset.osVersion || specs.operatingSystem || specs.os || '';

              return (
                <div
                  key={asset._id}
                  style={{
                    backgroundColor: 'var(--bg-surface, #ffffff)',
                    border: '1px solid rgba(2, 132, 199, 0.3)',
                    borderRadius: '8px',
                    padding: '0.75rem 0.9rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0284c7', fontSize: '0.84rem' }}>
                        {asset.assetNo || asset.sr}
                      </span>
                      <strong style={{ fontSize: '0.84rem', color: 'var(--text-primary)' }}>
                        {asset.make} {asset.model}
                      </strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        ({asset.deviceType || 'Hardware'})
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveAsset(asset._id)}
                      className="btn btn-ghost btn-icon btn-xs"
                      title="Remove from issuance bundle"
                      style={{ color: '#ef4444' }}
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* Compact Specs Grid */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.4rem',
                      fontSize: '0.72rem',
                      color: 'var(--text-secondary)',
                      backgroundColor: 'rgba(0, 0, 0, 0.02)',
                      padding: '0.35rem 0.6rem',
                      borderRadius: '4px',
                    }}
                  >
                    <span><strong>S/N:</strong> {asset.sr || 'N/A'}</span>
                    {cpu && <span>• <strong>CPU:</strong> {cpu}</span>}
                    {ram && <span>• <strong>RAM:</strong> {ram}</span>}
                    {storage && <span>• <strong>Storage:</strong> {storage}</span>}
                    {os && <span>• <strong>OS:</strong> {os}</span>}
                    {asset.accessories && <span>• <strong>Accessories:</strong> {asset.accessories}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
