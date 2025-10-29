# Hubs Module - Projects & Clubs

This folder contains all the functionality for the Hubs feature (Projects and Clubs).

## Structure

```
hubs/
├── HubsPage.tsx           - Main page with tabs (Projects/Clubs/My Hubs)
├── ProjectPage.tsx        - Individual project detail page
├── ProjectCard.tsx        - Project card component for grid view
├── CreateProjectModal.tsx - Modal for creating new projects
├── index.ts               - Exports for easy importing
└── README.md              - This file
```

## Features Implemented

### ✅ Projects
- **Browse Projects**: Grid view with filtering by specialization and year
- **Create Project**: Modal form with all project details
- **View Project**: Full project page with description, team members, stats
- **Search & Filter**: Real-time search and filter by specialization/year
- **Backend Integration**: All data comes from API, no frontend mock data

### 🚧 Clubs (Coming Soon)
- Club browsing
- Club profile pages
- Join/Leave functionality
- Member management

## Routing

Uses query parameters to avoid modifying App.tsx:
- `/hubs` - Main hubs page
- `/hubs?view=project&id=123` - Project detail page

## API Integration

All API calls go through `frontend/src/services/api.ts`:
- `hubsApi.getAll()` - Get all hubs/projects
- `hubsApi.getById(id)` - Get single project
- `hubsApi.create(data)` - Create new project
- `hubsApi.getMembers(id)` - Get project members
- `hubsApi.addMember(id, data)` - Add member to project
- `hubsApi.removeMember(id, data)` - Remove member from project

## Backend Requirements

Expects these endpoints:
- `GET /hubs` - List all hubs
- `GET /hubs?type=Project` - Filter by type
- `GET /hubs/:id` - Get single hub
- `POST /hubs` - Create hub
- `PUT /hubs/:id` - Update hub
- `DELETE /hubs/:id` - Delete hub
- `GET /hubs/:id/members` - Get members
- `POST /hubs/:id/members` - Add member
- `DELETE /hubs/:id/members` - Remove member

## To Delete This Module

If you need to remove this feature:
1. Delete the entire `frontend/src/pages/hubs/` folder
2. Restore the original `frontend/src/pages/Hubs.tsx` from git
3. No other files were modified (except api.ts for member methods)

## Next Steps

1. Implement Clubs functionality (similar to Projects)
2. Add "My Hubs" tab to show user's created/joined hubs
3. Add edit project functionality
4. Add project activity feed
5. Add file/resource sharing within projects
