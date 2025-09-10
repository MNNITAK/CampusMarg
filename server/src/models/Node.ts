// src/models/NodeModel.ts
import mongoose, { Schema, Document, Model } from "mongoose";


export interface INode extends Document {
  id: string;
  name: string;
  type: "room" | "corridor" | "junction" | "stair" | "lift";
  floor: number;
  coordinates: {
    x: number;
    y: number;
  };
  accessible?: boolean;
}


const NodeSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["room", "corridor", "junction", "stair", "lift"],
      required: true,
    },
    floor: { type: Number, required: true },
    coordinates: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
    },
    accessible: { type: Boolean, default: true },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);


export const Node: Model<INode> =
  mongoose.models.Node || mongoose.model<INode>("Node", NodeSchema);
