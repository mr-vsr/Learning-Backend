import mongoose, { Schema } from 'mongoose';

const medicalRecordSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
    },
    hospital: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Hospital"
    },
    comment: {
        type: String,
        required:true
    },
    consultingDoctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Doctor"
    },
    medicalHistory: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"MedicalRecord"
    }
}, { timestamps: true });

export const MedicalRecord = mongoose.model(
    'MedicalRecord',
    medicalRecordSchema
);