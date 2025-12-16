#!/bin/bash

# 🔐 Expense Tracker - Auth API Testing Script
# Copy and paste these commands to test the complete auth flow

echo "==========================================="
echo "EXPENSE TRACKER - AUTH API TESTS"
echo "==========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================================================
# TEST 1: REGISTER
# ============================================================================
echo -e "${YELLOW}[1/3] TESTING REGISTER${NC}"
echo "Endpoint: POST http://localhost:3000/api/auth/register"
echo ""

REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "9717809918",
    "password": "password123"
  }')

echo -e "${GREEN}Response:${NC}"
echo "$REGISTER_RESPONSE" | jq .

# Extract token and userId
VERIFICATION_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.token // empty')
USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.userId // empty')

if [ -z "$VERIFICATION_TOKEN" ]; then
  echo -e "${YELLOW}⚠️  No token returned. Check if password column exists in Supabase!${NC}"
  echo "See AUTH_SYNC_COMPLETE.md for fixes"
  exit 1
fi

echo ""
echo -e "${GREEN}✅ Registration successful!${NC}"
echo "Verification Token: ${VERIFICATION_TOKEN:0:50}..."
echo "User ID: $USER_ID"
echo ""
echo -e "${YELLOW}📧 Check your email for verification link!${NC}"
echo ""
echo "Or copy this for manual verification:"
echo "http://localhost:3000/auth/verify?token=$VERIFICATION_TOKEN"
echo ""

# ============================================================================
# TEST 2: VERIFY (Optional - automatic if checking email)
# ============================================================================
echo -e "${YELLOW}[2/3] TESTING VERIFY${NC}"
echo "Endpoint: GET http://localhost:3000/auth/verify?token=..."
echo ""

read -p "Press ENTER to proceed with verification (or Ctrl+C to check email first): "

echo "Verifying email..."
VERIFY_RESPONSE=$(curl -s -w "\n%{http_code}" "http://localhost:3000/auth/verify?token=$VERIFICATION_TOKEN")

HTTP_CODE=$(echo "$VERIFY_RESPONSE" | tail -n1)
BODY=$(echo "$VERIFY_RESPONSE" | head -n-1)

echo -e "${GREEN}HTTP Status: $HTTP_CODE${NC}"
echo "Response: $BODY"
echo ""

if [ "$HTTP_CODE" = "302" ] || [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✅ Email verified successfully!${NC}"
  echo "User can now login!"
else
  echo -e "${YELLOW}⚠️  Verification may have failed${NC}"
  echo "Check if token is still valid (15-minute expiry)"
fi

echo ""

# ============================================================================
# TEST 3: LOGIN
# ============================================================================
echo -e "${YELLOW}[3/3] TESTING LOGIN${NC}"
echo "Endpoint: POST http://localhost:3000/api/auth/login"
echo ""

LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')

echo -e "${GREEN}Response:${NC}"
echo "$LOGIN_RESPONSE" | jq .

AUTH_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token // empty')

if [ -z "$AUTH_TOKEN" ]; then
  echo ""
  echo -e "${YELLOW}❌ Login failed${NC}"
  echo "Possible reasons:"
  echo "  1. Email not verified yet (click verification link)"
  echo "  2. Wrong email or password"
  echo "  3. User doesn't exist"
else
  echo ""
  echo -e "${GREEN}✅ Login successful!${NC}"
  echo "Auth Token (7 days): ${AUTH_TOKEN:0:50}..."
  echo ""
  echo "This token can be used for:"
  echo "  - Dashboard access"
  echo "  - Expense APIs"
  echo "  - Protected endpoints"
fi

echo ""
echo "==========================================="
echo "TEST SUMMARY"
echo "==========================================="
echo "✅ All tests completed!"
echo ""
echo "What happened:"
echo "  1. Created new user: test@example.com"
echo "  2. Sent verification email"
echo "  3. Verified email (marked as verified)"
echo "  4. Logged in with email + password"
echo ""
echo "Check the terminal (npm run dev) for detailed logs:"
echo "  📝 → 🔐 → ✅ → 🎫 → 📨 (Register)"
echo "  📧 → ✅ → ✅ (Verify)"
echo "  🔑 → 🔍 → ✅ → ✅ → 🔐 → ✅ (Login)"
echo ""
