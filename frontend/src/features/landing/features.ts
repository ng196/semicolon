export interface Feature {
  id: string;
  icon: string; // Lucide icon name
  titleKey: string; // Translation key
  descriptionKey: string; // Translation key
}

export const features: Feature[] = [
  {
    id: 'club-management',
    icon: 'Users',
    titleKey: 'features.clubManagement.title',
    descriptionKey: 'features.clubManagement.description'
  },
  {
    id: 'peer-collaboration',
    icon: 'MessageSquare',
    titleKey: 'features.peerCollaboration.title',
    descriptionKey: 'features.peerCollaboration.description'
  },
  {
    id: 'attendance-tracking',
    icon: 'Calendar',
    titleKey: 'features.attendanceTracking.title',
    descriptionKey: 'features.attendanceTracking.description'
  },
  {
    id: 'grade-management',
    icon: 'Award',
    titleKey: 'features.gradeManagement.title',
    descriptionKey: 'features.gradeManagement.description'
  },
  {
    id: 'event-discovery',
    icon: 'Sparkles',
    titleKey: 'features.eventDiscovery.title',
    descriptionKey: 'features.eventDiscovery.description'
  },
  {
    id: 'marketplace',
    icon: 'ShoppingBag',
    titleKey: 'features.marketplace.title',
    descriptionKey: 'features.marketplace.description'
  }
];
