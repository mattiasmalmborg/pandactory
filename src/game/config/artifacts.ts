import {
  ArtifactTemplateId, ArtifactTemplate, ArtifactRarity, ArtifactBonusType,
  ArtifactState, Artifact, BiomeId, ExpeditionTier,
} from '../../types/game.types';

// === Artifact Templates ===
// 18 artifacts: 3 per biome, spread across rarities

export const ARTIFACT_TEMPLATES: Record<ArtifactTemplateId, ArtifactTemplate> = {
  // --- Lush Forest ---
  ancient_bamboo_scroll: {
    id: 'ancient_bamboo_scroll',
    name: 'Ancient Bamboo Scroll',
    description: 'A preserved scroll with forgotten techniques',
    flavorText: '"The ancients had a word for efficiency. It was... oh wait, it\'s smudged." — Dr. Redd',
    icon: '📜',
    rarity: 'common',
    originBiome: 'lush_forest',
    bonus: { type: 'gather', value: 0.03 },
    analysisCost: 8,
    analysisDurationMs: 15_000,
  },
  moss_covered_compass: {
    id: 'moss_covered_compass',
    name: 'Moss-Covered Compass',
    description: 'Points toward hidden resource deposits',
    flavorText: '"It doesn\'t point north. It points to... interesting things." — Dr. Redd',
    icon: '🧭',
    rarity: 'uncommon',
    originBiome: 'lush_forest',
    bonus: { type: 'expedition_rewards', value: 0.05 },
    analysisCost: 15,
    analysisDurationMs: 30_000,
  },
  petrified_acorn: {
    id: 'petrified_acorn',
    name: 'Petrified Acorn',
    description: 'A perfectly preserved seed from an ancient tree',
    flavorText: '"This acorn is older than most civilizations. And somehow still wants to grow." — Dr. Redd',
    icon: '🌰',
    rarity: 'rare',
    originBiome: 'lush_forest',
    bonus: { type: 'production', value: 0.08 },
    analysisCost: 30,
    analysisDurationMs: 60_000,
  },

  // --- Misty Lake ---
  crystallized_dewdrop: {
    id: 'crystallized_dewdrop',
    name: 'Crystallized Dewdrop',
    description: 'Morning dew frozen in a crystal matrix',
    flavorText: '"Water that refused to evaporate. I respect the stubbornness." — Dr. Redd',
    icon: '💧',
    rarity: 'common',
    originBiome: 'misty_lake',
    bonus: { type: 'production', value: 0.03 },
    analysisCost: 8,
    analysisDurationMs: 15_000,
  },
  sunken_astrolabe: {
    id: 'sunken_astrolabe',
    name: 'Sunken Astrolabe',
    description: 'An ancient navigation instrument from the lake bed',
    flavorText: '"Whoever dropped this in the lake was either very clumsy or very intentional." — Dr. Redd',
    icon: '🔭',
    rarity: 'uncommon',
    originBiome: 'misty_lake',
    bonus: { type: 'expedition_speed', value: 0.05 },
    analysisCost: 15,
    analysisDurationMs: 30_000,
  },
  mist_pearl: {
    id: 'mist_pearl',
    name: 'Mist Pearl',
    description: 'A luminous pearl that seems to contain swirling fog',
    flavorText: '"It\'s warm to the touch. And occasionally whispers. Perfectly normal." — Dr. Redd',
    icon: '🫧',
    rarity: 'legendary',
    originBiome: 'misty_lake',
    bonus: { type: 'production', value: 0.12 },
    analysisCost: 60,
    analysisDurationMs: 120_000,
  },

  // --- Arid Desert ---
  sand_etched_tablet: {
    id: 'sand_etched_tablet',
    name: 'Sand-Etched Tablet',
    description: 'Trade routes carved by desert winds',
    flavorText: '"The desert writes its own history. You just have to know how to read sand." — Dr. Redd',
    icon: '🪨',
    rarity: 'common',
    originBiome: 'arid_desert',
    bonus: { type: 'build_cost', value: 0.03 },
    analysisCost: 8,
    analysisDurationMs: 15_000,
  },
  solar_prism: {
    id: 'solar_prism',
    name: 'Solar Prism',
    description: 'Focuses sunlight into pure energy',
    flavorText: '"Do NOT look directly into it. I learned that the hard way. Twice." — Dr. Redd',
    icon: '🔶',
    rarity: 'rare',
    originBiome: 'arid_desert',
    bonus: { type: 'production', value: 0.08 },
    analysisCost: 30,
    analysisDurationMs: 60_000,
  },
  cactus_fossil: {
    id: 'cactus_fossil',
    name: 'Cactus Fossil',
    description: 'A prehistoric cactus preserved in amber',
    flavorText: '"Even millions of years ago, cacti chose violence." — Dr. Redd',
    icon: '🌵',
    rarity: 'uncommon',
    originBiome: 'arid_desert',
    bonus: { type: 'gather', value: 0.05 },
    analysisCost: 15,
    analysisDurationMs: 30_000,
  },

  // --- Frozen Tundra ---
  frozen_star_fragment: {
    id: 'frozen_star_fragment',
    name: 'Frozen Star Fragment',
    description: 'A meteorite shard encased in ancient ice',
    flavorText: '"It fell from the sky and the tundra just... kept it. Finders keepers, I suppose." — Dr. Redd',
    icon: '⭐',
    rarity: 'rare',
    originBiome: 'frozen_tundra',
    bonus: { type: 'expedition_rewards', value: 0.08 },
    analysisCost: 30,
    analysisDurationMs: 60_000,
  },
  permafrost_lens: {
    id: 'permafrost_lens',
    name: 'Permafrost Lens',
    description: 'A natural ice lens that magnifies efficiency',
    flavorText: '"Ten thousand years of compression made the clearest lens I\'ve ever seen." — Dr. Redd',
    icon: '🔍',
    rarity: 'uncommon',
    originBiome: 'frozen_tundra',
    bonus: { type: 'upgrade_cost', value: 0.05 },
    analysisCost: 15,
    analysisDurationMs: 30_000,
  },
  ice_rune_stone: {
    id: 'ice_rune_stone',
    name: 'Ice Rune Stone',
    description: 'Ancient runes glow faintly beneath the frost',
    flavorText: '"I can\'t read the runes, but my machines run faster when it\'s nearby. Science!" — Dr. Redd',
    icon: '🪨',
    rarity: 'common',
    originBiome: 'frozen_tundra',
    bonus: { type: 'production', value: 0.03 },
    analysisCost: 8,
    analysisDurationMs: 15_000,
  },

  // --- Volcanic Isle ---
  obsidian_idol: {
    id: 'obsidian_idol',
    name: 'Obsidian Idol',
    description: 'A small carved figure radiating heat',
    flavorText: '"It depicts something with too many arms. I choose not to think about it." — Dr. Redd',
    icon: '🗿',
    rarity: 'uncommon',
    originBiome: 'volcanic_isle',
    bonus: { type: 'production', value: 0.05 },
    analysisCost: 15,
    analysisDurationMs: 30_000,
  },
  magma_core_shard: {
    id: 'magma_core_shard',
    name: 'Magma Core Shard',
    description: 'Still warm after millennia underground',
    flavorText: '"It powers itself. POWERS. ITSELF. Do you understand how exciting that is?!" — Dr. Redd',
    icon: '🔥',
    rarity: 'legendary',
    originBiome: 'volcanic_isle',
    bonus: { type: 'production', value: 0.12 },
    analysisCost: 60,
    analysisDurationMs: 120_000,
  },
  volcanic_geode: {
    id: 'volcanic_geode',
    name: 'Volcanic Geode',
    description: 'Split open to reveal crystals formed in lava',
    flavorText: '"Beautiful on the inside. Deadly on the outside. Like most things here." — Dr. Redd',
    icon: '💎',
    rarity: 'common',
    originBiome: 'volcanic_isle',
    bonus: { type: 'build_cost', value: 0.03 },
    analysisCost: 8,
    analysisDurationMs: 15_000,
  },

  // --- Crystal Caverns ---
  crystal_resonator: {
    id: 'crystal_resonator',
    name: 'Crystal Resonator',
    description: 'Vibrates at frequencies that enhance machinery',
    flavorText: '"It hums. My machines hum back. They\'re having a conversation and I\'m not invited." — Dr. Redd',
    icon: '💠',
    rarity: 'rare',
    originBiome: 'crystal_caverns',
    bonus: { type: 'production', value: 0.08 },
    analysisCost: 30,
    analysisDurationMs: 60_000,
  },
  phosphor_lantern: {
    id: 'phosphor_lantern',
    name: 'Phosphor Lantern',
    description: 'A natural light source that never dims',
    flavorText: '"Free light, forever. The power company would hate this one simple trick." — Dr. Redd',
    icon: '🏮',
    rarity: 'uncommon',
    originBiome: 'crystal_caverns',
    bonus: { type: 'research_speed', value: 0.05 },
    analysisCost: 15,
    analysisDurationMs: 30_000,
  },
  lithium_heart: {
    id: 'lithium_heart',
    name: 'Lithium Heart',
    description: 'A pulsing crystal formation shaped like a heart',
    flavorText: '"It beats. Once every 47 seconds. I\'ve been counting for three days." — Dr. Redd',
    icon: '💜',
    rarity: 'legendary',
    originBiome: 'crystal_caverns',
    bonus: { type: 'artifact_chance', value: 0.10 },
    analysisCost: 60,
    analysisDurationMs: 120_000,
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

const RARITY_WEIGHTS: Record<ArtifactRarity, number> = {
  common: 55,
  uncommon: 30,
  rare: 12,
  legendary: 3,
};

// === Helper Functions ===

export function getArtifactDropChance(tier: ExpeditionTier): number {
  return ARTIFACT_DROP_CHANCES[tier];
}

/**
 * Roll for an artifact drop from a completed expedition.
 * Returns a template ID or null if no artifact dropped.
 */
export function rollArtifactDrop(
  biomeId: BiomeId,
  tier: ExpeditionTier,
  artifactChanceBonus: number = 0,
): ArtifactTemplateId | null {
  const baseChance = ARTIFACT_DROP_CHANCES[tier];
  const effectiveChance = Math.min(baseChance * (1 + artifactChanceBonus), 0.90);

  if (Math.random() >= effectiveChance) return null;

  // Get templates for this biome
  const biomeTemplates = Object.values(ARTIFACT_TEMPLATES)
    .filter(t => t.originBiome === biomeId);

  if (biomeTemplates.length === 0) return null;

  // Weighted random selection by rarity
  const totalWeight = biomeTemplates.reduce((sum, t) => sum + RARITY_WEIGHTS[t.rarity], 0);
  let roll = Math.random() * totalWeight;

  for (const template of biomeTemplates) {
    roll -= RARITY_WEIGHTS[template.rarity];
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
 * Sum equipped artifact bonuses of a given type.
 */
export function getArtifactBonus(inventory: Artifact[], bonusType: ArtifactBonusType): number {
  return inventory
    .filter(a => a.equipped && a.status === 'analyzed')
    .reduce((sum, a) => {
      const template = ARTIFACT_TEMPLATES[a.templateId];
      if (template.bonus.type === bonusType) {
        return sum + template.bonus.value;
      }
      return sum;
    }, 0);
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
