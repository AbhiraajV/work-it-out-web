import { auth } from "@clerk/nextjs/server";
import prisma from "./prisma.lib";
export const currentProfile = async () => {
  const { userId } = auth();

  if (!userId) return null;

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  return user;
};
