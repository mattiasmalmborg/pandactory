/**
 * Centralized Asset Configuration
 *
 * This file defines all asset paths used in the game.
 * Each asset type has a path generator function and optional fallback values.
 *
 * File naming conventions:
 * - Backgrounds: /assets/backgrounds/bg_{id}.jpg
 * - Biome icons: /assets/icons/biome_{id}.png
 * - Resources: /assets/resources/res_{id}.png
 * - Food: /assets/food/food_{id}.png
 * - UI elements: /assets/ui/{name}.png
 * - Icons: /assets/icons/icon_{name}.png
 * - Sprites: /assets/sprites/{name}.png
 */

import { BiomeId } from '../types/game.types';

// Get base URL from Vite (handles GitHub Pages subpath)
const BASE = import.meta.env.BASE_URL;

export const ASSET_PATHS = {
  backgrounds: `${BASE}assets/backgrounds`,
  icons: `${BASE}assets/icons`,
  resources: `${BASE}assets/resources`,
  food: `${BASE}assets/food`,
  ui: `${BASE}assets/ui`,
  sprites: `${BASE}assets/sprites`,
} as const;

/**
 * Asset configuration for each component/screen
 * Note: Uses functions to ensure BASE is evaluated at runtime
 */
export const getAssetConfig = () => ({
  // Biome backgrounds
  biomes: {
    lush_forest: {
      background: `${BASE}assets/backgrounds/bg_lush_forest.jpg`,
      icon: `${BASE}assets/icons/biome_lush_forest.png`,
      fallbackGradient: 'from-green-900 via-green-800 to-emerald-900',
    },
    misty_lake: {
      background: `${BASE}assets/backgrounds/bg_misty_lake.jpg`,
      icon: `${BASE}assets/icons/biome_misty_lake.png`,
      fallbackGradient: 'from-blue-900 via-cyan-800 to-blue-900',
    },
    arid_desert: {
      background: `${BASE}assets/backgrounds/bg_arid_desert.jpg`,
      icon: `${BASE}assets/icons/biome_arid_desert.png`,
      fallbackGradient: 'from-orange-900 via-yellow-800 to-orange-900',
    },
    frozen_tundra: {
      background: `${BASE}assets/backgrounds/bg_frozen_tundra.jpg`,
      icon: `${BASE}assets/icons/biome_frozen_tundra.png`,
      fallbackGradient: 'from-cyan-900 via-blue-800 to-indigo-900',
    },
    volcanic_isle: {
      background: `${BASE}assets/backgrounds/bg_volcanic_isle.jpg`,
      icon: `${BASE}assets/icons/biome_volcanic_isle.png`,
      fallbackGradient: 'from-red-900 via-orange-800 to-red-900',
    },
    crystal_caverns: {
      background: `${BASE}assets/backgrounds/bg_crystal_caverns.jpg`,
      icon: `${BASE}assets/icons/biome_crystal_caverns.png`,
      fallbackGradient: 'from-purple-900 via-pink-800 to-purple-900',
    },
  },

  // Special screens
  screens: {
    dashboard: {
      background: `${BASE}assets/backgrounds/bg_dashboard.jpg`,
      fallbackGradient: 'from-gray-900 via-gray-800 to-gray-900',
    },
    skillTree: {
      background: `${BASE}assets/backgrounds/bg_skill_tree.jpg`,
      fallbackGradient: 'from-purple-900 via-indigo-900 to-purple-900',
    },
    prestige: {
      background: `${BASE}assets/backgrounds/bg_prestige.jpg`,
      fallbackGradient: 'from-purple-900 via-pink-900 to-purple-900',
    },
    skills_stats: {
      background: `${BASE}assets/backgrounds/bg_skills_stats.jpg`,
      fallbackGradient: 'from-indigo-900 via-purple-800 to-indigo-900',
    },
  },

  // UI elements - Cards, Panels, and Components
  ui: {
    logo: `${BASE}assets/ui/logo.png`,

    // Cards (used for automations, expeditions, skills, etc.)
    cards: {
      automation: `${BASE}assets/ui/cards/card_automation.png`,
      expedition: `${BASE}assets/ui/cards/card_expedition.png`,
      skill: `${BASE}assets/ui/cards/card_skill.png`,
      resource: `${BASE}assets/ui/cards/card_resource.png`,
      biome: `${BASE}assets/ui/cards/card_biome.png`,
      generic: `${BASE}assets/ui/cards/card_generic.png`,
    },

    // Panels (larger containers for sections)
    panels: {
      main: `${BASE}assets/ui/panels/panel_main.png`,
      header: `${BASE}assets/ui/panels/panel_header.png`,
      modal: `${BASE}assets/ui/panels/panel_modal.png`,
      sidebar: `${BASE}assets/ui/panels/panel_sidebar.png`,
    },

    // Buttons (different states and types)
    buttons: {
      primary: `${BASE}assets/ui/buttons/btn_primary.png`,
      secondary: `${BASE}assets/ui/buttons/btn_secondary.png`,
      success: `${BASE}assets/ui/buttons/btn_success.png`,
      danger: `${BASE}assets/ui/buttons/btn_danger.png`,
      disabled: `${BASE}assets/ui/buttons/btn_disabled.png`,
    },

    // Navigation icons (bottom menu)
    navigation: {
      home: `${BASE}assets/ui/nav/nav_home.png`,
      biome: `${BASE}assets/ui/nav/nav_biome.png`,
      explore: `${BASE}assets/ui/nav/nav_explore.png`,
      skills: `${BASE}assets/ui/nav/nav_skills.png`,
    },

    // Action icons (gather, build, upgrade, etc.)
    actions: {
      gather: `${BASE}assets/ui/actions/action_gather.png`,
      build: `${BASE}assets/ui/actions/action_build.png`,
      upgrade: `${BASE}assets/ui/actions/action_upgrade.png`,
      launch: `${BASE}assets/ui/actions/action_launch.png`,
      prestige: `${BASE}assets/ui/actions/action_prestige.png`,
    },
  },

  // Sprites
  sprites: {
    spaceship: `${BASE}assets/sprites/Spaceship.png`,
    spaceshipPanda: `${BASE}assets/sprites/Spaceship_Panda.png`,
  },
});

