"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// console.log("MONGO_URI:", process.env.MONGO_URI);
const connectDB = async () => {
    try {
        await mongoose_1.default.connect("mongodb+srv://ay9120991471:buT79FVlBXLjNkih@layers3.b8alkk6.mongodb.net/");
        console.log(" MongoDB connected successfully");
    }
    catch (error) {
        console.error(" MongoDB connection failed:", error.message);
        process.exit(1);
    }
};
exports.default = connectDB;
