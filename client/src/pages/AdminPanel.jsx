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
  PieChart
} from 'lucide-react';
import { books as booksApi, transactions as txApi, stats as statsApi, exportData } from '../api';
import { useAuth } from '../context/AuthContext';
import { toast } from '../context/ToastContext';
import { playClick, playSuccessChime } from '../utils/audio';

// ─────────────────────────────────────────────────────────────
// Panel 10: Add New Book Form
// ─────────────────────────────────────────────────────────────
function AddBookForm({ onBookAdded, onCancel }) {
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
      await booksApi.create({
        ...form,
        available_copies: form.total_copies
      });
      playSuccessChime();
      toast.success(`Book "${form.title}" added to library catalog!`);
      onBookAdded?.();
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
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Panel 11: Student Management
// ─────────────────────────────────────────────────────────────
const INITIAL_STUDENTS = [
  { id: '1', name: 'Sautrik Roy', reg: 'RA2511003010052', dept: 'Computer Science', year: '2nd Year', borrowed: 2, max: 4, status: 'Active', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80' },
  { id: '2', name: 'Rahul Verma', reg: 'RA2111003010124', dept: 'Computer Science', year: '4th Year', borrowed: 1, max: 4, status: 'Active', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80' },
  { id: '3', name: 'Priya Sharma', reg: 'RA2211003010452', dept: 'Information Technology', year: '3rd Year', borrowed: 3, max: 4, status: 'Active', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' },
  { id: '4', name: 'Aditya Nair', reg: 'RA2311003010219', dept: 'Electronics & Comm.', year: '2nd Year', borrowed: 0, max: 4, status: 'Active', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
  { id: '5', name: 'Sneha Kulkarni', reg: 'RA2011003010871', dept: 'Mechanical Engineering', year: 'Graduated', borrowed: 0, max: 4, status: 'Inactive', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80' },
  { id: '6', name: 'Rohan Deshmukh', reg: 'RA2411003010091', dept: 'Biotechnology', year: '1st Year', borrowed: 1, max: 4, status: 'Active', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80' },
];

function StudentManagement() {
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', reg: '', dept: 'Computer Science', year: '1st Year' });

  const filtered = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.reg.toLowerCase().includes(search.toLowerCase()) ||
    s.dept.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.reg) return;
    setStudents(prev => [
      {
        id: Date.now().toString(),
        name: newStudent.name,
        reg: newStudent.reg.toUpperCase(),
        dept: newStudent.dept,
        year: newStudent.year,
        borrowed: 0,
        max: 4,
        status: 'Active',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
      },
      ...prev
    ]);
    setShowAddModal(false);
    setNewStudent({ name: '', reg: '', dept: 'Computer Science', year: '1st Year' });
    playSuccessChime();
    toast.success('New student registered in library system!');
  };

  const toggleStatus = (id) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'Active' ? 'Inactive' : 'Active' } : s));
  };

  return (
    <div>
      {/* Header matching Panel 11 */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.4px' }}>
            Student Management
          </h1>
          <p style={{ fontSize: 13.5, color: '#64748b', margin: '4px 0 0' }}>
            Manage registered students, issue cards, and view borrowing status
          </p>
        </div>

        <button
          onClick={() => { playClick(); setShowAddModal(true); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            borderRadius: 10,
            background: '#0f172a',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: 13,
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <Plus size={16} /> Add Student
        </button>
      </div>

      {/* Search Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 10,
        padding: '8px 14px',
        maxWidth: 420,
        marginBottom: 20
      }}>
        <Search size={16} color="#94a3b8" />
        <input
          placeholder="Search by student name, registration number, or dept..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ background: 'transparent', border: 'none', outline: 'none', color: '#0f172a', fontSize: 13, flex: 1 }}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={14} />
          </button>
        )}
      </div>

      {/* Students Data Table matching Panel 11 */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 18px', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Student Name</th>
                <th style={{ padding: '12px 18px', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Reg Number</th>
                <th style={{ padding: '12px 18px', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Department</th>
                <th style={{ padding: '12px 18px', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Academic Year</th>
                <th style={{ padding: '12px 18px', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Books Issued</th>
                <th style={{ padding: '12px 18px', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Status</th>
                <th style={{ padding: '12px 18px', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(student => (
                <tr key={student.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <img
                        src={student.avatar}
                        alt=""
                        style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                      />
                      <span style={{ fontWeight: 700, fontSize: 13.5, color: '#0f172a' }}>{student.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#475569' }}>
                    {student.reg}
                  </td>
                  <td style={{ padding: '14px 18px', fontSize: 13, color: '#334155' }}>
                    {student.dept}
                  </td>
                  <td style={{ padding: '14px 18px', fontSize: 13, color: '#64748b' }}>
                    {student.year}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{
                      fontWeight: 700,
                      fontSize: 12.5,
                      color: student.borrowed > 0 ? '#2563eb' : '#64748b'
                    }}>
                      {student.borrowed} / {student.max}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 9px',
                      borderRadius: 999,
                      background: student.status === 'Active' ? '#ecfdf5' : '#f1f5f9',
                      color: student.status === 'Active' ? '#16a34a' : '#64748b'
                    }}>
                      {student.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <button
                      onClick={() => toggleStatus(student.id)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 6,
                        border: '1px solid #e2e8f0',
                        background: '#ffffff',
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#475569',
                        cursor: 'pointer'
                      }}
                    >
                      {student.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16,
            width: '100%', maxWidth: 440, padding: 24, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 16px' }}>Add Registered Student</h3>
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
                  placeholder="e.g. RA2311003010499"
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
                    {['Computer Science', 'Information Technology', 'Electronics & Comm.', 'Mechanical', 'Biotechnology', 'Management'].map(d => (
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
                    {['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgrad'].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#ffffff', color: '#64748b', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#0f172a', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}
                >
                  Save Student
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

function ReportsAnalytics() {
  const [dateRange, setDateRange] = useState('30days');
  const [reportType, setReportType] = useState('circulation');
  const [hoveredBar, setHoveredBar] = useState(null);
  const [hoveredCat, setHoveredCat] = useState(null);

  const [finesList, setFinesList] = useState([
    { id: 'F101', reg: 'RA2511003010112', name: 'Aarav Sharma', book: 'Clean Code', daysOverdue: 6, fine: 120, status: 'Pending' },
    { id: 'F102', reg: 'RA2511003010098', name: 'Sneha Patil', book: 'Operating System Concepts', daysOverdue: 4, fine: 80, status: 'Pending' },
    { id: 'F103', reg: 'RA2511003010245', name: 'Vikram Menon', book: 'Database System Concepts', daysOverdue: 9, fine: 180, status: 'Pending' },
    { id: 'F104', reg: 'RA2511003010331', name: 'Rohan Gupta', book: 'Computer Networks', daysOverdue: 2, fine: 40, status: 'Paid' },
    { id: 'F105', reg: 'RA2511003010419', name: 'Ananya Iyer', book: 'Artificial Intelligence', daysOverdue: 7, fine: 140, status: 'Pending' },
  ]);

  const handleCollectFine = (id, name, amount) => {
    playCheckout();
    setFinesList(prev => prev.map(f => f.id === id ? { ...f, status: 'Paid' } : f));
    toast.success(`Collected ₹${amount} fine from ${name}`);
  };

  const handleWaiveFine = (id, name) => {
    playClick();
    setFinesList(prev => prev.map(f => f.id === id ? { ...f, status: 'Waived' } : f));
    toast.info(`Fine waived for ${name} under institutional discretion`);
  };

  const data = REPORT_METRICS[dateRange] || REPORT_METRICS['30days'];
  const maxBarVal = Math.max(...data.bars.flatMap(b => [b.issued, b.returned])) * 1.15;

  const handleExportCsv = () => {
    playClick();
    const csvRows = [
      ['Metric', 'Value', 'Range', 'Report Type'],
      ['Total Issues', data.issues, dateRange, reportType],
      ['Active Readers', data.readers, dateRange, reportType],
      ['Return Rate', data.returnRate, dateRange, reportType],
      ['Overdue Rate', data.overdueRate, dateRange, reportType],
      ['Delinquent Titles', data.overdueCount, dateRange, reportType],
      [],
      ['Category', 'Percentage', 'Volume Count'],
      ...data.categories.map(c => [c.name, `${c.pct}%`, c.count]),
      [],
      ['Period', 'Issues', 'Returns'],
      ...data.bars.map(b => [b.m, b.issued, b.returned])
    ];

    const csvContent = csvRows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `librax-${reportType}-report-${dateRange}-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Circulation report (${dateRange}) downloaded as CSV`);
  };

  const handleExportExcel = () => {
    playClick();
    const tsvRows = [
      ['INSTITUTIONAL LIBRARY CIRCULATION REPORT', '', ''],
      ['Generated On', new Date().toLocaleString(), ''],
      ['Date Range', dateRange, ''],
      ['Report Mode', reportType, ''],
      [],
      ['KEY PERFORMANCE METRIC', 'RECORDED STAT', 'GROWTH INDEX'],
      ['Total Volumes Issued', data.issues, data.issuesDiff],
      ['Active Student Readers', data.readers, data.readersDiff],
      ['On-Time Return Rate', data.returnRate, 'Institutional Benchmark: 95%'],
      ['Delinquent Overdue Rate', data.overdueRate, `${data.overdueCount} Flagged Accounts`],
      [],
      ['CATEGORY BREAKDOWN', 'PERCENT SHARE', 'STOCK VOLUMES'],
      ...data.categories.map(c => [c.name, `${c.pct}%`, c.count]),
      [],
      ['TIMELINE ACTIVITY', 'CHECKOUTS', 'RETURNS'],
      ...data.bars.map(b => [b.m, b.issued, b.returned])
    ];

    const tsvContent = tsvRows.map(r => r.join('\t')).join('\n');
    const blob = new Blob([tsvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `librax-institutional-ledger-${dateRange}-${Date.now()}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Full institutional ledger (${dateRange}) downloaded as Excel`);
  };

  return (
    <div>
      {/* Header matching Panel 13 */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.4px' }}>
            Library Reports & Analytics
          </h1>
          <p style={{ fontSize: 13.5, color: '#64748b', margin: '4px 0 0' }}>
            Comprehensive statistics and circulation metrics for SRM IST Central Library
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handleExportCsv}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#ffffff', color: '#0f172a', fontWeight: 600, fontSize: 12.5, cursor: 'pointer' }}
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            onClick={handleExportExcel}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 8, border: 'none', background: '#0f172a', color: '#ffffff', fontWeight: 600, fontSize: 12.5, cursor: 'pointer' }}
          >
            <FileSpreadsheet size={14} /> Export Excel
          </button>
        </div>
      </div>

      {/* Filter Controls Bar matching Panel 13 */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        padding: '14px 20px',
        display: 'flex',
        gap: 16,
        alignItems: 'center',
        marginBottom: 24,
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: '#64748b' }}>Date Range:</span>
          <select
            value={dateRange}
            onChange={e => { playClick(); setDateRange(e.target.value); }}
            style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 12.5, color: '#0f172a', fontWeight: 600, cursor: 'pointer', outline: 'none' }}
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="semester">This Semester</option>
            <option value="year">Full Academic Year</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: '#64748b' }}>Report Type:</span>
          <select
            value={reportType}
            onChange={e => { playClick(); setReportType(e.target.value); }}
            style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 12.5, color: '#0f172a', fontWeight: 600, cursor: 'pointer', outline: 'none' }}
          >
            <option value="circulation">Circulation Summary</option>
            <option value="categories">Category Distribution</option>
            <option value="fines">Overdue & Fine Recovery</option>
          </select>
        </div>

        <div style={{ marginLeft: 'auto', fontSize: 12, color: '#64748b' }}>
          Showing verified institutional telemetry
        </div>
      </div>

      {/* 4 Analytics KPI Cards (Dynamic) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Total Issues</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>{data.issues}</div>
          <div style={{ fontSize: 11.5, color: '#16a34a', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <TrendingUp size={12} /> {data.issuesDiff} from previous
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Active Readers</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>{data.readers}</div>
          <div style={{ fontSize: 11.5, color: '#16a34a', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <TrendingUp size={12} /> {data.readersDiff} active borrowers
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Return Rate</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>{data.returnRate}</div>
          <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 4 }}>On-time checkout recovery</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Overdue Rate</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#ef4444', marginTop: 4 }}>{data.overdueRate}</div>
          <div style={{ fontSize: 11.5, color: '#ef4444', marginTop: 4 }}>{data.overdueCount} delinquent accounts</div>
        </div>
      </div>

      {/* 2 Visual Charts: Books by Category (Donut) & Monthly Activity (Bar) matching Panel 13 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.4fr)', gap: 24, marginBottom: 28 }}>
        {/* Left: Donut Chart - Books by Category */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>Books by Category</h3>
            <span style={{ fontSize: 11.5, color: '#64748b' }}>Hover to inspect</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', height: 180, marginBottom: 16 }}>
            {/* SVG Donut with dynamic stroke dasharrays */}
            <svg width="170" height="170" viewBox="0 0 42 42">
              <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#f1f5f9" strokeWidth="6" />
              {/* Computer Science */}
              <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#0f172a" strokeWidth="6" strokeDasharray={`${data.categories[0].pct} ${100 - data.categories[0].pct}`} strokeDashoffset="25" />
              {/* Electronics */}
              <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#3b82f6" strokeWidth="6" strokeDasharray={`${data.categories[1].pct} ${100 - data.categories[1].pct}`} strokeDashoffset={`${100 - data.categories[0].pct + 25}`} />
              {/* Mechanical */}
              <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#10b981" strokeWidth="6" strokeDasharray={`${data.categories[2].pct} ${100 - data.categories[2].pct}`} strokeDashoffset={`${100 - data.categories[0].pct - data.categories[1].pct + 25}`} />
              {/* Others */}
              <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#f59e0b" strokeWidth="6" strokeDasharray={`${data.categories[3].pct} ${100 - data.categories[3].pct}`} strokeDashoffset={`${100 - data.categories[0].pct - data.categories[1].pct - data.categories[2].pct + 25}`} />
            </svg>
            <div style={{ position: 'absolute', textAlign: 'center', pointerEvents: 'none' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                {hoveredCat ? `${hoveredCat.pct}%` : data.totalBooks}
              </div>
              <div style={{ fontSize: 10.5, color: '#64748b' }}>
                {hoveredCat ? hoveredCat.name : 'Total Books'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
            {data.categories.map(cat => (
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
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: cat.color }} />
                  {cat.name}
                </span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>
                  {cat.pct}% ({cat.count.toLocaleString()})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Monthly Activity Multi-Bar Chart */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Circulation Activity ({dateRange})
              </h3>
              <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                Issues vs. Returns over the selected interval
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, fontSize: 11.5 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#0f172a' }} /> Issued</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#10b981' }} /> Returned</span>
            </div>
          </div>

          {/* Bar Chart Bars with Hover Tooltip */}
          <div style={{ height: 210, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, paddingBottom: 24, borderBottom: '1px solid #f1f5f9', position: 'relative' }}>
            {data.bars.map(col => (
              <div 
                key={col.m} 
                onMouseEnter={() => setHoveredBar(col)}
                onMouseLeave={() => setHoveredBar(null)}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end', position: 'relative', cursor: 'pointer' }}
              >
                {hoveredBar?.m === col.m && (
                  <div style={{
                    position: 'absolute',
                    top: 10,
                    background: '#0f172a',
                    color: '#ffffff',
                    padding: '4px 8px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    zIndex: 10,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}>
                    {col.m}: {col.issued} issues · {col.returned} returns
                  </div>
                )}
                <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: '100%' }}>
                  <div style={{
                    width: 14,
                    height: `${Math.min(100, Math.max(12, (col.issued / maxBarVal) * 100))}%`,
                    background: '#0f172a',
                    borderRadius: '4px 4px 0 0',
                    transition: 'all 200ms'
                  }} />
                  <div style={{
                    width: 14,
                    height: `${Math.min(100, Math.max(12, (col.returned / maxBarVal) * 100))}%`,
                    background: '#10b981',
                    borderRadius: '4px 4px 0 0',
                    transition: 'all 200ms'
                  }} />
                </div>
                <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>{col.m}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Report Section based on reportType */}
      {reportType === 'circulation' && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Top Borrowed Books Leaderboard ({dateRange})
              </h3>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                Most requested catalog volumes and shelf utilization rates
              </div>
            </div>
            <span style={{ fontSize: 11.5, fontWeight: 700, background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: 6 }}>
              SRM IST Central Library
            </span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 20px', fontSize: 11.5, fontWeight: 700, color: '#64748b' }}>RANK</th>
                <th style={{ padding: '12px 20px', fontSize: 11.5, fontWeight: 700, color: '#64748b' }}>BOOK & AUTHOR</th>
                <th style={{ padding: '12px 20px', fontSize: 11.5, fontWeight: 700, color: '#64748b' }}>CATEGORY</th>
                <th style={{ padding: '12px 20px', fontSize: 11.5, fontWeight: 700, color: '#64748b' }}>TIMES ISSUED</th>
                <th style={{ padding: '12px 20px', fontSize: 11.5, fontWeight: 700, color: '#64748b' }}>UTILIZATION</th>
                <th style={{ padding: '12px 20px', fontSize: 11.5, fontWeight: 700, color: '#64748b' }}>AVAILABILITY</th>
              </tr>
            </thead>
            <tbody>
              {[
                { rank: '#1', title: 'Clean Code: A Handbook of Agile Craftsmanship', author: 'Robert C. Martin', cat: 'Computer Science', count: 342, util: '98%', status: 'In Demand', badgeBg: '#ecfdf5', badgeCol: '#16a34a' },
                { rank: '#2', title: 'Operating System Concepts (10th Edition)', author: 'Silberschatz & Galvin', cat: 'Computer Science', count: 298, util: '94%', status: 'In Demand', badgeBg: '#ecfdf5', badgeCol: '#16a34a' },
                { rank: '#3', title: 'Introduction to Algorithms (CLRS)', author: 'Thomas H. Cormen', cat: 'Computer Science', count: 275, util: '91%', status: 'Active', badgeBg: '#f8fafc', badgeCol: '#334155' },
                { rank: '#4', title: 'Database System Concepts', author: 'Abraham Silberschatz', cat: 'Computer Science', count: 214, util: '86%', status: 'Active', badgeBg: '#f8fafc', badgeCol: '#334155' },
                { rank: '#5', title: 'Computer Networks: A Top-Down Approach', author: 'James F. Kurose', cat: 'Computer Science', count: 189, util: '82%', status: 'Active', badgeBg: '#f8fafc', badgeCol: '#334155' },
                { rank: '#6', title: 'Digital Design & Computer Architecture', author: 'David Harris', cat: 'Electronics', count: 145, util: '76%', status: 'Available', badgeBg: '#f0fdf4', badgeCol: '#15803d' }
              ].map(row => (
                <tr key={row.rank} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 800, color: '#0f172a' }}>{row.rank}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{row.title}</div>
                    <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>{row.author}</div>
                  </td>
                  <td style={{ padding: '14px 20px', color: '#475569' }}>{row.cat}</td>
                  <td style={{ padding: '14px 20px', fontWeight: 700, color: '#0f172a' }}>{row.count} issues</td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 60, height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: row.util, height: '100%', background: '#0f172a', borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{row.util}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: row.badgeCol, background: row.badgeBg, padding: '3px 8px', borderRadius: 6 }}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {reportType === 'categories' && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9' }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Category Stock & Turnover Telemetry
            </h3>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              Inventory distribution, checkout velocity, and active stack quotas
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 20px', fontSize: 11.5, fontWeight: 700, color: '#64748b' }}>DEPARTMENT</th>
                <th style={{ padding: '12px 20px', fontSize: 11.5, fontWeight: 700, color: '#64748b' }}>TOTAL VOLUMES</th>
                <th style={{ padding: '12px 20px', fontSize: 11.5, fontWeight: 700, color: '#64748b' }}>CATALOG SHARE</th>
                <th style={{ padding: '12px 20px', fontSize: 11.5, fontWeight: 700, color: '#64748b' }}>ACTIVE LOANS</th>
                <th style={{ padding: '12px 20px', fontSize: 11.5, fontWeight: 700, color: '#64748b' }}>CIRCULATION VELOCITY</th>
              </tr>
            </thead>
            <tbody>
              {data.categories.map(c => (
                <tr key={c.name} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: c.color }} />
                    {c.name}
                  </td>
                  <td style={{ padding: '14px 20px', fontWeight: 700, color: '#0f172a' }}>{c.count.toLocaleString()} books</td>
                  <td style={{ padding: '14px 20px', color: '#475569' }}>{c.pct}% of total stack</td>
                  <td style={{ padding: '14px 20px', color: '#16a34a', fontWeight: 600 }}>{Math.round(c.count * 0.28).toLocaleString()} on loan</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ fontSize: 11.5, fontWeight: 700, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a', padding: '3px 8px', borderRadius: 6 }}>
                      High Velocity ({Math.round(c.pct * 1.8)}% / mo)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {reportType === 'fines' && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Overdue Penalties & Fine Recovery Ledger
              </h3>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                Real-time collection management for delinquent book checkout accounts
              </div>
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#b91c1c', background: '#fef2f2', padding: '6px 12px', borderRadius: 8 }}>
              ₹20 / day institutional grace rate
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 20px', fontSize: 11.5, fontWeight: 700, color: '#64748b' }}>STUDENT</th>
                <th style={{ padding: '12px 20px', fontSize: 11.5, fontWeight: 700, color: '#64748b' }}>TITLE OVERDUE</th>
                <th style={{ padding: '12px 20px', fontSize: 11.5, fontWeight: 700, color: '#64748b' }}>DAYS OVERDUE</th>
                <th style={{ padding: '12px 20px', fontSize: 11.5, fontWeight: 700, color: '#64748b' }}>FINE ACCRUED</th>
                <th style={{ padding: '12px 20px', fontSize: 11.5, fontWeight: 700, color: '#64748b' }}>STATUS</th>
                <th style={{ padding: '12px 20px', fontSize: 11.5, fontWeight: 700, color: '#64748b' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {finesList.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.name}</div>
                    <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>{item.reg}</div>
                  </td>
                  <td style={{ padding: '14px 20px', fontWeight: 600, color: '#334155' }}>{item.book}</td>
                  <td style={{ padding: '14px 20px', color: '#ef4444', fontWeight: 700 }}>{item.daysOverdue} days</td>
                  <td style={{ padding: '14px 20px', fontWeight: 800, color: '#0f172a' }}>₹{item.fine}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: item.status === 'Paid' ? '#16a34a' : item.status === 'Waived' ? '#64748b' : '#ea580c',
                      background: item.status === 'Paid' ? '#ecfdf5' : item.status === 'Waived' ? '#f1f5f9' : '#fffbeb',
                      padding: '3px 8px',
                      borderRadius: 6
                    }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    {item.status === 'Pending' ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => handleCollectFine(item.id, item.name, item.fine)}
                          style={{
                            padding: '5px 12px',
                            borderRadius: 6,
                            border: 'none',
                            background: '#0f172a',
                            color: '#ffffff',
                            fontWeight: 600,
                            fontSize: 12,
                            cursor: 'pointer'
                          }}
                        >
                          Collect
                        </button>
                        <button
                          onClick={() => handleWaiveFine(item.id, item.name)}
                          style={{
                            padding: '5px 10px',
                            borderRadius: 6,
                            border: '1px solid #e2e8f0',
                            background: '#ffffff',
                            color: '#64748b',
                            fontWeight: 600,
                            fontSize: 12,
                            cursor: 'pointer'
                          }}
                        >
                          Waive
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>Settled</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Panel 15: Settings / Profile
// ─────────────────────────────────────────────────────────────
function SettingsProfile({ initialSubTab = 'profile' }) {
  const { user } = useAuth();
  const [subTab, setSubTab] = useState(initialSubTab);

  useEffect(() => {
    if (initialSubTab) setSubTab(initialSubTab);
  }, [initialSubTab]);

  const isStudent = user?.role === 'student';

  const [form, setForm] = useState({
    name: isStudent ? 'Sautrik Roy' : (user?.name || 'Central Librarian'),
    reg: isStudent ? 'RA2511003010052' : 'LIB-SRM-042',
    email: isStudent ? 'sr2025@srmist.edu.in' : 'library@srmist.edu.in',
    dept: isStudent ? 'Computer Science & Engineering' : 'Central Library Administration',
    joined: 'August 2023',
    emailReminders: true,
    smsAlerts: false,
    weeklyDigest: true
  });

  const handleSave = (e) => {
    e.preventDefault();
    playSuccessChime();
    toast.success('Account settings saved successfully!');
  };

  return (
    <div style={{ maxWidth: 840, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0 }}>
          Account Settings
        </h1>
        <p style={{ fontSize: 13.5, color: '#64748b', margin: '4px 0 0' }}>
          Manage your library portal profile and notification preferences
        </p>
      </div>

      {/* Sub Tabs */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #e2e8f0', marginBottom: 24 }}>
        {[
          { id: 'profile', label: 'Profile', icon: UserIcon },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'security', label: 'Security', icon: Lock },
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
              src={isStudent ? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80" : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"}
              alt="Profile"
              style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }}
            />
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{form.name}</div>
              <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 2 }}>{form.reg} · {form.dept}</div>
              <button
                type="button"
                onClick={() => toast.info('Avatar photo update active')}
                style={{ marginTop: 8, padding: '4px 10px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 12, fontWeight: 600, color: '#475569', cursor: 'pointer' }}
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
              <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>Registration / Staff ID</label>
              <input
                disabled
                value={form.reg}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f1f5f9', color: '#64748b', fontSize: 13, outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>Institutional Email</label>
              <input
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
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
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Due Date Email Reminders</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Receive notifications 3 days before a book loan is due</div>
            </div>
            <input
              type="checkbox"
              checked={form.emailReminders}
              onChange={e => setForm({ ...form, emailReminders: e.target.checked })}
              style={{ width: 18, height: 18, cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 14, borderBottom: '1px solid #f1f5f9' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>SMS Overdue Alerts</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Instant mobile text warnings for delinquent loans</div>
            </div>
            <input
              type="checkbox"
              checked={form.smsAlerts}
              onChange={e => setForm({ ...form, smsAlerts: e.target.checked })}
              style={{ width: 18, height: 18, cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Weekly Library Digest</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Curated newsletter of newly acquired titles in your discipline</div>
            </div>
            <input
              type="checkbox"
              checked={form.weeklyDigest}
              onChange={e => setForm({ ...form, weeklyDigest: e.target.checked })}
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
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '0 0 16px' }}>Password & Authentication</h3>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
            SRM IST Identity & Access Management coordinates your central library single sign-on credentials.
          </p>
          <button
            onClick={() => toast.success('Password reset link sent to your SRM IST email')}
            style={{ padding: '10px 18px', borderRadius: 8, background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#0f172a', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
          >
            Request Password Reset
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Overdue Audit Tab
// ─────────────────────────────────────────────────────────────
function OverdueManagement() {
  const [overdue, setOverdue] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOverdue = async () => {
    setLoading(true);
    try {
      const data = await statsApi.get();
      setOverdue(data.overdue_books || []);
    } catch (err) {
      toast.error('Failed to load overdue radar data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOverdue(); }, []);

  const handleReturn = async (txId, waive = false) => {
    try {
      const res = await txApi.return({ transaction_id: txId, waive_fine: waive });
      playSuccessChime();
      toast.success(res.message);
      fetchOverdue();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
      marginBottom: 28
    }}>
      <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: '#fef2f2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertTriangle size={18} color="#ef4444" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 16, color: '#0f172a' }}>Active Overdue Audit</span>
          {overdue.length > 0 && (
            <span style={{ background: '#fef2f2', color: '#ef4444', borderRadius: 999, padding: '2px 8px', fontSize: 11.5, fontWeight: 700 }}>
              {overdue.length} flagged
            </span>
          )}
        </div>
        <button
          onClick={() => { playClick(); fetchOverdue(); }}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#ffffff', color: '#475569', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: '#64748b', fontSize: 13 }}>
          Auditing circulation ledger...
        </div>
      ) : overdue.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <CheckCircle2 size={24} color="#16a34a" />
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Zero Overdue Loans Detected</div>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
            All circulating books are within loan periods or have been returned.
          </div>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 18px', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Book</th>
                <th style={{ padding: '12px 18px', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Borrower</th>
                <th style={{ padding: '12px 18px', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Due Date</th>
                <th style={{ padding: '12px 18px', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Overdue Time</th>
                <th style={{ padding: '12px 18px', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Fine</th>
                <th style={{ padding: '12px 18px', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {overdue.map(item => {
                const days = item.overdue_days || 0;
                const fine = days * 5;
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.title}</div>
                      <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>{item.book_id}</div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.borrower_name}</div>
                      <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>{item.borrower_reg}</div>
                    </td>
                    <td style={{ padding: '14px 18px', color: '#ef4444', fontWeight: 600, fontSize: 13 }}>
                      {new Date(item.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ background: '#fef2f2', color: '#ef4444', padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
                        {days} day{days !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 800, color: '#ef4444', fontSize: 14 }}>
                      ₹{fine}
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          onClick={() => handleReturn(item.transaction_id, false)}
                          style={{ padding: '5px 12px', borderRadius: 6, background: '#0f172a', color: '#ffffff', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                        >
                          Collect
                        </button>
                        <button
                          onClick={() => handleReturn(item.transaction_id, true)}
                          style={{ padding: '5px 10px', borderRadius: 6, background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', fontSize: 12, cursor: 'pointer' }}
                        >
                          Waive
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Master Admin Panel Component
// ─────────────────────────────────────────────────────────────
export default function AdminPanel({ defaultTab = 'students', initialSubTab = 'profile' }) {
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
      {/* Tab Switcher Pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
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

      {/* Render Active Tab */}
      {activeSection === 'students' && <StudentManagement />}
      {activeSection === 'reports' && <ReportsAnalytics />}
      {activeSection === 'add_book' && <AddBookForm onBookAdded={() => setActiveSection('students')} />}
      {activeSection === 'overdue' && <OverdueManagement />}
      {activeSection === 'settings' && <SettingsProfile initialSubTab={initialSubTab} />}
    </div>
  );
}
