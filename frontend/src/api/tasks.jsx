import apiUser from "./apiUser";

// Get tasks for a project
export const getTasksByProject = (projectId) =>
  apiUser.get(`/tasks/project/${projectId}`);

export const createTask = (projectId, data) =>
  apiUser.post(`/tasks/project/${projectId}`, data);

export const updateTask = (taskId, data) =>
  apiUser.put(`/tasks/${taskId}`, data);
export const deleteTask = (taskId) => apiUser.delete(`/tasks/${taskId}`);
