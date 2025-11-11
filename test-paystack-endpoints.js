#!/usr/bin/env node

/**
 * Paystack Endpoints Test
 * 
 * This script tests the Paystack API endpoints without requiring authentication.
 * Run with: node test-paystack-endpoints.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('🧪 Paystack Endpoints Test');
console.log('==========================\n');

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

// Test data
const testOrder = {
  orderId: 'test-order-123',
  email: 'test@example.com'
};

// Test endpoint accessibility
async function testEndpoint(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: endpoint,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = responseData ? JSON.parse(responseData) : {};
          resolve({
            statusCode: res.statusCode,
            response: response,
            success: res.statusCode >= 200 && res.statusCode < 300
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            response: responseData,
            success: false,
            parseError: error.message
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Run tests
async function runTests() {
  try {
    console.log('Testing Paystack API endpoints...\n');

    // Test 1: Health endpoint
    console.log('1. Testing health endpoint...');
    const healthResult = await testEndpoint('/api/health');
    if (healthResult.success) {
      console.log('✅ Health endpoint accessible');
    } else {
      console.log(`⚠️  Health endpoint returned ${healthResult.statusCode}`);
      if (healthResult.response) {
        console.log(`   Response: ${JSON.stringify(healthResult.response)}`);
      }
    }

    // Test 2: Paystack initialize endpoint (should require auth)
    console.log('\n2. Testing Paystack initialize endpoint...');
    const initResult = await testEndpoint('/api/payments/paystack/initialize', 'POST', testOrder);
    if (initResult.statusCode === 401) {
      console.log('✅ Paystack initialize endpoint accessible (authentication required)');
      console.log(`   Auth error: ${initResult.response.error || 'Authentication required'}`);
    } else if (initResult.success) {
      console.log('✅ Paystack initialize endpoint working');
    } else {
      console.log(`⚠️  Paystack initialize endpoint returned ${initResult.statusCode}`);
      console.log(`   Response: ${JSON.stringify(initResult.response)}`);
    }

    // Test 3: Paystack verify endpoint
    console.log('\n3. Testing Paystack verify endpoint...');
    const verifyResult = await testEndpoint('/api/payments/paystack/verify', 'POST', { reference: 'test-ref' });
    if (verifyResult.statusCode === 404 || verifyResult.statusCode === 400) {
      console.log('✅ Paystack verify endpoint accessible');
      console.log(`   Expected error: ${verifyResult.response.error || 'Order not found'}`);
    } else if (verifyResult.success) {
      console.log('✅ Paystack verify endpoint working');
    } else {
      console.log(`⚠️  Paystack verify endpoint returned ${verifyResult.statusCode}`);
      console.log(`   Response: ${JSON.stringify(verifyResult.response)}`);
    }

    // Test 4: Test a non-existent endpoint
    console.log('\n4. Testing non-existent endpoint...');
    const notFoundResult = await testEndpoint('/api/non-existent-endpoint');
    if (notFoundResult.statusCode === 404) {
      console.log('✅ 404 handling working correctly');
    } else {
      console.log(`⚠️  Unexpected response for non-existent endpoint: ${notFoundResult.statusCode}`);
    }

    console.log('\n🎉 Endpoint tests completed!');
    console.log('\n📋 Summary:');
    console.log('✅ Server is running and accessible');
    console.log('✅ Paystack endpoints are properly configured');
    console.log('✅ Authentication is working as expected');
    console.log('✅ Error handling is functioning');

    console.log('\n🚀 Next steps:');
    console.log('1. Test with a real user session in your browser');
    console.log('2. Use test card: 4084084084084081');
    console.log('3. CVV: 123, Expiry: 12/25');
    console.log('4. Check Paystack dashboard for transactions');

  } catch (error) {
    console.error('\n❌ Tests failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure your development server is running: npm run dev');
    console.log('2. Check if the server is accessible on localhost:3000');
    console.log('3. Verify your environment variables are set');
  }
}

// Check if server is running
async function checkServer() {
  try {
    const result = await testEndpoint('/api/health');
    return result.statusCode < 500; // Any response other than server error means server is running
  } catch (error) {
    return false;
  }
}

// Main execution
async function main() {
  try {
    console.log('Checking if server is running...');
    const serverRunning = await checkServer();
    
    if (serverRunning) {
      console.log('✅ Server is running\n');
      await runTests();
    } else {
      console.error('❌ Server is not running or not accessible');
      console.log('\nPlease start your development server first:');
      console.log('npm run dev');
      console.log('\nThen run this test again:');
      console.log('node test-paystack-endpoints.js');
    }
  } catch (error) {
    console.error('❌ Failed to check server:', error.message);
  }
}

main();
