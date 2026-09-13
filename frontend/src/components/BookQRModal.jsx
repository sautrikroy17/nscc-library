import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  Download, 
  Printer, 
  Copy, 
  Check, 
  BookOpen, 
  QrCode, 
  ExternalLink,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { toast } from '../context/ToastContext';
import { playClick, playSuccessChime } from '../utils/audio';

export default function BookQRModal({ book, isOpen, onClose, onTestInScanner }) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const printRef = useRef(null);

  useEffect(() => {
    if (!book || !isOpen) return;

    // Payload for library circulation: Book ID + ISBN + Title
    const payload = JSON.stringify({
      id: book.id,
      isbn: book.isbn || 'N/A',
      title: book.title,
      type: 'SRMIST_BOOK_RECORD'
    });

    QRCode.toDataURL(payload, {
      width: 320,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'H'
    }).then(url => {
      setQrDataUrl(url);
    }).catch(err => {
      console.error('Failed to generate QR code', err);
    });
  }, [book, isOpen]);

  if (!isOpen || !book) return null;

  const handleDownload = () => {
    playClick();
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `SRMIST-QR-${book.id || 'BOOK'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    playSuccessChime();
    toast.success(`QR code label for "${book.title}" downloaded!`);
  };

  const handlePrint = () => {
    playClick();
    const printWindow = window.open('', '_blank', 'width=600,height=700');
    if (!printWindow) {
      toast.error('Please allow popups to print library labels');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>SRM IST Central Library - QR Label - ${book.id}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: #f8fafc;
            }
            .label-card {
              border: 2px dashed #0f172a;
              border-radius: 12px;
              padding: 24px;
              width: 340px;
              background: #ffffff;
              text-align: center;
            }
            .header {
              font-size: 11px;
              letter-spacing: 1px;
              font-weight: 800;
              color: #1e3a8a;
              text-transform: uppercase;
              margin-bottom: 4px;
            }
            .subheader {
              font-size: 9px;
              color: #64748b;
              margin-bottom: 14px;
            }
            .qr-img {
              width: 200px;
              height: 200px;
              margin: 0 auto 12px;
              display: block;
            }
            .book-title {
              font-size: 14px;
              font-weight: 800;
              color: #0f172a;
              margin-bottom: 4px;
            }
            .book-author {
              font-size: 12px;
              color: #475569;
              margin-bottom: 10px;
            }
            .meta-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 6px;
              text-align: left;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 6px;
              padding: 8px 10px;
              font-size: 10px;
              color: #334155;
            }
            .meta-grid strong {
              color: #0f172a;
            }
          </style>
        </head>
        <body>
          <div class="label-card">
            <div class="header">SRM IST CENTRAL LIBRARY</div>
            <div class="subheader">Official Circulation Accession Tag</div>
            <img class="qr-img" src="${qrDataUrl}" alt="Book QR" />
            <div class="book-title">${book.title}</div>
            <div class="book-author">by ${book.author}</div>
            <div class="meta-grid">
              <div><strong>Book ID:</strong> ${book.id}</div>
              <div><strong>Copies:</strong> ${book.total_copies || 5} Total</div>
              <div><strong>Shelf:</strong> ${book.shelf_location || 'Stack A-12'}</div>
              <div><strong>ISBN:</strong> ${book.isbn || 'N/A'}</div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleCopyId = () => {
    playClick();
    navigator.clipboard?.writeText(book.id).then(() => {
      setCopied(true);
      toast.success(`Copied Book ID: ${book.id}`);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 16
    }}>
      <div style={{
        background: 'var(--bg-card, #ffffff)',
        borderRadius: 20,
        width: '100%',
        maxWidth: 440,
        border: '1px solid var(--border, #e2e8f0)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        overflow: 'hidden',
        animation: 'fadeIn 200ms ease-out'
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border, #e2e8f0)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-surface, #f8fafc)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: 'rgba(37, 99, 235, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563eb'
            }}>
              <QrCode size={18} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text, #0f172a)', lineHeight: 1.2 }}>
                Book QR Code
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-3, #64748b)' }}>
                Unique Circulation Accession Label
              </div>
            </div>
          </div>

          <button
            onClick={() => { playClick(); onClose(); }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-3, #64748b)',
              cursor: 'pointer',
              padding: 4,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', textAlign: 'center' }}>
          {/* Institutional Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '3px 10px',
            borderRadius: 999,
            background: 'rgba(37, 99, 235, 0.08)',
            border: '1px solid rgba(37, 99, 235, 0.2)',
            color: '#2563eb',
            fontSize: 11,
            fontWeight: 700,
            marginBottom: 16,
            letterSpacing: '0.3px'
          }}>
            <ShieldCheck size={13} />
            SRM IST CENTRAL LIBRARY • VERIFIED STACK ASSET
          </div>

          {/* QR Code Container */}
          <div style={{
            background: '#ffffff',
            padding: 16,
            borderRadius: 16,
            border: '2px solid #e2e8f0',
            display: 'inline-block',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.06)',
            marginBottom: 16
          }}>
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Book QR Code"
                style={{
                  width: 200,
                  height: 200,
                  display: 'block',
                  borderRadius: 8
                }}
              />
            ) : (
              <div style={{ width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner spinner-sm" />
              </div>
            )}
          </div>

          {/* Book Information */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text, #0f172a)', lineHeight: 1.3 }}>
              {book.title}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-3, #64748b)', marginTop: 2 }}>
              by <span style={{ fontWeight: 600, color: 'var(--text, #334155)' }}>{book.author}</span>
            </div>
          </div>

          {/* Metadata Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 8,
            background: 'var(--bg-surface, #f8fafc)',
            border: '1px solid var(--border, #e2e8f0)',
            borderRadius: 12,
            padding: '12px 14px',
            textAlign: 'left',
            fontSize: 12,
            marginBottom: 20
          }}>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-4, #94a3b8)', textTransform: 'uppercase', fontWeight: 700 }}>Book ID</div>
              <div style={{ fontWeight: 800, color: 'var(--text, #0f172a)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>{book.id}</span>
                <button
                  onClick={handleCopyId}
                  title="Copy Book ID"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#2563eb' }}
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                </button>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 10, color: 'var(--text-4, #94a3b8)', textTransform: 'uppercase', fontWeight: 700 }}>Shelf Location</div>
              <div style={{ fontWeight: 700, color: 'var(--text, #0f172a)', marginTop: 2 }}>
                {book.shelf_location || 'Stack A-12'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 10, color: 'var(--text-4, #94a3b8)', textTransform: 'uppercase', fontWeight: 700 }}>ISBN</div>
              <div style={{ fontWeight: 600, color: 'var(--text-2, #334155)', marginTop: 2, fontSize: 11 }}>
                {book.isbn || '978-0132350884'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 10, color: 'var(--text-4, #94a3b8)', textTransform: 'uppercase', fontWeight: 700 }}>Availability</div>
              <div style={{ fontWeight: 700, color: (book.available_copies ?? 2) > 0 ? '#10b981' : '#ef4444', marginTop: 2 }}>
                {(book.available_copies ?? 2) > 0 ? `${book.available_copies ?? 2} in stack` : 'Checked out'}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button
              onClick={handleDownload}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '10px 14px',
                borderRadius: 10,
                border: '1px solid var(--border, #e2e8f0)',
                background: 'var(--bg-surface, #f8fafc)',
                color: 'var(--text, #0f172a)',
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 120ms'
              }}
            >
              <Download size={15} />
              <span>Download PNG</span>
            </button>

            <button
              onClick={handlePrint}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '10px 14px',
                borderRadius: 10,
                border: 'none',
                background: '#0f172a',
                color: '#ffffff',
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 120ms'
              }}
            >
              <Printer size={15} />
              <span>Print Label</span>
            </button>
          </div>

          {onTestInScanner && (
            <button
              onClick={() => {
                playClick();
                onClose();
                onTestInScanner(book);
              }}
              style={{
                width: '100%',
                marginTop: 10,
                padding: '8px',
                borderRadius: 8,
                background: 'none',
                border: 'none',
                color: '#2563eb',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              <Sparkles size={13} />
              <span>Test Issue/Return with this QR in Scanner</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
