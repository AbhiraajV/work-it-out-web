import React from "react";

type Props = {
  maximized: boolean;
};

export default function MaximizeMinimize({ maximized }: Props) {
  if (maximized)
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        className="lucide lucide-shrink"
      >
        <path d="m15 15 6 6m-6-6v4.8m0-4.8h4.8" />
        <path d="M9 19.8V15m0 0H4.2M9 15l-6 6" />
        <path d="M15 4.2V9m0 0h4.8M15 9l6-6" />
        <path d="M9 4.2V9m0 0H4.2M9 9 3 3" />
      </svg>
    );
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      className="lucide lucide-expand"
    >
      <path d="m21 21-6-6m6 6v-4.8m0 4.8h-4.8" />
      <path d="M3 16.2V21m0 0h4.8M3 21l6-6" />
      <path d="M21 7.8V3m0 0h-4.8M21 3l-6 6" />
      <path d="M3 7.8V3m0 0h4.8M3 3l6 6" />
    </svg>
  );
}
