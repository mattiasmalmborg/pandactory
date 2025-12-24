import { ReactNode } from 'react';
import { useAssetImage } from '../../hooks/useAssetImage';

interface BackgroundWrapperProps {
  /**
   * Path to background image
   */
  backgroundPath: string;

  /**
   * Fallback Tailwind gradient classes (e.g., "from-purple-900 via-indigo-900 to-purple-900")
   */
  fallbackGradient: string;

  /**
   * Optional overlay opacity (0-100, default 40)
   */
  overlayOpacity?: number;

  /**
   * Children to render on top of background
   */
  children: ReactNode;
}

/**
 * Reusable background wrapper component
 * - Shows background image with automatic fallback to gradient
 * - Background is fixed and doesn't scroll
 * - Content scrolls over the background
 * - Adds semi-transparent overlay for better text readability
 *
 * Usage:
 * ```tsx
 * <BackgroundWrapper
 *   backgroundPath="/assets/backgrounds/bg_skill_tree.jpg"
 *   fallbackGradient="from-purple-900 via-indigo-900 to-purple-900"
 *   overlayOpacity={40}
 * >
 *   <YourContent />
 * </BackgroundWrapper>
 * ```
 */
export function BackgroundWrapper({
  backgroundPath,
  fallbackGradient,
  overlayOpacity = 40,
  children,
}: BackgroundWrapperProps) {
  const backgroundImage = useAssetImage(backgroundPath);
  const overlayClass = `bg-black bg-opacity-${overlayOpacity}`;

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Background Layer - Fixed, doesn't scroll */}
      <div className="absolute inset-0">
        {backgroundImage ? (
          // Image background
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
        ) : (
          // Fallback gradient
          <div className={`absolute inset-0 bg-gradient-to-br ${fallbackGradient}`} />
        )}
        {/* Overlay for better text readability */}
        <div className={`absolute inset-0 ${overlayClass}`} />
      </div>

      {/* Content Layer - Scrollable */}
      <div className="absolute inset-0 overflow-y-auto overflow-x-hidden">
        <div className="min-h-full">
          {children}
        </div>
      </div>
    </div>
  );
}
