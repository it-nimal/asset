import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './components/common/Toast';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './components/dashboard/Dashboard';
import { X } from 'lucide-react';
import AssetTable from './components/assets/AssetTable';
import AssetDetailsModal from './components/assets/AssetDetailsModal';
import {
  AssignModal,
  TransferModal,
  ReturnModal,
  EditAssetModal,
  QuickMaintenanceModal,
} from './components/assets/AssetActionModals';
import Addasset from './components/addasset';
import MaintenanceTracker from './components/MaintenanceTracker';
import OrganizationView from './components/organization/OrganizationView';
import SoftwareManagement from './components/software/SoftwareManagement';
import NetworkManagement from './components/network/NetworkManagement';
import ReportsView from './components/reports/ReportsView';
import AuditLogView from './components/audit/AuditLogView';
import { api } from './services/api';

function ITAMApp() {
  const { user } = useAuth();
  const toast = useToast();
  const [activePage, setActivePage] = useState('dashboard');
  const [globalSearch, setGlobalSearch] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Primary datasets
  const [assets, setAssets] = useState([]);
  const [stats, setStats] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [locations, setLocations] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [software, setSoftware] = useState([]);
  const [networkDevices, setNetworkDevices] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [dbConnected, setDbConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  // Modals state
  const [selectedAssetForDetails, setSelectedAssetForDetails] = useState(null);
  const [detailsInitialTab, setDetailsInitialTab] = useState('overview');
  const [selectedAssetForAssign, setSelectedAssetForAssign] = useState(null);
  const [selectedAssetForTransfer, setSelectedAssetForTransfer] = useState(null);
  const [selectedAssetForReturn, setSelectedAssetForReturn] = useState(null);
  const [selectedAssetForEdit, setSelectedAssetForEdit] = useState(null);
  const [selectedAssetForMaintenance, setSelectedAssetForMaintenance] = useState(null);
  const [assetToDelete, setAssetToDelete] = useState(null);

  // Load all enterprise data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        healthRes,
        assetsRes,
        statsRes,
        empRes,
        deptRes,
        locRes,
        vendorRes,
        softRes,
        netRes,
        notifRes,
      ] = await Promise.allSettled([
        api.getHealth(),
        api.getAssets(),
        api.getStatsSummary(),
        api.getEmployees(),
        api.getDepartments(),
        api.getLocations(),
        api.getVendors(),
        api.getSoftware(),
        api.getNetworkDevices(),
        api.getNotifications(),
      ]);

      const isOnline =
        (healthRes.status === 'fulfilled' && (healthRes.value?.database?.connected || healthRes.value?.status === 'OK')) ||
        (statsRes.status === 'fulfilled' && (statsRes.value?.data?.dbConnected || statsRes.value?.success)) ||
        (assetsRes.status === 'fulfilled' && Array.isArray(assetsRes.value?.data) && assetsRes.value?.data?.length > 0);

      setDbConnected(Boolean(isOnline));

      if (assetsRes.status === 'fulfilled') {
        const val = assetsRes.value;
        setAssets(Array.isArray(val) ? val : val?.data || []);
      }
      if (statsRes.status === 'fulfilled') {
        const val = statsRes.value;
        setStats(val?.data || val);
      }
      if (empRes.status === 'fulfilled') {
        const val = empRes.value;
        setEmployees(Array.isArray(val) ? val : val?.data || []);
      }
      if (deptRes.status === 'fulfilled') {
        const val = deptRes.value;
        setDepartments(Array.isArray(val) ? val : val?.data || []);
      }
      if (locRes.status === 'fulfilled') {
        const val = locRes.value;
        setLocations(Array.isArray(val) ? val : val?.data || []);
      }
      if (vendorRes.status === 'fulfilled') {
        const val = vendorRes.value;
        setVendors(Array.isArray(val) ? val : val?.data || []);
      }
      if (softRes.status === 'fulfilled') {
        const val = softRes.value;
        setSoftware(Array.isArray(val) ? val : val?.data || []);
      }
      if (netRes.status === 'fulfilled') {
        const val = netRes.value;
        setNetworkDevices(Array.isArray(val) ? val : val?.data || []);
      }
      if (notifRes.status === 'fulfilled') {
        const val = notifRes.value;
        setNotifications(Array.isArray(val) ? val : val?.data || []);
      }
    } catch (err) {
      console.warn('Data loading error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      api
        .getHealth()
        .then((h) => {
          if (h?.database?.connected || h?.status === 'OK') setDbConnected(true);
        })
        .catch(() => {});
    }, 20000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Counts by category for sidebar badges
  const countsByCategory = useMemo(() => {
    const map = {};
    assets.forEach((a) => {
      const cat = a.deviceType || 'Other';
      map[cat] = (map[cat] || 0) + 1;
    });
    return map;
  }, [assets]);

  // Asset deletion handler
  const handleDeleteAsset = (asset) => {
    setAssetToDelete(asset);
  };

  // Determine current active asset category filter based on page id
  const getAssetCategoryFilter = () => {
    switch (activePage) {
      case 'assets-laptops':
        return 'Laptop';
      case 'assets-desktops':
        return 'Desktop';
      case 'assets-servers':
        return 'Server';
      case 'assets-monitors':
        return 'Monitor';
      case 'assets-network':
        return 'Network Switch';
      case 'assets-printers':
        return 'Printer';
      case 'assets-tablets':
        return 'Tablet';
      default:
        return 'All';
    }
  };

  const isAssetListingPage = activePage.startsWith('assets-');

  const sidebar = (
    <Sidebar
      activePage={activePage}
      setActivePage={setActivePage}
      stats={stats}
      countsByCategory={countsByCategory}
      onCloseMobile={() => setMobileNavOpen(false)}
    />
  );

  const header = (
    <Header
      activePage={activePage}
      globalSearch={globalSearch}
      setGlobalSearch={setGlobalSearch}
      onRefresh={loadData}
      onOpenAddAsset={() => setActivePage('asset-add')}
      notifications={notifications}
      dbConnected={dbConnected}
      onToggleMobile={() => setMobileNavOpen((prev) => !prev)}
    />
  );

  const content = (
    <>
      {/* DASHBOARD */}
      {activePage === 'dashboard' && (
        <Dashboard
          stats={stats}
          assets={assets}
          onNavigate={(page) => setActivePage(page)}
        />
      )}

      {/* ASSET INVENTORY TABLES (Filtered by Category) */}
      {isAssetListingPage && (
        <div style={{ padding: '1.5rem 2rem 4rem', maxWidth: '1440px', margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                {activePage === 'assets-all' ? 'Hardware Inventory' : `${getAssetCategoryFilter()} Devices`}
              </h1>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Physical machines, hostnames, static IPs, and custodian assignments across corporate plants.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActivePage('asset-add')}
              className="btn btn-primary btn-sm"
            >
              <span>+ Inward Asset</span>
            </button>
          </div>

          <AssetTable
            assets={assets}
            categoryFilter={getAssetCategoryFilter()}
            globalSearch={globalSearch}
            onViewDetails={(asset, tab = 'overview') => {
              setSelectedAssetForDetails(asset);
              setDetailsInitialTab(tab);
            }}
            onAssign={(asset) => setSelectedAssetForAssign(asset)}
            onTransfer={(asset) => setSelectedAssetForTransfer(asset)}
            onReturn={(asset) => setSelectedAssetForReturn(asset)}
            onMaintenance={(asset) => setSelectedAssetForMaintenance(asset)}
            onEdit={(asset) => setSelectedAssetForEdit(asset)}
            onDelete={(asset) => handleDeleteAsset(asset)}
          />
        </div>
      )}

      {/* ADD / INWARD ASSET */}
      {activePage === 'asset-add' && (
        <Addasset
          onAssetCreated={() => {
            loadData();
            setActivePage('assets-all');
          }}
          dbConnected={dbConnected}
          employees={employees}
          departments={departments}
          locations={locations}
          vendors={vendors}
          assets={assets}
        />
      )}

      {/* ASSIGN ASSET PAGE */}
      {activePage === 'asset-assign' && (
        <div style={{ padding: '1.5rem 2rem 4rem', maxWidth: '1440px', margin: '0 auto' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Asset Allocation & Issuance
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Select an available in-stock system and issue it to an employee custodian.
            </p>
          </div>

          <AssetTable
            assets={assets}
            categoryFilter="All"
            globalSearch={globalSearch}
            onViewDetails={(asset) => {
              setSelectedAssetForDetails(asset);
              setDetailsInitialTab('assignment');
            }}
            onAssign={(asset) => setSelectedAssetForAssign(asset)}
            onTransfer={(asset) => setSelectedAssetForTransfer(asset)}
            onReturn={(asset) => setSelectedAssetForReturn(asset)}
            onMaintenance={(asset) => setSelectedAssetForMaintenance(asset)}
            onEdit={(asset) => setSelectedAssetForEdit(asset)}
            onDelete={(asset) => handleDeleteAsset(asset)}
          />
        </div>
      )}

      {/* TRANSFER ASSET */}
      {activePage === 'asset-transfer' && (
        <div style={{ padding: '1.5rem 2rem 4rem', maxWidth: '1440px', margin: '0 auto' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Inter-Departmental Custody Transfer
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Transfer equipment between departments, facilities, or users with automatic audit trail recording.
            </p>
          </div>

          <AssetTable
            assets={assets}
            categoryFilter="All"
            globalSearch={globalSearch}
            onViewDetails={(asset) => {
              setSelectedAssetForDetails(asset);
              setDetailsInitialTab('history');
            }}
            onAssign={(asset) => setSelectedAssetForAssign(asset)}
            onTransfer={(asset) => setSelectedAssetForTransfer(asset)}
            onReturn={(asset) => setSelectedAssetForReturn(asset)}
            onMaintenance={(asset) => setSelectedAssetForMaintenance(asset)}
            onEdit={(asset) => setSelectedAssetForEdit(asset)}
            onDelete={(asset) => handleDeleteAsset(asset)}
          />
        </div>
      )}

      {/* RETURN ASSET */}
      {activePage === 'asset-return' && (
        <div style={{ padding: '1.5rem 2rem 4rem', maxWidth: '1440px', margin: '0 auto' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Asset Return & Stock Handover
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Check in returned hardware from departing employees back into active available inventory.
            </p>
          </div>

          <AssetTable
            assets={assets}
            categoryFilter="All"
            globalSearch={globalSearch}
            onViewDetails={(asset) => {
              setSelectedAssetForDetails(asset);
              setDetailsInitialTab('assignment');
            }}
            onAssign={(asset) => setSelectedAssetForAssign(asset)}
            onTransfer={(asset) => setSelectedAssetForTransfer(asset)}
            onReturn={(asset) => setSelectedAssetForReturn(asset)}
            onMaintenance={(asset) => setSelectedAssetForMaintenance(asset)}
            onEdit={(asset) => setSelectedAssetForEdit(asset)}
            onDelete={(asset) => handleDeleteAsset(asset)}
          />
        </div>
      )}

      {/* MAINTENANCE & REPAIRS */}
      {activePage === 'asset-maintenance' && (
        <MaintenanceTracker
          assets={assets}
          onRefresh={loadData}
          loading={loading}
        />
      )}

      {/* WARRANTY TRACKER */}
      {activePage === 'asset-warranty' && (
        <div style={{ padding: '1.5rem 2rem 4rem', maxWidth: '1440px', margin: '0 auto' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              OEM Hardware Warranty Expiration Monitor
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Track machines with active, nearing-expiry (30/60 days), and expired manufacturer warranties.
            </p>
          </div>

          <AssetTable
            assets={assets}
            categoryFilter="All"
            globalSearch={globalSearch}
            onViewDetails={(asset) => {
              setSelectedAssetForDetails(asset);
              setDetailsInitialTab('warranty');
            }}
            onAssign={(asset) => setSelectedAssetForAssign(asset)}
            onTransfer={(asset) => setSelectedAssetForTransfer(asset)}
            onReturn={(asset) => setSelectedAssetForReturn(asset)}
            onMaintenance={(asset) => setSelectedAssetForMaintenance(asset)}
            onEdit={(asset) => setSelectedAssetForEdit(asset)}
            onDelete={(asset) => handleDeleteAsset(asset)}
          />
        </div>
      )}

      {/* ORGANIZATION DIRECTORIES */}
      {activePage === 'org-employees' && (
        <OrganizationView
          type="employees"
          employees={employees}
          departments={departments}
          locations={locations}
          vendors={vendors}
          assets={assets}
          onSuccess={loadData}
        />
      )}

      {activePage === 'org-departments' && (
        <OrganizationView
          type="departments"
          employees={employees}
          departments={departments}
          locations={locations}
          vendors={vendors}
          assets={assets}
        />
      )}

      {activePage === 'org-locations' && (
        <OrganizationView
          type="locations"
          employees={employees}
          departments={departments}
          locations={locations}
          vendors={vendors}
          assets={assets}
        />
      )}

      {activePage === 'org-vendors' && (
        <OrganizationView
          type="vendors"
          employees={employees}
          departments={departments}
          locations={locations}
          vendors={vendors}
          assets={assets}
        />
      )}

      {/* SOFTWARE ASSET MANAGEMENT (SAM) */}
      {(activePage === 'software-inventory' || activePage === 'software-licenses') && (
        <SoftwareManagement
          software={software}
          onRefresh={loadData}
        />
      )}

      {/* NETWORK INFRASTRUCTURE */}
      {activePage === 'network-devices' && (
        <NetworkManagement
          devices={networkDevices}
          onRefresh={loadData}
        />
      )}

      {/* COMPLIANCE & EXPORT REPORTS */}
      {activePage === 'reports' && (
        <ReportsView
          assets={assets}
          software={software}
          maintenance={[]}
        />
      )}

      {/* AUDIT LOGS */}
      {activePage === 'audit-logs' && (
        <AuditLogView />
      )}
    </>
  );

  return (
    <>
      <AppLayout
        sidebar={sidebar}
        header={header}
        mobileNavOpen={mobileNavOpen}
        setMobileNavOpen={setMobileNavOpen}
      >
        {content}
      </AppLayout>

      {/* Global Action Modals */}
      {selectedAssetForDetails && (
        <AssetDetailsModal
          asset={selectedAssetForDetails}
          initialTab={detailsInitialTab}
          onClose={() => setSelectedAssetForDetails(null)}
          onAssign={(asset) => setSelectedAssetForAssign(asset)}
          onTransfer={(asset) => setSelectedAssetForTransfer(asset)}
          onReturn={(asset) => setSelectedAssetForReturn(asset)}
          onMaintenance={(asset) => setSelectedAssetForMaintenance(asset)}
          onEdit={(asset) => setSelectedAssetForEdit(asset)}
          onDelete={(asset) => handleDeleteAsset(asset)}
        />
      )}

      {selectedAssetForAssign && (
        <AssignModal
          asset={selectedAssetForAssign}
          employees={employees}
          departments={departments}
          locations={locations}
          onClose={() => setSelectedAssetForAssign(null)}
          onSuccess={loadData}
        />
      )}

      {selectedAssetForTransfer && (
        <TransferModal
          asset={selectedAssetForTransfer}
          employees={employees}
          departments={departments}
          locations={locations}
          onClose={() => setSelectedAssetForTransfer(null)}
          onSuccess={loadData}
        />
      )}

      {selectedAssetForReturn && (
        <ReturnModal
          asset={selectedAssetForReturn}
          onClose={() => setSelectedAssetForReturn(null)}
          onSuccess={loadData}
        />
      )}

      {selectedAssetForEdit && (
        <EditAssetModal
          asset={selectedAssetForEdit}
          employees={employees}
          departments={departments}
          locations={locations}
          onClose={() => setSelectedAssetForEdit(null)}
          onSuccess={loadData}
        />
      )}

      {selectedAssetForMaintenance && (
        <QuickMaintenanceModal
          asset={selectedAssetForMaintenance}
          onClose={() => setSelectedAssetForMaintenance(null)}
          onSuccess={loadData}
        />
      )}

      {assetToDelete && (
        <div className="modal-overlay" onClick={() => setAssetToDelete(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f87171' }}>Delete Asset Record</h3>
              <button type="button" onClick={() => setAssetToDelete(null)} className="btn btn-ghost btn-icon btn-xs">
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-primary)', fontSize: '0.88rem', fontWeight: 500 }}>
                Are you sure you want to delete <strong>{assetToDelete.make} {assetToDelete.model}</strong>?
              </p>
              <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: '#818cf8', fontFamily: 'var(--font-mono)' }}>
                Tag: {assetToDelete.assetNo || 'N/A'} • S/N: {assetToDelete.sr}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.65rem', lineHeight: 1.5 }}>
                This will permanently remove the asset and its history logs from the database. This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button type="button" onClick={() => setAssetToDelete(null)} className="btn btn-outline btn-sm">
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await api.deleteAsset(assetToDelete._id);
                    toast.success('Asset record permanently removed', 'Asset Deleted');
                    setAssetToDelete(null);
                    loadData();
                  } catch (err) {
                    toast.error(err.message, 'Delete Failed');
                  }
                }}
                className="btn btn-danger btn-sm"
              >
                Yes, Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ITAMApp />
      </ToastProvider>
    </AuthProvider>
  );
}
