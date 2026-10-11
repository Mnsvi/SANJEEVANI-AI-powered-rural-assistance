import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { listAshaWorkers, addAshaWorker } from "../controllers/asha.controller.js";

const router = express.Router();

router.use(protect);

router.get("/", listAshaWorkers);
router.post("/", addAshaWorker);

export default router;