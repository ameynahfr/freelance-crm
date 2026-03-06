import API from "./axiosConfig";

export const getInvoices = () => API.get("/invoices");
export const getInvoiceById = (id) => API.get(`/invoices/${id}`);
export const createInvoice = (projectId, data) => API.post(`/invoices/project/${projectId}`, data);
export const updateInvoiceStatus = (id, status) => API.put(`/invoices/${id}/status`, { status });
export const sendInvoiceEmail = (id) => API.post(`/invoices/${id}/send`);

// For PDF download, we need specific responseType
export const downloadInvoicePDF = (id) => API.get(`/invoices/${id}/pdf`, { responseType: "blob" });