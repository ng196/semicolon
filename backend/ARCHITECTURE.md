# CampusHub Backend Architecture

## Layer Structure

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (Vue.js)                    │
│                  HTTP Requests (Fetch API)               │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                   Routes (Express)                       │
│  /events, /marketplace, /hubs, /requests, /rsvps        │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                  Middleware (Auth)                       │
│         JWT Verification, User Context                   │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                Controllers (Business Logic)              │
│  - Validate request data                                 │
│  - Check permissions                                     │
│  - Call model functions                                  │
│  - Format responses                                      │
│  - Log operations                                        │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                  Models (Data Layer)                     │
│  - users.ts      - User CRUD operations                 │
│  - hubs.ts       - Hub & membership operations          │
│  - events.ts     - Event operations                     │
│  - marketplace.ts - Marketplace operations              │
│  - requests.ts   - Request operations                   │
│  - rsvps.ts      - RSVP operations                      │
│  - clubs.ts      - Club-specific operations             │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                Database Connection (db.ts)               │
│  - SQLite connection with better-sqlite3                │
│  - WAL mode enabled                                      │
│  - Query logging                                         │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│              SQLite Database (campushub.db)              │
│  Tables: users, hubs, events, marketplace_items, etc.   │
└─────────────────────────────────────────────────────────┘
```

## Request Flow Example

### Creating a Marketplace Item

```
1. Frontend
   POST /marketplace
   Body: { title, description, price, ... }
   
2. Route
   routes/marketplace.ts → marketplaceController.createItem()
   
3. Middleware
   authMiddleware → Extracts user from JWT token
   
4. Controller (controllers/marketplace.ts)
   - Logs request
   - Validates seller_id
   - Fetches seller info: model.getUser(seller_id)
   - Creates item: model.createMarketplaceItem(data)
   - Logs success
   - Returns response
   
5. Model (models/marketplace.ts)
   - Prepares SQL statement
   - Executes INSERT query
   - Returns result with ID
   
6. Database (db.ts)
   - Logs SQL query
   - Executes on SQLite
   - Returns result
   
7. Response
   { id: 7, message: 'Item created successfully' }
```

## File Organization

```
backend/
├── src/
│   ├── controllers/        # HTTP request handlers
│   │   ├── events.ts
│   │   ├── marketplace.ts
│   │   ├── requests.ts
│   │   ├── rsvps.ts
│   │   ├── hubs.ts
│   │   ├── clubs.ts
│   │   └── users.ts
│   │
│   ├── models/            # Database queries
│   │   ├── index.ts       # Exports all models
│   │   ├── events.ts
│   │   ├── marketplace.ts
│   │   ├── requests.ts
│   │   ├── rsvps.ts
│   │   ├── hubs.ts
│   │   ├── clubs.ts
│   │   └── users.ts
│   │
│   ├── routes/            # Route definitions
│   │   ├── auth.ts
│   │   ├── events.ts
│   │   ├── marketplace.ts
│   │   ├── requests.ts
│   │   ├── rsvps.ts
│   │   ├── hubs.ts
│   │   ├── clubs.ts
│   │   └── users.ts
│   │
│   ├── middleware/        # Auth & validation
│   │   └── auth.ts
│   │
│   ├── database/          # Schema & migrations
│   │   └── schema.sql
│   │
│   ├── db.ts             # Database connection
│   └── seed.ts           # Seed data
│
├── database/             # SQLite database files
│   └── campushub.db
│
├── server.ts            # Express app entry point
├── check-db.js          # Database health check
└── package.json
```

## Design Principles

### 1. Separation of Concerns
- **Routes**: Define endpoints
- **Middleware**: Handle auth & validation
- **Controllers**: Business logic & orchestration
- **Models**: Database operations only
- **Database**: Connection & configuration

### 2. Single Responsibility
Each model file handles one domain:
- `users.ts` → User operations
- `events.ts` → Event operations
- `marketplace.ts` → Marketplace operations

### 3. DRY (Don't Repeat Yourself)
- Reusable model functions
- Centralized database connection
- Shared middleware

### 4. Easy to Test
```typescript
// Mock the model layer
import * as model from '../models/index.js';
jest.mock('../models/index.js');

// Test controller without hitting database
model.getMarketplaceItem.mockReturnValue({ id: 1, title: 'Test' });
```

### 5. Easy to Migrate
To switch from SQLite to PostgreSQL:
- Update `db.ts` connection
- Update model files (change `?` to `$1, $2`)
- Controllers remain unchanged

## Logging Strategy

### Database Connection (db.ts)
```
🗄️  Database Configuration:
   Working Directory: /path/to/backend
   Database Path: /path/to/database/campushub.db
   Database Size: 123.45 KB
   Journal Mode: wal
```

### SQL Queries (db.ts)
```
[2025-10-24T...] 📝 SQL: INSERT INTO marketplace_items...
```

### Controller Operations
```
[2025-10-24T...] 🛒 CREATE Marketplace Item Request: {...}
[2025-10-24T...] 🔍 Fetching seller info for seller_id: 1
[2025-10-24T...] ✅ Seller found: John Doe
[2025-10-24T...] ✅ Marketplace item created with ID: 7
[2025-10-24T...] 📊 Changes: 1
```

## Benefits of This Architecture

✅ **Modular** - Easy to find and modify code  
✅ **Testable** - Each layer can be tested independently  
✅ **Maintainable** - Clear structure and responsibilities  
✅ **Scalable** - Easy to add new features  
✅ **Debuggable** - Comprehensive logging at each layer  
✅ **Portable** - Easy to switch databases  
✅ **Type-safe** - TypeScript throughout  
