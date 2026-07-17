const mongoose = require('mongoose');

/**
 * Attempt to connect to MongoDB (legacy).
 *
 * MIGRATION NOTE (Sprint 1A → Sprint 2):
 * MongoDB connectivity is treated as OPTIONAL during the Supabase migration.
 * Connection failure will log a warning but will NOT crash the server.
 * This allows the server to start with Supabase while legacy MongoDB endpoints
 * continue to exist structurally. Once Sprint 2 Supabase implementation is
 * verified, this file and the mongoose dependency will be removed.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lms-assessment');
    console.log(`[DB] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[DB] MongoDB unavailable — legacy endpoints will not function until Sprint 2 Supabase migration is complete.`);
    console.warn(`[DB] Reason: ${error.message}`);
    // Non-fatal: server continues to start. Supabase is the target database.
  }
};

module.exports = connectDB;
