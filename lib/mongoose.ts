import mongoose from 'mongoose';

const isConnected: boolean = false;

export const connectToDatabase = async () => {
  // Prevent unknown field query
  mongoose.set('strictQuery', true);

  if (!process.env.MONGODB_URL) {
    return console.log('MISSING MONGODB_URL');
  }

  if (isConnected) {
    return console.log('Already connected to database');
  }

  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      dbName: 'VikFlow',
    });
    console.log('Connected to database');
  } catch (error) {
    console.log('Connection is failed ', error);
  }
};
