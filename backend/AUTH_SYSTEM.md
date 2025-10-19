# 🔐 CampusHub Authentication System

## ✅ Implementation Complete!

A **lean, working JWT authentication system** with in-memory token whitelist.

## 🎯 What's Implemented

### **Backend Routes:**

#### **POST /auth/login**
```json
Request:
{
  "email": "user@campus.edu",
  "password": "password123",
  "remember": true
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@campus.edu",
    "username": "user",
    "name": "User Name",
    ...
  }
}
```

#### **POST /auth/signup**
```json
Request:
{
  "email": "newuser@campus.edu",
  "password": "securepass123",
  "username": "newuser",
  "name": "New User"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

#### **POST /auth/logout**
```
Headers: Authorization: Bearer <token>
Response: { "message": "Logged out successfully" }
```

#### **GET /auth/validate**
```
Headers: Authorization: Bearer <token>
Response: { "valid": true, "user": { "userId": 1, "email": "..." } }
```

#### **GET /auth/profile**
```
Headers: Authorization: Bearer <token>
Response: { user profile data }
```

#### **PUT /auth/profile**
```
Headers: Authorization: Bearer <token>
Body: { "name": "Updated Name", "specialization": "CS", ... }
Response: { updated user data }
```

#### **GET /auth/stats** (Debug)
```
Response: { "totalTokens": 3, "tokens": [...] }
```

## 🔧 How It Works

### **Token Flow:**

1. **Login** → Server validates credentials → Generates JWT → Adds to whitelist → Returns token
2. **Request** → Client sends `Authorization: Bearer <token>` → Server checks whitelist + verifies signature → Allows/denies
3. **Logout** → Server removes token from whitelist → Client clears localStorage

### **Security Features:**

✅ **Password hashing** with bcrypt (10 rounds)
✅ **JWT signature** verification
✅ **Token whitelist** (in-memory Map)
✅ **30-minute expiration**
✅ **Auto-cleanup** of expired tokens (every 5 min)
✅ **401 on invalid/expired tokens**

### **Token Structure:**

```json
{
  "userId": 1,
  "email": "user@campus.edu",
  "jti": "1-1234567890-abc123",
  "iat": 1234567890,
  "exp": 1234569690
}
```

## 🧪 Testing

### **1. Create a test user:**

```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@campus.edu",
    "password": "password123",
    "name": "Test User"
  }'
```

### **2. Login:**

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@campus.edu",
    "password": "password123"
  }'
```

Save the token from response!

### **3. Access protected endpoint:**

```bash
curl http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### **4. Check whitelist stats:**

```bash
curl http://localhost:3000/auth/stats
```

### **5. Logout:**

```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🔒 Protecting Routes

To protect any route, add the `authMiddleware`:

```typescript
import { authMiddleware } from './middleware/auth.js';

// Protect entire router
router.use(authMiddleware);

// Or protect specific routes
router.get('/protected', authMiddleware, (req, res) => {
  // req.user contains { userId, email, jti, iat, exp }
  res.json({ message: `Hello ${req.user!.email}` });
});
```

## 📊 Whitelist Management

### **In-Memory Structure:**
```typescript
Map<tokenId, {
  userId: number,
  email: string,
  issuedAt: number,
  expiresAt: number
}>
```

### **Automatic Cleanup:**
- Runs every 5 minutes
- Removes expired tokens
- Logs cleanup count

### **Manual Operations:**
```typescript
import { revokeToken, isTokenActive, cleanupExpiredTokens } from './middleware/auth.js';

// Revoke specific token
revokeToken('token-jti-here');

// Check if token is active
const active = isTokenActive('token-jti-here');

// Manual cleanup
const cleaned = cleanupExpiredTokens();
```

## 🎯 Frontend Integration

Your frontend `ApiClient` already handles everything:

```typescript
// Login
const response = await authApi.login({ email, password });
localStorage.setItem('auth_token', response.token);
localStorage.setItem('user_data', JSON.stringify(response.user));

// All subsequent requests automatically include:
// Authorization: Bearer <token>

// On 401 response:
// - Token removed from localStorage
// - User redirected to /auth/login
```

## ⚙️ Configuration

### **Environment Variables:**
```bash
JWT_SECRET=your-secret-key-here  # Default: 'campus-hub-secret-key-change-in-production'
PORT=3000
```

### **Token Settings:**
```typescript
// In middleware/auth.ts
const TOKEN_EXPIRY = '30m';  // Change to '1h', '2h', etc.
const SALT_ROUNDS = 10;      // bcrypt rounds
```

## 🐛 Troubleshooting

### **"No token provided"**
- Check `Authorization` header format: `Bearer <token>`
- Ensure token is being sent from frontend

### **"Invalid or expired token"**
- Token may have expired (30 min)
- Token may have been revoked (logout)
- Check token in whitelist: `GET /auth/stats`

### **"Email already registered"**
- User exists, use login instead
- Or use different email

### **Server restart = all users logged out**
- Expected behavior (in-memory whitelist)
- Users need to login again
- Later: Add Redis for persistence

## 📈 Next Steps (Optional)

1. **Add Redis** for persistent whitelist
2. **Add refresh tokens** for longer sessions
3. **Add rate limiting** on login endpoint
4. **Add email verification** flow
5. **Add password reset** functionality
6. **Add HTTPS** in production
7. **Add session management** (multiple devices)

## 🎉 Status

**✅ WORKING** - Full JWT auth with whitelist, ready for production demo!

Test it now:
```bash
cd backend
npm run dev
```

Then test with the curl commands above or 