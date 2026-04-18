require('dotenv').config();
const { Client, Databases } = require('node-appwrite');

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function fix() {
    try {
        console.log("Fixing collection permissions...");
        // the 4th param is permissions array
        await databases.updateCollection(
            process.env.APPWRITE_DATABASE_ID,
            process.env.APPWRITE_TELEGRAM_SESSION_COLLECTION_ID,
            'telegram_sessions',
            [
                'read("users")',
                'create("users")',
                'update("users")',
                'delete("users")'
            ]
        );
        console.log("✅ Berhasil mengupdate permission collection telegram_sessions!");
    } catch (error) {
        console.error(error);
    }
}
fix();
