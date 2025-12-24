import { useState } from 'react';
import { BIOMES } from '../../game/config/biomes';
import { RESOURCES } from '../../game/config/resources';
import { BiomeId } from '../../types/game.types';

interface BiomeIntroPopupProps {
  biomeId: BiomeId;
  onClose: () => void;
}

// Random confirmation button texts
const CONFIRMATION_TEXTS = [
  'Got it!', 'Awesome!', 'Great!', 'Perfect!', 'Excellent!',
  'Let\'s go!', 'Wonderful!', 'Nice!', 'Sweet!', 'Cool!'
];

export function BiomeIntroPopup({ biomeId, onClose }: BiomeIntroPopupProps) {
  const biomeConfig = BIOMES[biomeId];
  const [currentStep, setCurrentStep] = useState<'biome' | 'resources' | 'done'>('biome');
  const [currentResourceIndex, setCurrentResourceIndex] = useState(0);
  const [randomButtonText] = useState(() => CONFIRMATION_TEXTS[Math.floor(Math.random() * CONFIRMATION_TEXTS.length)]);

  // Get primary resources for this biome (excluding food for the intro)
  const primaryResources = biomeConfig.primaryResources.filter(
    resId => RESOURCES[resId]?.category !== 'food'
  );

  const handleNext = () => {
    if (currentStep === 'biome') {
      if (primaryResources.length > 0) {
        setCurrentStep('resources');
      } else {
        setCurrentStep('done');
        onClose();
      }
    } else if (currentStep === 'resources') {
      if (currentResourceIndex + 1 < primaryResources.length) {
        setCurrentResourceIndex(currentResourceIndex + 1);
      } else {
        setCurrentStep('done');
        onClose();
      }
    }
  };

  // Show biome introduction
  if (currentStep === 'biome') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-85 z-50 overflow-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="min-h-full flex items-center justify-center p-4 pt-8 pb-24">
        <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-800 rounded-xl border-2 border-emerald-400 p-4 sm:p-6 max-w-md w-full shadow-2xl">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-6xl mb-3">🗺️</div>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-300 mb-2">
              Welcome to {biomeConfig.name}!
            </h2>
            <p className="text-emerald-200 text-sm">A new area to explore and gather resources!</p>
          </div>

          {/* Biome Info */}
          <div className="bg-emerald-950/60 rounded-lg p-6 mb-4 border border-emerald-500 text-center shadow-inner">
            <div className="text-6xl mb-4">{biomeConfig.icon}</div>
            <h3 className="text-2xl font-bold text-white mb-3">{biomeConfig.name}</h3>
            <p className="text-emerald-200 text-sm italic leading-relaxed">{biomeConfig.description}</p>
          </div>

          {/* Resource preview */}
          <div className="text-center text-xs text-emerald-300 mb-4">
            This biome contains {primaryResources.length} new resources to discover!
          </div>

          {/* Continue Button */}
          <button
            onClick={handleNext}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all shadow-lg"
          >
            {primaryResources.length > 0 ? 'See Resources' : randomButtonText}
          </button>
        </div>
        </div>
      </div>
    );
  }

  // Show resource introduction (one at a time)
  if (currentStep === 'resources') {
    const resourceId = primaryResources[currentResourceIndex];
    const resource = RESOURCES[resourceId];
    const totalResources = primaryResources.length;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 z-50 overflow-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="min-h-full flex items-center justify-center p-4 pt-8 pb-24">
        <div className="bg-gradient-to-br from-amber-900 via-orange-900 to-amber-800 rounded-xl border-2 border-amber-400 p-4 sm:p-6 max-w-md w-full shadow-2xl">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🔍</div>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-300 mb-2">
              New Resource Available!
            </h2>
            {totalResources > 1 && (
              <p className="text-amber-300 text-xs">Resource {currentResourceIndex + 1} of {totalResources}</p>
            )}
          </div>

          {/* Resource Info */}
          <div className="bg-orange-950/60 rounded-lg p-6 mb-4 border border-amber-500 text-center shadow-inner">
            <div className="text-6xl mb-4">{resource?.icon ?? '❓'}</div>
            <h3 className="text-2xl font-bold text-white mb-3">{resource?.name ?? 'Unknown'}</h3>
            <p className="text-amber-200 text-sm italic leading-relaxed">{resource?.description}</p>
            {resource?.flavorText && (
              <p className="text-amber-300/70 text-xs italic mt-3">"{resource.flavorText}"</p>
            )}
          </div>

          {/* Hint */}
          <div className="text-center text-xs text-amber-300 mb-4">
            Gather this resource manually or build automations to collect it!
          </div>

          {/* Continue Button */}
          <button
            onClick={handleNext}
            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all shadow-lg"
          >
            {currentResourceIndex + 1 < totalResources ? 'Next Resource' : randomButtonText}
          </button>
        </div>
        </div>
      </div>
    );
  }

  return null;
}
