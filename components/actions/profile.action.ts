"use server";
import prisma from "@/lib/prisma.lib";
import { Height, Weight } from "@prisma/client";
export const updateUsername = async (username: string, userId: string) => {
  try {
    const updatedUser = await prisma.user.update({
      where: { clerkId: userId },
      data: { username },
    });

    return { userCreated: true, user: updatedUser };
  } catch (error: any) {
    return { failed: true, message: error.message };
  }
};

export const updateUserState = async (
  weight: Weight | undefined,
  height: Height | undefined,
  age: number | undefined,
  userId: string | undefined
) => {
  try {
    const data: { [key: string]: any } = {};
    if (weight !== undefined) data["weight"] = { push: weight };

    if (height !== undefined) data["height"] = { push: height };

    if (age !== undefined) data["age"] = age;
    const updatedUser = await prisma.user.update({
      where: { clerkId: userId },
      data,
    });

    return { userCreated: true, user: updatedUser };
  } catch (error: any) {
    return { failed: true, message: error.message };
  }
};
