// Schema for AI summaries & doctor status
import mongoose from "mongoose";

const consultationSchema = new mongoose.Schema({
    patientId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    symptomsSummary: {
        type: [String],
        default: []
    },
    aiDiagnosisBrief: {
        type: String
    },
    // ADDED: Priority field for Medical Triage
    priority: {
        type: String,
        enum: ["Low", "Medium", "High", "Emergency"],
        default: "Low"
    },
    status: {
        type: String,
        enum: ["Pending_AI", "Awaiting_Doctor", "Consultation_Complete", "Medicine_Delivered"],
        default: "Pending_AI"
    },
    ashaWorkerAssigned: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AshaWorker"
    }
}, { timestamps: true });

export const Consultations = mongoose.model("consultation", consultationSchema);