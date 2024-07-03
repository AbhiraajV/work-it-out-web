"use server";
import prisma from "@/lib/prisma.lib";
import { formatDate } from "@/lib/template.util";
import { BodyPart, Equipment, Set, WeightUnit } from "@prisma/client";

export const findRelevantWorkout = async ({
  query,
  bodyPart,
}: {
  query: string;
  bodyPart: BodyPart | undefined;
}) => {
  const limit = 5;
  const numCandidates = 400;
  if (limit <= 0 || !Number.isInteger(limit)) {
    throw new Error("Invalid limit: must be a positive integer");
  }

  if (numCandidates <= 0 || !Number.isInteger(numCandidates)) {
    throw new Error("Invalid numCandidates: must be a positive integer");
  }

  const filter = [];
  if (bodyPart && (bodyPart as string) !== "Any")
    filter.push({
      text: {
        query: bodyPart,
        path: "BodyPart",
      },
    });
  try {
    const out = await prisma.embeddedexercises.aggregateRaw({
      pipeline: [
        {
          $search: {
            index: "semanticSearchByName",
            compound: {
              must: [
                {
                  text: {
                    query: query,
                    path: {
                      wildcard: "*",
                    },
                    fuzzy: {
                      maxEdits: 2,
                      prefixLength: 0,
                      maxExpansions: 50,
                    },
                  },
                },
              ],
              filter,
            },
          },
        },
        {
          $project: {
            id: 1,
            Title: 1,
            Desc: 1,
            Type: 1,
            BodyPart: 1,
            Equipment: 1,
            Level: 1,
            Rating: 1,
            RatingDesc: 1,
          },
        },
        {
          $limit: limit,
        },
        {
          $sample: {
            size: numCandidates,
          },
        },
      ],
    });
    return out;
  } catch (error) {
    console.error("Error finding relevant workout:", error);
    throw error; // Re-throw the error for handling in the calling code
  }
};
export const addWorkout = async ({
  userId,
  exerciseId,
  date,
  sets,
}: {
  userId: string;
  exerciseId: string;
  date: Date;
  sets: Set[];
}) => {
  try {
    const formattedDate = new Date(date);

    // Check if the workout history for the given date exists
    const existingRecord = await prisma.workoutHistory.findFirst({
      where: {
        date: formattedDate,
        user: {
          clerkId: userId,
        },
      },
      include: {
        exercises: true,
      },
    });

    if (existingRecord) {
      // Check if the exercise already exists in the workout history
      const existingExercise = existingRecord.exercises.find(
        (exercise) => exercise.embeddedexercisesId === exerciseId
      );

      if (existingExercise) {
        return {
          failed: true,
          message: "This exercise has been tracked for this day already!",
        };
      } else {
        const updatedWorkoutHistory = await prisma.workoutHistory.update({
          where: {
            id: existingRecord.id,
          },
          data: {
            exercises: {
              create: {
                embeddedexercises: {
                  connect: { id: exerciseId },
                },
                sets: sets,
              },
            },
          },
        });

        return { passed: true, data: updatedWorkoutHistory };
      }
    } else {
      const newWorkoutHistory = await prisma.workoutHistory.create({
        data: {
          date: formattedDate,
          user: {
            connect: { clerkId: userId },
          },
          exercises: {
            create: {
              embeddedexercises: {
                connect: { id: exerciseId },
              },
              sets: sets,
            },
          },
        },
      });

      return { passed: true, data: newWorkoutHistory };
    }
  } catch (err: any) {
    console.log({ err });
    return {
      failed: true,
      message: "Something went wrong while adding the workout",
    };
  }
};
export const fixEx = async (run: string) => {
  if (run !== "2389rh2893hnr8c27") return;
  const exercises = await prisma.embeddedexercises.findMany();

  for (const exercise of exercises) {
    const transformedEquipment = exercise.Equipment.split(" ")
      .map((word) => word.trim())
      .join("_");

    // Transform BodyPart value
    const transformedBodyPart = exercise.BodyPart.split(" ")
      .map((word) => word.trim())
      .join("_");

    // Update the record if there is a change
    if (
      transformedEquipment !== exercise.Equipment ||
      transformedBodyPart !== exercise.BodyPart
    ) {
      await prisma.embeddedexercises
        .update({
          where: { id: exercise.id },
          data: {
            Equipment: transformedEquipment as Equipment,
            BodyPart: transformedBodyPart as BodyPart,
          },
        })
        .then(() => {});
    }
  }
};

