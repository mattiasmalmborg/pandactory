import { useState, useEffect } from 'react';
import { GameProvider, getLastOfflineProgressResult, clearOfflineProgressResult } from './game/state/GameContext';
import { useGameLoop } from './hooks/useGameLoop';
import { useSmartTooltips } from './hooks/useSmartTooltips';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { Dashboard } from './components/layout/Dashboard';
import { BiomeView } from './components/layout/BiomeView';
import { Statistics } from './components/layout/Statistics';
import { SkillTree } from './components/prestige/SkillTree';
import { Navigation } from './components/layout/Navigation';
import { ExpeditionLauncher } from './components/expedition/ExpeditionLauncher';
import { ExpeditionTimer } from './components/expedition/ExpeditionTimer';
import { OfflineProgressModal } from './components/layout/OfflineProgressModal';
import { BiomeBackground } from './components/layout/BiomeBackground';
import { HintSystem } from './components/tutorial/HintSystem';
import { AlertSystem } from './components/alerts/AlertSystem';
import { ProducedResourceDiscovery } from './components/layout/ProducedResourceDiscovery';
import { useGame } from './game/state/GameContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { BiomeId } from './types/game.types';
import { OfflineProgressResult } from './utils/offlineProgress';

type ViewType = 'dashboard' | 'biome' | 'expedition' | 'statistics' | 'skills';

// Load saved view from localStorage, default to 'dashboard'
function getInitialView(): ViewType {
  try {
    const saved = localStorage.getItem('pandactory-current-view');
    if (saved && ['dashboard', 'biome', 'expedition', 'statistics', 'skills'].includes(saved)) {
      return saved as ViewType;
    }
  } catch {
    // Failed to load - use default
  }
  return 'dashboard'; // Default to dashboard (home page)
}

function GameContent() {
  const { state, dispatch } = useGame();
  const [currentView, setCurrentView] = useState<ViewType>(getInitialView);
  const [isLoading, setIsLoading] = useState(true);
  const [offlineProgress, setOfflineProgress] = useState<OfflineProgressResult | null>(null);

  // Initialize game loop
  useGameLoop();

  // Initialize smart tooltips
  useSmartTooltips();

  // Handle biome change
  const handleBiomeChange = (biomeId: BiomeId) => {
    dispatch({ type: 'SWITCH_BIOME', payload: { biomeId } });
  };

  // Initialize keyboard shortcuts
  useKeyboardShortcuts({
    currentView,
    onViewChange: setCurrentView,
    unlockedBiomes: state.unlockedBiomes,
    onBiomeChange: handleBiomeChange,
  });

  // Show loading spinner for initial render and check for offline progress
  useEffect(() => {
    // Small delay to ensure all state is loaded
    const timer = setTimeout(() => {
      // Check for offline progress result
      const result = getLastOfflineProgressResult();
      if (result && result.offlineSeconds > 60) {
        setOfflineProgress(result);
      }
      setIsLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Handle closing the offline progress modal
  const handleCloseOfflineModal = () => {
    setOfflineProgress(null);
    clearOfflineProgressResult();
  };

  // Save current view to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('pandactory-current-view', currentView);
    } catch (e) {
      console.error('Failed to save current view:', e);
    }
  }, [currentView]);

  // Determine which background to show
  const backgroundId = currentView === 'dashboard' ? 'dashboard' :
                       currentView === 'statistics' ? 'skills_stats' :
                       currentView === 'skills' ? 'skills_stats' :
                       currentView === 'expedition' ? state.player.currentBiome :
                       state.player.currentBiome;

  // Show loading spinner
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block w-16 h-16 border-4 border-panda-orange border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white text-lg font-semibold">Loading Pandactory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Background layer - fixed, doesn't scroll */}
      <BiomeBackground biomeId={backgroundId}>
        {/* Mobile frame - max width with centered content */}
        <div className="min-h-screen pb-20">
          <div className="max-w-md mx-auto h-full">
            {/* Offline Progress Modal */}
            {offlineProgress && (
              <OfflineProgressModal
                offlineSeconds={offlineProgress.offlineSeconds}
                cappedMinutes={offlineProgress.cappedMinutes}
                resourcesProduced={offlineProgress.resourcesProduced}
                foodProduced={offlineProgress.foodProduced}
                wasOnExpedition={offlineProgress.wasOnExpedition}
                onClose={handleCloseOfflineModal}
              />
            )}

            {/* Expedition Timer Overlay */}
            <ExpeditionTimer />

            {/* Tutorial Hints */}
            <HintSystem />

            {/* Alert System */}
            <AlertSystem />

            {/* Produced Resource Discovery Popup */}
            <ProducedResourceDiscovery />

            {/* Main Content - scrollable */}
            <div className="h-full">
              {currentView === 'dashboard' && <Dashboard onNavigateToBiome={() => setCurrentView('biome')} />}
              {currentView === 'biome' && <BiomeView biomeId={state.player.currentBiome} />}
              {currentView === 'expedition' && <ExpeditionLauncher />}
              {currentView === 'statistics' && <Statistics />}
              {currentView === 'skills' && <SkillTree />}
            </div>
          </div>
        </div>
      </BiomeBackground>

      {/* Bottom Navigation - fixed at bottom */}
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <GameProvider>
        <GameContent />
      </GameProvider>
    </ErrorBoundary>
  );
}

export default App;
