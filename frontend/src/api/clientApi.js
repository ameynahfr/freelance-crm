import API from "./axiosConfig";

export const getClients = () => API.get("/clients");
export const getClientById = (id) => API.get(`/clients/${id}`);
export const createClient = (data) => API.post("/clients", data);
export const updateClient = (id, data) => API.put(`/clients/${id}`, data);
export const deleteClient = (id) => API.delete(`/clients/${id}`);