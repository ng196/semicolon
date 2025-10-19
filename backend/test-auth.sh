#!/bin/bash

# CampusHub Auth System Test Script
# Tests the complete authentication flow

API_URL="http://localhost:3000"
EMAIL="test@campus.edu"
PASSWORD="password123"

echo "🧪 Testing CampusHub Authentication System"
echo "=========================================="
echo ""

# Test 1: Signup
echo "1️⃣  Testing Signup..."
SIGNUP_RESPONSE=$(curl -s -X POST "$API_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"name\":\"Test User\"}")

if echo "$SIGNUP_RESPONSE" | grep -q "token"; then
  echo "✅ Signup successful!"
  TOKEN=$(echo "$SIGNUP_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
  echo "   Token: ${TOKEN:0:50}..."
else
  echo "⚠️  Signup failed (user may already exist)"
fi

echo ""

# Test 2: Login
echo "2️⃣  Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
  echo "✅ Login successful!"
  TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
  echo "   Token: ${TOKEN:0:50}..."
else
  echo "❌ Login failed!"
  echo "   Response: $LOGIN_RESPONSE"
  exit 1
fi

echo ""

# Test 3: Validate Token
echo "3️⃣  Testing Token Validation..."
VALIDATE_RESPONSE=$(curl -s "$API_URL/auth/validate" \
  -H "Authorization: Bearer $TOKEN")

if echo "$VALIDATE_RESPONSE" | grep -q "valid"; then
  echo "✅ Token validation successful!"
else
  echo "❌ Token validation failed!"
  echo "   Response: $VALIDATE_RESPONSE"
fi

echo ""

# Test 4: Get Profile
echo "4️⃣  Testing Get Profile..."
PROFILE_RESPONSE=$(curl -s "$API_URL/auth/profile" \
  -H "Authorization: Bearer $TOKEN")

if echo "$PROFILE_RESPONSE" | grep -q "email"; then
  echo "✅ Profile fetch successful!"
  echo "   Email: $(echo "$PROFILE_RESPONSE" | grep -o '"email":"[^"]*' | cut -d'"' -f4)"
else
  echo "❌ Profile fetch failed!"
  echo "   Response: $PROFILE_RESPONSE"
fi

echo ""

# Test 5: Check Whitelist Stats
echo "5️⃣  Testing Whitelist Stats..."
STATS_RESPONSE=$(curl -s "$API_URL/auth/stats")

if echo "$STATS_RESPONSE" | grep -q "totalTokens"; then
  TOTAL=$(echo "$STATS_RESPONSE" | grep -o '"totalTokens":[0-9]*' | cut -d':' -f2)
  echo "✅ Whitelist stats retrieved!"
  echo "   Active tokens: $TOTAL"
else
  echo "❌ Stats fetch failed!"
fi

echo ""

# Test 6: Logout
echo "6️⃣  Testing Logout..."
LOGOUT_RESPONSE=$(curl -s -X POST "$API_URL/auth/logout" \
  -H "Authorization: Bearer $TOKEN")

if echo "$LOGOUT_RESPONSE" | grep -q "Logged out"; then
  echo "✅ Logout successful!"
else
  echo "❌ Logout failed!"
  echo "   Response: $LOGOUT_RESPONSE"
fi

echo ""

# Test 7: Verify Token Revoked
echo "7️⃣  Testing Token Revocation..."
REVOKED_RESPONSE=$(curl -s "$API_URL/auth/validate" \
  -H "Authorization: Bearer $TOKEN")

if echo "$REVOKED_RESPONSE" | grep -q "Invalid"; then
  echo "✅ Token successfully revoked!"
else
  echo "❌ Token still valid after logout!"
  echo "   Response: $REVOKED_RESPONSE"
fi

echo ""
echo "=========================================="
echo "🎉 Authentication System Test Complete!"
echo ""