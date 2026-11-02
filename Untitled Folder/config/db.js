// db.js - Best practice approach
const mongoose = require("mongoose")

let cachedConnection = null;

const connectDB = async () => {
  // Return cached connection if exists (serverless-friendly)
  if (cachedConnection) {
    console.log('Using cached database connection');
    return cachedConnection;
  }

  try {
    // Connection options for better performance
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,          // Connection pool size
      minPoolSize: 2,           // Minimum connections in pool
      socketTimeoutMS: 45000,    // Close sockets after 45s inactivity
      serverSelectionTimeoutMS: 5000, // Fail fast if can't connect
    });

    cachedConnection = connection;
    console.log('MongoDB connected successfully');
    return connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Don't exit process in production; allow retry logic
    throw error;
  }
};

// Helper to get db instance for native operations if needed
const getDb = () => {
  if (!cachedConnection) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return mongoose.connection.db;
};

const disconnectDB = async () => {
  if (cachedConnection) {
    await mongoose.disconnect();
    cachedConnection = null;
    console.log('MongoDB disconnected');
  }
};

module.exports = { connectDB, getDb, disconnectDB };



