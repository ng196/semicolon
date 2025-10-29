# State Management Usage Guide

This guide explains how to use the new Zustand stores for state management in Saksham.

## Overview

We use Zustand for state management with the following structure:
- **Global UI State** - Theme, sidebar, modals, notifications
- **Feature State** - Feature-specific state (filters, selections, etc.)
- **Server State** - Handled by TanStack Query (not Zustand)

## Global UI Store

### Basic Usage

```typescript
import { useUIStore, useTheme, useSidebar, useModals } from '@/stores';

// Using the main store
const theme = useUIStore((state) => state.theme);
const setTheme = useUIStore((state) => state.setTheme);

// Using selectors (recommended for performance)
const theme = useTheme();
const { isOpen, toggle } = useSidebar();
const { modals, openModal, closeModal } = useModals();
```

### Theme Management

```typescript
import { useTheme, useUIStore } from '@/stores';

function ThemeToggle() {
  const theme = useTheme();
  const setTheme = useUIStore((state) => state.setTheme);

  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Toggle Theme
    </button>
  );
}
```

### Sidebar Management

```typescript
import { useSidebar } from '@/stores';

function SidebarToggle() {
  const { isOpen, toggle, setCollapsed } = useSidebar();

  return (
    <div>
      <button onClick={toggle}>
        {isOpen ? 'Close' : 'Open'} Sidebar
      </button>
      <button onClick={() => setCollapsed(true)}>
        Collapse Sidebar
      </button>
    </div>
  );
}
```

### Modal Management

```typescript
import { useModals } from '@/stores';

function CreateEventButton() {
  const { openModal, closeModal, modals } = useModals();

  return (
    <div>
      <button onClick={() => openModal('createEvent')}>
        Create Event
      </button>
      
      {modals.createEvent && (
        <CreateEventModal 
          open={modals.createEvent}
          onClose={() => closeModal('createEvent')}
        />
      )}
    </div>
  );
}
```

## Feature Stores

### Events Store

```typescript
import { 
  useEventsStore, 
  useEventFilters, 
  useSelectedEvent, 
  useEventModals 
} from '@/features/events';

function EventsPage() {
  // Using selectors
  const { filters, updateFilters, clearFilters } = useEventFilters();
  const { selectedEventId, setSelectedEventId } = useSelectedEvent();
  const { showCreateModal, setShowCreateModal } = useEventModals();

  // Update filters
  const handleSearchChange = (search: string) => {
    updateFilters({ search });
  };

  // Select event
  const handleEventClick = (eventId: number) => {
    setSelectedEventId(eventId);
  };

  return (
    <div>
      <input 
        value={filters.search}
        onChange={(e) => handleSearchChange(e.target.value)}
        placeholder="Search events..."
      />
      
      <button onClick={() => setShowCreateModal(true)}>
        Create Event
      </button>
      
      <button onClick={clearFilters}>
        Clear Filters
      </button>
    </div>
  );
}
```

### Marketplace Store

```typescript
import { 
  useMarketplaceFilters, 
  useMarketplaceFavorites,
  useMarketplaceView 
} from '@/features/marketplace';

function MarketplacePage() {
  const { filters, updateFilters } = useMarketplaceFilters();
  const { favoriteItems, toggleFavorite, isFavorite } = useMarketplaceFavorites();
  const { view, updateView } = useMarketplaceView();

  const handleCategoryChange = (category: string) => {
    updateFilters({ category });
  };

  const handleFavoriteToggle = (itemId: number) => {
    toggleFavorite(itemId);
  };

  const handleViewChange = (layout: 'grid' | 'list') => {
    updateView({ layout });
  };

  return (
    <div>
      <select 
        value={filters.category} 
        onChange={(e) => handleCategoryChange(e.target.value)}
      >
        <option value="all">All Categories</option>
        <option value="electronics">Electronics</option>
        <option value="books">Books</option>
      </select>

      <button onClick={() => handleViewChange('grid')}>
        Grid View
      </button>
      
      <button onClick={() => handleViewChange('list')}>
        List View
      </button>
    </div>
  );
}
```

## Advanced Patterns

### Combining Stores

```typescript
import { useUIStore } from '@/stores';
import { useEventsStore } from '@/features/events';

function EventsPageWithGlobalState() {
  // Global UI state
  const globalLoading = useUIStore((state) => state.globalLoading);
  const setGlobalLoading = useUIStore((state) => state.setGlobalLoading);
  
  // Feature state
  const filters = useEventsStore((state) => state.filters);
  const updateFilters = useEventsStore((state) => state.updateFilters);

  const handleAsyncOperation = async () => {
    setGlobalLoading(true);
    try {
      // Perform async operation
      await someAsyncFunction();
    } finally {
      setGlobalLoading(false);
    }
  };

  return (
    <div>
      {globalLoading && <div>Loading...</div>}
      {/* Rest of component */}
    </div>
  );
}
```

