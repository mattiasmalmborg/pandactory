import {
  ArtifactTemplateId, ArtifactTemplate, ArtifactRarity, ArtifactEffectId,
  ArtifactState, Artifact, BiomeId, ExpeditionTier,
} from '../../types/game.types';

// === Artifact Templates ===
// 18 artifacts: 3 per biome, each with a unique mechanical effect

export const ARTIFACT_TEMPLATES: Record<ArtifactTemplateId, ArtifactTemplate> = {
  // --- Lush Forest (growth, nature, abundance) ---
  ancient_bamboo_scroll: {
    id: 'ancient_bamboo_scroll',
    name: 'Ancient Bamboo Scroll',
    description: 'Auto-gathers in current biome every 30 seconds',
    flavorText: '"The ancients had a word for laziness. It was... \'automation\'." — Dr. Redd',
    icon: '📜',
    rarity: 'common',
    originBiome: 'lush_forest',
    effect: 'overgrowth',
    analysisCost: 8,
    analysisDurationMs: 2 * 60_000, // 2 minutes
  },
  moss_covered_compass: {
    id: 'moss_covered_compass',
    name: 'Moss-Covered Compass',
    description: 'Doubles the chance to discover new biomes and resources on expeditions',
    flavorText: '"It doesn\'t point north. It points to... interesting things." — Dr. Redd',
    icon: '🧭',
    rarity: 'uncommon',
    originBiome: 'lush_forest',
    effect: 'trailblazer',
    analysisCost: 15,
    analysisDurationMs: 5 * 60_000, // 5 minutes
  },
  petrified_acorn: {
    id: 'petrified_acorn',
    name: 'Petrified Acorn',
    description: 'Each gather click has a 20% chance to trigger twice',
    flavorText: '"This acorn is older than most civilizations. And somehow still wants to grow." — Dr. Redd',
    icon: '🌰',
    rarity: 'rare',
    originBiome: 'lush_forest',
    effect: 'lucky_harvest',
    analysisCost: 30,
    analysisDurationMs: 15 * 60_000, // 15 minutes
  },

  // --- Misty Lake (mystery, patience, flow) ---
  crystallized_dewdrop: {
    id: 'crystallized_dewdrop',
    name: 'Crystallized Dewdrop',
    description: 'Earn 1 Research Data every 5 minutes passively',
    flavorText: '"Water that refused to evaporate. I respect the stubbornness." — Dr. Redd',
    icon: '💧',
    rarity: 'common',
    originBiome: 'misty_lake',
    effect: 'drip_feed',
    analysisCost: 8,
    analysisDurationMs: 2 * 60_000,
  },
  sunken_astrolabe: {
    id: 'sunken_astrolabe',
    name: 'Sunken Astrolabe',
    description: 'Recalled expeditions keep 75% of rewards instead of reduced',
    flavorText: '"Whoever dropped this in the lake was either very clumsy or very intentional." — Dr. Redd',
    icon: '🔭',
    rarity: 'uncommon',
    originBiome: 'misty_lake',
    effect: 'safe_return',
    analysisCost: 15,
    analysisDurationMs: 5 * 60_000,
  },
  mist_pearl: {
    id: 'mist_pearl',
    name: 'Mist Pearl',
    description: '25% chance completed expeditions refund all food cost',
    flavorText: '"It\'s warm to the touch. And occasionally whispers. Perfectly normal." — Dr. Redd',
    icon: '🫧',
    rarity: 'legendary',
    originBiome: 'misty_lake',
    effect: 'mirage',
    analysisCost: 60,
    analysisDurationMs: 45 * 60_000, // 45 minutes
  },

  // --- Arid Desert (endurance, heat, efficiency) ---
  sand_etched_tablet: {
    id: 'sand_etched_tablet',
    name: 'Sand-Etched Tablet',
    description: 'Completed expeditions have 30% chance to also award 3–8 Research Data',
    flavorText: '"The desert writes its own history. You just have to know how to read sand." — Dr. Redd',
    icon: '🪨',
    rarity: 'common',
    originBiome: 'arid_desert',
    effect: 'desert_cache',
    analysisCost: 8,
    analysisDurationMs: 2 * 60_000,
  },
  cactus_fossil: {
    id: 'cactus_fossil',
    name: 'Cactus Fossil',
    description: 'Swift Forage and Local Expedition take half the time',
    flavorText: '"Even millions of years ago, cacti chose violence. But also efficiency." — Dr. Redd',
    icon: '🌵',
    rarity: 'uncommon',
    originBiome: 'arid_desert',
    effect: 'oasis',
    analysisCost: 15,
    analysisDurationMs: 5 * 60_000,
  },
  solar_prism: {
    id: 'solar_prism',
    name: 'Solar Prism',
    description: 'Every 10 minutes, a random automation produces a 5x burst',
    flavorText: '"Do NOT look directly into it. I learned that the hard way. Twice." — Dr. Redd',
    icon: '🔶',
    rarity: 'rare',
    originBiome: 'arid_desert',
    effect: 'solar_flare',
    analysisCost: 30,
    analysisDurationMs: 15 * 60_000,
  },

  // --- Frozen Tundra (preservation, precision, cold) ---
  ice_rune_stone: {
    id: 'ice_rune_stone',
    name: 'Ice Rune Stone',
    description: 'Artifact analysis time is halved',
    flavorText: '"I can\'t read the runes, but my machines run faster when it\'s nearby." — Dr. Redd',
    icon: '🪨',
    rarity: 'common',
    originBiome: 'frozen_tundra',
    effect: 'flash_freeze',
    analysisCost: 8,
    analysisDurationMs: 2 * 60_000,
  },
  permafrost_lens: {
    id: 'permafrost_lens',
    name: 'Permafrost Lens',
    description: 'Research costs 3 less Research Data per level (min 1)',
    flavorText: '"Ten thousand years of compression made the clearest lens I\'ve ever seen." — Dr. Redd',
    icon: '🔍',
    rarity: 'uncommon',
    originBiome: 'frozen_tundra',
    effect: 'deep_focus',
    analysisCost: 15,
    analysisDurationMs: 5 * 60_000,
  },
  frozen_star_fragment: {
    id: 'frozen_star_fragment',
    name: 'Frozen Star Fragment',
    description: 'Epic Journey expeditions always drop at least 1 artifact',
    flavorText: '"It fell from the sky and the tundra just... kept it." — Dr. Redd',
    icon: '⭐',
    rarity: 'rare',
    originBiome: 'frozen_tundra',
    effect: 'meteor_strike',
    analysisCost: 30,
    analysisDurationMs: 15 * 60_000,
  },

  // --- Volcanic Isle (power, destruction, transformation) ---
  volcanic_geode: {
    id: 'volcanic_geode',
    name: 'Volcanic Geode',
    description: 'Power cells give bonus as if the automation were +1 level higher',
    flavorText: '"Beautiful on the inside. Deadly on the outside. Like most things here." — Dr. Redd',
    icon: '💎',
    rarity: 'common',
    originBiome: 'volcanic_isle',
    effect: 'thermal_vent',
    analysisCost: 8,
    analysisDurationMs: 2 * 60_000,
  },
  obsidian_idol: {
    id: 'obsidian_idol',
    name: 'Obsidian Idol',
    description: 'Scrapping analyzed artifacts returns 100% Research Data instead of 50%',
    flavorText: '"It depicts something with too many arms. I choose not to think about it." — Dr. Redd',
    icon: '🗿',
    rarity: 'uncommon',
    originBiome: 'volcanic_isle',
    effect: 'idols_favor',
    analysisCost: 15,
    analysisDurationMs: 5 * 60_000,
  },
  magma_core_shard: {
    id: 'magma_core_shard',
    name: 'Magma Core Shard',
    description: 'Unlocks a 4th artifact loadout slot',
    flavorText: '"It powers itself. POWERS. ITSELF. Do you understand how exciting that is?!" — Dr. Redd',
    icon: '🔥',
    rarity: 'legendary',
    originBiome: 'volcanic_isle',
    effect: 'eternal_forge',
    analysisCost: 60,
    analysisDurationMs: 45 * 60_000,
  },

  // --- Crystal Caverns (resonance, energy, knowledge) ---
  phosphor_lantern: {
    id: 'phosphor_lantern',
    name: 'Phosphor Lantern',
    description: 'Artifact drops skew toward higher rarities (+5% rare, +2% legendary)',
    flavorText: '"Free light, forever. The power company would hate this one simple trick." — Dr. Redd',
    icon: '🏮',
    rarity: 'uncommon',
    originBiome: 'crystal_caverns',
    effect: 'guiding_light',
    analysisCost: 15,
    analysisDurationMs: 5 * 60_000,
  },
  crystal_resonator: {
    id: 'crystal_resonator',
    name: 'Crystal Resonator',
    description: 'Unlocks a second research station — run two jobs at once',
    flavorText: '"It hums. My machines hum back. They\'re having a conversation and I\'m not invited." — Dr. Redd',
    icon: '💠',
    rarity: 'rare',
    originBiome: 'crystal_caverns',
    effect: 'crystal_clarity',
    analysisCost: 30,
    analysisDurationMs: 15 * 60_000,
  },
  lithium_heart: {
    id: 'lithium_heart',
    name: 'Lithium Heart',
    description: 'Every 47 seconds, bonus production tick across ALL biomes',
    flavorText: '"It beats. Once every 47 seconds. I\'ve been counting for three days." — Dr. Redd',
    icon: '💜',
    rarity: 'legendary',
    originBiome: 'crystal_caverns',
    effect: 'heartbeat',
    analysisCost: 60,
    analysisDurationMs: 45 * 60_000,
  },
};

