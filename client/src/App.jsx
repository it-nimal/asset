import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './components/common/Toast';
import ErrorBoundary from './components/common/ErrorBoundary';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './components/dashboard/Dashboard';
import { X } from 'lucide-react';
import AssetTable from './components/assets/AssetTable';
import AssetDetailsModal from './components/assets/AssetDetailsModal';
import AssetLabelModal from './components/assets/AssetLabelModal';
import {
  ReturnModal,
  EditAssetModal,
  QuickMaintenanceModal,
  MaintenanceReturnModal,
  RetireAssetModal,
} from './components/assets/AssetActionModals';
import AssetAllocationModal from './components/allocation/AssetAllocationModal';
import Addasset from './components/addasset';
import MaintenanceRegister from './components/maintenance/MaintenanceRegister';
import TransferRegister from './components/transfers/TransferRegister';
import TransferForm from './components/transfers/TransferForm';
import OrganizationView from './components/organization/OrganizationView';
import EmployeeProfileModal from './components/organization/EmployeeProfileModal';
import EmployeeSelfService from './components/employee/EmployeeSelfService';
import SoftwareManagement from './components/software/SoftwareManagement';
import NetworkManagement from './components/network/NetworkManagement';
import ReportsView from './components/reports/ReportsView';
import AuditLogView from './components/audit/AuditLogView';
import InventoryView from './components/inventory/InventoryView';
import InwardRegister from './components/inward/InwardRegister';
import WarrantyView from './components/warranty/WarrantyView';
import SettingsView from './components/settings/SettingsView';
import LoginPage from './components/auth/LoginPage';
import { api } from './services/api';

// Helper to determine initial active page from URL hash or localStorage
const getInitialActivePage = () => {
  if (typeof window !== 'undefined') {
    const hash = window.location.hash.replace('#', '').trim();
    if (hash) return hash;
    const stored = localStorage.getItem('itam_active_page');
    if (stored) return stored;
  }
  return 'dashboard';
};

