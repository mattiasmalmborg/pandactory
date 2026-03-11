import { BackgroundWrapper } from '../layout/BackgroundWrapper';
import { getBiomeBackgroundPath, getFallbackGradient } from '../../config/assets';

export function PandaLab() {
  return (
    <BackgroundWrapper
      backgroundPath={getBiomeBackgroundPath('skills_stats')}
      fallbackGradient={getFallbackGradient('skills_stats')}
      overlayOpacity={75}
    >
      <div className="p-4 pb-24 space-y-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">🔬 Dr. Redd's Lab</h1>
          <p className="text-sm text-gray-300 mt-1">
            An abandoned alien laboratory... what secrets does it hold?
          </p>
        </div>

        <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 text-center">
          <span className="text-4xl">🧪</span>
          <p className="text-gray-400 mt-3 text-sm">
            Research, experiments, and artifact analysis coming soon...
          </p>
          <p className="text-gray-500 mt-1 text-xs italic">
            Dr. Redd is still setting up the equipment.
          </p>
        </div>
      </div>
    </BackgroundWrapper>
  );
}
