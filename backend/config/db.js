// backend/config/db.js
import mongoose from 'mongoose';

/**
 * Establishes a connection to MongoDB using the URI supplied via environment
 * variables. Configures robust keep-alive and socket settings to avoid stale
 * connection timeouts on remote servers.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // Timout after 10s if DB is offline
      socketTimeoutMS: 45000,          // Close inactive sockets after 45s
      family: 4,                       // Forces IPv4 resolution (bypasses slow IPv6 lookups)
    });

    console.log(`[MongoDB] Connected: ${conn.connection.host}/${conn.connection.name}`);

    // Dynamic error handling on the running driver instance
    mongoose.connection.on('error', (err) => {
      console.error(`[MongoDB] Connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Disconnected. Attempting to reconnect is handled by the driver.');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('[MongoDB] Connection successfully re-established.');
    });
  } catch (error) {
    console.error(`[MongoDB] Initial connection failed: ${error.message}`);
    console.error(
      "[MongoDB Resolution Guide] If connection times out:\n" +
      "  1. Ensure the remote server at 159.41.89.255 is running 'mongod'.\n" +
      "  2. Verify '/etc/mongod.conf' has 'bindIp: 0.0.0.0'.\n" +
      "  3. Check system firewalls to make sure port 27017 is open ('sudo ufw allow 27017/tcp')."
    );
    process.exit(1); // Force-kill so container environment managers can restart clean
  }
};

export default connectDB;