const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function resetAdminPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find and update admin user
    const adminUser = await User.findOne({ email: 'admin@ecounty.com' });
    
    if (!adminUser) {
      console.error('❌ Admin user not found');
      process.exit(1);
    }

    // Set new password
    adminUser.password = 'Admin@123';
    await adminUser.save();
    
    console.log('✅ Admin password reset successfully');
    console.log('\nLogin credentials:');
    console.log('   Email: admin@ecounty.com');
    console.log('   Password: Admin@123');

    // Verify
    const updatedUser = await User.findOne({ email: 'admin@ecounty.com' }).select('+password');
    const passwordMatch = await updatedUser.comparePassword('Admin@123');
    console.log('✅ Password verification:', passwordMatch ? 'SUCCESS ✓' : 'FAILED ✗');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetAdminPassword();
