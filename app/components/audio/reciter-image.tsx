'use client';

import React, { useState } from 'react';
import styles from './reciter-image.module.css';

interface ReciterImageProps {
  src?: string;
  name: string;
  size?: number;
  className?: string;
}

export default function ReciterImage({ src, name, size = 32, className }: ReciterImageProps) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div 
        className={`${styles.fallback} ${className}`} 
        style={{ width: size, height: size }}
        title={name}
      >
        <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={name} 
      className={className} 
      width={size}
      height={size}
      onError={() => setError(true)}
      style={{ width: size, height: size, objectFit: 'cover', borderRadius: '50%' }}
    />
  );
}
