import { useGame } from '../../game/state/GameContext';
import { SKILL_TREE, canUnlockSkill } from '../../game/config/skillTree';
import { SkillId, SkillNode } from '../../types/game.types';
import { useState } from 'react';
import { BackgroundWrapper } from '../layout/BackgroundWrapper';
import { getScreenBackgroundPath, getFallbackGradient } from '../../config/assets';

// Group skills by branch
const BRANCHES = {
  production: { name: 'Production', icon: '⚙️', color: 'blue' },
  economy: { name: 'Economy', icon: '💰', color: 'yellow' },
  expedition: { name: 'Expedition', icon: '🗺️', color: 'green' },
  power_cells: { name: 'Power Cells', icon: '🔋', color: 'orange' },
} as const;

export function SkillTree() {
  const { state, dispatch } = useGame();
  const [selectedSkill, setSelectedSkill] = useState<SkillId | null>(null);

  const handleUnlockSkill = (skillId: SkillId) => {
    const skill = SKILL_TREE[skillId];
    if (!canUnlockSkill(skillId, state.prestige.unlockedSkills)) return;
    if (state.prestige.cosmicBambooShards < skill.cost) return;

    dispatch({ type: 'UNLOCK_SKILL', payload: { skillId } });
    setSelectedSkill(null);
  };

  // Only show if player has prestiged at least once
  const hasPrestiged = state.prestige.totalPrestiges > 0;

  const skillTreeContent = !hasPrestiged ? (
    <div className="p-4 space-y-4 pb-24">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">Skill Tree</h1>
        <p className="text-sm text-gray-400">Permanent upgrades using Cosmic Bamboo Shards</p>
      </div>

      <div className="bg-purple-900/30 border border-purple-500 rounded-lg p-8 text-center space-y-4">
        <div className="text-6xl">🔒</div>
        <div>
          <h2 className="text-xl font-bold text-purple-300 mb-2">Skill Tree Locked</h2>
          <p className="text-gray-300 text-sm">
            Complete the S.S. Bamboozle and launch it to unlock the Skill Tree!
          </p>
          <p className="text-gray-400 text-xs mt-2">
            Launching your spaceship will earn you Cosmic Bamboo Shards which can be spent here on permanent upgrades that persist across all future runs.
          </p>
        </div>
      </div>
    </div>
  ) : (
    <div className="p-4 space-y-4 pb-24">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">Skill Tree</h1>
        <p className="text-sm text-gray-400">Permanent upgrades using Cosmic Bamboo Shards</p>
      </div>

      {/* Cosmic Bamboo Balance */}
      <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🎋</span>
            <div>
              <div className="text-xs text-gray-400">Cosmic Bamboo Shards</div>
              <div className="text-2xl font-bold text-purple-200">{state.prestige.cosmicBambooShards}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">Skills Unlocked</div>
            <div className="text-xl font-bold text-purple-300">{state.prestige.unlockedSkills.length}/{Object.keys(SKILL_TREE).length}</div>
          </div>
        </div>
      </div>

      {/* Skill Branches */}
      {Object.entries(BRANCHES).map(([branchKey, branchInfo]) => {
        const branchSkills = Object.values(SKILL_TREE)
          .filter(skill => skill.branch === branchKey)
          .sort((a, b) => a.tier - b.tier);

        return (
          <div key={branchKey} className="bg-gray-800/85 backdrop-blur-sm rounded-lg border border-gray-700/50 p-4 space-y-3">
            {/* Branch Header */}
            <div className="flex items-center gap-2 border-b border-gray-700 pb-2">
              <span className="text-2xl">{branchInfo.icon}</span>
              <h2 className="text-lg font-semibold text-white">{branchInfo.name}</h2>
            </div>

            {/* Skills in this branch */}
            <div className="space-y-2">
              {branchSkills.map(skill => {
                const isUnlocked = state.prestige.unlockedSkills.includes(skill.id);
                const canUnlock = canUnlockSkill(skill.id, state.prestige.unlockedSkills);
                const canAfford = state.prestige.cosmicBambooShards >= skill.cost;
                const isSelected = selectedSkill === skill.id;

                return (
                  <button
                    key={skill.id}
                    onClick={() => setSelectedSkill(skill.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      isUnlocked
                        ? 'bg-green-900/30 border-green-600 cursor-default'
                        : canUnlock && canAfford
                        ? 'bg-gray-900/50 border-yellow-500 hover:bg-yellow-900/20 cursor-pointer'
                        : canUnlock
                        ? 'bg-gray-900/50 border-gray-600 hover:bg-gray-800/50 cursor-pointer'
                        : 'bg-gray-900/30 border-gray-700/50 opacity-50 cursor-not-allowed'
                    } ${isSelected ? 'ring-2 ring-white' : ''}`}
                    disabled={isUnlocked || !canUnlock}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-semibold ${
                            isUnlocked ? 'text-green-300' :
                            canUnlock && canAfford ? 'text-yellow-300' :
                            canUnlock ? 'text-white' : 'text-gray-500'
                          }`}>
                            {skill.name}
                          </span>
                          {isUnlocked && <span className="text-green-400 text-sm">✓</span>}
                        </div>
                        <p className="text-xs text-gray-400 mb-2">{skill.description}</p>
                        <div className="flex items-center gap-2 text-xs">
                          <span className={`flex items-center gap-1 ${
                            isUnlocked ? 'text-green-400' :
                            canAfford ? 'text-yellow-300' : 'text-gray-500'
                          }`}>
                            🎋 {skill.cost}
                          </span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-400">Tier {skill.tier}</span>
                        </div>
                      </div>
                    </div>

                    {/* Requirements */}
                    {skill.requires.length > 0 && !isUnlocked && (
                      <div className="mt-2 pt-2 border-t border-gray-700">
                        <div className="text-xs text-gray-500">
                          Requires:{' '}
                          {skill.requires.map((reqId, i) => {
                            const reqSkill = SKILL_TREE[reqId];
                            const reqUnlocked = state.prestige.unlockedSkills.includes(reqId);
                            return (
                              <span key={reqId} className={reqUnlocked ? 'text-green-400' : 'text-red-400'}>
                                {reqSkill.name}{i < skill.requires.length - 1 ? ', ' : ''}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Selected Skill Modal/Popup */}
      {selectedSkill && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedSkill(null)}>
          <div className="bg-gray-900 border-2 border-purple-500 rounded-lg max-w-md w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            {(() => {
              const skill = SKILL_TREE[selectedSkill];
              const isUnlocked = state.prestige.unlockedSkills.includes(skill.id);
              const canUnlock = canUnlockSkill(skill.id, state.prestige.unlockedSkills);
              const canAfford = state.prestige.cosmicBambooShards >= skill.cost;

              return (
                <>
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-purple-200 mb-2">{skill.name}</h2>
                    <p className="text-sm text-gray-300">{skill.description}</p>
                  </div>

                  <div className="bg-purple-950/50 border border-purple-600 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-gray-400">Cost</div>
                        <div className={`font-bold ${canAfford ? 'text-yellow-300' : 'text-red-400'}`}>
                          🎋 {skill.cost}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">Branch</div>
                        <div className="font-bold text-white">{BRANCHES[skill.branch as keyof typeof BRANCHES].name}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Tier</div>
                        <div className="font-bold text-white">{skill.tier}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Effect</div>
                        <div className="font-bold text-green-300">{formatEffect(skill)}</div>
                      </div>
                    </div>
                  </div>

                  {skill.requires.length > 0 && (
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-1">Requirements:</div>
                      <div className="space-y-1">
                        {skill.requires.map(reqId => {
                          const reqSkill = SKILL_TREE[reqId];
                          const reqUnlocked = state.prestige.unlockedSkills.includes(reqId);
                          return (
                            <div key={reqId} className={`text-sm flex items-center gap-2 ${reqUnlocked ? 'text-green-400' : 'text-red-400'}`}>
                              {reqUnlocked ? '✓' : '✗'} {reqSkill.name}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedSkill(null)}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                    >
                      Close
                    </button>
                    {!isUnlocked && (
                      <button
                        onClick={() => handleUnlockSkill(skill.id)}
                        disabled={!canUnlock || !canAfford}
                        className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                          canUnlock && canAfford
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Unlock
                      </button>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <BackgroundWrapper
      backgroundPath={getScreenBackgroundPath('skillTree')}
      fallbackGradient={getFallbackGradient('skillTree')}
      overlayOpacity={50}
    >
      {skillTreeContent}
    </BackgroundWrapper>
  );
}

function formatEffect(skill: SkillNode): string {
  const value = skill.effect.value;

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (typeof value === 'number') {
    // Format as percentage if it's a decimal
    if (value < 1) {
      return `+${(value * 100).toFixed(0)}%`;
    }
    return `+${value}`;
  }

  return String(value);
}
