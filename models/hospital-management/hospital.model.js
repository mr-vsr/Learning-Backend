import mongoose from "mongoose";

const hospitalSchema = mongoose.Schema({}, { timestamps: true });

export const Hospital = mongoose.model("Hospital", hospitalSchema);