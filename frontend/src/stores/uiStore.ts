import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// UI State Interface
interface UIState {
    // Theme
    theme: 'light' | 'dark' | 'system';

    // Layout
    sidebarOpen: boolean;
    sidebarCollapsed: boolean;

    // Modals
    modals: {
        createEvent: boolean;
        createHub: boolean;
        createMarketplaceItem: boolean;
        createRequest: boolean;
        userProfile: boolean;
        settings: boolean;
    };

    // Loading states
    globalLoading: boolean;

    // Notifications
    notifications: {
        show: boolean;
        count: number;
    };

    // Search
    globalSearch: {
        query: string;
        isOpen: boolean;
        results: any[];
        loading: boolean;
    };

    // Actions
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    toggleSidebarCollapsed: () => void;
    setSidebarCollapsed: (collapsed: boolean) => void;

    openModal: (modal: keyof UIState['modals']) => void;
    closeModal: (modal: keyof UIState['modals']) => void;
    closeAllModals: () => void;

    setGlobalLoading: (loading: boolean) => void;

    setNotificationCount: (count: number) => void;
    toggleNotifications: () => void;

    setGlobalSearch: (search: Partial<UIState['globalSearch']>) => void;
    clearGlobalSearch: () => void;
}

// Create the store
export const useUIStore = create<UIState>()(
    devtools(
        persist(
            (set, get) => ({
                // Initial state
                theme: 'system',
                sidebarOpen: true,
                sidebarCollapsed: false,
                modals: {
                    createEvent: false,
                    createHub: false,
                    createMarketplaceItem: false,
                    createRequest: false,
                    userProfile: false,
                    settings: false,
                },
                globalLoading: false,
                notifications: {
                    show: false,
                    count: 0,
                },
                globalSearch: {
                    query: '',
                    isOpen: false,
                    results: [],
                    loading: false,
                },

                // Actions
                setTheme: (theme) => set({ theme }),

                toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
                setSidebarOpen: (open) => set({ sidebarOpen: open }),

                toggleSidebarCollapsed: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
                setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

                openModal: (modal) => set((state) => ({
                    modals: { ...state.modals, [modal]: true }
                })),

                closeModal: (modal) => set((state) => ({
                    modals: { ...state.modals, [modal]: false }
                })),

                closeAllModals: () => set({
                    modals: {
                        createEvent: false,
                        createHub: false,
                        createMarketplaceItem: false,
                        createRequest: false,
                        userProfile: false,
                        settings: false,
                    }
                }),

                setGlobalLoading: (loading) => set({ globalLoading: loading }),

                setNotificationCount: (count) => set((state) => ({
                    notifications: { ...state.notifications, count }
                })),

                toggleNotifications: () => set((state) => ({
                    notifications: { ...state.notifications, show: !state.notifications.show }
                })),

                setGlobalSearch: (search) => set((state) => ({
                    globalSearch: { ...state.globalSearch, ...search }
                })),

                clearGlobalSearch: () => set({
                    globalSearch: {
                        query: '',
                        isOpen: false,
                        results: [],
                        loading: false,
                    }
                }),
            }),
            {
                name: 'saksham-ui-store',
                // Only persist certain values
                partialize: (state) => ({
                    theme: state.theme,
                    sidebarCollapsed: state.sidebarCollapsed,
                }),
            }
        ),
        { name: 'UI Store' }
    )
);

// Selectors for better performance
export const useTheme = () => useUIStore((state) => state.theme);
export const useSidebar = () => useUIStore((state) => ({
    isOpen: state.sidebarOpen,
    isCollapsed: state.sidebarCollapsed,
    toggle: state.toggleSidebar,
    setOpen: state.setSidebarOpen,
    toggleCollapsed: state.toggleSidebarCollapsed,
    setCollapsed: state.setSidebarCollapsed,
}));

export const useModals = () => useUIStore((state) => ({
    modals: state.modals,
    openModal: state.openModal,
    closeModal: state.closeModal,
    closeAllModals: state.closeAllModals,
}));

export const useGlobalLoading = () => useUIStore((state) => ({
    loading: state.globalLoading,
    setLoading: state.setGlobalLoading,
}));

export const useNotifications = () => useUIStore((state) => ({
    ...state.notifications,
    setCount: state.setNotificationCount,
    toggle: state.toggleNotifications,
}));

export const useGlobalSearch = () => useUIStore((state) => ({
    ...state.globalSearch,
    setSearch: state.setGlobalSearch,
    clearSearch: state.clearGlobalSearch,
}));