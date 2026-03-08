import API from "./axiosConfig";

export const getNotifications = () => API.get("/notifications");
export const markNotificationRead = (id) => API.put(`/notifications/${id}/read`);
export const clearAllNotifications = () => API.put("/notifications/clear");