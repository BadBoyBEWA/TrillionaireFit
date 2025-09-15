const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Simple User schema for this script
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: { type: String, enum: ['buyer', 'admin'], default: 'buyer' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trillionairefit');
    console.log('Connected to MongoDB');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.email);
      return existingAdmin;
    }
    
    // Create admin user
    const adminData = {
      name: 'Admin User',
      email: 'admin@trillionairefit.com',
      password: await bcrypt.hash('admin123', 12),
      role: 'admin'
    };
    
    const admin = new User(adminData);
    await admin.save();
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@trillionairefit.com');
    console.log('🔑 Password: admin123');
    console.log('⚠️  Please change the password after first login!');
    
    return admin;
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
  }
}

// Run the function
createAdminUser()
  .then(() => {
    console.log('Admin creation completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Admin creation failed:', error);
    process.exit(1);
  });
