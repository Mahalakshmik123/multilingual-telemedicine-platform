import mongoose from 'mongoose';

let isConnected = false;
let isInMemoryMode = false;

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/telemedicine';

  try {
    // Attempt connecting to MongoDB with a short timeout to prevent blocking dev startup
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 2000
    });

    isConnected = true;
    isInMemoryMode = false;
    console.log(`[MongoDB] Connected successfully to: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err: any) {
    console.warn(`[MongoDB Warning] Live MongoDB not available at ${uri}: ${err.message}`);
    console.log(`[MongoDB] Running in embedded in-memory simulated persistence mode for demonstration.`);
    isConnected = false;
    isInMemoryMode = true;
  }
};

export const getDBStatus = () => ({
  isConnected,
  isInMemoryMode,
  mongoUri: process.env.MONGO_URI ? 'Configured from Environment' : 'Local fallback'
});
