const mongoose = require('mongoose');
const dns = require('dns');
const seedMocks = require('../utils/mockSeeder');
const logger = require('../utils/logger');

// Use Google DNS to resolve MongoDB Atlas SRV records
// (fixes issues with routers that don't support SRV lookups)
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lms-assessment');
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    // Automatically seed/verify mock assessments on startup
    await seedMocks();
  } catch (error) {
    logger.error(`MongoDB Connection Error`, error);
    process.exit(1);
  }
};

module.exports = connectDB;

