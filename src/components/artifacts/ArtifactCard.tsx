import { Artifact } from '../../types/game.types';
import { ARTIFACT_TEMPLATES, RARITY_COLORS } from '../../game/config/artifacts';
import { formatNumber } from '../../utils/formatters';

interface ArtifactCardProps {
  artifact: Artifact;
  onEquip?: () => void;
  onUnequip?: () => void;
  onAnalyze?: () => void;
  onScrap?: () => void;
  analysisActive?: boolean;
  canAffordAnalysis?: boolean;
  loadoutFull?: boolean;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const minutes = Math.floor(totalSeconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainMins = minutes % 60;
  return remainMins > 0 ? `${hours}h ${remainMins}m` : `${hours}h`;
}

export function ArtifactCard({
  artifact,
  onEquip,
  onUnequip,
  onAnalyze,
  onScrap,
  analysisActive,
  canAffordAnalysis,
  loadoutFull,
}: ArtifactCardProps) {
  const template = ARTIFACT_TEMPLATES[artifact.templateId];
  const rarity = RARITY_COLORS[template.rarity];
  const isAnalyzed = artifact.status === 'analyzed';
  const isAnalyzing = artifact.status === 'analyzing';

  return (
    <div
      className={`rounded-lg border p-3 transition-all ${rarity.bg} ${rarity.border} ${rarity.glow} ${
        artifact.equipped ? 'ring-1 ring-amber-400/50' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <span className={`text-2xl mt-0.5 ${isAnalyzing ? 'animate-pulse' : ''}`}>
          {isAnalyzed ? template.icon : '🏺'}
        </span>
        <div className="flex-1 min-w-0">
          {/* Title + rarity */}
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-white truncate">
              {isAnalyzed ? template.name : 'Unanalyzed Artifact'}
            </h4>
            <span className={`text-[9px] font-bold uppercase tracking-wider ${rarity.text}`}>
              {template.rarity}
            </span>
          </div>

          {/* Info */}
          {isAnalyzed ? (
            <>
              <p className="text-[11px] text-green-400 mt-0.5">{template.description}</p>
              <p className="text-[10px] text-gray-400 italic mt-1">{template.flavorText}</p>
            </>
          ) : isAnalyzing ? (
            <p className="text-[11px] text-purple-300 mt-0.5 italic">Analysis in progress...</p>
          ) : (
            <>
              <p className="text-[11px] text-gray-400 mt-0.5">
                From: {template.originBiome.replace(/_/g, ' ')}
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">
                Analysis: {formatNumber(template.analysisCost)} 🔬 · ⏱ {formatDuration(template.analysisDurationMs)}
              </p>
            </>
          )}

          {/* Actions */}
          <div className="mt-2 flex items-center gap-2">
            {isAnalyzed && !artifact.equipped && onEquip && (
              <button
                onClick={onEquip}
                disabled={loadoutFull}
                className={`text-[10px] font-bold px-2.5 py-1 rounded transition-colors ${
                  loadoutFull
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-amber-600/80 text-white hover:bg-amber-500/80 border border-amber-400/40'
                }`}
              >
                {loadoutFull ? 'Full' : 'Equip'}
              </button>
            )}
            {isAnalyzed && artifact.equipped && onUnequip && (
              <button
                onClick={onUnequip}
                className="text-[10px] font-bold px-2.5 py-1 rounded bg-gray-700/80 text-gray-300 hover:bg-gray-600/80 border border-gray-500/40 transition-colors"
              >
                Unequip
              </button>
            )}
            {!isAnalyzed && !isAnalyzing && onAnalyze && (
              <button
                onClick={onAnalyze}
                disabled={analysisActive || !canAffordAnalysis}
                className={`text-[10px] font-bold px-2.5 py-1 rounded transition-colors ${
                  analysisActive || !canAffordAnalysis
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-purple-600/80 text-white hover:bg-purple-500/80 border border-purple-400/40'
                }`}
              >
                {analysisActive ? 'Station Busy' : !canAffordAnalysis ? `Need ${formatNumber(template.analysisCost)} 🔬` : 'Analyze'}
              </button>
            )}
            {analysisActive && !isAnalyzing && onAnalyze && (
              <p className="text-[10px] text-gray-500">Wait for current task to finish</p>
            )}
            {!isAnalyzing && onScrap && (
              <button
                onClick={onScrap}
                className="text-[10px] px-2 py-1 rounded text-gray-500 hover:text-red-400 hover:bg-red-900/20 transition-colors"
              >
                Scrap
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
