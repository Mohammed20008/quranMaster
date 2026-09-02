'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import styles from './whiteboard.module.css';
import {
  MousePointer,
  Pencil,
  Square,
  Circle,
  Minus,
  ArrowRight,
  Type,
  StickyNote,
  Eraser,
  Image as ImageIcon,
  Undo2,
  Redo2,
  Trash2,
  Download,
  HelpCircle,
  X,
  BookOpen,
  Sparkles,
  Feather
} from 'lucide-react';
import { surahs } from '@/data/surah-data';
import { getVerse } from '@/data/quran-verses';

// ═══════════════════════════ TYPES ══════════════════════════════════════════
type Tool = 'select'|'draw'|'qalam'|'laser'|'rect'|'ellipse'|'line'|'arrow'|'text'|'sticky'|'eraser'|'image';
type IMode = 'idle'|'panning'|'drawing'|'shaping'|'dragging'|'rubbering'|'resizing'|'erasing';

interface Base { id: string; z: number; op: number; }
interface DrawEl  extends Base { type:'draw';    d:string; sc:string; sw:number; }
interface QalamEl extends Base { type:'qalam';   d:string; sc:string; sw:number; }
interface RectEl  extends Base { type:'rect';    x:number;y:number;w:number;h:number;fc:string;sc:string;sw:number; }
interface EllEl   extends Base { type:'ellipse'; x:number;y:number;w:number;h:number;fc:string;sc:string;sw:number; }
interface LineEl  extends Base { type:'line';    x1:number;y1:number;x2:number;y2:number;sc:string;sw:number; }
interface ArrowEl extends Base { type:'arrow';   x1:number;y1:number;x2:number;y2:number;sc:string;sw:number; }
interface TextEl  extends Base { type:'text';    x:number;y:number;content:string;fs:number;tc:string;w:number;bold:boolean;italic:boolean;ff?:'default'|'uthmanic'|'amiri'|'cairo'; }
interface StickyEl extends Base { type:'sticky'; x:number;y:number;content:string;bg:string;w:number;h:number; }
interface ImageEl extends Base { type:'image';   x:number;y:number;w:number;h:number;src:string; }
type El = DrawEl|QalamEl|RectEl|EllEl|LineEl|ArrowEl|TextEl|StickyEl|ImageEl;

// ═══════════════════════════ CONSTANTS ══════════════════════════════════════
const PALETTE = ['#ffffff','#fbbf24','#34d399','#60a5fa','#f472b6','#f87171','#c084fc','#22d3ee','#fb923c','#94a3b8','#1e293b'];
const STICKY_PAL = [
  {bg:'#fef08a',fg:'#1c1917'},{bg:'#bbf7d0',fg:'#052e16'},{bg:'#bfdbfe',fg:'#172554'},
  {bg:'#fecaca',fg:'#450a0a'},{bg:'#e9d5ff',fg:'#2e1065'},{bg:'#fed7aa',fg:'#431407'},
];
const TOOLS: {id:Tool;icon:React.ComponentType<any>;label:string;key:string}[] = [
  {id:'select',  icon:MousePointer, label:'Select',    key:'V'},
  {id:'draw',    icon:Pencil,       label:'Draw',      key:'P'},
  {id:'qalam',   icon:Feather,      label:'Qalam',     key:'Q'},
  {id:'laser',   icon:Sparkles,     label:'Laser',     key:'K'},
  {id:'rect',    icon:Square,       label:'Rectangle', key:'R'},
  {id:'ellipse', icon:Circle,       label:'Ellipse',   key:'O'},
  {id:'line',    icon:Minus,        label:'Line',      key:'L'},
  {id:'arrow',   icon:ArrowRight,   label:'Arrow',     key:'A'},
  {id:'text',    icon:Type,         label:'Text',      key:'T'},
  {id:'sticky',  icon:StickyNote,   label:'Sticky Note',key:'N'},
  {id:'eraser',  icon:Eraser,       label:'Eraser',    key:'E'},
  {id:'image',   icon:ImageIcon,    label:'Image',     key:'I'},
];

let _nid = 0; const mkId = () => `e${++_nid}`;
let _nz  = 0; const mkZ  = () => ++_nz;

function escXml(s: string) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function eraseFromPath(d: string, cx: number, cy: number, radius: number): string {
  const matches = d.match(/[ML]-?\d+(\.\d+)?,?-?\d+(\.\d+)?/g);
  if (!matches) return d;
  let newD = '';
  let inGap = true;
  matches.forEach((segment) => {
    const cmd = segment[0];
    const coords = segment.slice(1).split(',');
    if (coords.length < 2) return;
    const px = parseFloat(coords[0]);
    const py = parseFloat(coords[1]);
    if (isNaN(px) || isNaN(py)) return;
    const dist = Math.hypot(px - cx, py - cy);
    if (dist < radius) {
      inGap = true;
    } else {
      if (cmd === 'M' || inGap) {
        newD += ` M${px.toFixed(1)},${py.toFixed(1)}`;
        inGap = false;
      } else {
        newD += ` L${px.toFixed(1)},${py.toFixed(1)}`;
      }
    }
  });
  return newD.trim();
}

function getQalamPath(pts: {x:number; y:number}[], w: number, angleDeg: number): string {
  if (pts.length === 0) return '';
  const rad = (angleDeg * Math.PI) / 180;
  const dx = (w / 2) * Math.cos(rad);
  const dy = -(w / 2) * Math.sin(rad); // screen coordinates y is inverted

  if (pts.length === 1) {
    const p = pts[0];
    const x1 = p.x + dx, y1 = p.y + dy;
    const x2 = p.x - dx, y2 = p.y - dy;
    const px = -(w / 4) * Math.sin(rad);
    const py = -(w / 4) * Math.cos(rad);
    return `M ${x1+px},${y1+py} L ${x1-px},${y1-py} L ${x2-px},${y2-py} L ${x2+px},${y2+py} Z`;
  }

  let leftSide = '';
  let rightSide = '';

  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const lx = (p.x + dx).toFixed(1);
    const ly = (p.y + dy).toFixed(1);
    const rx = (p.x - dx).toFixed(1);
    const ry = (p.y - dy).toFixed(1);

    if (i === 0) {
      leftSide += `M ${lx},${ly}`;
      rightSide = `L ${rx},${ry}`;
    } else {
      leftSide += ` L ${lx},${ly}`;
      rightSide = ` L ${rx},${ry}` + rightSide;
    }
  }

  return leftSide + rightSide + ' Z';
}


