import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Events State Interface
interface EventsState {
    // Selected event for details modal
    selectedEventId: string | number | null;

    // Filters
    filters: {
        search: string;
        clubFilter: string;
        categoryFilter: string;
        dateFilter: 'all' | 'today' | 'week' | 'month';
        statusFilter: 'all' | 'going' | 'maybe' | 'not_going';
    };

    // View preferences
    view: {
        layout: 'grid' | 'list';
        sortBy: 'date' | 'name' | 'popularity';
        sortOrder: 'asc' | 'desc';
    };

    // UI state
    showCreateModal: boolean;
    showFilters: boolean;

    // Actions
    setSelectedEventId: (id: string | number | null) => void;
    updateFilters: (filters: Partial<EventsState['filters']>) => void;
    clearFilters: () => void;
    updateView: (view: Partial<EventsState['view']>) => void;
    setShowCreateModal: (show: boolean) => void;
    setShowFilters: (show: boolean) => void;
    reset: () => void;
}

// Initial state
const initialState = {
    selectedEventId: null,
    filters: {
        search: '',
        clubFilter: 'all',
        categoryFilter: 'all',
        dateFilter: 'all' as const,
        statusFilter: 'all' as const,
    },
    view: {
        layout: 'grid' as const,
        sortBy: 'date' as const,
        sortOrder: 'asc' as const,
    },
    showCreateModal: false,
    showFilters: false,
};

// Create the store
export const useEventsStore = create<EventsState>()(
    devtools(
        (set, get) => ({
            ...initialState,

            // Actions
            setSelectedEventId: (id) => set({ selectedEventId: id }),

            updateFilters: (newFilters) => set((state) => ({
                filters: { ...state.filters, ...newFilters }
            })),

            clearFilters: () => set({
                filters: {
                    search: '',
                    clubFilter: 'all',
                    categoryFilter: 'all',
                    dateFilter: 'all',
                    statusFilter: 'all',
                }
            }),

            updateView: (newView) => set((state) => ({
                view: { ...state.view, ...newView }
            })),

            setShowCreateModal: (show) => set({ showCreateModal: show }),
            setShowFilters: (show) => set({ showFilters: show }),

            reset: () => set(initialState),
        }),
        { name: 'Events Store' }
    )
);

// Selectors
export const useEventFilters = () => useEventsStore((state) => ({
    filters: state.filters,
    updateFilters: state.updateFilters,
    clearFilters: state.clearFilters,
}));

export const useEventView = () => useEventsStore((state) => ({
    view: state.view,
    updateView: state.updateView,
}));

export const useSelectedEvent = () => useEventsStore((state) => ({
    selectedEventId: state.selectedEventId,
    setSelectedEventId: state.setSelectedEventId,
}));

export const useEventModals = () => useEventsStore((state) => ({
    showCreateModal: state.showCreateModal,
    showFilters: state.showFilters,
    setShowCreateModal: state.setShowCreateModal,
    setShowFilters: state.setShowFilters,
}));