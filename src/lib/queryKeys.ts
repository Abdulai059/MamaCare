export const queryKeys = {
  all: ["app"] as const,

  auth: () => [...queryKeys.all, "auth"] as const,
  authUser: () => [...queryKeys.auth(), "user"] as const,
};
