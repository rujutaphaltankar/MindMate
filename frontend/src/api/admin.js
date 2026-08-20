import apiClient from "./client";

export const getAdminStats = () => apiClient.get("/admin/stats").then((r) => r.data);
export const getAdminReports = (status = "open") =>
  apiClient.get("/admin/reports", { params: { status } }).then((r) => r.data.reports);
export const resolveReport = (id, action) => apiClient.put(`/admin/reports/${id}`, { action });
