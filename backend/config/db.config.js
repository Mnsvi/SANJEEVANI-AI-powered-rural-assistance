import mongoose from "mongoose";
import { Users } from "../models/user.model.js";

export const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        await Users.syncIndexes();
        console.log("Database connected successfully and indexes synced");
    }catch(err){
        console.error("Database connection failed", err);
        process.exit(1);
    }
}