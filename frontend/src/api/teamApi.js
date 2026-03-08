import API from "./axiosConfig";

export const getTeam = () => API.get("/team");
export const addTeamMember = (data) => API.post("/team", data);
export const removeTeamMember = (id) => API.delete(`/team/${id}`);
export const getTeamMemberById = (id) => API.get(`/team/${id}`);
export const updateTeamMember = (id, data) => API.put(`/team/${id}`, data);