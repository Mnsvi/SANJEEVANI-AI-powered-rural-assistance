import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";
import { registerUser } from "../services/user.service.js";

export const register = asyncHandler(async (req, res) => {
    const result = await registerUser(req.body);
    successResponse(res, 201, result);
});