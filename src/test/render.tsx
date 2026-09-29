import type { ReactElement, ReactNode } from "react";
import { render, renderHook } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import { createQueryClient } from "@/app/providers/queryClient";
import { Toaster } from "@/shared/ui/Toaster";

export function createTestQueryClient() {
  return createQueryClient({
    queries: { retry: false, gcTime: 0, staleTime: 0 },
  });
}

interface IProviderOptions {
  route?: string;
  queryClient?: ReturnType<typeof createTestQueryClient>;
}

function createWrapper({ route = "/", queryClient }: IProviderOptions = {}) {
  const client = queryClient ?? createTestQueryClient();

  return {
    client,
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={[route]}>
          {children}
          <Toaster />
        </MemoryRouter>
      </QueryClientProvider>
    ),
  };
}

export function renderWithProviders(
  ui: ReactElement,
  options: IProviderOptions = {},
) {
  const { wrapper, client } = createWrapper(options);

  return { queryClient: client, ...render(ui, { wrapper }) };
}

export function renderHookWithProviders<Result, Props>(
  hook: (props: Props) => Result,
  options: IProviderOptions = {},
) {
  const { wrapper, client } = createWrapper(options);

  return { queryClient: client, ...renderHook(hook, { wrapper }) };
}
