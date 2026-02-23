import apiUser from "./apiUser";

export const getPaymentLogs = (params) =>
  apiUser.get("/payment-logs", { params });
export const getPaymentLogByTransactionId = (transactionId) =>
  apiUser.get(`/payment-logs/${transactionId}`);
