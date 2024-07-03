import React from "react";

type Props = {
  setToggleGrid: React.Dispatch<React.SetStateAction<boolean>>;
  toggleGrid: boolean;
};

function ToggleGridCarousel({ setToggleGrid, toggleGrid }: Props) {
  return (
    <div onClick={() => setToggleGrid(!toggleGrid)}>
      {!toggleGrid ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="black"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          className="lucide lucide-layout-grid"
        >
          <rect width="7" height="7" x="3" y="3" rx="1" />
          <rect width="7" height="7" x="14" y="3" rx="1" />
          <rect width="7" height="7" x="14" y="14" rx="1" />
          <rect width="7" height="7" x="3" y="14" rx="1" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="black"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          className="lucide lucide-gallery-horizontal-end"
        >
          <path d="M2 7v10" />
          <path d="M6 5v14" />
          <rect width="12" height="18" x="10" y="3" rx="2" />
        </svg>
      )}
    </div>
  );
}

export default ToggleGridCarousel;