### Custom Hooks with Stores

```typescript
import { useEventsStore } from '@/features/events';
import { useEventsQuery } from '@/features/events/hooks/queries';

// Custom hook that combines store state with server state
export const useFilteredEvents = () => {
  const filters = useEventsStore((state) => state.filters);
  const { data: events = [], isLoading, error } = useEventsQuery();

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = event.name.toLowerCase().includes(filters.search.toLowerCase());
      const matchesCategory = filters.categoryFilter === 'all' || event.category === filters.categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [events, filters]);

  return {
    events: filteredEvents,
    isLoading,
    error,
    filters,
  };
};

// Usage
function EventsList() {
  const { events, isLoading, filters } = useFilteredEvents();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <p>Showing {events.length} events</p>
      {events.map(event => (
        <div key={event.id}>{event.name}</div>
      ))}
    </div>
  );
}
```

### Persisted State

Some stores automatically persist certain values:

```typescript
// UI Store persists theme and sidebar preferences
const uiStore = useUIStore();
// Theme and sidebarCollapsed are automatically saved to localStorage

// Marketplace Store persists view preferences and favorites
const marketplaceStore = useMarketplaceStore();
// View settings and favorite items are automatically saved
```

### DevTools Integration

All stores are integrated with Redux DevTools for debugging:

1. Install Redux DevTools browser extension
2. Open DevTools and go to Redux tab
3. You'll see all store actions and state changes
4. You can time-travel debug and inspect state

## Best Practices

### 1. Use Selectors for Performance

```typescript
// ❌ Bad - subscribes to entire store
const store = useUIStore();

// ✅ Good - subscribes only to specific values
const theme = useUIStore((state) => state.theme);
const setTheme = useUIStore((state) => state.setTheme);

// ✅ Even better - use provided selectors
const theme = useTheme();
```

### 2. Group Related State

```typescript
// ❌ Bad - separate subscriptions
const search = useEventsStore((state) => state.filters.search);
const category = useEventsStore((state) => state.filters.categoryFilter);
const updateFilters = useEventsStore((state) => state.updateFilters);

// ✅ Good - single subscription for related data
const { filters, updateFilters } = useEventFilters();
```

### 3. Keep Server State Separate

```typescript
// ✅ Good - use TanStack Query for server state
const { data: events, isLoading } = useEventsQuery();

// ✅ Good - use Zustand for client state
const { filters, updateFilters } = useEventFilters();

// ❌ Bad - don't put server data in Zustand
// const events = useEventsStore((state) => state.events); // Don't do this
```

### 4. Reset State When Needed

```typescript
import { useEventsStore } from '@/features/events';

function EventsPage() {
  const reset = useEventsStore((state) => state.reset);

  useEffect(() => {
    // Reset filters when component mounts
    return () => reset();
  }, [reset]);

  return <div>Events Page</div>;
}
```

### 5. Use TypeScript for Type Safety

```typescript
// All stores are fully typed
const updateFilters = useEventsStore((state) => state.updateFilters);

// TypeScript will enforce correct types
updateFilters({ 
  search: 'test', // ✅ string
  categoryFilter: 'sports', // ✅ string
  invalidField: 'test' // ❌ TypeScript error
});
```

## Migration from useState

### Before (useState)

```typescript
function EventsPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Component logic...
}
```

### After (Zustand)

```typescript
function EventsPage() {
  const { filters, updateFilters } = useEventFilters();
  const { selectedEventId, setSelectedEventId } = useSelectedEvent();
  const { showCreateModal, setShowCreateModal } = useEventModals();

  // Component logic...
}
```

## Testing

Stores can be easily tested:

```typescript
import { renderHook, act } from '@testing-library/react';
import { useEventsStore } from '@/features/events';

test('should update filters', () => {
  const { result } = renderHook(() => useEventsStore());

  act(() => {
    result.current.updateFilters({ search: 'test' });
  });

  expect(result.current.filters.search).toBe('test');
});
```

## Performance Tips

1. **Use selectors** to subscribe only to needed state
2. **Group related state** in single subscriptions
3. **Use shallow comparison** for objects:

```typescript
import { shallow } from 'zustand/shallow';

const { filters, updateFilters } = useEventsStore(
  (state) => ({ filters: state.filters, updateFilters: state.updateFilters }),
  shallow
);
```

4. **Memoize expensive computations**:

```typescript
const filteredEvents = useMemo(() => {
  return events.filter(/* filter logic */);
}, [events, filters]);
```