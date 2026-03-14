export const API_BASE = typeof __API_BASE__ !== "undefined" ? __API_BASE__ : "";
export const apiFetch = (path, opts) => fetch(`${API_BASE}${path}`, opts);
