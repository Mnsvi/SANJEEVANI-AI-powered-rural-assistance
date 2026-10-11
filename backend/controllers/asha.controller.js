import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";
import { getAshaWorkers, createAshaWorker } from "../services/asha.service.js";

export const listAshaWorkers = asyncHandler(async (req, res) => {
    const ashaWorkers = await getAshaWorkers();
    successResponse(res, 200, { ashaWorkers });
});

export const addAshaWorker = asyncHandler(async (req, res) => {
    const ashaWorker = await createAshaWorker(req.body);
    successResponse(res, 201, { ashaWorker });
});