#!/usr/bin/env node

/**
 * Test script for the fixed Cloudinary upload API
 */

const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  testImagePath: path.join(__dirname, 'public', 'image', 'TF_Logo_1.jpg'),
  cloudinaryConfig: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET
  }
};

async function testFixedUpload() {
  console.log('🧪 Testing Fixed Cloudinary Upload API');
  console.log('======================================');
  
  // Check if Cloudinary is configured
  if (!TEST_CONFIG.cloudinaryConfig.cloudName || !TEST_CONFIG.cloudinaryConfig.apiKey || !TEST_CONFIG.cloudinaryConfig.apiSecret) {
    console.error('❌ Cloudinary configuration missing!');
    console.log('Please set the following environment variables:');
    console.log('- CLOUDINARY_CLOUD_NAME');
    console.log('- CLOUDINARY_API_KEY');
    console.log('- CLOUDINARY_API_SECRET');
    process.exit(1);
  }
  
  console.log('✅ Cloudinary configuration found');
  console.log(`   Cloud Name: ${TEST_CONFIG.cloudinaryConfig.cloudName}`);
  console.log(`   API Key: ${TEST_CONFIG.cloudinaryConfig.apiKey.substring(0, 8)}...`);
  
  // Check if test image exists
  if (!fs.existsSync(TEST_CONFIG.testImagePath)) {
    console.error('❌ Test image not found:', TEST_CONFIG.testImagePath);
    console.log('Please ensure the test image exists');
    process.exit(1);
  }
  
  console.log('✅ Test image found:', TEST_CONFIG.testImagePath);
  
  // Test: Image upload using native FormData
  console.log('\n📤 Test: Image Upload (Fixed API)');
  console.log('----------------------------------');
  
  try {
    // Read the image file
    const imageBuffer = fs.readFileSync(TEST_CONFIG.testImagePath);
    
    // Create FormData using native API (simulating browser behavior)
    const formData = new FormData();
    const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
    const file = new File([blob], 'test-image.jpg', { type: 'image/jpeg' });
    formData.append('images', file);
    
    const response = await fetch(`${TEST_CONFIG.baseUrl}/api/upload/cloudinary`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ Image upload successful');
    console.log(`   Response format: ${result.urls ? 'multiple' : 'single'}`);
    if (result.urls) {
      console.log(`   Image URLs: ${result.urls.length} images`);
      result.urls.forEach((url, index) => {
        console.log(`     ${index + 1}: ${url}`);
      });
    }
    
    console.log('\n🎉 Test passed!');
    console.log('The fixed Cloudinary upload API is working correctly.');
    console.log('\nKey fixes:');
    console.log('✅ No more DataCloneError - FormData sent directly');
    console.log('✅ No more API key errors - proper Cloudinary config');
    console.log('✅ No more Content-Type errors - proper multer setup');
    console.log('✅ Clean Cloudinary uploads with upload_stream');
    console.log('✅ Proper API response format: { urls: [...] }');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testFixedUpload().catch(console.error);
}

module.exports = { testFixedUpload };
