import React, { useState } from 'react';
import { MapPin, Plus, Edit3, Trash2, Building2 } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../common/Toast';

export default function LocationListTab({ locations = [], assets = [], onSuccess }) {
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [locToEdit, setLocToEdit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    building: 'Tower A',
    floor: '1st Floor',
    room: 'Room 101',
    address: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Location name is required');
      return;
    }
    setLoading(true);
    try {
      if (locToEdit) {
        await api.updateLocation(locToEdit._id, form);
        toast.success('Location updated successfully');
      } else {
        await api.createLocation(form);
        toast.success('Location created successfully');
      }
      setShowModal(false);
      setLocToEdit(null);
      setForm({ name: '', building: 'Tower A', floor: '1st Floor', room: 'Room 101', address: '' });
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err.message || 'Failed to save location');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Locations & Facilities Directory
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem', marginBottom: 0 }}>
            Manage company plant locations, facilities, and stationed equipment.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setLocToEdit(null);
            setForm({ name: '', building: 'Tower A', floor: '1st Floor', room: 'Room 101', address: '' });
            setShowModal(true);
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
        >
          <Plus size={16} />
          <span>Add Location</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {locations.map((loc) => {
          const locAssets = assets.filter((a) => a.plant === loc.name || a.location === loc.name);

          return (
            <div key={loc._id || loc.name} className="card card-hoverable" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(56, 189, 248, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#38bdf8',
                    }}
                  >
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                      {loc.name}
                    </h3>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {loc.building} • {loc.floor} • {loc.room}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '0.85rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {loc.address || 'Corporate Facility Site'}
              </div>

              <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Stationed Devices:</span>
                <span className="badge badge-available">{locAssets.length} Assets</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
