const mongoose = require('mongoose');
const dns = require('dns');
const seedMocks = require('../utils/mockSeeder');

// Set DNS servers for MongoDB Atlas SRV resolution
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // fallback
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lms-assessment');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    // Seed mocks disabled
    // await seedMocks();
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

