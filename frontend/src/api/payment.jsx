import apiUser from "./apiUser";

// Create Stripe checkout session
export const createCheckoutSession = (data) =>
  apiUser.post("/payments/create-checkout-session", data);
