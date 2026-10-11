import { apiFetch } from './apiClient';

/**
 * Fetch latest consultation for logged-in user with live queue statistics.
 */
export async function getMyLatestConsultation(token) {
  const res = await apiFetch('/api/consultations/my-latest', {
    method: 'GET',
    token,
  });
  if (res.data) {
    return {
      ...res,
      consultation: res.data.consultation ?? res.consultation,
      queuePosition: res.data.queuePosition ?? res.queuePosition,
      totalInQueue: res.data.totalInQueue ?? res.totalInQueue,
      estimatedWaitMinutes: res.data.estimatedWaitMinutes ?? res.estimatedWaitMinutes,
    };
  }
  return res;
}

/**
 * Submit new consultation / intake card.
 */
export async function createConsultation(consultationData, token) {
  const res = await apiFetch('/api/consultations', {
    method: 'POST',
    token,
    body: JSON.stringify(consultationData),
  });
  if (res.data) {
    return {
      ...res,
      consultation: res.data.consultation ?? res.consultation,
    };
  }
  return res;
}

/**
 * Update consultation status (e.g. Awaiting_Doctor, Consultation_Complete).
 */
export async function updateConsultationStatus(id, status, token) {
  const res = await apiFetch(`/api/consultations/${id}/status`, {
    method: 'PATCH',
    token,
    body: JSON.stringify({ status }),
  });
  if (res.data) {
    return {
      ...res,
      consultation: res.data.consultation ?? res.consultation,
    };
  }
  return res;
}

/**
 * Fetch Asha workers list.
 */
export async function getAshaWorkers(token) {
  const res = await apiFetch('/api/asha', {
    method: 'GET',
    token,
  });
  if (res.data) {
    return {
      ...res,
      ashaWorkers: res.data.ashaWorkers ?? res.ashaWorkers,
    };
  }
  return res;
}
