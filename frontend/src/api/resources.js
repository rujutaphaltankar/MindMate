import apiClient from "./client";

export const getResources = () => apiClient.get("/resources").then((r) => r.data.resources);
