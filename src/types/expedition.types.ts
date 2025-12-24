import { ResourceId, PowerCellTier, BiomeId, AutomationType } from './game.types';

export interface ExpeditionReward {
  resources: { resourceId: ResourceId; baseAmount: number }[];
  discoveries: {
    biomes?: BiomeId[];
    automations?: AutomationType[];
    powerCells?: PowerCellTier[];
  };
}

export interface ExpeditionResult {
  resources: Record<ResourceId, number>;
  powerCells: PowerCellTier[];
  discoveries: {
    biome?: BiomeId;
    automation?: AutomationType;
  };
  bonusApplied: number; // percentage
}
