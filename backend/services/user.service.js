import { Users as User } from "../models/user.model.js";
import { AppError } from "../utils/AppError.js";
import { uploadFaceEmbedding } from "./face.service.js";

export const registerUser = async ({
    fullName,
    mobile,
    address,
    aadhar,
    email,
    password,
    villageCode,
    faceEmbedding,
    biometricTemplate
}) => {
    if (!fullName || !mobile || !address || !aadhar || !email || !password || !villageCode || !faceEmbedding) {
        throw new AppError("All fields are required", 400);
    }

    const existingUser = await User.findOne({ $or: [{ email }, { aadhar }, { mobile }] });
    if (existingUser) {
        throw new AppError("User already registered", 400);
    }

    await uploadFaceEmbedding(faceEmbedding);

    const newUser = await User.create({
        fullName,
        mobile,
        address,
        aadhar,
        email,
        password,
        villageCode,
        faceEmbedding,
        biometricTemplate
    });

    return { userId: newUser._id, message: "User registered successfully" };
};

export const findUserById = async (id) => {
    const user = await User.findById(id).select("-password -faceEmbedding -biometricTemplate");
    if (!user) {
        throw new AppError("User not found", 404);
    }
    return user;
};

export const findUserByEmail = async (email) =>
    User.findOne({ email }).select("-password -faceEmbedding -biometricTemplate");

export const updateLastConsultation = async (id) =>
    User.findByIdAndUpdate(id, { lastConsultation: new Date() }, { new: true });