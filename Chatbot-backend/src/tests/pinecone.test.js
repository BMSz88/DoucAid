require('dotenv').config();
const { initializePinecone } = require('../services/agenticAI');

async function testPineconeConnection() {
    try {
        console.log('Testing Pinecone connection...');
        console.log('Environment:', process.env.PINECONE_ENVIRONMENT);
        console.log('Index:', process.env.PINECONE_INDEX);

        const index = await initializePinecone();
        console.log('Successfully connected to Pinecone!');

        // Get index stats
        const stats = await index.describeIndexStats();
        console.log('Index statistics:', stats);

        return true;
    } catch (error) {
        console.error('Failed to connect to Pinecone:', error);
        return false;
    }
}

// Run the test if this file is run directly
if (require.main === module) {
    testPineconeConnection()
        .then(success => {
            if (!success) {
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('Test failed:', error);
            process.exit(1);
        });
}

module.exports = { testPineconeConnection }; 