import { fixEx } from "@/components/actions/workout.action";
import RightMain from "@/components/consolidated/RightMain";
import { initiateProfile } from "@/lib/initiate-profile";
import { navs } from "@/lib/template.util";
import { RedirectToSignIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";

export default async function Home({
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const profile = await initiateProfile();
  if (!profile) {
    return (
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    );
  }
  return (
    <div className=" md:w-[90%] w-[100%] lg:w-[70%] lg:ml-[15%] md:ml-[5%] mt-0 md:mt-10 max-h-[100%] md:h-[80vh] overflow-y-hidden">
      {/* <div className="claymorphic rounded-lg overflow-hidden flex flex-col-reverse md:flex-row w-[100%] h-[100%] mt-[-10%] md:mt-0"> */}
      <div
        className="md:w-1/4 w-[100%] bg-[#28282B] md:h-[100%] flex flex-row-reverse
       md:flex-col items-stretch md:items-start py-3
       md:pt-10 px-6 justify-between md:justify-start md:gap-4 
       font-black md:text-sm text-lg fixed bottom-0 md:static z-10 left-0"
      >
        {navs.map((nav) => (
          <span key={nav.nav} className="text-white cursor-pointer">
            <Link href={`/?nav=${nav.nav}`} className=" text-2xl">
              {nav.titleEmoji}
              <span className="hidden md:inline">{nav.title} </span>
              <span className="hidden xl:inline">{nav.titlePt2}</span>
            </Link>
          </span>
        ))}
      </div>
      <div className="flex-1 md:flex-none w-[100%] md:w-auto md:h-[calc(100%-5rem)] h-[100%] overflow-hidden">
        <RightMain searchParams={searchParams} />
      </div>
    </div>
  );
}
