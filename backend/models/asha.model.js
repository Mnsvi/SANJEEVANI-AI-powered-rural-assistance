// Schema for local health workers

import mongoose from "mongoose";

const ashaWorkerSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    mobile: {
        type: String,
        required: true,
        unique: true
    },
    villageCode: {
        type: String,
        required: true,
        index: true // Indexed for fast lookup when a consultation ends
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    // Track current assignments to manage workload
    activeTasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "consultation"
    }]
}, { timestamps: true });

export const AshaWorkers = mongoose.model("AshaWorker", ashaWorkerSchema);