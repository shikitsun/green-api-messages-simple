import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router";
import { ErrorBoundary } from "../ErrorBoundary";
import { useSessionTeardown } from "../model/useSessionTeardown";
import { Toaster } from "@/shared/ui/Toaster";
import { queryClient } from "./queryClient";

interface IAppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders = ({ children }: IAppProvidersProps) => {
  useSessionTeardown();

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <BrowserRouter>
          {children}
          <Toaster />
        </BrowserRouter>
      </ErrorBoundary>
    </QueryClientProvider>
  );
};
