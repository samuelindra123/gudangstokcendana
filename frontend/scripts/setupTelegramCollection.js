const { Client, Databases, ID } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function createTelegramCollection() {
    const dbId = process.env.NEXT_PUBLIC_DATABASE_ID;
    console.log(`Setting up Telegram collection in Database: ${dbId}`);

    try {
        const _id = ID.unique();
        console.log(`Creating collection with ID: ${_id} ...`);
        
        await databases.createCollection(dbId, _id, 'telegram_sessions');
        console.log(`✅ Collection telegram_sessions created.`);

        // Create Attributes
        console.log("Creating attributes...");
        await databases.createStringAttribute(dbId, _id, 'userId', 255, true);
        await databases.createStringAttribute(dbId, _id, 'token', 255, true);
        await databases.createStringAttribute(dbId, _id, 'telegramChatId', 255, false);
        await databases.createBooleanAttribute(dbId, _id, 'isVerified', false, false, false);
        
        console.log("Menunggu Appwrite menerapkan index dan atribut... (10 detik)");
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        // Let's create an index for quick search by token
        await databases.createIndex(dbId, _id, 'token_idx', 'unique', ['token']);
        console.log("✅ Index created for token.");

        console.log(`\n🎉 SELESAI! Silakan tambahkan ID ini ke .env.local dan backend/.env:`);
        console.log(`NEXT_PUBLIC_TELEGRAM_SESSION_COLLECTION_ID=${_id}`);

    } catch (error) {
        console.error("❌ Gagal membuat collection:", error);
    }
}

createTelegramCollection();
