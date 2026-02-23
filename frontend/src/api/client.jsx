import apiUser from "./apiUser";

export const getClients = () => apiUser.get("/clients");
export const createClient = (data) => apiUser.post("/clients", data);
export const updateClient = (id, data) => apiUser.put(`/clients/${id}`, data);
export const deleteClient = (id) => apiUser.delete(`/clients/${id}`);
