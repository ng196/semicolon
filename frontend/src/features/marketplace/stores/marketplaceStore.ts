import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { MarketplaceFilters } from '../types';

// Marketplace State Interface
interface MarketplaceState {
    // Selected item for details modal
    selectedItemId: string | number | null;

    // Filters
    filters: MarketplaceFilters;

    // View preferences
    view: {
        layout: 'grid' | 'list';
        sortBy: 'date' | 'price' | 'title' | 'popularity';
        sortOrder: 'asc' | 'desc';
        itemsPerPage: 12 | 24 | 48;
    };

    // UI state
    showCreateModal: boolean;
    showFilters: boolean;

    // Favorites
    favoriteItems: Set<string | number>;

    // Actions
    setSelectedItemId: (id: string | number | null) => void;
    updateFilters: (filters: Partial<MarketplaceFilters>) => void;
    clearFilters: () => void;
    updateView: (view: Partial<MarketplaceState['view']>) => void;
    setShowCreateModal: (show: boolean) => void;
    setShowFilters: (show: boolean) => void;
    toggleFavorite: (itemId: string | number) => void;
    setFavorites: (favorites: (string | number)[]) => void;
    reset: () => void;
}

// Initial state
const initialState = {
    selectedItemId: null,
    filters: {
        search: '',
        category: 'all',
        type: 'all',
        condition: 'all',
    },
    view: {
        layout: 'grid' as const,
        sortBy: 'date' as const,
        sortOrder: 'desc' as const,
        itemsPerPage: 24 as const,
    },
    showCreateModal: false,
    showFilters: false,
    favoriteItems: new Set<string | number>(),
};

// Create the store
export const useMarketplaceStore = create<MarketplaceState>()(
    devtools(
        persist(
            (set, get) => ({
                ...initialState,

                // Actions
                setSelectedItemId: (id) => set({ selectedItemId: id }),

                updateFilters: (newFilters) => set((state) => ({
                    filters: { ...state.filters, ...newFilters }
                })),

                clearFilters: () => set({
                    filters: {
                        search: '',
                        category: 'all',
                        type: 'all',
                        condition: 'all',
                    }
                }),

                updateView: (newView) => set((state) => ({
                    view: { ...state.view, ...newView }
                })),

                setShowCreateModal: (show) => set({ showCreateModal: show }),
                setShowFilters: (show) => set({ showFilters: show }),

                toggleFavorite: (itemId) => set((state) => {
                    const newFavorites = new Set(state.favoriteItems);
                    if (newFavorites.has(itemId)) {
                        newFavorites.delete(itemId);
                    } else {
                        newFavorites.add(itemId);
                    }
                    return { favoriteItems: newFavorites };
                }),

                setFavorites: (favorites) => set({
                    favoriteItems: new Set(favorites)
                }),

                reset: () => set({
                    ...initialState,
                    favoriteItems: new Set(),
                }),
            }),
            {
                name: 'saksham-marketplace-store',
                // Persist view preferences and favorites
                partialize: (state) => ({
                    view: state.view,
                    favoriteItems: Array.from(state.favoriteItems), // Convert Set to Array for persistence
                }),
                // Custom serialization for Set
                onRehydrateStorage: () => (state) => {
                    if (state && Array.isArray(state.favoriteItems)) {
                        state.favoriteItems = new Set(state.favoriteItems);
                    }
                },
            }
        ),
        { name: 'Marketplace Store' }
    )
);

// Selectors
export const useMarketplaceFilters = () => useMarketplaceStore((state) => ({
    filters: state.filters,
    updateFilters: state.updateFilters,
    clearFilters: state.clearFilters,
}));

export const useMarketplaceView = () => useMarketplaceStore((state) => ({
    view: state.view,
    updateView: state.updateView,
}));

export const useSelectedMarketplaceItem = () => useMarketplaceStore((state) => ({
    selectedItemId: state.selectedItemId,
    setSelectedItemId: state.setSelectedItemId,
}));

export const useMarketplaceModals = () => useMarketplaceStore((state) => ({
    showCreateModal: state.showCreateModal,
    showFilters: state.showFilters,
    setShowCreateModal: state.setShowCreateModal,
    setShowFilters: state.setShowFilters,
}));

export const useMarketplaceFavorites = () => useMarketplaceStore((state) => ({
    favoriteItems: state.favoriteItems,
    toggleFavorite: state.toggleFavorite,
    setFavorites: state.setFavorites,
    isFavorite: (itemId: string | number) => state.favoriteItems.has(itemId),
}));