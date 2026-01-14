'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng, toBlob } from 'html-to-image';
import styles from './share-modal.module.css';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  sourceTitle: string; 
  arabicText: string;
  englishText: string;
  subText?: string; // narrator or subtitle
  initialBg?: string;
  meta: {
    title: string;
    subtitle: string;
  }
}

const SHARE_IMAGES = [
  '/share_img/arabic-calligraphy-5120x2880-15104.jpg',
  '/share_img/cloudy-mountains-7008x4672-19800.jpg',
  '/share_img/colorado-mountain-7680x4320-18548.jpg',
  '/share_img/pexels-samkolder-2387873.jpg',
  '/share_img/rice-fields-agriculture-paddy-fields-landscape-terrace-7301x4873-1247.jpg'
];

// Clean text helpers
function cleanText(text: string): string {
  if (!text) return '';
  return text.replace(/[●⚫⏺•·▪\u25CF\u25CB\u25AA\u25AB\uF0B7]/g, '').trim();
}

export default function ShareModal({
  isOpen,
  onClose,
  title = "Customize Share Card",
  arabicText,
  englishText,
  subText,
  initialBg,
  meta
}: ShareModalProps) {
  
  // State
  const [editorState, setEditorState] = useState({
    bgImage: initialBg || SHARE_IMAGES[0],
    arText: cleanText(arabicText),
    enText: englishText,
    narrator: subText || '',
    arFontSize: 24,
    enFontSize: 16,
    fontFamilyAr: "'Amiri', serif",
    fontFamilyEn: "'Inter', sans-serif",
    overlayOpacity: 0.6,
    textColor: '#ffffff',
    showEnglish: true,
    showArabic: true,
    textAlign: 'center' as 'center' | 'left' | 'right'
  });

  const shareCardRef = useRef<HTMLDivElement>(null);

  // Initialize state when props change
  useEffect(() => {
    if (isOpen) {
      setEditorState(prev => ({
        ...prev,
        arText: cleanText(arabicText),
        enText: englishText,
        narrator: subText || '',
        bgImage: initialBg || SHARE_IMAGES[Math.floor(Math.random() * SHARE_IMAGES.length)],
        fontFamilyAr: "'Amiri', serif"
      }));
    }
  }, [isOpen, arabicText, englishText, subText, initialBg]);

  const filterNode = (node: HTMLElement) => {
    // Optional: add conditional filtering logic here if needed
    return true;
  };

  const getToImageOptions = (skipFonts = false) => ({
    cacheBust: true,
    pixelRatio: 2,
    filter: filterNode,
    skipAutoScale: true,
    skipFonts: skipFonts,
  });

  const downloadShareImage = async () => {
    if (shareCardRef.current) {
      try {
        let dataUrl;
        try {
           dataUrl = await toPng(shareCardRef.current, getToImageOptions(false));
        } catch (e) {
           console.warn('Font embedding failed, retrying without fonts...', e);
           dataUrl = await toPng(shareCardRef.current, getToImageOptions(true));
        }
        
        const link = document.createElement('a');
        link.download = `share-card-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Failed to generate image', err);
        alert('Failed to generate image. Please try again.');
      }
    }
  };

  // State for sharing
  const [isGenerating, setIsGenerating] = useState(false);
  const [pendingShareFile, setPendingShareFile] = useState<File | null>(null);

  const handleNativeShare = async () => {
    if (shareCardRef.current) {
      setIsGenerating(true);
      setPendingShareFile(null); // Reset
      
      try {
        let blob;
        try {
           blob = await toBlob(shareCardRef.current, getToImageOptions(false));
        } catch (e) {
           console.warn('Font embedding failed, retrying without fonts...', e);
           blob = await toBlob(shareCardRef.current, getToImageOptions(true));
        }

        if (blob) {
            const file = new File([blob], `share-card-${Date.now()}.png`, { type: 'image/png' });
            
            // Try sharing immediately
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                  await navigator.share({
                      files: [file],
                      title: meta.title,
                      text: 'Check out this beautiful verse/hadith from QuranMaster!'
                  });
                } catch (shareError: any) {
                  // If share failed due to user gesture timeout (NotAllowedError), 
                  // allow user to click a button to retry immediately with the generated file.
                  if (shareError.name === 'NotAllowedError') {
                    setPendingShareFile(file);
                  } else if (shareError.name !== 'AbortError') {
                    throw shareError;
                  }
                }
            } else {
                // Fallback
                const link = document.createElement('a');
                link.download = `share-card-${Date.now()}.png`;
                link.href = URL.createObjectURL(blob);
                link.click();
                alert("Direct sharing is not supported on this device/browser. Image downloaded instead.");
            }
        }
      } catch (err) {
        console.error('Share failed', err);
        alert('Failed to generate image for sharing. Please try downloading instead.');
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const handleConfirmShare = async () => {
    if (pendingShareFile && navigator.canShare && navigator.canShare({ files: [pendingShareFile] })) {
       try {
          await navigator.share({
              files: [pendingShareFile],
              title: meta.title,
              text: 'Check out this beautiful verse/hadith from QuranMaster!'
          });
          setPendingShareFile(null); // Reset after successful share
       } catch (err: any) {
         if (err.name !== 'AbortError') {
            console.error('Retry share failed', err);
            alert('Share failed again. Please download the image.');
         }
       }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className={styles.shareOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className={styles.editorContainer} onClick={e => e.stopPropagation()}>
             {/* Header */}
             <div className={styles.editorHeader}>
                <h3>{title}</h3>
                <button onClick={onClose} className={styles.closeEditorBtn}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
             </div>

             <div className={styles.editorContent}>
               {/* Sidebar Controls */}
               <div className={styles.editorControls}>
                  
                  <div className={styles.controlGroup}>
                     <label>Background</label>
                     <div className={styles.bgGrid}>
                       {SHARE_IMAGES.map((img, i) => (
                         <div 
                           key={i} 
                           className={`${styles.bgThumb} ${editorState.bgImage === img ? styles.bgThumbActive : ''}`}
                           onClick={() => setEditorState({...editorState, bgImage: img})}
                         >
                           <img src={img} alt="bg" />
                         </div>
                       ))}
                     </div>
                  </div>

                  <div className={styles.controlGroup}>
                     <label>Visibility</label>
                     <div className={styles.toggleRow}>
                       <button 
                         className={`${styles.toggleBtn} ${editorState.showArabic ? styles.active : ''}`}
                         onClick={() => setEditorState({...editorState, showArabic: !editorState.showArabic})}
                       >
                         Arabic
                       </button>
                       <button 
                         className={`${styles.toggleBtn} ${editorState.showEnglish ? styles.active : ''}`}
                         onClick={() => setEditorState({...editorState, showEnglish: !editorState.showEnglish})}
                       >
                         English
                       </button>
                     </div>
                  </div>

                  <div className={styles.controlGroup}>
                     <label>Text Content (Edits Only for Image)</label>
                     <textarea 
                       className={styles.editorInput} 
                       value={editorState.arText} 
                       onChange={e => setEditorState({...editorState, arText: e.target.value})}
                       placeholder="Arabic text..."
                       rows={2}
                       dir="rtl"
                       style={{marginBottom: '0.5rem'}}
                     />
                     <textarea 
                       className={styles.editorInput} 
                       value={editorState.enText} 
                       onChange={e => setEditorState({...editorState, enText: e.target.value})}
                       placeholder="English text..."
                       rows={2}
                     />
                  </div>

                  <div className={styles.controlGroup}>
                     <label>Styling</label>
                     <div className={styles.rangeControl}>
                       <span>Overlay Opacity ({editorState.overlayOpacity})</span>
                       <input 
                         type="range" 
                         min="0" 
                         max="1" 
                         step="0.1" 
                         value={editorState.overlayOpacity}
                         onChange={e => setEditorState({...editorState, overlayOpacity: parseFloat(e.target.value)})}
                       />
                     </div>
                     <div className={styles.rangeControl}>
                       <span>Arabic Size ({editorState.arFontSize}px)</span>
                       <input 
                         type="range" 
                         min="16" 
                         max="80" 
                         value={editorState.arFontSize}
                         onChange={e => setEditorState({...editorState, arFontSize: parseInt(e.target.value)})}
                       />
                     </div>
                     <div className={styles.rangeControl}>
                       <span>English Size ({editorState.enFontSize}px)</span>
                       <input 
                         type="range" 
                         min="12" 
                         max="50" 
                         value={editorState.enFontSize}
                         onChange={e => setEditorState({...editorState, enFontSize: parseInt(e.target.value)})}
                       />
                     </div>
                     
                     <div style={{marginTop: '10px'}}>
                       <label style={{fontSize: '0.8rem'}}>Font Family (Arabic)</label>
                       <select 
                         className={styles.selectInput}
                         value={editorState.fontFamilyAr}
                         onChange={e => setEditorState({...editorState, fontFamilyAr: e.target.value})}
                       >
                         <option value="'Amiri', serif">Amiri (Classic)</option>
                         <option value="'Cairo', sans-serif">Cairo (Modern)</option>
                         <option value="'Scheherazade New', serif">Scheherazade (Naskh)</option>
                       </select>
                     </div>
                  </div>

               </div>

               {/* Preview Area */}
               <div className={styles.editorPreview}>
                  <div className={styles.previewWrapper}>
                    <div 
                      className={styles.shareCardPreview} 
                      ref={shareCardRef}
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        color: editorState.textColor
                      }}
                    >
                        <div className={styles.shareCardBackground}>
                           <img 
                            src={editorState.bgImage} 
                            alt="Background" 
                            className={styles.shareCardBgImage}
                          />
                        </div>
                        <div 
                          className={styles.shareCardOverlay} 
                          style={{
                            backgroundColor: `rgba(0,0,0,${editorState.overlayOpacity})`,
                            textAlign: editorState.textAlign,
                            padding: '2rem'
                          }}
                        >
                            <div className={styles.shareCardContent}>
                              {editorState.showArabic && (
                                <p 
                                  className={styles.shareCardArabic}
                                  style={{
                                    fontFamily: editorState.fontFamilyAr,
                                    fontSize: `${editorState.arFontSize}px`
                                  }}
                                >
                                  {editorState.arText}
                                </p>
                              )}
                              
                              {editorState.showEnglish && (
                                <p 
                                  className={styles.shareCardEnglish}
                                  style={{
                                    fontFamily: editorState.fontFamilyEn,
                                    fontSize: `${editorState.enFontSize}px`
                                  }}
                                >
                                  {editorState.enText && (editorState.enText.length > 500 ? editorState.enText.substring(0, 500) + '...' : editorState.enText)}
                                </p>
                              )}
                              
                              {(editorState.narrator && editorState.showEnglish) && (
                                <div style={{
                                  fontSize: `${Math.max(12, editorState.enFontSize - 2)}px`, 
                                  color: '#ffd700', 
                                  fontWeight: 'bold',
                                  marginTop: '1rem',
                                  fontStyle: 'italic'
                                }}>
                                  {editorState.narrator}
                                </div>
                              )}
                            </div>
                            
                            <div className={styles.shareCardFooter}>
                              <div style={{display:'flex', alignItems:'center', gap: '8px'}}>
                                  <div style={{width:'4px', height:'24px', background:'var(--primary)'}}></div>
                                  <div style={{display:'flex', flexDirection:'column', alignItems: 'flex-start'}}>
                                    <span style={{fontSize: '0.9em', fontWeight: 'bold'}}>{meta.title}</span>
                                    <span style={{fontSize: '0.7em', opacity: 0.8}}>{meta.subtitle}</span>
                                  </div>
                              </div>
                              <div className={styles.brandLogo}>
                                  QM
                              </div>
                            </div>
                        </div>
                    </div>
                  </div>
                  
                  <div className={styles.editorActions}>
                     {!pendingShareFile ? (
                       <button 
                         className={styles.downloadBtn} 
                         onClick={handleNativeShare} 
                         disabled={isGenerating}
                         title="Share to Apps (Mobile Only) or Download"
                       >
                          {isGenerating ? (
                            <span style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                              <div className={styles.spinner} style={{width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white'}}></div>
                              Generating...
                            </span>
                          ) : (
                            <>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '8px'}}>
                                <circle cx="18" cy="5" r="3"></circle>
                                <circle cx="6" cy="12" r="3"></circle>
                                <circle cx="18" cy="19" r="3"></circle>
                                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                              </svg>
                              Share Image
                            </>
                          )}
                       </button>
                     ) : (
                       <button 
                         className={styles.downloadBtn} 
                         onClick={handleConfirmShare}
                         style={{backgroundColor: '#22c55e'}}
                       >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '8px'}}>
                             <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                             <polyline points="22 4 12 14.01 9 11.01"></polyline>
                          </svg>
                          Tap to Complete Share
                       </button>
                     )}

                     <button 
                       className={styles.downloadBtn} 
                       onClick={downloadShareImage}
                       disabled={isGenerating}
                       style={{background: 'var(--bg-secondary)', color: 'var(--foreground)', boxShadow: 'none'}}
                     >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '8px'}}>
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="7 10 12 15 17 10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Download
                     </button>
                  </div>
               </div>
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
