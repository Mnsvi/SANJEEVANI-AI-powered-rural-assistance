import { AshaWorkers } from "../models/asha.model.js";

export const getAshaWorkers = async () => AshaWorkers.find({});

export const createAshaWorker = async (data) => AshaWorkers.create(data);