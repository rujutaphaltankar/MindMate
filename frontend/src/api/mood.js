import apiClient from "./client";

export const createMoodRecord = (data) => apiClient.post("/mood", data).then((r) => r.data.record);
export const getMoodHistory = (limit = 90) =>
  apiClient.get("/mood", { params: { limit } }).then((r) => r.data.records);
export const updateMoodRecord = (id, data) =>
  apiClient.put(`/mood/${id}`, data).then((r) => r.data.record);
export const deleteMoodRecord = (id) => apiClient.delete(`/mood/${id}`);
