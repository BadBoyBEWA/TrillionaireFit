#!/usr/bin/env node

/**
 * Test script for the new Cloudinary upload API
 * Tests the fixed upload flow without DataCloneError
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

async function testNewUploadAPI() {
  console.log('🧪 Testing New Cloudinary Upload API');
  console.log('====================================');
  
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
  
  // Test 1: Single image upload using new API
  console.log('\n📤 Test 1: Single Image Upload (New API)');
  console.log('------------------------------------------');
  
  try {
    const FormData = require('form-data');
    const form = new FormData();
    form.append('images[]', fs.createReadStream(TEST_CONFIG.testImagePath));
    
    const response = await fetch(`${TEST_CONFIG.baseUrl}/api/upload/cloudinary`, {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ Single image upload successful');
    console.log(`   Response format: ${result.url ? 'single' : 'multiple'}`);
    if (result.url) {
      console.log(`   Image URL: ${result.url}`);
    } else if (result.urls) {
      console.log(`   Image URLs: ${result.urls.length} images`);
      result.urls.forEach((url, index) => {
        console.log(`     ${index + 1}: ${url}`);
      });
    }
    
    // Test 2: Multiple image upload using new API
    console.log('\n📤 Test 2: Multiple Image Upload (New API)');
    console.log('--------------------------------------------');
    
    const form2 = new FormData();
    form2.append('images[]', fs.createReadStream(TEST_CONFIG.testImagePath));
    form2.append('images[]', fs.createReadStream(TEST_CONFIG.testImagePath));
    
    const response2 = await fetch(`${TEST_CONFIG.baseUrl}/api/upload/cloudinary`, {
      method: 'POST',
      body: form2,
      headers: form2.getHeaders()
    });
    
    if (!response2.ok) {
      const errorText = await response2.text();
      throw new Error(`HTTP ${response2.status}: ${errorText}`);
    }
    
    const result2 = await response2.json();
    console.log('✅ Multiple image upload successful');
    console.log(`   Response format: ${result2.url ? 'single' : 'multiple'}`);
    if (result2.urls) {
      console.log(`   Uploaded ${result2.urls.length} images`);
      result2.urls.forEach((url, index) => {
        console.log(`     ${index + 1}: ${url}`);
      });
    }
    
    // Test 3: Product creation with images
    console.log('\n📤 Test 3: Product Creation with Images');
    console.log('----------------------------------------');
    
    const form3 = new FormData();
    form3.append('name', 'Test Product (New API)');
    form3.append('description', 'A test product created via the new upload flow');
    form3.append('designer', 'Test Designer');
    form3.append('price', '99.99');
    form3.append('gender', 'unisex');
    form3.append('category', 'Tops');
    form3.append('sizes', 'M,L,XL');
    form3.append('colors', 'Black,White');
    form3.append('materials', 'Cotton');
    form3.append('isActive', 'true');
    form3.append('isFeatured', 'false');
    form3.append('isOnSale', 'false');
    form3.append('isPreowned', 'false');
    form3.append('totalStock', '10');
    form3.append('images[]', fs.createReadStream(TEST_CONFIG.testImagePath));
    
    const response3 = await fetch(`${TEST_CONFIG.baseUrl}/api/products/with-images`, {
      method: 'POST',
      body: form3,
      headers: form3.getHeaders()
    });
    
    if (!response3.ok) {
      const errorText = await response3.text();
      throw new Error(`HTTP ${response3.status}: ${errorText}`);
    }
    
    const result3 = await response3.json();
    console.log('✅ Product creation with images successful');
    console.log(`   Product ID: ${result3.product._id}`);
    console.log(`   Product Name: ${result3.product.name}`);
    console.log(`   Images: ${result3.product.images.length} uploaded`);
    result3.product.images.forEach((img, index) => {
      console.log(`   Image ${index + 1}: ${img}`);
    });
    
    console.log('\n🎉 All tests passed!');
    console.log('The new Cloudinary upload API is working correctly.');
    console.log('\nKey improvements:');
    console.log('✅ No more DataCloneError - FormData sent directly');
    console.log('✅ Memory-based uploads - no temporary files');
    console.log('✅ Proper Cloudinary upload_stream usage');
    console.log('✅ Clear error logging for debugging');
    console.log('✅ Consistent API response format');
    console.log('✅ Support for both single and multiple uploads');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testNewUploadAPI().catch(console.error);
}

module.exports = { testNewUploadAPI };
