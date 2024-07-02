import { UserButton } from "@clerk/nextjs";
import React from "react";

type Props = {};

function Navbar({}: Props) {
  return (
    <div className="w-[90%] lg:w-[70%] md:h-70px md:py-8 py-3 ml-[5%] lg:ml-[15%] md:px-0 flex items-center text-sm font-semibold justify-center">
      <div className="flex-1 font-bold text-2xl">
        <span className="cursor-pointer">Work-It-Out</span>
      </div>

      <div className="flex-none ml-auto">
        <UserButton afterSignOutUrl="/" />
      </div>
    </div>
  );
}

export default Navbar;
