import mongoose from "mongoose";

export const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB);
    console.log("Database connection auccessful");
    return mongoose.connection;
  } catch (error) {
    console.log("Database connection failed:", error.message);
    process.exit(1);
  }
};
