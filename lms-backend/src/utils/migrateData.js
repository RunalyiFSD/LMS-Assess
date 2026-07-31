const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const dns = require('dns');

// Use custom DNS servers to resolve MongoDB Atlas SRV records on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // fallback
}

const localUri = process.env.LOCAL_MONGO_URI || 'mongodb://127.0.0.1:27017/lms-assessment';
const atlasUri = process.env.MONGO_URI;

if (!atlasUri) {
  console.error('Error: MONGO_URI is not defined in .env file.');
  process.exit(1);
}

async function migrate() {
  console.log('--- STARTING MONGODB DATA MIGRATION ---');

  // 1. Connect to Local MongoDB
  console.log('Connecting to Local MongoDB...');
  const localConn = await mongoose.createConnection(localUri).asPromise();
  console.log('Connected to Local MongoDB.');

  // 2. Connect to Atlas MongoDB
  console.log('Connecting to MongoDB Atlas Cluster...');
  const atlasConn = await mongoose.createConnection(atlasUri).asPromise();
  console.log('Connected to MongoDB Atlas Cluster.');

  // 3. Get collections from Local DB
  const collections = await localConn.db.listCollections().toArray();
  console.log(`Found ${collections.length} collection(s) in local database.`);

  for (const colInfo of collections) {
    const colName = colInfo.name;
    if (colName.startsWith('system.')) continue;

    console.log(`\nProcessing collection: "${colName}"...`);
    const localCollection = localConn.db.collection(colName);
    const atlasCollection = atlasConn.db.collection(colName);

    const docs = await localCollection.find({}).toArray();
    console.log(`Fetched ${docs.length} document(s) from local "${colName}".`);

    if (docs.length > 0) {
      let insertedCount = 0;
      for (const doc of docs) {
        await atlasCollection.replaceOne({ _id: doc._id }, doc, { upsert: true });
        insertedCount++;
      }
      console.log(`Migrated ${insertedCount} document(s) to Atlas collection "${colName}".`);
    } else {
      console.log(`Collection "${colName}" is empty, skipping.`);
    }
  }

  console.log('\n--- MIGRATION COMPLETED SUCCESSFULLY ---');
  await localConn.close();
  await atlasConn.close();
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
