#!/usr/bin/env node

/**
 * Database Migration Script
 * 
 * This script automatically migrates all API routes from the old connectDB
 * to the new dbConnect function with environment-based database switching.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all API route files
const apiFiles = glob.sync('src/app/api/**/route.ts', { cwd: process.cwd() });

console.log(`🔍 Found ${apiFiles.length} API route files to check...`);

let migratedCount = 0;
let alreadyMigratedCount = 0;

apiFiles.forEach(filePath => {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    let content = fs.readFileSync(fullPath, 'utf8');
    let hasChanges = false;
    
    // Check if file uses old connectDB
    if (content.includes("import connectDB from '@/lib/mongodb'")) {
      // Replace import
      content = content.replace(
        "import connectDB from '@/lib/mongodb';",
        "import dbConnect from '@/lib/db';"
      );
      hasChanges = true;
    }
    
    // Replace function calls
    if (content.includes('await connectDB();')) {
      content = content.replace(/await connectDB\(\);/g, 'await dbConnect();');
      hasChanges = true;
    }
    
    if (hasChanges) {
      fs.writeFileSync(fullPath, content);
      console.log(`✅ Migrated: ${filePath}`);
      migratedCount++;
    } else if (content.includes("import dbConnect from '@/lib/db'")) {
      console.log(`⏭️  Already migrated: ${filePath}`);
      alreadyMigratedCount++;
    } else {
      console.log(`⏭️  No database usage: ${filePath}`);
    }
    
  } catch (error) {
    console.error(`❌ Error migrating ${filePath}:`, error.message);
  }
});

console.log('\n📊 Migration Summary:');
console.log(`✅ Migrated: ${migratedCount} files`);
console.log(`⏭️  Already migrated: ${alreadyMigratedCount} files`);
console.log(`📁 Total checked: ${apiFiles.length} files`);

if (migratedCount > 0) {
  console.log('\n🚀 Next steps:');
  console.log('1. Test your API routes: npm run dev');
  console.log('2. Check database status: npm run db:status');
  console.log('3. Test health endpoint: http://localhost:3000/api/health');
} else {
  console.log('\n🎉 All files are already migrated or don\'t use database connections!');
}
