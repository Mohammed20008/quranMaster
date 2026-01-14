'use client';

import { useState } from 'react';

const AVATARS = [
  'https://api.dicebear.com/7.x/micah/svg?seed=Abdullah',
  'https://api.dicebear.com/7.x/micah/svg?seed=Fatima',
  'https://api.dicebear.com/7.x/micah/svg?seed=Ahmed',
  'https://api.dicebear.com/7.x/micah/svg?seed=Aisha',
  'https://api.dicebear.com/7.x/micah/svg?seed=Omar',
  'https://api.dicebear.com/7.x/micah/svg?seed=Zainab',
  'https://api.dicebear.com/7.x/micah/svg?seed=Hassan',
  'https://api.dicebear.com/7.x/micah/svg?seed=Layla',
  'https://api.dicebear.com/7.x/micah/svg?seed=Yusuf',
  'https://api.dicebear.com/7.x/micah/svg?seed=Mariam',
  'https://api.dicebear.com/7.x/micah/svg?seed=Ibrahim',
  'https://api.dicebear.com/7.x/micah/svg?seed=Sara',
];

interface AvatarPickerProps {
  currentAvatar: string;
  onSelect: (avatarUrl: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function AvatarPicker({ currentAvatar, onSelect, isOpen, onClose }: AvatarPickerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Choose Avatar</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 grid grid-cols-3 sm:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto">
          {AVATARS.map((avatar) => (
            <button
              key={avatar}
              onClick={() => {
                onSelect(avatar);
                onClose();
              }}
              className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all hover:scale-105 ${
                currentAvatar === avatar 
                  ? 'border-[#d4af37] ring-2 ring-[#d4af37]/30' 
                  : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700'
              }`}
            >
              <img 
                src={avatar} 
                alt="Avatar option" 
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {currentAvatar === avatar && (
                <div className="absolute inset-0 bg-[#d4af37]/20 flex items-center justify-center">
                  <div className="bg-[#d4af37] rounded-full p-1">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
