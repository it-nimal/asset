import React, { useState, useEffect, useRef } from 'react';
import { X, Printer, QrCode, Tag, Check, Copy, Download } from 'lucide-react';
import QRCode from 'qrcode';
import logo from '../photos/VitromedLogo.png';

export default function AssetLabelModal({ asset, onClose }) {
  const [labelSize, setLabelSize] = useState('standard'); // 'standard' | 'wide' | 'mini'
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const printAreaRef = useRef(null);

  const assetTag = asset?.assetNo || asset?.assetTag || 'NO-TAG';
  const serialNo = asset?.sr || asset?.serialNumber || 'N/A';
  const modelName = [asset?.make, asset?.model].filter(Boolean).join(' ') || asset?.model || asset?.assetName || asset?.deviceType || asset?.category || 'Hardware Asset';
  const department = asset?.department || asset?.dept || (asset?.currentAssignment && asset?.currentAssignment.department) || '';
  const custodian = asset?.userName || (asset?.currentAssignment && asset?.currentAssignment.employeeName) || '';

  useEffect(() => {
    if (!asset) return;

    // Encode standardized payload in QR Code
    const payload = JSON.stringify({
      tag: assetTag,
      sn: serialNo,
      category: asset.deviceCategory || asset.category || 'Asset',
      model: modelName,
      dept: department,
      custodian: custodian !== 'Unassigned' ? custodian : undefined,
      org: 'Vitromed Healthcare'
    });

    QRCode.toDataURL(payload, {
      width: 256,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR Generation failed:', err));
  }, [asset, assetTag, serialNo, modelName, department, custodian]);

  if (!asset) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyTag = () => {
    navigator.clipboard.writeText(assetTag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QR_${assetTag.replace(/[^a-zA-Z0-9_-]/g, '_')}.png`;
    a.click();
  };

  return (
    <div className="modal-overlay asset-label-modal-overlay print-modal-overlay" onClick={onClose}>
      <style>{`
        @media print {
          @page {
            size: auto;
            margin: 0;
          }

          body, html, #root {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* Hide all application chrome and screen elements */
          .app-main-layout,
          .no-print,
          .sidebar,
          .app-header,
          .toast-container,
          .modal-header,
          .label-controls-bar,
          .print-instructions-tip,
          .modal-footer,
          .modal-close-btn {
            display: none !important;
          }

          .modal-overlay.asset-label-modal-overlay {
            position: static !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
            inset: auto !important;
            width: 100% !important;
            height: auto !important;
          }

          .modal-dialog.print-modal-dialog,
          .modal-body.print-modal-body,
          .sticker-preview-wrapper {
            padding: 0 !important;
            margin: 0 !important;
            background: transparent !important;
            box-shadow: none !important;
            border: none !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 100% !important;
          }

          .asset-physical-sticker {
            box-shadow: none !important;
            border: 2px solid #000000 !important;
            margin: 0 auto !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      <div
        className="modal-dialog print-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '560px',
          width: '95vw',
          backgroundColor: 'var(--bg-surface, #ffffff)',
          borderRadius: '12px',
          border: '1px solid var(--border-default, #cbd5e1)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Modal Header */}
        <div
          className="modal-header no-print"
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--border-default, #e2e8f0)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--bg-surface-raised, #f8fafc)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(2, 132, 199, 0.12)',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <QrCode size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Print Asset Tag & QR Sticker
              </h2>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: 0 }}>
                Label for {assetTag} • {modelName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-icon btn-xs"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body print-modal-body" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Controls Bar */}
          <div
            className="label-controls-bar no-print"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem',
              backgroundColor: 'var(--bg-surface-raised, #f8fafc)',
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle, #e2e8f0)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Size:
              </span>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button
                  type="button"
                  style={{
                    padding: '0.25rem 0.6rem',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    borderRadius: '4px',
                    border: labelSize === 'standard' ? '1px solid #0284c7' : '1px solid var(--border-default)',
                    backgroundColor: labelSize === 'standard' ? '#0284c7' : 'var(--bg-surface)',
                    color: labelSize === 'standard' ? '#ffffff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                  onClick={() => setLabelSize('standard')}
                >
                  Standard (2" × 1")
                </button>
                <button
                  type="button"
                  style={{
                    padding: '0.25rem 0.6rem',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    borderRadius: '4px',
                    border: labelSize === 'wide' ? '1px solid #0284c7' : '1px solid var(--border-default)',
                    backgroundColor: labelSize === 'wide' ? '#0284c7' : 'var(--bg-surface)',
                    color: labelSize === 'wide' ? '#ffffff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                  onClick={() => setLabelSize('wide')}
                >
                  Wide Tag (3" × 2")
                </button>
                <button
                  type="button"
                  style={{
                    padding: '0.25rem 0.6rem',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    borderRadius: '4px',
                    border: labelSize === 'mini' ? '1px solid #0284c7' : '1px solid var(--border-default)',
                    backgroundColor: labelSize === 'mini' ? '#0284c7' : 'var(--bg-surface)',
                    color: labelSize === 'mini' ? '#ffffff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                  onClick={() => setLabelSize('mini')}
                >
                  Mini (1.5" × 0.8")
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <button
                type="button"
                onClick={handleCopyTag}
                className="btn btn-outline btn-xs"
                title="Copy Asset Tag to Clipboard"
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                {copied ? <Check size={13} style={{ color: '#10b981' }} /> : <Copy size={13} />}
                <span>{copied ? 'Copied' : 'Copy Tag'}</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadQR}
                className="btn btn-outline btn-xs"
                title="Download PNG QR Code"
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Download size={13} />
                <span>QR PNG</span>
              </button>
            </div>
          </div>

          {/* Sticker Live Preview Box */}
          <div
            className="sticker-preview-wrapper"
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '1.25rem',
              backgroundColor: '#f1f5f9',
              borderRadius: '8px',
              border: '1px dashed #cbd5e1',
            }}
          >
            <div
              ref={printAreaRef}
              id="printable-asset-tag"
              className={`asset-physical-sticker label-size-${labelSize}`}
              style={{
                width: labelSize === 'wide' ? '340px' : labelSize === 'mini' ? '230px' : '285px',
                minHeight: labelSize === 'wide' ? '190px' : labelSize === 'mini' ? '105px' : '135px',
                backgroundColor: '#ffffff',
                border: '1.5px solid #0f172a',
                borderRadius: '6px',
                padding: labelSize === 'mini' ? '4px 6px' : '8px 10px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxSizing: 'border-box',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                color: '#0f172a',
              }}
            >
              {/* Header inside sticker */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #0f172a',
                  paddingBottom: '3px',
                  marginBottom: '4px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <img src={logo} alt="Vitromed" style={{ height: labelSize === 'mini' ? '14px' : '18px', width: 'auto', objectFit: 'contain' }} />
                  <span style={{ fontSize: labelSize === 'mini' ? '0.58rem' : '0.68rem', fontWeight: 900, letterSpacing: '0.02em', color: '#0f172a' }}>
                    VITROMED HEALTHCARE
                  </span>
                </div>
                <span style={{ fontSize: '0.52rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase' }}>
                  IT ASSET
                </span>
              </div>

              {/* Body */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', flex: 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: labelSize === 'wide' ? '1.05rem' : labelSize === 'mini' ? '0.78rem' : '0.92rem',
                      fontWeight: 900,
                      fontFamily: 'monospace',
                      color: '#0284c7',
                      letterSpacing: '-0.02em',
                      lineHeight: 1.1,
                    }}
                  >
                    {assetTag}
                  </div>

                  <div style={{ fontSize: labelSize === 'mini' ? '0.55rem' : '0.64rem', color: '#334155', display: 'flex', gap: '3px' }}>
                    <strong>S/N:</strong>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{serialNo}</span>
                  </div>

                  <div style={{ fontSize: labelSize === 'mini' ? '0.55rem' : '0.64rem', color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <strong>Model:</strong> {modelName}
                  </div>

                  {department && (
                    <div style={{ fontSize: labelSize === 'mini' ? '0.55rem' : '0.62rem', color: '#64748b' }}>
                      <strong>Dept:</strong> {department}
                    </div>
                  )}

                  {custodian && custodian !== 'Unassigned' && (
                    <div style={{ fontSize: labelSize === 'mini' ? '0.52rem' : '0.6rem', color: '#059669', fontWeight: 600 }}>
                      <strong>User:</strong> {custodian}
                    </div>
                  )}
                </div>

                {/* QR Code */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Asset QR Code"
                      style={{
                        width: labelSize === 'wide' ? '70px' : labelSize === 'mini' ? '46px' : '56px',
                        height: labelSize === 'wide' ? '70px' : labelSize === 'mini' ? '46px' : '56px',
                        objectFit: 'contain',
                        border: '1px solid #e2e8f0',
                        borderRadius: '2px',
                        padding: '1px',
                        backgroundColor: '#ffffff',
                      }}
                    />
                  ) : (
                    <div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>...</div>
                  )}
                  <span style={{ fontSize: '0.45rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.04em', marginTop: '1px' }}>
                    SCAN ME
                  </span>
                </div>
              </div>

              {/* Security notice footer */}
              <div
                style={{
                  borderTop: '1px solid #e2e8f0',
                  paddingTop: '2px',
                  marginTop: '3px',
                  textAlign: 'center',
                  fontSize: labelSize === 'mini' ? '0.46rem' : '0.54rem',
                  fontWeight: 700,
                  color: '#64748b',
                  letterSpacing: '0.04em',
                }}
              >
                PROPERTY OF VITROMED • DO NOT REMOVE
              </div>
            </div>
          </div>

          <div
            className="print-instructions-tip no-print"
            style={{
              fontSize: '0.74rem',
              color: 'var(--text-muted)',
              backgroundColor: 'rgba(2, 132, 199, 0.06)',
              border: '1px solid rgba(2, 132, 199, 0.15)',
              borderRadius: '6px',
              padding: '0.6rem 0.75rem',
            }}
          >
            <strong>Printing Tip:</strong> In the print dialog, choose your thermal sticker printer (or desktop printer) and set margins to <em>None</em> for optimal sticker alignment.
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className="modal-footer no-print"
          style={{
            padding: '0.85rem 1.25rem',
            borderTop: '1px solid var(--border-default, #e2e8f0)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.5rem',
            backgroundColor: 'var(--bg-surface-raised, #f8fafc)',
          }}
        >
          <button type="button" onClick={onClose} className="btn btn-outline btn-sm">
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}
          >
            <Printer size={15} />
            <span>Print Asset Sticker</span>
          </button>
        </div>
      </div>
    </div>
  );
}
