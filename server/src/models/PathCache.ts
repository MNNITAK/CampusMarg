
import mongoose, { Schema, Document, Model } from "mongoose";


export interface IPathStep {
  from: string;
  to: string;
  coordinates: {
    x: number;
    y: number;
    floor: number;
  }[];
  instruction?: string;
}

export interface IPathResult extends Document {
  mode: "normal" | "wheelchair" | "emergency";
  path: IPathStep[];
  totalDistance: number;
  totalTime?: number;
  cached?: boolean;
}


const PathStepSchema = new Schema<IPathStep>(
  {
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
  },
  { _id: false } // don’t create separate _id for each step
);

const PathResultSchema = new Schema<IPathResult>(
  {
    mode: {
      type: String,
      enum: ["normal", "wheelchair", "emergency"],
      default: "normal",
    },
    path: { type: [PathStepSchema], required: true },
    totalDistance: { type: Number, required: true },
    totalTime: { type: Number },
    cached: { type: Boolean, default: false },
  },
  { timestamps: true }
);


export const PathResult: Model<IPathResult> =
  mongoose.models.PathResult ||
  mongoose.model<IPathResult>("PathResult", PathResultSchema);
