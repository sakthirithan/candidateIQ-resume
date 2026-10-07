const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/candidate_profiling', {
      serverSelectionTimeoutMS: 5000
    });
    isConnected = true;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    isConnected = false;
    const isIpBlocked = error.message && error.message.includes('alert number 80');
    if (isIpBlocked) {
      console.warn('[Database] Notice: MongoDB Atlas IP Whitelist required (Add 0.0.0.0/0 in Atlas Network Access). Running in Fallback Mode.');
    } else {
      console.warn(`[Database] Notice: MongoDB Connection Failed (${error.message}). Running in Fallback Mode.`);
    }
  }
};

const getDBStatus = () => isConnected;

module.exports = { connectDB, getDBStatus };
