interface LabOnboardingModalProps {
  veteranBonus?: { amount: number; reason: string };
  onClose: () => void;
}

export function LabOnboardingModal({ veteranBonus, onClose }: LabOnboardingModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 overflow-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
      <div className="min-h-full flex items-center justify-center p-4 pt-8 pb-24">
        <div className="bg-gray-900 border-2 border-purple-500 rounded-xl shadow-2xl max-w-md w-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="text-4xl">🔬</div>
              <div>
                <h2 className="text-xl font-bold text-purple-200">Dr. Redd's Lab is Open!</h2>
                <p className="text-sm text-purple-300 italic">
                  "Finally, a place to do REAL science!" — Dr. Redd
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Veteran bonus */}
            {veteranBonus && (
              <div className="bg-purple-900/30 border border-purple-500/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">🎁</span>
                  <p className="text-purple-300 font-semibold text-sm">Welcome Back Bonus!</p>
                </div>
                <p className="text-gray-300 text-xs">
                  +{veteranBonus.amount} Research Data based on your progress: {veteranBonus.reason}
                </p>
              </div>
            )}

            {/* Research Lab */}
            <div className="bg-gray-800/50 rounded-lg p-3 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚗️</span>
                <h3 className="text-white font-semibold text-sm">Research Lab</h3>
              </div>
              <p className="text-gray-300 text-xs">
                Spend <span className="text-purple-400 font-semibold">Research Data</span> to unlock permanent upgrades — faster gathering, cheaper builds, better expeditions, and more.
              </p>
              <p className="text-[10px] text-gray-500 italic">
                Research progress persists through crashes!
              </p>
            </div>

            {/* Chores */}
            <div className="bg-gray-800/50 rounded-lg p-3 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-lg">📋</span>
                <h3 className="text-white font-semibold text-sm">Daily & Weekly Chores</h3>
              </div>
              <p className="text-gray-300 text-xs">
                Complete chores to earn Research Data. New daily chores every day, weekly chores every Monday.
              </p>
              <p className="text-[10px] text-gray-500 italic">
                Check the Home screen to see your active chores!
              </p>
            </div>

            {/* Artifacts */}
            <div className="bg-gray-800/50 rounded-lg p-3 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-lg">🏺</span>
                <h3 className="text-white font-semibold text-sm">Artifacts & Loadout</h3>
              </div>
              <p className="text-gray-300 text-xs">
                Find artifacts on expeditions! Analyze them in the lab, then equip up to 3 for passive bonuses. Collect full sets for extra power.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={onClose}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
            >
              Let's Get Researching!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
