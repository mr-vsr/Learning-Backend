import mongoose from "mongoose";

const categorySchema = mongoose.Schema({}, { timestamps: true });

const Category = mongoose.model("Category", categorySchema);