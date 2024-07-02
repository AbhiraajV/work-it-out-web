"use client";
import { User } from "@prisma/client";
import React, { useEffect, useRef, useState } from "react";
import { useToast } from "../ui/use-toast";
import AutoupdatingName from "../util/AutoupdatingName";
import DetailPicker from "../util/DetailPicker";
type Props = {
  user: User | null;
};

export default function Profile({ user }: Props) {
  const [currentUser, setCurrentUser] = useState(user);
  useEffect(() => {
    setCurrentUser(user);
  }, [user]);
  const { toast } = useToast();

  return (
    <div className="flex flex-col gap-2 mt-10">
      {currentUser && (
        <AutoupdatingName
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
        />
      )}
      <DetailPicker currentUser={currentUser} setCurrentUser={setCurrentUser} />
    </div>
  );
}
