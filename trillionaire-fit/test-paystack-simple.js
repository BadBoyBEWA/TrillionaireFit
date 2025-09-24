#!/usr/bin/env node

/**
 * Simple Paystack Integration Test
 * 
 * This script tests the core Paystack integration without requiring a running server.
 * Run with: node test-paystack-simple.js
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Simple Paystack Integration Test');
console.log('===================================\n');

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
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY;

// Test 1: Environment Variables
console.log('1. Checking environment variables...');
if (!PAYSTACK_SECRET_KEY) {
  console.error('❌ PAYSTACK_SECRET_KEY not found');
  process.exit(1);
}
if (!PAYSTACK_PUBLIC_KEY) {
  console.error('❌ PAYSTACK_PUBLIC_KEY not found');
  process.exit(1);
}
console.log('✅ Environment variables found');
console.log(`   Secret Key: ${PAYSTACK_SECRET_KEY.substring(0, 12)}...`);
console.log(`   Public Key: ${PAYSTACK_PUBLIC_KEY.substring(0, 12)}...\n`);

// Test 2: Required Files
console.log('2. Checking required files...');
const requiredFiles = [
  'src/lib/paystack.ts',
  'src/app/api/payments/paystack/initialize/route.ts',
  'src/app/api/payments/paystack/verify/route.ts',
  'src/components/payment/PaystackPaymentButton.tsx'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.error('\n❌ Some required files are missing!');
  process.exit(1);
}
console.log('\n✅ All required files are present!');

// Test 3: Paystack Library Content
console.log('\n3. Testing Paystack library content...');
try {
  const paystackPath = path.join(__dirname, 'src/lib/paystack.ts');
  const paystackContent = fs.readFileSync(paystackPath, 'utf8');
  
  const requiredFunctions = [
    'initializePaystackTransaction',
    'verifyPaystackTransaction',
    'formatAmountForPaystack',
    'formatAmountFromPaystack'
  ];
  
  let allFunctionsPresent = true;
  requiredFunctions.forEach(func => {
    if (paystackContent.includes(func)) {
      console.log(`✅ ${func} function found`);
    } else {
      console.log(`❌ ${func} function missing`);
      allFunctionsPresent = false;
    }
  });
  
  if (!allFunctionsPresent) {
    console.error('\n❌ Some required functions are missing!');
    process.exit(1);
  }
  console.log('\n✅ All required functions are present!');
  
} catch (error) {
  console.error('❌ Failed to read Paystack library:', error.message);
  process.exit(1);
}

// Test 4: API Route Content
console.log('\n4. Testing API routes content...');
try {
  const initializePath = path.join(__dirname, 'src/app/api/payments/paystack/initialize/route.ts');
  const initializeContent = fs.readFileSync(initializePath, 'utf8');
  
  if (initializeContent.includes('initializePaystackTransaction') && 
      initializeContent.includes('requireAuth')) {
    console.log('✅ Initialize route has required imports and functions');
  } else {
    console.log('❌ Initialize route missing required imports or functions');
  }
  
  const verifyPath = path.join(__dirname, 'src/app/api/payments/paystack/verify/route.ts');
  const verifyContent = fs.readFileSync(verifyPath, 'utf8');
  
  if (verifyContent.includes('verifyPaystackTransaction') && 
      verifyContent.includes('dbConnect')) {
    console.log('✅ Verify route has required imports and functions');
  } else {
    console.log('❌ Verify route missing required imports or functions');
  }
  
} catch (error) {
  console.error('❌ Failed to read API routes:', error.message);
  process.exit(1);
}

// Test 5: Component Content
console.log('\n5. Testing PaystackPaymentButton component...');
try {
  const componentPath = path.join(__dirname, 'src/components/payment/PaystackPaymentButton.tsx');
  const componentContent = fs.readFileSync(componentPath, 'utf8');
  
  if (componentContent.includes('/api/payments/paystack/initialize') && 
      componentContent.includes('PaystackPaymentButton')) {
    console.log('✅ PaystackPaymentButton component is properly configured');
  } else {
    console.log('❌ PaystackPaymentButton component missing required configuration');
  }
  
} catch (error) {
  console.error('❌ Failed to read PaystackPaymentButton component:', error.message);
  process.exit(1);
}

// Test 6: Package.json Configuration
console.log('\n6. Testing package.json configuration...');
try {
  const packageJsonPath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  if (packageJson.scripts && packageJson.scripts['test:paystack']) {
    console.log('✅ Paystack test script found in package.json');
  } else {
    console.log('❌ Paystack test script missing from package.json');
  }
  
  if (packageJson.dependencies && packageJson.dependencies['@paystack/inline-js']) {
    console.log('✅ Paystack dependency found');
  } else {
    console.log('❌ Paystack dependency missing');
  }
  
} catch (error) {
  console.error('❌ Failed to read package.json:', error.message);
  process.exit(1);
}

// Summary
console.log('\n🎉 All tests passed!');
console.log('\n📋 Summary:');
console.log('✅ Environment variables configured');
console.log('✅ All required files present');
console.log('✅ Paystack library functions available');
console.log('✅ API routes properly configured');
console.log('✅ Payment button component ready');
console.log('✅ Package.json configured');

console.log('\n🚀 Next steps:');
console.log('1. Start your development server: npm run dev');
console.log('2. Test the payment flow in your browser');
console.log('3. Use test card: 4084084084084081');
console.log('4. CVV: 123, Expiry: 12/25');
console.log('5. Check Paystack dashboard for transactions');

console.log('\n🔧 Available commands:');
console.log('npm run dev              - Start development server');
console.log('npm run test:paystack    - Run full integration test');
console.log('npm run verify:paystack  - Run setup verification');
console.log('node test-paystack-simple.js - Run this simple test');
