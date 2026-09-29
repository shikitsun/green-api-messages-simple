import { UNEXPECTED_ERROR } from "./errorMessage";
import { useToasts } from "@/shared/model/useToasts";

export function registerUnhandledRejectionReporter(
  target: Pick<Window, "addEventListener"> = window,
) {
  target.addEventListener("unhandledrejection", (event) => {
    const { reason } = event as PromiseRejectionEvent;

    console.error("Unhandled promise rejection:", reason);
    useToasts.getState().push("error", UNEXPECTED_ERROR);
  });
}
