// Legacy hooks (keep for backward compatibility)
export { useEvents } from './useEvents';
export { useEventFilters } from './useEventFilters';
export { useEventPermissions } from './useEventPermissions';
export { useClubEvents } from './useClubEvents';
export { useEventCreation } from './useEventCreation';
export { useUserClubs } from './useUserClubs';
export { useEventDetails } from './useEventDetails';
export { useDashboardEvents } from './useDashboardEvents';
export { useEventRSVP } from './useEventRSVP';

// New standardized query hooks
export * from './queries';

// Event store
export * from '../stores/eventsStore';
