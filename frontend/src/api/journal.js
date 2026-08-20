import apiClient from "./client";

export const createJournalEntry = (data) => apiClient.post("/journal", data).then((r) => r.data.entry);
export const listJournalEntries = (params = {}) =>
  apiClient.get("/journal", { params }).then((r) => r.data);
export const getJournalEntry = (id) => apiClient.get(`/journal/${id}`).then((r) => r.data.entry);
export const updateJournalEntry = (id, data) =>
  apiClient.put(`/journal/${id}`, data).then((r) => r.data.entry);
export const deleteJournalEntry = (id) => apiClient.delete(`/journal/${id}`);
