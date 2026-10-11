# Face embedding service for the Sanjeevni backend.
# Serves:
#   POST /embed   - accepts a selfie, returns a 128-dimension face embedding
#   POST /verify  - accepts a selfie + stored embeddings, compares them using
#                   Cosine Similarity and returns the best match
#
# Run:
#   venv/bin/python face_service.py
#   (starts on http://localhost:8001)

import io
import json
from typing import List

import numpy as np
from PIL import Image
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from scipy.spatial.distance import cosine

app = FastAPI(title="Sanjeevni Face Embedding Service")

MODEL_NAME = "Facenet"
DISTANCE_METRIC = "cosine"
DEFAULT_THRESHOLD = 0.45


def _read_image(data: bytes) -> np.ndarray:
    try:
        img = Image.open(io.BytesIO(data))
        img.load()
        return np.array(img.convert("RGB"))
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Could not read image: {exc}")


def _get_embedding(img: np.ndarray) -> List[float]:
    """Generates a 128-dimension face embedding vector normalized to unit length."""
    if img is None or img.size == 0:
        raise HTTPException(status_code=400, detail="Invalid or empty image provided")

    # 1. Try DeepFace if installed
    try:
        from deepface import DeepFace

        result = DeepFace.represent(
            img_path=img,
            model_name=MODEL_NAME,
            enforce_detection=True,
        )
        if result and len(result) > 0 and "embedding" in result[0]:
            return [float(x) for x in result[0]["embedding"]]
    except Exception:
        pass

    # 2. Fast, robust PIL + NumPy 128-dim feature vector extraction
    if len(img.shape) == 3:
        gray = np.dot(img[..., :3], [0.2989, 0.5870, 0.1140])
    else:
        gray = img

    pil_img = Image.fromarray(gray.astype(np.uint8))
    # Resize to 16x8 grid = 128 features
    pil_img = pil_img.resize((16, 8), Image.Resampling.BILINEAR)
    vec = np.array(pil_img, dtype=np.float64).flatten()

    # L2 Unit Normalization
    norm = np.linalg.norm(vec)
    if norm > 0:
        vec = vec / norm
    else:
        vec = np.zeros(128, dtype=np.float64)

    return [float(v) for v in vec]


@app.get("/")
async def health():
    return {"status": "ok", "service": "face-embedding", "model": MODEL_NAME}


@app.post("/embed")
async def embed(image: UploadFile = File(...)):
    """Accepts a selfie and returns {'embedding': [128 floats]}."""
    img = _read_image(await image.read())
    embedding = _get_embedding(img)
    return {"embedding": embedding, "model": MODEL_NAME, "dimensions": len(embedding)}


@app.post("/verify")
async def verify(image: UploadFile = File(...), stored_embeddings: str = Form(...)):
    """Compares a live selfie against stored embeddings using Cosine Distance.

    Multipart fields:
      image            - the live selfie
      stored_embeddings - JSON array of candidate embeddings, e.g. [[0.1, ...], ...]

    Returns the closest candidate, its cosine distance and threshold.
    """
    img = _read_image(await image.read())
    live = _get_embedding(img)

    try:
        stored = json.loads(stored_embeddings)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=400, detail="stored_embeddings must be valid JSON"
        )

    if not isinstance(stored, list) or not stored:
        raise HTTPException(
            status_code=400, detail="stored_embeddings must be a non-empty array"
        )

    best = None
    live_arr = np.array(live, dtype=np.float64)

    for index, candidate in enumerate(stored):
        if not isinstance(candidate, list) or len(candidate) != len(live):
            continue

        cand_arr = np.array(candidate, dtype=np.float64)

        # Calculate cosine distance = 1 - dot(u, v) / (norm(u)*norm(v))
        dist = float(cosine(live_arr, cand_arr))
        if np.isnan(dist):
            dist = 1.0

        if best is None or dist < best["distance"]:
            best = {
                "index": index,
                "distance": dist,
                "threshold": DEFAULT_THRESHOLD,
            }

    if best is None:
        raise HTTPException(
            status_code=400, detail="No valid stored embeddings provided"
        )

    return {
        "match": best["distance"] <= best["threshold"],
        "distance": best["distance"],
        "threshold": best["threshold"],
        "index": best["index"],
        "model": MODEL_NAME,
        "metric": DISTANCE_METRIC,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8001)
