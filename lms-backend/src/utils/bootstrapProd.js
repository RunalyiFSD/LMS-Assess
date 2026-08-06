const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcrypt');

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const User = require('../models/User');
const Subject = require('../models/Subject');

/**
 * Idempotent Production Database Initialization
 * Safely seeds baseline curriculum and initial administrative account
 * WITHOUT dropping existing collections or student attempts.
 */
async function bootstrapProduction() {
  console.log('🚀 Starting Idempotent Production Database Bootstrapping...\n');

  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lms_assess';
  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB.');

  // 1. Seed or retrieve Default System Admin first
  let adminUser = await User.findOne({ role: 'admin' });
  if (!adminUser) {
    const adminEmail = process.env.BOOTSTRAP_ADMIN_EMAIL || 'admin@lms-assess.com';
    const adminPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD || 'Admin@Secure123!';
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    adminUser = await User.create({
      name: 'System Administrator',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
    });

    console.log(`  ✅ Created initial System Administrator account: ${adminUser.email}`);
  } else {
    console.log(`  ℹ️ System Administrator exists: ${adminUser.email}`);
  }

  // 2. Seed Core Academic Subjects Idempotently using adminUser._id
  const defaultSubjects = [
    { name: 'Data Structures & Algorithms', code: 'CS-201', description: 'Core data structures, algorithms, and computational complexity.' },
    { name: 'Database Management Systems', code: 'CS-301', description: 'Relational databases, SQL, NoSQL systems, and query optimization.' },
    { name: 'Full Stack Web Development', code: 'CS-401', description: 'Modern frontend, backend APIs, state management, and web security.' },
    { name: 'Computer Networks', code: 'CS-302', description: 'Network protocols, socket programming, OSI layers, and network security.' },
    { name: 'Operating Systems', code: 'CS-202', description: 'Processes, threads, concurrency, memory management, and file systems.' },
  ];

  for (const sub of defaultSubjects) {
    const existing = await Subject.findOne({ code: sub.code });
    if (!existing) {
      await Subject.create({ ...sub, createdBy: adminUser._id });
      console.log(`  ➕ Seeded Subject: ${sub.name} (${sub.code})`);
    } else {
      console.log(`  ℹ️ Subject exists: ${sub.name} (${sub.code})`);
    }
  }

  console.log('\n✨ Production Bootstrapping Completed Successfully.\n');
  await mongoose.disconnect();
}

if (require.main === module) {
  bootstrapProduction()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Bootstrap failed:', err);
      process.exit(1);
    });
}

module.exports = { bootstrapProduction };
