import { AutomationType, ResourceId, ResourceCost, FoodId } from './game.types';

export interface AutomationConfig {
  type: AutomationType;
  name: string;
  description: string;
  category: 'gatherer' | 'processor' | 'crafter' | 'food_producer' | 'final_assembler';
  baseCost: ResourceCost[];
  baseProductionRate: number; // per minute
  produces: { resourceId: ResourceId; amount: number }[];
  producesFood?: { foodId: FoodId; amount: number }[]; // NEW: For food production
  consumes?: { resourceId: ResourceId; amount: number }[];
  upgradeSlots: number;
  levelUpCostMultiplier: number;
  maxInstancesPerBiome?: number; // Default: unlimited, set to 1 for single instance
}
