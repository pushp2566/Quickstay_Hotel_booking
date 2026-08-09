import mongoose from "mongoose";
import { randomUUID } from "node:crypto";
const { Schema } = mongoose;

const hotelSchema = new Schema(
  {
    _id: { type: String, default: randomUUID },
    name: { type: String, required: true },
    address: { type: String, required: true },
    contact: { type: String, required: true },
    owner: { type: String, ref: "User", required: true },
    city: { type: String, required: true },
  },
  { timestamps: true }
);

const Hotel = mongoose.model("Hotel", hotelSchema);

export default Hotel
