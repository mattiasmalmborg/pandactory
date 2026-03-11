import { useMemo, useState, useEffect, useCallback } from 'react';
import { useGame } from '../../game/state/GameContext';
import { RESEARCH_NODES, getResearchCost, getResearchBonus, getResearchDuration } from '../../game/config/research';
import { ARTIFACT_TEMPLATES, getEquippedCount } from '../../game/config/artifacts';
import { ResearchId, ResearchNode, ActiveResearch } from '../../types/game.types';
import { formatNumber } from '../../utils/formatters';
import { ArtifactCard } from '../artifacts/ArtifactCard';
import { ArtifactLoadout } from '../artifacts/ArtifactLoadout';

type LabTab = 'research' | 'artifacts';

function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return 'Done!';
  const totalSeconds = Math.ceil(ms / 1000);
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
}

function useTimer(
  active: { startTime: number; endTime: number } | null,
  onComplete: () => void,
) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!active) return;
    const remaining = active.endTime - Date.now();
    if (remaining <= 0) {
      onComplete();
      return;
    }
    const interval = setInterval(() => {
      const currentTime = Date.now();
      if (currentTime >= active.endTime) {
        onComplete();
        clearInterval(interval);
      } else {
        setNow(currentTime);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [active, onComplete]);

  if (!active) return { progress: 0, remaining: 0 };
  const totalDuration = active.endTime - active.startTime;
  const elapsed = now - active.startTime;
  return {
    progress: Math.min(elapsed / totalDuration, 1),
    remaining: Math.max(active.endTime - now, 0),
  };
}

// === Research Card ===

function ResearchCard({
  node,
  currentLevel,
  researchData,
  isResearching,
  activeResearch,
  timerProgress,
  timerRemaining,
  onStart,
}: {
  node: ResearchNode;
  currentLevel: number;
  researchData: number;
  isResearching: boolean;
  activeResearch: ActiveResearch | null;
  timerProgress: number;
  timerRemaining: number;
  onStart: (id: ResearchId, cost: number) => void;
}) {
  const isThisResearching = activeResearch?.researchId === node.id;
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
          ? 'bg-purple-900/30 border-purple-500/60 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
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
            <div className="flex items-center gap-1.5">
              {currentLevel > 0 && (
                <span className="text-[10px] text-green-400 font-semibold whitespace-nowrap">
                  +{Math.round(currentBonus * 100)}%
                </span>
              )}
              <span
                className={`text-[10px] font-bold whitespace-nowrap px-1.5 py-0.5 rounded ${
                  isMaxed
                    ? 'bg-purple-600/40 text-purple-200'
                    : currentLevel > 0
                    ? 'bg-purple-900/60 text-purple-300 border border-purple-500/30'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                {currentLevel}/{node.maxLevel}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-gray-300 mt-0.5">{node.description}</p>
          <p className="text-[10px] text-gray-400 italic mt-1 leading-relaxed">{node.flavorText}</p>

          {isThisResearching && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-purple-300 font-semibold">Researching...</span>
                <span className="text-[10px] text-gray-400">{formatTimeRemaining(timerRemaining)}</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-100"
                  style={{ width: `${timerProgress * 100}%` }}
                />
              </div>
            </div>
          )}

          {!isThisResearching && (
            <div className="mt-2 flex items-center justify-between">
              {isMaxed ? (
                <span className="text-[10px] text-purple-400 font-semibold">✓ MAX LEVEL</span>
              ) : (
                <>
                  <div>
                    <span className="text-[10px] text-gray-400">
                      <span className={canAfford ? 'text-purple-300' : 'text-red-400'}>{formatNumber(cost)}</span> 🔬
                    </span>
                    <span className="text-[10px] text-gray-500 ml-2">
                      ⏱ {formatTimeRemaining(duration)}
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
                    {isResearching ? 'Busy' : currentLevel === 0 ? 'Research' : 'Upgrade'}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// === Analysis Timer Bar (inline on artifact card is handled by ArtifactCard, but we need a global bar) ===

function AnalysisProgressBar({
  progress,
  remaining,
}: {
  progress: number;
  remaining: number;
}) {
  return (
    <div className="bg-gray-900/80 backdrop-blur-sm border border-amber-500/40 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-lg animate-pulse">🏺</span>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-amber-300 font-semibold">Analyzing artifact...</p>
          <p className="text-[10px] text-gray-400">{formatTimeRemaining(remaining)}</p>
        </div>
        {progress >= 1 && (
          <span className="text-[10px] text-green-400 font-bold animate-pulse">READY!</span>
        )}
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-100"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}

// === Main Lab Component ===

export function PandaLab() {
  const { state, dispatch } = useGame();
  const researchData = state.contracts.researchData;
  const levels = state.research.levels;
  const activeResearch = state.research.activeResearch;
  const activeAnalysis = state.artifacts?.activeAnalysis || null;
  const inventory = state.artifacts?.inventory || [];
  const loadoutSlots = state.artifacts?.loadoutSlots || 3;

  const [labTab, setLabTab] = useState<LabTab>('research');

  // Unanalyzed count for badge
  const unanalyzedCount = inventory.filter(a => a.status === 'unanalyzed').length;

  // --- Research timer ---
  const handleResearchComplete = useCallback(() => {
    if (activeResearch) {
      dispatch({ type: 'COMPLETE_RESEARCH', payload: { researchId: activeResearch.researchId } });
    }
  }, [dispatch, activeResearch]);

  const handleResearchStart = useCallback((researchId: ResearchId, cost: number) => {
    const currentLevel = levels[researchId] || 0;
    const duration = getResearchDuration(currentLevel);
    const now = Date.now();
    dispatch({
      type: 'START_RESEARCH',
      payload: { researchId, cost, startTime: now, endTime: now + duration },
    });
  }, [dispatch, levels]);

  const { progress: researchProgress, remaining: researchRemaining } = useTimer(activeResearch, handleResearchComplete);

  useEffect(() => {
    if (activeResearch && Date.now() >= activeResearch.endTime) {
      handleResearchComplete();
    }
  }, [activeResearch, handleResearchComplete]);

  // --- Analysis timer ---
  const handleAnalysisComplete = useCallback(() => {
    if (activeAnalysis) {
      dispatch({ type: 'COMPLETE_ANALYSIS', payload: { artifactInstanceId: activeAnalysis.artifactInstanceId } });
    }
  }, [dispatch, activeAnalysis]);

  const { progress: analysisProgress, remaining: analysisRemaining } = useTimer(activeAnalysis, handleAnalysisComplete);

  useEffect(() => {
    if (activeAnalysis && Date.now() >= activeAnalysis.endTime) {
      handleAnalysisComplete();
    }
  }, [activeAnalysis, handleAnalysisComplete]);

  // --- Research categories ---
  const categories = useMemo(() => {
    const nodes = Object.values(RESEARCH_NODES);
    return [
      { title: 'Production', subtitle: 'Make more, faster', nodes: nodes.filter(n => ['production', 'gather', 'spaceship'].includes(n.bonusType)) },
      { title: 'Economy', subtitle: 'Spend less, build more', nodes: nodes.filter(n => ['build_cost', 'upgrade_cost'].includes(n.bonusType)) },
      { title: 'Expeditions', subtitle: 'Go further, find more', nodes: nodes.filter(n => ['expedition_food', 'expedition_time', 'expedition_resource', 'food_waste'].includes(n.bonusType)) },
      { title: 'Power', subtitle: 'Supercharge your machines', nodes: nodes.filter(n => n.bonusType === 'power_cell') },
    ];
  }, []);

  const totalResearched = Object.values(levels).reduce((sum, lvl) => sum + (lvl || 0), 0);
  const totalMaxLevels = Object.values(RESEARCH_NODES).reduce((sum, n) => sum + n.maxLevel, 0);

  // Research bonuses
  const researchBonuses = useMemo(() => {
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

  // --- Artifact handlers ---
  const handleStartAnalysis = useCallback((instanceId: string) => {
    const artifact = inventory.find(a => a.instanceId === instanceId);
    if (!artifact || activeAnalysis) return;
    const template = ARTIFACT_TEMPLATES[artifact.templateId];
    if (researchData < template.analysisCost) return;
    const now = Date.now();
    dispatch({
      type: 'START_ANALYSIS',
      payload: {
        artifactInstanceId: instanceId,
        templateId: artifact.templateId,
        cost: template.analysisCost,
        startTime: now,
        endTime: now + template.analysisDurationMs,
      },
    });
  }, [dispatch, inventory, activeAnalysis, researchData]);

  const equippedCount = getEquippedCount(inventory);

  return (
    <div className="p-4 pt-0 pb-24 space-y-3">
      {/* Header */}
      <div className="text-center pt-2">
        <h1 className="text-lg font-bold text-white">🔬 Dr. Redd's Lab</h1>
        <p className="text-[11px] text-gray-400 mt-0.5">
          "Science isn't about why. It's about why not." — Dr. Redd
        </p>
      </div>

      {/* Combined: Research Data + Progress + Research Bonuses */}
      <div className="bg-gray-900/80 backdrop-blur-sm border border-purple-700/40 rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-purple-400">🔬</span>
            <div>
              <p className="text-[10px] text-gray-500">Research Data</p>
              <p className="text-lg font-bold text-purple-300">{formatNumber(researchData)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-500">Progress</p>
            <p className="text-sm font-bold text-gray-300">
              {totalResearched}<span className="text-gray-500 font-normal">/{totalMaxLevels}</span>
            </p>
          </div>
        </div>

        {researchBonuses.length > 0 && (
          <div className="border-t border-gray-700/40 pt-2">
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
              {researchBonuses.map(b => (
                <div key={b.label} className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 truncate">{b.label}</span>
                  <span className="text-[10px] text-green-400 font-mono ml-1">{b.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-gray-900/60 rounded-lg p-1">
        <button
          onClick={() => setLabTab('research')}
          className={`flex-1 text-xs font-semibold py-2 rounded-md transition-colors ${
            labTab === 'research'
              ? 'bg-purple-600/60 text-purple-200'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Research
        </button>
        <button
          onClick={() => setLabTab('artifacts')}
          className={`flex-1 text-xs font-semibold py-2 rounded-md transition-colors relative ${
            labTab === 'artifacts'
              ? 'bg-amber-600/60 text-amber-200'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Artifacts
          {unanalyzedCount > 0 && labTab !== 'artifacts' && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-[9px] text-white font-bold rounded-full flex items-center justify-center">
              {unanalyzedCount}
            </span>
          )}
        </button>
      </div>

      {/* Research tab */}
      {labTab === 'research' && (
        <>
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
                  activeResearch={activeResearch}
                  timerProgress={researchProgress}
                  timerRemaining={researchRemaining}
                  onStart={handleResearchStart}
                />
              ))}
            </div>
          ))}
        </>
      )}

      {/* Artifacts tab */}
      {labTab === 'artifacts' && (
        <div className="space-y-3">
          {/* Loadout */}
          <ArtifactLoadout />

          {/* Analysis progress */}
          {activeAnalysis && (
            <AnalysisProgressBar
              progress={analysisProgress}
              remaining={analysisRemaining}
            />
          )}

          {/* Inventory */}
          {inventory.length === 0 ? (
            <div className="bg-gray-900/60 border border-gray-700/30 rounded-lg p-6 text-center">
              <p className="text-3xl mb-2">🏺</p>
              <p className="text-sm text-gray-400">No artifacts yet</p>
              <p className="text-[10px] text-gray-500 mt-1">
                Complete expeditions to find artifacts!
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-baseline justify-between">
                <h3 className="text-xs font-bold text-white">Inventory</h3>
                <span className="text-[10px] text-gray-500">{inventory.length} artifacts</span>
              </div>
              <div className="space-y-2">
                {/* Show equipped first, then analyzed, then unanalyzed */}
                {[...inventory]
                  .sort((a, b) => {
                    if (a.equipped !== b.equipped) return a.equipped ? -1 : 1;
                    if (a.status !== b.status) {
                      const order = { analyzing: 0, unanalyzed: 1, analyzed: 2 };
                      return order[a.status] - order[b.status];
                    }
                    return b.foundAt - a.foundAt;
                  })
                  .map(artifact => (
                    <ArtifactCard
                      key={artifact.instanceId}
                      artifact={artifact}
                      analysisActive={activeAnalysis !== null}
                      canAffordAnalysis={researchData >= ARTIFACT_TEMPLATES[artifact.templateId].analysisCost}
                      loadoutFull={equippedCount >= loadoutSlots}
                      onAnalyze={() => handleStartAnalysis(artifact.instanceId)}
                      onEquip={() => dispatch({ type: 'EQUIP_ARTIFACT', payload: { artifactInstanceId: artifact.instanceId } })}
                      onUnequip={() => dispatch({ type: 'UNEQUIP_ARTIFACT', payload: { artifactInstanceId: artifact.instanceId } })}
                      onScrap={() => dispatch({ type: 'SCRAP_ARTIFACT', payload: { artifactInstanceId: artifact.instanceId } })}
                    />
                  ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
