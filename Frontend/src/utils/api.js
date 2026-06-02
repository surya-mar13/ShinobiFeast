export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const request = async (url, options = {}) => {
  const response = await fetch(`${BASE_URL}${url}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
};

// For file uploads — sends FormData, lets browser set Content-Type with boundary
const uploadRequest = async (url, formData) => {
  const response = await fetch(`${BASE_URL}${url}`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Upload failed");
  return data;
};

export const api = {
  get: (url) => request(url),
  post: (url, body) => request(url, { method: "POST", body: JSON.stringify(body) }),
  put: (url, body) => request(url, { method: "PUT", body: JSON.stringify(body) }),
  delete: (url) => request(url, { method: "DELETE" }),
  upload: (url, file) => {
    const fd = new FormData();
    fd.append("image", file);
    return uploadRequest(url, fd);
  },
};
