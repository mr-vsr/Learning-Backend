import mongoose from "mongoose";

const orderSchema = mongoose.Schema({}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);