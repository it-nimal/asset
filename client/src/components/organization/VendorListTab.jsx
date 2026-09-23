import React, { useState } from 'react';
import { Truck, Plus, Mail, Phone, MapPin } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../common/Toast';

export default function VendorListTab({ vendors = [], assets = [], onSuccess }) {
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    category: 'Hardware & IT Equipment',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Vendor name is required');
      return;
    }
    setLoading(true);
    try {
      await api.createVendor(form);
      toast.success('Vendor added successfully');
      setShowModal(false);
      setForm({ name: '', contactPerson: '', email: '', phone: '', address: '', category: 'Hardware & IT Equipment' });
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err.message || 'Failed to add vendor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Vendors & OEM Partners ({vendors.length})
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem', marginBottom: 0 }}>
            Manage hardware manufacturers, warranty providers, and maintenance partners.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
        >
          <Plus size={16} />
          <span>Add Vendor</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {vendors.map((v) => (
          <div key={v._id || v.name} className="card card-hoverable" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(251, 191, 36, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fbbf24',
                }}
              >
                <Truck size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  {v.name}
                </h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{v.category}</span>
              </div>
            </div>

            {v.contactPerson && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Contact: {v.contactPerson}</div>}
            {v.email && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Mail size={13} /> {v.email}</div>}
            {v.phone && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}><Phone size={13} /> {v.phone}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
