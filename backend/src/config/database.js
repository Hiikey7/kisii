const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use MongoDB Atlas connection string or local MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://Mkenya045:17411236eM.@e-county.eli0djm.mongodb.net/ecounty?retryWrites=true&w=majority';
    
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      retryWrites: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log('⚠️  Continuing without database... API will run but data won\'t persist.');
    console.log('📚 To fix: Verify MongoDB Atlas IP whitelist includes your IP address');
    console.log('🔗 Check: https://cloud.mongodb.com/ → Project → Network Access');
    return null;
  }
};

module.exports = connectDB;
