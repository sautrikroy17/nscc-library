import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  Zap, 
  FileSpreadsheet, 
  BookOpen, 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2, 
  Trash2, 
  ArrowUpRight, 
  RotateCcw, 
  FileText, 
  Layers, 
  Check, 
  Clock,
  Sparkles,
  Download,
  Users,
  Plus,
  Search,
  X,
  UploadCloud,
  Settings as SettingsIcon,
  Bell,
  Lock,
  User as UserIcon,
  BarChart3,
  TrendingUp,
  PieChart,
  QrCode
} from 'lucide-react';
import { books as booksApi, transactions as txApi, stats as statsApi, exportData } from '../api';
import { localStore } from '../data/localStore';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import { toast } from '../context/ToastContext';
import { playClick, playSuccessChime } from '../utils/audio';
import BackButton from '../components/BackButton';
import BookQRModal from '../components/BookQRModal';

// ─────────────────────────────────────────────────────────────
// Panel 10: Add New Book Form
// ─────────────────────────────────────────────────────────────
function AddBookForm({ onBookAdded, onCancel }) {
  const { addBook } = useLibrary();
  const [form, setForm] = useState({
    id: `BK${Math.floor(100 + Math.random() * 900)}`,
    title: '',
    author: '',
    isbn: '',
    category: 'Computer Science',
    total_copies: 5,
    shelf_location: 'Stack A-12',
    description: '',
    cover_image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80'
  });
  const [loading, setLoading] = useState(false);
  const [createdBook, setCreatedBook] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);

  const CATEGORIES = [
    'Computer Science',
    'Electronics',
    'Mechanical',
    'Mathematics',
    'Biotechnology',
    'Management',
    'Civil Engineering',
    'Literature & Arts'
  ];

  const SAMPLE_COVERS = [
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500&auto=format&fit=crop&q=80'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.author.trim()) {
      toast.error('Please enter book title and author');
      return;
    }
    setLoading(true);
    try {
      const added = addBook(form);
      setCreatedBook(added || form);
      setShowQRModal(true);
      playSuccessChime();
    } catch (err) {
      toast.error(err.message || 'Failed to add book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: 16,
      padding: 32,
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
      marginBottom: 32
    }}>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>Add New Book</h2>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
            Catalog a new volume into the institutional physical stacks
          </p>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            style={{ padding: '6px 14px', borderRadius: 8, background: '#f1f5f9', border: 'none', color: '#64748b', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
          >
            Cancel
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
        gap: 32,
        alignItems: 'start'
      }}>
        {/* Left Column: Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>Book Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Designing Data-Intensive Applications"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: 13.5, outline: 'none' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>Author Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Martin Kleppmann"
                value={form.author}
                onChange={e => setForm({ ...form, author: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: 13.5, outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>ISBN Number</label>
              <input
                type="text"
                placeholder="978-1491903070"
                value={form.isbn}
                onChange={e => setForm({ ...form, isbn: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: 13.5, outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>Category</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: 13.5, outline: 'none' }}
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>Shelf Coordinates</label>
              <input
                type="text"
                placeholder="e.g. Stack B-04"
                value={form.shelf_location}
                onChange={e => setForm({ ...form, shelf_location: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: 13.5, outline: 'none' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>Book Description & Syllabus Notes</label>
            <textarea
              rows={4}
              placeholder="Provide a comprehensive synopsis or curriculum relevance..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: 13, outline: 'none', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                style={{ padding: '12px 20px', borderRadius: 10, background: '#ffffff', border: '1px solid #e2e8f0', color: '#475569', fontWeight: 600, fontSize: 13.5, cursor: 'pointer' }}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              style={{ flex: 1, padding: '12px 24px', borderRadius: 10, background: '#0f172a', border: 'none', color: '#ffffff', fontWeight: 700, fontSize: 13.5, cursor: 'pointer' }}
            >
              {loading ? 'Cataloging Book...' : '+ Add Book to Library'}
            </button>
          </div>
        </div>

        {/* Right Column: Cover Image Upload */}
        <div>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>Book Cover Image</label>
          <div style={{
            border: '2px dashed #cbd5e1',
            borderRadius: 14,
            padding: 24,
            textAlign: 'center',
            background: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 240,
            marginBottom: 16
          }}>
            {form.cover_image ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <img
                  src={form.cover_image}
                  alt="Preview"
                  style={{ width: 110, height: 160, objectFit: 'cover', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <span style={{ fontSize: 11.5, color: '#64748b' }}>Active Cover Preview</span>
              </div>
            ) : (
              <>
                <UploadCloud size={36} color="#94a3b8" style={{ marginBottom: 8 }} />
                <div style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>Drag & drop cover image here</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Supports JPG, PNG up to 5MB</div>
              </>
            )}
          </div>

          <div>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Or Select a Preset Cover:</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {SAMPLE_COVERS.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt="Option"
                  onClick={() => setForm({ ...form, cover_image: url })}
                  style={{
                    width: '100%',
                    height: 60,
                    objectFit: 'cover',
                    borderRadius: 6,
                    cursor: 'pointer',
                    border: form.cover_image === url ? '2px solid #0f172a' : '1px solid #e2e8f0',
                    opacity: form.cover_image === url ? 1 : 0.6
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </form>

      {/* Unique Book QR Code Modal */}
      <BookQRModal
        book={createdBook}
        isOpen={showQRModal}
        onClose={() => {
          setShowQRModal(false);
          onBookAdded?.();
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
// Screen 4: Students Management (Mockup Exact)
// ─────────────────────────────────────────────────────────────
const INITIAL_STUDENTS = [
  { id: '1', num: 1, name: 'Sautrik Roy', reg: 'RA2511003010052', dept: 'CSE', year: '2', borrowed: 3, status: 'Active', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80' },
  { id: '2', num: 2, name: 'Ananya S', reg: 'RA2511003010222', dept: 'CSE', year: '3', borrowed: 1, status: 'Active', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' },
  { id: '3', num: 3, name: 'Vikram K', reg: 'RA2511003010333', dept: 'ECE', year: '2', borrowed: 0, status: 'Active', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
  { id: '4', num: 4, name: 'Sneha Iyer', reg: 'RA2511003010901', dept: 'IT', year: '3', borrowed: 2, status: 'Active', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80' },
  { id: '5', num: 5, name: 'Karthik N', reg: 'RA2511003010789', dept: 'ME', year: '2', borrowed: 1, status: 'Active', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80' },
  { id: '6', num: 6, name: 'Isha Gupta', reg: 'RA2511003010444', dept: 'CSE', year: '3', borrowed: 4, status: 'Active', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
  { id: '7', num: 7, name: 'Aditya Rao', reg: 'RA2511003010555', dept: 'EEE', year: '2', borrowed: 0, status: 'Active', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80' },
  { id: '8', num: 8, name: 'Priya Nair', reg: 'RA2511003010666', dept: 'CSE', year: '3', borrowed: 0, status: 'Inactive', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80' },
];

function StudentManagement({ onNavigate = () => {} }) {
  const { students: contextStudents, setStudents } = useLibrary();
  const students = contextStudents && contextStudents.length > 0 ? contextStudents : INITIAL_STUDENTS;
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Name');
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', reg: '', dept: 'CSE', year: '2' });

  const filtered = students.filter(s => {
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const match = s.name.toLowerCase().includes(q) ||
                    s.reg.toLowerCase().includes(q) ||
                    s.dept.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (deptFilter !== 'All' && s.dept !== deptFilter) return false;
    if (yearFilter !== 'All' && s.year !== yearFilter) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'Name') return a.name.localeCompare(b.name);
    if (sortBy === 'Roll Number') return a.reg.localeCompare(b.reg);
    if (sortBy === 'Books Issued') return b.borrowed - a.borrowed;
    return 0;
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.reg) return;
    setStudents(prev => [
      {
        id: Date.now().toString(),
        num: prev.length + 1,
        name: newStudent.name,
        reg: newStudent.reg.toUpperCase(),
        dept: newStudent.dept,
        year: newStudent.year,
        borrowed: 0,
        status: 'Active',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
      },
      ...prev
    ]);
    setShowAddModal(false);
    setNewStudent({ name: '', reg: '', dept: 'CSE', year: '2' });
    playSuccessChime();
    toast.success('New student registered in library system!');
  };

  const toggleStatus = (id) => {
    playClick();
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'Active' ? 'Inactive' : 'Active' } : s));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header matching Screen 4 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <BackButton onClick={() => onNavigate('dashboard')} label="Dashboard" />
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Students
            </h1>
            <p style={{ fontSize: 13, color: '#64748b', margin: '3px 0 0' }}>
              Manage registered students and their library accounts
            </p>
          </div>
        </div>

        <button
          onClick={() => { playClick(); setShowAddModal(true); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            borderRadius: 8,
            background: '#2563eb',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: 13.5,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
          }}
        >
          <Plus size={16} strokeWidth={2.5} /> Register Student
        </button>
      </div>

      {/* Filter Row matching Screen 4 */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap'
      }}>
        {/* Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          padding: '8px 12px',
          flex: '1 1 300px',
          minWidth: 260
        }}>
          <Search size={15} color="#94a3b8" />
          <input
            placeholder="Search by name, roll number, department..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ background: 'transparent', border: 'none', outline: 'none', color: '#0f172a', fontSize: 13, width: '100%' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>✕</button>
          )}
        </div>

        {/* Department */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12.5, color: '#64748b', fontWeight: 600 }}>Department:</span>
          <select
            value={deptFilter}
            onChange={e => { playClick(); setDeptFilter(e.target.value); }}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 12.5, color: '#0f172a', fontWeight: 600, outline: 'none', cursor: 'pointer' }}
          >
            <option value="All">All</option>
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
            <option value="IT">IT</option>
            <option value="ME">ME</option>
            <option value="EEE">EEE</option>
          </select>
        </div>

        {/* Year */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12.5, color: '#64748b', fontWeight: 600 }}>Year:</span>
          <select
            value={yearFilter}
            onChange={e => { playClick(); setYearFilter(e.target.value); }}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 12.5, color: '#0f172a', fontWeight: 600, outline: 'none', cursor: 'pointer' }}
          >
            <option value="All">All</option>
            <option value="1">Year 1</option>
            <option value="2">Year 2</option>
            <option value="3">Year 3</option>
            <option value="4">Year 4</option>
          </select>
        </div>

        {/* Sort by */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12.5, color: '#64748b', fontWeight: 600 }}>Sort by:</span>
          <select
            value={sortBy}
            onChange={e => { playClick(); setSortBy(e.target.value); }}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 12.5, color: '#0f172a', fontWeight: 600, outline: 'none', cursor: 'pointer' }}
          >
            <option value="Name">Name</option>
            <option value="Roll Number">Roll Number</option>
            <option value="Books Issued">Books Issued</option>
          </select>
        </div>
      </div>

      {/* Students Data Table matching Screen 4 */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#64748b', width: 40 }}>#</th>
                <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#64748b' }}>Name</th>
                <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#64748b' }}>Roll Number</th>
                <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#64748b' }}>Department</th>
                <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#64748b' }}>Year</th>
                <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#64748b' }}>Books Issued</th>
                <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#64748b' }}>Status</th>
                <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#64748b', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student, idx) => (
                <tr key={student.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 18px', fontSize: 13, color: '#64748b', fontWeight: 600 }}>
                    {idx + 1}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <img
                        src={student.avatar}
                        alt=""
                        style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                      />
                      <span style={{ fontWeight: 700, fontSize: 13.5, color: '#0f172a' }}>{student.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#475569' }}>
                    {student.reg}
                  </td>
                  <td style={{ padding: '14px 18px', fontSize: 13, color: '#334155', fontWeight: 600 }}>
                    {student.dept}
                  </td>
                  <td style={{ padding: '14px 18px', fontSize: 13, color: '#64748b' }}>
                    {student.year}
                  </td>
                  <td style={{ padding: '14px 18px', fontSize: 13, fontWeight: 700, color: student.borrowed > 0 ? '#2563eb' : '#64748b' }}>
                    {student.borrowed}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: 999,
                      background: student.status === 'Active' ? '#ecfdf5' : '#fef2f2',
                      color: student.status === 'Active' ? '#059669' : '#dc2626'
                    }}>
                      {student.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                    <button
                      onClick={() => toggleStatus(student.id)}
                      title="Toggle Status"
                      style={{
                        padding: '4px 10px',
                        borderRadius: 6,
                        border: '1px solid #e2e8f0',
                        background: '#ffffff',
                        fontSize: 11.5,
                        fontWeight: 600,
                        color: '#64748b',
                        cursor: 'pointer'
                      }}
                    >
                      •••
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Bar matching Screen 4 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 18px',
        background: '#ffffff',
        borderRadius: 12,
        border: '1px solid #e2e8f0'
      }}>
        <span style={{ fontSize: 12.5, color: '#64748b' }}>
          Showing 1-8 of 3,421 students
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => { playClick(); setPage(p => Math.max(1, p - 1)); }}
            disabled={page === 1}
            style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', cursor: page === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}
          >
            ‹
          </button>
          {[1, 2, 3, 4, 5].map(num => (
            <button
              key={num}
              onClick={() => { playClick(); setPage(num); }}
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                border: page === num ? '1px solid #0f172a' : '1px solid #e2e8f0',
                background: page === num ? '#0f172a' : '#ffffff',
                color: page === num ? '#ffffff' : '#64748b',
                fontSize: 12,
                fontWeight: page === num ? 700 : 500,
                cursor: 'pointer'
              }}
            >
              {num}
            </button>
          ))}
          <span style={{ fontSize: 12, color: '#94a3b8' }}>...</span>
          <button
            onClick={() => { playClick(); setPage(428); }}
            style={{
              width: 32,
              height: 28,
              borderRadius: 6,
              border: page === 428 ? '1px solid #0f172a' : '1px solid #e2e8f0',
              background: page === 428 ? '#0f172a' : '#ffffff',
              color: page === 428 ? '#ffffff' : '#64748b',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            428
          </button>
          <button
            onClick={() => { playClick(); setPage(p => p + 1); }}
            style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}
          >
            ›
          </button>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20
        }}>
          <div style={{
            background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16,
            width: '100%', maxWidth: 460, padding: 28, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>Register New Student</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 18, cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 5 }}>Full Name</label>
                <input
                  required
                  placeholder="e.g. Rahul Verma"
                  value={newStudent.name}
                  onChange={e => setNewStudent({ ...newStudent, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: 13, outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 5 }}>Registration / Roll #</label>
                <input
                  required
                  placeholder="e.g. RA2511003010999"
                  value={newStudent.reg}
                  onChange={e => setNewStudent({ ...newStudent, reg: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: 13, outline: 'none', textTransform: 'uppercase' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 5 }}>Department</label>
                  <select
                    value={newStudent.dept}
                    onChange={e => setNewStudent({ ...newStudent, dept: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: 13, outline: 'none' }}
                  >
                    {['CSE', 'ECE', 'IT', 'ME', 'EEE'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 5 }}>Year</label>
                  <select
                    value={newStudent.year}
                    onChange={e => setNewStudent({ ...newStudent, year: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: 13, outline: 'none' }}
                  >
                    {['1', '2', '3', '4'].map(y => (
                      <option key={y} value={y}>Year {y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#ffffff', color: '#64748b', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}
                >
                  Register Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Panel 13: Library Reports & Analytics
// ─────────────────────────────────────────────────────────────
const REPORT_METRICS = {
  '7days': {
    issues: '2,840',
    issuesDiff: '+5.2%',
    readers: '1,120',
    readersDiff: '+3.1%',
    returnRate: '97.1%',
    overdueRate: '2.9%',
    overdueCount: '18',
    totalBooks: '12,482',
    categories: [
      { name: 'Computer Science', pct: 44, count: 1250, color: '#0f172a' },
      { name: 'Electronics', pct: 24, count: 680, color: '#3b82f6' },
      { name: 'Mechanical', pct: 18, count: 510, color: '#10b981' },
      { name: 'Others', pct: 14, count: 400, color: '#f59e0b' }
    ],
    bars: [
      { m: 'Mon', issued: 48, returned: 42 },
      { m: 'Tue', issued: 64, returned: 58 },
      { m: 'Wed', issued: 55, returned: 50 },
      { m: 'Thu', issued: 78, returned: 72 },
      { m: 'Fri', issued: 92, returned: 86 },
      { m: 'Sat', issued: 36, returned: 34 },
      { m: 'Sun', issued: 18, returned: 16 }
    ]
  },
  '30days': {
    issues: '12,482',
    issuesDiff: '+14.2%',
    readers: '3,421',
    readersDiff: '+8.5%',
    returnRate: '96.4%',
    overdueRate: '3.6%',
    overdueCount: '47',
    totalBooks: '12,482',
    categories: [
      { name: 'Computer Science', pct: 42, count: 5242, color: '#0f172a' },
      { name: 'Electronics', pct: 25, count: 3120, color: '#3b82f6' },
      { name: 'Mechanical', pct: 18, count: 2246, color: '#10b981' },
      { name: 'Others', pct: 15, count: 1874, color: '#f59e0b' }
    ],
    bars: [
      { m: 'Apr', issued: 65, returned: 58 },
      { m: 'May', issued: 82, returned: 75 },
      { m: 'Jun', issued: 48, returned: 52 },
      { m: 'Jul', issued: 70, returned: 64 },
      { m: 'Aug', issued: 95, returned: 88 },
      { m: 'Sep', issued: 110, returned: 98 }
    ]
  },
  'semester': {
    issues: '46,290',
    issuesDiff: '+22.4%',
    readers: '8,910',
    readersDiff: '+12.8%',
    returnRate: '94.8%',
    overdueRate: '5.2%',
    overdueCount: '142',
    totalBooks: '12,482',
    categories: [
      { name: 'Computer Science', pct: 45, count: 5616, color: '#0f172a' },
      { name: 'Electronics', pct: 23, count: 2870, color: '#3b82f6' },
      { name: 'Mechanical', pct: 17, count: 2120, color: '#10b981' },
      { name: 'Others', pct: 15, count: 1876, color: '#f59e0b' }
    ],
    bars: [
      { m: 'Month 1', issued: 72, returned: 68 },
      { m: 'Month 2', issued: 89, returned: 84 },
      { m: 'Month 3', issued: 64, returned: 61 },
      { m: 'Month 4', issued: 110, returned: 102 },
      { m: 'Month 5', issued: 125, returned: 119 },
      { m: 'Month 6', issued: 98, returned: 94 }
    ]
  },
  'year': {
    issues: '98,540',
    issuesDiff: '+18.6%',
    readers: '14,280',
    readersDiff: '+15.4%',
    returnRate: '95.5%',
    overdueRate: '4.5%',
    overdueCount: '280',
    totalBooks: '12,482',
    categories: [
      { name: 'Computer Science', pct: 42, count: 5242, color: '#0f172a' },
      { name: 'Electronics', pct: 25, count: 3120, color: '#3b82f6' },
      { name: 'Mechanical', pct: 18, count: 2246, color: '#10b981' },
      { name: 'Others', pct: 15, count: 1874, color: '#f59e0b' }
    ],
    bars: [
      { m: '2023', issued: 78, returned: 72 },
      { m: '2024', issued: 95, returned: 90 },
      { m: '2025', issued: 115, returned: 108 },
      { m: '2026', issued: 120, returned: 114 }
    ]
  }
};

// ─────────────────────────────────────────────────────────────
// Screen 8: Library Reports & Analytics (Mockup Exact)
// ─────────────────────────────────────────────────────────────
const TOP_10_ISSUED_BOOKS = [
  { rank: 1, title: 'Clean Code', author: 'Robert C. Martin', count: 120, max: 120 },
  { rank: 2, title: 'Operating System Concepts', author: 'Silberschatz', count: 98, max: 120 },
  { rank: 3, title: 'Design Patterns', author: 'Gang of Four', count: 85, max: 120 },
  { rank: 4, title: 'Database System Concepts', author: 'Silberschatz', count: 78, max: 120 },
  { rank: 5, title: 'Computer Networks', author: 'Andrew S. Tanenbaum', count: 65, max: 120 },
  { rank: 6, title: 'Artificial Intelligence: A Modern Approach', author: 'Russell & Norvig', count: 54, max: 120 },
  { rank: 7, title: 'Introduction to Algorithms', author: 'CLRS', count: 48, max: 120 },
  { rank: 8, title: 'Head First Java', author: 'Kathy Sierra', count: 42, max: 120 },
  { rank: 9, title: 'Data Structures in C', author: 'Reema Thareja', count: 38, max: 120 },
  { rank: 10, title: 'Cracking the Coding Interview', author: 'Gayle Laakmann', count: 35, max: 120 },
];

const CATEGORY_DISTRIBUTION = [
  { name: 'Computer Science', pct: 35, count: 4368, color: '#3b82f6' },
  { name: 'Electronics', pct: 22, count: 2746, color: '#10b981' },
  { name: 'Mechanical', pct: 18, count: 2246, color: '#f59e0b' },
  { name: 'Civil', pct: 12, count: 1497, color: '#ef4444' },
  { name: 'Mathematics', pct: 8, count: 998, color: '#8b5cf6' },
  { name: 'Others', pct: 5, count: 627, color: '#64748b' },
];

function ReportsAnalytics() {
  const [dateRange, setDateRange] = useState('Last 6 Months');
  const [subTab, setSubTab] = useState('overview');
  const [hoveredCat, setHoveredCat] = useState(null);

  const handleExportReport = () => {
    playClick();
    const csvContent = [
      ['LIBRARY USAGE & CIRCULATION ANALYTICS REPORT'],
      ['Generated On', new Date().toLocaleString()],
      ['Timeframe', dateRange],
      ['Total Volumes Cataloged', '12,482'],
      ['Total Issues (6 Mo)', '1,284'],
      ['Total Returns (6 Mo)', '892'],
      ['Overdue Rate', '3.7%'],
      ['Active Borrowers', '3,421'],
      [],
      ['TOP 10 MOST ISSUED BOOKS'],
      ['Rank', 'Title', 'Author', 'Issue Count'],
      ...TOP_10_ISSUED_BOOKS.map(b => [b.rank, b.title, b.author, b.count]),
      [],
      ['BOOKS BY CATEGORY'],
      ['Category', 'Percentage', 'Volume Count'],
      ...CATEGORY_DISTRIBUTION.map(c => [c.name, `${c.pct}%`, c.count])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `srmist-library-report-${dateRange.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    playSuccessChime();
    toast.success(`Library analytics report (${dateRange}) downloaded as CSV`);
  };

  return (
    <div>
      {/* ── Top Bar matching Screen 8 ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.4px' }}>
            Reports & Analytics
          </h1>
          <p style={{ fontSize: 13.5, color: '#64748b', margin: '4px 0 0' }}>
            Comprehensive library usage statistics and performance metrics
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <select
            value={dateRange}
            onChange={e => { playClick(); setDateRange(e.target.value); }}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              fontSize: 13,
              fontWeight: 600,
              color: '#0f172a',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="Last 6 Months">Last 6 Months</option>
            <option value="This Academic Year">This Academic Year</option>
            <option value="All Time">All Time</option>
          </select>

          <button
            onClick={() => {
              playClick();
              localStore.exportCSV();
              playSuccessChime();
              toast.success('Circulation issue/return ledger downloaded as CSV!');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              color: '#0f172a',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            <FileSpreadsheet size={14} color="#10b981" />
            <span>Circulation Ledger (CSV)</span>
          </button>

          <button
            onClick={handleExportReport}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: '#0f172a',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            <Download size={14} /> Analytics Summary
          </button>
        </div>
      </div>

      {/* ── Sub Navigation Tabs matching Screen 8 ── */}
      <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid #e2e8f0', marginBottom: 22, overflowX: 'auto' }}>
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'usage', label: 'Book Usage' },
          { id: 'students', label: 'Student Activity' },
          { id: 'inventory', label: 'Inventory' },
          { id: 'financial', label: 'Financial' }
        ].map(t => {
          const active = subTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => { playClick(); setSubTab(t.id); }}
              style={{
                padding: '9px 16px',
                border: 'none',
                background: 'none',
                borderBottom: active ? '2px solid #0f172a' : '2px solid transparent',
                color: active ? '#0f172a' : '#64748b',
                fontWeight: active ? 700 : 500,
                fontSize: 13,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ── 4 Key Performance Metric Tiles matching Screen 8 ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '18px 20px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Total Issues</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>1,284</div>
          <div style={{ fontSize: 11.5, color: '#16a34a', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
            <TrendingUp size={12} /> +12% from last month
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '18px 20px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Total Returns</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>892</div>
          <div style={{ fontSize: 11.5, color: '#16a34a', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
            <TrendingUp size={12} /> +8% from last month
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '18px 20px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Overdue Rate</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#ef4444', marginTop: 4 }}>3.7%</div>
          <div style={{ fontSize: 11.5, color: '#16a34a', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
            <TrendingUp size={12} style={{ transform: 'rotate(90deg)' }} /> -0.5% from last month
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '18px 20px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Active Borrowers</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>3,421</div>
          <div style={{ fontSize: 11.5, color: '#16a34a', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
            <TrendingUp size={12} /> +15% from last month
          </div>
        </div>
      </div>

      {/* ── 2 Main Analytics Panels: Top 10 Most Issued & Books by Category ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 1fr)', gap: 20, marginBottom: 24 }}>
        {/* Left: Top 10 Most Issued Books horizontal bar chart */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 22, boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>Top 10 Most Issued Books</h3>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Ranked by total checkout count across campus</div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: 6 }}>
              {dateRange}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {TOP_10_ISSUED_BOOKS.map((b) => {
              const pct = (b.count / 120) * 100;
              return (
                <div key={b.rank} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5 }}>
                    <span style={{ fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80%' }}>
                      <span style={{ color: '#94a3b8', marginRight: 6, fontWeight: 700 }}>#{b.rank}</span>
                      {b.title}
                    </span>
                    <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 12 }}>{b.count}</span>
                  </div>
                  <div style={{ width: '100%', height: 7, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: '#0f172a',
                        borderRadius: 4,
                        transition: 'width 300ms ease'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Books by Category (Donut Chart) */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 22, boxShadow: '0 1px 2px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>Books by Category</h3>
            <span style={{ fontSize: 11.5, color: '#64748b' }}>Total 12,482</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', height: 180, marginBottom: 18 }}>
            <svg width="170" height="170" viewBox="0 0 42 42">
              <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#f1f5f9" strokeWidth="5.5" />
              {/* CS: 35% */}
              <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#3b82f6" strokeWidth="5.5" strokeDasharray="35 65" strokeDashoffset="25" />
              {/* Electronics: 22% */}
              <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#10b981" strokeWidth="5.5" strokeDasharray="22 78" strokeDashoffset="90" />
              {/* Mechanical: 18% */}
              <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#f59e0b" strokeWidth="5.5" strokeDasharray="18 82" strokeDashoffset="68" />
              {/* Civil: 12% */}
              <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#ef4444" strokeWidth="5.5" strokeDasharray="12 88" strokeDashoffset="50" />
              {/* Math: 8% */}
              <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#8b5cf6" strokeWidth="5.5" strokeDasharray="8 92" strokeDashoffset="38" />
              {/* Others: 5% */}
              <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#64748b" strokeWidth="5.5" strokeDasharray="5 95" strokeDashoffset="30" />
            </svg>
            <div style={{ position: 'absolute', textAlign: 'center', pointerEvents: 'none' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                {hoveredCat ? `${hoveredCat.pct}%` : '12,482'}
              </div>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>
                {hoveredCat ? hoveredCat.name : 'Total Books'}
              </div>
            </div>
          </div>

          {/* Category List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 12.5, marginTop: 'auto' }}>
            {CATEGORY_DISTRIBUTION.map(cat => (
              <div
                key={cat.name}
                onMouseEnter={() => setHoveredCat(cat)}
                onMouseLeave={() => setHoveredCat(null)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '4px 8px',
                  borderRadius: 6,
                  background: hoveredCat?.name === cat.name ? '#f8fafc' : 'transparent',
                  cursor: 'pointer',
                  transition: 'background 120ms'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: cat.color }} />
                  <span style={{ color: '#334155', fontWeight: 500 }}>{cat.name}</span>
                </span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>
                  {cat.pct}% <span style={{ color: '#94a3b8', fontWeight: 500 }}>({cat.count.toLocaleString()})</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 10: Settings / Profile (Mockup Exact for Dr. Rajesh Kumar)
// ─────────────────────────────────────────────────────────────
function SettingsProfile({ initialSubTab = 'profile' }) {
  const { user } = useAuth();
  const [subTab, setSubTab] = useState(initialSubTab);

  useEffect(() => {
    if (initialSubTab) setSubTab(initialSubTab);
  }, [initialSubTab]);

  const isStudent = user?.role === 'student';

  const [form, setForm] = useState({
    name: isStudent ? 'Sautrik Roy' : 'Dr. Rajesh Kumar',
    reg: isStudent ? 'RA2511003010052' : 'LIB001',
    email: isStudent ? 'sr2025@srmist.edu.in' : 'rajesh.kumar@srmist.edu.in',
    phone: isStudent ? '+91 98765 12345' : '+91 98765 43210',
    designation: isStudent ? 'Student' : 'Head Librarian',
    dept: isStudent ? 'Computer Science & Engineering' : 'Central Library',
    hours: isStudent ? 'N/A' : '08:00 AM - 11:00 PM IST',
    overdueDigests: true,
    studentAlerts: true,
    inventoryAlerts: true,
    weeklyAnalytics: true
  });

  const handleSave = (e) => {
    e.preventDefault();
    playSuccessChime();
    toast.success('Librarian profile settings saved successfully!');
  };

  return (
    <div style={{ maxWidth: 880, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0 }}>
          Settings
        </h1>
        <p style={{ fontSize: 13.5, color: '#64748b', margin: '4px 0 0' }}>
          Manage your library administration profile and system notification preferences
        </p>
      </div>

      {/* Sub Tabs */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #e2e8f0', marginBottom: 24 }}>
        {[
          { id: 'profile', label: 'Profile', icon: UserIcon },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'security', label: 'Security & Access', icon: Lock },
        ].map(t => {
          const Icon = t.icon;
          const active = subTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => { playClick(); setSubTab(t.id); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                border: 'none',
                background: 'none',
                borderBottom: active ? '2px solid #0f172a' : '2px solid transparent',
                color: active ? '#0f172a' : '#64748b',
                fontWeight: active ? 700 : 500,
                fontSize: 13,
                cursor: 'pointer'
              }}
            >
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </div>

      {subTab === 'profile' && (
        <form onSubmit={handleSave} style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 16,
          padding: 28,
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          {/* Avatar Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid #f1f5f9' }}>
            <img
              src={isStudent 
                ? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80" 
                : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"}
              alt="Profile"
              style={{ width: 76, height: 76, borderRadius: '50%', objectFit: 'cover', border: '3px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
            />
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a' }}>{form.name}</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{form.designation} · {form.dept}</div>
              <button
                type="button"
                onClick={() => { playClick(); toast.info('Profile picture upload active.'); }}
                style={{ marginTop: 8, padding: '5px 12px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 12, fontWeight: 600, color: '#475569', cursor: 'pointer' }}
              >
                Change Photo
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 24 }}>
            <div>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>Full Name</label>
              <input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: 13, outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>Employee / Staff ID</label>
              <input
                disabled
                value={form.reg}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f1f5f9', color: '#64748b', fontSize: 13, outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>Official Email Address</label>
              <input
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: 13, outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>Phone Number</label>
              <input
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: 13, outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>Department</label>
              <input
                value={form.dept}
                onChange={e => setForm({ ...form, dept: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: 13, outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>Library Working Hours</label>
              <input
                value={form.hours}
                onChange={e => setForm({ ...form, hours: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: 13, outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              style={{ padding: '10px 22px', borderRadius: 8, background: '#0f172a', color: '#ffffff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}
            >
              Save Changes
            </button>
          </div>
        </form>
      )}

      {subTab === 'notifications' && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 16,
          padding: 28,
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column',
          gap: 18
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 14, borderBottom: '1px solid #f1f5f9' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Overdue Alert Digests</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Automated daily morning batch digest of all delinquent borrowers</div>
            </div>
            <input
              type="checkbox"
              checked={form.overdueDigests}
              onChange={e => setForm({ ...form, overdueDigests: e.target.checked })}
              style={{ width: 18, height: 18, cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 14, borderBottom: '1px solid #f1f5f9' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Student Registration Requests</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Instant alerts when new students apply for library card issuance</div>
            </div>
            <input
              type="checkbox"
              checked={form.studentAlerts}
              onChange={e => setForm({ ...form, studentAlerts: e.target.checked })}
              style={{ width: 18, height: 18, cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 14, borderBottom: '1px solid #f1f5f9' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Low Inventory & Damaged Stock Alerts</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Alert when shelf copies of popular syllabus books fall below 2</div>
            </div>
            <input
              type="checkbox"
              checked={form.inventoryAlerts}
              onChange={e => setForm({ ...form, inventoryAlerts: e.target.checked })}
              style={{ width: 18, height: 18, cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Weekly Circulation Analytics</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Receive weekly executive summary report on circulation metrics via email</div>
            </div>
            <input
              type="checkbox"
              checked={form.weeklyAnalytics}
              onChange={e => setForm({ ...form, weeklyAnalytics: e.target.checked })}
              style={{ width: 18, height: 18, cursor: 'pointer' }}
            />
          </div>
        </div>
      )}

      {subTab === 'security' && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 16,
          padding: 28,
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '0 0 16px' }}>Library Administrative SSO & Security</h3>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
            Your account is authenticated via SRM IST Central Administrative Identity Management (LIB001).
          </p>
          <button
            onClick={() => { playSuccessChime(); toast.success('Administrative access token refreshed.'); }}
            style={{ padding: '10px 18px', borderRadius: 8, background: '#0f172a', color: '#ffffff', fontWeight: 600, fontSize: 13, border: 'none', cursor: 'pointer' }}
          >
            Refresh Admin Security Token
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
// Screen 6: Overdue Books (Mockup Exact)
// ─────────────────────────────────────────────────────────────
const OVERDUE_STUDENTS = [
  { id: 'ov1', num: 1, student: 'Rohan Verma', roll: 'RA2511003010111', book: 'Machine Learning', due: '01 Sep 2025', daysLate: 12, dept: 'CSE', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80' },
  { id: 'ov2', num: 2, student: 'Ananya S', roll: 'RA2511003010222', book: 'Computer Networks', due: '03 Sep 2025', daysLate: 10, dept: 'CSE', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' },
  { id: 'ov3', num: 3, student: 'Vikram K', roll: 'RA2511003010333', book: 'Artificial Intelligence', due: '05 Sep 2025', daysLate: 8, dept: 'ECE', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
  { id: 'ov4', num: 4, student: 'Isha Gupta', roll: 'RA2511003010444', book: 'Modern Web Dev', due: '06 Sep 2025', daysLate: 7, dept: 'CSE', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
  { id: 'ov5', num: 5, student: 'Aditya Rao', roll: 'RA2511003010555', book: 'Discrete Mathematics', due: '08 Sep 2025', daysLate: 5, dept: 'EEE', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80' },
];

function OverdueManagement({ onNavigate = () => {} }) {
  const [list, setList] = useState(OVERDUE_STUDENTS);
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('All');
  const [sort, setSort] = useState('Days Late');
  const [notifiedIds, setNotifiedIds] = useState([]);

  const handleNotify = (item) => {
    playClick();
    setNotifiedIds(prev => [...prev, item.id]);
    playSuccessChime();
    toast.success(`Notification & SMS alert dispatched to ${item.student} (${item.roll}) for "${item.book}"`);
  };

  const filtered = list.filter(item => {
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const match = item.student.toLowerCase().includes(q) ||
                    item.roll.toLowerCase().includes(q) ||
                    item.book.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (dept !== 'All' && item.dept !== dept) return false;
    return true;
  }).sort((a, b) => {
    if (sort === 'Days Late') return b.daysLate - a.daysLate;
    if (sort === 'Student Name') return a.student.localeCompare(b.student);
    return 0;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header matching Screen 6 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <BackButton onClick={() => onNavigate('dashboard')} label="Dashboard" />
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Overdue Books
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '3px 0 0' }}>
            View and manage all overdue books
          </p>
        </div>
      </div>

      {/* 4 Summary Metric Tiles matching Screen 6 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c' }}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>47</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginTop: 2 }}>Total Overdue</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
            <Clock size={20} />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>12</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginTop: 2 }}>1-7 days</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>20</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginTop: 2 }}>8-14 days</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>15</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginTop: 2 }}>&gt; 14 days</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 12px', flex: '1 1 300px' }}>
          <Search size={15} color="#94a3b8" />
          <input
            placeholder="Search by student, book title..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ background: 'transparent', border: 'none', outline: 'none', color: '#0f172a', fontSize: 13, width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12.5, color: '#64748b', fontWeight: 600 }}>Department:</span>
          <select
            value={dept}
            onChange={e => { playClick(); setDept(e.target.value); }}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 12.5, color: '#0f172a', fontWeight: 600, outline: 'none', cursor: 'pointer' }}
          >
            <option value="All">All Departments</option>
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
            <option value="EEE">EEE</option>
            <option value="IT">IT</option>
            <option value="ME">ME</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12.5, color: '#64748b', fontWeight: 600 }}>Sort by:</span>
          <select
            value={sort}
            onChange={e => { playClick(); setSort(e.target.value); }}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 12.5, color: '#0f172a', fontWeight: 600, outline: 'none', cursor: 'pointer' }}
          >
            <option value="Days Late">Days Late</option>
            <option value="Student Name">Student Name</option>
          </select>
        </div>
      </div>

      {/* Table matching Screen 6 */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#64748b', width: 40 }}>#</th>
              <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#64748b' }}>Student</th>
              <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#64748b' }}>Roll Number</th>
              <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#64748b' }}>Book</th>
              <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#64748b' }}>Due Date</th>
              <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#64748b' }}>Days Late</th>
              <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#64748b', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, idx) => {
              const isNotified = notifiedIds.includes(item.id);
              return (
                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 18px', fontSize: 13, color: '#64748b', fontWeight: 600 }}>
                    {idx + 1}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <img src={item.avatar} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                      <span style={{ fontWeight: 700, fontSize: 13.5, color: '#0f172a' }}>{item.student}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#475569' }}>
                    {item.roll}
                  </td>
                  <td style={{ padding: '14px 18px', fontSize: 13, color: '#0f172a', fontWeight: 600 }}>
                    {item.book}
                  </td>
                  <td style={{ padding: '14px 18px', fontSize: 12.5, color: '#64748b' }}>
                    {item.due}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 10px',
                      borderRadius: 999,
                      background: '#fef2f2',
                      color: '#ef4444',
                      fontWeight: 700,
                      fontSize: 12
                    }}>
                      {item.daysLate} days overdue
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleNotify(item)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 6,
                        border: isNotified ? '1px solid #10b981' : '1px solid #e2e8f0',
                        background: isNotified ? '#ecfdf5' : '#f8fafc',
                        color: isNotified ? '#059669' : '#0f172a',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {isNotified ? 'Notified ✓' : 'Notify'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Master Admin Panel Component
// ─────────────────────────────────────────────────────────────
export default function AdminPanel({ defaultTab = 'students', initialSubTab = 'profile', onNavigate = () => {} }) {
  const [activeSection, setActiveSection] = useState(defaultTab);
  const [showAddBook, setShowAddBook] = useState(false);

  useEffect(() => {
    if (defaultTab) {
      setActiveSection(defaultTab);
    }
  }, [defaultTab]);

  const SECTIONS = [
    { id: 'students', label: 'Students', icon: Users },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'add_book', label: 'Add Book', icon: Plus },
    { id: 'overdue', label: 'Overdue Audit', icon: AlertTriangle },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 40 }}>
      {/* Top Header Row with Back Button & Tab Switcher Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
        <BackButton onClick={() => onNavigate('dashboard')} />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {SECTIONS.map(s => {
            const Icon = s.icon;
            const isActive = activeSection === s.id;
            return (
              <button
                key={s.id}
                onClick={() => { playClick(); setActiveSection(s.id); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 18px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  background: isActive ? '#0f172a' : '#ffffff',
                  color: isActive ? '#ffffff' : '#64748b',
                  boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : '0 1px 2px rgba(0,0,0,0.02)',
                  border: isActive ? '1px solid #0f172a' : '1px solid #e2e8f0'
                }}
              >
                <Icon size={15} />
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Active Tab */}
      {activeSection === 'students' && <StudentManagement onNavigate={onNavigate} />}
      {activeSection === 'reports' && <ReportsAnalytics onNavigate={onNavigate} />}
      {activeSection === 'add_book' && <AddBookForm onBookAdded={() => setActiveSection('students')} />}
      {activeSection === 'overdue' && <OverdueManagement onNavigate={onNavigate} />}
      {activeSection === 'settings' && <SettingsProfile initialSubTab={initialSubTab} />}
    </div>
  );
}
