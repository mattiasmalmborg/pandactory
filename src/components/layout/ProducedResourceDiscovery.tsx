import { useState, useEffect } from 'react';
import { useGame } from '../../game/state/GameContext';
import { RESOURCES } from '../../game/config/resources';
import { FOOD_ITEMS } from '../../game/config/food';

// Fun button texts for variety
const BUTTON_TEXTS = [
  "Excellent!",
  "Fascinating!",
  "Progress!",
  "Science!",
  "Onwards!",
  "Splendid!",
  "Marvelous!",
  "How delightful!",
];

function getRandomButtonText() {
  return BUTTON_TEXTS[Math.floor(Math.random() * BUTTON_TEXTS.length)];
}

export function ProducedResourceDiscovery() {
  const { state, dispatch } = useGame();
  const [buttonText, setButtonText] = useState(getRandomButtonText);

  // Get the first pending discovery (resource or food)
  const pendingResource = state.pendingResourceDiscoveries?.[0];
  const pendingFood = state.pendingFoodDiscoveries?.[0];

  // Prioritize resources over food (arbitrary choice, could be changed)
  const isResourceDiscovery = !!pendingResource;
  const hasPending = pendingResource || pendingFood;

  // Update button text when discovery changes
  useEffect(() => {
    if (hasPending) {
      setButtonText(getRandomButtonText());
    }
  }, [pendingResource, pendingFood, hasPending]);

  if (!hasPending) {
    return null;
  }

  // Get the item info based on type
  const isFood = !isResourceDiscovery && pendingFood;
  const item = isResourceDiscovery
    ? RESOURCES[pendingResource]
    : pendingFood ? FOOD_ITEMS[pendingFood] : null;

  const totalPendingResources = state.pendingResourceDiscoveries?.length || 0;
  const totalPendingFoods = state.pendingFoodDiscoveries?.length || 0;
  const totalPending = totalPendingResources + totalPendingFoods;

  const handleAcknowledge = () => {
    if (isResourceDiscovery && pendingResource) {
      dispatch({
        type: 'ACKNOWLEDGE_RESOURCE_DISCOVERY',
        payload: { resourceId: pendingResource },
      });
    } else if (pendingFood) {
      dispatch({
        type: 'ACKNOWLEDGE_FOOD_DISCOVERY',
        payload: { foodId: pendingFood },
      });
    }
  };

  // Different styling for food vs material
  const headerEmoji = isFood ? '🍽️' : '🔬';
  const headerTitle = isFood ? 'New Food Discovered!' : 'New Material Produced!';
  const headerSubtitle = isFood
    ? 'Your automations created a new food source!'
    : 'Your automations created something new!';
  const hintText = isFood
    ? 'This food can now be used for expeditions!'
    : 'This material can now be used for more advanced automations!';

  // Color scheme - orange/amber for food, emerald/teal for materials
  const gradientFrom = isFood ? 'from-amber-900' : 'from-emerald-900';
  const gradientVia = isFood ? 'via-orange-900' : 'via-teal-900';
  const gradientTo = isFood ? 'to-amber-800' : 'to-emerald-800';
  const borderColor = isFood ? 'border-amber-400' : 'border-emerald-400';
  const textGradientFrom = isFood ? 'from-amber-300' : 'from-emerald-300';
  const textGradientTo = isFood ? 'to-orange-300' : 'to-teal-300';
  const subtitleColor = isFood ? 'text-amber-200' : 'text-emerald-200';
  const countColor = isFood ? 'text-amber-300' : 'text-emerald-300';
  const infoBg = isFood ? 'bg-orange-950/60' : 'bg-teal-950/60';
  const infoBorder = isFood ? 'border-amber-500' : 'border-emerald-500';
  const descColor = isFood ? 'text-amber-200' : 'text-emerald-200';
  const flavorColor = isFood ? 'text-amber-400/70' : 'text-emerald-400/70';
  const hintColor = isFood ? 'text-amber-300' : 'text-emerald-300';
  const buttonGradientFrom = isFood ? 'from-amber-600' : 'from-emerald-600';
  const buttonGradientTo = isFood ? 'to-orange-600' : 'to-teal-600';
  const buttonHoverFrom = isFood ? 'hover:from-amber-500' : 'hover:from-emerald-500';
  const buttonHoverTo = isFood ? 'hover:to-orange-500' : 'hover:to-teal-500';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 overflow-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
      <div className="min-h-full flex items-center justify-center p-4 pt-8 pb-24">
      <div className={`bg-gradient-to-br ${gradientFrom} ${gradientVia} ${gradientTo} rounded-xl border-2 ${borderColor} p-4 sm:p-6 max-w-md w-full shadow-2xl`}>
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">{headerEmoji}</div>
          <h2 className={`text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${textGradientFrom} ${textGradientTo} mb-2`}>
            {headerTitle}
          </h2>
          <p className={`${subtitleColor} text-sm`}>{headerSubtitle}</p>
          {totalPending > 1 && (
            <p className={`${countColor} text-xs mt-1`}>{totalPending - 1} more waiting...</p>
          )}
        </div>

        {/* Item Info */}
        <div className={`${infoBg} rounded-lg p-6 mb-4 border ${infoBorder} text-center shadow-inner`}>
          <div className="text-6xl mb-4">{item?.icon ?? '❓'}</div>
          <h3 className="text-2xl font-bold text-white mb-3">{item?.name ?? 'Unknown'}</h3>
          <p className={`${descColor} text-sm italic leading-relaxed`}>{item?.description}</p>
          {item?.flavorText && (
            <p className={`${flavorColor} text-xs mt-3 italic`}>"{item.flavorText}"</p>
          )}
        </div>

        {/* Hint */}
        <div className={`text-center text-xs ${hintColor} mb-4`}>
          {hintText}
        </div>

        {/* Continue Button */}
        <button
          onClick={handleAcknowledge}
          className={`w-full bg-gradient-to-r ${buttonGradientFrom} ${buttonGradientTo} ${buttonHoverFrom} ${buttonHoverTo} text-white font-bold py-3 px-6 rounded-lg text-lg transition-all shadow-lg`}
        >
          {buttonText}
        </button>
      </div>
      </div>
    </div>
  );
}
