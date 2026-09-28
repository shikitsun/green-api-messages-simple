import type { ComponentProps, PropsWithChildren } from "react";

export function ButtonIcon({
  children,
  className = "",
  ...props
}: PropsWithChildren<ComponentProps<"button">>) {
  return (
    // could be used classNames or clsx / variants
    <button className={`button button--xsmall ${className}`} {...props}>
      <svg
        className="shape"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 52 52"
        fill="none"
        width="32"
        height="32"
      >
        <path
          d="M26 0C30.8966 0 35.6698 0.794071 40.0291 3.12545C43.8424 5.16485 46.8352 8.15757 48.8746 11.9709C51.2059 16.3302 52 21.1034 52 26C52 31.4424 50.9139 36.2158 48.8746 40.0291C46.8352 43.8424 43.8424 46.8352 40.0291 48.8745C35.6698 51.2059 30.8966 52 26 52C20.5576 52 15.7842 50.9139 11.9709 48.8745C8.15757 46.8352 5.16485 43.8424 3.12545 40.0291C0.786468 35.6556 0.0294538 30.9057 0 26C0 20.5576 1.08606 15.7842 3.12545 11.9709C5.16485 8.15757 8.15757 5.16485 11.9709 3.12545C15.7842 1.08606 20.5576 0 26 0Z"
          fill="var(--button-background-color)"
        ></path>
      </svg>

      {children}
    </button>
  );
}
