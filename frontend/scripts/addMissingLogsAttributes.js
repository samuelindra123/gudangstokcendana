const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '/workspaces/gudangstokcendana/backend/.env' });

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const DB_ID = process.env.APPWRITE_DATABASE_ID;
const LOGS_COLLECTION_ID = process.env.APPWRITE_LOG_COLLECTION_ID;

async function addMissingAttributes() {
    try {
        console.log('🔧 Adding missing attributes to logs collection...');
        
        // List of all required attributes
        const requiredAttributes = [
            'telegramUserId',
            'userName', 
            'itemId',
            'itemName',
            'action',
            'oldValue',
            'newValue',
            'quantityChanged',
            'details'
        ];

        for (const attr of requiredAttributes) {
            try {
                if (attr === 'quantityChanged') {
                    // This is an integer attribute
                    await databases.createIntegerAttribute(DB_ID, LOGS_COLLECTION_ID, attr, false);
                } else {
                    // All others are strings
                    const size = attr === 'details' ? 1000 : (attr === 'oldValue' || attr === 'newValue' ? 255 : (attr === 'userName' || attr === 'itemName' ? 255 : 100));
                    await databases.createStringAttribute(DB_ID, LOGS_COLLECTION_ID, attr, size, false);
                }
                console.log(`✅ Attribute "${attr}" added/verified`);
            } catch (e) {
                if (!e.message.includes('already exists')) {
                    console.error(`⚠️ Error with "${attr}":`, e.message);
                } else {
                    console.log(`✅ Attribute "${attr}" already exists`);
                }
            }
        }

        console.log('✅ All required attributes have been processed!');
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

addMissingAttributes();
