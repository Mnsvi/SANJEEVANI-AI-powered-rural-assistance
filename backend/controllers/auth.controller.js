import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";
import { AppError } from "../utils/AppError.js";
import { Users as User } from "../models/user.model.js";
import { signup, login, verifyFaceIdentity, signToken } from "../services/auth.service.js";
import { getFaceEmbedding, verifyFaceWithDeepFace } from "../services/face.service.js";
import jwt from "jsonwebtoken";

export const signUp = asyncHandler(async (req, res) => {
    const result = await signup(req.body);
    successResponse(res, 201, result);
});

export const signIn = asyncHandler(async (req, res) => {
    const result = await login(req.body);
    successResponse(res, 200, result);
});

// Registers the face embedding for the logged-in user.
export const registerFace = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new AppError("Selfie image is required", 400);
    }

    const embedding = await getFaceEmbedding(req.file.buffer);

    await User.findByIdAndUpdate(req.user.id, { faceEmbedding: embedding });

    successResponse(res, 200, { message: "Face registered successfully" });
});

// Verifies identity from a selfie. The live embedding is computed by the
// Python service and matched against stored embeddings with DeepFace.
export const verifyFace = asyncHandler(async (req, res) => {
    // Legacy path: client already computed the embedding.
    if (req.body.liveEmbedding) {
        const user = await verifyFaceIdentity(req.body.liveEmbedding);
        return respond(user, res);
    }

    if (!req.file) {
        throw new AppError("Selfie image or live embedding is required", 400);
    }

    const users = await User.find({}).select("faceEmbedding fullName mobile villageCode email");
    const embeddings = users
        .map((u) => u.faceEmbedding)
        .filter((e) => Array.isArray(e) && e.length > 0);

    if (embeddings.length === 0) {
        return res.status(404).json({
            success: false,
            message: "New Registration Required"
        });
    }

    const result = await verifyFaceWithDeepFace(req.file.buffer, embeddings);
    const matchedUser = result.match ? users[result.index] : null;

    return respond(matchedUser, res);
});

const respond = (user, res) => {
    if (!user) {
        return res.status(404).json({
            success: false,
            message: "New Registration Required"
        });
    }
    const token = signToken(user);
    const userObj = user.toObject ? user.toObject() : { ...user };
    delete userObj.password;
    delete userObj.faceEmbedding;
    delete userObj.biometricTemplate;

    return res.status(200).json({
        success: true,
        message: "Verified",
        data: { user: userObj, token }
    });
};