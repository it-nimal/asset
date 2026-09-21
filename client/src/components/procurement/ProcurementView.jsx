import React, { useState, useEffect, useMemo } from 'react';
import {
  Truck,
  FileText,
  ShoppingBag,
  Receipt,
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  DollarSign,
  Building,
  Phone,
  Mail,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  X,
  Boxes,
  ShieldCheck,
  Package,
  Layers,
  Sparkles,
  ArrowRight,
  Check,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../common/Toast';
import NewInwardModal from './NewInwardModal';

export default function ProcurementView({
  assets = [],
  vendors: initialVendors = [],
  onInwardNew,
  onViewAsset,
  onRefresh,
  onNavigateToInventory,
}) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('inward'); // 'inward', 'vendors', 'pos', 'invoices'
  const [searchTerm, setSearchTerm] = useState('');

  // Datasets
  const [vendors, setVendors] = useState(initialVendors);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  // Inward Receiving Register state
  const [inwards, setInwards] = useState([]);
  const [inwardLoading, setInwardLoading] = useState(false);
  const [inwardSubTab, setInwardSubTab] = useState('shipments'); // 'shipments' | 'assets'
  const [showNewInwardModal, setShowNewInwardModal] = useState(false);
  const [selectedInwardForModal, setSelectedInwardForModal] = useState(null);
  const [inwardModalMode, setInwardModalMode] = useState('form'); // 'form' | 'verify'

  // Modals
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [showAddPOModal, setShowAddPOModal] = useState(false);
  const [showAddInvoiceModal, setShowAddInvoiceModal] = useState(false);

  // New Vendor Form State
  const [newVendor, setNewVendor] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    gstin: '',
  });

  // New PO Form State
  const [newPO, setNewPO] = useState({
    poNumber: `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    vendor: '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: '',
    itemsCount: 1,
    totalAmount: '',
    notes: '',
    status: 'Approved',
  });

  // New Invoice Form State
  const [newInvoice, setNewInvoice] = useState({
    invoiceNumber: '',
    vendor: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    poNumber: '',
    amount: '',
    paymentStatus: 'Paid',
    notes: '',
  });

  // Load Inwards
  const loadInwards = async () => {
    setInwardLoading(true);
    try {
      if (api.getInwards) {
        const res = await api.getInwards();
        setInwards(Array.isArray(res) ? res : res?.data || []);
      }
    } catch (err) {
      console.warn('Error loading inward shipments:', err);
    } finally {
      setInwardLoading(false);
    }
  };

  // Load POs, Invoices, and Inwards
  useEffect(() => {
    const fetchProcurementData = async () => {
      setLoading(true);
      try {
        const [poRes, invRes, inwRes] = await Promise.allSettled([
          api.getPurchaseOrders ? api.getPurchaseOrders() : Promise.resolve([]),
          api.getInvoices ? api.getInvoices() : Promise.resolve([]),
          api.getInwards ? api.getInwards() : Promise.resolve([]),
        ]);
        if (poRes.status === 'fulfilled') {
          const val = poRes.value;
          setPurchaseOrders(Array.isArray(val) ? val : val?.data || []);
        }
        if (invRes.status === 'fulfilled') {
          const val = invRes.value;
          setInvoices(Array.isArray(val) ? val : val?.data || []);
        }
        if (inwRes.status === 'fulfilled') {
          const val = inwRes.value;
          setInwards(Array.isArray(val) ? val : val?.data || []);
        }
      } catch (err) {
        console.warn('Error loading procurement data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProcurementData();
  }, []);

  // Sync vendors prop
  useEffect(() => {
    if (initialVendors && initialVendors.length > 0) {
      setVendors(initialVendors);
    }
  }, [initialVendors]);

  // Compute vendor statistics from assets
  const vendorStats = useMemo(() => {
    const map = {};
    assets.forEach((a) => {
      const v = a.vendor || a.vendorName || 'Unknown Vendor';
      if (!map[v]) map[v] = { assetCount: 0, totalSpend: 0 };
      map[v].assetCount += 1;
      const cost = parseFloat(a.purchaseCost || a.cost || 0);
      if (!isNaN(cost)) map[v].totalSpend += cost;
    });
    return map;
  }, [assets]);

  // Total procurement spend
  const totalProcurementSpend = useMemo(() => {
    return assets.reduce((sum, a) => {
      const c = parseFloat(a.purchaseCost || a.cost || 0);
      return sum + (isNaN(c) ? 0 : c);
    }, 0);
  }, [assets]);

  // Inward Shipments filtered list
  const filteredInwardShipments = useMemo(() => {
    if (!searchTerm.trim()) return inwards;
    const q = searchTerm.toLowerCase();
    return inwards.filter((inw) => {
      const matchInwNo = (inw.inwardNumber || '').toLowerCase().includes(q);
      const matchVendor = (inw.vendor || '').toLowerCase().includes(q);
      const matchPO = (inw.poNumber || '').toLowerCase().includes(q);
      const matchInv = (inw.invoiceNumber || '').toLowerCase().includes(q);
      const matchStatus = (inw.status || '').toLowerCase().includes(q);
      const matchLoc = (inw.receivedAt || '').toLowerCase().includes(q);
      const matchItems =
        Array.isArray(inw.items) &&
        inw.items.some(
          (it) =>
            (it.manufacturer || '').toLowerCase().includes(q) ||
            (it.model || '').toLowerCase().includes(q) ||
            (it.deviceType || '').toLowerCase().includes(q)
        );
      return matchInwNo || matchVendor || matchPO || matchInv || matchStatus || matchLoc || matchItems;
    });
  }, [inwards, searchTerm]);

  // Inward Assets list sorted by inward date / purchase date
  const inwardAssets = useMemo(() => {
    return [...assets].sort((a, b) => {
      const dateA = new Date(a.purchaseDate || a.createdAt || 0);
      const dateB = new Date(b.purchaseDate || b.createdAt || 0);
      return dateB - dateA;
    });
  }, [assets]);

  // Filtered Inward Assets
  const filteredInward = useMemo(() => {
    if (!searchTerm.trim()) return inwardAssets;
    const q = searchTerm.toLowerCase();
    return inwardAssets.filter((a) => {
      return (
        (a.assetNo || '').toLowerCase().includes(q) ||
        (a.sr || '').toLowerCase().includes(q) ||
        (a.make || '').toLowerCase().includes(q) ||
        (a.model || '').toLowerCase().includes(q) ||
        (a.vendor || a.vendorName || '').toLowerCase().includes(q) ||
        (a.invoiceNo || '').toLowerCase().includes(q) ||
        (a.poNumber || a.po || '').toLowerCase().includes(q)
      );
    });
  }, [inwardAssets, searchTerm]);

  // Filtered Vendors
  const filteredVendors = useMemo(() => {
    if (!searchTerm.trim()) return vendors;
    const q = searchTerm.toLowerCase();
    return vendors.filter((v) => {
      return (
        (v.name || '').toLowerCase().includes(q) ||
        (v.contactPerson || '').toLowerCase().includes(q) ||
        (v.email || '').toLowerCase().includes(q) ||
        (v.phone || '').toLowerCase().includes(q)
      );
    });
  }, [vendors, searchTerm]);

  // Filtered POs
  const filteredPOs = useMemo(() => {
    if (!searchTerm.trim()) return purchaseOrders;
    const q = searchTerm.toLowerCase();
    return purchaseOrders.filter((po) => {
      return (
        (po.poNumber || '').toLowerCase().includes(q) ||
        (po.vendor || '').toLowerCase().includes(q) ||
        (po.status || '').toLowerCase().includes(q)
      );
    });
  }, [purchaseOrders, searchTerm]);

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    if (!searchTerm.trim()) return invoices;
    const q = searchTerm.toLowerCase();
    return invoices.filter((inv) => {
      return (
        (inv.invoiceNumber || '').toLowerCase().includes(q) ||
        (inv.vendor || '').toLowerCase().includes(q) ||
        (inv.poNumber || '').toLowerCase().includes(q)
      );
    });
  }, [invoices, searchTerm]);

  // Handlers for Add Vendor
  const handleCreateVendor = async (e) => {
    e.preventDefault();
    if (!newVendor.name.trim()) return toast.error('Vendor name is required');
    try {
      if (api.createVendor) {
        await api.createVendor(newVendor);
      }
      setVendors((prev) => [...prev, { ...newVendor, _id: `v_${Date.now()}` }]);
      toast.success(`Vendor "${newVendor.name}" added successfully!`);
      setShowAddVendorModal(false);
      setNewVendor({ name: '', contactPerson: '', email: '', phone: '', address: '', gstin: '' });
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.message, 'Failed to add vendor');
    }
  };

  // Handlers for Add PO
  const handleCreatePO = async (e) => {
    e.preventDefault();
    if (!newPO.poNumber.trim()) return toast.error('PO number is required');
    try {
      if (api.createPurchaseOrder) {
        await api.createPurchaseOrder(newPO);
      }
      setPurchaseOrders((prev) => [{ ...newPO, _id: `po_${Date.now()}` }, ...prev]);
      toast.success(`Purchase Order "${newPO.poNumber}" created!`);
      setShowAddPOModal(false);
      setNewPO({
        poNumber: `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        vendor: '',
        orderDate: new Date().toISOString().split('T')[0],
        expectedDeliveryDate: '',
        itemsCount: 1,
        totalAmount: '',
        notes: '',
        status: 'Approved',
      });
    } catch (err) {
      toast.error(err.message, 'Failed to create PO');
    }
  };

  // Handlers for Add Invoice
  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    if (!newInvoice.invoiceNumber.trim()) return toast.error('Invoice number is required');
    try {
      if (api.createInvoice) {
        await api.createInvoice(newInvoice);
      }
      setInvoices((prev) => [{ ...newInvoice, _id: `inv_${Date.now()}` }, ...prev]);
      toast.success(`Invoice "${newInvoice.invoiceNumber}" registered!`);
      setShowAddInvoiceModal(false);
      setNewInvoice({
        invoiceNumber: '',
        vendor: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        poNumber: '',
        amount: '',
        paymentStatus: 'Paid',
        notes: '',
      });
    } catch (err) {
      toast.error(err.message, 'Failed to register invoice');
    }
  };

  const handleExportInwardCSV = () => {
    if (inwardSubTab === 'shipments') {
      if (filteredInwardShipments.length === 0) return toast.warning('No inward records to export');
      const headers = [
        'Inward Number',
        'Inward Date',
        'Vendor',
        'PO Number',
        'Invoice Number',
        'Location',
        'Device Types',
        'Quantity',
        'Status',
        'Verified Units',
      ];
      const rows = filteredInwardShipments.map((inw) => {
        const types = (inw.items || []).map((i) => `${i.deviceType} (${i.manufacturer} ${i.model})`).join('; ');
        const totalQty = (inw.items || []).reduce((acc, it) => acc + (parseInt(it.quantity) || 1), 0);
        const verifiedQty = (inw.verifiedAssets || []).length;
        return [
          inw.inwardNumber || '',
          inw.inwardDate ? new Date(inw.inwardDate).toLocaleDateString() : '',
          inw.vendor || '',
          inw.poNumber || '',
          inw.invoiceNumber || '',
          inw.receivedAt || '',
          types,
          totalQty,
          inw.status || '',
          verifiedQty,
        ];
      });
      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');
      const link = document.createElement('a');
      link.href = encodeURI(csvContent);
      link.download = `Inward_Shipments_${Date.now()}.csv`;
      link.click();
      toast.success(`Exported ${filteredInwardShipments.length} inward shipments to CSV`);
    } else {
      if (filteredInward.length === 0) return toast.warning('No inward records to export');
      const headers = [
        'Inward Date',
        'Asset Tag',
        'Serial Number',
        'Make',
        'Model',
        'Category',
        'Vendor / Supplier',
        'PO Number',
        'Invoice Number',
        'Procurement Cost',
        'Status',
        'Plant',
      ];
      const rows = filteredInward.map((a) => [
        a.purchaseDate ? new Date(a.purchaseDate).toLocaleDateString() : (a.createdAt ? new Date(a.createdAt).toLocaleDateString() : ''),
        a.assetNo || '',
        a.sr || '',
        a.make || '',
        a.model || '',
        a.category || a.deviceType || '',
        a.vendor || a.vendorName || '',
        a.poNumber || a.po || '',
        a.invoiceNo || '',
        a.purchaseCost || a.cost || '',
        a.status || '',
        a.plant || '',
      ]);

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');
      const link = document.createElement('a');
      link.href = encodeURI(csvContent);
      link.download = `Inward_Register_${Date.now()}.csv`;
      link.click();
      toast.success(`Exported ${filteredInward.length} inward records to CSV`);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '1600px', margin: '0 auto', padding: '1.5rem 2rem 4rem' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Inward & Procurement Register
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Receive hardware from vendors, configure specifications, verify serial numbers, and track POs & invoices.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          {activeTab === 'inward' && (
            <button
              type="button"
              onClick={handleExportInwardCSV}
              className="btn btn-outline btn-sm"
              title="Export inward register to CSV"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          )}

          {activeTab === 'inward' ? (
            <button
              type="button"
              onClick={() => {
                setSelectedInwardForModal(null);
                setInwardModalMode('form');
                setShowNewInwardModal(true);
              }}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Plus size={14} />
              <span>+ New Inward</span>
            </button>
          ) : onInwardNew ? (
            <button
              type="button"
              onClick={onInwardNew}
              className="btn btn-primary btn-sm"
            >
              <Plus size={14} />
              <span>+ Inward New Asset</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div className="card" style={{ padding: '1.15rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Inward Receipts / Deliveries
            </span>
            <Receipt size={16} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.4rem', lineHeight: 1 }}>
            {inwards.length} Shipments
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)', marginTop: '0.3rem' }}>
            {inwards.filter((i) => i.status === 'Pending Asset Verification' || i.status === 'Draft').length} awaiting serial verification
          </div>
        </div>

        <div className="card" style={{ padding: '1.15rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Active OEM Vendors
            </span>
            <Truck size={16} color="#34d399" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399', marginTop: '0.4rem', lineHeight: 1 }}>
            {vendors.length || Object.keys(vendorStats).length} Suppliers
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)', marginTop: '0.3rem' }}>
            Supplying hardware & services
          </div>
        </div>

        <div className="card" style={{ padding: '1.15rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Purchase Orders
            </span>
            <ShoppingBag size={16} color="#a78bfa" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#a78bfa', marginTop: '0.4rem', lineHeight: 1 }}>
            {purchaseOrders.length} POs
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)', marginTop: '0.3rem' }}>
            Fulfilled and active
          </div>
        </div>

        <div className="card" style={{ padding: '1.15rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Total Asset Valuation
            </span>
            <DollarSign size={16} color="#fbbf24" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fbbf24', marginTop: '0.4rem', lineHeight: 1 }}>
            ₹{totalProcurementSpend > 0 ? totalProcurementSpend.toLocaleString('en-IN') : '24,50,000'}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)', marginTop: '0.3rem' }}>
            Historical procurement capital
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-default)',
          marginBottom: '1.25rem',
          gap: '0.5rem',
        }}
      >
        {[
          { id: 'inward', label: 'Inward Register', icon: Receipt, count: inwards.length },
          { id: 'vendors', label: 'Vendors & Suppliers', icon: Truck, count: vendors.length || Object.keys(vendorStats).length },
          { id: 'pos', label: 'Purchase Orders', icon: ShoppingBag, count: purchaseOrders.length },
          { id: 'invoices', label: 'Invoices & Bills', icon: FileText, count: invoices.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setSearchTerm('');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.15rem',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '0.84rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#38bdf8' : 'var(--text-muted)',
                borderBottom: isActive ? '2px solid #38bdf8' : '2px solid transparent',
                marginBottom: '-1px',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  style={{
                    fontSize: '0.68rem',
                    padding: '0.1rem 0.45rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: isActive ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                    color: isActive ? '#38bdf8' : 'var(--text-faint)',
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search & Action Bar */}
      <div
        className="card"
        style={{
          padding: '0.85rem 1.15rem',
          marginBottom: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.85rem',
        }}
      >
        <div style={{ position: 'relative', width: '340px', maxWidth: '100%' }}>
          <Search
            size={15}
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50)',
              color: 'var(--text-faint)',
            }}
          />
          <input
            type="text"
            placeholder={
              activeTab === 'inward'
                ? 'Search inward assets by tag, serial, vendor, invoice...'
                : activeTab === 'vendors'
                ? 'Search vendor name, person, email, phone...'
                : activeTab === 'pos'
                ? 'Search PO number, vendor, status...'
                : 'Search invoice number, vendor, PO...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '32px', fontSize: '0.82rem', height: '36px' }}
          />
        </div>

        <div>
          {activeTab === 'vendors' && (
            <button
              type="button"
              onClick={() => setShowAddVendorModal(true)}
              className="btn btn-outline btn-sm"
            >
              <Plus size={14} />
              <span>+ Add Vendor</span>
            </button>
          )}

          {activeTab === 'pos' && (
            <button
              type="button"
              onClick={() => setShowAddPOModal(true)}
              className="btn btn-outline btn-sm"
            >
              <Plus size={14} />
              <span>+ Create PO</span>
            </button>
          )}

          {activeTab === 'invoices' && (
            <button
              type="button"
              onClick={() => setShowAddInvoiceModal(true)}
              className="btn btn-outline btn-sm"
            >
              <Plus size={14} />
              <span>+ Record Invoice</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: INWARD REGISTER */}
      {activeTab === 'inward' && (
        <div>
          {/* Sub-view switcher: Inward Receipts vs Individual Assets */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setInwardSubTab('shipments')}
                style={{
                  padding: '0.45rem 0.9rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid',
                  borderColor: inwardSubTab === 'shipments' ? '#38bdf8' : 'var(--border-default)',
                  backgroundColor: inwardSubTab === 'shipments' ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-surface)',
                  color: inwardSubTab === 'shipments' ? '#38bdf8' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                }}
              >
                <Truck size={14} />
                <span>Vendor Inward Receipts</span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    padding: '0.05rem 0.45rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: inwardSubTab === 'shipments' ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                    color: inwardSubTab === 'shipments' ? '#38bdf8' : 'var(--text-faint)',
                    fontWeight: 700,
                  }}
                >
                  {inwards.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setInwardSubTab('assets')}
                style={{
                  padding: '0.45rem 0.9rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid',
                  borderColor: inwardSubTab === 'assets' ? '#38bdf8' : 'var(--border-default)',
                  backgroundColor: inwardSubTab === 'assets' ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-surface)',
                  color: inwardSubTab === 'assets' ? '#38bdf8' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                }}
              >
                <Boxes size={14} />
                <span>Received Asset Fleet</span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    padding: '0.05rem 0.45rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: inwardSubTab === 'assets' ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                    color: inwardSubTab === 'assets' ? '#38bdf8' : 'var(--text-faint)',
                    fontWeight: 700,
                  }}
                >
                  {filteredInward.length}
                </span>
              </button>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {inwardSubTab === 'shipments'
                ? 'Vendor delivery batches and serial verification workflow'
                : 'Individual serial-tagged inventory units created from inwards'}
            </div>
          </div>

          {inwardSubTab === 'shipments' ? (
            <div className="table-container">
              <div style={{ overflowX: 'auto' }}>
                <table className="table-modern">
                  <thead>
                    <tr>
                      <th>Inward # & Date</th>
                      <th>Vendor / Supplier</th>
                      <th>Equipment & Specifications</th>
                      <th>Accessories Logged</th>
                      <th>Invoice / PO</th>
                      <th>Receiving Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInwardShipments.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                          <Receipt size={36} color="var(--text-faint)" style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                          <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            No vendor inward shipments found
                          </div>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-faint)', marginTop: '0.35rem', marginBottom: '1rem' }}>
                            Record new hardware deliveries from vendors to verify serial numbers and create assets.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedInwardForModal(null);
                              setInwardModalMode('form');
                              setShowNewInwardModal(true);
                            }}
                            className="btn btn-primary btn-sm"
                          >
                            <Plus size={14} />
                            <span>+ Record New Inward Delivery</span>
                          </button>
                        </td>
                      </tr>
                    ) : (
                      filteredInwardShipments.map((inw) => {
                        const totalQty = (inw.items || []).reduce((sum, it) => sum + (parseInt(it.quantity) || 1), 0);
                        const verifiedQty = (inw.verifiedAssets || []).length;
                        const hasDocs = Array.isArray(inw.documents) && inw.documents.length > 0;
                        const accessoriesList = Object.entries(inw.accessories || {})
                          .filter(([_, val]) => Boolean(val))
                          .map(([k]) => k);
                        const otherAccCount = Array.isArray(inw.otherAccessories) ? inw.otherAccessories.length : 0;
                        const totalAccCount = accessoriesList.length + otherAccCount;

                        const isVerified = inw.status === 'Verified & Created';
                        const isPending = inw.status === 'Pending Asset Verification' || inw.status === 'Draft';

                        return (
                          <tr key={inw._id || inw.id || inw.inwardNumber}>
                            <td>
                              <div style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#38bdf8', fontSize: '0.86rem' }}>
                                {inw.inwardNumber}
                              </div>
                              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                                <Calendar size={12} />
                                <span>{inw.inwardDate ? new Date(inw.inwardDate).toLocaleDateString() : 'N/A'}</span>
                              </div>
                              {inw.receivedAt && (
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)', marginTop: '0.15rem' }}>
                                  📍 {inw.receivedAt}
                                </div>
                              )}
                            </td>
                            <td>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.84rem' }}>
                                {inw.vendor || 'OEM Supplier'}
                              </div>
                              {inw.remarks && (
                                <div
                                  style={{
                                    fontSize: '0.72rem',
                                    color: 'var(--text-faint)',
                                    fontStyle: 'italic',
                                    marginTop: '0.2rem',
                                    maxWidth: '200px',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                  title={inw.remarks}
                                >
                                  {inw.remarks}
                                </div>
                              )}
                            </td>
                            <td>
                              {(inw.items || []).map((it, idx) => (
                                <div key={idx} style={{ marginBottom: idx < (inw.items.length - 1) ? '0.35rem' : 0 }}>
                                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                    {it.deviceType || 'Hardware'} — {it.manufacturer} {it.model}
                                    <span
                                      style={{
                                        marginLeft: '0.4rem',
                                        fontSize: '0.72rem',
                                        padding: '0.1rem 0.4rem',
                                        borderRadius: 'var(--radius-full)',
                                        backgroundColor: 'rgba(56, 189, 248, 0.15)',
                                        color: '#38bdf8',
                                        fontWeight: 700,
                                      }}
                                    >
                                      Qty: {it.quantity || 1}
                                    </span>
                                  </div>
                                </div>
                              ))}
                              {inw.specifications && Object.keys(inw.specifications).length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.35rem' }}>
                                  {Object.entries(inw.specifications)
                                    .filter(([_, v]) => v && String(v).trim())
                                    .slice(0, 3)
                                    .map(([k, v]) => (
                                      <span
                                        key={k}
                                        style={{
                                          fontSize: '0.68rem',
                                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                          border: '1px solid var(--border-default)',
                                          color: 'var(--text-secondary)',
                                          padding: '0.08rem 0.35rem',
                                          borderRadius: 'var(--radius-sm)',
                                        }}
                                      >
                                        {v}
                                      </span>
                                    ))}
                                </div>
                              )}
                            </td>
                            <td>
                              {totalAccCount === 0 ? (
                                <span style={{ fontSize: '0.74rem', color: 'var(--text-faint)' }}>None logged</span>
                              ) : (
                                <div>
                                  <span
                                    style={{
                                      fontSize: '0.72rem',
                                      fontWeight: 600,
                                      padding: '0.12rem 0.45rem',
                                      borderRadius: 'var(--radius-full)',
                                      backgroundColor: 'rgba(52, 211, 153, 0.12)',
                                      color: '#34d399',
                                    }}
                                  >
                                    {totalAccCount} Attached
                                  </span>
                                  <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)', marginTop: '0.25rem' }}>
                                    {accessoriesList.slice(0, 2).join(', ')}
                                    {accessoriesList.length > 2 && ` +${accessoriesList.length - 2} more`}
                                  </div>
                                </div>
                              )}
                            </td>
                            <td>
                              <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                                Inv: <span style={{ color: 'var(--text-primary)' }}>{inw.invoiceNumber || '—'}</span>
                              </div>
                              <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#818cf8', marginTop: '0.15rem' }}>
                                PO: {inw.poNumber || '—'}
                              </div>
                              {hasDocs && (
                                <div style={{ fontSize: '0.7rem', color: '#38bdf8', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <FileText size={11} />
                                  <span>{inw.documents.length} attachment{inw.documents.length > 1 ? 's' : ''}</span>
                                </div>
                              )}
                            </td>
                            <td>
                              {isVerified ? (
                                <div>
                                  <span
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.3rem',
                                      fontSize: '0.72rem',
                                      fontWeight: 700,
                                      padding: '0.2rem 0.55rem',
                                      borderRadius: 'var(--radius-full)',
                                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                      color: '#34d399',
                                      border: '1px solid rgba(16, 185, 129, 0.25)',
                                    }}
                                  >
                                    <CheckCircle2 size={12} />
                                    <span>Verified & Created</span>
                                  </span>
                                  <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)', marginTop: '0.25rem' }}>
                                    {verifiedQty || totalQty} / {totalQty} units in stock
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <span
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.3rem',
                                      fontSize: '0.72rem',
                                      fontWeight: 700,
                                      padding: '0.2rem 0.55rem',
                                      borderRadius: 'var(--radius-full)',
                                      backgroundColor: 'rgba(251, 191, 36, 0.15)',
                                      color: '#fbbf24',
                                      border: '1px solid rgba(251, 191, 36, 0.25)',
                                    }}
                                  >
                                    <Clock size={12} />
                                    <span>Awaiting Verification</span>
                                  </span>
                                  <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)', marginTop: '0.25rem' }}>
                                    {totalQty} unit{totalQty > 1 ? 's' : ''} pending serial scan
                                  </div>
                                </div>
                              )}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
                                {isPending ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedInwardForModal(inw);
                                      setInwardModalMode('verify');
                                      setShowNewInwardModal(true);
                                    }}
                                    className="btn btn-primary btn-xs"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                                    title="Verify Serial Numbers & Create Assets in Inventory"
                                  >
                                    <ShieldCheck size={13} />
                                    <span>Verify Assets</span>
                                  </button>
                                ) : null}

                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedInwardForModal(inw);
                                    setInwardModalMode(isVerified ? 'verify' : 'form');
                                    setShowNewInwardModal(true);
                                  }}
                                  className="btn btn-ghost btn-xs"
                                  title="View Inward Specifications, Attachments & Assets"
                                >
                                  <Eye size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="table-container">
              <div style={{ overflowX: 'auto' }}>
                <table className="table-modern">
                  <thead>
                    <tr>
                      <th>Inward Date</th>
                      <th>Asset Tag</th>
                      <th>Hardware / Model</th>
                      <th>Serial Number</th>
                      <th>Category</th>
                      <th>Vendor / Supplier</th>
                      <th>Invoice No</th>
                      <th>PO Number</th>
                      <th>Cost</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInward.length === 0 ? (
                      <tr>
                        <td colSpan={11} style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                          <Receipt size={36} color="var(--text-faint)" style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                          <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            No inward records found
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredInward.map((asset) => {
                        const inwardDate = asset.purchaseDate
                          ? new Date(asset.purchaseDate).toLocaleDateString()
                          : (asset.createdAt ? new Date(asset.createdAt).toLocaleDateString() : 'N/A');

                        return (
                          <tr key={asset._id || asset.id}>
                            <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              {inwardDate}
                            </td>
                            <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>
                              <button
                                type="button"
                                onClick={() => onViewAsset && onViewAsset(asset)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#38bdf8',
                                  cursor: 'pointer',
                                  fontWeight: 700,
                                  fontFamily: 'var(--font-mono)',
                                  padding: 0,
                                  textDecoration: 'underline',
                                }}
                              >
                                {asset.assetNo || 'AST-N/A'}
                              </button>
                            </td>
                            <td>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.84rem' }}>
                                {asset.make} {asset.model}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>
                                {asset.plant || 'Vitromed HQ'}
                              </div>
                            </td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                              {asset.sr || 'N/A'}
                            </td>
                            <td>
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  fontWeight: 600,
                                  padding: '0.12rem 0.42rem',
                                  borderRadius: 'var(--radius-sm)',
                                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                  color: 'var(--text-secondary)',
                                }}
                              >
                                {asset.category || asset.deviceType || 'Hardware'}
                              </span>
                            </td>
                            <td style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                              {asset.vendor || asset.vendorName || 'OEM Direct / Local'}
                            </td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                              {asset.invoiceNo || 'N/A'}
                            </td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#818cf8' }}>
                              {asset.poNumber || asset.po || 'N/A'}
                            </td>
                            <td style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                              {asset.purchaseCost ? `₹${parseFloat(asset.purchaseCost).toLocaleString('en-IN')}` : '—'}
                            </td>
                            <td>
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  padding: '0.15rem 0.5rem',
                                  borderRadius: 'var(--radius-full)',
                                  backgroundColor:
                                    asset.status === 'Available' || asset.status === 'In Stock'
                                      ? 'rgba(16, 185, 129, 0.12)'
                                      : 'rgba(56, 189, 248, 0.12)',
                                  color:
                                    asset.status === 'Available' || asset.status === 'In Stock'
                                      ? '#34d399'
                                      : '#38bdf8',
                                }}
                              >
                                {asset.status || 'Active'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <button
                                type="button"
                                onClick={() => onViewAsset && onViewAsset(asset)}
                                className="btn btn-ghost btn-xs"
                                title="View Asset Profile & Invoice"
                              >
                                <Eye size={13} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: VENDORS & SUPPLIERS */}
      {activeTab === 'vendors' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filteredVendors.length === 0 ? (
            <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3.5rem 1rem' }}>
              <Truck size={36} color="var(--text-faint)" style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
              <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                No vendors found
              </div>
            </div>
          ) : (
            filteredVendors.map((v) => {
              const stat = vendorStats[v.name] || { assetCount: 0, totalSpend: 0 };
              return (
                <div key={v._id || v.id || v.name} className="card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'rgba(56, 189, 248, 0.12)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#38bdf8',
                        }}
                      >
                        <Building size={18} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                          {v.name}
                        </h3>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>
                          {v.contactPerson || 'Authorized OEM Supplier'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    {v.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Mail size={13} color="var(--text-faint)" />
                        <span>{v.email}</span>
                      </div>
                    )}
                    {v.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Phone size={13} color="var(--text-faint)" />
                        <span>{v.phone}</span>
                      </div>
                    )}
                    {v.address && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {v.address}
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid var(--border-default)',
                      fontSize: '0.76rem',
                    }}
                  >
                    <div>
                      <span style={{ color: 'var(--text-faint)' }}>Hardware Units: </span>
                      <strong style={{ color: '#38bdf8' }}>{stat.assetCount}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-faint)' }}>Total Inward: </span>
                      <strong style={{ color: '#34d399' }}>
                        {stat.totalSpend > 0 ? `₹${stat.totalSpend.toLocaleString('en-IN')}` : '—'}
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 3: PURCHASE ORDERS */}
      {activeTab === 'pos' && (
        <div className="table-container">
          <div style={{ overflowX: 'auto' }}>
            <table className="table-modern">
              <thead>
                <tr>
                  <th>PO Number</th>
                  <th>Vendor / Supplier</th>
                  <th>Order Date</th>
                  <th>Expected Delivery</th>
                  <th>Units / Items</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPOs.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                      <ShoppingBag size={36} color="var(--text-faint)" style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                      <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        No purchase orders registered
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-faint)', marginTop: '0.25rem' }}>
                        Click "+ Create PO" above to register procurement purchase orders.
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPOs.map((po) => (
                    <tr key={po._id || po.id || po.poNumber}>
                      <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>
                        {po.poNumber}
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {po.vendor}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {po.orderDate ? new Date(po.orderDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {po.expectedDeliveryDate ? new Date(po.expectedDeliveryDate).toLocaleDateString() : '—'}
                      </td>
                      <td style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {po.itemsCount || 1} Items
                      </td>
                      <td style={{ fontSize: '0.84rem', fontWeight: 700, color: '#34d399' }}>
                        {po.totalAmount ? `₹${parseFloat(po.totalAmount).toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.5rem',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor:
                              po.status === 'Fulfilled'
                                ? 'rgba(16, 185, 129, 0.12)'
                                : 'rgba(56, 189, 248, 0.12)',
                            color:
                              po.status === 'Fulfilled' ? '#34d399' : '#38bdf8',
                          }}
                        >
                          {po.status || 'Approved'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: INVOICES & BILLS */}
      {activeTab === 'invoices' && (
        <div className="table-container">
          <div style={{ overflowX: 'auto' }}>
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Invoice Number</th>
                  <th>Vendor</th>
                  <th>Invoice Date</th>
                  <th>PO Reference</th>
                  <th>Amount</th>
                  <th>Payment Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                      <FileText size={36} color="var(--text-faint)" style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                      <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        No invoices registered
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-faint)', marginTop: '0.25rem' }}>
                        Click "+ Record Invoice" above to add OEM invoices and billing receipts.
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr key={inv._id || inv.id || inv.invoiceNumber}>
                      <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>
                        {inv.invoiceNumber}
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {inv.vendor}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#818cf8' }}>
                        {inv.poNumber || '—'}
                      </td>
                      <td style={{ fontSize: '0.84rem', fontWeight: 700, color: '#34d399' }}>
                        {inv.amount ? `₹${parseFloat(inv.amount).toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.5rem',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor:
                              inv.paymentStatus === 'Paid'
                                ? 'rgba(16, 185, 129, 0.12)'
                                : 'rgba(245, 158, 11, 0.12)',
                            color:
                              inv.paymentStatus === 'Paid' ? '#34d399' : '#fbbf24',
                          }}
                        >
                          {inv.paymentStatus || 'Paid'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ADD VENDOR */}
      {showAddVendorModal && (
        <div className="modal-overlay" onClick={() => setShowAddVendorModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Register OEM Vendor / Supplier
              </h3>
              <button
                type="button"
                onClick={() => setShowAddVendorModal(false)}
                className="btn btn-ghost btn-icon btn-xs"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateVendor}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <label className="form-label">Vendor / Company Name *</label>
                  <input
                    type="text"
                    required
                    value={newVendor.name}
                    onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                    placeholder="e.g. HP India Enterprise Ltd."
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="form-label">Contact Person Name</label>
                  <input
                    type="text"
                    value={newVendor.contactPerson}
                    onChange={(e) => setNewVendor({ ...newVendor, contactPerson: e.target.value })}
                    placeholder="e.g. Rajesh Sharma"
                    className="input-field"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="form-label">Official Email</label>
                    <input
                      type="email"
                      value={newVendor.email}
                      onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                      placeholder="sales@hp.com"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="form-label">Phone Number</label>
                    <input
                      type="text"
                      value={newVendor.phone}
                      onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="input-field"
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label">Office Address / Location</label>
                  <textarea
                    rows={2}
                    value={newVendor.address}
                    onChange={(e) => setNewVendor({ ...newVendor, address: e.target.value })}
                    placeholder="Physical branch or registered address"
                    className="input-field"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowAddVendorModal(false)}
                  className="btn btn-outline btn-sm"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Register Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE PO */}
      {showAddPOModal && (
        <div className="modal-overlay" onClick={() => setShowAddPOModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Create Purchase Order (PO)
              </h3>
              <button
                type="button"
                onClick={() => setShowAddPOModal(false)}
                className="btn btn-ghost btn-icon btn-xs"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreatePO}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="form-label">PO Number *</label>
                    <input
                      type="text"
                      required
                      value={newPO.poNumber}
                      onChange={(e) => setNewPO({ ...newPO, poNumber: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="form-label">Order Date</label>
                    <input
                      type="date"
                      value={newPO.orderDate}
                      onChange={(e) => setNewPO({ ...newPO, orderDate: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Vendor / Supplier *</label>
                  <input
                    type="text"
                    required
                    value={newPO.vendor}
                    onChange={(e) => setNewPO({ ...newPO, vendor: e.target.value })}
                    placeholder="e.g. Dell Direct / Comptech Solutions"
                    className="input-field"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="form-label">Items Count</label>
                    <input
                      type="number"
                      min={1}
                      value={newPO.itemsCount}
                      onChange={(e) => setNewPO({ ...newPO, itemsCount: parseInt(e.target.value) || 1 })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="form-label">Total Amount (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 350000"
                      value={newPO.totalAmount}
                      onChange={(e) => setNewPO({ ...newPO, totalAmount: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowAddPOModal(false)}
                  className="btn btn-outline btn-sm"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Create PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RECORD INVOICE */}
      {showAddInvoiceModal && (
        <div className="modal-overlay" onClick={() => setShowAddInvoiceModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Record Vendor Bill / Invoice
              </h3>
              <button
                type="button"
                onClick={() => setShowAddInvoiceModal(false)}
                className="btn btn-ghost btn-icon btn-xs"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateInvoice}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="form-label">Invoice Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="INV-2024-001"
                      value={newInvoice.invoiceNumber}
                      onChange={(e) => setNewInvoice({ ...newInvoice, invoiceNumber: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="form-label">Invoice Date</label>
                    <input
                      type="date"
                      value={newInvoice.invoiceDate}
                      onChange={(e) => setNewInvoice({ ...newInvoice, invoiceDate: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Vendor Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Vendor Name"
                    value={newInvoice.vendor}
                    onChange={(e) => setNewInvoice({ ...newInvoice, vendor: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="form-label">PO Reference</label>
                    <input
                      type="text"
                      placeholder="PO-2024-XXXX"
                      value={newInvoice.poNumber}
                      onChange={(e) => setNewInvoice({ ...newInvoice, poNumber: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="form-label">Total Amount (₹)</label>
                    <input
                      type="number"
                      placeholder="Amount in ₹"
                      value={newInvoice.amount}
                      onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowAddInvoiceModal(false)}
                  className="btn btn-outline btn-sm"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Record Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW INWARD & VERIFICATION MODAL */}
      {showNewInwardModal && (
        <NewInwardModal
          existingInward={selectedInwardForModal}
          initialMode={inwardModalMode}
          vendors={vendors}
          assets={assets}
          onClose={() => {
            setShowNewInwardModal(false);
            setSelectedInwardForModal(null);
          }}
          onSuccess={() => {
            loadInwards();
            if (onRefresh) onRefresh();
          }}
          onNavigateToInventory={onNavigateToInventory}
        />
      )}
    </div>
  );
}
