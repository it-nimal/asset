import React from 'react';

export default function AppLayout({ sidebar, header, children, mobileNavOpen, setMobileNavOpen }) {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-canvas)',
        color: 'var(--text-primary)',
      }}
    >
      {/* Sidebar container with mobile drawer support */}
      <div className={`sidebar-wrapper ${mobileNavOpen ? 'mobile-open' : ''}`}>
        {sidebar}
      </div>

      {/* Mobile Backdrop */}
      {mobileNavOpen && (
        <div
          onClick={() => setMobileNavOpen && setMobileNavOpen(false)}
          className="mobile-backdrop"
          aria-hidden="true"
        />
      )}

      {/* Main Content Pane */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          overflowX: 'hidden',
          backgroundColor: 'var(--bg-canvas)',
        }}
      >
        {header}
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            background: 'transparent',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
