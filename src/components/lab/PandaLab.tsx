import { useMemo, useState, useEffect, useCallback } from 'react';
import { useGame } from '../../game/state/GameContext';
import { RESEARCH_NODES, getResearchCost, getResearchBonus, getResearchDuration } from '../../game/config/research';
import { ResearchId, ResearchNode, ActiveResearch } from '../../types/game.types';
import { formatNumber } from '../../utils/formatters';

function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return 'Done!';
  const totalSeconds = Math.ceil(ms / 1000);
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
}

function ActiveResearchBar({
  activeResearch,
  onComplete,
}: {
  activeResearch: ActiveResearch;
  onComplete: () => void;
}) {
  const [now, setNow] = useState(Date.now());
  const node = RESEARCH_NODES[activeResearch.researchId];
  const totalDuration = activeResearch.endTime - activeResearch.startTime;
  const elapsed = now - activeResearch.startTime;
  const progress = Math.min(elapsed / totalDuration, 1);
  const remaining = Math.max(activeResearch.endTime - now, 0);

  useEffect(() => {
    if (remaining <= 0) {
      onComplete();
      return;
    }
    const interval = setInterval(() => {
      const currentTime = Date.now();
      if (currentTime >= activeResearch.endTime) {
        onComplete();
        clearInterval(interval);
      } else {
        setNow(currentTime);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [activeResearch.endTime, remaining, onComplete]);

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm border border-purple-500/60 rounded-lg p-3 shadow-[0_0_12px_rgba(168,85,247,0.2)]">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg animate-pulse">{node.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-purple-300 font-semibold">Researching: {node.name}</p>
          <p className="text-[10px] text-gray-400">{formatTimeRemaining(remaining)}</p>
        </div>
        {progress >= 1 && (
          <span className="text-[10px] text-green-400 font-bold animate-pulse">READY!</span>
        )}
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-100"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}

function ResearchCard({
  node,
  currentLevel,
  researchData,
  isResearching,
  isThisResearching,
  onStart,
}: {
  node: ResearchNode;
  currentLevel: number;
  researchData: number;
  isResearching: boolean;
  isThisResearching: boolean;
  onStart: (id: ResearchId, cost: number) => void;
}) {
  const cost = getResearchCost(node.id, currentLevel);
  const isMaxed = cost === null;
  const canAfford = cost !== null && researchData >= cost;
  const canStart = canAfford && !isResearching;
  const currentBonus = node.bonusPerLevel * currentLevel;
  const duration = getResearchDuration(currentLevel);

  return (
    <div
      className={`rounded-lg border p-3 transition-all ${
        isMaxed
          ? 'bg-purple-900/20 border-purple-600/30'
          : isThisResearching
          ? 'bg-purple-900/30 border-purple-500/60'
          : canAfford
          ? 'bg-gray-900/60 border-purple-500/50 shadow-[0_0_8px_rgba(168,85,247,0.15)]'
          : 'bg-gray-900/60 border-gray-700/40'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className={`text-2xl mt-0.5 ${isThisResearching ? 'animate-pulse' : ''}`}>{node.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-white truncate">{node.name}</h4>
            <span
              className={`text-[10px] font-mono whitespace-nowrap px-1.5 py-0.5 rounded ${
                isMaxed ? 'bg-purple-900/50 text-purple-300' : 'bg-gray-800 text-gray-400'
              }`}
            >
              {currentLevel}/{node.maxLevel}
            </span>
          </div>

          <p className="text-[11px] text-gray-300 mt-0.5">{node.description}</p>

          {/* Current bonus */}
          {currentLevel > 0 && (
            <p className="text-[10px] text-green-400 mt-1">
              Current: +{Math.round(currentBonus * 100)}%
            </p>
          )}

          {/* Level progress bar */}
          <div className="mt-1.5 h-1 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${(currentLevel / node.maxLevel) * 100}%` }}
            />
          </div>

          {/* Flavor text */}
          <p className="text-[10px] text-gray-400 italic mt-1.5 leading-relaxed">
            {node.flavorText}
          </p>

          {/* Purchase button */}
          <div className="mt-2 flex items-center justify-between">
            {isMaxed ? (
              <span className="text-[10px] text-purple-400 font-semibold">MAX LEVEL</span>
            ) : isThisResearching ? (
              <span className="text-[10px] text-purple-300 italic">In progress...</span>
            ) : (
              <>
                <div>
                  <span className="text-[10px] text-gray-400">
                    Cost: <span className={canAfford ? 'text-purple-300' : 'text-red-400'}>{formatNumber(cost)}</span> 🔬
                  </span>
                  <span className="text-[10px] text-gray-500 ml-2">
                    {formatTimeRemaining(duration)}
                  </span>
                </div>
                <button
                  onClick={() => onStart(node.id, cost)}
                  disabled={!canStart}
                  className={`text-[11px] font-bold px-3 py-1 rounded transition-colors ${
                    canStart
                      ? 'bg-purple-600/80 text-white hover:bg-purple-500/80 border border-purple-400/40'
                      : 'bg-gray-800/50 text-gray-600 border border-gray-700/30 cursor-not-allowed'
                  }`}
                >
                  {isResearching && !isThisResearching ? 'Busy' : currentLevel === 0 ? 'Research' : 'Upgrade'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PandaLab() {
  const { state, dispatch } = useGame();
  const researchData = state.contracts.researchData;
  const levels = state.research.levels;
  const activeResearch = state.research.activeResearch;

  const handleStart = useCallback((researchId: ResearchId, cost: number) => {
    const currentLevel = levels[researchId] || 0;
    const duration = getResearchDuration(currentLevel);
    const now = Date.now();
    dispatch({
      type: 'START_RESEARCH',
      payload: { researchId, cost, startTime: now, endTime: now + duration },
    });
  }, [dispatch, levels]);

  const handleComplete = useCallback(() => {
    if (activeResearch) {
      dispatch({ type: 'COMPLETE_RESEARCH', payload: { researchId: activeResearch.researchId } });
    }
  }, [dispatch, activeResearch]);

  // Auto-complete research if we load with an already-finished timer
  useEffect(() => {
    if (activeResearch && Date.now() >= activeResearch.endTime) {
      handleComplete();
    }
  }, [activeResearch, handleComplete]);

  // Group research into categories for display
  const categories = useMemo(() => {
    const nodes = Object.values(RESEARCH_NODES);
    return [
      {
        title: 'Production',
        subtitle: 'Make more, faster',
        nodes: nodes.filter(n => ['production', 'gather', 'spaceship'].includes(n.bonusType)),
      },
      {
        title: 'Economy',
        subtitle: 'Spend less, build more',
        nodes: nodes.filter(n => ['build_cost', 'upgrade_cost'].includes(n.bonusType)),
      },
      {
        title: 'Expeditions',
        subtitle: 'Go further, find more',
        nodes: nodes.filter(n =>
          ['expedition_food', 'expedition_time', 'expedition_resource', 'food_waste'].includes(n.bonusType)
        ),
      },
      {
        title: 'Power',
        subtitle: 'Supercharge your machines',
        nodes: nodes.filter(n => n.bonusType === 'power_cell'),
      },
    ];
  }, []);

  // Summary stats
  const totalResearched = Object.values(levels).reduce((sum, lvl) => sum + (lvl || 0), 0);
  const totalMaxLevels = Object.values(RESEARCH_NODES).reduce((sum, n) => sum + n.maxLevel, 0);

  // Active bonuses
  const activeBonuses = useMemo(() => {
    const bonuses: Array<{ label: string; value: string }> = [];
    const check = (type: ResearchNode['bonusType'], label: string) => {
      const val = getResearchBonus(levels, type);
      if (val > 0) bonuses.push({ label, value: `+${Math.round(val * 100)}%` });
    };
    const checkReduction = (type: ResearchNode['bonusType'], label: string) => {
      const val = getResearchBonus(levels, type);
      if (val > 0) bonuses.push({ label, value: `-${Math.round(val * 100)}%` });
    };

    check('gather', 'Gather yield');
    check('production', 'Production speed');
    checkReduction('build_cost', 'Build costs');
    checkReduction('upgrade_cost', 'Upgrade costs');
    checkReduction('expedition_food', 'Expedition food');
    checkReduction('expedition_time', 'Expedition time');
    check('expedition_resource', 'Expedition rewards');
    checkReduction('food_waste', 'Food waste');
    check('power_cell', 'Power cells');
    check('spaceship', 'Spaceship parts');

    return bonuses;
  }, [levels]);

  return (
    <div className="p-4 pt-0 pb-24 space-y-3">
      {/* Header */}
      <div className="text-center pt-2">
        <h1 className="text-lg font-bold text-white">🔬 Dr. Redd's Lab</h1>
        <p className="text-[11px] text-gray-400 mt-0.5">
          "Science isn't about why. It's about why not." — Dr. Redd
        </p>
      </div>

      {/* Research Data balance + progress */}
      <div className="bg-gray-900/80 backdrop-blur-sm border border-purple-700/40 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-purple-400">🔬</span>
            <div>
              <p className="text-xs text-gray-400">Research Data</p>
              <p className="text-lg font-bold text-purple-300">{formatNumber(researchData)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-500">Research Progress</p>
            <p className="text-xs text-gray-300">
              {totalResearched}/{totalMaxLevels} levels
            </p>
          </div>
        </div>
        <p className="text-[10px] text-gray-500 mt-1.5">
          Earn Research Data from Dr. Redd's Chore List
        </p>
      </div>

      {/* Active research timer */}
      {activeResearch && (
        <ActiveResearchBar
          activeResearch={activeResearch}
          onComplete={handleComplete}
        />
      )}

      {/* Active bonuses summary (if any) */}
      {activeBonuses.length > 0 && (
        <div className="bg-gray-900/60 backdrop-blur-sm border border-green-700/30 rounded-lg p-2.5">
          <p className="text-[10px] text-green-400 font-semibold mb-1.5">Active Research Bonuses</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
            {activeBonuses.map(b => (
              <div key={b.label} className="flex items-center justify-between">
                <span className="text-[10px] text-gray-400 truncate">{b.label}</span>
                <span className="text-[10px] text-green-300 font-mono ml-1">{b.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Research categories */}
      {categories.map(cat => (
        <div key={cat.title} className="space-y-2">
          <div className="flex items-baseline gap-2">
            <h3 className="text-xs font-bold text-white">{cat.title}</h3>
            <span className="text-[10px] text-gray-500">{cat.subtitle}</span>
          </div>
          {cat.nodes.map(node => (
            <ResearchCard
              key={node.id}
              node={node}
              currentLevel={levels[node.id] || 0}
              researchData={researchData}
              isResearching={activeResearch !== null}
              isThisResearching={activeResearch?.researchId === node.id}
              onStart={handleStart}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
