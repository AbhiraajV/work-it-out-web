import { UserButton } from "@clerk/nextjs";
import React from "react";

type Props = {};

function Navbar({}: Props) {
  return (
    <div className="w-[90%] lg:w-[70%] md:h-70px md:py-8 py-3 ml-[5%] lg:ml-[15%] md:px-0 flex items-center text-sm font-semibold justify-center">
      <div className="flex-1 flex items-center font-bold text-lg">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgb(147,51,234)"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          className="lucide lucide-dumbbell rotate-45"
        >
          <path d="M14.4 14.4 9.6 9.6" />
          <path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z" />
          <path d="m21.5 21.5-1.4-1.4" />
          <path d="M3.9 3.9 2.5 2.5" />
          <path d="M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829l2.828-2.828a2 2 0 1 1 2.829 2.828l1.767-1.768a2 2 0 1 1 2.829 2.829z" />
        </svg>
        <span className="cursor-pointer">Train IQ</span>
      </div>

      <div className="flex-none ml-auto">
        <UserButton afterSignOutUrl="/" />
      </div>
    </div>
  );
}

export default Navbar;
