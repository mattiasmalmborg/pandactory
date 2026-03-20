import { useState, useMemo, memo } from 'react';
import { useGame } from '../../game/state/GameContext';
import { Contract, ContractPeriod } from '../../types/game.types';
import { formatNumber } from '../../utils/formatters';

const ChoreCard = memo(function ChoreCard({ contract, onClaim }: { contract: Contract; onClaim: () => void }) {
  const percent = Math.min(100, Math.round((contract.progress / contract.target) * 100));

  return (
    <div className={`rounded-lg border p-3 transition-all ${
      contract.claimed
        ? 'bg-gray-900/40 border-gray-700/30 opacity-60'
        : contract.completed
        ? 'bg-green-900/30 border-green-600/50 shadow-[0_0_8px_rgba(34,197,94,0.15)]'
        : 'bg-gray-900/60 border-gray-700/40'
    }`}>
      <div className="flex items-start gap-2.5">
        <span className="text-lg mt-0.5">{contract.icon}</span>
        <div className="flex-1 min-w-0">
          <p className={`text-xs leading-relaxed ${
            contract.claimed ? 'text-gray-500 line-through' : 'text-gray-200'
          }`}>
            {(() => {
              // Split description into task + flavor at first ". " boundary
              const dotIdx = contract.description.indexOf('. ');
              if (dotIdx === -1) return contract.description;
              const task = contract.description.slice(0, dotIdx + 1);
              const flavor = contract.description.slice(dotIdx + 2);
              return <>{task} <span className="italic text-gray-400">{flavor}</span></>;
            })()}
          </p>

          {/* Progress bar */}
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  contract.completed ? 'bg-green-500' : 'bg-amber-500/70'
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className={`text-[10px] font-mono whitespace-nowrap ${
              contract.completed ? 'text-green-400' : 'text-gray-400'
            }`}>
              {formatNumber(contract.progress)}/{formatNumber(contract.target)}
            </span>
          </div>

          {/* Reward line */}
          <div className="mt-1 flex items-center justify-between">
            <span className="text-[10px] text-purple-400">
              +{contract.researchDataReward} Research Data
            </span>

            {contract.completed && !contract.claimed && (
              <button
                onClick={onClaim}
                className="text-[10px] font-bold text-green-400 bg-green-900/40 border border-green-600/40 rounded px-2 py-0.5 hover:bg-green-800/50 transition-colors"
              >
                Claim!
              </button>
            )}
            {contract.claimed && (
              <span className="text-[10px] text-gray-500">Claimed</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

function getTimeUntilReset(period: ContractPeriod): string {
  const now = new Date();

  if (period === 'daily') {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  }

  // Weekly: next Monday
  const day = now.getDay();
  const daysUntilMonday = day === 0 ? 1 : 8 - day;
  const nextMonday = new Date(now);
  nextMonday.setDate(nextMonday.getDate() + daysUntilMonday);
  nextMonday.setHours(0, 0, 0, 0);
  const diff = nextMonday.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return `${days}d ${hours}h`;
}

export function ChoresList() {
  const { state, dispatch } = useGame();
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily');
  const [collapsed, setCollapsed] = useState(false);

  const contracts = state.contracts;
  if (!contracts) return null;

  const daily = contracts.daily || [];
  const weekly = contracts.weekly || [];
  const activeContracts = activeTab === 'daily' ? daily : weekly;

  const { dailyCompleted, weeklyCompleted, totalUnclaimed } = useMemo(() => {
    let dCompleted = 0, wCompleted = 0, dUnclaimed = 0, wUnclaimed = 0;
    for (const c of daily) {
      if (c.completed) { dCompleted++; if (!c.claimed) dUnclaimed++; }
    }
    for (const c of weekly) {
      if (c.completed) { wCompleted++; if (!c.claimed) wUnclaimed++; }
    }
    return { dailyCompleted: dCompleted, weeklyCompleted: wCompleted, totalUnclaimed: dUnclaimed + wUnclaimed };
  }, [daily, weekly]);

  const handleClaim = (contractId: string, period: ContractPeriod) => {
    dispatch({ type: 'CLAIM_CONTRACT', payload: { contractId, period } });
  };

  return (
    <div className="bg-gray-800/90 backdrop-blur-sm border border-gray-700/50 rounded-lg overflow-hidden">
      {/* Header — always visible, clickable to toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full px-3 pt-3 pb-2 text-left hover:bg-gray-800/30 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">📋</span>
            <h3 className="text-sm font-bold text-white">Dr. Redd's Chore List</h3>
            {totalUnclaimed > 0 && (
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="text-purple-400 text-[10px]">🔬</span>
              <span className="text-xs font-bold text-purple-300">{formatNumber(contracts.researchData)}</span>
            </div>
            <span className={`text-gray-500 text-xs transition-transform ${collapsed ? '' : 'rotate-180'}`}>▾</span>
          </div>
        </div>
        {collapsed && (
          <p className="text-[10px] text-gray-400 mt-0.5">
            {dailyCompleted}/{daily.length} daily · {weeklyCompleted}/{weekly.length} weekly
          </p>
        )}
        {!collapsed && (
          <p className="text-[10px] text-gray-400 mt-0.5 italic">
            "Someone has to do it. That someone is you." — Dr. Redd
          </p>
        )}
      </button>

      {/* Collapsible content */}
      {!collapsed && (
        <>
          {/* Tabs */}
          <div className="flex gap-1 bg-gray-800/90 backdrop-blur-sm rounded-lg p-1 mx-3 mt-1">
            <button
              onClick={() => setActiveTab('daily')}
              className={`flex-1 text-xs font-semibold py-2 rounded-md transition-colors ${
                activeTab === 'daily'
                  ? 'bg-amber-600/60 text-amber-200'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Daily ({dailyCompleted}/{daily.length})
            </button>
            <button
              onClick={() => setActiveTab('weekly')}
              className={`flex-1 text-xs font-semibold py-2 rounded-md transition-colors ${
                activeTab === 'weekly'
                  ? 'bg-blue-600/60 text-blue-200'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Weekly ({weeklyCompleted}/{weekly.length})
            </button>
          </div>

          {/* Contract list */}
          <div className="p-3 space-y-2">
            {activeContracts.length > 0 ? (
              activeContracts.map(contract => (
                <ChoreCard
                  key={contract.id}
                  contract={contract}
                  onClaim={() => handleClaim(contract.id, activeTab)}
                />
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 text-xs">No chores today. Dr. Redd is suspicious.</p>
              </div>
            )}
          </div>

          {/* Timer */}
          <div className="px-3 pb-2 text-center">
            <p className="text-[10px] text-gray-600">
              New {activeTab} chores in {getTimeUntilReset(activeTab)}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
