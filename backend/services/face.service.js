import axios from "axios";
import FormData from "form-data";

const PYTHON_SERVICE_URL = process.env.FACE_SERVICE_URL || "http://localhost:8001";

export const uploadFaceEmbedding = async (faceEmbedding) => {
    if (!faceEmbedding || !Array.isArray(faceEmbedding)) {
        throw new Error("Invalid face embedding provided");
    }
    return faceEmbedding;
};

// Sends a selfie image to the Python face-recognition service and
// returns the 128-dimension embedding vector.
export const getFaceEmbedding = async (imageBuffer) => {
    if (!imageBuffer) {
        throw new Error("Selfie image is required");
    }

    const form = new FormData();
    form.append("image", imageBuffer, { filename: "selfie.jpg" });

    const { data } = await axios.post(`${PYTHON_SERVICE_URL}/embed`, form, {
        headers: form.getHeaders()
    });

    if (!data || !Array.isArray(data.embedding)) {
        throw new Error("Invalid response from face service");
    }

    return data.embedding;
};

// Sends a selfie plus the stored embeddings to the Python service, where
// DeepFace compares them and returns the closest match.
export const verifyFaceWithDeepFace = async (imageBuffer, storedEmbeddings) => {
    if (!imageBuffer || !Array.isArray(storedEmbeddings) || storedEmbeddings.length === 0) {
        throw new Error("Selfie image and stored embeddings are required");
    }

    const form = new FormData();
    form.append("image", imageBuffer, { filename: "selfie.jpg" });
    form.append("stored_embeddings", JSON.stringify(storedEmbeddings));

    const { data } = await axios.post(`${PYTHON_SERVICE_URL}/verify`, form, {
        headers: form.getHeaders()
    });

    if (!data || typeof data.match !== "boolean") {
        throw new Error("Invalid response from face service");
    }

    return data;
};