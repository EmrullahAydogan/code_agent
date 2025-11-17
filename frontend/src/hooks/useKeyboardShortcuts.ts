import { useEffect, useCallback, useRef } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  description: string;
  handler: (event: KeyboardEvent) => void;
  preventDefault?: boolean;
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

export const useKeyboardShortcuts = ({
  shortcuts,
  enabled = true,
}: UseKeyboardShortcutsOptions) => {
  const shortcutsRef = useRef<KeyboardShortcut[]>(shortcuts);

  // Update shortcuts ref when they change
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    const matchedShortcut = shortcutsRef.current.find((shortcut) => {
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatch = shortcut.ctrlKey === undefined || event.ctrlKey === shortcut.ctrlKey;
      const metaMatch = shortcut.metaKey === undefined || event.metaKey === shortcut.metaKey;
      const shiftMatch = shortcut.shiftKey === undefined || event.shiftKey === shortcut.shiftKey;
      const altMatch = shortcut.altKey === undefined || event.altKey === shortcut.altKey;

      return keyMatch && ctrlMatch && metaMatch && shiftMatch && altMatch;
    });

    if (matchedShortcut) {
      if (matchedShortcut.preventDefault !== false) {
        event.preventDefault();
        event.stopPropagation();
      }
      matchedShortcut.handler(event);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);
};

// Format shortcut for display
export const formatShortcut = (shortcut: KeyboardShortcut): string => {
  const parts: string[] = [];

  // Use Cmd on Mac, Ctrl on Windows/Linux
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  if (shortcut.ctrlKey || shortcut.metaKey) {
    parts.push(isMac ? '⌘' : 'Ctrl');
  }

  if (shortcut.shiftKey) {
    parts.push('⇧');
  }

  if (shortcut.altKey) {
    parts.push(isMac ? '⌥' : 'Alt');
  }

  // Format key name
  const keyName = shortcut.key.length === 1
    ? shortcut.key.toUpperCase()
    : shortcut.key.charAt(0).toUpperCase() + shortcut.key.slice(1);

  parts.push(keyName);

  return parts.join(isMac ? '' : '+');
};
