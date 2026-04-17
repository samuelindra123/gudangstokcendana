import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import * as dotenv from 'dotenv';
import { Client, Databases, Permission, Role } from 'node-appwrite';

// Load .env.local manually
const envPath = resolve(process.cwd(), '.env.local');
try {
  const envConfig = dotenv.parse(readFileSync(envPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
} catch (e) {
  console.log('No .env.local file found.');
}

async function run() {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const databaseId = process.env.NEXT_PUBLIC_DATABASE_ID;
  const apiKey = process.env.APPWRITE_API_KEY;

  if (!endpoint || !projectId || !databaseId || !apiKey) {
    console.error('Missing configuration. Please ensure you have set:');
    console.error('- NEXT_PUBLIC_APPWRITE_ENDPOINT');
    console.error('- NEXT_PUBLIC_APPWRITE_PROJECT_ID');
    console.error('- NEXT_PUBLIC_DATABASE_ID');
    console.error('- APPWRITE_API_KEY (Generate this from your Appwrite Dashboard > Project setting > API Keys)');
    process.exit(1);
  }

  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);

  const databases = new Databases(client);

  console.log(`Connecting to Appwrite:`);
  console.log(`- Project: ${projectId}`);
  console.log(`- Database: ${databaseId}`);

  try {
    // 1. Create Workspaces Collection
    console.log('\n--> Creating Workspaces Collection...');
    const wsCollection = await databases.createCollection(databaseId, 'unique()', 'Workspaces', [
      Permission.read(Role.users()),
      Permission.write(Role.users()),
    ]);
    console.log(`Created Workspaces Collection: ${wsCollection.$id}`);
    
    await databases.createStringAttribute(databaseId, wsCollection.$id, 'name', 255, true);
    await databases.createStringAttribute(databaseId, wsCollection.$id, 'ownerId', 255, true);

    // 2. Create Items Collection
    console.log('\n--> Creating Items Collection...');
    const itemsCollection = await databases.createCollection(databaseId, 'unique()', 'Items', [
      Permission.read(Role.users()),
      Permission.write(Role.users()),
    ]);
    console.log(`Created Items Collection: ${itemsCollection.$id}`);
    
    await databases.createStringAttribute(databaseId, itemsCollection.$id, 'name', 255, true);
    await databases.createIntegerAttribute(databaseId, itemsCollection.$id, 'quantity', true);
    await databases.createStringAttribute(databaseId, itemsCollection.$id, 'workspaceId', 255, true);

    // 3. Create Logs Collection
    console.log('\n--> Creating Logs Collection...');
    const logsCollection = await databases.createCollection(databaseId, 'unique()', 'Logs', [
       Permission.read(Role.users()),
       Permission.write(Role.users()),
    ]);
    console.log(`Created Logs Collection: ${logsCollection.$id}`);
    
    await databases.createStringAttribute(databaseId, logsCollection.$id, 'action', 255, true);
    await databases.createStringAttribute(databaseId, logsCollection.$id, 'details', 1000, true);
    await databases.createStringAttribute(databaseId, logsCollection.$id, 'userId', 255, false);
    await databases.createStringAttribute(databaseId, logsCollection.$id, 'userName', 255, true);
    // Add default sort indexing for Logs (optional, just waiting makes it fine for simple queries)

    // Give it a short sleep so Appwrite flushes attributes
    console.log('\nUpdating .env.local file with new collection IDs...');

    // Read the current .env.local content and replace placeholder strings
    let currentEnv = readFileSync(envPath, 'utf8');
    
    // Simple replacement regexes
    const updateEnv = (key, val) => {
      const regex = new RegExp(`^${key}=.*`, 'gm');
      if (regex.test(currentEnv)) {
         currentEnv = currentEnv.replace(regex, `${key}=${val}`);
      } else {
         currentEnv += `\n${key}=${val}`;
      }
    };

    updateEnv('NEXT_PUBLIC_WORKSPACES_COLLECTION_ID', wsCollection.$id);
    updateEnv('NEXT_PUBLIC_ITEMS_COLLECTION_ID', itemsCollection.$id);
    updateEnv('NEXT_PUBLIC_LOGS_COLLECTION_ID', logsCollection.$id);

    writeFileSync(envPath, currentEnv);
    
    console.log('✅ Configuration saved successfully in .env.local!');
    console.log('✅ All Collections & Attributes migrated.');

  } catch (error) {
    console.error('\n❌ Migration Failed:', error.message);
    if(error.code === 401) {
        console.error('Make sure your API Key has the following scopes: documents.read, documents.write, collections.read, collections.write, attributes.read, attributes.write');
    }
  }
}

run();
