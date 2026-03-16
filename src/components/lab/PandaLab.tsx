import { useMemo, useState, useEffect, useCallback } from 'react';
import { useGame } from '../../game/state/GameContext';
import { RESEARCH_NODES, getResearchCost, getResearchDuration } from '../../game/config/research';
import { ARTIFACT_TEMPLATES, getEquippedCount, getEffectiveLoadoutSlots, hasArtifactEffect, getActiveSetBonuses } from '../../game/config/artifacts';
import { ResearchId, ResearchNode, ActiveResearch } from '../../types/game.types';
import { formatNumber } from '../../utils/formatters';
import { ArtifactCard } from '../artifacts/ArtifactCard';
import { ArtifactLoadout } from '../artifacts/ArtifactLoadout';
import { BackgroundWrapper } from '../layout/BackgroundWrapper';
import { getBiomeBackgroundPath, getFallbackGradient } from '../../config/assets';

type LabTab = 'research' | 'artifacts';

function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return 'Done!';
  const totalSeconds = Math.ceil(ms / 1000);
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes < 60) return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  const hours = Math.floor(minutes / 60);
  const remainMins = minutes % 60;
  return remainMins > 0 ? `${hours}h ${remainMins}m` : `${hours}h`;
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

// === Research Station ===

function ResearchStation({
  label,
  activeResearch,
  activeAnalysis,
  progress,
  remaining,
  currentResearchLevel,
}: {
  label: string;
  activeResearch: ActiveResearch | null;
  activeAnalysis: { artifactInstanceId: string; templateId: string } | null;
  progress: number;
  remaining: number;
  currentResearchLevel?: number;
}) {
  const isActive = activeResearch || activeAnalysis;

  if (!isActive) {
    return (
      <div className="bg-gray-800/90 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 flex items-center gap-3">
        <span className="text-lg text-gray-600">🔬</span>
        <div className="flex-1">
          <p className="text-[10px] text-gray-500 font-semibold">{label}</p>
          <p className="text-[10px] text-gray-600 italic">Idle — select a research or artifact to analyze</p>
        </div>
      </div>
    );
  }

  const isResearch = !!activeResearch;
  const node = isResearch ? RESEARCH_NODES[activeResearch!.researchId] : null;
  const levelInfo = isResearch && currentResearchLevel !== undefined ? `Lvl ${currentResearchLevel} → ${currentResearchLevel + 1}` : '';

  return (
    <div className={`rounded-lg p-4 backdrop-blur-sm ${
      isResearch
        ? 'bg-gray-800/90 border border-purple-500/40'
        : 'bg-gray-800/90 border border-amber-500/40'
    }`}>
      <div className="flex items-center gap-3">
        <span className="text-lg animate-pulse">{isResearch ? node!.icon : '🏺'}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-gray-500 font-semibold">{label}</p>
            {isResearch && levelInfo && (
              <span className="text-[10px] text-purple-400 font-semibold">{levelInfo}</span>
            )}
          </div>
          <p className={`text-[11px] font-semibold truncate ${isResearch ? 'text-purple-300' : 'text-amber-300'}`}>
            {isResearch ? node!.name : 'Analyzing artifact...'}
          </p>
          <div className="flex items-center justify-between mt-1">
            <div className="flex-1 mr-2">
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-100 ${
                    isResearch
                      ? 'bg-gradient-to-r from-purple-600 to-purple-400'
                      : 'bg-gradient-to-r from-amber-600 to-amber-400'
                  }`}
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>
            <span className="text-[10px] text-gray-400 whitespace-nowrap">{formatTimeRemaining(remaining)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// === Research Card ===

function ResearchCard({
  node,
  currentLevel,
  researchData,
  stationBusy,
  activeResearch,
  timerProgress,
  timerRemaining,
  onStart,
}: {
  node: ResearchNode;
  currentLevel: number;
  researchData: number;
  stationBusy: boolean;
  activeResearch: ActiveResearch | null;
  timerProgress: number;
  timerRemaining: number;
  onStart: (id: ResearchId, cost: number) => void;
}) {
  const isThisResearching = activeResearch?.researchId === node.id;
  const cost = getResearchCost(node.id, currentLevel);
  const isMaxed = cost === null;
  const canAfford = cost !== null && researchData >= cost;
  const canStart = canAfford && !stationBusy;
  const currentBonus = node.bonusPerLevel * currentLevel;
  const duration = getResearchDuration(currentLevel);

  return (
    <div
      className={`bg-gray-800/90 backdrop-blur-sm rounded-lg border p-4 transition-all ${
        isMaxed
          ? 'border-purple-600/30'
          : isThisResearching
          ? 'border-purple-500/60 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
          : canAfford
          ? 'border-purple-500/50 shadow-[0_0_8px_rgba(168,85,247,0.15)]'
          : 'border-gray-700/50'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className={`text-2xl mt-0.5 ${isThisResearching ? 'animate-pulse' : ''}`}>{node.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-white truncate">{node.name}</h4>
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

          <p className="text-xs text-gray-300 mt-0.5">{node.description}</p>
          <p className="text-xs text-gray-400 italic mt-1">{node.flavorText}</p>

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
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {stationBusy ? 'Busy' : currentLevel === 0 ? 'Research' : 'Upgrade'}
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

// === Main Lab Component ===

export function PandaLab() {
  const { state, dispatch } = useGame();
  const researchData = state.contracts.researchData;
  const levels = state.research.levels;
  const activeResearch = state.research.activeResearch;
  const activeAnalysis = state.artifacts?.activeAnalysis || null;
  const inventory = useMemo(() => state.artifacts?.inventory || [], [state.artifacts?.inventory]);

  const [labTab, setLabTab] = useState<LabTab>('research');

  // Check for Crystal Resonator (second station)
  const hasSecondStation = hasArtifactEffect(inventory, 'crystal_clarity');

  // Determine station availability
  // Station 1 is for research, Station 2 (if unlocked) is for analysis
  // If only 1 station, it handles both sequentially
  const station1Busy = activeResearch !== null;
  const station2Busy = activeAnalysis !== null;
  const researchStationAvailable = !station1Busy;
  const analysisStationAvailable = hasSecondStation ? !station2Busy : !station1Busy && !station2Busy;

  // Unanalyzed count for badge
  const unanalyzedCount = inventory.filter(a => a.status === 'unanalyzed').length;

  // --- Research timer ---
  const handleResearchComplete = useCallback(() => {
    if (activeResearch) {
      dispatch({ type: 'COMPLETE_RESEARCH', payload: { researchId: activeResearch.researchId } });
    }
  }, [dispatch, activeResearch]);

  const handleResearchStart = useCallback((researchId: ResearchId, cost: number) => {
    // Check deep focus artifact: -3 Research Data per level (min 1)
    const hasDeepFocus = hasArtifactEffect(inventory, 'deep_focus');
    const adjustedCost = hasDeepFocus ? Math.max(1, cost - 3) : cost;

    const currentLevel = levels[researchId] || 0;
    const duration = getResearchDuration(currentLevel);
    const now = Date.now();
    dispatch({
      type: 'START_RESEARCH',
      payload: { researchId, cost: adjustedCost, startTime: now, endTime: now + duration },
    });
  }, [dispatch, levels, inventory]);

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

  // --- Artifact handlers ---
  const handleStartAnalysis = useCallback((instanceId: string) => {
    if (!analysisStationAvailable) return;
    const artifact = inventory.find(a => a.instanceId === instanceId);
    if (!artifact) return;
    const template = ARTIFACT_TEMPLATES[artifact.templateId];
    if (researchData < template.analysisCost) return;

    // Flash Freeze: halve analysis time
    // Tundra set 2/3: instant analysis
    const setBonuses = getActiveSetBonuses(inventory);
    const tundraSetLevel = setBonuses.get('frozen_tundra') || 0;
    let duration = template.analysisDurationMs;
    if (tundraSetLevel >= 2) {
      duration = 1000; // Instant (1 second for UI feedback)
    } else if (hasArtifactEffect(inventory, 'flash_freeze')) {
      duration = Math.floor(duration / 2);
    }

    const now = Date.now();
    dispatch({
      type: 'START_ANALYSIS',
      payload: {
        artifactInstanceId: instanceId,
        templateId: artifact.templateId,
        cost: template.analysisCost,
        startTime: now,
        endTime: now + duration,
      },
    });
  }, [dispatch, inventory, analysisStationAvailable, researchData]);

  const loadoutSlots = getEffectiveLoadoutSlots(inventory);
  const equippedCount = getEquippedCount(inventory);

  return (
    <BackgroundWrapper
      backgroundPath={getBiomeBackgroundPath('research_lab')}
      fallbackGradient={getFallbackGradient('research_lab')}
      overlayOpacity={50}
    >
    <div className="p-4 pt-0 pb-24 space-y-3">
      {/* Header */}
      <div className="text-center pt-2">
        <h1 className="text-lg font-bold text-white">🔬 Dr. Redd's Lab</h1>
        <p className="text-[11px] text-gray-400 mt-0.5">
          "Science isn't about why. It's about why not." — Dr. Redd
        </p>
      </div>

      {/* Research Data + Progress */}
      <div className="bg-gray-800/90 backdrop-blur-sm border border-purple-700/40 rounded-lg p-4">
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
      </div>

      {/* Research Stations */}
      <div className="space-y-2">
        <ResearchStation
          label="Research Station 1"
          activeResearch={activeResearch}
          activeAnalysis={!hasSecondStation ? activeAnalysis : null}
          progress={activeResearch ? researchProgress : (!hasSecondStation && activeAnalysis ? analysisProgress : 0)}
          remaining={activeResearch ? researchRemaining : (!hasSecondStation && activeAnalysis ? analysisRemaining : 0)}
          currentResearchLevel={activeResearch ? (levels[activeResearch.researchId] || 0) : undefined}
        />

        {hasSecondStation ? (
          <ResearchStation
                        label="Research Station 2"
            activeResearch={null}
            activeAnalysis={activeAnalysis}
            progress={activeAnalysis ? analysisProgress : 0}
            remaining={activeAnalysis ? analysisRemaining : 0}
          />
        ) : (
          <div className="bg-gray-800/60 backdrop-blur-sm border border-dashed border-gray-700/50 rounded-lg p-4 flex items-center gap-3">
            <span className="text-lg text-gray-700">🔒</span>
            <div>
              <p className="text-[10px] text-gray-600 font-semibold">Research Station 2</p>
              <p className="text-[10px] text-gray-700 italic">Equip Crystal Resonator to unlock</p>
            </div>
          </div>
        )}
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-gray-800/90 backdrop-blur-sm rounded-lg p-1">
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
                  stationBusy={!researchStationAvailable}
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
                      analysisActive={!analysisStationAvailable}
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
    </BackgroundWrapper>
  );
}
