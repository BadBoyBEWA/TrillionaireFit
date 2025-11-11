import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';

export async function createAdminUser() {
  try {
    await connectDB();
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      return existingAdmin;
    }
    
    // Create admin user
    const adminData = {
      name: 'Admin User',
      email: 'admin@trillionairefit.com',
      password: await bcrypt.hash('admin123', 12),
      role: 'admin' as const
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
  }
}

// Run if called directly
if (require.main === module) {
  createAdminUser()
    .then(() => {
      console.log('Admin creation completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Admin creation failed:', error);
      process.exit(1);
    });
}
