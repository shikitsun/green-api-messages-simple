import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router";
import { ErrorBoundary } from "../ErrorBoundary";
import { useSessionTeardown } from "../model/useSessionTeardown";
import { Toaster } from "@/shared/ui/Toaster";
import { queryClient } from "./queryClient";

interface IAppProvidersProps {
  children: React.ReactNode;
}

const basename = import.meta.env.BASE_URL;

export const AppProviders = ({ children }: IAppProvidersProps) => {
  useSessionTeardown();

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <BrowserRouter basename={basename}>
          {children}
          <Toaster />
        </BrowserRouter>
      </ErrorBoundary>
    </QueryClientProvider>
  );
};
