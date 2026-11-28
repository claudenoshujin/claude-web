// Cached index.js versions still import the original favorites entry point.
export function installRecentFavorites() {
  return {
    ready: Promise.resolve(),
    sync() {},
    isEnabled: () => false,
    isFavorite: () => false,
    favoriteRecords: () => [],
    toggleFavorite: () => false,
    removeChat() {},
    reconcileFavorites() {},
    destroy() {},
  };
}
