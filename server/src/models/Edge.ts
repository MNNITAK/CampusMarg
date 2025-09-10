

import mongoose, { Schema, Document } from "mongoose";


export interface IEdge extends Document {
  from: string;               
  to: string;                 
  weight: number;             
  bidirectional?: boolean;    
}


const EdgeSchema: Schema = new Schema(
  {
    from: { type: String, required: true },   
    to: { type: String, required: true },
    weight: { type: Number, required: true },
    bidirectional: { type: Boolean, default: true },
  },
  { timestamps: true }
);


export const EdgeModel = mongoose.model<IEdge>("Edge", EdgeSchema);
