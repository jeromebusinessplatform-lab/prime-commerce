import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';

// Initialize Firebase Admin
// You need to set GOOGLE_APPLICATION_CREDENTIALS to the path of your service account key
const app = initializeApp();
const db = getFirestore(app);

async function migrateData(snapshotPath: string) {
  const data = JSON.parse(fs.readFileSync(snapshotPath, 'utf-8'));

  const collections = Object.keys(data);

  for (const collectionName of collections) {
    const docs = data[collectionName];
    console.log(`Migrating ${docs.length} documents to collection: ${collectionName}`);

    const batch = db.batch();
    const collectionRef = db.collection(collectionName);

    for (const doc of docs) {
      // In a real scenario, you might need to map Convex IDs to Firestore IDs
      const docRef = collectionRef.doc(); 
      batch.set(docRef, doc);
    }
    await batch.commit();
    console.log(`Committed ${collectionName}`);
  }
}

const snapshotPath = process.argv[2];
if (!snapshotPath) {
  console.error("Please provide the path to the JSON snapshot file.");
  process.exit(1);
}

migrateData(snapshotPath).catch(console.error);
