# Query Hooks Migration Guide

This guide explains how to migrate from the old custom hooks to the new standardized TanStack Query hooks.

## Benefits of New Query Hooks

1. **Automatic caching** - Data is cached and shared across components
2. **Background refetching** - Data stays fresh automatically
3. **Optimistic updates** - Better UX with instant feedback
4. **Error handling** - Consistent error states across the app
5. **Loading states** - Better loading state management
6. **Invalidation** - Smart cache invalidation on mutations

## Migration Examples

### Events Feature

#### Before (Old Hook)
```typescript
import { useEvents } from '../hooks/useEvents';

const { events, loading, error, refetch } = useEvents();
```

#### After (New Query Hook)
```typescript
import { useEventsQuery } from '../hooks/queries';

const { 
  data: events = [], 
  isLoading: loading, 
  error, 
  refetch 
} = useEventsQuery();
```

### Marketplace Feature

#### Before
```typescript
import { useMarketplaceItems } from '../hooks/useMarketplaceItems';

const { items, loading, error, refetch } = useMarketplaceItems();
```

#### After
```typescript
import { useMarketplaceItemsQuery } from '../hooks/queries';

const { 
  data: items = [], 
  isLoading: loading, 
  error, 
  refetch 
} = useMarketplaceItemsQuery();
```

## Key Differences

### 1. Return Value Structure
- **Old**: `{ data, loading, error, refetch }`
- **New**: `{ data, isLoading, error, refetch, isError, isFetching, ... }`

### 2. Error Handling
- **Old**: `error` is a string
- **New**: `error` is an Error object (use `error.message`)

### 3. Default Values
- **Old**: You need to handle undefined data
- **New**: Use default values: `data: items = []`

### 4. Mutations
- **Old**: Manual state updates and API calls
- **New**: Use mutation hooks with automatic cache updates

#### Before
```typescript
const handleCreate = async (data) => {
  try {
    await api.create(data);
    refetch(); // Manual refetch
  } catch (error) {
    // Manual error handling
  }
};
```

#### After
```typescript
import { useCreateEventMutation } from '../hooks/queries';

const createMutation = useCreateEventMutation();

const handleCreate = (data) => {
  createMutation.mutate(data); // Automatic cache update
};
```

## Migration Steps

### Step 1: Update Imports
Replace old hook imports with new query hook imports:

```typescript
// Old
import { useEvents } from '../hooks/useEvents';

// New
import { useEventsQuery } from '../hooks/queries';
```

### Step 2: Update Hook Usage
Update the destructuring and variable names:

```typescript
// Old
const { events, loading, error, refetch } = useEvents();

// New
const { 
  data: events = [], 
  isLoading: loading, 
  error, 
  refetch 
} = useEventsQuery();
```

### Step 3: Update Error Handling
Change error message access:

```typescript
// Old
if (error) return <div>Error: {error}</div>;

// New
if (error) return <div>Error: {error.message}</div>;
```

### Step 4: Replace Manual Mutations
Replace manual API calls with mutation hooks:

```typescript
// Old
const handleCreate = async (data) => {
  try {
    await api.create(data);
    refetch();
  } catch (error) {
    setError(error.message);
  }
};

// New
const createMutation = useCreateEventMutation();

const handleCreate = (data) => {
  createMutation.mutate(data);
};

// Access mutation state
const { isPending, error: mutationError } = createMutation;
```

## Advanced Features

### 1. Query Keys
Each feature has centralized query keys for consistency:

```typescript
import { eventKeys } from '../hooks/queries';

// Invalidate specific queries
queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
```

### 2. Optimistic Updates
Use the optimistic update utility:

```typescript
import { useOptimisticUpdate } from '@/shared/hooks/useQueryUtils';

const { updateOptimistically, rollbackOptimisticUpdate } = useOptimisticUpdate();
```

### 3. Query Utils
Use shared utilities for common operations:

```typescript
import { useQueryUtils, queryOptions } from '@/shared/hooks/useQueryUtils';

const { invalidateQueries, prefetchQuery } = useQueryUtils();
```

## Backward Compatibility

The old hooks are still available and marked as legacy. You can migrate gradually:

```typescript
// Both work during migration period
import { useEvents } from '../hooks/useEvents'; // Legacy
import { useEventsQuery } from '../hooks/queries'; // New
```

## Testing

The new query hooks are easier to test with React Query's testing utilities:

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEventsQuery } from '../hooks/queries';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

test('should fetch events', async () => {
  const { result } = renderHook(() => useEventsQuery(), {
    wrapper: createWrapper(),
  });

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data).toBeDefined();
});
```

## Next Steps

1. Start with one feature at a time
2. Update components to use new query hooks
3. Replace manual mutations with mutation hooks
4. Remove old hooks once migration is complete
5. Add tests for the new query hooks