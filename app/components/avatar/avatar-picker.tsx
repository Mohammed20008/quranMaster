'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Preset avatars with beautiful Islamic/Arabic themed designs
const AVATAR_OPTIONS = [
  // Gradient Circles
  { id: 'gradient-1', type: 'gradient', colors: ['#d4af37', '#b4941f'] },
  { id: 'gradient-2', type: 'gradient', colors: ['#10b981', '#059669'] },
  { id: 'gradient-3', type: 'gradient', colors: ['#3b82f6', '#2563eb'] },
  { id: 'gradient-4', type: 'gradient', colors: ['#8b5cf6', '#7c3aed'] },
  { id: 'gradient-5', type: 'gradient', colors: ['#ec4899', '#db2777'] },
  { id: 'gradient-6', type: 'gradient', colors: ['#f59e0b', '#d97706'] },
  
  // Islamic Patterns (SVG backgrounds)
  { id: 'pattern-1', type: 'pattern', pattern: 'geometric-star', color: '#d4af37' },
  { id: 'pattern-2', type: 'pattern', pattern: 'geometric-star', color: '#10b981' },
  { id: 'pattern-3', type: 'pattern', pattern: 'arabesque', color: '#3b82f6' },
  { id: 'pattern-4', type: 'pattern', pattern: 'arabesque', color: '#8b5cf6' },
  
  // Solid Colors with Initials
  { id: 'solid-1', type: 'solid', color: '#d4af37' },
  { id: 'solid-2', type: 'solid', color: '#10b981' },
  { id: 'solid-3', type: 'solid', color: '#3b82f6' },
  { id: 'solid-4', type: 'solid', color: '#8b5cf6' },
  { id: 'solid-5', type: 'solid', color: '#ec4899' },
  { id: 'solid-6', type: 'solid', color: '#14b8a6' },
];

interface AvatarPickerProps {
  userName: string;
  currentAvatar?: string;
  onSelect: (avatarId: string) => void;
  onUpload?: (file: File) => void;
}

export default function AvatarPicker({ userName, currentAvatar, onSelect, onUpload }: AvatarPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const userInitial = userName ? userName[0].toUpperCase() : 'U';

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpload) {
      setUploading(true);
      try {
        await onUpload(file);
        setIsOpen(false);
      } catch (error) {
        console.error('Upload failed:', error);
      } finally {
        setUploading(false);
      }
    }
  };

  const renderAvatar = (avatar: typeof AVATAR_OPTIONS[0], size: 'small' | 'large' = 'small') => {
    const dimension = size === 'small' ? '60px' : '120px';
    const fontSize = size === 'small' ? '1.5rem' : '3rem';

    const baseStyle: React.CSSProperties = {
      width: dimension,
      height: dimension,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize,
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    };

    if (avatar.type === 'gradient' && avatar.colors) {
      return (
        <div style={{
          ...baseStyle,
          background: `linear-gradient(135deg, ${avatar.colors[0]}, ${avatar.colors[1]})`,
        }}>
          {userInitial}
        </div>
      );
    }

    if (avatar.type === 'pattern' && avatar.color) {
      return (
        <div style={{
          ...baseStyle,
          background: avatar.color,
          backgroundImage: avatar.pattern === 'geometric-star' 
            ? `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0L24 16L40 20L24 24L20 40L16 24L0 20L16 16z' fill='rgba(255,255,255,0.1)'/%3E%3C/svg%3E")`
            : `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='20' fill='none' stroke='rgba(255,255,255,0.1)' stroke-width='2'/%3E%3Ccircle cx='30' cy='30' r='15' fill='none' stroke='rgba(255,255,255,0.1)' stroke-width='2'/%3E%3C/svg%3E")`,
          backgroundSize: avatar.pattern === 'geometric-star' ? '40px 40px' : '60px 60px',
        }}>
          {userInitial}
        </div>
      );
    }

    if (avatar.type === 'solid' && avatar.color) {
      return (
        <div style={{
          ...baseStyle,
          background: avatar.color,
        }}>
          {userInitial}
        </div>
      );
    }

    return null;
  };

  const selectedAvatar = AVATAR_OPTIONS.find(a => a.id === currentAvatar) || AVATAR_OPTIONS[0];

  return (
    <div style={{ position: 'relative' }}>
      {/* Current Avatar Display */}
      <div 
        onClick={() => setIsOpen(true)}
        style={{ 
          position: 'relative',
          cursor: 'pointer',
          display: 'inline-block'
        }}
      >
        {renderAvatar(selectedAvatar, 'large')}
        <div style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          background: 'white',
          borderRadius: '50%',
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          color: '#6b7280'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </div>
      </div>

      {/* Avatar Selection Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                zIndex: 50,
                backdropFilter: 'blur(4px)'
              }}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'white',
                borderRadius: '1.5rem',
                padding: '2rem',
                maxWidth: '500px',
                width: '90%',
                maxHeight: '80vh',
                overflowY: 'auto',
                zIndex: 51,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              }}
            >
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                  Choose Your Avatar
                </h2>
                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                  Select from our beautiful  collection or upload your own photo
                </p>
              </div>

              {/* Avatar Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                {AVATAR_OPTIONS.map((avatar) => (
                  <motion.div
                    key={avatar.id}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      onSelect(avatar.id);
                      setIsOpen(false);
                    }}
                    style={{
                      position: 'relative',
                      padding: '0.5rem'
                    }}
                  >
                    {renderAvatar(avatar, 'small')}
                    {currentAvatar === avatar.id && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        background: '#10b981',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '12px'
                      }}>
                        ✓
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Upload Section */}
              <div style={{
                borderTop: '1px solid #e5e7eb',
                paddingTop: '1.5rem'
              }}>
                <label style={{
                  display: 'block',
                  width: '100%',
                  padding: '1rem',
                  background: '#f3f4f6',
                  borderRadius: '0.75rem',
                  border: '2px dashed #d1d5db',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#e5e7eb';
                    e.currentTarget.style.borderColor = '#9ca3af';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f3f4f6';
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    disabled={uploading}
                  />
                  <div style={{ color: '#6b7280', fontWeight: '600' }}>
                    {uploading ? 'Uploading...' : '📤 Upload Your Own Photo'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                    JPG, PNG or GIF (max 2MB)
                  </div>
                </label>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  marginTop: '1.5rem',
                  width: '100%',
                  padding: '0.75rem',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#e5e7eb'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#f3f4f6'}
              >
                Cancel
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
