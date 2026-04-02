const mongoose = require('mongoose');

let cached = null;

const connectDB = async () => {
  if (cached) return cached;
  if (mongoose.connection.readyState === 1) {
    cached = mongoose.connection;
    return cached;
  }
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      bufferCommands: false,
    });
    cached = conn.connection;
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    return cached;
  } catch (err) {
    console.error(`⚠️  MongoDB connection failed: ${err.message}`);
    console.error(`   Server will continue running — DB-dependent routes will fail.\n`);
  }
};

module.exports = connectDB;
