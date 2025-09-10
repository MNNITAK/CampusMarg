
import mongoose from "mongoose";
import dotenv from "dotenv";


dotenv.config();
// console.log("MONGO_URI:", process.env.MONGO_URI);
const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect("mongodb+srv://ay9120991471:buT79FVlBXLjNkih@layers3.b8alkk6.mongodb.net/");

    
    console.log(" MongoDB connected successfully");
  } catch (error) {
    console.error(" MongoDB connection failed:", (error as Error).message);
    process.exit(1); 
  }
};

export default connectDB;
