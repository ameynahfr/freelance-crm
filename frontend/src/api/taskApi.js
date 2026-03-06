import API from "./axiosConfig";

export const getAllTasks = () => API.get("/tasks/all");
export const getProjectTasks = (projectId) => API.get(`/tasks/project/${projectId}`);
export const getMyTasks = () => API.get("/tasks/my-tasks");
export const createTask = (projectId, data) => API.post(`/tasks/project/${projectId}`, data);
export const updateTask = (id, data) => API.put(`/tasks/${id}`, data);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);