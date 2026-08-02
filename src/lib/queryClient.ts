// lib/queryClient.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 30, // 30s — tune per data type, this is a sane global default
      gcTime: 1000 * 60 * 5, // keep unused cache 5 min, helps back/forward nav feel instant
    },
    mutations: {
      retry: 1,
    },
  },
});
