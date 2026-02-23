import apiUser from "./apiUser";

export const getInvoices = () => apiUser.get("/invoices");
export const getInvoiceById = (invoiceId) =>
  apiUser.get(`/invoices/${invoiceId}`);
export const createInvoiceForProject = (projectId, data) =>
  apiUser.post(`/invoices/project/${projectId}`, data);
export const updateInvoiceStatus = (invoiceId, data) =>
  apiUser.put(`/invoices/${invoiceId}/status`, data);
export const getInvoicePDF = (invoiceId) =>
  apiUser.get(`/invoices/${invoiceId}/pdf`, { responseType: "blob" });
