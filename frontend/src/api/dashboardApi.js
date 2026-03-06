import API from "./axiosConfig";

export const getDashboardMetrics = () => API.get("/dashboard");