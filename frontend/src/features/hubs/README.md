# Hubs Module - Role-Based Project Management

This folder contains the project management functionality with role-based access control.

## Structure

```
hubs/
├── pages/
│   ├── HubsPage.tsx           - Main page with project listings
│   ├── ProjectPage.tsx        - Individual project detail page
│   ├── ProjectCard.tsx        - Basic project card component
│   └── CreateProjectModal.tsx - Modal for creating new projects
├── projects/                  - Role-based project management
│   ├── components/            - Role-aware UI components
│   ├── hooks/                 - Project-specific hooks
│   ├── services/              - Proxy API with mock data
│   └── types/                 - TypeScript interfaces
├── hooks/                     - Basic hub queries
├── components/                - Generic hub components
└── README.md                  - This file
```

## Features Implemented

### ✅ Basic Projects
- **Browse Projects**: Grid view with filtering
- **Create Project**: Modal form with project details
- **View Project**: Basic project page with members

### 🚧 Role-Based Project Management (In Progress)
- **Role Detection**: Creator/Member/Visitor role system
- **Role-Based UI**: Different interfaces per role
- **Member Management**: Creator-only member management modal
- **Join Requests**: Visitor join request workflow
- **Project Editing**: Creator-only project editing

## Routing

Uses query parameters:
- `/hubs` - Main hubs page
- `/hubs?view=project&id=123` - Project detail page

## API Integration

### Current (Basic)
All API calls go through `frontend/src/api/client.ts`:
- `hubsApi.getAll()` - Get all hubs/projects
- `hubsApi.getById(id)` - Get single project
- `hubsApi.create(data)` - Create new project

### New (Role-Based)
Project-specific API calls through `projects/services/projectProxyApi.ts`:
- Uses local mock data for development
- Easy to replace with real API calls later
- Includes role detection, member management, join requests

## Next Steps

1. Implement proxy API with mock data
2. Build role-aware components
3. Update ProjectPage to use role-based system
4. Add member management and join request workflows
5. Replace proxy API with real backend calls