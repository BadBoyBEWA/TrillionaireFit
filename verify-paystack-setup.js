#!/usr/bin/env node

/**
 * Paystack Setup Verification Script
 * 
 * This script verifies that the Paystack integration is properly set up.
 * Run with: node verify-paystack-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Paystack Setup Verification');
console.log('==============================\n');

// Check if required files exist
console.log('1. Checking required files...');

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

if (allFilesExist) {
  console.log('\n✅ All required files are present!');
} else {
  console.log('\n❌ Some required files are missing!');
  process.exit(1);
}

// Check if Stripe files are removed
console.log('\n2. Checking Stripe files are removed...');

const stripeFiles = [
  'src/lib/stripe.ts',
  'src/app/api/payments/stripe/create-payment-intent/route.ts',
  'src/app/api/payments/stripe/verify-payment/route.ts',
  'src/app/api/payments/stripe/checkout-session/route.ts',
  'src/app/api/payments/stripe/webhook/route.ts',
  'STRIPE_SETUP.md',
  'test-stripe.js'
];

let stripeFilesRemoved = true;

stripeFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`❌ ${file} - STILL EXISTS (should be removed)`);
    stripeFilesRemoved = false;
  } else {
    console.log(`✅ ${file} - REMOVED`);
  }
});

if (stripeFilesRemoved) {
  console.log('\n✅ All Stripe files have been removed!');
} else {
  console.log('\n❌ Some Stripe files still exist!');
}

// Check package.json for Paystack test script
console.log('\n3. Checking package.json configuration...');

try {
  const packageJsonPath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  if (packageJson.scripts && packageJson.scripts['test:paystack']) {
    console.log('✅ Paystack test script found in package.json');
  } else {
    console.log('❌ Paystack test script missing from package.json');
  }
  
  // Check for Paystack dependencies
  if (packageJson.dependencies && packageJson.dependencies['@paystack/inline-js']) {
    console.log('✅ Paystack dependency found');
  } else {
    console.log('❌ Paystack dependency missing');
  }
  
} catch (error) {
  console.log('❌ Failed to read package.json:', error.message);
}

// Check environment file
console.log('\n4. Checking environment configuration...');

const envFiles = ['.env.local', '.env', '.env.example'];

let envFileFound = false;
envFiles.forEach(envFile => {
  const envPath = path.join(__dirname, envFile);
  if (fs.existsSync(envPath)) {
    console.log(`✅ ${envFile} found`);
    envFileFound = true;
    
    // Check if it contains Paystack variables
    try {
      const envContent = fs.readFileSync(envPath, 'utf8');
      if (envContent.includes('PAYSTACK_SECRET_KEY') || envContent.includes('PAYSTACK_PUBLIC_KEY')) {
        console.log(`✅ ${envFile} contains Paystack variables`);
      } else {
        console.log(`⚠️  ${envFile} doesn't contain Paystack variables`);
      }
    } catch (error) {
      console.log(`❌ Failed to read ${envFile}:`, error.message);
    }
  }
});

if (!envFileFound) {
  console.log('⚠️  No environment file found');
}

// Summary
console.log('\n📋 Summary');
console.log('==========');

if (allFilesExist && stripeFilesRemoved) {
  console.log('🎉 Paystack integration is properly set up!');
  console.log('\nNext steps:');
  console.log('1. Add your Paystack keys to .env.local:');
  console.log('   PAYSTACK_SECRET_KEY=sk_test_...');
  console.log('   PAYSTACK_PUBLIC_KEY=pk_test_...');
  console.log('2. Start your development server: npm run dev');
  console.log('3. Test the payment flow in your browser');
  console.log('4. Use test card: 4084084084084081');
  console.log('5. Run full test: npm run test:paystack');
} else {
  console.log('❌ Paystack integration needs attention');
  console.log('\nPlease check the issues above and fix them.');
}

console.log('\n🔧 Test Commands:');
console.log('npm run test:paystack  - Run full Paystack test');
console.log('node verify-paystack-setup.js  - Run this verification');
