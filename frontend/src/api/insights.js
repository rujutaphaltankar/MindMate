import apiClient from "./client";

export const getInsights = () => apiClient.get("/insights").then((r) => r.data);
export const getRecommendations = () =>
  apiClient.get("/insights/recommendations").then((r) => r.data.recommendations);
