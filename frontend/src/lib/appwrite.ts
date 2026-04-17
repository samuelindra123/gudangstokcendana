import { Client, Account, Databases, Storage, ID, Query } from 'appwrite';

const client = new Client();
client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export { ID, Query };

// Consts for Database
export const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID || '';
export const WORKSPACES_COLLECTION_ID = process.env.NEXT_PUBLIC_WORKSPACES_COLLECTION_ID || '';
export const ITEMS_COLLECTION_ID = process.env.NEXT_PUBLIC_ITEMS_COLLECTION_ID || '';
export const LOGS_COLLECTION_ID = process.env.NEXT_PUBLIC_LOGS_COLLECTION_ID || '';
export const BUCKET_ID = 'images';
