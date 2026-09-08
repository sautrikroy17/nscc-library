import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import { 
  BookOpen, 
  MapPin, 
  QrCode, 
  Plus, 
  Search, 
  Download, 
  Printer, 
  Edit3, 
  Trash2, 
  Sparkles, 
  X,
  Layers,
  Calendar,
  Filter
} from 'lucide-react';
import { books as booksApi, ai as aiApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { toast } from '../context/ToastContext';
import { playClick, playSuccessChime, playErrorBeep } from '../utils/audio';

const COLORS = ['#10b981','#06b6d4','#8b5cf6','#f59e0b','#f97316','#ef4444','#84cc16','#ec4899','#6366f1'];

function BookCard({ book, onSelect, onQR, isLibrarian }) {
  const isAvailable = book.available_copies > 0;

  return (
    <motion.div
      className="book-card"
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      onClick={() => { playClick(); onSelect(book); }}
      style={{
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <div className="book-cover" style={{ 
        background: `linear-gradient(135deg, ${book.cover_color}25 0%, ${book.cover_color}45 100%)`,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <BookOpen size={48} color={book.cover_color} strokeWidth={1.5} style={{ opacity: 0.85 }} />
        <div className="book-cover-overlay" />
        
        {/* Availability Badge */}
        <div style={{
          position: 'absolute',
          top: 10,
          right: 10,
          background: isAvailable ? 'rgba(16,185,129,0.9)' : 'rgba(244,63,94,0.9)',
          color: 'white',
          fontSize: 9.5,
          fontWeight: 800,
          padding: '2px 8px',
          borderRadius: 20,
          letterSpacing: '0.4px',
          backdropFilter: 'blur(6px)',
          boxShadow: isAvailable ? '0 0 10px rgba(16,185,129,0.4)' : 'none'
        }}>
          {isAvailable ? `${book.available_copies} AVAILABLE` : 'ISSUED OUT'}
        </div>

        {/* Category Pill Over Cover */}
        <div style={{
          position: 'absolute',
          bottom: 10,
          left: 10,
          background: 'rgba(8, 12, 20, 0.85)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '2px 8px',
          borderRadius: 6,
          fontSize: 10,
          fontWeight: 700,
          color: book.cover_color
        }}>
          {book.category}
        </div>
      </div>

      <div className="book-card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="book-title" style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text)', lineHeight: 1.35 }}>
          {book.title}
        </div>
        <div className="book-author" style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
          {book.author}
        </div>

        {/* Shelf coordinate */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginTop: 'auto', 
          paddingTop: 10,
          fontSize: 11.5,
          color: 'var(--text-3)',
          borderTop: '1px solid var(--border-soft)'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'JetBrains Mono, monospace' }}>
            <MapPin size={11} color="var(--cyan-bright)" />
            {book.shelf_location || 'Zone A'}
          </span>
          <span style={{ 
            fontWeight: 700, 
            color: isAvailable ? 'var(--accent-bright)' : 'var(--danger)',
            fontFamily: 'JetBrains Mono, monospace'
          }}>
            {book.available_copies}/{book.total_copies}
          </span>
        </div>

        {isLibrarian && (
          <button
            onClick={e => { e.stopPropagation(); playClick(); onQR(book); }}
            style={{
              marginTop: 10,
              width: '100%',
              padding: '6px',
              borderRadius: 8,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border)',
              color: 'var(--text-3)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 200ms',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-3)'; }}
          >
            <QrCode size={13} />
            <span>Shelf QR Label</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}

function QRModal({ book, onClose }) {
  const canvasRef = useRef(null);
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    if (!book) return;
    QRCode.toDataURL(book.id, {
      width: 256, margin: 2,
      color: { dark: '#0b0f19', light: '#ffffff' }
    }).then(setQrDataUrl).catch(console.error);
  }, [book]);

  const downloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `NSCC-Library-${book.id}-QR.png`;
    a.click();
    toast.success('QR Code downloaded!');
  };

  const printLabel = () => {
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Library Label - ${book.title}</title>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 20px; background: white; }
        .label { width: 300px; border: 2px solid #0b0f19; border-radius: 12px; padding: 16px; text-align: center; }
        .logo { font-size: 11px; color: #666; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px; }
        h3 { font-size: 14px; margin: 8px 0 4px; color: #0b0f19; }
        .author { font-size: 12px; color: #666; margin-bottom: 8px; }
        .shelf { display: inline-block; padding: 3px 10px; background: #ecfdf5; border-radius: 20px; font-size: 11px; font-weight: 700; color: #059669; margin-bottom: 12px; }
        img { max-width: 160px; }
        .id { font-family: monospace; font-size: 13px; font-weight: 700; margin-top: 8px; color: #0b0f19; }
      </style></head>
      <body onload="window.print()">
        <div class="label">
          <div class="logo">📚 NSCC Library · SRM IST</div>
          <h3>${book.title}</h3>
          <div class="author">${book.author}</div>
          <div class="shelf">📍 ${book.shelf_location || 'N/A'}</div>
          <br/>
          <img src="${qrDataUrl}" />
          <div class="id">${book.id} · ISBN: ${book.isbn || 'N/A'}</div>
        </div>
      </body></html>
    `);
    win.document.close();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        className="modal"
        style={{ maxWidth: 400 }}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title">📱 QR Code</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 15, textAlign: 'center', color: 'var(--text)' }}>{book.title}</div>
          <div style={{ fontSize: 13, color: 'var(--text-3)' }}>{book.author}</div>

          {qrDataUrl ? (
            <div className="qr-wrapper">
              <img src={qrDataUrl} alt={`QR for ${book.id}`} width={220} height={220} />
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 16, fontWeight: 700, color: '#0b0f19' }}>
                {book.id}
              </div>
              <div style={{ fontSize: 11, color: '#666', marginTop: -4 }}>
                Shelf: {book.shelf_location || 'N/A'} · ISBN: {book.isbn || 'N/A'}
              </div>
            </div>
          ) : (
            <div style={{ width: 220, height: 220, background: '#f1f5f9', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="spinner" />
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, width: '100%' }}>
            <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={downloadQR}>
              ⬇️ Download PNG
            </button>
            <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={printLabel}>
              🖨️ Print Label
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function BookDetailModal({ book, onClose, isLibrarian, onEdit, onDelete }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        className="modal"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title">📖 Book Details</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <div style={{
              width: 80, height: 100, borderRadius: 10, flexShrink: 0,
              background: `linear-gradient(135deg, ${book.cover_color}44, ${book.cover_color}22)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36,
            }}>📖</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)', marginBottom: 4 }}>{book.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 8 }}>by {book.author}</div>
              <span className={`badge ${book.available_copies > 0 ? 'badge-success' : 'badge-danger'}`}>
                {book.available_copies > 0 ? `${book.available_copies} of ${book.total_copies} available` : 'All copies issued'}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            {[
              ['Book ID', book.id],
              ['ISBN', book.isbn || 'N/A'],
              ['Category', book.category],
              ['Shelf', book.shelf_location || 'N/A'],
              ['Published', book.published_year || 'N/A'],
              ['Total Copies', book.total_copies],
            ].map(([label, val]) => (
              <div key={label} style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ fontSize: 10.5, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)', fontFamily: label === 'Book ID' || label === 'ISBN' ? 'JetBrains Mono, monospace' : 'inherit' }}>{val}</div>
              </div>
            ))}
          </div>

          {book.description && (
            <div style={{ padding: '12px 14px', background: 'var(--bg-elevated)', borderRadius: 10 }}>
              <div style={{ fontSize: 11, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>About</div>
              <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>{book.description}</div>
            </div>
          )}
        </div>
        {isLibrarian && (
          <div className="modal-footer">
            <button className="btn btn-danger btn-sm" onClick={() => onDelete(book)}>🗑️ Delete</button>
            <button className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
            <button className="btn btn-primary btn-sm" onClick={() => onEdit(book)}>✏️ Edit</button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function AddEditBookModal({ book, onClose, onSave }) {
  const [form, setForm] = useState({
    title: book?.title || '',
    author: book?.author || '',
    isbn: book?.isbn || '',
    category: book?.category || 'Algorithms',
    total_copies: book?.total_copies || 1,
    shelf_location: book?.shelf_location || '',
    description: book?.description || '',
    cover_color: book?.cover_color || '#10b981',
    published_year: book?.published_year || '',
  });
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const handleAIAutofill = async () => {
    if (!form.title.trim()) { toast.error('Enter a book title first to use AI autofill'); return; }
    setAiLoading(true);
    try {
      const data = await aiApi.autofill(form.title.trim());
      setForm(prev => ({
        ...prev,
        ...data.metadata,
        total_copies: prev.total_copies,
        cover_color: prev.cover_color,
      }));
      toast.success('✨ AI autofill complete!');
    } catch (err) {
      toast.error('AI autofill failed: ' + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(form);
    } finally {
      setLoading(false);
    }
  };

  const CATEGORIES = ['Algorithms','Software Engineering','Computer Networks','Operating Systems','Databases','AI & Machine Learning','Interview Prep','Computer Science','Computer Architecture','Web Development','Python','Competitive Programming','Mathematics','Cybersecurity'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        className="modal"
        style={{ maxWidth: 560 }}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title">{book ? '✏️ Edit Book' : '➕ Add New Book'}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Title + AI autofill */}
            <div className="input-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label className="input-label">Book Title *</label>
                <button type="button" onClick={handleAIAutofill} disabled={aiLoading} style={{
                  fontSize: 11.5, fontWeight: 700, color: 'var(--cyan)',
                  background: 'var(--cyan-soft)', border: '1px solid rgba(6,182,212,0.25)',
                  borderRadius: 20, padding: '3px 10px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  {aiLoading ? <><div className="spinner" style={{ width: 12, height: 12, borderTopColor: 'var(--cyan)' }} /> Filling...</> : '✨ AI Autofill'}
                </button>
              </div>
              <input
                className="input" type="text" required
                placeholder="e.g. Introduction to Algorithms"
                value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              />
            </div>

            <div className="form-row">
              <div className="input-group">
                <label className="input-label">Author *</label>
                <input className="input" required placeholder="Author name(s)"
                  value={form.author} onChange={e => setForm(p => ({ ...p, author: e.target.value }))} />
              </div>
              <div className="input-group">
                <label className="input-label">ISBN</label>
                <input className="input" placeholder="978-..."
                  value={form.isbn} onChange={e => setForm(p => ({ ...p, isbn: e.target.value }))} />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label className="input-label">Category *</label>
                <select className="input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Total Copies</label>
                <input className="input" type="number" min="1" max="99"
                  value={form.total_copies} onChange={e => setForm(p => ({ ...p, total_copies: parseInt(e.target.value) || 1 }))} />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label className="input-label">Shelf Location</label>
                <input className="input" placeholder="e.g. A-101"
                  value={form.shelf_location} onChange={e => setForm(p => ({ ...p, shelf_location: e.target.value }))} />
              </div>
              <div className="input-group">
                <label className="input-label">Published Year</label>
                <input className="input" type="number" min="1900" max="2030" placeholder="2024"
                  value={form.published_year} onChange={e => setForm(p => ({ ...p, published_year: e.target.value }))} />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Description</label>
              <textarea className="input" rows={3} placeholder="Brief description of the book..."
                style={{ resize: 'vertical' }}
                value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>

            <div className="input-group">
              <label className="input-label">Cover Color</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setForm(p => ({ ...p, cover_color: c }))}
                    style={{
                      width: 30, height: 30, borderRadius: '50%', background: c, border: 'none',
                      cursor: 'pointer', outline: form.cover_color === c ? `3px solid white` : 'none',
                      outlineOffset: 2, transition: 'transform 150ms',
                      transform: form.cover_color === c ? 'scale(1.2)' : 'scale(1)',
                    }} />
                ))}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><div className="spinner" /> Saving...</> : (book ? '💾 Update Book' : '➕ Add Book')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function Catalog() {
  const { user } = useAuth();
  const isLibrarian = user?.role === 'librarian';

  const [bookList, setBookList] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [availability, setAvailability] = useState('all');

  const [selectedBook, setSelectedBook] = useState(null);
  const [qrBook, setQrBook] = useState(null);
  const [editBook, setEditBook] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const data = await booksApi.list({ q: search, category: activeCategory, availability });
      setBookList(data.books);
    } catch (err) {
      toast.error('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    booksApi.categories().then(d => setCategories(d.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    const timeout = setTimeout(fetchBooks, 300);
    return () => clearTimeout(timeout);
  }, [search, activeCategory, availability]);

  const handleAddBook = async (formData) => {
    try {
      await booksApi.create(formData);
      toast.success('📚 Book added to catalog!');
      setShowAddModal(false);
      fetchBooks();
    } catch (err) { toast.error(err.message); }
  };

  const handleEditBook = async (formData) => {
    try {
      await booksApi.update(editBook.id, formData);
      toast.success('Book updated successfully!');
      setEditBook(null);
      setSelectedBook(null);
      fetchBooks();
    } catch (err) { toast.error(err.message); }
  };

  const handleDeleteBook = async (book) => {
    if (!confirm(`Delete "${book.title}"? This cannot be undone.`)) return;
    try {
      await booksApi.delete(book.id);
      toast.success('Book deleted');
      setSelectedBook(null);
      fetchBooks();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BookOpen size={24} color="var(--accent)" />
            <span>Central Book Repository</span>
          </h1>
          <p className="page-subtitle">{bookList.length} volumes listed · {categories.length - 1} engineering & science categories</p>
        </div>
        {isLibrarian && (
          <motion.button
            className="btn btn-primary"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { playClick(); setShowAddModal(true); }}
            style={{ display: 'flex', alignItems: 'center', gap: 7 }}
          >
            <Plus size={16} />
            <span>Register Volume</span>
          </motion.button>
        )}
      </div>

      {/* Search & Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Search size={16} color="var(--text-4)" style={{ flexShrink: 0 }} />
          <input
            placeholder="Search by title, author, ISBN or Book ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ color: 'var(--text-4)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>✕</button>
          )}
        </div>
        <select
          className="input"
          style={{ width: 160 }}
          value={availability}
          onChange={e => setAvailability(e.target.value)}
        >
          <option value="all">All Books</option>
          <option value="available">Available</option>
          <option value="unavailable">Issued Out</option>
        </select>
      </div>

      {/* Category Pills */}
      <div className="category-pills">
        {categories.map(cat => (
          <button
            key={cat}
            className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Book Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner spinner-lg" />
        </div>
      ) : bookList.length === 0 ? (
        <div className="empty-state">
          <span style={{ fontSize: 64 }}>📭</span>
          <div className="empty-state-title">No books found</div>
          <div className="empty-state-desc">Try adjusting your search or filters</div>
        </div>
      ) : (
        <AnimatePresence>
          <div className="book-grid">
            {bookList.map(book => (
              <BookCard
                key={book.id}
                book={book}
                onSelect={setSelectedBook}
                onQR={setQrBook}
                isLibrarian={isLibrarian}
              />
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Modals */}
      <AnimatePresence>
        {selectedBook && (
          <BookDetailModal
            book={selectedBook}
            onClose={() => setSelectedBook(null)}
            isLibrarian={isLibrarian}
            onEdit={b => { setEditBook(b); setSelectedBook(null); }}
            onDelete={handleDeleteBook}
          />
        )}
        {qrBook && <QRModal book={qrBook} onClose={() => setQrBook(null)} />}
        {(showAddModal || editBook) && (
          <AddEditBookModal
            book={editBook}
            onClose={() => { setShowAddModal(false); setEditBook(null); }}
            onSave={editBook ? handleEditBook : handleAddBook}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
