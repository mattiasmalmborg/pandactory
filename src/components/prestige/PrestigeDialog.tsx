import { useGame } from '../../game/state/GameContext';

interface PrestigeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  shardsToEarn: number;
}

export function PrestigeDialog({ isOpen, onClose, onConfirm, shardsToEarn }: PrestigeDialogProps) {
  const { state } = useGame();

  if (!isOpen) return null;

  const currentShards = state.prestige.cosmicBambooShards;
  const totalAfterPrestige = currentShards + shardsToEarn;
  const prestigeNumber = state.prestige.totalPrestiges + 1;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 overflow-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
      <div className="min-h-full flex items-center justify-center p-4 pt-8 pb-24">
      <div className="bg-gradient-to-br from-purple-900 to-pink-900 border-2 border-purple-500 rounded-lg max-w-md w-full p-4 sm:p-6 space-y-3 sm:space-y-4 shadow-2xl">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-purple-200 mb-2">
            ✨ Launch S.S. Bamboozle? ✨
          </h2>
          <p className="text-sm text-gray-300 italic">
            "I've done this before, haven't I?" - Dr. Redd Pawston III
          </p>
        </div>

        {/* Shard Reward */}
        <div className="bg-purple-950/50 border border-purple-600 rounded-lg p-4 space-y-2">
          <div className="text-center">
            <div className="text-3xl mb-2">🎋</div>
            <div className="text-lg font-bold text-yellow-300">
              +{shardsToEarn} Cosmic Bamboo Shard{shardsToEarn !== 1 ? 's' : ''}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {currentShards} → {totalAfterPrestige} total
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-orange-900/30 border border-orange-600 rounded p-3">
          <div className="font-semibold text-orange-300 text-sm mb-2">
            🚀 This will reset your progress:
          </div>
          <ul className="text-xs text-gray-300 space-y-1 ml-4">
            <li>• All resources cleared</li>
            <li>• All automations removed</li>
            <li>• Biomes reset (except Lush Forest)</li>
            <li>• Power Cells removed</li>
            <li>• Food cleared</li>
          </ul>
        </div>

        {/* What Persists */}
        <div className="bg-green-900/30 border border-green-600 rounded p-3">
          <div className="font-semibold text-green-300 text-sm mb-2">
            ✅ You keep:
          </div>
          <ul className="text-xs text-gray-300 space-y-1 ml-4">
            <li>• Cosmic Bamboo Shards ({totalAfterPrestige} total)</li>
            <li>• Unlocked Skills ({state.prestige.unlockedSkills.length})</li>
            <li>• Prestige bonuses</li>
          </ul>
        </div>

        {/* First Prestige Hint */}
        {state.prestige.totalPrestiges === 0 && (
          <div className="bg-cyan-900/30 border border-cyan-600 rounded p-3 text-center">
            <p className="text-xs text-cyan-300">
              💡 <strong>Tip:</strong> Use Cosmic Bamboo Shards in the Skill Tree to unlock permanent bonuses that make future runs faster!
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-3 px-4 rounded-lg font-semibold transition-colors shadow-lg"
          >
            Launch! 🚀
          </button>
        </div>

        {/* Crash Counter */}
        <div className="text-center text-xs text-gray-400 pt-2 border-t border-purple-700">
          This will be crash #{prestigeNumber}
        </div>
      </div>
      </div>
    </div>
  );
}
