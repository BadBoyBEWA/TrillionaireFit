5555// Test environment variables
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

console.log('Environment Variables Test:');
console.log('FLW_SECRET_KEY:', process.env.FLW_SECRET_KEY ? 'Found' : 'Missing');
console.log('NEXT_PUBLIC_FLW_PUBLIC_KEY:', process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY ? 'Found' : 'Missing');
console.log('FLW_ENCRYPTION_KEY:', process.env.FLW_ENCRYPTION_KEY ? 'Found' : 'Missing');

// Test Flutterwave initialization
try {
  const Flutterwave = require('flutterwave-node-v3');
  console.log('Secret key value:', process.env.FLW_SECRET_KEY);
  console.log('Secret key length:', process.env.FLW_SECRET_KEY?.length);
  console.log('Secret key starts with:', process.env.FLW_SECRET_KEY?.substring(0, 10));
  
  // Try the correct initialization method
  const flw = new Flutterwave(process.env.FLW_SECRET_KEY, process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY);
  console.log('✅ Flutterwave initialized successfully');
  
  // Test a simple API call
  console.log('Testing Flutterwave API...');
  const result = await flw.Transaction.verify({ id: 'test123' });
  console.log('API test result:', result);
} catch (error) {
  console.error('❌ Flutterwave initialization failed:', error.message);
  console.error('Full error:', error);
}
