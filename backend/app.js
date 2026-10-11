import express from "express";
import authRoutes from "./routes/auth.routes.js";
import registrationRoutes from "./routes/registration.routes.js";
import consultationRoutes from "./routes/consultation.routes.js";
import ashaRoutes from "./routes/asha.routes.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";

const app = express();

app.use(express.json());

app.get("/api/demo", (req, res) => {
    res.status(200).json({ success: true, message: "Hello from the backend!" });
});

app.use("/api/auth", authRoutes);
app.use("/api/register", registrationRoutes);
app.use("/api/consultations", consultationRoutes);
app.use("/api/asha", ashaRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;