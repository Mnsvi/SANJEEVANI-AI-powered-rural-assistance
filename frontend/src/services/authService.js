import { apiFetch, setStoredToken } from './apiClient';

/**
 * Sends captured selfie image blob to backend for 1:N face verification.
 * @param {Blob} imageBlob - JPEG/PNG image blob captured from webcam
 */
export async function verifyFaceImage(imageBlob) {
  const form = new FormData();
  form.append('selfie', imageBlob, 'selfie.jpg');

  const result = await apiFetch('/api/auth/verify-face', {
    method: 'POST',
    body: form,
  });

  if (result.success && result.data?.token) {
    setStoredToken(result.data.token);
  }

  return result;
}

/**
 * Creates a new user profile on the backend.
 * @param {Object} userData - User registration details
 */
export async function signUpUser(userData) {
  const result = await apiFetch('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData),
  });

  if (result.success && result.data?.token) {
    setStoredToken(result.data.token);
  }

  return result;
}

/**
 * Registers face embedding for authenticated user.
 * @param {Blob} imageBlob - JPEG/PNG image blob
 * @param {string} [token] - Optional explicit JWT token
 */
export async function registerFaceImage(imageBlob, token) {
  const form = new FormData();
  form.append('selfie', imageBlob, 'selfie.jpg');

  return apiFetch('/api/auth/register-face', {
    method: 'POST',
    token,
    body: form,
  });
}
