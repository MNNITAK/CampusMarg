"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PathResult = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const PathStepSchema = new mongoose_1.Schema({
    from: { type: String, required: true },
    to: { type: String, required: true },
    coordinates: [
        {
            x: { type: Number, required: true },
            y: { type: Number, required: true },
            floor: { type: Number, required: true },
        },
    ],
    instruction: { type: String },
}, { _id: false } // don’t create separate _id for each step
);
const PathResultSchema = new mongoose_1.Schema({
    mode: {
        type: String,
        enum: ["normal", "wheelchair", "emergency"],
        default: "normal",
    },
    path: { type: [PathStepSchema], required: true },
    totalDistance: { type: Number, required: true },
    totalTime: { type: Number },
    cached: { type: Boolean, default: false },
}, { timestamps: true });
exports.PathResult = mongoose_1.default.models.PathResult ||
    mongoose_1.default.model("PathResult", PathResultSchema);
