import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
  when?: () => boolean;
}

const shortcuts: KeyboardShortcut[] = [
  {
    key: 'k',
    meta: true,
    action: () => {
      const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
      searchInput?.focus();
    },
    description: 'Focus search',
  },
  {
    key: 'p',
    meta: true,
    action: () => {
      window.print();
    },
    description: 'Print page',
  },
  {
    key: 's',
    meta: true,
    action: () => {
      const saveButton = document.querySelector('[data-shortcut="save"]') as HTMLButtonElement;
      saveButton?.click();
    },
    description: 'Save',
  },
  {
    key: '/',
    alt: true,
    action: () => {
      const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
      searchInput?.focus();
    },
    description: 'Focus search (Alt+/)',
  },
  {
    key: 'Escape',
    action: () => {
      const modal = document.querySelector('[role="dialog"]');
      const closeButton = modal?.querySelector('[aria-label="Close modal"]') as HTMLButtonElement;
      closeButton?.click();
    },
    description: 'Close modal/dialog',
  },
];

export function useKeyboardShortcuts(customShortcuts: KeyboardShortcut[] = []) {
  const allShortcuts = [...shortcuts, ...customShortcuts];

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const isMac = navigator.platform.includes('Mac');
    const cmdKey = isMac ? e.metaKey : e.ctrlKey;

    for (const shortcut of allShortcuts) {
      const matchesKey = e.key.toLowerCase() === shortcut.key.toLowerCase();
      const matchesCtrl = shortcut.ctrl === true ? e.ctrlKey : shortcut.meta === true ? cmdKey : true;
      const matchesMeta = shortcut.meta === true ? cmdKey : true;
      const matchesShift = shortcut.shift === undefined ? true : e.shiftKey === shortcut.shift;
      const matchesAlt = shortcut.alt === undefined ? true : e.altKey === shortcut.alt;
      const condition = shortcut.when === undefined ? true : shortcut.when();

      if (matchesKey && matchesCtrl && matchesMeta && matchesShift && matchesAlt && condition) {
        e.preventDefault();
        e.stopPropagation();
        shortcut.action();
        break;
      }
    }
  }, [allShortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return allShortcuts;
}