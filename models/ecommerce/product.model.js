import mongoose from "mongoose";

const productSchema = mongoose.Schema({}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);