// === Initial State ===

export const INITIAL_ARTIFACT_STATE: ArtifactState = {
  inventory: [],
  activeAnalysis: null,
  loadoutSlots: 3,
  totalFound: 0,
  totalAnalyzed: 0,
};

// === Drop Chance by Expedition Tier ===

const ARTIFACT_DROP_CHANCES: Record<ExpeditionTier, number> = {
  quick_dash: 0.05,
  quick_scout: 0.12,
  standard_expedition: 0.22,
  deep_exploration: 0.35,
  epic_journey: 0.55,
};

// === Rarity Weights ===

const BASE_RARITY_WEIGHTS: Record<ArtifactRarity, number> = {
  common: 55,
  uncommon: 30,
  rare: 12,
  legendary: 3,
};

// === Set Bonus Definitions ===

export interface SetBonus {
  biome: BiomeId;
  name: string;
  twoBonus: string;
  threeBonus: string;
}

export const SET_BONUSES: Record<BiomeId, SetBonus> = {
  lush_forest: {
    biome: 'lush_forest',
    name: 'Forest Set',
    twoBonus: 'Gather effects trigger 50% more often',
    threeBonus: 'Overgrowth triggers in ALL biomes, not just current',
  },
  misty_lake: {
    biome: 'misty_lake',
    name: 'Lake Set',
    twoBonus: '+50% Research Data from all sources',
    threeBonus: 'Recalled expeditions give full rewards',
  },
  arid_desert: {
    biome: 'arid_desert',
    name: 'Desert Set',
    twoBonus: 'Desert Cache chance increases to 60%',
    threeBonus: 'Solar Flare triggers every 5 minutes instead of 10',
  },
  frozen_tundra: {
    biome: 'frozen_tundra',
    name: 'Tundra Set',
    twoBonus: 'Analysis is instant instead of halved',
    threeBonus: 'First research in each category starts at lvl 1 after prestige',
  },
  volcanic_isle: {
    biome: 'volcanic_isle',
    name: 'Volcanic Set',
    twoBonus: 'Power cells give +2 effective levels instead of +1',
    threeBonus: 'Double power cell drops on expeditions',
  },
  crystal_caverns: {
    biome: 'crystal_caverns',
    name: 'Cavern Set',
    twoBonus: 'Artifact drops are always at least uncommon rarity',
    threeBonus: 'Heartbeat triggers every 30 seconds instead of 47',
  },
};

