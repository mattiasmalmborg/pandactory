import { useState } from 'react';
import { RESOURCES } from '../../game/config/resources';
import { BIOMES } from '../../game/config/biomes';
import { ResourceId, BiomeId, PowerCellTier, ArtifactTemplateId } from '../../types/game.types';
import { POWER_CELLS } from '../../game/config/powerCells';
import { ARTIFACT_TEMPLATES, RARITY_COLORS } from '../../game/config/artifacts';

interface ExpeditionRewardsProps {
  rewards: { resourceId: ResourceId; amount: number }[];
  powerCells: PowerCellTier[];
  newBiome: BiomeId | null;
  newResources: ResourceId[];
  artifactDrops?: ArtifactTemplateId[];
  onClose: () => void;
}

// Random confirmation button texts
const CONFIRMATION_TEXTS = [
  'Alright!', 'Awesome!', 'Great!', 'Perfect!', 'Excellent!',
  'Fantastic!', 'Wonderful!', 'Nice!', 'Sweet!', 'Cool!'
];

type RewardStep = 'rewards' | 'artifacts' | 'biome' | 'resources' | 'done';

export function ExpeditionRewards({
  rewards,
  powerCells,
  newBiome,
  newResources,
  artifactDrops = [],
  onClose
}: ExpeditionRewardsProps) {
  const [currentStep, setCurrentStep] = useState<RewardStep>('rewards');
  const [shownResources, setShownResources] = useState<ResourceId[]>([]);
  const [shownArtifacts, setShownArtifacts] = useState(0);
  // Random button text - calculated once and stays the same
  const [randomButtonText] = useState(() => CONFIRMATION_TEXTS[Math.floor(Math.random() * CONFIRMATION_TEXTS.length)]);

  const goToNextAfterArtifacts = () => {
    if (newBiome) setCurrentStep('biome');
    else if (newResources.length > 0) setCurrentStep('resources');
    else { setCurrentStep('done'); onClose(); }
  };

  const handleNext = () => {
    if (currentStep === 'rewards') {
      if (artifactDrops.length > 0) {
        setCurrentStep('artifacts');
      } else if (newBiome) {
        setCurrentStep('biome');
      } else if (newResources.length > 0) {
        setCurrentStep('resources');
      } else {
        setCurrentStep('done');
        onClose();
      }
    } else if (currentStep === 'artifacts') {
      if (shownArtifacts + 1 < artifactDrops.length) {
        setShownArtifacts(shownArtifacts + 1);
      } else {
        goToNextAfterArtifacts();
      }
    } else if (currentStep === 'biome') {
      if (newResources.length > 0) {
        setCurrentStep('resources');
      } else {
        setCurrentStep('done');
        onClose();
      }
    } else if (currentStep === 'resources') {
      if (shownResources.length + 1 < newResources.length) {
        setShownResources([...shownResources, newResources[shownResources.length]]);
      } else {
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

  // Show artifact discovery
  if (currentStep === 'artifacts' && shownArtifacts < artifactDrops.length) {
    const templateId = artifactDrops[shownArtifacts];
    const template = ARTIFACT_TEMPLATES[templateId];
    const rarity = RARITY_COLORS[template.rarity];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-85 z-50 overflow-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="min-h-full flex items-center justify-center p-4 pt-8 pb-24">
        <div className={`bg-gradient-to-br from-amber-950 via-yellow-950 to-amber-900 rounded-xl border-2 border-amber-500 p-4 sm:p-6 max-w-md w-full shadow-2xl ${rarity.glow}`}>
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🏺</div>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-200 mb-2">
              Artifact Found!
            </h2>
            <p className="text-amber-200 text-sm">
              "Wait, what's this? Something unusual buried in the ground..."
            </p>
          </div>

          {/* Artifact Info */}
          <div className={`bg-black/30 rounded-lg p-6 mb-4 border ${rarity.border} text-center shadow-inner`}>
            <div className="text-6xl mb-4">{template.icon}</div>
            <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${rarity.text}`}>
              {template.rarity}
            </p>
            <h3 className="text-2xl font-bold text-white mb-1">???</h3>
            <p className="text-amber-200/60 text-sm italic">Unanalyzed — take it to the Lab!</p>
          </div>

          {/* Hint */}
          <div className="text-center text-xs text-amber-300 mb-4">
            Visit Dr. Redd's Lab to analyze this artifact and discover its secrets.
          </div>

          {/* Continue Button */}
          <button
            onClick={handleNext}
            className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all shadow-lg"
          >
            {artifactDrops.length > 1 && shownArtifacts + 1 < artifactDrops.length
              ? 'There\'s more...'
              : randomButtonText}
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