// ═══════════════════════════ COMPONENT ══════════════════════════════════════
export default function WhiteboardModal({ isOpen, onClose }: { isOpen:boolean; onClose:()=>void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      if (!src) return;
      const img = new Image();
      img.onload = () => {
        const w = img.width > 800 ? 800 : img.width;
        const h = (w / img.width) * img.height;
        const ctr = ctrRef.current?.getBoundingClientRect() || { width: 1000, height: 600, left: 0, top: 0 };
        const bx = (ctr.width / 2 - pxR.current) / zR.current - w / 2;
        const by = (ctr.height / 2 - pyR.current) / zR.current - h / 2;
        const newEl: ImageEl = {
          id: mkId(),
          type: 'image',
          z: mkZ(),
          op: 1,
          x: bx,
          y: by,
          w,
          h,
          src
        };
        commit([...elsR.current, newEl]);
        applySel([newEl.id]);
        applyTool('select');
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  /* ── Visual State ─────────────────────────────────────────────────────── */
  const [tool,   _setTool  ] = useState<Tool>('select');
  const [els,    _setEls   ] = useState<El[]>([]);
  const [selIds, _setSel   ] = useState<string[]>([]);
  const [editId, _setEdit  ] = useState<string|null>(null);
  const [panX,   _setPanX  ] = useState(0);
  const [panY,   _setPanY  ] = useState(0);
  const [zoom,   _setZoom  ] = useState(1);
  const [live,    setLive  ] = useState<any>(null);
  const [selBox,  setSelBox] = useState<{x:number;y:number;w:number;h:number}|null>(null);
  const [showHelp,setHelp  ] = useState(false);
  // Brush
  const [sc,  _setSc] = useState('#ffffff');
  const [fc,  _setFc] = useState('none');
  const [sw,  _setSw] = useState(3);
  const [fs,  _setFs] = useState(20);
  const [si,  _setSi] = useState(0);   // sticky colour index
  const [spaceActive, setSpaceActive] = useState(false);

  // Calligraphy Qalam Nib & Grids
  const [nibAngle, _setNibAngle] = useState(40);
  const [gridType, setGridType] = useState<'dot' | 'ruled' | 'calligraphy' | 'none'>('dot');

  // Multi-Board Manager
  const [boards, setBoards] = useState<{ id: string; name: string; els: El[] }[]>([
    { id: 'default', name: 'Board 1', els: [] }
  ]);
  const [activeBoardId, setActiveBoardId] = useState('default');

  // Laser Pointer
  const [laserSegments, setLaserSegments] = useState<{ id: string; x1: number; y1: number; x2: number; y2: number; op: number }[]>([]);

  // Quran Importer
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedSurahNum, setSelectedSurahNum] = useState(1);
  const [selectedAyahNum, setSelectedAyahNum] = useState(1);
  const [previewText, setPreviewText] = useState('');

  /* ── Refs (always-current values for event handlers) ─────────────────── */
  const toolR  = useRef<Tool>('select');
  const elsR   = useRef<El[]>([]);
  const selR   = useRef<string[]>([]);
  const editR  = useRef<string|null>(null);
  const pxR    = useRef(0); const pyR = useRef(0); const zR = useRef(1);
  const scR    = useRef('#ffffff'); const fcR = useRef('none');
  const swR    = useRef(3); const fsR = useRef(20); const siR = useRef(0);
  const closeR = useRef(onClose);

  const nibAngleR = useRef(40);
  const boardsR = useRef<{ id: string; name: string; els: El[] }[]>([{ id: 'default', name: 'Board 1', els: [] }]);
  const activeBoardIdR = useRef('default');
  const qalamPtsR = useRef<{ x: number; y: number }[]>([]);
  const lastLaserPt = useRef<{ x: number; y: number } | null>(null);

  /* ── History ──────────────────────────────────────────────────────────── */
  const histR   = useRef<El[][]>([[]]); 
  const histIdx = useRef(0);

  /* ── Interaction ─────────────────────────────────────────────────────── */
  const iMode     = useRef<IMode>('idle');
  const ctrRef    = useRef<HTMLDivElement>(null);
  const svgRef    = useRef<SVGSVGElement>(null);
  const livePathR = useRef<SVGPathElement|null>(null);
  const drawPts   = useRef('');
  const panStart  = useRef({cx:0,cy:0});
  const spaceDown = useRef(false);
  const dragStart = useRef({bx:0,by:0});
  const preDrag   = useRef<El[]>([]);
  const selStart  = useRef({x:0,y:0});
  const resizeD   = useRef<{id:string;handle:string;bx:number;by:number;ox:number;oy:number;ow:number;oh:number}|null>(null);
  const preResize = useRef<El[]>([]);
  const didMove   = useRef(false);

  /* ── Sync fns (update ref + state together) ──────────────────────────── */
  const applyTool = (t:Tool)             => { toolR.current=t;   _setTool(t);  selR.current=[];  _setSel([]);  editR.current=null; _setEdit(null); setLive(null); };
  const applyEls  = (v:El[])            => { elsR.current=v;    _setEls(v);  };
  const applySel  = (v:string[])        => { selR.current=v;    _setSel(v);  };
  const applyEdit = (v:string|null)     => { editR.current=v;   _setEdit(v); };
  const applyPan  = (x:number,y:number) => { pxR.current=x; pyR.current=y; _setPanX(x); _setPanY(y); };
  const applyZoom = (z:number)          => { zR.current=z;      _setZoom(z); };
  const applySc   = (v:string)          => { scR.current=v;     _setSc(v);   };
  const applyFc   = (v:string)          => { fcR.current=v;     _setFc(v);   };
  const applySw   = (v:number)          => { swR.current=v;     _setSw(v);   };
  const applyFs   = (v:number)          => { fsR.current=v;     _setFs(v);   };
  const applySi   = (v:number)          => { siR.current=v;     _setSi(v);   };
  const applyNibAngle = (v:number)       => { nibAngleR.current=v; _setNibAngle(v); };

  // Sync ref mirrors
  useEffect(() => { closeR.current = onClose; }, [onClose]);
  useEffect(() => { boardsR.current = boards; }, [boards]);
  useEffect(() => { activeBoardIdR.current = activeBoardId; }, [activeBoardId]);

  // LocalStorage mount sync
  useEffect(() => {
    if (!isOpen) return;
    const savedBoards = localStorage.getItem('quranmaster_boards');
    const savedActiveId = localStorage.getItem('quranmaster_active_board_id');
    const savedGrid = localStorage.getItem('quranmaster_grid_type');
    
    let initialBoards = boardsR.current;
    let initialActiveId = activeBoardIdR.current;
    
    if (savedBoards) {
      try {
        const parsed = JSON.parse(savedBoards);
        if (Array.isArray(parsed) && parsed.length > 0) {
          initialBoards = parsed;
          setBoards(parsed);
        }
      } catch (e) {
        console.error('Failed to parse saved boards', e);
      }
    }
    
    if (savedActiveId) {
      const exists = initialBoards.some(b => b.id === savedActiveId);
      if (exists) {
        initialActiveId = savedActiveId;
        setActiveBoardId(savedActiveId);
      }
    }
    
    if (savedGrid) {
      setGridType(savedGrid as any);
    }
    
    const activeBoard = initialBoards.find(b => b.id === initialActiveId) || initialBoards[0];
    applyEls(activeBoard.els);
    histR.current = [activeBoard.els.map(e => ({ ...e }))];
    histIdx.current = 0;
  }, [isOpen]);

  // Sync to LocalStorage on change
  useEffect(() => {
    if (!isOpen) return;
    localStorage.setItem('quranmaster_boards', JSON.stringify(boards));
    localStorage.setItem('quranmaster_active_board_id', activeBoardId);
    localStorage.setItem('quranmaster_grid_type', gridType);
  }, [boards, activeBoardId, gridType, isOpen]);

  // Laser Pointer Decay Loop
  useEffect(() => {
    if (laserSegments.length === 0) return;
    const timer = setTimeout(() => {
      setLaserSegments(prev =>
        prev
          .map(seg => ({ ...seg, op: seg.op - 0.08 }))
          .filter(seg => seg.op > 0)
      );
    }, 30);
    return () => clearTimeout(timer);
  }, [laserSegments]);

  // Quran Preview Loader
  useEffect(() => {
    if (!isImportOpen) return;
    let active = true;
    getVerse(selectedSurahNum, selectedAyahNum).then(v => {
      if (active) {
        setPreviewText(v ? v.text : '');
      }
    });
    return () => { active = false; };
  }, [selectedSurahNum, selectedAyahNum, isImportOpen]);

  // Board Helpers
  const handleSwitchBoard = (id: string) => {
    const curBoards = boardsR.current;
    const nextBoard = curBoards.find(b => b.id === id);
    if (!nextBoard) return;
    
    const updatedBoards = curBoards.map(b => 
      b.id === activeBoardIdR.current ? { ...b, els: elsR.current.map(e => ({...e})) } : b
    );
    setBoards(updatedBoards);
    boardsR.current = updatedBoards;
    
    setActiveBoardId(id);
    activeBoardIdR.current = id;
    
    applyEls(nextBoard.els);
    applySel([]);
    applyEdit(null);
    histR.current = [nextBoard.els.map(e => ({...e}))];
    histIdx.current = 0;
  };

  const handleCreateBoard = () => {
    const newId = `b_${Date.now()}`;
    const newName = `Board ${boards.length + 1}`;
    const newBoard = { id: newId, name: newName, els: [] };
    
    // Save current active board first
    const updatedBoards = boardsR.current.map(b => 
      b.id === activeBoardIdR.current ? { ...b, els: elsR.current.map(e => ({...e})) } : b
    );
    
    const finalBoards = [...updatedBoards, newBoard];
    setBoards(finalBoards);
    boardsR.current = finalBoards;
    
    setActiveBoardId(newId);
    activeBoardIdR.current = newId;
    
    applyEls([]);
    applySel([]);
    applyEdit(null);
    histR.current = [[]];
    histIdx.current = 0;
  };

  const handleRenameBoard = () => {
    const currentBoard = boards.find(b => b.id === activeBoardId);
    if (!currentBoard) return;
    const newName = prompt('Rename Sheet:', currentBoard.name);
    if (newName && newName.trim()) {
      setBoards(prev => prev.map(b => b.id === activeBoardId ? { ...b, name: newName.trim() } : b));
    }
  };

  const handleDeleteBoard = () => {
    if (boards.length <= 1) return;
    if (!confirm('Are you sure you want to delete this sheet?')) return;
    const index = boards.findIndex(b => b.id === activeBoardId);
    const remaining = boards.filter(b => b.id !== activeBoardId);
    setBoards(remaining);
    boardsR.current = remaining;
    
    // Switch to first remaining
    const nextBoard = remaining[index === 0 ? 0 : index - 1];
    setActiveBoardId(nextBoard.id);
    activeBoardIdR.current = nextBoard.id;
    applyEls(nextBoard.els);
    applySel([]);
    applyEdit(null);
    histR.current = [nextBoard.els.map(e => ({...e}))];
    histIdx.current = 0;
  };

  const handleImportVerse = () => {
    if (!previewText) return;
    const ctr = ctrRef.current?.getBoundingClientRect() || { width: 1000, height: 600 };
    const bx = (ctr.width / 2 - pxR.current) / zR.current - 300;
    const by = (ctr.height / 2 - pyR.current) / zR.current - 40;

    const newEl: TextEl = {
      id: mkId(),
      type: 'text',
      z: mkZ(),
      op: 1,
      x: bx,
      y: by,
      content: previewText,
      fs: 32,
      tc: scR.current === '#ffffff' ? '#fbbf24' : scR.current, // default to beautiful amber/gold Quran text if white stroke is default
      w: 600,
      bold: false,
      italic: false,
      ff: 'uthmanic'
    };
    commit([...elsR.current, newEl]);
    applySel([newEl.id]);
    applyTool('select');
    setIsImportOpen(false);
  };

  /* ── History helpers ─────────────────────────────────────────────────── */
  const commit = useCallback((newEls:El[]) => {
    applyEls(newEls);
    setBoards(prev => prev.map(b => b.id === activeBoardIdR.current ? { ...b, els: newEls } : b));
    const i = histIdx.current;
    histR.current = [...histR.current.slice(0,i+1), newEls.map(e=>({...e}))];
    histIdx.current = i+1;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);


  const undo = useCallback(() => {
    if (histIdx.current <= 0) return;
    histIdx.current--;
    const p = histR.current[histIdx.current];
    applyEls([...p]); applySel([]); applyEdit(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  const redo = useCallback(() => {
    if (histIdx.current >= histR.current.length-1) return;
    histIdx.current++;
    const n = histR.current[histIdx.current];
    applyEls([...n]); applySel([]); applyEdit(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  /* ── Coordinate conversion ───────────────────────────────────────────── */
  const toBoard = (cx:number,cy:number):{x:number;y:number} => {
    const r = ctrRef.current!.getBoundingClientRect();
    return { x:(cx-r.left-pxR.current)/zR.current, y:(cy-r.top-pyR.current)/zR.current };
  };

  /* ── Wheel zoom (towards cursor) ─────────────────────────────────────── */
  useEffect(() => {
    if (!isOpen) return;
    const el = ctrRef.current; if (!el) return;
    const onWheel = (e:WheelEvent) => {
      e.preventDefault();
      const r  = el.getBoundingClientRect();
      const cx = e.clientX-r.left, cy = e.clientY-r.top;
      const oz = zR.current;
      const f  = e.deltaY<0 ? 1.13 : 1/1.13;
      const nz = Math.max(0.05, Math.min(10, oz*f));
      applyPan(cx-(cx-pxR.current)*nz/oz, cy-(cy-pyR.current)*nz/oz);
      applyZoom(nz);
    };
    el.addEventListener('wheel', onWheel, {passive:false});
    return () => el.removeEventListener('wheel', onWheel);
  }, [isOpen]);

  /* ── Keyboard shortcuts ──────────────────────────────────────────────── */
  useEffect(() => {
    if (!isOpen) return;
    const kd = (e:KeyboardEvent) => {
      if (e.key===' ' && !editR.current) { spaceDown.current=true; setSpaceActive(true); e.preventDefault(); return; }
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const ctrl = e.ctrlKey||e.metaKey;
      if (e.key==='Escape') {
        if(editR.current){ applyEdit(null); }
        else if(selR.current.length){ applySel([]); }
        else closeR.current();
        return;
      }
      if (ctrl && e.key.toLowerCase()==='z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
      if (ctrl && e.key.toLowerCase()==='y') { e.preventDefault(); redo(); return; }
      if (ctrl && e.key.toLowerCase()==='a') { e.preventDefault(); applySel(elsR.current.map(x=>x.id)); return; }
      if ((e.key==='Delete'||e.key==='Backspace') && selR.current.length) {
        commit(elsR.current.filter(x=>!selR.current.includes(x.id)));
        applySel([]); return;
      }
      if (!ctrl) {
        const t = TOOLS.find(x=>x.key===e.key.toUpperCase());
        if (t) {
          if (t.id === 'image') triggerImageUpload();
          else applyTool(t.id);
        }
        if (e.key==='?') setHelp(p=>!p);
      }
    };
    const ku = (e:KeyboardEvent) => { if(e.key===' ') { spaceDown.current=false; setSpaceActive(false); } };
    window.addEventListener('keydown',kd);
    window.addEventListener('keyup',ku);
    return ()=>{ window.removeEventListener('keydown',kd); window.removeEventListener('keyup',ku); };
  }, [isOpen, undo, redo, commit]);

  /* ── Arrow rendering helper ──────────────────────────────────────────── */
  const arrowPath = (x1:number,y1:number,x2:number,y2:number,sw:number) => {
    const angle = Math.atan2(y2-y1, x2-x1);
    const hl = sw*4+8;
    const ha = Math.PI/6;
    return `M${x1},${y1} L${x2},${y2} M${x2},${y2} L${x2-hl*Math.cos(angle-ha)},${y2-hl*Math.sin(angle-ha)} M${x2},${y2} L${x2-hl*Math.cos(angle+ha)},${y2-hl*Math.sin(angle+ha)}`;
  };

  /* ── SVG element render ──────────────────────────────────────────────── */
  const renderSvgEl = (el:El, key:string, pointerAll:boolean) => {
    const pe: React.CSSProperties = { pointerEvents: pointerAll ? 'all' : 'none' };
    switch(el.type) {
      case 'draw': return (
        <path key={key} data-id={el.id} d={el.d} fill="none" stroke={el.sc}
          strokeWidth={el.sw} strokeLinecap="round" strokeLinejoin="round"
          opacity={el.op} style={pe} />
      );
      case 'qalam': return (
        <path key={key} data-id={el.id} d={el.d} fill={el.sc} stroke="none"
          opacity={el.op} style={pe} />
      );
      case 'rect': return (
        <rect key={key} data-id={el.id} x={el.x} y={el.y} width={el.w} height={el.h}
          fill={el.fc==='none'?'none':el.fc} stroke={el.sc} strokeWidth={el.sw}
          opacity={el.op} style={pe} rx={2} />
      );
      case 'ellipse': return (
        <ellipse key={key} data-id={el.id} cx={el.x+el.w/2} cy={el.y+el.h/2}
          rx={el.w/2} ry={el.h/2}
          fill={el.fc==='none'?'none':el.fc} stroke={el.sc} strokeWidth={el.sw}
          opacity={el.op} style={pe} />
      );
      case 'line': return (
        <line key={key} data-id={el.id} x1={el.x1} y1={el.y1} x2={el.x2} y2={el.y2}
          stroke={el.sc} strokeWidth={el.sw} strokeLinecap="round"
          opacity={el.op} style={pe} />
      );
      case 'arrow': return (
        <path key={key} data-id={el.id}
          d={arrowPath(el.x1,el.y1,el.x2,el.y2,el.sw)}
          fill="none" stroke={el.sc} strokeWidth={el.sw} strokeLinecap="round"
          opacity={el.op} style={pe} />
      );
      case 'image': return (
        <image key={key} data-id={el.id} href={el.src} x={el.x} y={el.y}
          width={el.w} height={el.h} opacity={el.op} style={pe} preserveAspectRatio="none" />
      );
      default: return null;
    }
  };

  /* ── Live shape preview render ────────────────────────────────────────── */
  const renderLiveSvg = (l:any) => {
    if (!l) return null;
    switch(l.type) {
      case 'rect': return <rect x={l.x} y={l.y} width={l.w||0} height={l.h||0} fill={l.fc==='none'?'none':l.fc} stroke={l.sc} strokeWidth={l.sw} rx={2} style={{pointerEvents:'none'}} />;
      case 'ellipse': return <ellipse cx={(l.x||0)+(l.w||0)/2} cy={(l.y||0)+(l.h||0)/2} rx={(l.w||0)/2} ry={(l.h||0)/2} fill={l.fc==='none'?'none':l.fc} stroke={l.sc} strokeWidth={l.sw} style={{pointerEvents:'none'}} />;
      case 'line': return <line x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={l.sc} strokeWidth={l.sw} strokeLinecap="round" style={{pointerEvents:'none'}} />;
      case 'arrow': return <path d={arrowPath(l.x1,l.y1,l.x2,l.y2,l.sw)} fill="none" stroke={l.sc} strokeWidth={l.sw} strokeLinecap="round" style={{pointerEvents:'none'}} />;
      default: return null;
    }
  };

  /* ── Selection handles (in board space so they scale with zoom) ────────── */
  const renderHandles = () => {
    const hSize = 8/zoom;
    const bw    = 1.5/zoom;
    return selIds.map(id => {
      const el = els.find(x=>x.id===id);
      if (!el) return null;
      let bx=0,by=0,bw2=0,bh=0, resizable=false;
      if (el.type==='rect'||el.type==='ellipse'||el.type==='image') { bx=el.x;by=el.y;bw2=el.w;bh=el.h;resizable=true; }
      else if (el.type==='text') { bx=el.x-4;by=el.y-4;bw2=el.w+8;bh=el.fs*2+16;resizable=true; }
      else if (el.type==='sticky') { bx=el.x;by=el.y;bw2=el.w;bh=el.h;resizable=true; }
      else if (el.type==='line'||el.type==='arrow') {
        bx=Math.min(el.x1,el.x2)-4;by=Math.min(el.y1,el.y2)-4;
        bw2=Math.abs(el.x2-el.x1)+8;bh=Math.abs(el.y2-el.y1)+8;
      } else if (el.type==='draw'||el.type==='qalam') {
        const matches = el.d.match(/-?\d+(\.\d+)?/g);
        if (matches) {
          const nums = matches.map(Number);
          let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
          for (let i = 0; i < nums.length; i += 2) {
            const px = nums[i]; const py = nums[i+1];
            if (px < minX) minX = px; if (px > maxX) maxX = px;
            if (py < minY) minY = py; if (py > maxY) maxY = py;
          }
          bx = minX - 4; by = minY - 4;
          bw2 = (maxX - minX) + 8; bh = (maxY - minY) + 8;
        } else return null;
      } else return null;
      return (
        <g key={`sel-${id}`} style={{pointerEvents:'none'}}>
          <rect x={bx} y={by} width={bw2} height={bh}
            fill="none" stroke="#3b82f6" strokeWidth={bw}
            strokeDasharray={`${4/zoom},${2/zoom}`} rx={2/zoom} />
          {resizable && (
            <>
              {(['nw','ne','sw','se'] as const).map(h=>{
                const hx = h.includes('e') ? bx+bw2-hSize/2 : bx-hSize/2;
                const hy = h.includes('s') ? by+bh-hSize/2  : by-hSize/2;
                return (
                  <rect key={h}
                    x={hx} y={hy} width={hSize} height={hSize}
                    fill="white" stroke="#3b82f6" strokeWidth={bw} rx={1.5/zoom}
                    data-id={id} data-handle={h}
                    style={{pointerEvents:'all', cursor:`${h}-resize`}}
                    onMouseDown={(e)=>{ e.stopPropagation(); startResize(e,id,h); }}
                  />
                );
              })}
            </>
          )}
        </g>
      );
    });
  };

  /* ── Resize start ─────────────────────────────────────────────────────── */
  const startResize = (e:React.MouseEvent,id:string,handle:string) => {
    const el = elsR.current.find(x=>x.id===id); if(!el) return;
    const {x:bx,y:by} = toBoard(e.clientX,e.clientY);
    const d: typeof resizeD.current = {id,handle,bx,by,ox:0,oy:0,ow:0,oh:0};
    if (el.type==='rect'||el.type==='ellipse'||el.type==='image') { d.ox=el.x;d.oy=el.y;d.ow=el.w;d.oh=el.h; }
    else if (el.type==='text')                 { d.ox=el.x;d.oy=el.y;d.ow=el.w;d.oh=el.fs*2+16; }
    else if (el.type==='sticky')               { d.ox=el.x;d.oy=el.y;d.ow=el.w;d.oh=el.h; }
    resizeD.current = d;
    preResize.current = elsR.current.map(x=>({...x}));
    iMode.current = 'resizing';
  };

  /* ── Drag start helpers ───────────────────────────────────────────────── */
  const beginDrag = (bx:number,by:number,ids:string[]) => {
    dragStart.current = {bx,by};
    preDrag.current   = elsR.current.map(x=>({...x}));
    didMove.current   = false;
    iMode.current     = 'dragging';
  };

  /* ── Container mouse events ───────────────────────────────────────────── */
  const handleMouseDown = (e:React.MouseEvent<HTMLDivElement>) => {
    if (editR.current && !(e.target as Element).closest('textarea,input')) applyEdit(null);

    // Pan via middle-mouse or Space+drag
    if (e.button===1 || (e.button===0 && spaceDown.current)) {
      iMode.current='panning';
      panStart.current={cx:e.clientX,cy:e.clientY};
      return;
    }
    if (e.button!==0) return;

    const tgt = (e.target as Element).closest('[data-id]');
    const elId= tgt?.getAttribute('data-id')||null;
    const {x:bx,y:by}=toBoard(e.clientX,e.clientY);
    const t=toolR.current;

    if (t==='select') {
      if (elId) {
        if (e.shiftKey) {
          const cur=selR.current;
          applySel(cur.includes(elId)?cur.filter(x=>x!==elId):[...cur,elId]);
        } else if (!selR.current.includes(elId)) {
          applySel([elId]);
        }
        beginDrag(bx,by, selR.current.includes(elId) ? selR.current : [elId]);
      } else {
        applySel([]);
        selStart.current={x:bx,y:by};
        iMode.current='rubbering';
      }
    } else if (t==='draw') {
      drawPts.current=`M${bx.toFixed(1)},${by.toFixed(1)}`;
      iMode.current='drawing';
    } else if (t==='qalam') {
      qalamPtsR.current = [{ x: bx, y: by }];
      livePathR.current?.setAttribute('fill', scR.current);
      livePathR.current?.setAttribute('stroke', 'none');
      const d = getQalamPath(qalamPtsR.current, swR.current, nibAngleR.current);
      livePathR.current?.setAttribute('d', d);
      iMode.current = 'drawing';
    } else if (t==='laser') {
      lastLaserPt.current = { x: bx, y: by };
      iMode.current = 'drawing';
    } else if (t==='rect'||t==='ellipse'||t==='line'||t==='arrow') {
      dragStart.current={bx,by};
      iMode.current='shaping';
    } else if (t==='text') {
      if (elId) { const el=elsR.current.find(x=>x.id===elId); if(el?.type==='text'){ applyEdit(elId); applySel([elId]); return; } }
      const newEl:TextEl={id:mkId(),type:'text',z:mkZ(),op:1,x:bx,y:by,content:'',fs:fsR.current,tc:scR.current,w:200,bold:false,italic:false};
      commit([...elsR.current,newEl]);
      applyEdit(newEl.id); applySel([newEl.id]);
    } else if (t==='sticky') {
      const ci=siR.current;
      const newEl:StickyEl={id:mkId(),type:'sticky',z:mkZ(),op:1,x:bx-120,y:by-80,content:'',bg:STICKY_PAL[ci].bg,w:240,h:200};
      commit([...elsR.current,newEl]);
      applyEdit(newEl.id); applySel([newEl.id]);
    } else if (t==='eraser') {
      const radius = 18 / zR.current;
      const newEls = elsR.current.map(el => {
        if (el.type === 'draw' || el.type === 'qalam') {
          const newD = eraseFromPath(el.d, bx, by, radius);
          return { ...el, d: newD };
        }
        return el;
      }).filter(el => {
        if ((el.type === 'draw' || el.type === 'qalam') && !el.d) return false;
        let ex=0, ey=0, ew=0, eh=0;
        if (el.type==='rect'||el.type==='ellipse'||el.type==='image') { ex=el.x; ey=el.y; ew=el.w; eh=el.h; }
        else if (el.type==='text') { ex=el.x; ey=el.y; ew=el.w; eh=el.fs*2; }
        else if (el.type==='sticky') { ex=el.x; ey=el.y; ew=el.w; eh=el.h; }
        else if (el.type==='line'||el.type==='arrow') {
          ex=Math.min(el.x1,el.x2); ey=Math.min(el.y1,el.y2);
          ew=Math.abs(el.x2-el.x1); eh=Math.abs(el.y2-el.y1);
        } else return true;
        const intersects = bx >= ex - radius && bx <= ex + ew + radius &&
                           by >= ey - radius && by <= ey + eh + radius;
        return !intersects;
      });
      commit(newEls);
      applySel([]);
      iMode.current='erasing';
    }
  };

  const handleMouseMove = (e:React.MouseEvent<HTMLDivElement>) => {
    const mode=iMode.current;
    if (mode==='idle') return;

    if (mode==='panning') {
      applyPan(pxR.current+(e.clientX-panStart.current.cx), pyR.current+(e.clientY-panStart.current.cy));
      panStart.current={cx:e.clientX,cy:e.clientY}; return;
    }

    const {x:bx,y:by}=toBoard(e.clientX,e.clientY);

    if (mode==='drawing') {
      if (toolR.current === 'qalam') {
        qalamPtsR.current.push({ x: bx, y: by });
        const d = getQalamPath(qalamPtsR.current, swR.current, nibAngleR.current);
        livePathR.current?.setAttribute('d', d);
        return;
      }
      if (toolR.current === 'laser') {
        if (lastLaserPt.current) {
          const segId = mkId();
          const newSeg = {
            id: segId,
            x1: lastLaserPt.current.x,
            y1: lastLaserPt.current.y,
            x2: bx,
            y2: by,
            op: 1
          };
          setLaserSegments(prev => [...prev, newSeg]);
          lastLaserPt.current = { x: bx, y: by };
        }
        return;
      }
      drawPts.current+=` L${bx.toFixed(1)},${by.toFixed(1)}`;
      livePathR.current?.setAttribute('d',drawPts.current); return;
    }

    if (mode==='shaping') {
      const t=toolR.current; const sx=dragStart.current.bx; const sy=dragStart.current.by;
      if (t==='rect')    setLive({type:'rect',x:Math.min(sx,bx),y:Math.min(sy,by),w:Math.abs(bx-sx),h:Math.abs(by-sy),fc:fcR.current,sc:scR.current,sw:swR.current});
      else if(t==='ellipse') setLive({type:'ellipse',x:Math.min(sx,bx),y:Math.min(sy,by),w:Math.abs(bx-sx),h:Math.abs(by-sy),fc:fcR.current,sc:scR.current,sw:swR.current});
      else if(t==='line')  setLive({type:'line',x1:sx,y1:sy,x2:bx,y2:by,sc:scR.current,sw:swR.current});
      else if(t==='arrow') setLive({type:'arrow',x1:sx,y1:sy,x2:bx,y2:by,sc:scR.current,sw:swR.current});
      return;
    }

    if (mode==='dragging') {
      const dx=bx-dragStart.current.bx, dy=by-dragStart.current.by;
      if (Math.hypot(dx,dy)>2) didMove.current=true;
      if (!didMove.current) return;
      const newEls=preDrag.current.map(el=>{
        if (!selR.current.includes(el.id)) return el;
        if (el.type==='line'||el.type==='arrow') {
          return {...el, x1:el.x1+dx, y1:el.y1+dy, x2:el.x2+dx, y2:el.y2+dy};
        }
        if (el.type==='draw' || el.type==='qalam') {
          let idx = 0;
          const newD = el.d.replace(/-?\d+(\.\d+)?/g, (match) => {
            const val = parseFloat(match);
            const isX = idx % 2 === 0;
            idx++;
            return (val + (isX ? dx : dy)).toFixed(1);
          });
          return {...el, d: newD};
        }
        return {...el, x:(el as any).x+dx, y:(el as any).y+dy} as El;
      });
      elsR.current=newEls; _setEls(newEls); return;
    }

    if (mode==='rubbering') {
      const sx=selStart.current.x, sy=selStart.current.y;
      setSelBox({x:Math.min(sx,bx),y:Math.min(sy,by),w:Math.abs(bx-sx),h:Math.abs(by-sy)});
      return;
    }

    if (mode==='resizing' && resizeD.current) {
      const {id,handle,bx:obx,by:oby,ox,oy,ow,oh}=resizeD.current;
      const dx=bx-obx, dy=by-oby;
      let nx=ox,ny=oy,nw=ow,nh=oh;
      if(handle.includes('e')) nw=Math.max(20,ow+dx);
      if(handle.includes('s')) nh=Math.max(20,oh+dy);
      if(handle.includes('w')){ nx=ox+dx; nw=Math.max(20,ow-dx); }
      if(handle.includes('n')){ ny=oy+dy; nh=Math.max(20,oh-dy); }
      const newEls=preResize.current.map(el=>{
        if(el.id!==id) return el;
        if(el.type==='rect'||el.type==='ellipse'||el.type==='image') return{...el,x:nx,y:ny,w:nw,h:nh};
        if(el.type==='text') return{...el,x:nx,y:ny,w:nw};
        if(el.type==='sticky') return{...el,x:nx,y:ny,w:nw,h:nh};
        return el;
      });
      elsR.current=newEls; _setEls(newEls); return;
    }

    if (mode==='erasing') {
      const radius = 18 / zR.current;
      const newEls = elsR.current.map(el => {
        if (el.type === 'draw' || el.type === 'qalam') {
          const newD = eraseFromPath(el.d, bx, by, radius);
          if (newD === el.d) return el;
          return { ...el, d: newD };
        }
        return el;
      }).filter(el => {
        if ((el.type === 'draw' || el.type === 'qalam') && !el.d) return false;
        let ex=0, ey=0, ew=0, eh=0;
        if (el.type==='rect'||el.type==='ellipse'||el.type==='image') { ex=el.x; ey=el.y; ew=el.w; eh=el.h; }
        else if (el.type==='text') { ex=el.x; ey=el.y; ew=el.w; eh=el.fs*2; }
        else if (el.type==='sticky') { ex=el.x; ey=el.y; ew=el.w; eh=el.h; }
        else if (el.type==='line'||el.type==='arrow') {
          ex=Math.min(el.x1,el.x2); ey=Math.min(el.y1,el.y2);
          ew=Math.abs(el.x2-el.x1); eh=Math.abs(el.y2-el.y1);
        } else return true;
        const intersects = bx >= ex - radius && bx <= ex + ew + radius &&
                           by >= ey - radius && by <= ey + eh + radius;
        return !intersects;
      });
      elsR.current = newEls;
      _setEls(newEls);
      return;
    }
  };

  const handleMouseUp = (e:React.MouseEvent<HTMLDivElement>) => {
    const mode=iMode.current;
    iMode.current='idle';

    if (mode==='panning') return;

    if (mode==='drawing') {
      if (toolR.current === 'qalam') {
        if (qalamPtsR.current.length > 0) {
          const finalD = getQalamPath(qalamPtsR.current, swR.current, nibAngleR.current);
          if (finalD) {
            const newEl: QalamEl = {
              id: mkId(),
              type: 'qalam',
              z: mkZ(),
              op: 1,
              d: finalD,
              sc: scR.current,
              sw: swR.current
            };
            commit([...elsR.current, newEl]);
          }
        }
        qalamPtsR.current = [];
      } else if (toolR.current === 'laser') {
        lastLaserPt.current = null;
      } else {
        if (drawPts.current.length>4) {
          const newEl:DrawEl={id:mkId(),type:'draw',z:mkZ(),op:1,d:drawPts.current,sc:scR.current,sw:swR.current};
          commit([...elsR.current,newEl]);
        }
        drawPts.current='';
      }
      livePathR.current?.setAttribute('d','');
      // Reset live preview drawing styles to normal stroke
      livePathR.current?.setAttribute('fill', 'none');
      livePathR.current?.setAttribute('stroke', scR.current);
      livePathR.current?.setAttribute('stroke-width', swR.current.toString());
      return;
    }

    if (mode==='shaping' && live) {
      const l=live; setLive(null);
      const t=toolR.current;
      let newEl:El|null=null;
      if(t==='rect'&&l.w>5&&l.h>5) newEl={id:mkId(),type:'rect',z:mkZ(),op:1,x:l.x,y:l.y,w:l.w,h:l.h,fc:l.fc,sc:l.sc,sw:l.sw};
      else if(t==='ellipse'&&l.w>5&&l.h>5) newEl={id:mkId(),type:'ellipse',z:mkZ(),op:1,x:l.x,y:l.y,w:l.w,h:l.h,fc:l.fc,sc:l.sc,sw:l.sw};
      else if(t==='line') newEl={id:mkId(),type:'line',z:mkZ(),op:1,x1:l.x1,y1:l.y1,x2:l.x2,y2:l.y2,sc:l.sc,sw:l.sw};
      else if(t==='arrow') newEl={id:mkId(),type:'arrow',z:mkZ(),op:1,x1:l.x1,y1:l.y1,x2:l.x2,y2:l.y2,sc:l.sc,sw:l.sw};
      if(newEl) commit([...elsR.current,newEl]);
      return;
    }

    if (mode==='shaping') { setLive(null); return; }

    if (mode==='dragging') {
      if (didMove.current) {
        const i=histIdx.current;
        histR.current=[...histR.current.slice(0,i+1), elsR.current.map(x=>({...x}))];
        histIdx.current=i+1;
      }
      return;
    }

    if (mode==='rubbering') {
      if (selBox) {
        const sb=selBox;
        const ids=elsR.current.filter(el=>{
          let ex=0,ey=0,ew=0,eh=0;
          if (el.type==='rect'||el.type==='ellipse'||el.type==='image') { ex=el.x; ey=el.y; ew=el.w; eh=el.h; }
          else if (el.type==='text') { ex=el.x; ey=el.y; ew=el.w; eh=el.fs*2; }
          else if (el.type==='sticky') { ex=el.x; ey=el.y; ew=el.w; eh=el.h; }
          else if (el.type==='line'||el.type==='arrow') {
            ex=Math.min(el.x1,el.x2); ey=Math.min(el.y1,el.y2);
            ew=Math.abs(el.x2-el.x1); eh=Math.abs(el.y2-el.y1);
          } else if (el.type==='draw'||el.type==='qalam') {
            const matches = el.d.match(/-?\d+(\.\d+)?/g);
            if (matches) {
              const nums = matches.map(Number);
              let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
              for (let i = 0; i < nums.length; i += 2) {
                const px = nums[i]; const py = nums[i+1];
                if (px < minX) minX = px; if (px > maxX) maxX = px;
                if (py < minY) minY = py; if (py > maxY) maxY = py;
              }
              ex = minX; ey = minY; ew = maxX - minX; eh = maxY - minY;
            } else return false;
          } else return false;
          return ex<sb.x+sb.w&&ex+ew>sb.x&&ey<sb.y+sb.h&&ey+eh>sb.y;
        }).map(x=>x.id);
        applySel(ids);
      }
      setSelBox(null);
      return;
    }

    if (mode==='resizing') {
      const i=histIdx.current;
      histR.current=[...histR.current.slice(0,i+1), elsR.current.map(x=>({...x}))];
      histIdx.current=i+1;
      resizeD.current=null;
      return;
    }

    if (mode==='erasing') {
      const i=histIdx.current;
      histR.current=[...histR.current.slice(0,i+1), elsR.current.map(x=>({...x}))];
      histIdx.current=i+1;
    }
  };

  const handleDblClick = (e:React.MouseEvent<HTMLDivElement>) => {
    const tgt=(e.target as Element).closest('[data-id]');
    const elId=tgt?.getAttribute('data-id')||null;
    if(!elId) return;
    const el=elsR.current.find(x=>x.id===elId);
    if(el?.type==='text'||el?.type==='sticky'){ applyEdit(elId); applySel([elId]); }
  };

  /* ── Zoom controls ───────────────────────────────────────────────────── */
  const zoomBy = (factor:number) => {
    const r=ctrRef.current!.getBoundingClientRect();
    const cx=r.width/2, cy=r.height/2;
    const oz=zR.current;
    const nz=Math.max(0.05,Math.min(10,oz*factor));
    applyPan(cx-(cx-pxR.current)*nz/oz, cy-(cy-pyR.current)*nz/oz);
    applyZoom(nz);
  };
  const resetZoom=()=>{ applyPan(0,0); applyZoom(1); };

  /* ── Export PNG ──────────────────────────────────────────────────────── */
  const exportPng = () => {
    const W=1920, H=1080;
    const viewX=-pxR.current/zR.current, viewY=-pyR.current/zR.current;
    const vW=W/zR.current, vH=H/zR.current;
    const isDark = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark';
    const bgFill = isDark ? '#16161E' : '#ffffff';
    const dotFill = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
    let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="${viewX} ${viewY} ${vW} ${vH}">
<defs><pattern id="d" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="${dotFill}"/></pattern></defs>
<rect x="${viewX}" y="${viewY}" width="${vW}" height="${vH}" fill="${bgFill}"/>
<rect x="${viewX}" y="${viewY}" width="${vW}" height="${vH}" fill="url(#d)"/>`;
    const sorted=[...els].sort((a,b)=>a.z-b.z);
    for(const el of sorted){
      if(el.type==='draw') svg+=`<path d="${escXml(el.d)}" fill="none" stroke="${el.sc}" stroke-width="${el.sw}" stroke-linecap="round" stroke-linejoin="round" opacity="${el.op}"/>`;
      else if(el.type==='qalam') svg+=`<path d="${escXml(el.d)}" fill="${el.sc}" stroke="none" opacity="${el.op}"/>`;
      else if(el.type==='rect') svg+=`<rect x="${el.x}" y="${el.y}" width="${el.w}" height="${el.h}" fill="${el.fc==='none'?'none':el.fc}" stroke="${el.sc}" stroke-width="${el.sw}" opacity="${el.op}" rx="2"/>`;
      else if(el.type==='ellipse') svg+=`<ellipse cx="${el.x+el.w/2}" cy="${el.y+el.h/2}" rx="${el.w/2}" ry="${el.h/2}" fill="${el.fc==='none'?'none':el.fc}" stroke="${el.sc}" stroke-width="${el.sw}" opacity="${el.op}"/>`;
      else if(el.type==='image') svg+=`<image href="${escXml(el.src)}" x="${el.x}" y="${el.y}" width="${el.w}" height="${el.h}" opacity="${el.op}"/>`;
      else if(el.type==='line') svg+=`<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.sc}" stroke-width="${el.sw}" stroke-linecap="round" opacity="${el.op}"/>`;
      else if(el.type==='arrow') svg+=`<path d="${escXml(arrowPath(el.x1,el.y1,el.x2,el.y2,el.sw))}" fill="none" stroke="${el.sc}" stroke-width="${el.sw}" stroke-linecap="round" opacity="${el.op}"/>`;
      else if(el.type==='text') {
        const lines=el.content.split('\n');
        const ff = el.ff === 'uthmanic' ? '"Uthmanic Hafs", Amiri, serif' : el.ff === 'amiri' ? 'Amiri, serif' : el.ff === 'cairo' ? 'Cairo, sans-serif' : 'sans-serif';
        lines.forEach((ln,i)=>{
          svg+=`<text x="${el.x+8}" y="${el.y+(i+1)*el.fs*1.2}" font-size="${el.fs}" fill="${el.tc}" font-weight="${el.bold?'bold':'normal'}" font-style="${el.italic?'italic':'normal'}" font-family='${ff}'>${escXml(ln)}</text>`;
        });
      }
      else if(el.type==='sticky'){ const fg=STICKY_PAL.find(x=>x.bg===el.bg)?.fg||'#000'; svg+=`<rect x="${el.x}" y="${el.y}" width="${el.w}" height="${el.h}" fill="${el.bg}" rx="6"/>`; const lines=el.content.split('\n'); lines.forEach((ln,i)=>{ svg+=`<text x="${el.x+14}" y="${el.y+36+i*20}" font-size="14" fill="${fg}" font-weight="600" font-family="sans-serif">${escXml(ln)}</text>`; }); }
    }
    svg+='</svg>';
    const blob=new Blob([svg],{type:'image/svg+xml'});
    const url=URL.createObjectURL(blob);
    const img=new Image();
    img.onload=()=>{
      const c=document.createElement('canvas'); c.width=W; c.height=H;
      const ctx=c.getContext('2d')!; ctx.drawImage(img,0,0);
      const a=document.createElement('a'); a.download='whiteboard.png'; a.href=c.toDataURL('image/png'); a.click();
      URL.revokeObjectURL(url);
    };
    img.src=url;
  };

  /* ── Cursor based on tool ────────────────────────────────────────────── */
  const getCursor = ()=>{
    if(spaceDown.current) return 'grab';
    switch(toolR.current){
      case 'select': return 'default';
      case 'draw': return 'crosshair';
      case 'eraser': return 'cell';
      case 'text': return 'text';
      default: return 'crosshair';
    }
  };

  const getFontFamily = (ff?: string) => {
    switch (ff) {
      case 'uthmanic': return '"Uthmanic Hafs", Amiri, serif';
      case 'amiri': return 'Amiri, serif';
      case 'cairo': return 'Cairo, sans-serif';
      default: return 'inherit';
    }
  };

  /* ── Selected element properties ─────────────────────────────────────── */
  const selectedEl = selIds.length===1 ? els.find(x=>x.id===selIds[0]) : null;

  /* ── Render text element ─────────────────────────────────────────────── */
  const renderTextEl = (el:TextEl) => {
    const isEdit = editId===el.id;
    const isArabic = /[\u0600-\u06FF]/.test(el.content);
    const dir = isArabic ? 'rtl' : 'ltr';
    const ta = isArabic ? 'right' : 'left';
    
    const base: React.CSSProperties = {
      position:'absolute', left:el.x, top:el.y, width:el.w,
      fontSize:el.fs, color:el.tc,
      fontWeight:el.bold?'bold':'normal',
      fontStyle:el.italic?'italic':'normal',
      fontFamily: getFontFamily(el.ff), zIndex: el.z+100,
      boxSizing:'border-box', padding:'6px 8px',
      direction: dir,
      textAlign: ta,
    };
    if (isEdit) {
      const isDark = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark';
      const taBg = isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.98)';
      const taBorder = isDark ? '2px solid #60a5fa' : '2px solid #3b82f6';
      
      return (
        <textarea key={el.id} autoFocus style={{...base,
          background: taBg, border: taBorder,
          borderRadius:4,outline:'none',resize:'both',minHeight:40,
          color:el.tc,lineHeight:1.5, fontFamily: getFontFamily(el.ff),
        }}
          value={el.content}
          onChange={e2=>{
            const ne=elsR.current.map(x=>x.id===el.id?{...x,content:e2.target.value}:x);
            elsR.current=ne; _setEls(ne);
          }}
          onBlur={()=>{ commit(elsR.current); applyEdit(null); }}
          onMouseDown={e2=>e2.stopPropagation()}
          onKeyDown={e2=>{ if(e2.key==='Escape'){ applyEdit(null); e2.stopPropagation(); } }}
        />
      );
    }
    return (
      <div key={el.id} data-id={el.id} style={{...base,
        cursor:toolR.current==='select'?'move':'text',
        userSelect:'none', whiteSpace:'pre-wrap', wordBreak:'break-word',
        minHeight:el.fs+12, borderRadius:4,
        outline:selIds.includes(el.id)?undefined:'none',
        pointerEvents: toolR.current==='eraser' ? 'all' : (toolR.current==='select'?'all':'none'),
      }}
        onMouseDown={e2=>{ e2.stopPropagation(); if(toolR.current!=='select')return; if(!selR.current.includes(el.id)) applySel(e2.shiftKey?[...selR.current,el.id]:[el.id]); beginDrag(toBoard(e2.clientX,e2.clientY).x,toBoard(e2.clientX,e2.clientY).y, selR.current.includes(el.id)?selR.current:[el.id]); }}
        onDoubleClick={e2=>{ e2.stopPropagation(); if(toolR.current==='select'){applyEdit(el.id);applySel([el.id]);} }}
      >
        {el.content || <span style={{opacity:0.3,pointerEvents:'none'}}>Type text...</span>}
      </div>
    );
  };

  /* ── Render sticky element ───────────────────────────────────────────── */
  const renderStickyEl = (el:StickyEl) => {
    const pair=STICKY_PAL.find(x=>x.bg===el.bg)||STICKY_PAL[0];
    const isEdit=editId===el.id;
    const isArabic = /[\u0600-\u06FF]/.test(el.content);
    
    return (
      <div key={el.id} data-id={el.id}
        style={{position:'absolute',left:el.x,top:el.y,width:el.w,height:el.h,
          background:el.bg, borderRadius:6, boxShadow:'0 6px 24px rgba(0,0,0,0.35)',
          display:'flex',flexDirection:'column', zIndex:el.z+100,
          cursor:toolR.current==='select'?'move':'default',
          overflow:'hidden',
          pointerEvents: toolR.current==='eraser'?'all':(toolR.current==='select'?'all':'none'),
        }}
        onMouseDown={e2=>{ e2.stopPropagation(); if(toolR.current!=='select')return; if(!selR.current.includes(el.id)) applySel(e2.shiftKey?[...selR.current,el.id]:[el.id]); beginDrag(toBoard(e2.clientX,e2.clientY).x,toBoard(e2.clientX,e2.clientY).y, selR.current.includes(el.id)?selR.current:[el.id]); }}
        onDoubleClick={e2=>{ e2.stopPropagation(); if(toolR.current==='select'){applyEdit(el.id);applySel([el.id]);} }}
      >
        {/* top strip */}
        <div style={{background:'rgba(0,0,0,0.1)',height:6,flexShrink:0}}/>
        {isEdit ? (
          <textarea autoFocus style={{
            flex:1,background:'transparent',border:'none',outline:'none',
            resize:'none',color:pair.fg,fontSize:14,fontWeight:600,
            lineHeight:1.5,padding:'10px 12px',fontFamily:'inherit',
            direction: isArabic ? 'rtl' : 'ltr',
            textAlign: isArabic ? 'right' : 'left',
          }}
            value={el.content}
            onChange={e2=>{ const ne=elsR.current.map(x=>x.id===el.id?{...x,content:e2.target.value}:x); elsR.current=ne; _setEls(ne); }}
            onBlur={()=>{ commit(elsR.current); applyEdit(null); }}
            onMouseDown={e2=>e2.stopPropagation()}
            onKeyDown={e2=>{ if(e2.key==='Escape'){ applyEdit(null); e2.stopPropagation(); } }}
            placeholder="Type your note..."
          />
        ) : (
          <div style={{
            flex:1,color:pair.fg,fontSize:14,fontWeight:600,lineHeight:1.5,padding:'10px 12px',
            whiteSpace:'pre-wrap',wordBreak:'break-word',userSelect:'none',
            direction: isArabic ? 'rtl' : 'ltr',
            textAlign: isArabic ? 'right' : 'left',
          }}>
            {el.content||<span style={{opacity:0.4}}>Double-click to type...</span>}
          </div>
        )}
      </div>
    );
  };

  /* ── Properties panel for selected element ───────────────────────────── */
  const renderPropsPanel = () => {
    if (!selectedEl) return null;
    const el = selectedEl;
    const hasStroke = el.type!=='image'&&el.type!=='sticky';
    const hasFill   = el.type==='rect'||el.type==='ellipse';
    const hasSw     = el.type!=='text'&&el.type!=='sticky'&&el.type!=='image';
    const hasText   = el.type==='text';
    const hasFs     = el.type==='text'||el.type==='sticky';
    return (
      <div className={styles.propsPanel}>
        <p className={styles.propsTitle}>Properties</p>
        {hasStroke && (
          <div className={styles.propRow}>
            <span className={styles.propLabel}>Stroke</span>
            <div className={styles.colorRow}>
              {PALETTE.map(c=>(
                <button key={c} className={`${styles.miniSwatch} ${(el.type==='text'?el.tc:(el as any).sc)===c?styles.miniSwatchActive:''}`}
                  style={{background:c}} onClick={()=>{
                    const ne=elsR.current.map(x=>{ if(x.id!==el.id)return x;
                      if(x.type==='text') return{...x,tc:c};
                      if(x.type==='sticky'||x.type==='image') return x;
                      return{...x,sc:c} as El; });
                    commit(ne); applySc(c);
                  }}
                />
              ))}
            </div>
          </div>
        )}
        {hasFill && (
          <div className={styles.propRow}>
            <span className={styles.propLabel}>Fill</span>
            <div className={styles.colorRow}>
              <button className={`${styles.miniSwatch} ${(el as any).fc==='none'?styles.miniSwatchActive:''}`}
                style={{background:'transparent',border:'2px solid #475569',position:'relative'}} title="No fill"
                onClick={()=>{ const ne=elsR.current.map(x=>x.id===el.id?{...x,fc:'none'}:x); commit(ne); applyFc('none'); }}>
                <div style={{position:'absolute',inset:2,background:'linear-gradient(to bottom right,transparent 45%,#ef4444 45%,#ef4444 55%,transparent 55%)'}}/>
              </button>
              {PALETTE.map(c=>(
                <button key={c} className={`${styles.miniSwatch} ${(el as any).fc===c?styles.miniSwatchActive:''}`}
                  style={{background:c}} onClick={()=>{ const ne=elsR.current.map(x=>x.id===el.id?{...x,fc:c}:x); commit(ne); applyFc(c); }}
                />
              ))}
            </div>
          </div>
        )}
        {hasSw && (
          <div className={styles.propRow}>
            <span className={styles.propLabel}>Width&nbsp;{(el as any).sw}px</span>
            <input type="range" min={1} max={20} value={(el as any).sw} className={styles.propSlider}
              onChange={e2=>{ const v=+e2.target.value; const ne=elsR.current.map(x=>x.id===el.id?{...x,sw:v}:x); elsR.current=ne; _setEls(ne); applySw(v); }}
              onMouseUp={()=>{ const i=histIdx.current; histR.current=[...histR.current.slice(0,i+1),elsR.current.map(x=>({...x}))]; histIdx.current=i+1; }}
            />
          </div>
        )}
        {hasFs && (
          <div className={styles.propRow}>
            <span className={styles.propLabel}>Size&nbsp;{(el as any).fs}px</span>
            <input type="range" min={10} max={72} value={(el as any).fs} className={styles.propSlider}
              onChange={e2=>{ const v=+e2.target.value; const ne=elsR.current.map(x=>x.id===el.id?{...x,fs:v}:x); elsR.current=ne; _setEls(ne); applyFs(v); }}
              onMouseUp={()=>{ const i=histIdx.current; histR.current=[...histR.current.slice(0,i+1),elsR.current.map(x=>({...x}))]; histIdx.current=i+1; }}
            />
          </div>
        )}
        {hasText && (
          <>
            <div className={styles.propRow}>
              <span className={styles.propLabel}>Style</span>
              <div style={{display:'flex',gap:6}}>
                <button className={`${styles.stylBtn} ${(el as TextEl).bold?styles.stylBtnActive:''}`}
                  onClick={()=>commit(elsR.current.map(x=>x.id===el.id?{...x,bold:!(x as TextEl).bold}:x))}>
                  <b>B</b>
                </button>
                <button className={`${styles.stylBtn} ${(el as TextEl).italic?styles.stylBtnActive:''}`}
                  onClick={()=>commit(elsR.current.map(x=>x.id===el.id?{...x,italic:!(x as TextEl).italic}:x))}>
                  <i>I</i>
                </button>
              </div>
            </div>
            <div className={styles.propRow}>
              <span className={styles.propLabel}>Font Family</span>
              <select
                value={(el as TextEl).ff || 'default'}
                className={styles.propSelect}
                onChange={e2 => {
                  const ffVal = e2.target.value as any;
                  commit(elsR.current.map(x => x.id === el.id ? { ...x, ff: ffVal } : x));
                }}
              >
                <option value="default">Default Sans-Serif</option>
                <option value="uthmanic">Quranic (Uthmanic Hafs)</option>
                <option value="amiri">Classical (Amiri)</option>
                <option value="cairo">Modern (Cairo)</option>
              </select>
            </div>
          </>
        )}
        <div className={styles.propRow}>
          <span className={styles.propLabel}>Opacity</span>
          <input type="range" min={10} max={100} value={Math.round(el.op*100)} className={styles.propSlider}
            onChange={e2=>{ const v=+e2.target.value/100; const ne=elsR.current.map(x=>x.id===el.id?{...x,op:v}:x); elsR.current=ne; _setEls(ne); }}
            onMouseUp={()=>{ const i=histIdx.current; histR.current=[...histR.current.slice(0,i+1),elsR.current.map(x=>({...x}))]; histIdx.current=i+1; }}
          />
        </div>
        <div style={{display:'flex',gap:6,marginTop:8}}>
          <button className={styles.propActionBtn} onClick={()=>{
            const maxZ=Math.max(...elsR.current.map(x=>x.z),0)+1;
            commit(elsR.current.map(x=>x.id===el.id?{...x,z:maxZ}:x));
          }}>↑ Front</button>
          <button className={styles.propActionBtn} onClick={()=>{
            const minZ=Math.max(0,Math.min(...elsR.current.map(x=>x.z))-1);
            commit(elsR.current.map(x=>x.id===el.id?{...x,z:minZ}:x));
          }}>↓ Back</button>
        </div>
        <button className={styles.propDeleteBtn} onClick={()=>{ commit(elsR.current.filter(x=>!selR.current.includes(x.id))); applySel([]); }}>
          🗑 Delete
        </button>
      </div>
    );
  };

  /* ── Secondary menu for tool options ─────────────────────────────────── */
  const renderSecondaryMenu = () => {
    const showMenu = ['draw', 'qalam', 'rect', 'ellipse', 'line', 'arrow', 'text', 'sticky'].includes(tool);
    if (!showMenu) return null;

    return (
      <div className={styles.secondaryMenu}>
        {/* Stroke color selector for draw, qalam, rect, ellipse, line, arrow */}
        {['draw', 'qalam', 'rect', 'ellipse', 'line', 'arrow'].includes(tool) && (
          <div className={styles.propRow}>
            <span className={styles.propLabel}>Stroke Color</span>
            <div className={styles.secondarySwatchGrid}>
              {PALETTE.map(c => (
                <button
                  key={c}
                  className={`${styles.secondarySwatch} ${sc === c ? styles.secondarySwatchActive : ''}`}
                  style={{ background: c }}
                  onClick={() => applySc(c)}
                  title={c}
                />
              ))}
              <input
                type="color"
                value={sc}
                onChange={e2 => applySc(e2.target.value)}
                className={styles.secondaryColorPicker}
                title="Custom color"
              />
            </div>
          </div>
        )}

        {/* Fill color selector for rect, ellipse */}
        {['rect', 'ellipse'].includes(tool) && (
          <div className={styles.propRow}>
            <span className={styles.propLabel}>Fill Color</span>
            <div className={styles.secondarySwatchGrid}>
              <button
                className={`${styles.secondarySwatch} ${fc === 'none' ? styles.secondarySwatchActive : ''}`}
                style={{ background: 'transparent', border: '1.5px solid #475569', position: 'relative' }}
                title="No fill"
                onClick={() => applyFc('none')}
              >
                <div style={{ position: 'absolute', inset: 2, background: 'linear-gradient(135deg,transparent 45%,#ef4444 45%,#ef4444 55%,transparent 55%)' }} />
              </button>
              {PALETTE.map(c => (
                <button
                  key={c}
                  className={`${styles.secondarySwatch} ${fc === c ? styles.secondarySwatchActive : ''}`}
                  style={{ background: c }}
                  onClick={() => applyFc(c)}
                  title={c}
                />
              ))}
            </div>
          </div>
        )}

        {/* Stroke width selector for draw, qalam, rect, ellipse, line, arrow */}
        {['draw', 'qalam', 'rect', 'ellipse', 'line', 'arrow'].includes(tool) && (
          <div className={styles.propRow}>
            <span className={styles.propLabel}>{tool === 'qalam' ? 'Pen Thickness' : 'Stroke Width'} ({sw}px)</span>
            <input
              type="range"
              min={tool === 'qalam' ? 3 : 1}
              max={tool === 'qalam' ? 40 : 20}
              value={sw}
              onChange={e2 => applySw(+e2.target.value)}
              className={styles.secondarySlider}
            />
          </div>
        )}

        {/* Calligraphy Qalam Nib Angle selector */}
        {tool === 'qalam' && (
          <div className={styles.propRow}>
            <span className={styles.propLabel}>Nib Angle ({nibAngle}°)</span>
            <input
              type="range"
              min={0}
              max={90}
              value={nibAngle}
              onChange={e2 => applyNibAngle(+e2.target.value)}
              className={styles.secondarySlider}
            />
          </div>
        )}

        {/* Text Options (Font Size and Text Color) */}
        {tool === 'text' && (
          <>
            <div className={styles.propRow}>
              <span className={styles.propLabel}>Text Color</span>
              <div className={styles.secondarySwatchGrid}>
                {PALETTE.map(c => (
                  <button
                    key={c}
                    className={`${styles.secondarySwatch} ${sc === c ? styles.secondarySwatchActive : ''}`}
                    style={{ background: c }}
                    onClick={() => applySc(c)}
                    title={c}
                  />
                ))}
                <input
                  type="color"
                  value={sc}
                  onChange={e2 => applySc(e2.target.value)}
                  className={styles.secondaryColorPicker}
                  title="Custom color"
                />
              </div>
            </div>
            <div className={styles.propRow}>
              <span className={styles.propLabel}>Font Size ({fs}px)</span>
              <input
                type="range"
                min={10}
                max={72}
                value={fs}
                onChange={e2 => applyFs(+e2.target.value)}
                className={styles.secondarySlider}
              />
            </div>
          </>
        )}

        {/* Sticky Options (Sticky Note color selection) */}
        {tool === 'sticky' && (
          <div className={styles.propRow}>
            <span className={styles.propLabel}>Sticky Color</span>
            <div className={styles.secondarySwatchGrid}>
              {STICKY_PAL.map((p, idx) => (
                <button
                  key={p.bg}
                  className={`${styles.secondarySwatch} ${si === idx ? styles.secondarySwatchActive : ''}`}
                  style={{ background: p.bg }}
                  onClick={() => applySi(idx)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  /* ── JSX ─────────────────────────────────────────────────────────────── */
  if (!isOpen) return null;

  const sortedEls = [...els].sort((a,b)=>a.z-b.z);
  const svgEls = sortedEls.filter(e=>e.type!=='text'&&e.type!=='sticky');
  const divEls = sortedEls.filter(e=>e.type==='text'||e.type==='sticky');
  const canSelect = tool==='select'||tool==='eraser';

  return (
    <div className={styles.overlay}>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageUpload}
      />

      {/* ─── Top Bar ─────────────────────────────────────────────────── */}
      <div className={styles.topBar}>
        <div className={styles.topLeft}>
          <span className={styles.boardTitle} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Pencil size={18} /> Whiteboard
          </span>
          <div className={styles.boardSelectContainer}>
            <select
              value={activeBoardId}
              onChange={e => handleSwitchBoard(e.target.value)}
              className={styles.boardSelect}
            >
              {boards.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            <button className={styles.boardActionBtn} onClick={handleCreateBoard} title="New Sheet">+</button>
            <button className={styles.boardActionBtn} onClick={handleRenameBoard} title="Rename Sheet">✎</button>
            {boards.length > 1 && (
              <button className={styles.boardActionBtn} onClick={handleDeleteBoard} title="Delete Sheet">✕</button>
            )}
          </div>
        </div>
        <div className={styles.topCenter}>
          <button className={styles.topBtn} onClick={undo} title="Undo (Ctrl+Z)">
            <Undo2 size={15} />
          </button>
          <button className={styles.topBtn} onClick={redo} title="Redo (Ctrl+Y)">
            <Redo2 size={15} />
          </button>
          <div className={styles.topDiv}/>
          <button className={`${styles.topBtn} ${styles.topBtnAmber}`} title="Import Quran Verse" onClick={() => setIsImportOpen(true)}>
            <BookOpen size={14} /> Import Verse
          </button>
          <button className={styles.topBtn} title="Clear all"
            onClick={()=>{ commit([]); applySel([]); }}>
            <Trash2 size={14} /> Clear
          </button>
          <button className={`${styles.topBtn} ${styles.topBtnGreen}`} title="Export PNG" onClick={exportPng}>
            <Download size={14} /> Export PNG
          </button>
        </div>
        <div className={styles.topRight}>
          <button className={styles.topBtn} onClick={()=>setHelp(p=>!p)} title="Keyboard shortcuts (?)">
            <HelpCircle size={14} /> Help
          </button>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ─── Main area ───────────────────────────────────────────────── */}
      <div className={styles.mainArea}>
        {/* Left Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.toolSection}>
            {TOOLS.map(t=>(
              <button key={t.id}
                className={`${styles.toolBtn} ${tool===t.id?styles.toolBtnActive:''}`}
                onClick={()=>{
                  if (t.id === 'image') triggerImageUpload();
                  else applyTool(t.id);
                }}
                title={`${t.label} (${t.key})`}
              >
                <span className={styles.toolIcon}>
                  <t.icon size={18} />
                </span>
                <span className={styles.toolLabel}>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Floating Secondary Options Menu */}
        {renderSecondaryMenu()}

        {/* Canvas */}
        <div
          ref={ctrRef}
          className={styles.canvas}
          style={{
            cursor: spaceActive ? 'grab' : getCursor()
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={handleDblClick}
        >
          {/* Board inner — the transformed HTML coordinate space */}
          <div
            className={styles.boardInner}
            style={{ transform:`translate(${panX}px,${panY}px) scale(${zoom})`, transformOrigin:'0 0' }}
          >
            {/* HTML overlay — text and sticky elements */}
            {divEls.map(el=>el.type==='text' ? renderTextEl(el as TextEl) : renderStickyEl(el as StickyEl))}
          </div>

          {/* SVG layer — vector elements, positioned over/under but fills viewport */}
          <svg
            ref={svgRef}
            className={styles.svgLayer}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              pointerEvents: 'none'
            }}
            role="presentation"
          >
            <defs>
              <pattern id="dot-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1.2" fill="var(--wb-grid)" />
              </pattern>
              <pattern id="ruled-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <line x1="0" y1="40" x2="40" y2="40" stroke="var(--wb-grid)" strokeWidth="1" />
              </pattern>
              <pattern id="calligraphy-pattern" width="80" height="80" patternUnits="userSpaceOnUse">
                {/* Rule lines */}
                <line x1="0" y1="20" x2="80" y2="20" stroke="var(--wb-grid)" strokeWidth="0.8" strokeDasharray="3,3" />
                <line x1="0" y1="40" x2="80" y2="40" stroke="var(--wb-grid)" strokeWidth="1.2" />
                <line x1="0" y1="60" x2="80" y2="60" stroke="var(--wb-grid)" strokeWidth="0.8" strokeDasharray="3,3" />
                <line x1="0" y1="80" x2="80" y2="80" stroke="var(--wb-grid)" strokeWidth="1.2" />
                {/* Slanted calligraphy guidelines at 40 degrees */}
                <line x1="0" y1="80" x2="80" y2="0" stroke="var(--wb-grid)" strokeWidth="0.6" strokeDasharray="2,4" />
                <line x1="40" y1="80" x2="120" y2="0" stroke="var(--wb-grid)" strokeWidth="0.6" strokeDasharray="2,4" />
              </pattern>
            </defs>

            <g transform={`translate(${panX},${panY}) scale(${zoom})`}>
              {/* Infinite Grid Background Rect */}
              {gridType !== 'none' && (
                <rect
                  x={-100000}
                  y={-100000}
                  width={200000}
                  height={200000}
                  fill={`url(#${gridType}-pattern)`}
                  style={{ pointerEvents: 'none' }}
                />
              )}

              <g style={{pointerEvents: canSelect ? 'all' : 'none'}}>
                {svgEls.map(el=>renderSvgEl(el, el.id, canSelect))}
              </g>
              {/* Live shape preview */}
              {renderLiveSvg(live)}
              {/* Live freehand path */}
              <path ref={livePathR} d="" fill="none" stroke={sc} strokeWidth={sw}
                strokeLinecap="round" strokeLinejoin="round" style={{pointerEvents:'none'}} />
              {/* Laser Pointer fading segments */}
              {laserSegments.map(seg => (
                <line
                  key={seg.id}
                  x1={seg.x1}
                  y1={seg.y1}
                  x2={seg.x2}
                  y2={seg.y2}
                  stroke="#ef4444"
                  strokeWidth={6 / zoom}
                  strokeLinecap="round"
                  opacity={seg.op}
                  style={{ pointerEvents: 'none', filter: 'drop-shadow(0 0 2px #ef4444)' }}
                />
              ))}
              {/* Selection handles (in board space so they scale) */}
              {renderHandles()}
              {/* Rubber-band selection box */}
              {selBox && (
                <rect x={selBox.x} y={selBox.y} width={selBox.w} height={selBox.h}
                  fill="rgba(59,130,246,0.08)" stroke="#3b82f6"
                  strokeWidth={1.5/zoom} strokeDasharray={`${4/zoom},${2/zoom}`}
                  style={{pointerEvents:'none'}} />
              )}
            </g>
          </svg>
        </div>

        {/* Right Properties Panel */}
        {selIds.length>0 && renderPropsPanel()}
      </div>

      {/* ─── Bottom Zoom Bar ─────────────────────────────────────────── */}
      <div className={styles.zoomBar}>
        <select
          value={gridType}
          onChange={e => setGridType(e.target.value as any)}
          className={styles.gridSelect}
          title="Canvas grid style"
        >
          <option value="dot">Dots Grid</option>
          <option value="ruled">Ruled lines</option>
          <option value="calligraphy">Arabic Guide</option>
          <option value="none">Blank</option>
        </select>
        <div className={styles.topDiv} style={{ height: 16 }} />
        <button className={styles.zoomBtn} onClick={()=>zoomBy(1/1.2)} title="Zoom out">−</button>
        <span className={styles.zoomLabel}>{Math.round(zoom*100)}%</span>
        <button className={styles.zoomBtn} onClick={()=>zoomBy(1.2)} title="Zoom in">+</button>
        <button className={styles.zoomBtn} onClick={resetZoom} title="Reset zoom">100%</button>
        <button className={styles.zoomBtn} onClick={()=>{ applyPan(0,0); applyZoom(1); }} title="Fit view">⤢ Fit</button>
      </div>

      {/* ─── Help Overlay ────────────────────────────────────────────── */}
      {showHelp && (
        <div className={styles.helpOverlay} onClick={()=>setHelp(false)}>
          <div className={styles.helpCard} onClick={e=>e.stopPropagation()}>
            <div className={styles.helpHeader}>
              <span>⌨ Keyboard Shortcuts</span>
              <button onClick={()=>setHelp(false)} className={styles.helpClose}>✕</button>
            </div>
            <div className={styles.helpGrid}>
              {[
                ['V','Select / Move'],['P','Freehand Draw'],['Q','Calligraphy Qalam'],['K','Laser Pointer'],['R','Rectangle'],
                ['O','Ellipse'],['L','Line'],['A','Arrow'],
                ['T','Text Box'],['N','Sticky Note'],['E','Eraser'],
                ['Ctrl+Z','Undo'],['Ctrl+Y','Redo'],['Ctrl+A','Select All'],
                ['Delete','Delete selected'],['Space+Drag','Pan canvas'],
                ['Scroll','Zoom in/out'],['Esc','Deselect / Close'],['?','Toggle this help'],
              ].map(([k,v])=>(
                <React.Fragment key={k}>
                  <kbd className={styles.kbdKey}>{k}</kbd>
                  <span className={styles.kbdDesc}>{v}</span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Quran Importer Modal ─── */}
      {isImportOpen && (
        <div className={styles.quranModalOverlay} onClick={() => setIsImportOpen(false)}>
          <div className={styles.quranModalCard} onClick={e => e.stopPropagation()}>
            <div className={styles.quranModalHeader}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
                <BookOpen size={18} /> Import Quran Verse
              </span>
              <button onClick={() => setIsImportOpen(false)} className={styles.quranModalClose}>
                <X size={18} />
              </button>
            </div>

            <div className={styles.quranModalBody}>
              <div className={styles.quranModalField}>
                <label className={styles.quranModalLabel}>Select Surah</label>
                <select
                  value={selectedSurahNum}
                  onChange={e => {
                    const num = parseInt(e.target.value);
                    setSelectedSurahNum(num);
                    setSelectedAyahNum(1); // Reset ayah
                  }}
                  className={styles.quranModalSelect}
                >
                  {surahs.map(s => (
                    <option key={s.number} value={s.number}>
                      {s.number}. {s.transliteration} ({s.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.quranModalField}>
                <label className={styles.quranModalLabel}>Ayah Number (1 - {surahs.find(s => s.number === selectedSurahNum)?.totalVerses || 7})</label>
                <input
                  type="number"
                  min={1}
                  max={surahs.find(s => s.number === selectedSurahNum)?.totalVerses || 7}
                  value={selectedAyahNum}
                  onChange={e => setSelectedAyahNum(Math.max(1, parseInt(e.target.value) || 1))}
                  className={styles.quranModalInput}
                />
              </div>

              {previewText && (
                <div className={styles.quranModalPreview}>
                  <p className={styles.quranModalPreviewLabel}>Verse Preview:</p>
                  <p className="arabic-text" style={{ fontSize: '1.4rem', direction: 'rtl', textAlign: 'right', marginTop: 6, maxHeight: 120, overflowY: 'auto', border: '1px dashed var(--wb-chrome-border)', padding: 8, borderRadius: 6, color: 'var(--primary)' }}>
                    {previewText}
                  </p>
                </div>
              )}
            </div>

            <div className={styles.quranModalFooter}>
              <button className={styles.quranModalCancelBtn} onClick={() => setIsImportOpen(false)}>
                Cancel
              </button>
              <button className={styles.quranModalImportBtn} onClick={handleImportVerse}>
                Import to Canvas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
