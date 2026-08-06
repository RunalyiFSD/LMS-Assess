const mongoose = require('mongoose');
const dns = require('dns');
const seedMocks = require('../utils/mockSeeder');
const logger = require('../utils/logger');

// Use Google DNS to resolve MongoDB Atlas SRV records
// (fixes issues with routers that don't support SRV lookups)
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI;
  const fallbackUri = process.env.LOCAL_MONGO_URI || 'mongodb://127.0.0.1:27017/lms-assessment';

  try {
    const conn = await mongoose.connect(primaryUri || fallbackUri);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    // Automatically seed/verify mock assessments on startup
    await seedMocks();
  } catch (error) {
    logger.error(`MongoDB Primary Connection Error (${primaryUri}): ${error.message}`);
    
    if (primaryUri && primaryUri !== fallbackUri) {
      try {
        logger.info(`Attempting fallback to local MongoDB (${fallbackUri})...`);
        const conn = await mongoose.connect(fallbackUri);
        logger.info(`MongoDB Connected (Fallback Local): ${conn.connection.host}`);
        await seedMocks();
        return;
      } catch (fallbackErr) {
        logger.error(`MongoDB Fallback Connection Error`, fallbackErr);
      }
    }
    process.exit(1);
  }
};

module.exports = connectDB;

