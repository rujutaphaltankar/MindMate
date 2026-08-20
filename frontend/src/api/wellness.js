import apiClient from "./client";

export const getWellnessCatalog = () => apiClient.get("/wellness").then((r) => r.data.activities);
export const completeActivity = (id, durationMinutes) =>
  apiClient.post(`/wellness/${id}/complete`, { duration_minutes: durationMinutes }).then((r) => r.data.completion);
export const getWellnessHistory = () => apiClient.get("/wellness/history").then((r) => r.data.history);
