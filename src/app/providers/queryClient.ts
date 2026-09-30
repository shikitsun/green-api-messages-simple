import {
  QueryCache,
  QueryClient,
  type QueryClientConfig,
} from "@tanstack/react-query";
import { ApiError } from "@/shared/api/errors";
import { toErrorMessage } from "@/shared/lib/errorMessage";
import { useToasts } from "@/shared/model/useToasts";

export function createQueryClient(
  defaultOptions?: QueryClientConfig["defaultOptions"],
) {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        if (error instanceof ApiError && error.isUnauthorized) return;

        useToasts.getState().push("error", toErrorMessage(error));
      },
    }),
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
        ...defaultOptions?.queries,
      },
    },
  });
}

export const queryClient = createQueryClient();
