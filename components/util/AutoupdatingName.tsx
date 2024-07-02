"use client";
import React, { useEffect, useRef, useState } from "react";
import { useToast } from "../ui/use-toast";
import { User } from "@prisma/client";
import { updateUsername } from "../actions/profile.action";

type Props = {
  currentUser: User;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
};

function AutoupdatingName({ currentUser, setCurrentUser }: Props) {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const divRef = useRef<HTMLDivElement>(null);

  const { toast } = useToast();

  const handleProfileNameChange = async () => {
    const profileNameDiv = divRef.current;
    const newUsername = profileNameDiv?.innerText.trim() || "";
    if (newUsername.length === 0 || newUsername === currentUser?.username) {
      toast({
        title: "Failed to update username",
        description: "Username cannot be blank or same as the current username",
      });
    }

    if (currentUser?.clerkId) {
      const ret = await updateUsername(
        newUsername,
        currentUser ? currentUser.clerkId : ""
      );
      if (ret.userCreated) {
        setCurrentUser(ret.userCreated ? ret.user : currentUser);
        toast({
          title: "Username updated successfully",
        });
      } else if (ret.failed) {
        setCurrentUser(currentUser);
        toast({
          title: "Failed to update username",
          description: ret.message,
        });
      }
    }
  };
  const scheduleSave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    const newTimeoutId = setTimeout(() => {
      handleProfileNameChange();
    }, 3000);
    setTimeoutId(newTimeoutId);
  };

  useEffect(() => {
    if (divRef.current) {
      divRef.current.addEventListener("input", scheduleSave);
    }

    return () => {
      if (divRef.current) {
        divRef.current.removeEventListener("input", scheduleSave);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);
  return (
    <span className="flex flex-row gap-1 items-center text-xl font-semibold">
      Hi,
      <div
        ref={divRef}
        id="profile_name"
        className="text-xl font-bold border-b-purple-600 border-b-4 border-dashed"
        contentEditable
        style={{ outline: "none" }}
        onBlur={() => handleProfileNameChange()}
        suppressContentEditableWarning={true}
      >
        {currentUser?.username}
      </div>
      {/* <span className="text-4xl inline font-semibold">👋🏻 </span> */}
    </span>
  );
}

export default AutoupdatingName;