// === Helper Functions ===

export function getArtifactDropChance(tier: ExpeditionTier): number {
  return ARTIFACT_DROP_CHANCES[tier];
}

/**
 * Get active set bonuses from equipped artifacts.
 * Returns biome IDs with their active tier (0, 2, or 3).
 */
export function getActiveSetBonuses(inventory: Artifact[]): Map<BiomeId, number> {
  const equipped = inventory.filter(a => a.equipped && a.status === 'analyzed');
  const biomeCounts = new Map<BiomeId, number>();

  for (const artifact of equipped) {
    const template = ARTIFACT_TEMPLATES[artifact.templateId];
    const count = biomeCounts.get(template.originBiome) || 0;
    biomeCounts.set(template.originBiome, count + 1);
  }

  // Only return biomes with 2+ equipped
  const result = new Map<BiomeId, number>();
  for (const [biome, count] of biomeCounts) {
    if (count >= 2) {
      result.set(biome, Math.min(count, 3));
    }
  }
  return result;
}

/**
 * Check if a specific artifact effect is active (equipped and analyzed).
 */
export function hasArtifactEffect(inventory: Artifact[], effectId: ArtifactEffectId): boolean {
  return inventory.some(a =>
    a.equipped && a.status === 'analyzed' && ARTIFACT_TEMPLATES[a.templateId].effect === effectId
  );
}

