import React from 'react';
import { Calendar, MapPin, Tag, FileText, Info } from 'lucide-react';
import { COMPANY_PLANTS } from '../../constants/organization';

const PURPOSE_OPTIONS = [
  'Regular Work',
  'New Joining',
  'Replacement',
  'Temporary Allocation',
  'Project',
  'Other',
];

export default function AllocationDetailsForm({
  allocationDate,
  setAllocationDate,
  location,
  setLocation,
  purpose,
  setPurpose,
  expectedReturnDate,
  setExpectedReturnDate,
  remarks,
  setRemarks,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', borderBottom: '1px solid var(--border-default)', paddingBottom: '0.35rem' }}>
        Allocation & Custody Parameters
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
        {/* Allocation Date */}
        <div>
          <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
            Allocation Date <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="date"
            value={allocationDate}
            onChange={(e) => setAllocationDate(e.target.value)}
            className="form-input"
            required
            style={{ fontSize: '0.82rem' }}
          />
        </div>

        {/* Location / Plant */}
        <div>
          <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
            Issuing Facility / Plant <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="form-input"
            required
            style={{ fontSize: '0.82rem' }}
          >
            {COMPANY_PLANTS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Purpose */}
        <div>
          <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
            Allocation Purpose <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <select
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="form-input"
            required
            style={{ fontSize: '0.82rem' }}
          >
            {PURPOSE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Expected Return Date */}
        <div>
          <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
            Expected Return Date (Optional)
          </label>
          <input
            type="date"
            value={expectedReturnDate}
            onChange={(e) => setExpectedReturnDate(e.target.value)}
            className="form-input"
            style={{ fontSize: '0.82rem' }}
          />
        </div>
      </div>

      {/* Remarks */}
      <div>
        <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
          Issuance Remarks & Special Instructions
        </label>
        <textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="e.g. Standard engineering kit issued with charger and bag. Handover undertaking acknowledged."
          className="form-input"
          rows={2}
          style={{ fontSize: '0.82rem', resize: 'vertical' }}
        />
      </div>
    </div>
  );
}
