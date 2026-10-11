import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Users as User } from "../models/user.model.js";
import { AppError } from "../utils/AppError.js";

export const signToken = (user) => {
    const secret = process.env.JWT_SECRET || "sanjeevni_jwt_secret_key_2026";
    return jwt.sign({ id: user._id || user.id, email: user.email }, secret, { expiresIn: "15m" });
};

export const signup = async (userData) => {
    const { fullName, mobile, address, aadhar, email, password, villageCode } = userData || {};

    if (!fullName || !mobile || !address || !aadhar || !email || !password || !villageCode) {
        throw new AppError("All fields (fullName, mobile, address, aadhar, email, password, villageCode) are required", 400);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new AppError("User with this email already exists", 409);
    }

    const user = await User.create({
        fullName,
        mobile,
        address,
        aadhar: String(aadhar),
        email,
        password,
        villageCode
    });

    const token = signToken(user);
    const userObj = user.toObject();
    delete userObj.password;

    return { token, user: userObj };
};

export const login = async ({ email, password }) => {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        throw new AppError("Invalid credentials", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new AppError("Invalid credentials", 401);
    }

    const token = signToken(user);
    return { token, user };
};

// Finding Euclidean Distance
const calculateDistance = (a, b) =>
    Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));

export const verifyFaceIdentity = async (liveEmbedding) => {
    const users = await User.find({});
    let identifiedUser = null;
    let minDistance = 0.6;

    users.filter(user => Array.isArray(user.faceEmbedding) && user.faceEmbedding.length === liveEmbedding.length).forEach(user => {
        const distance = calculateDistance(liveEmbedding, user.faceEmbedding);
        if (distance < minDistance) {
            minDistance = distance;
            identifiedUser = user;
        }
    });

    return identifiedUser;
};