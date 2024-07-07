"use client";
import { BodyPart, embeddedexercises, User } from "@prisma/client";
import { ExcerciseCarousel } from "../util/Carousel";
import { useCallback, useEffect, useState } from "react";
import { DatePickerDemo } from "../util/DatePicker";
import { TabsHandler } from "../util/Tab";
import { formatDate } from "@/lib/template.util";
import WorkoutDisplay from "../util/WorkoutDisplay";
import { useToast } from "../ui/use-toast";
import {
  addWorkout,
  deleteWorkout,
  deleteWorkoutHistory,
  findRelevantWorkout,
  findWorkoutsOnThisDay,
  WorkoutHistoryWithExercises,
} from "../actions/workout.action";
import { Button } from "../ui/button";

type Props = {
  user: User;
};
export default function Tracker({ user }: Props) {
  const initialDate = new Date(
    window.localStorage.getItem("selected-date") || new Date().toDateString()
  );
  const [date, setDate] = useState<Date | undefined>(initialDate);

  const getStoredWorkoutsKey = () => date?.toDateString() + "-workout-stored";
  const [workouts, setWorkouts] = useState<WorkoutHistoryWithExercises | null>(
    null
  );
  const [searchWorkoutLoading, setSearchWorkoutLoading] = useState(false);
  const [searchWorkouts, setSearchWorkouts] = useState<
    Partial<embeddedexercises>[] | undefined
  >(undefined);

  const searchFunction = async ({
    query,
    bodyPart,
  }: {
    query: string;
    bodyPart: BodyPart | undefined;
  }) => {
    setSearchWorkoutLoading(true);
    const w = (await findRelevantWorkout({
      query,
      bodyPart,
    })) as any;

    setSearchWorkoutLoading(false);
    setSearchWorkouts(w);
  };

  const removeWorkout = async (workoutExeciseId: string) => {
    if (!workoutExeciseId) {
      return;
    }
    setWorkouts(
      (prev) =>
        ({
          ...prev,
          exercises: prev?.exercises.filter(
            (exer) => exer.id !== workoutExeciseId
          ),
        } as WorkoutHistoryWithExercises)
    );
    window.localStorage.removeItem(getStoredWorkoutsKey());
    try {
      const out = await deleteWorkout({
        exerciseId: workoutExeciseId,
      });
      if (out.failed) {
        toast({ title: "Workout not removed", description: out.message });
        return;
      }
      if (out.passed) {
        toast({
          title: "Workout removed!",
          description: "Now switch to workouts page and add sets & reps ",
        });
        return;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while adding the workout",
      });
      console.error(error);
    }
  };
  const addNewWorkout = async (workoutId: string) => {
    if (!workoutId || !user) {
      return;
    }
    if (!date) {
      toast({
        title: "Workout not added",
        description: "Workout date was not selected",
      });
      return;
    }

    try {
      const out = await addWorkout({
        date,
        exerciseId: workoutId,
        sets: [],
        userId: user?.clerkId,
      });
      if (out.failed) {
        toast({ title: "Workout not added", description: out.message });
        return;
      }
      if (out.passed) {
        await getWorkouts();
        toast({
          title: "Workout added! 💪🏻",
          description: "Now switch to workouts page and add sets & reps ",
        });
        return;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while adding the workout",
      });
      console.error(error);
    }
  };

  const { toast } = useToast();
  const getWorkouts = useCallback(async () => {
    if (!user || !date) return;
    console.log("Called getWorkouts " + date);
    const out = await findWorkoutsOnThisDay({
      date,
      userId: user.clerkId,
    });
    // @ts-ignore
    if (out.passed) {
      // @ts-ignore
      setWorkouts(out.data);
      window.localStorage.setItem(
        getStoredWorkoutsKey(),
        // @ts-ignore
        JSON.stringify(out.data)
      );
    } else {
      toast({
        title: "Failed to fetch workouts, try again later",
      });
    }
  }, [date, user]);

  useEffect(() => {
    setWorkouts(null);
    if (!date) return;
    window.localStorage.setItem("selected-date", date.toDateString());
  }, [date]);

  useEffect(() => {
    const storedWorkouts = window.localStorage.getItem(getStoredWorkoutsKey());
    if (storedWorkouts !== null) setWorkouts(JSON.parse(storedWorkouts));
    else getWorkouts();
  }, [date, user]);

  if (!user) return null;
  return (
    <div className="flex flex-col gap-4 w-screen md:w-[100%] h-[100vh] ml-[-2.5vw]">
      <div className="flex gap-1 items-center">
        <DatePickerDemo date={date} setDate={setDate} />

        {workouts?.id && (
          <div
            className="text-xs w-fit whitespace-nowrap h-[100%] py-2 md:text-md font-semibold border-red-600 border-[1px] px-2 text-red-600 rounded-md cursor-pointer"
            onClick={async () => {
              const tempStoreWorkouts = workouts;
              setWorkouts(null);
              const out = await deleteWorkoutHistory(workouts?.id);
              if (out.passed) {
                window.localStorage.removeItem(getStoredWorkoutsKey());
                setWorkouts(null);
              } else {
                setWorkouts({ ...tempStoreWorkouts });
                toast({
                  title: "could not delete the workout,try again later",
                });
              }
            }}
          >
            Clear all Workouts ❌
          </div>
        )}
      </div>

      <TabsHandler
        tabs={[
          {
            comp: date && (
              <WorkoutDisplay
                removeWorkout={removeWorkout}
                workouts={workouts}
                userId={user.clerkId}
              />
            ),
            key: "workoutDisplay",
            name: `${
              date
                ? "Workout on " + formatDate(date)
                : "select a date to view workouts"
            }`,
          },
          {
            comp: (
              <ExcerciseCarousel
                loading={searchWorkoutLoading}
                addNewWorkout={addNewWorkout}
                searchFunction={searchFunction}
                workouts={searchWorkouts}
              />
            ),
            key: "workoutAdd",
            name: "Add Workout",
          },
        ]}
        workouts={workouts}
      />
    </div>
  );
}
