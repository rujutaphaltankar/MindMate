import apiClient from "./client";

export const deleteJournalData = () => apiClient.delete("/privacy/journal");
export const deleteAccount = () => apiClient.delete("/privacy/account");
export const exportUserData = () =>
  apiClient.get("/privacy/export", { responseType: "blob" });
