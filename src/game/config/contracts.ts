import {
  GameState, Contract, ContractCategory, ContractPeriod, ContractState,
  ResourceId, AutomationType,
} from '../../types/game.types';
import { AUTOMATIONS } from './automations';
import { BIOMES } from './biomes';
import { RESOURCES } from './resources';
import { canSeeAutomation } from '../../utils/automation-visibility';
import { calculateBiomeProductionRates } from '../../utils/allocation';

// ============================================================
// Contract generation — contextual, scaled to player progression
// ============================================================

const DAILY_COUNT = 3;
const WEEKLY_COUNT = 3;

// Research Data rewards scale with difficulty
const BASE_DAILY_REWARD = 10;
const BASE_WEEKLY_REWARD = 50;

/**
 * Simple seeded PRNG for deterministic but unique contract generation.
 * Same seed = same contracts for all players on the same day.
 */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function dateSeed(dateStr: string, salt: number = 0): number {
  let hash = salt;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

/**
 * Get today's date string (YYYY-MM-DD) in local time.
 */
export function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Get the Monday of the current week (YYYY-MM-DD).
 */
export function getWeekStartString(): string {
  const d = new Date();
  const day = d.getDay(); // 0=Sun, 1=Mon...
  const diff = day === 0 ? 6 : day - 1; // Days since Monday
  d.setDate(d.getDate() - diff);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Round a number to a "nice" value for quest targets.
 */
function niceRound(n: number): number {
  if (n <= 5) return Math.max(1, Math.round(n));
  if (n <= 25) return Math.round(n / 5) * 5;
  if (n <= 100) return Math.round(n / 10) * 10;
  if (n <= 500) return Math.round(n / 25) * 25;
  if (n <= 2000) return Math.round(n / 50) * 50;
  if (n <= 10000) return Math.round(n / 100) * 100;
  if (n <= 100000) return Math.round(n / 500) * 500;
  return Math.round(n / 1000) * 1000;
}

// ============================================================
// Contract template generators — each returns a Contract or null
// ============================================================

interface ContractTemplate {
  category: ContractCategory;
  /** Returns null if this contract type isn't relevant for the player */
  generate: (state: GameState, period: ContractPeriod, rng: () => number) => Omit<Contract, 'id' | 'period' | 'completed' | 'claimed' | 'progress'> | null;
}

function getProductionRates(state: GameState): Record<string, number> {
  const rates: Record<string, number> = {};
  const context = {
    unlockedSkills: state.prestige.unlockedSkills,
    unlockedAchievements: state.achievements?.unlocked || [],
    allBiomes: state.biomes,
  };

  for (const biomeId of state.unlockedBiomes) {
    const biome = state.biomes[biomeId];
    const { production } = calculateBiomeProductionRates(biome, context);
    for (const [resourceId, rate] of Object.entries(production)) {
      rates[resourceId] = (rates[resourceId] || 0) + rate;
    }
  }
  return rates;
}

const TEMPLATES: ContractTemplate[] = [
  // ── GATHER ──────────────────────────────────────────────
  {
    category: 'gather',
    generate: (state, period, rng) => {
      // Find resources the player can actually gather (primary resources in unlocked biomes)
      const gatherableResources: { resourceId: ResourceId; biomeName: string }[] = [];
      for (const biomeId of state.unlockedBiomes) {
        const config = BIOMES[biomeId];
        for (const resourceId of config.primaryResources) {
          const resource = RESOURCES[resourceId];
          if (resource && resource.category !== 'food') {
            gatherableResources.push({ resourceId, biomeName: config.name });
          }
        }
      }
      if (gatherableResources.length === 0) return null;

      const pick = gatherableResources[Math.floor(rng() * gatherableResources.length)];
      const resource = RESOURCES[pick.resourceId];
      if (!resource) return null;

      // Scale target: check production rate, if automated make target ~10-15 min worth
      const rates = getProductionRates(state);
      const rate = rates[pick.resourceId] || 0;
      const multiplier = period === 'weekly' ? 5 : 1;

      let target: number;
      if (rate > 0) {
        // Player has automation — target = ~10 min of production
        target = niceRound(rate * 10 * multiplier);
      } else {
        // Manual gathering only — modest targets
        target = niceRound((10 + rng() * 40) * multiplier);
      }
      target = Math.max(5, target);

      const reward = rate > 0
        ? Math.round((period === 'weekly' ? BASE_WEEKLY_REWARD : BASE_DAILY_REWARD) * 1.0)
        : Math.round((period === 'weekly' ? BASE_WEEKLY_REWARD : BASE_DAILY_REWARD) * 0.8);

      const flavorTexts = [
        `Hoard ${target.toLocaleString()} ${resource.name}. Dr. Redd promises it's for science.`,
        `${target.toLocaleString()} ${resource.name}, please. The spaceship won't build itself. Well, actually...`,
        `Collect ${target.toLocaleString()} ${resource.name}. Your paws were made for this.`,
        `Fetch ${target.toLocaleString()} ${resource.name}. Good panda.`,
        `Gather ${target.toLocaleString()} ${resource.name}. Dr. Redd wrote a thesis on why this matters. Nobody read it.`,
        `Stockpile ${target.toLocaleString()} ${resource.name}. Future-you will be grateful. Present-you, less so.`,
        `Amass ${target.toLocaleString()} ${resource.name}. "More is more" — Dr. Redd's economic theory.`,
        `Round up ${target.toLocaleString()} ${resource.name}. The supply closet has feelings too.`,
      ];

      return {
        category: 'gather',
        description: flavorTexts[Math.floor(rng() * flavorTexts.length)],
        icon: resource.icon || '📦',
        target,
        researchDataReward: reward,
        trackingParams: { resourceId: pick.resourceId },
      };
    },
  },

  // ── BUILD ───────────────────────────────────────────────
  {
    category: 'build',
    generate: (state, period, rng) => {
      // Check if there are visible-but-unbuilt automations
      const builtTypes = new Set<AutomationType>();
      for (const biomeId of state.unlockedBiomes) {
        for (const auto of state.biomes[biomeId].automations) {
          builtTypes.add(auto.type);
        }
      }

      const discoveredResources: ResourceId[] = [];
      for (const biomeId of state.unlockedBiomes) {
        for (const r of state.biomes[biomeId].discoveredResources) {
          if (!discoveredResources.includes(r)) discoveredResources.push(r);
        }
      }
      const discoveredProduced = state.discoveredProducedResources || [];

      let unbuildable = 0;
      for (const biomeId of state.unlockedBiomes) {
        const biomeConfig = BIOMES[biomeId];
        for (const autoType of biomeConfig.availableAutomations) {
          if (builtTypes.has(autoType)) continue;
          const config = AUTOMATIONS[autoType];
          if (!config) continue;
          if (canSeeAutomation(config, discoveredResources, discoveredProduced)) {
            unbuildable++;
          }
        }
      }

      if (unbuildable === 0) return null;

      const target = period === 'weekly' ? Math.min(3, unbuildable) : Math.min(2, unbuildable);
      const reward = Math.round((period === 'weekly' ? BASE_WEEKLY_REWARD : BASE_DAILY_REWARD) * 1.5);

      const singleFlavors = [
        'Build something new. Alien tech won\'t assemble itself!',
        'Construct a new automation. Progress waits for no panda.',
        'Assemble a new machine. Dr. Redd drew the blueprints upside down, but it should still work.',
        'Build something shiny and new. The planet isn\'t going to industrialize itself.',
        'Deploy a new automation. Dr. Redd promises it won\'t explode. Probably.',
        'Erect a new contraption. Yes, "erect" is the technical term.',
      ];
      const multiFlavors = [
        `Build ${target} new contraptions. Dr. Redd loves the smell of fresh automation.`,
        `Construct ${target} new machines. Assembly required. Patience optional.`,
        `Deploy ${target} new automations. The factory floor is looking a bit empty.`,
        `Build ${target} contraptions. Dr. Redd has blueprints and zero patience.`,
        `Assemble ${target} machines. More gears, more glory.`,
        `Set up ${target} new automations. Efficiency is a lifestyle, not a goal.`,
      ];
      const desc = target === 1
        ? singleFlavors[Math.floor(rng() * singleFlavors.length)]
        : multiFlavors[Math.floor(rng() * multiFlavors.length)];

      return {
        category: 'build',
        description: desc,
        icon: '🔧',
        target,
        researchDataReward: reward,
      };
    },
  },

  // ── UPGRADE ─────────────────────────────────────────────
  {
    category: 'upgrade',
    generate: (state, period, rng) => {
      // Count total automations
      let totalAutos = 0;
      for (const biomeId of state.unlockedBiomes) {
        totalAutos += state.biomes[biomeId].automations.length;
      }
      if (totalAutos === 0) return null;

      const multiplier = period === 'weekly' ? 4 : 1;
      // Scale: 2-5 upgrades per automation owned, roughly
      const base = Math.max(1, Math.min(totalAutos, 3 + Math.floor(rng() * 3)));
      const target = niceRound(base * multiplier);

      const singleUpgradeFlavors = [
        'Give an automation the ol\' upgrade treatment.',
        'Upgrade something. Anything. Dr. Redd can\'t stand stagnation.',
        'Level up a machine. It\'s been giving you that look.',
        'Boost an automation. A little investment goes a long way.',
        'Upgrade one automation. Think of it as a spa day for machines.',
        'Pump some resources into an upgrade. Your machines deserve better.',
      ];
      const multiUpgradeFlavors = [
        `Upgrade automations ${target} times. More power! MORE!`,
        `Perform ${target} upgrades. Progress is addictive, isn't it?`,
        `Upgrade ${target} times. Dr. Redd insists on "continuous improvement."`,
        `Level up machines ${target} times. Numbers go up, dopamine follows.`,
        `Apply ${target} upgrades. The machines aren't going to improve themselves. Yet.`,
        `Boost automations ${target} times. Because "good enough" isn't a thing here.`,
      ];
      const desc = target === 1
        ? singleUpgradeFlavors[Math.floor(rng() * singleUpgradeFlavors.length)]
        : multiUpgradeFlavors[Math.floor(rng() * multiUpgradeFlavors.length)];

      return {
        category: 'upgrade',
        description: desc,
        icon: '⬆️',
        target,
        researchDataReward: Math.round((period === 'weekly' ? BASE_WEEKLY_REWARD : BASE_DAILY_REWARD) * 1.0),
      };
    },
  },

  // ── EXPEDITION ──────────────────────────────────────────
  {
    category: 'expedition',
    generate: (state, period, rng) => {
      // Check if player can realistically do an expedition
      const totalFood = Object.values(state.food).reduce((s, a) => s + a, 0);
      const hasFoodProduction = state.unlockedBiomes.some(biomeId =>
        state.biomes[biomeId].automations.some(a => {
          const config = AUTOMATIONS[a.type];
          return config?.producesFood && config.producesFood.length > 0;
        })
      );

      // Need either food in stock or food production to make this achievable
      if (totalFood < 100 && !hasFoodProduction) return null;

      const target = period === 'weekly' ? 3 : 1;

      const singleExpFlavors = [
        'Take a stroll through the wilderness. Pack snacks.',
        'Complete one expedition. Adventure calls! So does lunch, but adventure first.',
        'Head out on an expedition. Dr. Redd has marked the map with a crayon.',
        'Go exploring. The unknown awaits. So do the known dangers, but let\'s be optimistic.',
        'Finish an expedition. Even pandas need fresh air sometimes.',
        'Complete a field mission. Dr. Redd packed you a motivational note.',
      ];
      const multiExpFlavors = [
        `Complete ${target} expeditions. Dr. Redd is getting restless.`,
        `Finish ${target} expeditions. There's so much planet left to catalog.`,
        `Wrap up ${target} field missions. The wilderness isn't going to explore itself.`,
        `Go on ${target} adventures. Dr. Redd wants postcards from each one.`,
        `Complete ${target} expeditions. Your hiking boots are gathering dust.`,
        `Knock out ${target} expeditions. The data practically collects itself. (It doesn't.)`,
      ];
      const desc = target === 1
        ? singleExpFlavors[Math.floor(rng() * singleExpFlavors.length)]
        : multiExpFlavors[Math.floor(rng() * multiExpFlavors.length)];

      return {
        category: 'expedition',
        description: desc,
        icon: '🗺️',
        target,
        researchDataReward: Math.round((period === 'weekly' ? BASE_WEEKLY_REWARD : BASE_DAILY_REWARD) * 1.2),
      };
    },
  },

  // ── PRODUCE ─────────────────────────────────────────────
  {
    category: 'produce',
    generate: (state, period, rng) => {
      // Find intermediate resources being produced
      const rates = getProductionRates(state);
      const producedIntermediates = Object.entries(rates)
        .filter(([resourceId, rate]) => {
          const resource = RESOURCES[resourceId as ResourceId];
          return resource?.category === 'intermediate' && rate > 0;
        });

      if (producedIntermediates.length === 0) return null;

      const pick = producedIntermediates[Math.floor(rng() * producedIntermediates.length)];
      const [resourceId, rate] = pick;
      const resource = RESOURCES[resourceId as ResourceId];
      if (!resource) return null;

      const multiplier = period === 'weekly' ? 5 : 1;
      // Target = ~10-15 min of production
      const target = Math.max(5, niceRound(rate * 12 * multiplier));

      const produceFlavorTexts = [
        `Crank out ${target.toLocaleString()} ${resource.name}. The machines are hungry.`,
        `Manufacture ${target.toLocaleString()} ${resource.name}. Let the automations do the heavy lifting.`,
        `Produce ${target.toLocaleString()} ${resource.name}. Quality control is optional. (It's not.)`,
        `Generate ${target.toLocaleString()} ${resource.name}. The factory never sleeps and neither should you. Just kidding. Sleep.`,
        `Output ${target.toLocaleString()} ${resource.name}. Dr. Redd calls this "vertical integration." Nobody corrects him.`,
        `Churn out ${target.toLocaleString()} ${resource.name}. Your automations were born for this moment.`,
        `Fabricate ${target.toLocaleString()} ${resource.name}. Science waits for no panda.`,
        `Refine ${target.toLocaleString()} ${resource.name}. Raw materials are so last century.`,
      ];

      return {
        category: 'produce',
        description: produceFlavorTexts[Math.floor(rng() * produceFlavorTexts.length)],
        icon: resource.icon || '⚙️',
        target,
        researchDataReward: Math.round((period === 'weekly' ? BASE_WEEKLY_REWARD : BASE_DAILY_REWARD) * 1.2),
        trackingParams: { resourceId: resourceId as ResourceId },
      };
    },
  },

  // ── LEVEL UP ────────────────────────────────────────────
  {
    category: 'level_up',
    generate: (state, period, rng) => {
      // Find automations and their levels, suggest getting one to the next milestone
      const milestones = [5, 10, 15, 20, 25, 50, 75, 100];
      const candidates: { type: AutomationType; name: string; currentLevel: number; targetLevel: number }[] = [];

      for (const biomeId of state.unlockedBiomes) {
        for (const auto of state.biomes[biomeId].automations) {
          const config = AUTOMATIONS[auto.type];
          if (!config) continue;
          // Find next milestone above current level
          const nextMilestone = milestones.find(m => m > auto.level);
          if (nextMilestone && (nextMilestone - auto.level) <= (period === 'weekly' ? 20 : 8)) {
            candidates.push({
              type: auto.type,
              name: config.name,
              currentLevel: auto.level,
              targetLevel: nextMilestone,
            });
          }
        }
      }

      if (candidates.length === 0) return null;

      const pick = candidates[Math.floor(rng() * candidates.length)];

      const levelUpFlavors = [
        `Get ${pick.name} to level ${pick.targetLevel}. It believes in you!`,
        `Push ${pick.name} to level ${pick.targetLevel}. Dr. Redd is placing bets on this one.`,
        `Level ${pick.name} to ${pick.targetLevel}. Every upgrade brings you closer to escape velocity.`,
        `Reach level ${pick.targetLevel} on ${pick.name}. Overclocking is just enthusiasm with extra steps.`,
        `Boost ${pick.name} to level ${pick.targetLevel}. It's been whispering "upgrade me" in its sleep.`,
        `Get ${pick.name} to ${pick.targetLevel}. That machine has untapped potential. Dr. Redd can feel it.`,
      ];

      return {
        category: 'level_up',
        description: levelUpFlavors[Math.floor(rng() * levelUpFlavors.length)],
        icon: '🎯',
        target: pick.targetLevel,
        researchDataReward: Math.round((period === 'weekly' ? BASE_WEEKLY_REWARD : BASE_DAILY_REWARD) * 1.3),
        trackingParams: { automationType: pick.type, targetLevel: pick.targetLevel },
      };
    },
  },

  // ── FOOD ────────────────────────────────────────────────
  {
    category: 'food',
    generate: (state, period, rng) => {
      // Only if player has food production
      const hasFoodProduction = state.unlockedBiomes.some(biomeId =>
        state.biomes[biomeId].automations.some(a => {
          const config = AUTOMATIONS[a.type];
          return config?.producesFood && config.producesFood.length > 0;
        })
      );

      if (!hasFoodProduction) return null;

      const currentFood = Object.values(state.food).reduce((s, a) => s + a, 0);
      const multiplier = period === 'weekly' ? 5 : 1;
      // Target: accumulate roughly 2-3x current food stock, or a baseline
      const target = niceRound(Math.max(100, (currentFood * 0.5 + 200) * multiplier * (0.8 + rng() * 0.4)));

      const foodFlavors = [
        `Stockpile ${target.toLocaleString()} food. A hungry panda is an unproductive panda.`,
        `Hoard ${target.toLocaleString()} food. Expedition snacks don't grow on trees. Well, some do.`,
        `Accumulate ${target.toLocaleString()} food. Dr. Redd's tummy demands it.`,
        `Store ${target.toLocaleString()} food. You can never be too prepared. Or too full.`,
        `Gather ${target.toLocaleString()} food supplies. The pantry is looking awfully empty.`,
        `Reach ${target.toLocaleString()} food. Dr. Redd measures morale in snacks per capita.`,
        `Fill the larder to ${target.toLocaleString()}. Hungry expeditions are short expeditions.`,
        `Bank ${target.toLocaleString()} food. Surplus today, survival tomorrow.`,
      ];

      return {
        category: 'food',
        description: foodFlavors[Math.floor(rng() * foodFlavors.length)],
        icon: '🍽️',
        target,
        researchDataReward: Math.round((period === 'weekly' ? BASE_WEEKLY_REWARD : BASE_DAILY_REWARD) * 0.8),
      };
    },
  },

  // ── DISCOVER ────────────────────────────────────────────
  {
    category: 'discover',
    generate: (state, period, rng) => {
      // Check for undiscovered resources across unlocked biomes
      let undiscoveredCount = 0;
      for (const biomeId of state.unlockedBiomes) {
        const biomeConfig = BIOMES[biomeId];
        const biome = state.biomes[biomeId];
        const totalResources = (biomeConfig.primaryResources?.length || 0) + (biomeConfig.discoverableResources?.length || 0);
        const discovered = biome.discoveredResources?.length || 0;
        undiscoveredCount += totalResources - discovered;
      }

      // Also count undiscovered biomes
      const undiscoveredBiomes = 6 - state.unlockedBiomes.length;
      const totalUndiscovered = undiscoveredCount + undiscoveredBiomes;

      if (totalUndiscovered === 0) return null;

      // Weekly: discover 2, daily: discover 1
      const target = period === 'weekly' ? Math.min(2, totalUndiscovered) : 1;

      const singleDiscoverFlavors = [
        'Find something new out there. The universe is full of surprises. Mostly rocks.',
        'Make a discovery. Dr. Redd is running out of things to put in his journal.',
        'Uncover something unknown. The planet still has secrets. Probably.',
        'Discover something new. Exploration is 90% walking and 10% gasping.',
        'Find an undiscovered resource or biome. Dr. Redd will name it after himself.',
        'Make a new finding. Science doesn\'t do itself. Well, sometimes it does. But not today.',
      ];
      const multiDiscoverFlavors = [
        `Make ${target} discoveries. Dr. Redd's curiosity is insatiable.`,
        `Uncover ${target} new things. The planet's secrets won't reveal themselves.`,
        `Find ${target} discoveries. Every expedition is a chance to expand the encyclopedia.`,
        `Discover ${target} unknowns. Dr. Redd's journal has empty pages that haunt him.`,
        `Make ${target} findings. Knowledge is power. Also Research Data. Mostly Research Data.`,
        `Chart ${target} new discoveries. The map has blank spots and Dr. Redd has opinions about it.`,
      ];
      const desc = target === 1
        ? singleDiscoverFlavors[Math.floor(rng() * singleDiscoverFlavors.length)]
        : multiDiscoverFlavors[Math.floor(rng() * multiDiscoverFlavors.length)];

      return {
        category: 'discover',
        description: desc,
        icon: '🔍',
        target,
        researchDataReward: Math.round((period === 'weekly' ? BASE_WEEKLY_REWARD : BASE_DAILY_REWARD) * 1.5),
      };
    },
  },
];

/**
 * Generate contracts for a given period, ensuring category diversity.
 */
function generateContracts(
  state: GameState,
  period: ContractPeriod,
  count: number,
  dateStr: string,
): Contract[] {
  const rng = seededRandom(dateSeed(dateStr, period === 'weekly' ? 7777 : 3333));

  // Generate all possible contracts
  const possible: Array<Omit<Contract, 'id' | 'period' | 'completed' | 'claimed' | 'progress'>> = [];
  const shuffled = [...TEMPLATES].sort(() => rng() - 0.5);

  for (const template of shuffled) {
    const contract = template.generate(state, period, rng);
    if (contract) {
      possible.push(contract);
    }
  }

  // Pick contracts ensuring category diversity
  const selected: typeof possible = [];
  const usedCategories = new Set<ContractCategory>();

  // First pass: one per category
  for (const contract of possible) {
    if (selected.length >= count) break;
    if (!usedCategories.has(contract.category)) {
      selected.push(contract);
      usedCategories.add(contract.category);
    }
  }

  // Second pass: fill remaining slots if needed (allow duplicates)
  if (selected.length < count) {
    for (const contract of possible) {
      if (selected.length >= count) break;
      if (!selected.includes(contract)) {
        selected.push(contract);
      }
    }
  }

  return selected.map((contract, i) => ({
    ...contract,
    id: `${period}-${dateStr}-${i}`,
    period,
    progress: 0,
    completed: false,
    claimed: false,
  }));
}

/**
 * Initialize or refresh contracts based on the current date.
 * Returns a new ContractState if contracts need updating, null otherwise.
 */
export function refreshContracts(state: GameState): ContractState {
  const today = getTodayString();
  const weekStart = getWeekStartString();
  const current = state.contracts;

  let daily = current?.daily || [];
  let weekly = current?.weekly || [];
  let lastDailyReset = current?.lastDailyReset || '';
  let lastWeeklyReset = current?.lastWeeklyReset || '';

  // Reset daily contracts if new day
  if (lastDailyReset !== today) {
    daily = generateContracts(state, 'daily', DAILY_COUNT, today);
    lastDailyReset = today;
  }

  // Reset weekly contracts if new week
  if (lastWeeklyReset !== weekStart) {
    weekly = generateContracts(state, 'weekly', WEEKLY_COUNT, weekStart);
    lastWeeklyReset = weekStart;
  }

  return {
    daily,
    weekly,
    lastDailyReset,
    lastWeeklyReset,
    researchData: current?.researchData || 0,
    totalResearchDataEarned: current?.totalResearchDataEarned || 0,
  };
}

/**
 * Update contract progress based on a game action.
 * Returns updated contracts array or null if no changes.
 */
export function updateContractProgress(
  contracts: Contract[],
  action: { type: string; payload?: Record<string, unknown> },
  state: GameState,
): Contract[] {
  return contracts.map(contract => {
    if (contract.completed) return contract;

    let newProgress = contract.progress;

    switch (contract.category) {
      case 'gather': {
        if (action.type === 'GATHER_RESOURCE' && contract.trackingParams?.resourceId) {
          const payload = action.payload as { resourceId: ResourceId; amount: number } | undefined;
          if (payload?.resourceId === contract.trackingParams.resourceId) {
            newProgress += payload.amount;
          }
        }
        break;
      }

      case 'build': {
        if (action.type === 'BUILD_AUTOMATION') {
          newProgress += 1;
        }
        break;
      }

      case 'upgrade': {
        if (action.type === 'UPGRADE_AUTOMATION') {
          newProgress += 1;
        }
        break;
      }

      case 'expedition': {
        if (action.type === 'COLLECT_EXPEDITION' || action.type === 'RECALL_EXPEDITION') {
          newProgress += 1;
        }
        break;
      }

      case 'produce': {
        // Production tracked via TICK — handled separately in useContracts hook
        break;
      }

      case 'level_up': {
        // Check current max level of the target automation type
        if (contract.trackingParams?.automationType) {
          let maxLevel = 0;
          for (const biomeId of state.unlockedBiomes) {
            for (const auto of state.biomes[biomeId].automations) {
              if (auto.type === contract.trackingParams.automationType) {
                maxLevel = Math.max(maxLevel, auto.level);
              }
            }
          }
          newProgress = maxLevel;
        }
        break;
      }

      case 'food': {
        // Snapshot current total food
        const totalFood = Object.values(state.food).reduce((s, a) => s + a, 0);
        newProgress = Math.floor(totalFood);
        break;
      }

      case 'discover': {
        if (action.type === 'UNLOCK_BIOME' || action.type === 'ACKNOWLEDGE_RESOURCE_DISCOVERY') {
          newProgress += 1;
        }
        // Expedition discoveries: count new biome + new resources found
        if (action.type === 'COLLECT_EXPEDITION') {
          const payload = action.payload as { newBiome?: string | null; newResources?: string[] } | undefined;
          if (payload?.newBiome) newProgress += 1;
          if (payload?.newResources) newProgress += payload.newResources.length;
        }
        break;
      }
    }

    if (newProgress === contract.progress) return contract;

    const completed = newProgress >= contract.target;
    return { ...contract, progress: Math.min(newProgress, contract.target), completed };
  });
}

/**
 * Initial empty contract state.
 */
export const INITIAL_CONTRACT_STATE: ContractState = {
  daily: [],
  weekly: [],
  lastDailyReset: '',
  lastWeeklyReset: '',
  researchData: 0,
  totalResearchDataEarned: 0,
};
