require('dotenv').config();
const { Client, Databases, Query, ID } = require('node-appwrite');

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const appwriteConfig = {
    client,
    databases,
    Query,
    ID,
    DB_ID: process.env.APPWRITE_DATABASE_ID,
    WORKSPACE_COLLECTION_ID: process.env.APPWRITE_WORKSPACE_COLLECTION_ID,
    ITEM_COLLECTION_ID: process.env.APPWRITE_ITEM_COLLECTION_ID,
    TELEGRAM_SESSION_COLLECTION_ID: process.env.APPWRITE_TELEGRAM_SESSION_COLLECTION_ID,
    LOG_COLLECTION_ID: process.env.APPWRITE_LOG_COLLECTION_ID,
};

module.exports = appwriteConfig;
