import mongoose from "mongoose";

const customerSchema = mongoose.Schema({}, { timestamps: true });

const Customer = mongoose.model("Customer", customerSchema);