import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";
import { getConsultations, createConsultation, updateConsultationStatus } from "../services/consultation.service.js";
import { Consultations } from "../models/consultation.model.js";

export const listConsultations = asyncHandler(async (req, res) => {
    const consultations = await getConsultations();
    successResponse(res, 200, { consultations });
});

export const submitConsultation = asyncHandler(async (req, res) => {
    const patientId = req.user?._id || req.body.patientId;
    const priority = req.body.priority || req.body.priorityLevel || "Medium";
    const consultation = await createConsultation({
        ...req.body,
        priority,
        patientId
    });
    successResponse(res, 201, { consultation });
});

export const getMyLatestConsultation = asyncHandler(async (req, res) => {
    const patientId = req.user?._id;
    let latest = await Consultations.findOne({ patientId })
        .sort({ createdAt: -1 })
        .populate("patientId", "-password -faceEmbedding")
        .populate("ashaWorkerAssigned");

    // Queue position calculation for Awaiting_Doctor or Pending_AI
    let queuePosition = 1;
    let totalInQueue = 1;
    if (latest) {
        queuePosition = await Consultations.countDocuments({
            status: { $in: ["Pending_AI", "Awaiting_Doctor"] },
            createdAt: { $lt: latest.createdAt }
        }) + 1;
        totalInQueue = await Consultations.countDocuments({
            status: { $in: ["Pending_AI", "Awaiting_Doctor"] }
        });
    }

    successResponse(res, 200, {
        consultation: latest,
        queuePosition,
        totalInQueue,
        estimatedWaitMinutes: queuePosition * 5
    });
});

export const updateStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await updateConsultationStatus(id, status);
    successResponse(res, 200, { consultation: updated });
});