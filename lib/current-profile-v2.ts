import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest } from "next";
import prisma from "./prisma.lib";
export const currentProfileV2 = async (req: NextApiRequest) => {
  const { userId } = getAuth(req);

  if (!userId) return null;

  const profile = await prisma.user.findUnique({ where: { clerkId: userId } });
  return profile;
};
