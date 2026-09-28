// Query keys for saved companies/offices, kept side-effect free so screens
// can import them without pulling in the app's shared QueryClient setup
export const PROVIDER_FAVORITE_IDS_QUERY_KEY = ['providerFavoriteIds'];
// The Favorites screen's company/office lists, refreshed after any change
export const PROVIDER_FAVORITES_QUERY_KEY = ['providerFavorites'];
