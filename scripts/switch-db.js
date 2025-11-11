#!/usr/bin/env node

/**
 * Database Configuration Switcher
 * 
 * This script helps you switch between local MongoDB and MongoDB Atlas
 * by updating your .env.local file with the appropriate configuration.
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');

// Database configurations
const configs = {
  local: {
    name: 'Local MongoDB',
    env: {
      MONGODB_LOCAL_URI: 'mongodb://localhost:27017',
      MONGODB_DB_NAME: 'trillionaire-fit',
      // Comment out Atlas
      'MONGODB_ATLAS_URI': '# MONGODB_ATLAS_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority',
      'MONGODB_ATLAS': '# MONGODB_ATLAS=true',
    }
  },
  atlas: {
    name: 'MongoDB Atlas',
    env: {
      MONGODB_ATLAS_URI: 'mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority',
      MONGODB_ATLAS: 'true',
      MONGODB_DB_NAME: 'trillionaire-fit',
      // Comment out local
      'MONGODB_LOCAL_URI': '# MONGODB_LOCAL_URI=mongodb://localhost:27017',
    }
  }
};

function readEnvFile() {
  try {
    return fs.readFileSync(envPath, 'utf8');
  } catch (error) {
    console.log('❌ .env.local file not found. Creating a new one...');
    return '';
  }
}

function writeEnvFile(content) {
  fs.writeFileSync(envPath, content);
  console.log('✅ .env.local file updated successfully!');
}

function updateEnvFile(config) {
  let content = readEnvFile();
  
  // Remove existing database configuration lines
  const lines = content.split('\n');
  const filteredLines = lines.filter(line => 
    !line.startsWith('MONGODB_') && 
    !line.startsWith('# MONGODB_')
  );
  
  // Add new configuration
  const newLines = [
    '# Database Configuration',
    `# ${config.name}`,
    ...Object.entries(config.env).map(([key, value]) => `${key}=${value}`),
    '',
    ...filteredLines.slice(1) // Skip the first empty line
  ];
  
  writeEnvFile(newLines.join('\n'));
}

function showCurrentConfig() {
  const content = readEnvFile();
  const lines = content.split('\n');
  
  console.log('\n📊 Current Database Configuration:');
  console.log('=====================================');
  
  const dbLines = lines.filter(line => 
    line.startsWith('MONGODB_') || line.startsWith('# MONGODB_')
  );
  
  if (dbLines.length === 0) {
    console.log('❌ No database configuration found');
    return;
  }
  
  dbLines.forEach(line => {
    if (line.startsWith('#')) {
      console.log(`  ${line}`);
    } else {
      console.log(`  ✅ ${line}`);
    }
  });
  
  // Determine current setup
  const hasAtlas = lines.some(line => line.startsWith('MONGODB_ATLAS=true'));
  const hasLocal = lines.some(line => line.startsWith('MONGODB_LOCAL_URI=mongodb://localhost'));
  
  console.log('\n🔍 Current Setup:');
  if (hasAtlas) {
    console.log('  🌐 Using MongoDB Atlas');
  } else if (hasLocal) {
    console.log('  🏠 Using Local MongoDB');
  } else {
    console.log('  ❓ Unknown configuration');
  }
}

function showHelp() {
  console.log(`
🗄️  Database Configuration Switcher
====================================

Usage:
  node scripts/switch-db.js [command]

Commands:
  local     Switch to local MongoDB
  atlas     Switch to MongoDB Atlas
  status    Show current configuration
  help      Show this help message

Examples:
  node scripts/switch-db.js local
  node scripts/switch-db.js atlas
  node scripts/switch-db.js status

Note: Make sure to update the connection strings with your actual credentials!
`);
}

// Main execution
const command = process.argv[2];

switch (command) {
  case 'local':
    console.log('🔄 Switching to Local MongoDB...');
    updateEnvFile(configs.local);
    console.log('✅ Switched to Local MongoDB');
    console.log('💡 Make sure your local MongoDB server is running!');
    break;
    
  case 'atlas':
    console.log('🔄 Switching to MongoDB Atlas...');
    updateEnvFile(configs.atlas);
    console.log('✅ Switched to MongoDB Atlas');
    console.log('💡 Don\'t forget to update MONGODB_ATLAS_URI with your actual credentials!');
    break;
    
  case 'status':
    showCurrentConfig();
    break;
    
  case 'help':
  case '--help':
  case '-h':
    showHelp();
    break;
    
  default:
    console.log('❌ Unknown command. Use "help" to see available commands.');
    showHelp();
    process.exit(1);
}

console.log('\n🚀 Next steps:');
console.log('1. Update the connection strings with your actual credentials');
console.log('2. Restart your development server');
console.log('3. Check the health endpoint: http://localhost:3000/api/health');
