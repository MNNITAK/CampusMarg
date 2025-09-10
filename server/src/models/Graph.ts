
import mongoose, { Schema, Document } from "mongoose";
import { INode} from "./Node";
import { IEdge } from "./Edge";


export interface IGraph extends Document {
  nodes: INode[];  
  edges: IEdge[];  
}


const GraphSchema: Schema = new Schema(
  {
    nodes: [
      {
        id: { type: String, required: true },
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
    ],
    edges: [
      {
        from: { type: String, required: true },
        to: { type: String, required: true },
        weight: { type: Number, required: true },
        bidirectional: { type: Boolean, default: true },
      },
    ],
  },
  { timestamps: true }
);

export const GraphModel = mongoose.model<IGraph>("Graph", GraphSchema);
