import apiClient from "./client";

export async function registerRequest({ name, email, password }) {
  const { data } = await apiClient.post("/auth/register", { name, email, password });
  return data;
}

export async function loginRequest({ email, password }) {
  const { data } = await apiClient.post("/auth/login", { email, password });
  return data;
}

export async function logoutRequest() {
  await apiClient.post("/auth/logout");
}

export async function fetchProfile() {
  const { data } = await apiClient.get("/user/profile");
  return data.user;
}
