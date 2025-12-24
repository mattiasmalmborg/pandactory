import { useState, useEffect } from 'react';

/**
 * Hook to load image assets with fallback support
 * Returns the image URL if it exists, or null if not found
 */
export function useAssetImage(path: string): string | null {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [_isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    // Try to load the image
    const img = new Image();

    img.onload = () => {
      setImageUrl(path);
      setIsLoading(false);
    };

    img.onerror = () => {
      // Image doesn't exist, use fallback
      console.log(`[Asset] Image not found: ${path}`);
      setImageUrl(null);
      setIsLoading(false);
    };

    img.src = path;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [path]);

  return imageUrl;
}

/**
 * All asset path helpers are now in src/config/assets.ts
 * Import from there instead:
 *
 * import {
 *   getBiomeBackgroundPath,
 *   getResourceImagePath,
 *   getFoodImagePath,
 *   getBiomeIconPath,
 *   getUIElementPath,
 *   getIconPath,
 *   getFallbackGradient,
 *   getScreenBackgroundPath
 * } from '../config/assets';
 */