export const deleteWorkout = async ({ exerciseId }: { exerciseId: string }) => {
  try {
    await prisma.workoutExercise.delete({
      where: { id: exerciseId },
    });

    return {
      passed: true,
      message: "Workout exercise removed successfully",
    };
  } catch (err: any) {
    console.log({ err });
    return {
      failed: true,
      message: "Something went wrong while removing the workout exercise",
    };
  }
};

export const updateWorkoutTitle = async (
  workoutTitle: string,
  workoutId: string
) => {
  try {
    const updatedUser = await prisma.workoutHistory.update({
      where: { id: workoutId },
      data: { workoutHistoryTitle: workoutTitle },
    });

    return { passed: true, data: updatedUser };
  } catch (error: any) {
    if (error.code === "P2002") {
      return {
        failed: true,
        message: "A favourite workout with this title exists",
      };
    }
    return { failed: true, message: "internal server error" };
  }
};
export const favWorkoutToggle = async (workoutId: string, fav: boolean) => {
  try {
    const updatedUser = await prisma.workoutHistory.update({
      where: { id: workoutId },
      data: { favourited: fav },
    });

    return { passed: true, data: updatedUser };
  } catch (error: any) {
    return { failed: true, message: error.message };
  }
};

export type WorkoutHistoryWithExercises = {
  id: string;
  date: Date;
  userId: string;
  workoutHistoryTitle: string | null;
  favourited: Boolean;
  exercises: Array<{
    id: string;
    workoutHistoryId: string;
    embeddedexercises: {
      id: string;
      Title: string;
      Desc: string;
      Type: string;
      BodyPart: BodyPart;
      Equipment: Equipment;
      Level: string;
      Rating: string;
      RatingDesc: string;
      embeddings?: number[];
    };
    embeddedexercisesId: string;
    sets: Array<{
      rep: number;
      weight: {
        value: number;
        unit: WeightUnit;
        date: Date;
      };
    }>;
  }>;
} | null;
export type FindWorkoutsOnThisDayResponse =
  | {
      passed: true;
      data: WorkoutHistoryWithExercises;
    }
  | {
      failed: true;
      message: string;
    };

