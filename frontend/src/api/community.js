import apiClient from "./client";

export const listPosts = (params = {}) => apiClient.get("/community", { params }).then((r) => r.data);
export const createPost = (data) => apiClient.post("/community", data).then((r) => r.data.post);
export const likePost = (id) => apiClient.post(`/community/${id}/like`).then((r) => r.data.post);
export const deletePost = (id) => apiClient.delete(`/community/${id}`);
export const listComments = (postId) =>
  apiClient.get(`/community/${postId}/comments`).then((r) => r.data.comments);
export const createComment = (postId, text) =>
  apiClient.post(`/community/${postId}/comments`, { text }).then((r) => r.data.comment);
export const reportPost = (postId, reason) => apiClient.post(`/community/${postId}/report`, { reason });
