import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { listConsultations, submitConsultation, getMyLatestConsultation, updateStatus } from "../controllers/consultation.controller.js";

const router = express.Router();

router.use(protect);

router.get("/", listConsultations);
router.post("/", submitConsultation);
router.get("/my-latest", getMyLatestConsultation);
router.patch("/:id/status", updateStatus);

export default router;