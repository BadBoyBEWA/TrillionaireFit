#!/usr/bin/env node

/**
 * Paystack Integration Test Script
 * 
 * This script tests the Paystack payment integration to ensure everything is working correctly.
 * Run with: node test-paystack.js
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          process.env[key.trim()] = value;
        }
      }
    });
  }
}

// Load environment variables
loadEnvFile();

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY;

// Test data
const testOrder = {
  orderId: 'test-order-123',
  email: 'test@example.com'
};

console.log('🧪 Paystack Integration Test');
console.log('==========================\n');

// Check environment variables
console.log('1. Checking environment variables...');
if (!PAYSTACK_SECRET_KEY) {
  console.error('❌ PAYSTACK_SECRET_KEY not found in environment variables');
  console.log('   Please add PAYSTACK_SECRET_KEY to your .env.local file');
  process.exit(1);
}
if (!PAYSTACK_PUBLIC_KEY) {
  console.error('❌ PAYSTACK_PUBLIC_KEY not found in environment variables');
  console.log('   Please add PAYSTACK_PUBLIC_KEY to your .env.local file');
  process.exit(1);
}
console.log('✅ Environment variables found');
console.log(`   Secret Key: ${PAYSTACK_SECRET_KEY.substring(0, 12)}...`);
console.log(`   Public Key: ${PAYSTACK_PUBLIC_KEY.substring(0, 12)}...\n`);

// Test Paystack library
console.log('2. Testing Paystack library...');
try {
  // Check if the Paystack library file exists
  const paystackPath = path.join(__dirname, 'src/lib/paystack.ts');
  if (fs.existsSync(paystackPath)) {
    console.log('✅ Paystack library file exists');
    
    // Read the file content to verify it has the expected functions
    const paystackContent = fs.readFileSync(paystackPath, 'utf8');
    if (paystackContent.includes('initializePaystackTransaction') && 
        paystackContent.includes('verifyPaystackTransaction')) {
      console.log('✅ Paystack library contains required functions\n');
    } else {
      console.log('❌ Paystack library missing required functions\n');
    }
  } else {
    console.log('❌ Paystack library file not found\n');
  }
} catch (error) {
  console.error('❌ Failed to check Paystack library:', error.message);
}

// Test API endpoints
console.log('3. Testing API endpoints...');

// Test Paystack initialization
async function testPaystackInitialize() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(testOrder);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/payments/paystack/initialize',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
        // Note: No authentication cookie - this will test the auth error handling
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (res.statusCode === 200 && response.paymentUrl) {
            console.log('✅ Paystack initialization successful');
            console.log(`   Payment URL: ${response.paymentUrl.substring(0, 50)}...`);
            console.log(`   Reference: ${response.reference}`);
            resolve(response);
          } else if (res.statusCode === 401) {
            console.log('✅ Paystack initialization endpoint accessible (authentication required)');
            console.log(`   Expected auth error: ${response.error}`);
            resolve({ authRequired: true, error: response.error });
          } else {
            console.error('❌ Paystack initialization failed:', response.error);
            reject(new Error(response.error));
          }
        } catch (error) {
          console.error('❌ Failed to parse response:', error.message);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request failed:', error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Test Paystack verification
async function testPaystackVerify() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      reference: 'test-reference-123'
    });
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/payments/paystack/verify',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (res.statusCode === 200) {
            console.log('✅ Paystack verification endpoint accessible');
            console.log(`   Response: ${response.message || 'OK'}`);
            resolve(response);
          } else if (res.statusCode === 404) {
            console.log('✅ Paystack verification endpoint accessible (order not found - expected)');
            console.log(`   Expected error: ${response.error}`);
            resolve({ orderNotFound: true, error: response.error });
          } else {
            console.error('❌ Paystack verification failed:', response.error);
            reject(new Error(response.error));
          }
        } catch (error) {
          console.error('❌ Failed to parse response:', error.message);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request failed:', error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Test health endpoint
async function testHealthEndpoint() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/health',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Health endpoint accessible');
          resolve(true);
        } else {
          console.error('❌ Health endpoint failed:', res.statusCode);
          reject(new Error(`Health check failed: ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Health check request failed:', error.message);
      reject(error);
    });

    req.end();
  });
}

// Run tests
async function runTests() {
  try {
    console.log('Testing health endpoint...');
    await testHealthEndpoint();
    
    console.log('\nTesting Paystack initialization...');
    const initResult = await testPaystackInitialize();
    if (initResult.authRequired) {
      console.log('   Note: Authentication required for full payment initialization');
    }
    
    console.log('\nTesting Paystack verification...');
    const verifyResult = await testPaystackVerify();
    if (verifyResult.orderNotFound) {
      console.log('   Note: Order not found is expected for test reference');
    }
    
    console.log('\n🎉 All tests passed!');
    console.log('\nNext steps:');
    console.log('1. Start your development server: npm run dev');
    console.log('2. Test the payment flow in your browser');
    console.log('3. Use test card: 4084084084084081');
    console.log('4. CVV: 123, Expiry: 12/25');
    console.log('5. Check Paystack dashboard for transactions');
    
  } catch (error) {
    console.error('\n❌ Tests failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure your development server is running');
    console.log('2. Check your environment variables');
    console.log('3. Verify Paystack keys are correct');
    console.log('4. Check server logs for detailed errors');
  }
}

// Check if server is running
function checkServer() {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/health',
      method: 'GET'
    }, (res) => {
      resolve(res.statusCode === 200);
    });
    
    req.on('error', () => {
      reject(false);
    });
    
    req.end();
  });
}

// Main execution
async function main() {
  try {
    console.log('Checking if server is running...');
    await checkServer();
    console.log('✅ Server is running\n');
    await runTests();
  } catch (error) {
    console.error('❌ Server is not running or not accessible');
    console.log('\nPlease start your development server first:');
    console.log('npm run dev');
    console.log('\nThen run this test again:');
    console.log('node test-paystack.js');
  }
}

main();
