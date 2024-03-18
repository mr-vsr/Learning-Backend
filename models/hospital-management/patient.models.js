import mongoose from "mongoose";

const pateintSchema = mongoose.Schema({}, { timestamps: true });

export const Patient = mongoose.model("Patient", pateintSchema);