/**
 * Get the effective loadout slots (base 3, +1 with Eternal Forge).
 */
export function getEffectiveLoadoutSlots(inventory: Artifact[]): number {
  const hasEternalForge = hasArtifactEffect(inventory, 'eternal_forge');
  return hasEternalForge ? 4 : 3;
}

/**
 * Roll for an artifact drop from a completed expedition.
 * Returns a template ID or null if no artifact dropped.
 */
export function rollArtifactDrop(
  biomeId: BiomeId,
  tier: ExpeditionTier,
  inventory: Artifact[] = [],
): ArtifactTemplateId | null {
  const baseChance = ARTIFACT_DROP_CHANCES[tier];
  const effectiveChance = Math.min(baseChance, 0.90);

  if (Math.random() >= effectiveChance) return null;

  // Get templates for this biome
  const biomeTemplates = Object.values(ARTIFACT_TEMPLATES)
    .filter(t => t.originBiome === biomeId);

  if (biomeTemplates.length === 0) return null;

  // Adjust rarity weights if Guiding Light is equipped
  const hasGuidingLight = hasArtifactEffect(inventory, 'guiding_light');
  const weights = { ...BASE_RARITY_WEIGHTS };
  if (hasGuidingLight) {
    weights.rare += 5;
    weights.legendary += 2;
  }

  // Cavern set 2/3: artifact drops always at least uncommon
  const setBonuses = getActiveSetBonuses(inventory);
  const cavernSetLevel = setBonuses.get('crystal_caverns') || 0;
  if (cavernSetLevel >= 2) {
    weights.common = 0; // No common drops
  }

  // Weighted random selection by rarity
  const totalWeight = biomeTemplates.reduce((sum, t) => sum + weights[t.rarity], 0);
  if (totalWeight <= 0) return biomeTemplates[0].id;

  let roll = Math.random() * totalWeight;

  for (const template of biomeTemplates) {
    roll -= weights[template.rarity];
    if (roll <= 0) return template.id;
  }

  return biomeTemplates[0].id;
}

/**
 * Create a new artifact instance from a template.
 */
export function createArtifact(templateId: ArtifactTemplateId): Artifact {
  return {
    instanceId: `artifact_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    templateId,
    status: 'unanalyzed',
    foundAt: Date.now(),
    analyzedAt: null,
    equipped: false,
  };
}

/**
 * Get the number of equipped artifacts.
 */
export function getEquippedCount(inventory: Artifact[]): number {
  return inventory.filter(a => a.equipped).length;
}

/**
 * Get unique template IDs the player has found (for trophy room).
 */
export function getDiscoveredTemplates(inventory: Artifact[]): Set<ArtifactTemplateId> {
  return new Set(inventory.map(a => a.templateId));
}

/**
 * Get rarity display info.
 */
export const RARITY_COLORS: Record<ArtifactRarity, { border: string; text: string; bg: string; glow: string }> = {
  common: { border: 'border-gray-500/50', text: 'text-gray-300', bg: 'bg-gray-800/60', glow: '' },
  uncommon: { border: 'border-green-500/50', text: 'text-green-400', bg: 'bg-green-900/20', glow: '' },
  rare: { border: 'border-blue-500/50', text: 'text-blue-400', bg: 'bg-blue-900/20', glow: 'shadow-[0_0_8px_rgba(59,130,246,0.2)]' },
  legendary: { border: 'border-amber-400/60', text: 'text-amber-400', bg: 'bg-amber-900/20', glow: 'shadow-[0_0_12px_rgba(251,191,36,0.3)]' },
};

export const MAX_INVENTORY_SIZE = 50;
