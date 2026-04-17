import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type ThemeId =
  | 'light'
  | 'light-teal'
  | 'light-slate'
  | 'dark-blue'
  | 'dark-gold'
  | 'dark-teal'
  | 'dark-purple'
  | 'dark-red'
  | 'graphite';

export interface Theme {
  id: ThemeId;
  label: string;
  dark: boolean;
  accentPreview: string; // color hex para el botón de preview
  bgPreview: string;
}

export const THEMES: Theme[] = [
  // ── Light ──
  { id: 'light',       label: 'Light',        dark: false, accentPreview: '#2563EB', bgPreview: '#ffffff'  },
  { id: 'light-teal',  label: 'Light Teal',   dark: false, accentPreview: '#0D9488', bgPreview: '#F0FDFA'  },
  { id: 'light-slate', label: 'Light Slate',  dark: false, accentPreview: '#7C3AED', bgPreview: '#F1F5F9'  },
  // ── Dark ──
  { id: 'dark-blue',   label: 'Dark Blue',    dark: true,  accentPreview: '#3B82F6', bgPreview: '#1A1D27'  },
  { id: 'dark-gold',   label: 'Dark Gold',    dark: true,  accentPreview: '#F59E0B', bgPreview: '#1C1C1C'  },
  { id: 'dark-teal',   label: 'Dark Teal',    dark: true,  accentPreview: '#10B981', bgPreview: '#121A16'  },
  { id: 'dark-purple', label: 'Dark Purple',  dark: true,  accentPreview: '#8B5CF6', bgPreview: '#15121F'  },
  { id: 'dark-red',    label: 'Dark Red',     dark: true,  accentPreview: '#EF4444', bgPreview: '#1A1111'  },
  { id: 'graphite',    label: 'Graphite',     dark: true,  accentPreview: '#6B7280', bgPreview: '#1A1A1A'  },
];

const STORAGE_KEY = 'm2pos_theme';
const DEFAULT_THEME: ThemeId = 'dark-gold';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly doc = inject(DOCUMENT);

  // ── State ──
  readonly activeThemeId = signal<ThemeId>(this.loadFromStorage());
  readonly themes = THEMES;

  readonly activeTheme = computed(
    () => THEMES.find(t => t.id === this.activeThemeId()) ?? THEMES[0]
  );
  readonly isDark = computed(() => this.activeTheme().dark);

  constructor() {
    // Aplica el tema cada vez que cambia (effect reactivo)
    effect(() => {
      this.applyTheme(this.activeThemeId());
    });
  }

  setTheme(id: ThemeId): void {
    this.activeThemeId.set(id);
    localStorage.setItem(STORAGE_KEY, id);
  }

  private applyTheme(id: ThemeId): void {
    this.doc.documentElement.setAttribute('data-theme', id);
  }

  private loadFromStorage(): ThemeId {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
    return saved && THEMES.some(t => t.id === saved) ? saved : DEFAULT_THEME;
  }
}
