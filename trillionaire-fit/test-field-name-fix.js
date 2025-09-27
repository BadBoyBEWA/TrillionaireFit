#!/usr/bin/env node

/**
 * Test script to verify the field name mismatch fix
 */

const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  testImagePath: path.join(__dirname, 'public', 'image', 'TF_Logo_1.jpg'),
};

async function testFieldNameFix() {
  console.log('🧪 Testing Field Name Mismatch Fix');
  console.log('==================================');
  
  // Check if test image exists
  if (!fs.existsSync(TEST_CONFIG.testImagePath)) {
    console.error('❌ Test image not found:', TEST_CONFIG.testImagePath);
    process.exit(1);
  }
  
  console.log('✅ Test image found');
  
  try {
    // Read the image file
    const imageBuffer = fs.readFileSync(TEST_CONFIG.testImagePath);
    
    // Create FormData using native API with 'images' field name
    const formData = new FormData();
    const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
    const file = new File([blob], 'test-image.jpg', { type: 'image/jpeg' });
    formData.append('images', file); // Use 'images' field name
    
    console.log('📤 Testing upload with correct field name "images"...');
    
    const response = await fetch(`${TEST_CONFIG.baseUrl}/api/upload/cloudinary`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ Upload successful!');
    console.log(`   Response format: ${result.url ? 'single' : 'multiple'}`);
    console.log(`   Image URL: ${result.url || result.urls[0]}`);
    
    // Test multiple files
    console.log('\n📤 Testing multiple files upload...');
    const formDataMultiple = new FormData();
    const file1 = new File([blob], 'test-image-1.jpg', { type: 'image/jpeg' });
    const file2 = new File([blob], 'test-image-2.jpg', { type: 'image/jpeg' });
    formDataMultiple.append('images', file1);
    formDataMultiple.append('images', file2);
    
    const responseMultiple = await fetch(`${TEST_CONFIG.baseUrl}/api/upload/cloudinary`, {
      method: 'POST',
      body: formDataMultiple
    });
    
    if (!responseMultiple.ok) {
      const errorText = await responseMultiple.text();
      throw new Error(`HTTP ${responseMultiple.status}: ${errorText}`);
    }
    
    const resultMultiple = await responseMultiple.json();
    console.log('✅ Multiple files upload successful!');
    console.log(`   Uploaded ${resultMultiple.urls.length} images`);
    
    console.log('\n🎉 Field Name Fix Verified!');
    console.log('✅ Frontend uses "images" field name');
    console.log('✅ Backend expects "images" field name');
    console.log('✅ Single file upload works');
    console.log('✅ Multiple file upload works');
    console.log('✅ No more "No image files provided" error');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.message.includes('No image files provided')) {
      console.error('❌ Field name mismatch still exists!');
      console.error('Check:');
      console.error('- Frontend: formData.append("images", file)');
      console.error('- Backend: formData.getAll("images")');
    }
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testFieldNameFix().catch(console.error);
}

module.exports = { testFieldNameFix };
