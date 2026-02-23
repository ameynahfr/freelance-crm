import apiUser from "./apiUser.jsx";

export const loginUser = (data) => apiUser.post("/auth/login", data);
export const registerUser = (data) => apiUser.post("/auth/register", data);
