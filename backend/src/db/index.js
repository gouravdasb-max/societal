import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;
    const [base, query] = uri.split("?");
    const cleanBase = base.replace(/\/+$/, "");
    uri = query ? `${cleanBase}/${DB_NAME}?${query}` : `${cleanBase}/${DB_NAME}`;

    const connectionInstance = await mongoose.connect(uri);
    console.log(
      `\n✅ MongoDB connected! DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
