const mongoose = require('mongoose');

// just basic local db connection
const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/sharenexus';
    await mongoose.connect(uri);
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB Error', err);
    throw err;
  }
};

// export so we can call it in server.js
module.exports = connectDB;

