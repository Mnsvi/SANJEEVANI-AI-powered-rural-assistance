import mongoose from "mongoose";
import dotenv from "dotenv";
import { Users as User } from "./models/user.model.js";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";

dotenv.config();

async function seed() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB.");

        const count = await User.countDocuments();
        if (count > 0) {
            console.log(`Database already has ${count} user(s).`);
            const users = await User.find({}).select("fullName email villageCode faceEmbedding");
            console.log("Existing Users:", users.map(u => ({
                id: u._id,
                fullName: u.fullName,
                email: u.email,
                hasEmbedding: Array.isArray(u.faceEmbedding) && u.faceEmbedding.length === 128
            })));
        }

        // Check if test user exists
        let testUser = await User.findOne({ email: "patient.sanjeevani@health.org" });
        if (!testUser) {
            console.log("Creating seed test user in MongoDB...");

            // Try to get a real 128-dim embedding from face service if possible, or generate normalized 128 vector
            let embedding = null;
            try {
                // If Logo.jpeg or any image exists, let's try getting embedding from python service
                const logoPath = "../frontend/src/assets/Logo.jpeg";
                if (fs.existsSync(logoPath)) {
                    const form = new FormData();
                    form.append("image", fs.readFileSync(logoPath), { filename: "test.jpg" });
                    const res = await axios.post("http://localhost:8001/embed", form, {
                        headers: form.getHeaders()
                    });
                    if (res.data && Array.isArray(res.data.embedding)) {
                        embedding = res.data.embedding;
                    }
                }
            } catch (err) {
                console.log("Could not generate embedding via Python service, using default unit vector:", err.message);
            }

            if (!embedding) {
                // Generate unit vector of length 128
                const arr = new Array(128).fill(0).map((_, i) => Math.sin(i + 1));
                const norm = Math.sqrt(arr.reduce((sum, v) => sum + v * v, 0));
                embedding = arr.map(v => v / norm);
            }

            testUser = await User.create({
                fullName: "Rajesh Kumar",
                mobile: "+91 98765 43210",
                address: "Plot 42, Gram Panchayat",
                aadhar: 123456789012,
                email: "patient.sanjeevani@health.org",
                password: "Password123!",
                villageCode: "VIL-108",
                faceEmbedding: embedding,
                biometricTemplate: "BIO-TEMPLATE-001",
                lastConsultation: new Date()
            });
            console.log("Successfully seeded test user:", testUser.fullName, `(${testUser.email})`);
        } else {
            console.log("Seed user already exists:", testUser.fullName);
        }
    } catch (error) {
        console.error("Error seeding user:", error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

seed();
