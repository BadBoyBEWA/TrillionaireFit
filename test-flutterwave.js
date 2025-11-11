#!/usr/bin/env node

/**
 * Flutterwave API Test Script
 * 
 * This script tests the Flutterwave integration endpoints
 * Run with: node test-flutterwave.js
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = 'test@example.com';
const TEST_PHONE = '08012345678';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function testServerHealth() {
  log('\n🔍 Testing Server Health...', 'blue');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/health`);
    if (response.status === 200) {
      log('✅ Server is running', 'green');
      return true;
    } else {
      log('❌ Server health check failed', 'red');
      return false;
    }
  } catch (error) {
    log('❌ Server is not running or not accessible', 'red');
    log(`Error: ${error.message}`, 'red');
    return false;
  }
}

async function testFlutterwaveVerification() {
  log('\n🔍 Testing Flutterwave Verification Endpoint...', 'blue');
  
  try {
    // Test with a fake transaction ID
    const response = await makeRequest(`${BASE_URL}/api/verify`, {
      method: 'POST',
      body: { transaction_id: 'test_transaction_123' }
    });
    
    log(`Status: ${response.status}`, response.status === 200 ? 'green' : 'yellow');
    log(`Response: ${JSON.stringify(response.data, null, 2)}`, 'yellow');
    
    if (response.status === 500 && response.data.error?.includes('FLW_SECRET_KEY')) {
      log('⚠️  Flutterwave secret key not configured', 'yellow');
    }
    
    return response;
  } catch (error) {
    log(`❌ Error testing verification: ${error.message}`, 'red');
    return null;
  }
}

async function testEnvironmentVariables() {
  log('\n🔍 Testing Environment Variables...', 'blue');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/debug-env`);
    log(`Status: ${response.status}`, response.status === 200 ? 'green' : 'yellow');
    log(`Response: ${JSON.stringify(response.data, null, 2)}`, 'yellow');
    return response;
  } catch (error) {
    log(`❌ Error testing environment: ${error.message}`, 'red');
    return null;
  }
}

async function testOrderCreation() {
  log('\n🔍 Testing Order Creation with Flutterwave...', 'blue');
  
  const orderData = {
    items: [
      {
        productId: '507f1f77bcf86cd799439011', // Fake product ID
        quantity: 1,
        price: 5000
      }
    ],
    shippingAddress: {
      firstName: 'Test',
      lastName: 'User',
      email: TEST_EMAIL,
      phone: TEST_PHONE,
      address: '123 Test Street',
      city: 'Lagos',
      state: 'Lagos',
      country: 'Nigeria',
      postalCode: '100001'
    },
    paymentMethod: 'flutterwave',
    notes: 'Test order for Flutterwave integration'
  };
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/orders`, {
      method: 'POST',
      body: orderData
    });
    
    log(`Status: ${response.status}`, response.status === 200 ? 'green' : 'red');
    log(`Response: ${JSON.stringify(response.data, null, 2)}`, 'yellow');
    
    if (response.status === 200) {
      log('✅ Order created successfully with Flutterwave payment method', 'green');
      return response.data.order;
    } else {
      log('❌ Order creation failed', 'red');
      return null;
    }
  } catch (error) {
    log(`❌ Error creating order: ${error.message}`, 'red');
    return null;
  }
}

async function testFlutterwavePackages() {
  log('\n🔍 Testing Flutterwave Package Installation...', 'blue');
  
  try {
    // Try to require the packages
    const flutterwaveReact = require('flutterwave-react-v3');
    const flutterwaveNode = require('flutterwave-node-v3');
    
    log('✅ flutterwave-react-v3 is installed', 'green');
    log('✅ flutterwave-node-v3 is installed', 'green');
    return true;
  } catch (error) {
    log('❌ Flutterwave packages not installed', 'red');
    log(`Error: ${error.message}`, 'red');
    log('\nTo install packages, run:', 'yellow');
    log('npm install flutterwave-react-v3 flutterwave-node-v3', 'yellow');
    return false;
  }
}

async function runAllTests() {
  log('🚀 Starting Flutterwave Integration Tests...', 'bold');
  log('=' .repeat(50), 'blue');
  
  const results = {
    serverHealth: false,
    packages: false,
    environment: false,
    verification: false,
    orderCreation: false
  };
  
  // Test 1: Server Health
  results.serverHealth = await testServerHealth();
  
  // Test 2: Package Installation
  results.packages = await testFlutterwavePackages();
  
  // Test 3: Environment Variables
  if (results.serverHealth) {
    results.environment = await testEnvironmentVariables();
  }
  
  // Test 4: Flutterwave Verification
  if (results.serverHealth) {
    results.verification = await testFlutterwaveVerification();
  }
  
  // Test 5: Order Creation
  if (results.serverHealth) {
    results.orderCreation = await testOrderCreation();
  }
  
  // Summary
  log('\n📊 Test Results Summary:', 'bold');
  log('=' .repeat(30), 'blue');
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅' : '❌';
    const color = passed ? 'green' : 'red';
    log(`${status} ${test}: ${passed ? 'PASSED' : 'FAILED'}`, color);
  });
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`, 
      passedTests === totalTests ? 'green' : 'yellow');
  
  if (passedTests < totalTests) {
    log('\n💡 Next Steps:', 'yellow');
    if (!results.serverHealth) {
      log('1. Start your Next.js server: npm run dev', 'yellow');
    }
    if (!results.packages) {
      log('2. Install Flutterwave packages: npm install flutterwave-react-v3 flutterwave-node-v3', 'yellow');
    }
    if (!results.environment) {
      log('3. Configure environment variables in .env.local', 'yellow');
    }
  } else {
    log('\n🎉 All tests passed! Flutterwave integration is ready!', 'green');
  }
}

// Run tests
runAllTests().catch(console.error);