export const findWorkoutsOnThisDay = async ({
  date,
  userId,
}: {
  date: Date;
  userId: string;
}): Promise<FindWorkoutsOnThisDayResponse> => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  try {
    const workouts = await prisma.workoutHistory.findFirst({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        exercises: {
          select: {
            id: true,
            workoutHistoryId: true,
            embeddedexercises: {
              select: {
                id: true,
                Title: true,
                Desc: true,
                Type: true,
                BodyPart: true,
                Equipment: true,
                Level: true,
                Rating: true,
                RatingDesc: true,
              },
            },
            embeddedexercisesId: true,
            sets: {
              select: {
                rep: true,
                weight: {
                  select: {
                    value: true,
                    unit: true,
                    date: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return { passed: true, data: workouts };
  } catch (e) {
    console.error(e);
    return {
      failed: true,
      message:
        "Something went wrong while looking for your workouts, please try again later.",
    };
  }
};

export const updateWorkoutHistorySet = async ({
  workoutExerciseId,
  sets,
}: {
  workoutExerciseId: string;
  sets: Set[];
}) => {
  try {
    const updatedWorkout = await prisma.workoutExercise.update({
      where: {
        id: workoutExerciseId,
      },
      data: {
        sets: sets,
      },
      select: {
        sets: true,
      },
    });
    return {
      passed: true,
      data: updatedWorkout.sets,
    };
  } catch (err) {
    console.error(err);
    return {
      failed: true,
      message: "something went wrong, could not update sets",
    };
  }
};

export const findRelevantWorkoutAdvancedSearch = async (formData: FormData) => {
  const limit = 20;
  const numCandidates = 200;
  const query = formData.get("query") as string;
  if (limit <= 0 || !Number.isInteger(limit)) {
    throw new Error("Invalid limit: must be a positive integer");
  }

  if (numCandidates <= 0 || !Number.isInteger(numCandidates)) {
    throw new Error("Invalid numCandidates: must be a positive integer");
  }

  try {
    const out = await prisma.embeddedexercises.aggregateRaw({
      pipeline: [
        {
          $search: {
            index: "descriptionIndex",

            compound: {
              must: [
                {
                  queryString: {
                    defaultPath: "Title",
                    query: "Lat",
                  },
                },
                {
                  queryString: {
                    defaultPath: "Equipment",
                    query: "Cable OR Dumbbell",
                  },
                },
                {
                  queryString: {
                    defaultPath: "BodyPart",
                    query: "Shoulders OR Triceps",
                  },
                },
              ],
              mustNot: [
                {
                  equals: {
                    value: "Biceps",
                    path: "BodyPart",
                  },
                },
              ],

              minimumShouldMatch: 3,
            },
          },
        },
        {
          $project: {
            id: 1,
            Title: 1,
            Desc: 1,
            Type: 1,
            BodyPart: 1,
            Equipment: 1,
            Level: 1,
            Rating: 1,
            RatingDesc: 1,
          },
        },
        {
          $limit: limit,
        },
        {
          $sample: {
            size: numCandidates,
          },
        },
      ],
    });
    return out;
  } catch (error) {
    console.error("Error finding relevant workout:", error);
    throw error; // Re-throw the error for handling in the calling code
  }
};

export const fetchFavouriteWorkoutSearch = async (
  userId: string
): Promise<
  {
    id: string;
    workoutHistoryTitle: string | null;
  }[]
> => {
  return await prisma.workoutHistory.findMany({
    where: {
      userId,
      favourited: true,
    },
    select: {
      id: true,
      workoutHistoryTitle: true,
    },
  });
};

interface CopyWorkoutHistoryParams {
  workoutHistoryId: string;
  newDate: Date;
  noSets?: boolean;
}
export const deleteWorkoutHistory = async (workoutHistoryId: string) => {
  try {
    const out = await prisma.workoutHistory.delete({
      where: { id: workoutHistoryId },
    });
    return { passed: true, data: out };
  } catch (err) {
    console.error(err);
    return { failed: true, data: "could not delete this history" };
  }
};
export const copyWorkoutHistory = async ({
  workoutHistoryId,
  newDate,
  noSets = false,
}: CopyWorkoutHistoryParams) => {
  try {
    // Fetch the original workout history with exercises and sets
    const originalWorkoutHistory = await prisma.workoutHistory.findUnique({
      where: { id: workoutHistoryId },
      include: {
        exercises: {
          include: {
            embeddedexercises: true,
          },
        },
      },
    });

    if (!originalWorkoutHistory) {
      throw new Error("Original workout history not found");
    }

    // Create a new workout history with the new date for the same user
    const newWorkoutHistory = await prisma.workoutHistory.create({
      data: {
        date: newDate,
        userId: originalWorkoutHistory.userId,
        workoutHistoryTitle:
          originalWorkoutHistory.workoutHistoryTitle +
          " (copy) " +
          formatDate(newDate),
        favourited: false,
      },
    });

    for (const originalExercise of originalWorkoutHistory.exercises) {
      const newExercise = await prisma.workoutExercise.create({
        data: {
          workoutHistoryId: newWorkoutHistory.id,
          embeddedexercisesId: originalExercise.embeddedexercisesId,
          sets: noSets ? [] : (originalExercise.sets as Set[]), // casting to match the expected type
        },
      });
    }

    return {
      passed: true,
      data: newWorkoutHistory,
    };
  } catch (err: any) {
    console.error(err);
    return {
      failed: true,
      message: "Something went wrong while copying the workout history",
    };
  }
};
