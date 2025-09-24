#!/bin/bash

# Flutterwave API Test Script using curl
# Run with: bash test-flutterwave-curl.sh

BASE_URL="http://localhost:3000"
TEST_EMAIL="test@example.com"
TEST_PHONE="08012345678"

echo "🚀 Testing Flutterwave Integration with curl"
echo "=============================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test 1: Server Health
echo -e "\n${BLUE}🔍 Testing Server Health...${NC}"
HEALTH_RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null "$BASE_URL/api/health")
if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Server is running${NC}"
else
    echo -e "${RED}❌ Server is not running (Status: $HEALTH_RESPONSE)${NC}"
    echo "Please start your server with: npm run dev"
    exit 1
fi

# Test 2: Environment Variables
echo -e "\n${BLUE}🔍 Testing Environment Variables...${NC}"
ENV_RESPONSE=$(curl -s "$BASE_URL/api/debug-env")
echo "Response: $ENV_RESPONSE"

# Test 3: Flutterwave Verification (should fail without real transaction)
echo -e "\n${BLUE}🔍 Testing Flutterwave Verification...${NC}"
VERIFY_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"transaction_id":"test_transaction_123"}' \
  "$BASE_URL/api/verify")
echo "Response: $VERIFY_RESPONSE"

# Test 4: Order Creation with Flutterwave
echo -e "\n${BLUE}🔍 Testing Order Creation with Flutterwave...${NC}"
ORDER_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "{
    \"items\": [
      {
        \"productId\": \"507f1f77bcf86cd799439011\",
        \"quantity\": 1,
        \"price\": 5000
      }
    ],
    \"shippingAddress\": {
      \"firstName\": \"Test\",
      \"lastName\": \"User\",
      \"email\": \"$TEST_EMAIL\",
      \"phone\": \"$TEST_PHONE\",
      \"address\": \"123 Test Street\",
      \"city\": \"Lagos\",
      \"state\": \"Lagos\",
      \"country\": \"Nigeria\",
      \"postalCode\": \"100001\"
    },
    \"paymentMethod\": \"flutterwave\",
    \"notes\": \"Test order for Flutterwave integration\"
  }" \
  "$BASE_URL/api/orders")

echo "Response: $ORDER_RESPONSE"

# Test 5: Test Payment Page
echo -e "\n${BLUE}🔍 Testing Payment Test Page...${NC}"
PAYMENT_PAGE_RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null "$BASE_URL/test-payment")
if [ "$PAYMENT_PAGE_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Payment test page is accessible${NC}"
    echo "Visit: $BASE_URL/test-payment"
else
    echo -e "${RED}❌ Payment test page not accessible (Status: $PAYMENT_PAGE_RESPONSE)${NC}"
fi

echo -e "\n${YELLOW}💡 Manual Testing Steps:${NC}"
echo "1. Visit: $BASE_URL/test-payment"
echo "2. Fill out the payment form"
echo "3. Use test card: 4187427415564246"
echo "4. Check admin panel: $BASE_URL/admin/transactions"
echo "5. Check server logs for any errors"

echo -e "\n${GREEN}🎉 Flutterwave integration test completed!${NC}"
