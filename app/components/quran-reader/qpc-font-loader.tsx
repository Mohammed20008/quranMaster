'use client';

import React from 'react';

interface QPCFontLoaderProps {
  pages: number[];
}

export default function QPCFontLoader({ pages }: QPCFontLoaderProps) {
  if (!pages || pages.length === 0) return null;
  
  // Deduplicate pages
  const uniquePages = Array.from(new Set(pages)).filter(p => p > 0);

  return (
    <style dangerouslySetInnerHTML={{ __html: `
      ${uniquePages.map(page => `
        @font-face {
          font-family: 'QPC_Page_${page}';
          src: url('/fonts/qpc/p${page}.woff2') format('woff2');
          font-display: swap;
        }
        .qpc-page-${page} {
          font-family: 'QPC_Page_${page}', sans-serif !important;
        }
      `).join('\n')}
    `}} />
  );
}
