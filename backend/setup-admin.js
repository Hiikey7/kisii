const mongoose = require('mongoose');
const User = require('./src/models/User');
const Department = require('./src/models/Department');
require('dotenv').config();

async function setupAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create or get the Admin Department
    let adminDept = await Department.findOne({ name: 'Administration' });
    if (!adminDept) {
      adminDept = await Department.create({
        name: 'Administration',
        description: 'Admin Department',
        email: 'admin@ecounty.com',
        phone: '+254700000000',
      });
      console.log('✅ Created Administration department');
    } else {
      console.log('✅ Administration department already exists');
    }

    // Check if admin user exists
    let adminUser = await User.findOne({ email: 'admin@ecounty.com' });
    
    if (adminUser) {
      console.log('✅ Admin user already exists:', adminUser.email);
      console.log('   ID:', adminUser._id);
      console.log('   Role:', adminUser.role);
      console.log('   Active:', adminUser.isActive);
    } else {
      // Create admin user
      adminUser = await User.create({
        firstName: 'System',
        lastName: 'Administrator',
        email: 'admin@ecounty.com',
        phone: '+254700000000',
        password: 'Admin@123',
        role: 'admin',
        department: adminDept._id,
        isActive: true,
        isVerified: true,
      });
      console.log('✅ Created admin user');
      console.log('   Email: admin@ecounty.com');
      console.log('   Password: Admin@123');
      console.log('   ID:', adminUser._id);
    }

    // Verify password works
    const testUser = await User.findOne({ email: 'admin@ecounty.com' }).select('+password');
    const passwordMatch = await testUser.comparePassword('Admin@123');
    console.log('✅ Password verification:', passwordMatch ? 'PASS' : 'FAIL');

    console.log('\n✅ Admin setup complete!');
    console.log('\nYou can now login with:');
    console.log('   Email: admin@ecounty.com');
    console.log('   Password: Admin@123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupAdmin();
