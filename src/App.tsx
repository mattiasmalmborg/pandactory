import { useState, useEffect, useCallback } from 'react';
import { GameProvider, getLastOfflineProgressResult, clearOfflineProgressResult } from './game/state/GameContext';
import { useGameLoop } from './hooks/useGameLoop';
import { useSmartTooltips } from './hooks/useSmartTooltips';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useAchievements } from './hooks/useAchievements';
import { useContracts } from './hooks/useContracts';
import { CommandCenter } from './components/layout/CommandCenter';
import { BiomeView } from './components/layout/BiomeView';
import { Statistics } from './components/layout/Statistics';
import { SkillTree } from './components/prestige/SkillTree';
import { Achievements } from './components/achievements/Achievements';
import { ToastProvider } from './components/ui/ToastQueue';
import { useAchievementToasts } from './components/achievements/AchievementToast';
import { useChoreToasts } from './components/chores/ChoreToast';
import { Navigation } from './components/layout/Navigation';
import type { ViewType, MainViewType } from './components/layout/Navigation';
import { MoreMenu } from './components/layout/MoreMenu';
import type { MoreViewType } from './components/layout/MoreMenu';
import { PandaLab } from './components/lab/PandaLab';
import { ExpeditionLauncher } from './components/expedition/ExpeditionLauncher';
import { ExpeditionTimer } from './components/expedition/ExpeditionTimer';
import { OfflineProgressModal } from './components/layout/OfflineProgressModal';
import { LabOnboardingModal } from './components/layout/LabOnboardingModal';
import { BiomeBackground } from './components/layout/BiomeBackground';
import { HintSystem } from './components/tutorial/HintSystem';
import { AlertSystem } from './components/alerts/AlertSystem';
import { ProducedResourceDiscovery } from './components/layout/ProducedResourceDiscovery';
import { useGame } from './game/state/GameContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { BiomeId } from './types/game.types';
import { OfflineProgressResult } from './utils/offlineProgress';
import { STORAGE_KEYS } from './config/storage';

const ALL_VIEWS: ViewType[] = ['dashboard', 'biome', 'expedition', 'lab', 'more', 'skills', 'achievements', 'statistics'];

// Load saved view from localStorage, default to 'dashboard'
function getInitialView(): ViewType {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.currentView);
    if (saved && ALL_VIEWS.includes(saved as ViewType)) {
      return saved as ViewType;
    }
  } catch {
    // Failed to load - use default
  }
  return 'dashboard';
}

function GameContent() {
  const { state, dispatch } = useGame();
  const [currentView, setCurrentView] = useState<ViewType>(getInitialView);
  const [isLoading, setIsLoading] = useState(true);
  const [offlineProgress, setOfflineProgress] = useState<OfflineProgressResult | null>(null);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  // Initialize game loop
  useGameLoop();

  // Initialize smart tooltips
  useSmartTooltips();

  // Check for achievements
  useAchievements();

  // Contract/chore tracking
  useContracts();

  // Handle biome change
  const handleBiomeChange = (biomeId: BiomeId) => {
    dispatch({ type: 'SWITCH_BIOME', payload: { biomeId } });
  };

  // Initialize keyboard shortcuts
  useKeyboardShortcuts({
    currentView,
    onViewChange: setCurrentView as (view: string) => void,
    unlockedBiomes: state.unlockedBiomes,
    onBiomeChange: handleBiomeChange,
  });

  // Initialize session on mount (for secret achievements)
  useEffect(() => {
    dispatch({ type: 'INIT_SESSION' });
  }, [dispatch]);

  // Track clicks globally (for Clicker Champion achievement)
  useEffect(() => {
    const handleClick = () => {
      dispatch({ type: 'TRACK_CLICK' });
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [dispatch]);

  // Show loading spinner for initial render and check for offline progress
  useEffect(() => {
    const timer = setTimeout(() => {
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
      localStorage.setItem(STORAGE_KEYS.currentView, currentView);
    } catch {
      // Failed to save - ignore
    }
  }, [currentView]);

  // Handle main nav tab clicks
  const handleMainNavChange = useCallback((view: MainViewType) => {
    if (view === 'more') {
      setMoreMenuOpen(true);
    } else {
      setCurrentView(view);
      setMoreMenuOpen(false);
    }
  }, []);

  // Handle More menu sub-navigation
  const handleMoreNavigate = useCallback((view: MoreViewType) => {
    setCurrentView(view);
    setMoreMenuOpen(false);
  }, []);

  // Handle Command Center navigation (next steps, lab link, etc.)
  const handleCommandCenterNavigate = useCallback((view: string) => {
    if (ALL_VIEWS.includes(view as ViewType)) {
      setCurrentView(view as ViewType);
    }
  }, []);

  // Determine which background to show
  const backgroundId = currentView === 'dashboard' ? 'dashboard' :
                       currentView === 'statistics' ? 'skills_stats' :
                       currentView === 'skills' ? 'skills_stats' :
                       currentView === 'lab' ? 'skills_stats' :
                       currentView === 'expedition' ? state.player.currentBiome :
                       currentView === 'achievements' ? 'skills_stats' :
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
            {/* Lab Onboarding Modal (first prestige or veteran migration) */}
            {state.pendingLabOnboarding && (
              <LabOnboardingModal
                veteranBonus={state.pendingVeteranBonus}
                onClose={() => dispatch({ type: 'DISMISS_LAB_ONBOARDING' })}
              />
            )}

            {/* Offline Progress Modal */}
            {offlineProgress && !state.pendingLabOnboarding && (
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
              {currentView === 'dashboard' && <CommandCenter onNavigate={handleCommandCenterNavigate} />}
              {currentView === 'biome' && <BiomeView biomeId={state.player.currentBiome} />}
              {currentView === 'expedition' && <ExpeditionLauncher />}
              {currentView === 'lab' && <PandaLab />}
              {currentView === 'statistics' && <Statistics />}
              {currentView === 'skills' && <SkillTree />}
              {currentView === 'achievements' && <Achievements />}
            </div>
          </div>
        </div>
      </BiomeBackground>

      {/* More Menu Overlay */}
      <MoreMenu
        isOpen={moreMenuOpen}
        onClose={() => setMoreMenuOpen(false)}
        onNavigate={handleMoreNavigate}
      />

      {/* Bottom Navigation - fixed at bottom */}
      <Navigation currentView={currentView} onViewChange={handleMainNavChange} />

      {/* Toast notification hooks (queue-based, renders via ToastProvider) */}
      <ToastHooks />
    </div>
  );
}

function ToastHooks() {
  useAchievementToasts();
  useChoreToasts();
  return null;
}

function App() {
  return (
    <ErrorBoundary>
      <GameProvider>
        <ToastProvider>
          <GameContent />
        </ToastProvider>
      </GameProvider>
    </ErrorBoundary>
  );
}

export default App;
