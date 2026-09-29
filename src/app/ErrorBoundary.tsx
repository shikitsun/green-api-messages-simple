import { Component, type ErrorInfo, type ReactNode } from "react";
import { UNEXPECTED_ERROR } from "@/shared/lib/errorMessage";
import styles from "./ErrorBoundary.module.css";

interface IErrorBoundaryProps {
  children: ReactNode;
}

interface IErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<
  IErrorBoundaryProps,
  IErrorBoundaryState
> {
  state: IErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): IErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Render error:", error, info.componentStack);
  }

  render() {
    const { error } = this.state;

    if (!error) return this.props.children;

    return (
      <div className={styles.container} role="alert">
        <p className="subheader text-center">{UNEXPECTED_ERROR}</p>
        <p className="description text-tertiary text-center">{error.message}</p>
        <button
          type="button"
          className="button button--large"
          onClick={() => window.location.reload()}
        >
          Reload
        </button>
      </div>
    );
  }
}
