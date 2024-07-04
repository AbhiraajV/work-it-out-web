import { currentProfile } from "@/lib/current-profile";
import Profile from "./Profile";
import { navs } from "@/lib/template.util";
import Tracker from "./Tracker";
import { Toaster } from "../ui/toaster";
import Favourite from "./Favourite";

async function RightMain({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const nav = searchParams && searchParams.nav;
  const curNav = navs.find((navEl) => navEl.nav === nav);
  const user = await currentProfile();

  return (
    <div
      className="w-[100%] h-[100vh] p-3 transition-all text-black md:pt-6 md:p-6 relative"
      style={{
        // backgroundColor: bg,
        transition: "background-color 6s ease",
      }}
    >
      <Toaster />

      <span className="font-extrabold text-3xl md:text-5xl hidden md:inline-block">
        {curNav?.title + " " + curNav?.titlePt2}
      </span>
      {nav === "profile" && <Profile user={user} />}
      {nav === "tracker" && user && <Tracker user={user} />}
      {nav === "favourite" && user && (
        <Favourite
          user={user}
          workoutHistoryId={(searchParams?.whifw as string) || ""}
        />
      )}
    </div>
  );
}

export default RightMain;
