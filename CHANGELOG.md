# Changelog

## [1.5.1] - 2026-03-21

### Added
- Biome-specific ambient particle effects (forest spores, lake mist, desert sand, tundra snow, volcanic embers, crystal sparkles)
- Upgrade glow burst animation on automation cards when upgrading
- x10 upgrade cascade — level ticks up visually one-by-one instead of jumping
- Screen shake on impactful events (build automation, achievement unlock)
- Haptic feedback via navigator.vibrate() on Android (tap, upgrade, achievement)
- Biome-colored accent tints on automation card borders
- View transition animations (fade+slide) when switching pages
- Stagger-in animations on automation lists and More menu items
- Progress bar shimmer sweep effect
- Animated orange dot indicator on active bottom navigation tab
- Tabular numeric font for all resource numbers
- Vignette depth effect on backgrounds
- Button ripple effect on upgrade/build buttons

### Changed
- Progress bars use GPU-accelerated transform: scaleX() instead of width transitions
- Smart tooltip system rewritten to use event delegation (2 listeners instead of O(n))
- Achievement hash uses lightweight string join instead of JSON.stringify
- Deep clone in offline progress uses structuredClone instead of JSON round-trip
- Touch button feedback changed from 0ms snap to smooth 60ms ease-out
- prefers-reduced-motion media query now targeted (only decorative animations) instead of killing everything

### Fixed
- Veteran onboarding modal no longer appears for players who haven't prestiged
- Dev-tools "Add 1000 of Each" now correctly adds resources to their proper biomes
- Dev-tools now also adds food items and updates discoveredResources for accurate counters
- Sulfur correctly added to both Arid Desert and Volcanic Isle (discoverable in both)
- Removed orphaned resources from dev-tools (hull_plates, tank_shell, cathode_powder, algae)
- Cascade timer properly cleaned up on component unmount
- Interactive divs converted to semantic buttons (ArtifactLoadout, CommandCenter)
- SkillTree modal has proper focus trapping, Escape key, and role="dialog"
- Color-only indicators in MoreMenu now have aria-labels
- SaveManager textarea has accessible label
- viewport meta allows pinch-to-zoom (removed user-scalable=no)

### Performance
- React.memo added to AutomationCard, AnimatedResourceRow, BiomeTab, ChoreCard
- useMemo added to BuildAutomation cross-biome resource aggregation
- ChoresList filter operations memoized into single pass
- Removed deprecated -webkit-overflow-scrolling usage
