import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import * as dotenv from 'dotenv';
import { Client, Databases } from 'node-appwrite';

const envPath = resolve(process.cwd(), '.env.local');
const envConfig = dotenv.parse(readFileSync(envPath));
for (const k in envConfig) process.env[k] = envConfig[k];

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function run() {
  try {
    await databases.createStringAttribute(
      process.env.NEXT_PUBLIC_DATABASE_ID,
      process.env.NEXT_PUBLIC_ITEMS_COLLECTION_ID,
      'status',
      50,
      false,
      'Perlu Dicek'
    );
    console.log('Success adding Status attribute');
  } catch (e) {
    console.log('Error or already exists:', e.message);
  }
}
run();
