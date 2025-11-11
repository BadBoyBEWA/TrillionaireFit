#!/usr/bin/env node

/**
 * Email Setup Script for Trillionaire Fit
 * This script helps you configure email notifications
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🎉 Welcome to Trillionaire Fit Email Setup!');
console.log('This script will help you configure email notifications.\n');

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function setupEmail() {
  console.log('📧 Email Service Options:');
  console.log('1. Gmail (Recommended for development)');
  console.log('2. SendGrid (Recommended for production)');
  console.log('3. AWS SES (For high volume)');
  console.log('4. Mailgun (Alternative)');
  console.log('5. Skip email setup for now\n');

  const choice = await askQuestion('Choose your email service (1-5): ');

  let envContent = '';
  let instructions = '';

  switch (choice) {
    case '1':
      console.log('\n📧 Gmail Setup Selected');
      const gmailEmail = await askQuestion('Enter your Gmail address: ');
      const gmailPassword = await askQuestion('Enter your Gmail App Password (16 characters): ');
      
      envContent = `# Email Configuration - Gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=${gmailEmail}
SMTP_PASS=${gmailPassword}

# Base URL (for email links)
NEXT_PUBLIC_BASE_URL=http://localhost:3000`;

      instructions = `
📧 Gmail Setup Instructions:
1. Enable 2-Factor Authentication on your Google Account
2. Go to Google Account → Security → 2-Step Verification
3. Scroll down to "App passwords"
4. Select "Mail" and "Other (Custom name)"
5. Enter "Trillionaire Fit" as the name
6. Use the generated 16-character password as SMTP_PASS

✅ Your .env.local file has been created with Gmail configuration!`;
      break;

    case '2':
      console.log('\n📧 SendGrid Setup Selected');
      const sendgridApiKey = await askQuestion('Enter your SendGrid API Key: ');
      
      envContent = `# Email Configuration - SendGrid
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=${sendgridApiKey}

# Base URL (for email links)
NEXT_PUBLIC_BASE_URL=http://localhost:3000`;

      instructions = `
📧 SendGrid Setup Instructions:
1. Sign up at https://sendgrid.com
2. Go to Settings → API Keys
3. Create a new API Key with "Mail Send" permissions
4. Copy the API key and use it as SMTP_PASS

✅ Your .env.local file has been created with SendGrid configuration!`;
      break;

    case '3':
      console.log('\n📧 AWS SES Setup Selected');
      const sesUsername = await askQuestion('Enter your AWS SES SMTP Username: ');
      const sesPassword = await askQuestion('Enter your AWS SES SMTP Password: ');
      const sesRegion = await askQuestion('Enter your AWS Region (e.g., us-east-1): ');
      
      envContent = `# Email Configuration - AWS SES
SMTP_HOST=email-smtp.${sesRegion}.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=${sesUsername}
SMTP_PASS=${sesPassword}

# Base URL (for email links)
NEXT_PUBLIC_BASE_URL=http://localhost:3000`;

      instructions = `
📧 AWS SES Setup Instructions:
1. Set up AWS SES in your AWS Console
2. Verify your email address or domain
3. Create SMTP credentials in SES console
4. Use the provided username and password

✅ Your .env.local file has been created with AWS SES configuration!`;
      break;

    case '4':
      console.log('\n📧 Mailgun Setup Selected');
      const mailgunUsername = await askQuestion('Enter your Mailgun SMTP Username: ');
      const mailgunPassword = await askQuestion('Enter your Mailgun SMTP Password: ');
      
      envContent = `# Email Configuration - Mailgun
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=${mailgunUsername}
SMTP_PASS=${mailgunPassword}

# Base URL (for email links)
NEXT_PUBLIC_BASE_URL=http://localhost:3000`;

      instructions = `
📧 Mailgun Setup Instructions:
1. Sign up at https://mailgun.com
2. Go to Sending → Domains
3. Add your domain or use sandbox domain
4. Get SMTP credentials from the domain settings

✅ Your .env.local file has been created with Mailgun configuration!`;
      break;

    case '5':
      console.log('\n⏭️ Skipping email setup for now');
      console.log('You can set up email later by creating a .env.local file');
      console.log('See EMAIL_SETUP.md for detailed instructions');
      rl.close();
      return;

    default:
      console.log('\n❌ Invalid choice. Please run the script again.');
      rl.close();
      return;
  }

  // Create .env.local file
  const envPath = path.join(__dirname, '.env.local');
  
  try {
    // Check if .env.local already exists
    if (fs.existsSync(envPath)) {
      const overwrite = await askQuestion('\n⚠️ .env.local already exists. Overwrite? (y/n): ');
      if (overwrite.toLowerCase() !== 'y') {
        console.log('❌ Setup cancelled. No changes made.');
        rl.close();
        return;
      }
    }

    fs.writeFileSync(envPath, envContent);
    console.log(instructions);
    
    console.log('\n🧪 Testing Email Service...');
    console.log('1. Start your development server: npm run dev');
    console.log('2. Go to http://localhost:3000/forgot-password');
    console.log('3. Enter your email address');
    console.log('4. Check your email for the reset link');
    
    console.log('\n📚 Additional Resources:');
    console.log('- See EMAIL_SETUP.md for detailed instructions');
    console.log('- Check console logs for email service status');
    console.log('- Test with different email types (order confirmation, etc.)');

  } catch (error) {
    console.error('❌ Error creating .env.local file:', error.message);
  }

  rl.close();
}

// Run the setup
setupEmail().catch(console.error);
