import { Consultations } from "../models/consultation.model.js";

export const getConsultations = async (filter = {}) => Consultations.find(filter).populate("patientId", "-password -faceEmbedding").populate("ashaWorkerAssigned");

export const getConsultationById = async (id) => Consultations.findById(id).populate("patientId", "-password -faceEmbedding").populate("ashaWorkerAssigned");

export const createConsultation = async (data) => Consultations.create(data);

export const updateConsultationStatus = async (id, status) => Consultations.findByIdAndUpdate(id, { status }, { new: true });