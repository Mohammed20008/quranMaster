'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './whiteboard.module.css';

interface WhiteboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TextElement {
  id: string;
  x: number;
  y: number;
  value: string;
  color: string;
  fontSize: number;
  fontFamily: string;
  isEditing: boolean;
}

export default function WhiteboardModal({ isOpen, onClose }: WhiteboardModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Drawing states
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#f59e0b'); // Golden Amber default
  const [brushWidth, setBrushWidth] = useState(8); // Default brush width
  const [mode, setMode] = useState<'draw' | 'erase' | 'text'>('draw');
  const [bgType, setBgType] = useState<'blank' | 'lines' | 'grid'>('lines');
  
  // Canvas Theme: dynamically matches app theme ('obsidian' for dark, 'chalkwhite' for light)
  const [canvasTheme, setCanvasTheme] = useState<'obsidian' | 'chalkwhite'>('obsidian');

  // Custom states
  const [isZenMode, setIsZenMode] = useState(false);
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [activeTextId, setActiveTextId] = useState<string | null>(null);
  const [showShortcutGuide, setShowShortcutGuide] = useState(false);

  // Undo/Redo history stacks
  const historyRef = useRef<ImageData[]>([]);
  const redoRef = useRef<ImageData[]>([]);
  
  // Track history depth to force React re-renders on availability changes
  const [undoCount, setUndoCount] = useState(0);
  const [redoCount, setRedoCount] = useState(0);

  // Harmonious QuranMaster Islamic Palette (Automatically switches colors based on light/dark mode)
  const colors = canvasTheme === 'obsidian' ? [
    { name: 'Amber Gold', hex: '#f59e0b' },
    { name: 'Emerald', hex: '#10b981' },
    { name: 'Sky Blue', hex: '#0ea5e9' },
    { name: 'Lavender', hex: '#a78bfa' },
    { name: 'Rose', hex: '#fb7185' },
    { name: 'Pure Chalk', hex: '#ffffff' }
  ] : [
    { name: 'Deep Slate', hex: '#1e293b' },
    { name: 'Royal Blue', hex: '#1d4ed8' },
    { name: 'Emerald Green', hex: '#047857' },
    { name: 'Crimson Red', hex: '#b91c1c' },
    { name: 'Purple Ink', hex: '#6d28d9' },
    { name: 'Gold Accent', hex: '#c69320' }
  ];

  // Dynamic Theme Observer: Syncs whiteboard with parent application theme instantly
  useEffect(() => {
    if (!isOpen) return;

    const syncTheme = () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark' || 
                     document.documentElement.classList.contains('dark');
      const detectedTheme = isDark ? 'obsidian' : 'chalkwhite';
      setCanvasTheme(detectedTheme);
      // Auto-set high contrast default ink
      setBrushColor(isDark ? '#f59e0b' : '#1e293b');
    };

    // Run initial sync
    syncTheme();

    // Observe changes on root <html> tag for live toggling
    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class']
    });

    return () => observer.disconnect();
  }, [isOpen]);

  // Draw background guidelines helper (tailored dynamically for Obsidian vs Chalk White themes)
  const drawBackground = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Fill background color based on theme
    ctx.fillStyle = canvasTheme === 'obsidian' ? '#0a0e17' : '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Dynamic line colors with enhanced opacity for legibility
    const lineStrokeColor = canvasTheme === 'obsidian' 
      ? 'rgba(148, 163, 184, 0.12)' 
      : 'rgba(100, 116, 139, 0.15)';
    
    const baselineStrokeColor = canvasTheme === 'obsidian'
      ? 'rgba(245, 158, 11, 0.22)'
      : 'rgba(198, 147, 32, 0.32)';

    if (bgType === 'lines') {
      ctx.strokeStyle = lineStrokeColor;
      ctx.lineWidth = 1.5;
      
      const step = 50; // Guideline baseline steps
      for (let y = step; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();

        // Highlight baseline for letters
        if (y % (step * 3) === 0) {
          ctx.strokeStyle = baselineStrokeColor;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
          ctx.strokeStyle = lineStrokeColor;
        }
      }
    } else if (bgType === 'grid') {
      ctx.strokeStyle = lineStrokeColor;
      ctx.lineWidth = 1;
      const size = 35; // Grid guideline step size

      for (let x = 0; x < width; x += size) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += size) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }
  }, [bgType, canvasTheme]);

  // Canvas initializer
  useEffect(() => {
    if (!isOpen) return;
    
    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      
      // Handle high-resolution screens (retina scaling)
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      // Set standard drawing qualities
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      drawBackground(ctx, rect.width, rect.height);

      // Reset histories
      historyRef.current = [];
      redoRef.current = [];
      setUndoCount(0);
      setRedoCount(0);
      setTextElements([]);
      setActiveTextId(null);
    }, 120);

    return () => clearTimeout(timer);
  }, [isOpen, bgType, canvasTheme, drawBackground]);

  // Capture canvas state snapshot for Undo/Redo stack
  const saveStateSnapshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const updatedHistory = [...historyRef.current, imgData].slice(-30);
    historyRef.current = updatedHistory;
    redoRef.current = []; 
    
    setUndoCount(updatedHistory.length);
    setRedoCount(0);
  }, []);

  // Undo Functionality
  const handleUndo = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (historyRef.current.length === 0) return;

    const currentSnapshot = historyRef.current.pop();
    if (currentSnapshot) {
      redoRef.current.push(currentSnapshot);
      setRedoCount(redoRef.current.length);
    }

    if (historyRef.current.length > 0) {
      const previousState = historyRef.current[historyRef.current.length - 1];
      ctx.putImageData(previousState, 0, 0);
    } else {
      const rect = canvas.getBoundingClientRect();
      drawBackground(ctx, rect.width, rect.height);
    }

    setUndoCount(historyRef.current.length);
  }, [drawBackground]);

  // Redo Functionality
  const handleRedo = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (redoRef.current.length === 0) return;

    const redoSnapshot = redoRef.current.pop();
    if (redoSnapshot) {
      ctx.putImageData(redoSnapshot, 0, 0);
      historyRef.current.push(redoSnapshot);
      
      setUndoCount(historyRef.current.length);
      setRedoCount(redoRef.current.length);
    }
  }, []);

  // Clear / Reset Canvas
  const handleClear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    drawBackground(ctx, rect.width, rect.height);
    saveStateSnapshot();
  }, [drawBackground, saveStateSnapshot]);

  // Keybindings and Gesture Shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;

      if (isCtrl && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      } else if (isCtrl && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (isCtrl && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        handleClear();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (activeTextId) {
          setActiveTextId(null);
          setTextElements(prev => prev.filter(t => t.value.trim() !== ''));
        } else if (isZenMode) {
          setIsZenMode(false);
        } else {
          onClose();
        }
      } else if (!activeTextId) {
        if (e.key.toLowerCase() === 'b') {
          setMode('draw');
        } else if (e.key.toLowerCase() === 'e') {
          setMode('erase');
        } else if (e.key.toLowerCase() === 't') {
          setMode('text');
        } else if (e.key.toLowerCase() === 'z') {
          setIsZenMode(prev => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleUndo, handleRedo, handleClear, activeTextId, isZenMode, onClose]);

  // Coordinate normalizers
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, clientX: 0, clientY: 0 };

    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0, clientX: 0, clientY: 0 };
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
        clientX: e.touches[0].clientX,
        clientY: e.touches[0].clientY
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        clientX: e.clientX,
        clientY: e.clientY
      };
    }
  };

  // Drawing Event Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y, clientX, clientY } = getCoordinates(e);

    if (mode === 'text') {
      const newId = Date.now().toString();
      const newText: TextElement = {
        id: newId,
        x,
        y,
        value: '',
        color: brushColor,
        fontSize: brushWidth * 2 + 18,
        fontFamily: 'Outfit, Inter, sans-serif',
        isEditing: true
      };
      
      setTextElements(prev => [...prev.map(t => ({...t, isEditing: false})), newText]);
      setActiveTextId(newId);
      return;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
    
    // Eraser matches active canvas theme background color
    ctx.strokeStyle = mode === 'erase' 
      ? (canvasTheme === 'obsidian' ? '#0a0e17' : '#ffffff') 
      : brushColor;
    
    ctx.lineWidth = mode === 'erase' ? brushWidth * 3.5 : brushWidth;

    setIsDrawing(true);
    ctx.lineTo(x, y);
    ctx.stroke();

    if (e.cancelable) e.preventDefault();
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || mode === 'text') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    
    if (e.cancelable) e.preventDefault();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveStateSnapshot();
    }
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dlCanvas = document.createElement('canvas');
    dlCanvas.width = canvas.width;
    dlCanvas.height = canvas.height;
    const dlCtx = dlCanvas.getContext('2d');
    if (!dlCtx) return;

    dlCtx.fillStyle = canvasTheme === 'obsidian' ? '#0a0e17' : '#ffffff';
    dlCtx.fillRect(0, 0, dlCanvas.width, dlCanvas.height);
    dlCtx.drawImage(canvas, 0, 0);

    // Draw all floating text elements onto the export canvas
    textElements.forEach(t => {
      if (!t.value.trim()) return;
      dlCtx.font = `650 ${t.fontSize}px ${t.fontFamily}`;
      dlCtx.fillStyle = t.color;
      dlCtx.textBaseline = 'top';
      dlCtx.fillText(t.value, t.x, t.y);
    });

    const link = document.createElement('a');
    link.download = 'quranmaster-calligraphy-drawing.png';
    link.href = dlCanvas.toDataURL('image/png');
    link.click();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.overlay}>
          
          {/* Main Card with spacious internal paddings */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className={`${styles.modalCard} ${isZenMode ? styles.modalCardZen : ''}`}
            style={{
              background: 'var(--background)',
              border: isZenMode ? 'none' : '2px solid var(--border)',
              borderRadius: isZenMode ? '0' : '40px',
              boxShadow: 'var(--shadow-xl)'
            }}
          >
            {/* Header Control Panel (Hidden in Zen Mode) */}
            <AnimatePresence>
              {!isZenMode && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className={styles.header}
                >
                  <div className={styles.headerLeft}>
                    <div 
                      className={styles.headerIconRing}
                      style={{
                        background: 'rgba(198, 147, 32, 0.1)',
                        borderColor: 'var(--primary)',
                        color: 'var(--primary)'
                      }}
                    >
                      🖋️
                    </div>
                    <div className={styles.headerTitleRow}>
                      <h3>
                        Writing Practice Board
                        <span className={styles.themeBadge}>
                          Auto-Theme
                        </span>
                      </h3>
                      <p className={styles.headerSubtitle}>
                        calligraphy canvas: automatically matches your system light or dark theme.
                      </p>
                    </div>
                  </div>

                  <div className={styles.headerRight}>
                    {/* Shortcuts trigger */}
                    <button
                      onClick={() => setShowShortcutGuide(prev => !prev)}
                      className={`${styles.shortcutGuideTrigger} ${showShortcutGuide ? styles.shortcutGuideTriggerActive : ''}`}
                    >
                      ⌨️ <span>Shortcuts Guide</span>
                    </button>

                    {/* Full screen zen mode */}
                    <button
                      onClick={() => setIsZenMode(true)}
                      className={styles.zenTrigger}
                    >
                      🧘‍♂️ Zen Focus
                    </button>

                    {/* Exit board button */}
                    <button
                      onClick={onClose}
                      className={styles.exitBtn}
                    >
                      ✕
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Workspace Frame */}
            <div className={styles.workspace}>
              
              {/* Left Settings Sidebar (Spacious margins, larger texts) */}
              <AnimatePresence>
                {!isZenMode && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 'auto', opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className={styles.sidebar}
                  >
                    {/* Tool switcher tiles - Enlarged */}
                    <div className={styles.toolGroup}>
                      <button
                        onClick={() => { setMode('draw'); setTextInput(null); }}
                        className={`${styles.toolBtn} ${mode === 'draw' ? styles.toolBtnActive : ''}`}
                        title="Calligraphy Pen (B)"
                      >
                        <span>🖌️ Calligraphy</span>
                      </button>
                      
                      <button
                        onClick={() => { setMode('erase'); setTextInput(null); }}
                        className={`${styles.toolBtn} ${mode === 'erase' ? styles.toolBtnActive : ''}`}
                        title="Eraser (E)"
                      >
                        <span>🧽 Eraser</span>
                      </button>

                      <button
                        onClick={() => setMode('text')}
                        className={`${styles.toolBtn} ${mode === 'text' ? styles.toolBtnActive : ''}`}
                        title="Text insertion (T)"
                      >
                        <span>🔤 Keyboard Text</span>
                      </button>
                    </div>

                    {/* Thickness Slider Control */}
                    <div className={styles.sliderBox}>
                      <span className={styles.sectionLabel}>Stroke Weight</span>
                      <input
                        type="range"
                        min="3"
                        max="32"
                        value={brushWidth}
                        onChange={(e) => setBrushWidth(parseInt(e.target.value))}
                        className={styles.sliderInput}
                      />
                      <span className={styles.sliderVal}>{brushWidth} px</span>
                    </div>

                    {/* Guidelines Selector Grid */}
                    <div className={styles.guideBox}>
                      <span className={styles.sectionLabel}>Guidelines</span>
                      <div className={styles.guideBtnGroup}>
                        {(['blank', 'lines', 'grid'] as const).map((type) => (
                          <button
                            key={type}
                            onClick={() => setBgType(type)}
                            className={`${styles.guideBtn} ${bgType === type ? styles.guideBtnActive : ''}`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Undo/Redo & Reset Buttons */}
                    <div className={styles.historyRow}>
                      <div className={styles.undoRedoGroup}>
                        <button
                          onClick={handleUndo}
                          disabled={undoCount === 0}
                          className={styles.actionIconBtn}
                          title="Undo stroke (Ctrl + Z)"
                        >
                          ↩️
                        </button>
                        <button
                          onClick={handleRedo}
                          disabled={redoCount === 0}
                          className={styles.actionIconBtn}
                          title="Redo stroke (Ctrl + Y)"
                        >
                          ↪️
                        </button>
                      </div>

                      <button
                        onClick={handleClear}
                        className={styles.trashBtn}
                        title="Clear whole workspace (Ctrl + R)"
                      >
                        🗑️ <span>Clear Board</span>
                      </button>

                      <button
                        onClick={downloadCanvas}
                        className={styles.downloadBtn}
                        title="Export and Download calligraphy"
                      >
                        💾 <span>Export PNG</span>
                      </button>
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>

              {/* Dynamic Gold-Framed Calligraphy Board Canvas Area */}
              <div 
                className={styles.canvasContainer}
                style={{
                  background: canvasTheme === 'obsidian' ? '#0a0e17' : '#ffffff',
                  border: isZenMode ? 'none' : '3px double var(--primary)',
                  boxShadow: isZenMode ? 'none' : '0 12px 40px rgba(198, 147, 32, 0.15)',
                  borderRadius: isZenMode ? '0' : '32px',
                  margin: isZenMode ? '0' : '0 1rem'
                }}
              >
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    cursor: 'crosshair',
                    touchAction: 'none'
                  }}
                />

                {/* Floating Text Elements */}
                {textElements.map(t => (
                  <motion.div
                    key={t.id}
                    drag
                    dragMomentum={false}
                    onDragEnd={(_, info) => {
                      setTextElements(prev => prev.map(item => item.id === t.id ? { ...item, x: item.x + info.offset.x, y: item.y + info.offset.y } : item));
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTextId(t.id);
                      setTextElements(prev => prev.map(item => ({ ...item, isEditing: item.id === t.id })));
                      setMode('text');
                    }}
                    style={{
                      position: 'absolute',
                      left: t.x,
                      top: t.y,
                      zIndex: activeTextId === t.id ? 40 : 35,
                      cursor: activeTextId === t.id ? 'grab' : 'pointer',
                    }}
                  >
                    {activeTextId === t.id ? (
                      <div className={styles.textEditContainer}>
                        <div className={styles.textToolbar}>
                          <button onClick={() => setTextElements(prev => prev.map(item => item.id === t.id ? { ...item, fontFamily: 'Outfit, Inter, sans-serif' } : item))} className={t.fontFamily.includes('Outfit') ? styles.textToolBtnActive : styles.textToolBtn}>En</button>
                          <button onClick={() => setTextElements(prev => prev.map(item => item.id === t.id ? { ...item, fontFamily: 'Amiri, traditional arabic, serif' } : item))} className={t.fontFamily.includes('Amiri') ? styles.textToolBtnActive : styles.textToolBtn}>ع</button>
                          <div className={styles.divider} style={{height: '1rem', margin: '0 0.5rem'}} />
                          <button onClick={() => {
                            setActiveTextId(null);
                            setTextElements(prev => prev.filter(item => item.id !== t.id));
                          }} className={styles.textToolBtnDanger}>🗑️</button>
                        </div>
                        <input
                          type="text"
                          autoFocus
                          value={t.value}
                          onChange={(e) => setTextElements(prev => prev.map(item => item.id === t.id ? { ...item, value: e.target.value } : item))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === 'Escape') {
                              setActiveTextId(null);
                              setTextElements(prev => prev.map(item => ({ ...item, isEditing: false })));
                            }
                          }}
                          className={styles.canvasTextInput}
                          style={{
                            fontSize: `${t.fontSize}px`,
                            color: t.color,
                            fontFamily: t.fontFamily
                          }}
                          placeholder="Type here..."
                        />
                      </div>
                    ) : (
                      <div 
                        style={{
                          fontSize: `${t.fontSize}px`,
                          color: t.color,
                          fontFamily: t.fontFamily,
                          fontWeight: 650,
                          padding: '1rem 1.5rem',
                          whiteSpace: 'pre',
                        }}
                      >
                        {t.value}
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* Absolute Zen controls indicator */}
                <AnimatePresence>
                  {isZenMode && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={styles.zenControlsBar}
                    >
                      <span className={styles.zenLabel}>
                        🧘‍♂️ Zen Focus Active
                      </span>
                      
                      <div className={styles.divider} />
                      
                      <div className={styles.zenColorsRow}>
                        {colors.slice(0, 4).map(c => (
                          <button
                            key={c.hex}
                            onClick={() => setBrushColor(c.hex)}
                            className={`${styles.zenColorBtn} ${brushColor === c.hex ? styles.zenColorBtnActive : ''}`}
                            style={{ backgroundColor: c.hex }}
                          />
                        ))}
                      </div>

                      <div className={styles.divider} />

                      <button
                        onClick={() => setIsZenMode(false)}
                        className={styles.exitZenBtn}
                      >
                        Exit Zen Mode (Esc)
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Sliding gesture shortcuts overlay guide modal */}
                <AnimatePresence>
                  {showShortcutGuide && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 30 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 30 }}
                      className={styles.shortcutOverlayCard}
                    >
                      <h4 className={styles.shortcutHeader}>
                        <span>⌨️ Live Hotkey Gestures</span>
                        <button
                          onClick={() => setShowShortcutGuide(false)}
                          className={styles.shortcutCloseBtn}
                        >
                          ✕
                        </button>
                      </h4>

                      <div className={styles.shortcutList}>
                        <div className={styles.shortcutItem}>
                          <span>Ctrl + Z</span>
                          <span className={styles.shortcutKey}>Undo stroke</span>
                        </div>
                        <div className={styles.shortcutItem}>
                          <span>Ctrl + Y</span>
                          <span className={styles.shortcutKey}>Redo stroke</span>
                        </div>
                        <div className={styles.shortcutItem}>
                          <span style={{ color: '#ef4444' }}>Ctrl + R</span>
                          <span className={styles.shortcutKey} style={{ fontWeight: 'bold' }}>Clear Canvas</span>
                        </div>
                        
                        <div className={styles.divider} style={{ width: '100%', height: '1px', margin: '0.5rem 0' }} />

                        <div className={styles.shortcutItem}>
                          <span>Brush Mode</span>
                          <span className={`${styles.shortcutKey} ${styles.shortcutKeyGold}`}>B</span>
                        </div>
                        <div className={styles.shortcutItem}>
                          <span>Eraser Tool</span>
                          <span className={`${styles.shortcutKey} ${styles.shortcutKeyGold}`}>E</span>
                        </div>
                        <div className={styles.shortcutItem}>
                          <span>Keyboard Text Tool</span>
                          <span className={`${styles.shortcutKey} ${styles.shortcutKeyGold}`}>T</span>
                        </div>
                        <div className={styles.shortcutItem}>
                          <span>Zen Focus Mode</span>
                          <span className={`${styles.shortcutKey} ${styles.shortcutKeyGold}`}>Z</span>
                        </div>
                        <div className={styles.shortcutItem}>
                          <span>Close Modal</span>
                          <span className={styles.shortcutKey}>Esc</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>

              {/* Right Palette Column (Spacious layout, larger dots) */}
              <AnimatePresence>
                {!isZenMode && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 'auto', opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className={styles.paletteColumn}
                  >
                    <span className={styles.sectionLabel}>Ink Colors</span>
                    
                    <div className={styles.paletteGrid}>
                      {colors.map((c) => (
                        <button
                          key={c.hex}
                          onClick={() => {
                            setBrushColor(c.hex);
                            if (mode === 'erase') setMode('draw');
                          }}
                          className={`${styles.paletteBtn} ${brushColor === c.hex && mode !== 'erase' ? styles.paletteBtnActive : ''}`}
                          style={{ 
                            backgroundColor: c.hex,
                            borderColor: brushColor === c.hex && mode !== 'erase' ? 'var(--foreground)' : 'var(--border)' 
                          }}
                          title={c.name}
                        >
                          {brushColor === c.hex && mode !== 'erase' && (
                            <div className={styles.paletteBtnInnerCircle} />
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
