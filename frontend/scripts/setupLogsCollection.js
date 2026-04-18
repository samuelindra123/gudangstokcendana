const { Client, Databases } = require('node-appwrite');
require('dotenv').config();

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const LOGS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_LOGS_COLLECTION_ID || 'logs';

async function setupLogsCollection() {
    try {
        // Try to get existing collection
        try {
            const collection = await databases.getCollection(DB_ID, LOGS_COLLECTION_ID);
            console.log('✅ Logs collection already exists:', LOGS_COLLECTION_ID);
            return;
        } catch (error) {
            // Collection doesn't exist, create it
        }

        console.log('📝 Creating logs collection...');
        
        // Create collection
        await databases.createCollection(
            DB_ID,
            LOGS_COLLECTION_ID,
            'Telegram Bot Logs'
        );

        console.log('✅ Logs collection created');

        // Create attributes
        const attributes = [
            {
                name: 'telegramUserId',
                type: 'string',
                size: 100,
                required: false,
            },
            {
                name: 'userName',
                type: 'string',
                size: 255,
                required: true,
            },
            {
                name: 'itemId',
                type: 'string',
                size: 100,
                required: false,
            },
            {
                name: 'itemName',
                type: 'string',
                size: 255,
                required: false,
            },
            {
                name: 'action',
                type: 'string',
                size: 50,
                required: true,
            },
            {
                name: 'oldValue',
                type: 'string',
                size: 255,
                required: false,
            },
            {
                name: 'newValue',
                type: 'string',
                size: 255,
                required: false,
            },
            {
                name: 'quantityChanged',
                type: 'integer',
                required: false,
            },
            {
                name: 'details',
                type: 'string',
                size: 500,
                required: false,
            },
        ];

        for (const attr of attributes) {
            try {
                await databases.createStringAttribute(DB_ID, LOGS_COLLECTION_ID, attr.name, attr.size, attr.required);
                console.log(`✅ Attribute "${attr.name}" created`);
            } catch (e) {
                if (!e.message.includes('already exists')) {
                    console.error(`Error creating attribute ${attr.name}:`, e.message);
                }
            }
        }

        // Create integer attribute for quantityChanged
        try {
            await databases.createIntegerAttribute(DB_ID, LOGS_COLLECTION_ID, 'quantityChanged', false);
            console.log('✅ Attribute "quantityChanged" created');
        } catch (e) {
            if (!e.message.includes('already exists')) {
                console.error('Error creating quantityChanged:', e.message);
            }
        }

        // Set permissions
        console.log('✅ Logs collection setup complete!');
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

setupLogsCollection();
