/**
 * Backend assumption: subscription-specific checkout endpoints are not in provided swagger.
 */
export const subscriptionsService = {
  plans: async () =>
    Promise.resolve([
      { code: "guest", price: 0, currency: "QAR" },
      { code: "private_paid", price: 100, currency: "QAR" },
      { code: "dealer", price: 1000, currency: "QAR" },
    ]),
};
