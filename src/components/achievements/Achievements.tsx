import { useGame } from '../../game/state/GameContext';
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES, getAchievementsByCategory, getTotalAchievementCount } from '../../game/config/achievements';
import { AchievementCategory, AchievementId } from '../../types/game.types';
import { BackgroundWrapper } from '../layout/BackgroundWrapper';
import { getBiomeBackgroundPath, getFallbackGradient } from '../../config/assets';

interface AchievementCardProps {
  id: AchievementId;
  unlocked: boolean;
}

function AchievementCard({ id, unlocked }: AchievementCardProps) {
  const achievement = ACHIEVEMENTS[id];
  const isHidden = achievement.hidden && !unlocked;

  return (
    <div
      className={`
        p-3 rounded-lg border transition-all duration-300
        ${unlocked
          ? 'bg-gradient-to-br from-yellow-900/50 to-amber-900/50 border-yellow-500/50'
          : isHidden
            ? 'bg-gray-900/50 border-gray-700/30'
            : 'bg-gray-800/50 border-gray-700/30 opacity-60'
        }
      `}
    >
      <div className="flex items-start gap-3">
        <div className={`text-2xl ${unlocked ? '' : 'grayscale opacity-50'}`}>
          {isHidden ? '❓' : achievement.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-sm ${unlocked ? 'text-yellow-200' : 'text-gray-400'}`}>
            {isHidden ? '???' : achievement.name}
          </h3>
          <p className={`text-xs mt-0.5 ${unlocked ? 'text-gray-300' : 'text-gray-500'}`}>
            {isHidden ? 'Complete to reveal' : achievement.description}
          </p>
          {unlocked && achievement.flavorText && (
            <p className="text-xs mt-1 text-amber-400/80 italic">
              "{achievement.flavorText}"
            </p>
          )}
        </div>
        {unlocked && (
          <div className="text-green-400 text-lg">✓</div>
        )}
      </div>
    </div>
  );
}

interface CategorySectionProps {
  category: AchievementCategory;
  unlockedAchievements: AchievementId[];
}

function CategorySection({ category, unlockedAchievements }: CategorySectionProps) {
  const categoryInfo = ACHIEVEMENT_CATEGORIES[category];
  const achievements = getAchievementsByCategory(category);
  const unlockedCount = achievements.filter(a => unlockedAchievements.includes(a.id)).length;

  return (
    <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>{categoryInfo.icon}</span>
          <span>{categoryInfo.name}</span>
        </h2>
        <span className={`text-sm font-medium px-2 py-0.5 rounded ${
          unlockedCount === achievements.length
            ? 'bg-green-900/50 text-green-300'
            : 'bg-gray-700/50 text-gray-400'
        }`}>
          {unlockedCount}/{achievements.length}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {achievements.map(achievement => (
          <AchievementCard
            key={achievement.id}
            id={achievement.id}
            unlocked={unlockedAchievements.includes(achievement.id)}
          />
        ))}
      </div>
    </div>
  );
}

export function Achievements() {
  const { state } = useGame();
  const unlockedAchievements = state.achievements?.unlocked || [];
  const hasPrestiged = state.prestige.totalPrestiges >= 1;

  // Hide crashes category entirely before first prestige
  const visibleCategories: AchievementCategory[] = [
    'gathering',
    'automation',
    'power_cells',
    'expedition',
    'biomes',
    ...(hasPrestiged ? ['crashes' as AchievementCategory] : []),
    'skills',
    'milestones',
    'secret',
  ];

  // Calculate total achievements excluding hidden crashes if not prestiged
  const crashesAchievementCount = getAchievementsByCategory('crashes').length;
  const totalAchievements = getTotalAchievementCount() - (hasPrestiged ? 0 : crashesAchievementCount);
  const unlockedCount = unlockedAchievements.length;
  const progressPercent = Math.round((unlockedCount / totalAchievements) * 100);

  const achievementsContent = (
    <div className="p-4 pb-24 space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-br from-yellow-900/50 to-amber-900/50 backdrop-blur-sm rounded-lg border border-yellow-500/50 p-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold text-yellow-200 flex items-center gap-2">
            🏆 Achievements
          </h1>
          <span className="text-yellow-300 font-bold">
            {unlockedCount}/{totalAchievements}
          </span>
        </div>
        {/* Progress bar */}
        <div className="relative h-3 bg-gray-700/50 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-center text-yellow-200/80 text-sm mt-2">
          {progressPercent}% Complete
        </p>
      </div>

      {/* Categories */}
      {visibleCategories.map(category => (
        <CategorySection
          key={category}
          category={category}
          unlockedAchievements={unlockedAchievements}
        />
      ))}
    </div>
  );

  return (
    <BackgroundWrapper
      backgroundPath={getBiomeBackgroundPath('skills_stats')}
      fallbackGradient={getFallbackGradient('skills_stats')}
      overlayOpacity={50}
    >
      {achievementsContent}
    </BackgroundWrapper>
  );
}
