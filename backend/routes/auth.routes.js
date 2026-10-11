import express from "express";
import multer from "multer";
import { signUp, signIn, registerFace, verifyFace } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post("/signup", signUp);
router.post("/login", signIn);
router.post("/register-face", protect, upload.single("selfie"), registerFace);
router.post("/verify-face", upload.single("selfie"), verifyFace);

export default router;