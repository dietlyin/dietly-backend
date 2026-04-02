const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`⚠️  MongoDB connection failed: ${err.message}`);
    console.error(`   Make sure MongoDB is running, or update MONGODB_URI in .env`);
    console.error(`   Options:`);
    console.error(`   1. Install MongoDB locally: https://www.mongodb.com/try/download/community`);
    console.error(`   2. Use MongoDB Atlas free tier: https://www.mongodb.com/atlas`);
    console.error(`   Server will continue running — DB-dependent routes will fail.\n`);
  }
};

module.exports = connectDB;
