import jwt from "jsonwebtoken";
import { Users as User } from "../models/user.model.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        throw new AppError("Not authorized, token missing", 401);
    }

    const secret = process.env.JWT_SECRET || "sanjeevni_jwt_secret_key_2026";
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id).select("-password -faceEmbedding -biometricTemplate");
    if (!user) {
        throw new AppError("Not authorized, user not found", 401);
    }

    req.user = user;
    next();
});