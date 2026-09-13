import React, { useState, useRef, useEffect } from 'react';
import { 
  MoreVertical, 
  BookOpen, 
  Bookmark, 
  Heart, 
  Share2, 
  Download, 
  AlertTriangle,
  RotateCcw,
  Check
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { toast } from '../context/ToastContext';
import { playClick } from '../utils/audio';

export default function BookActionMenu({ 
  book, 
  onViewDetails, 
  isBorrowed = false,
  align = 'right',
  buttonStyle = {}
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const { borrowBook, returnBook, wishlist, toggleWishlist, borrowedBooks } = useLibrary();

  const isCurrentlyBorrowed = isBorrowed || borrowedBooks.some(b => b.bookId === book.id || b.id === book.id || b.title === book.title);
  const isWishlisted = wishlist.includes(book.id);

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleToggle = (e) => {
    e.stopPropagation();
    playClick();
    setIsOpen(prev => !prev);
  };

  const handleAction = (actionFn) => (e) => {
    e.stopPropagation();
    playClick();
    setIsOpen(false);
    actionFn();
  };

  const copyShareLink = () => {
    const url = `${window.location.origin}/#book=${book.id || 'BK001'}`;
    navigator.clipboard?.writeText(url).then(() => {
      toast.success(`Copied library link for "${book.title}"!`);
    }).catch(() => {
      toast.info(`Catalog link: ${url}`);
    });
  };

  const downloadCitation = () => {
    const citation = `APA Citation:\n${book.author || 'Author'} (${book.published_year || 2024}). ${book.title}. SRM Institute of Science and Technology Central Library. Shelf: ${book.shelf_location || 'Stacks'}. ISBN: ${book.isbn || 'N/A'}.\n\nBibTeX:\n@book{${(book.id || 'book').toLowerCase()},\n  title={${book.title}},\n  author={${book.author || 'Unknown'}},\n  year={${book.published_year || 2024}},\n  publisher={SRM Central Library}\n}`;
    const blob = new Blob([citation], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(book.title || 'book').replace(/[^a-zA-Z0-9]/g, '_')}-citation.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Citation & book summary downloaded!');
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={menuRef}>
      <button
        type="button"
        onClick={handleToggle}
        title="Book Options"
        style={{
          background: 'none',
          border: 'none',
          color: '#64748b',
          cursor: 'pointer',
          padding: 5,
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 120ms',
          ...buttonStyle
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#0f172a'}
        onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: '100%',
            [align === 'right' ? 'right' : 'left']: 0,
            zIndex: 999,
            marginTop: 6,
            minWidth: 200,
            background: '#ffffff',
            borderRadius: 12,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.16), 0 2px 8px rgba(0, 0, 0, 0.08)',
            border: '1px solid #e2e8f0',
            padding: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            animation: 'fadeIn 120ms ease-out'
          }}
        >
          {/* 1. View Details */}
          {onViewDetails && (
            <button
              type="button"
              onClick={handleAction(() => onViewDetails(book))}
              style={itemStyle}
            >
              <BookOpen size={14} color="#2563eb" />
              <span>View Book Details</span>
            </button>
          )}

          {/* 2. Borrow or Return */}
          {isCurrentlyBorrowed ? (
            <button
              type="button"
              onClick={handleAction(() => returnBook(book))}
              style={itemStyle}
            >
              <RotateCcw size={14} color="#10b981" />
              <span>Return to Stacks</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAction(() => borrowBook(book))}
              style={itemStyle}
            >
              <Bookmark size={14} color="#2563eb" />
              <span>Borrow Copy (14 Days)</span>
            </button>
          )}

          {/* 3. Wishlist Toggle */}
          <button
            type="button"
            onClick={handleAction(() => toggleWishlist(book.id))}
            style={itemStyle}
          >
            <Heart size={14} color="#ec4899" fill={isWishlisted ? '#ec4899' : 'none'} />
            <span>{isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}</span>
          </button>

          <div style={{ height: 1, background: '#f1f5f9', margin: '4px 0' }} />

          {/* 4. Share Link */}
          <button
            type="button"
            onClick={handleAction(copyShareLink)}
            style={itemStyle}
          >
            <Share2 size={14} color="#64748b" />
            <span>Copy Catalog Link</span>
          </button>

          {/* 5. Download Citation */}
          <button
            type="button"
            onClick={handleAction(downloadCitation)}
            style={itemStyle}
          >
            <Download size={14} color="#64748b" />
            <span>Download Citation</span>
          </button>

          {/* 6. Report Shelf Damage */}
          <button
            type="button"
            onClick={handleAction(() => toast.info(`Damage report logged for ${book.title}. Librarian team notified.`))}
            style={{ ...itemStyle, color: '#94a3b8' }}
          >
            <AlertTriangle size={14} color="#cbd5e1" />
            <span style={{ fontSize: 11.5 }}>Report Shelf Damage</span>
          </button>
        </div>
      )}
    </div>
  );
}

const itemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '8px 12px',
  borderRadius: 8,
  background: 'transparent',
  border: 'none',
  width: '100%',
  textAlign: 'left',
  fontSize: 12.5,
  fontWeight: 600,
  color: '#334155',
  cursor: 'pointer',
  transition: 'background 120ms'
};