// For backward compatibility - lazy evaluated
export const ASSET_CONFIG = getAssetConfig();

/**
 * Helper type for extracting asset config keys
 */
export type BiomeAssetConfig = typeof ASSET_CONFIG.biomes;
export type ScreenAssetConfig = typeof ASSET_CONFIG.screens;

/**
 * Get background image path for a biome or screen
 */
export function getBiomeBackgroundPath(biomeId: BiomeId | 'dashboard' | 'skills_stats'): string {
  if (biomeId === 'dashboard') {
    return ASSET_CONFIG.screens.dashboard.background;
  }
  if (biomeId === 'skills_stats') {
    return ASSET_CONFIG.screens.skills_stats.background;
  }
  return ASSET_CONFIG.biomes[biomeId].background;
}

/**
 * Get fallback gradient for a biome or screen
 */
export function getFallbackGradient(id: BiomeId | 'dashboard' | 'skillTree' | 'prestige' | 'skills_stats'): string {
  if (id === 'dashboard' || id === 'skillTree' || id === 'prestige' || id === 'skills_stats') {
    return ASSET_CONFIG.screens[id].fallbackGradient;
  }
  return ASSET_CONFIG.biomes[id].fallbackGradient;
}

/**
 * Get biome icon path
 */
export function getBiomeIconPath(biomeId: BiomeId): string {
  return ASSET_CONFIG.biomes[biomeId].icon;
}

/**
 * Get resource image path
 */
export function getResourceImagePath(resourceId: string): string {
  return `${ASSET_PATHS.resources}/res_${resourceId}.png`;
}

/**
 * Get food image path
 */
export function getFoodImagePath(foodId: string): string {
  return `${ASSET_PATHS.food}/food_${foodId}.png`;
}

/**
 * Get UI element path
 */
export function getUIElementPath(elementName: string): string {
  return `${ASSET_PATHS.ui}/${elementName}.png`;
}

/**
 * Get icon path
 */
export function getIconPath(iconName: string): string {
  return `${ASSET_PATHS.icons}/icon_${iconName}.png`;
}

/**
 * Get sprite path
 */
export function getSpritePath(spriteName: string): string {
  return `${ASSET_PATHS.sprites}/${spriteName}.png`;
}

/**
 * Get screen background path
 */
export function getScreenBackgroundPath(screenId: 'dashboard' | 'skillTree' | 'prestige'): string {
  return ASSET_CONFIG.screens[screenId].background;
}

/**
 * Get card background path
 */
export function getCardPath(cardType: 'automation' | 'expedition' | 'skill' | 'resource' | 'biome' | 'generic'): string {
  return ASSET_CONFIG.ui.cards[cardType];
}

/**
 * Get panel background path
 */
export function getPanelPath(panelType: 'main' | 'header' | 'modal' | 'sidebar'): string {
  return ASSET_CONFIG.ui.panels[panelType];
}

/**
 * Get button image path
 */
export function getButtonPath(buttonType: 'primary' | 'secondary' | 'success' | 'danger' | 'disabled'): string {
  return ASSET_CONFIG.ui.buttons[buttonType];
}

/**
 * Get navigation icon path
 */
export function getNavigationIconPath(navItem: 'home' | 'biome' | 'explore' | 'skills'): string {
  return ASSET_CONFIG.ui.navigation[navItem];
}

/**
 * Get action icon path
 */
export function getActionIconPath(action: 'gather' | 'build' | 'upgrade' | 'launch' | 'prestige'): string {
  return ASSET_CONFIG.ui.actions[action];
}
