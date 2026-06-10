import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;

    // stop server if MONGO_URI is not set in .env
    if (!uri) {
      console.error('MONGO_URI is not defined in .env file');
      process.exit(1);
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // timeout after 5 seconds if DB not reachable
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);

  } 
  catch (error){
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;



