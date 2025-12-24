import { useState } from 'react';
import { RESOURCES } from '../../game/config/resources';
import { BIOMES } from '../../game/config/biomes';
import { ResourceId, BiomeId, PowerCellTier } from '../../types/game.types';
import { POWER_CELLS } from '../../game/config/powerCells';

interface ExpeditionRewardsProps {
  rewards: { resourceId: ResourceId; amount: number }[];
  powerCells: PowerCellTier[];
  newBiome: BiomeId | null;
  newResources: ResourceId[];
  onClose: () => void;
}

// Random confirmation button texts
const CONFIRMATION_TEXTS = [
  'Alright!', 'Awesome!', 'Great!', 'Perfect!', 'Excellent!',
  'Fantastic!', 'Wonderful!', 'Nice!', 'Sweet!', 'Cool!'
];

export function ExpeditionRewards({
  rewards,
  powerCells,
  newBiome,
  newResources,
  onClose
}: ExpeditionRewardsProps) {
  const [currentStep, setCurrentStep] = useState<'rewards' | 'biome' | 'resources' | 'done'>('rewards');
  const [shownResources, setShownResources] = useState<ResourceId[]>([]);
  // Random button text - calculated once and stays the same
  const [randomButtonText] = useState(() => CONFIRMATION_TEXTS[Math.floor(Math.random() * CONFIRMATION_TEXTS.length)]);

  const handleNext = () => {
    if (currentStep === 'rewards') {
      if (newBiome) {
        setCurrentStep('biome');
      } else if (newResources.length > 0) {
        setCurrentStep('resources');
      } else {
        setCurrentStep('done');
        onClose();
      }
    } else if (currentStep === 'biome') {
      if (newResources.length > 0) {
        setCurrentStep('resources');
      } else {
        setCurrentStep('done');
        onClose();
      }
    } else if (currentStep === 'resources') {
      // Show next resource or finish
      // Note: When clicking, we're viewing resource at index shownResources.length
      // So if shownResources.length + 1 >= newResources.length, we've seen the last one
      if (shownResources.length + 1 < newResources.length) {
        // More resources to show
        setShownResources([...shownResources, newResources[shownResources.length]]);
      } else {
        // This was the last resource
        setCurrentStep('done');
        onClose();
      }
    }
  };

  // Show rewards summary
  if (currentStep === 'rewards') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 z-50 overflow-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="min-h-full flex items-center justify-center p-4 pt-8 pb-24">
        <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-xl border-2 border-green-500 p-4 sm:p-6 max-w-md w-full shadow-2xl">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🎉</div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Expedition Complete!
            </h2>
            <p className="text-green-200">Dr. Redd Pawston III has returned with treasures!</p>
          </div>

          {/* Resources Found */}
          <div className="bg-green-950/50 rounded-lg p-4 mb-4 border border-green-600">
            <h3 className="text-lg font-semibold text-green-200 mb-3">Resources Found:</h3>
            <div className="space-y-2">
              {rewards.map(({ resourceId, amount }) => {
                const resource = RESOURCES[resourceId];
                return (
                  <div key={resourceId} className="flex items-center justify-between bg-green-900/30 rounded p-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{resource?.icon ?? '❓'}</span>
                      <span className="text-white font-semibold">{resource?.name ?? 'Unknown'}</span>
                    </div>
                    <span className="text-green-400 font-bold text-xl">+{amount}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Power Cells Found */}
          {powerCells.length > 0 && (
            <div className="bg-yellow-900/30 rounded-lg p-4 mb-4 border border-yellow-600">
              <h3 className="text-lg font-semibold text-yellow-200 mb-3">Power Cells Found:</h3>
              <div className="space-y-2">
                {powerCells.map((tier, idx) => {
                  const powerCell = POWER_CELLS[tier];
                  return (
                    <div key={idx} className="flex items-center justify-between bg-yellow-900/30 rounded p-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{powerCell.icon}</span>
                        <span className="text-white font-semibold">{powerCell.name}</span>
                      </div>
                      <span className="text-yellow-400 font-bold">+{Math.round(powerCell.bonus * 100)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Continue Button */}
          <button
            onClick={handleNext}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors"
          >
            {randomButtonText}
          </button>
        </div>
        </div>
      </div>
    );
  }

  // Show new biome discovery - big celebration!
  if (currentStep === 'biome' && newBiome) {
    const biome = BIOMES[newBiome];
    return (
      <div className="fixed inset-0 bg-black bg-opacity-85 z-50 overflow-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="min-h-full flex items-center justify-center p-4 pt-8 pb-24">
        <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 rounded-xl border-2 border-purple-400 p-4 sm:p-6 max-w-md w-full shadow-2xl">
          {/* Header with celebration */}
          <div className="text-center mb-6">
            <div className="text-6xl mb-3">🎊</div>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 mb-2">
              New Biome Discovered!
            </h2>
            <p className="text-purple-200 text-sm">Dr. Redd Pawston III found something amazing!</p>
          </div>

          {/* Biome Info - larger and more prominent */}
          <div className="bg-purple-950/60 rounded-lg p-6 mb-4 border border-purple-500 text-center shadow-inner">
            <div className="text-6xl mb-4">{biome.icon}</div>
            <h3 className="text-3xl font-bold text-white mb-3">{biome.name}</h3>
            <p className="text-purple-200 text-sm italic leading-relaxed">{biome.description}</p>
          </div>

          {/* Hint */}
          <div className="text-center text-xs text-purple-300 mb-4">
            Visit the Biome view to explore this new area!
          </div>

          {/* Continue Button - gradient */}
          <button
            onClick={handleNext}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all shadow-lg"
          >
            {randomButtonText}
          </button>
        </div>
        </div>
      </div>
    );
  }

  // Show new resource discovery (one at a time)
  if (currentStep === 'resources' && shownResources.length < newResources.length) {
    const resourceId = newResources[shownResources.length];
    const resource = RESOURCES[resourceId];
    const resourceIndex = shownResources.length + 1;
    const totalResources = newResources.length;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 z-50 overflow-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="min-h-full flex items-center justify-center p-4 pt-8 pb-24">
        <div className="bg-gradient-to-br from-cyan-900 via-blue-900 to-cyan-800 rounded-xl border-2 border-cyan-400 p-4 sm:p-6 max-w-md w-full shadow-2xl">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">✨</div>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300 mb-2">
              New Resource Discovered!
            </h2>
            {totalResources > 1 && (
              <p className="text-cyan-300 text-xs">Discovery {resourceIndex} of {totalResources}</p>
            )}
          </div>

          {/* Resource Info */}
          <div className="bg-blue-950/60 rounded-lg p-6 mb-4 border border-cyan-500 text-center shadow-inner">
            <div className="text-6xl mb-4">{resource?.icon ?? '❓'}</div>
            <h3 className="text-2xl font-bold text-white mb-3">{resource?.name ?? 'Unknown'}</h3>
            <p className="text-cyan-200 text-sm italic leading-relaxed">{resource?.description}</p>
          </div>

          {/* Hint */}
          <div className="text-center text-xs text-cyan-300 mb-4">
            This resource can now be gathered and used in automations!
          </div>

          {/* Continue Button */}
          <button
            onClick={handleNext}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all shadow-lg"
          >
            {randomButtonText}
          </button>
        </div>
        </div>
      </div>
    );
  }

  return null;
}
