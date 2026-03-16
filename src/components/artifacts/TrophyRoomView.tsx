import { BackgroundWrapper } from '../layout/BackgroundWrapper';
import { getBiomeBackgroundPath, getFallbackGradient } from '../../config/assets';
import { TrophyRoom } from './TrophyRoom';

export function TrophyRoomView() {
  return (
    <BackgroundWrapper
      backgroundPath={getBiomeBackgroundPath('skills_stats')}
      fallbackGradient={getFallbackGradient('skills_stats')}
      overlayOpacity={50}
    >
      <div className="p-4 pb-24 space-y-3">
        <TrophyRoom />
      </div>
    </BackgroundWrapper>
  );
}
