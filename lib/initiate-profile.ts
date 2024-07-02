import { currentUser } from "@clerk/nextjs/server";
import { User } from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "./prisma.lib";
export const initiateProfile = async (): Promise<
  User | undefined | NextResponse<unknown>
> => {
  const user = await currentUser();
  if (!user) return undefined;
  const User = await prisma.user.findUnique({
    where: { clerkId: user.id },
  });
  if (User) return User;

  const newUser = await prisma.user.create({
    data: {
      clerkId: user.id,
      username: `${user.firstName} ${user.lastName}`,
    },
  });
  return newUser;
};
