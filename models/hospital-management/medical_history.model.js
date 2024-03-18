import mongoose from "mongoose";

const medicalHistorySchema = mongoose.Schema({}, { timestamps: true });

export const medicalHistory = mongoose.model("medicalHistory", medicalHistorySchema);