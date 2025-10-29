# Marketplace Module

A modular, SOLID-principle-based implementation of the CampusHub Marketplace feature.

## Structure

```
marketplace/
├── components/           # UI Components
│   ├── MarketplacePage.tsx       # Main page component (orchestrator)
│   ├── MarketplaceHeader.tsx     # Header with title and actions
│   ├── MarketplaceFilters.tsx    # Search and filter controls
│   ├── MarketplaceGrid.tsx       # Grid layout for items
│   ├── MarketplaceItemCard.tsx   # Individual item card
│   └── index.ts                  # Component exports
├── hooks/                # Custom React Hooks
│   ├── useMarketplaceItems.ts    # Data fetching hook
│   ├── useMarketplaceFilters.ts  # Filter logic hook
│   └── index.ts                  # Hook exports
├── types.ts              # TypeScript interfaces
└── index.ts              # Module exports
```

## Design Principles

### Single Responsibility Principle (SRP)
- Each component has one clear purpose
- `MarketplaceHeader`: Display header and create button
- `MarketplaceFilters`: Handle search and filter UI
- `MarketplaceGrid`: Layout and render item cards
- `MarketplaceItemCard`: Display individual item details

### Open/Closed Principle (OCP)
- Components accept props for customization
- Easy to extend without modifying existing code
- Filter logic is separated and can be enhanced

### Liskov Substitution Principle (LSP)
- Components can be replaced with enhanced versions
- Props interfaces are well-defined

### Interface Segregation Principle (ISP)
- Components receive only the props they need
- No fat interfaces with unused properties

### Dependency Inversion Principle (DIP)
- Components depend on abstractions (types/interfaces)
- Data fetching is abstracted in hooks
- Business logic separated from presentation

## Separation of Concerns

### Data Layer (Hooks)
- `useMarketplaceItems`: Handles API calls and data state
- `useMarketplaceFilters`: Manages filter state and logic

### Presentation Layer (Components)
- Pure presentational components
- No direct API calls in components
- Props-driven rendering

### Business Logic
- Filter logic in `useMarketplaceFilters`
- Price formatting in `MarketplaceItemCard`
- Condition color mapping in `MarketplaceItemCard`

## Features

- ✅ Fetch items from backend API
- ✅ Search by title and description
- ✅ Filter by category, type, and condition
- ✅ Responsive grid layout (1/2/3 columns)
- ✅ Loading and error states
- ✅ Empty state handling
- ✅ Image fallback for missing images
- ✅ Price formatting (including "Free")
- ✅ Condition-based badge colors
- ✅ Hover effects and transitions
- ✅ Dark mode support

## Usage

```tsx
import { MarketplacePage } from '@/pages/marketplace';

function App() {
  return <MarketplacePage />;
}
```

## Future Enhancements

- [ ] Item creation modal
- [ ] Contact seller functionality
- [ ] Favorite/like items
- [ ] Item details modal
- [ ] Pagination
- [ ] Sort options
- [ ] Price range filter
- [ ] Image carousel
- [ ] Seller ratings display