function ITAMApp() {
  const { user } = useAuth();
  const toast = useToast();
  const [activePage, setActivePageState] = useState(getInitialActivePage);
  const [globalSearch, setGlobalSearch] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const setActivePage = useCallback((page) => {
    setActivePageState(page);
    if (typeof window !== 'undefined') {
      localStorage.setItem('itam_active_page', page);
      if (window.location.hash !== `#${page}`) {
        window.location.hash = page;
      }
    }
  }, []);

  // Sync state if user navigates using browser back/forward buttons
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim();
      if (hash && hash !== activePage) {
        setActivePageState(hash);
        localStorage.setItem('itam_active_page', hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activePage]);

  // Keep URL hash and localStorage in sync with activePage on initial render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.location.hash !== `#${activePage}`) {
        window.location.hash = activePage;
      }
      localStorage.setItem('itam_active_page', activePage);
    }
  }, [activePage]);

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
  const [selectedEmployeeForProfile, setSelectedEmployeeForProfile] = useState(null);
  const [selectedAssetForAssign, setSelectedAssetForAssign] = useState(null);
  const [selectedAssetForTransfer, setSelectedAssetForTransfer] = useState(null);
  const [selectedAssetForReturn, setSelectedAssetForReturn] = useState(null);
  const [selectedAssetForEdit, setSelectedAssetForEdit] = useState(null);
  const [selectedAssetForMaintenance, setSelectedAssetForMaintenance] = useState(null);
  const [selectedAssetForMaintenanceReturn, setSelectedAssetForMaintenanceReturn] = useState(null);
  const [selectedAssetForRetire, setSelectedAssetForRetire] = useState(null);
  const [selectedAssetForLabel, setSelectedAssetForLabel] = useState(null);
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

  // Immediate state update when any asset is modified, assigned, transferred, or returned
  const handleAssetUpdated = (updatedAsset) => {
    if (Array.isArray(updatedAsset)) {
      const idMap = new Map(updatedAsset.map((a) => [a._id, a]));
      setAssets((prev) => prev.map((a) => idMap.get(a._id) || a));
    } else if (updatedAsset && updatedAsset._id) {
      setAssets((prev) =>
        prev.map((a) => (a._id === updatedAsset._id ? { ...a, ...updatedAsset } : a))
      );
      if (selectedAssetForDetails && selectedAssetForDetails._id === updatedAsset._id) {
        setSelectedAssetForDetails((prev) => ({ ...prev, ...updatedAsset }));
      }
    }
    loadData();
  };

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
      employeesCount={employees.length}
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
      assets={assets}
      employees={employees}
      onSelectAsset={(asset) => {
        setSelectedAssetForDetails(asset);
        setDetailsInitialTab('overview');
      }}
      onSelectEmployee={(emp) => {
        setSelectedEmployeeForProfile(emp);
      }}
      onNavigate={(page) => setActivePage(page)}
    />
  );

  const content = (
    <>
      {/* DASHBOARD */}
      {activePage === 'dashboard' && (
        <Dashboard
          stats={stats}
          assets={assets}
          employees={employees}
          globalSearch={globalSearch}
          onNavigate={(page) => setActivePage(page)}
          onViewDetails={(asset, tab = 'overview') => {
            setSelectedAssetForDetails(asset);
            setDetailsInitialTab(tab);
          }}
          onViewEmployee={(emp) => setSelectedEmployeeForProfile(emp)}
          onAssign={(asset) => setSelectedAssetForAssign(asset)}
          onTransfer={(asset) => setSelectedAssetForTransfer(asset)}
          onReturn={(asset) => setSelectedAssetForReturn(asset)}
          onMaintenanceReturn={(asset) => setSelectedAssetForMaintenanceReturn(asset)}
          onMaintenance={(asset) => setSelectedAssetForMaintenance(asset)}
          onEdit={(asset) => setSelectedAssetForEdit(asset)}
          onRetire={(asset) => setSelectedAssetForRetire(asset)}
          onDelete={(asset) => handleDeleteAsset(asset)}
        />
      )}

      {/* CENTRAL INVENTORY */}
      {activePage === 'inventory-all' && (
        <InventoryView
          assets={assets}
          departments={departments}
          locations={locations}
          onViewDetails={(asset, tab = 'overview') => {
            setSelectedAssetForDetails(asset);
            setDetailsInitialTab(tab);
          }}
          onAssign={(asset) => setSelectedAssetForAssign(asset)}
          onTransfer={(asset) => setSelectedAssetForTransfer(asset)}
          onReturn={(asset) => setSelectedAssetForReturn(asset)}
          onMaintenance={(asset) => setSelectedAssetForMaintenance(asset)}
          onMaintenanceReturn={(asset) => setSelectedAssetForMaintenanceReturn(asset)}
          onRetire={(asset) => setSelectedAssetForRetire(asset)}
          onInwardNew={() => setActivePage('asset-add')}
          onRefresh={loadData}
        />
      )}

      {/* INWARD & PROCUREMENT REGISTER */}
      {(activePage === 'inward-register' || activePage === 'procurement-all') && (
        <InwardRegister
          onNavigateToInventory={() => setActivePage('inventory-all')}
          onAssetCreated={() => loadData()}
          onRefresh={loadData}
        />
      )}

      {/* ASSET INVENTORY TABLES (Filtered by Category) */}
      {isAssetListingPage && (
        <div className="page-container">
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
            onViewEmployee={(emp) => setSelectedEmployeeForProfile(emp)}
            onPrintLabel={(asset) => setSelectedAssetForLabel(asset)}
            onAssign={(asset) => setSelectedAssetForAssign(asset)}
            onTransfer={(asset) => setSelectedAssetForTransfer(asset)}
            onReturn={(asset) => setSelectedAssetForReturn(asset)}
            onMaintenanceReturn={(asset) => setSelectedAssetForMaintenanceReturn(asset)}
            onMaintenance={(asset) => setSelectedAssetForMaintenance(asset)}
            onEdit={(asset) => setSelectedAssetForEdit(asset)}
            onRetire={(asset) => setSelectedAssetForRetire(asset)}
            onDelete={(asset) => handleDeleteAsset(asset)}
            onRefresh={loadData}
          />
        </div>
      )}

      {/* ADD / INWARD ASSET */}
      {activePage === 'asset-add' && (
        <Addasset
          onAssetCreated={(newAsset) => {
            if (newAsset) setAssets((prev) => [newAsset, ...prev]);
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
        <div className="page-container">
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
            onViewEmployee={(emp) => setSelectedEmployeeForProfile(emp)}
            onPrintLabel={(asset) => setSelectedAssetForLabel(asset)}
            onAssign={(asset) => setSelectedAssetForAssign(asset)}
            onTransfer={(asset) => setSelectedAssetForTransfer(asset)}
            onReturn={(asset) => setSelectedAssetForReturn(asset)}
            onMaintenanceReturn={(asset) => setSelectedAssetForMaintenanceReturn(asset)}
            onMaintenance={(asset) => setSelectedAssetForMaintenance(asset)}
            onEdit={(asset) => setSelectedAssetForEdit(asset)}
            onRetire={(asset) => setSelectedAssetForRetire(asset)}
            onDelete={(asset) => handleDeleteAsset(asset)}
          />
        </div>
      )}

      {/* TRANSFER ASSET REGISTER */}
      {activePage === 'asset-transfer' && (
        <TransferRegister onRefresh={loadData} />
      )}

      {/* RETURN ASSET */}
      {activePage === 'asset-return' && (
        <div className="page-container">
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
            onViewEmployee={(emp) => setSelectedEmployeeForProfile(emp)}
            onPrintLabel={(asset) => setSelectedAssetForLabel(asset)}
            onAssign={(asset) => setSelectedAssetForAssign(asset)}
            onTransfer={(asset) => setSelectedAssetForTransfer(asset)}
            onReturn={(asset) => setSelectedAssetForReturn(asset)}
            onMaintenanceReturn={(asset) => setSelectedAssetForMaintenanceReturn(asset)}
            onMaintenance={(asset) => setSelectedAssetForMaintenance(asset)}
            onEdit={(asset) => setSelectedAssetForEdit(asset)}
            onRetire={(asset) => setSelectedAssetForRetire(asset)}
            onDelete={(asset) => handleDeleteAsset(asset)}
          />
        </div>
      )}

      {/* MAINTENANCE & REPAIRS */}
      {activePage === 'asset-maintenance' && (
        <MaintenanceRegister />
      )}

      {/* WARRANTY TRACKER */}
      {activePage === 'asset-warranty' && (
        <WarrantyView
          assets={assets}
          onViewDetails={(asset, tab = 'warranty') => {
            setSelectedAssetForDetails(asset);
            setDetailsInitialTab(tab);
          }}
          onEditAsset={(asset) => setSelectedAssetForEdit(asset)}
        />
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
          globalSearch={globalSearch}
          onSuccess={loadData}
          onViewAsset={(asset) => setSelectedAssetForDetails(asset)}
          onAssign={(asset) => setSelectedAssetForAssign(asset)}
          onTransfer={(asset) => setSelectedAssetForTransfer(asset)}
          onReturn={(asset) => setSelectedAssetForReturn(asset)}
        />
      )}

      {/* BULK IMPORT USERS DIRECTORY */}
      {activePage === 'users-bulk' && (
        <OrganizationView
          type="employees"
          initialOpenBulkModal={true}
          employees={employees}
          departments={departments}
          locations={locations}
          vendors={vendors}
          assets={assets}
          globalSearch={globalSearch}
          onSuccess={loadData}
          onViewAsset={(asset) => setSelectedAssetForDetails(asset)}
          onAssign={(asset) => setSelectedAssetForAssign(asset)}
          onTransfer={(asset) => setSelectedAssetForTransfer(asset)}
          onReturn={(asset) => setSelectedAssetForReturn(asset)}
        />
      )}

      {/* EMPLOYEE SELF SERVICE DESK */}
      {activePage === 'employee-self-service' && (
        <EmployeeSelfService />
      )}

      {activePage === 'org-departments' && (
        <OrganizationView
          type="departments"
          employees={employees}
          departments={departments}
          locations={locations}
          vendors={vendors}
          assets={assets}
          globalSearch={globalSearch}
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

      {/* MASTER SETTINGS */}
      {activePage === 'settings-master' && (
        <SettingsView onRefreshMaster={loadData} />
      )}

      {/* FALLBACK FOR UNKNOWN PAGE */}
      {![
        'dashboard',
        'inventory-all',
        'inward-register',
        'procurement-all',
        'asset-add',
        'asset-assign',
        'asset-transfer',
        'asset-return',
        'asset-maintenance',
        'asset-warranty',
        'org-employees',
        'users-bulk',
        'employee-self-service',
        'org-departments',
        'org-locations',
        'org-vendors',
        'software-inventory',
        'software-licenses',
        'network-devices',
        'reports',
        'audit-logs',
        'settings-master',
      ].includes(activePage) && !isAssetListingPage && (
        <Dashboard
          stats={stats}
          assets={assets}
          employees={employees}
          globalSearch={globalSearch}
          onNavigate={(page) => setActivePage(page)}
          onViewDetails={(asset, tab = 'overview') => {
            setSelectedAssetForDetails(asset);
            setDetailsInitialTab(tab);
          }}
          onViewEmployee={(emp) => setSelectedEmployeeForProfile(emp)}
          onAssign={(asset) => setSelectedAssetForAssign(asset)}
          onTransfer={(asset) => setSelectedAssetForTransfer(asset)}
          onReturn={(asset) => setSelectedAssetForReturn(asset)}
          onMaintenanceReturn={(asset) => setSelectedAssetForMaintenanceReturn(asset)}
          onMaintenance={(asset) => setSelectedAssetForMaintenance(asset)}
          onEdit={(asset) => setSelectedAssetForEdit(asset)}
          onRetire={(asset) => setSelectedAssetForRetire(asset)}
          onDelete={(asset) => handleDeleteAsset(asset)}
        />
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
      {selectedEmployeeForProfile && (
        <EmployeeProfileModal
          employee={selectedEmployeeForProfile}
          assets={assets}
          allEmployees={employees}
          onClose={() => setSelectedEmployeeForProfile(null)}
          onViewAsset={(asset) => {
            setSelectedEmployeeForProfile(null);
            setSelectedAssetForDetails(asset);
            setDetailsInitialTab('overview');
          }}
          onSuccess={loadData}
        />
      )}

      {selectedAssetForDetails && (
        <AssetDetailsModal
          asset={selectedAssetForDetails}
          initialTab={detailsInitialTab}
          employees={employees}
          onClose={() => setSelectedAssetForDetails(null)}
          onInspectUser={(emp) => setSelectedEmployeeForProfile(emp)}
          onAssign={(asset) => setSelectedAssetForAssign(asset)}
          onTransfer={(asset) => setSelectedAssetForTransfer(asset)}
          onReturn={(asset) => setSelectedAssetForReturn(asset)}
          onMaintenance={(asset) => setSelectedAssetForMaintenance(asset)}
          onMaintenanceReturn={(asset) => setSelectedAssetForMaintenanceReturn(asset)}
          onRetire={(asset) => setSelectedAssetForRetire(asset)}
          onEdit={(asset) => setSelectedAssetForEdit(asset)}
          onDelete={(asset) => handleDeleteAsset(asset)}
          onUpdate={handleAssetUpdated}
        />
      )}

      {selectedAssetForAssign && (
        <AssetAllocationModal
          initialAsset={selectedAssetForAssign?._id ? selectedAssetForAssign : null}
          initialAssets={Array.isArray(selectedAssetForAssign) ? selectedAssetForAssign : (selectedAssetForAssign?._id ? [selectedAssetForAssign] : [])}
          employees={employees}
          assets={assets}
          departments={departments}
          locations={locations}
          onClose={() => setSelectedAssetForAssign(null)}
          onSuccess={(allocated) => {
            setSelectedAssetForAssign(null);
            handleAssetUpdated(allocated);
          }}
        />
      )}

      {selectedAssetForTransfer && (
        <TransferForm
          initialAsset={selectedAssetForTransfer}
          assets={assets}
          employees={employees}
          departments={departments}
          locations={locations}
          onClose={() => setSelectedAssetForTransfer(null)}
          onSuccess={handleAssetUpdated}
        />
      )}

      {selectedAssetForReturn && (
        <ReturnModal
          asset={selectedAssetForReturn}
          onClose={() => setSelectedAssetForReturn(null)}
          onSuccess={handleAssetUpdated}
        />
      )}

      {selectedAssetForEdit && (
        <EditAssetModal
          asset={selectedAssetForEdit}
          employees={employees}
          departments={departments}
          locations={locations}
          onClose={() => setSelectedAssetForEdit(null)}
          onSuccess={handleAssetUpdated}
        />
      )}

      {selectedAssetForMaintenance && (
        <QuickMaintenanceModal
          asset={selectedAssetForMaintenance}
          onClose={() => setSelectedAssetForMaintenance(null)}
          onSuccess={handleAssetUpdated}
        />
      )}

      {selectedAssetForMaintenanceReturn && (
        <MaintenanceReturnModal
          asset={selectedAssetForMaintenanceReturn}
          onClose={() => setSelectedAssetForMaintenanceReturn(null)}
          onSuccess={handleAssetUpdated}
        />
      )}

      {selectedAssetForRetire && (
        <RetireAssetModal
          asset={selectedAssetForRetire}
          onClose={() => setSelectedAssetForRetire(null)}
          onSuccess={handleAssetUpdated}
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
      {selectedAssetForLabel && (
        <AssetLabelModal
          isOpen={!!selectedAssetForLabel}
          asset={selectedAssetForLabel}
          onClose={() => setSelectedAssetForLabel(null)}
        />
      )}
    </>
  );
}

function AppContent() {
  const { user } = useAuth();
  if (!user) {
    return <LoginPage />;
  }
  return <ITAMApp />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
