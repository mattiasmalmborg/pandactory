import { BiomeId, ResourceId, AutomationType } from './game.types';

export interface BiomeConfig {
  id: BiomeId;
  name: string;
  description: string;
  icon: string;
  primaryResources: ResourceId[]; // Core resources always available
  discoverableResources?: ResourceId[]; // Resources that must be discovered via expeditions
  availableAutomations: AutomationType[];
  unlockCondition?: {
    type: 'expedition' | 'resource';
    required?: { resourceId: ResourceId; amount: number }[];
  };
  backgroundColor: string;
  accentColor: string;
}
