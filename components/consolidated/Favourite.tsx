import { uuidLike } from "@/lib/template.util";
import sendMessageToQueue from "@/rabbit";
import { User } from "@prisma/client";
import React from "react";

type Props = {
  user: User;
  searchParams?: { [key: string]: string | string[] | undefined };
  workoutHistoryId: string;
};

async function Favourite({ user, searchParams, workoutHistoryId }: Props) {
  console.log(searchParams);
  await sendMessageToQueue("Review", {
    processId: uuidLike(),
    userId: user.clerkId,
    data: {
      workoutHistoryId,
    },
  });
  return <div className="w-full h-full"></div>;
}

export default Favourite;
