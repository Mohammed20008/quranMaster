// Avatar utility functions and constants

export const AVATAR_PRESETS = [
  // Gradient Circles
  { id: 'gradient-gold', type: 'gradient' as const, colors: ['#d4af37', '#b4941f'], name: 'Golden Gradient' },
  { id: 'gradient-emerald', type: 'gradient' as const, colors: ['#10b981', '#059669'], name: 'Emerald Gradient' },
  { id: 'gradient-blue', type: 'gradient' as const, colors: ['#3b82f6', '#2563eb'], name: 'Blue Gradient' },
  { id: 'gradient-purple', type: 'gradient' as const, colors: ['#8b5cf6', '#7c3aed'], name: 'Purple Gradient' },
  { id: 'gradient-pink', type: 'gradient' as const, colors: ['#ec4899', '#db2777'], name: 'Pink Gradient' },
  { id: 'gradient-orange', type: 'gradient' as const, colors: ['#f59e0b', '#d97706'], name: 'Orange Gradient' },
  { id: 'gradient-teal', type: 'gradient' as const, colors: ['#14b8a6', '#0d9488'], name: 'Teal Gradient' },
  { id: 'gradient-rose', type: 'gradient' as const, colors: ['#f43f5e', '#e11d48'], name: 'Rose Gradient' },
  
  // Islamic Patterns
  { id: 'pattern-gold-star', type: 'pattern' as const, pattern: 'geometric-star', color: '#d4af37', name: 'Golden Star' },
  { id: 'pattern-emerald-star', type: 'pattern' as const, pattern: 'geometric-star', color: '#10b981', name: 'Emerald Star' },
  { id: 'pattern-blue-arabesque', type: 'pattern' as const, pattern: 'arabesque', color: '#3b82f6', name: 'Blue Arabesque' },
  { id: 'pattern-purple-arabesque', type: 'pattern' as const, pattern: 'arabesque', color: '#8b5cf6', name: 'Purple Arabesque' },
  
  // Solid Colors
  { id: 'solid-gold', type: 'solid' as const, color: '#d4af37', name: 'Solid Gold' },
  { id: 'solid-emerald', type: 'solid' as const, color: '#10b981', name: 'Solid Emerald' },
  { id: 'solid-blue', type: 'solid' as const, color: '#3b82f6', name: 'Solid Blue' },
  { id: 'solid-purple', type: 'solid' as const, color: '#8b5cf6', name: 'Solid Purple' },
  { id: 'solid-pink', type: 'solid' as const, color: '#ec4899', name: 'Solid Pink' },
  { id: 'solid-teal', type: 'solid' as const, color: '#14b8a6', name: 'Solid Teal' },
];

export type AvatarPreset = typeof AVATAR_PRESETS[0];

/**
 * Generate avatar style object from preset
 */
export function getAvatarStyle(
  preset: AvatarPreset,
  size: number = 120,
  userInitial: string = 'U'
): React.CSSProperties {
  const baseStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: `${size / 3}px`,
    fontWeight: 'bold',
    flexShrink: 0,
  };

  if (preset.type === 'gradient') {
    return {
      ...baseStyle,
      background: `linear-gradient(135deg, ${preset.colors[0]}, ${preset.colors[1]})`,
    };
  }

  if (preset.type === 'pattern') {
    const patternSVG = preset.pattern === 'geometric-star'
      ? `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0L24 16L40 20L24 24L20 40L16 24L0 20L16 16z' fill='rgba(255,255,255,0.15)'/%3E%3C/svg%3E")`
      : `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='20' fill='none' stroke='rgba(255,255,255,0.15)' stroke-width='2'/%3E%3Ccircle cx='30' cy='30' r='15' fill='none' stroke='rgba(255,255,255,0.15)' stroke-width='2'/%3E%3C/svg%3E")`;
    
    return {
      ...baseStyle,
      background: preset.color,
      backgroundImage: patternSVG,
      backgroundSize: preset.pattern === 'geometric-star' ? '40px 40px' : '60px 60px',
    };
  }

  if (preset.type === 'solid') {
    return {
      ...baseStyle,
      background: preset.color,
    };
  }

  return baseStyle;
}

/**
 * Get avatar preset by ID
 */
export function getAvatarPreset(id?: string): AvatarPreset {
  return AVATAR_PRESETS.find(p => p.id === id) || AVATAR_PRESETS[0];
}

/**
 * Render avatar component
 */
export function renderAvatar(
  preset: AvatarPreset,
  userName: string,
  size: number = 120,
  className?: string
): JSX.Element {
  const userInitial = userName ? userName[0].toUpperCase() : 'U';
  const style = getAvatarStyle(preset, size, userInitial);

  return (
    <div style={style} className={className}>
      {userInitial}
    </div>
  );
}
