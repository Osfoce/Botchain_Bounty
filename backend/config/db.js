// db.js - Best practice approach
const mongoose = require("mongoose");
const { logRequestError, logSecurityEvent } = require("../utils/requestLogger");

let cachedConnection = null;
let intentionalDisconnect = false;

mongoose.connection.on("error", (error) => {
  logRequestError(null, "database_connection_failed", error, "critical");
});
mongoose.connection.on("disconnected", () => {
  cachedConnection = null;
  if (intentionalDisconnect) return;
  logSecurityEvent({
    event: "database_connection_failed",
    severity: "critical",
    outcome: "failure",
    errorCode: "DATABASE_DISCONNECTED",
  });
});

const connectDB = async () => {
  // Return cached connection if exists (serverless-friendly)
  if (cachedConnection) {
    logSecurityEvent({
      event: "database_connection_reused",
      severity: "debug",
      outcome: "success",
    });
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
    logSecurityEvent({
      event: "database_connected",
      severity: "info",
      outcome: "success",
    });
    return connection;
  } catch (error) {
    logRequestError(null, "database_connection_failed", error, "critical");
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
    intentionalDisconnect = true;
    try {
      await mongoose.disconnect();
      cachedConnection = null;
      logSecurityEvent({
        event: "database_disconnected",
        severity: "info",
        outcome: "success",
      });
    } finally {
      intentionalDisconnect = false;
    }
  }
};

module.exports = { connectDB, getDb, disconnectDB };
