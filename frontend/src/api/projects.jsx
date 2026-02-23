import apiUser from "./apiUser";

export const getProjects = () => apiUser.get("/projects");
export const createProject = (data) => apiUser.post("/projects", data);
export const updateProject = (id, data) => apiUser.put(`/projects/${id}`, data);
export const deleteProject = (id) => apiUser.delete(`/projects/${id}`);

// Invoice for a project
export const createProjectInvoice = (projectId, data) =>
  apiUser.post(`/projects/${projectId}/invoice`, data);
