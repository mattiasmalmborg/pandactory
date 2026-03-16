/**
 * Storage key configuration
 *
 * Preview builds use separate localStorage keys to avoid
 * corrupting the main game save when testing on GitHub Pages.
 *
 * Main:    https://mattiasmalmborg.github.io/pandactory/
 * Preview: https://mattiasmalmborg.github.io/pandactory/preview/
 */

const isPreview = import.meta.env.VITE_PREVIEW === 'true';
const PREFIX = isPreview ? 'pandactory-preview' : 'pandactory';

export const STORAGE_KEYS = {
  save: `${PREFIX}-save`,
  currentView: `${PREFIX}-current-view`,
  resetPending: `${PREFIX}-reset-pending`,
} as const;

export const IS_PREVIEW = isPreview;
