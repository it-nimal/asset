import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X, User, Check, Building2, MapPin, Laptop, Layers, ShieldCheck, AlertCircle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

export default function EmployeeSelector({
  employees = [],
  assets = [],
  selectedEmployee,
  onSelectEmployee,
  onClearEmployee,
  disabled = false,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter active employees matching search term
  const filteredEmployees = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const activeList = employees.filter((e) => e.status !== 'Resigned' && e.status !== 'Inactive');
    if (!q) return activeList.slice(0, 8);
    return activeList.filter((e) => {
      const name = (e.name || '').toLowerCase();
      const code = (e.employeeId || '').toLowerCase();
      const dept = (e.department || '').toLowerCase();
      const email = (e.email || '').toLowerCase();
      return name.includes(q) || code.includes(q) || dept.includes(q) || email.includes(q);
    }).slice(0, 12);
  }, [employees, searchTerm]);

  // Find assets currently held by the selected employee
  const currentAssignedAssets = useMemo(() => {
    if (!selectedEmployee) return [];
    const empName = (selectedEmployee.name || '').trim().toLowerCase();
    const empCode = (selectedEmployee.employeeId || '').trim().toLowerCase();
    const empMail = (selectedEmployee.email || '').trim().toLowerCase();

    return assets.filter((a) => {
      if (a.status !== 'Assigned') return false;
      const uName = (a.userName || '').trim().toLowerCase();
      const uCode = (a.empCode || '').trim().toLowerCase();
      const uMail = (a.mailId || '').trim().toLowerCase();

      return (
        (empCode && uCode === empCode) ||
        (empMail && uMail === empMail) ||
        (empName && uName === empName)
      );
    });
  }, [selectedEmployee, assets]);

  if (selectedEmployee) {
    return (
      <div
        style={{
          backgroundColor: 'var(--bg-surface-raised, #f8fafc)',
          border: '1px solid rgba(2, 132, 199, 0.3)',
          borderRadius: '10px',
          padding: '1.1rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-full)',
                background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '1.1rem',
                flexShrink: 0,
              }}
            >
              {(selectedEmployee.name || 'E').charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {selectedEmployee.name}
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontFamily: 'monospace',
                    padding: '0.15rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(2, 132, 199, 0.1)',
                    color: '#0284c7',
                    fontWeight: 700,
                  }}
                >
                  {selectedEmployee.employeeId || 'NO-CODE'}
                </span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    padding: '0.12rem 0.45rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    color: '#059669',
                    fontWeight: 700,
                  }}
                >
                  {selectedEmployee.status || 'Active'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '3px', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Building2 size={12} />
                  {selectedEmployee.department || 'General'}
                </span>
                <span>•</span>
                <span>{selectedEmployee.designation || 'Staff Associate'}</span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <MapPin size={12} />
                  {selectedEmployee.location || 'Vitromed'}
                </span>
              </div>
            </div>
          </div>

          {!disabled && (
            <button
              type="button"
              onClick={onClearEmployee}
              className="btn btn-outline btn-xs"
              style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}
            >
              Change Employee
            </button>
          )}
        </div>

        {/* Existing Assets held by Employee */}
        <div
          style={{
            marginTop: '0.25rem',
            padding: '0.65rem 0.85rem',
            backgroundColor: currentAssignedAssets.length > 0 ? 'rgba(56, 189, 248, 0.05)' : 'rgba(0,0,0,0.02)',
            borderRadius: '6px',
            border: '1px dashed var(--border-default)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Laptop size={13} color="#0284c7" />
              Currently Assigned Equipment ({currentAssignedAssets.length})
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {currentAssignedAssets.length === 0 ? 'Ready for primary bundle' : 'Adding to existing custody'}
            </span>
          </div>

          {currentAssignedAssets.length === 0 ? (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
              No hardware is currently checked out to this employee.
            </p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
              {currentAssignedAssets.map((ast) => (
                <div
                  key={ast._id}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.72rem',
                    backgroundColor: 'var(--bg-surface, #ffffff)',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '4px',
                    border: '1px solid var(--border-default)',
                  }}
                >
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0284c7' }}>
                    {ast.assetNo || ast.sr}
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {ast.deviceType || 'Hardware'} ({ast.make} {ast.model})
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Select Employee Custodian <span style={{ color: '#ef4444' }}>*</span>
        </label>
        {isDropdownOpen && (
          <button
            type="button"
            onClick={() => setIsDropdownOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#0284c7',
              fontSize: '0.72rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem',
              padding: '0 4px',
            }}
          >
            <span>Close List</span>
            <X size={12} />
          </button>
        )}
      </div>

      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsDropdownOpen(true);
          }}
          onFocus={() => setIsDropdownOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsDropdownOpen(false);
            }
          }}
          placeholder="Search employee by Name, Employee ID (e.g. EMP00125), or Department..."
          className="form-input"
          style={{
            paddingLeft: '2.2rem',
            paddingRight: searchTerm ? '3.8rem' : '2.2rem',
            width: '100%',
          }}
        />
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: '6px',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
          }}
        >
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-faint)',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
              }}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
            }}
            title={isDropdownOpen ? 'Close list' : 'Open list'}
          >
            {isDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Dropdown list */}
      {isDropdownOpen && (
        <div
          style={{
            maxHeight: '260px',
            overflowY: 'auto',
            backgroundColor: 'var(--bg-surface, #ffffff)',
            border: '1px solid var(--border-default)',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            zIndex: 20,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Sticky Dropdown Header with Close Button */}
          <div
            style={{
              padding: '0.45rem 0.75rem',
              backgroundColor: 'var(--bg-surface-raised, #f1f5f9)',
              borderBottom: '1px solid var(--border-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'sticky',
              top: 0,
              zIndex: 2,
            }}
          >
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              STAFF DIRECTORY ({filteredEmployees.length})
            </span>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                fontSize: '0.72rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '2px 6px',
                borderRadius: '4px',
              }}
              title="Close list (Esc)"
            >
              <span>Close</span>
              <X size={13} />
            </button>
          </div>

          {filteredEmployees.length === 0 ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              No matching active employees found.
            </div>
          ) : (
            filteredEmployees.map((emp) => (
              <button
                key={emp._id || emp.employeeId}
                type="button"
                onClick={() => {
                  onSelectEmployee(emp);
                  setIsDropdownOpen(false);
                  setSearchTerm('');
                }}
                style={{
                  padding: '0.65rem 0.9rem',
                  border: 'none',
                  borderBottom: '1px solid var(--border-default, #f1f5f9)',
                  background: 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover, #f8fafc)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'rgba(2, 132, 199, 0.1)',
                      color: '#0284c7',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {(emp.name || 'E').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {emp.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {emp.department || 'General'} • {emp.designation || 'Staff'} • {emp.location || 'Vitromed'}
                    </div>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '0.72rem',
                    fontFamily: 'monospace',
                    padding: '0.12rem 0.45rem',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                  }}
                >
                  {emp.employeeId || 'NO-ID'}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
