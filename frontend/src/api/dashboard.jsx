import apiUser from "./apiUser";

export const getDashboardMetrics = () => apiUser.get("/dashboard");
