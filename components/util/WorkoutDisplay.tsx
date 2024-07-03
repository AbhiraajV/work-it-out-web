"use client";
import {
  fetchFavouriteWorkoutSearch,
  WorkoutHistoryWithExercises,
} from "../actions/workout.action";
import WorkoutCard from "./WorkoutCard";
import AutoUpdatingWorkoutName from "./AutoupdatingWorkoutName";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import FavouriteWorkoutSearch from "./FavouriteWorkoutSearch";
import Link from "next/link";

type Props = {
  workouts: WorkoutHistoryWithExercises | undefined;
  removeWorkout: (workoutExeciseId: string) => Promise<void>;
  userId: string;
};

function WorkoutDisplay({ workouts, removeWorkout, userId }: Props) {
  const [favouriteWorkoutsForSearch, setFavouriteWorkoutForSearch] = useState<
    {
      id: string;
      workoutHistoryTitle: string | null;
    }[]
  >([]);

  useEffect(() => {
    const fetchFavouriteWorkouts = async () => {
      try {
        if (!workouts || workouts.exercises.length === 0) {
          const favouriteWorkouts = await fetchFavouriteWorkoutSearch(userId);
          setFavouriteWorkoutForSearch(favouriteWorkouts);
        }
      } catch (error) {
        console.error("Error fetching favourite workouts:", error);
      }
    };

    fetchFavouriteWorkouts();
  }, [workouts, userId]);

  return (
    <>
      {workouts && <AutoUpdatingWorkoutName workouts={workouts} />}

      <div className="flex flex-col h-screen">
        {/* Ensure the header takes its place */}
        <div className="flex-none">
          {/* Put any fixed header or other content here */}
        </div>

        <div className="flex-none md:flex-grow p-2 flex flex-col gap-2 relative custom-scrollbar overflow-y-scroll overflow-x-hidden pb-3 mb-0 md:mb-[50px] items-center justify-center">
          {(!workouts || workouts.exercises.length === 0) && (
            <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex flex-col justify-center items-center gap-[-1rem]">
              <span className="text-9xl">🤷🏻‍♂️</span>
              <div className="flex flex-col w-[100%] gap-1 justify-center items-center">
                <FavouriteWorkoutSearch
                  favouriteWorkoutsForSearch={favouriteWorkoutsForSearch}
                />
                <span className="text-xs font-black">Or</span>
                <div className="flex gap-1 items-center text-sm font-semibold">
                  <span>{`"Add Workout"`}</span>
                  <span className="text-lg font-semibold">|</span>
                  <Link
                    href={"/?nav=virtual"}
                    className="text-blue-700 font-bold underline underline-offset-0 hover:underline-offset-1"
                  >
                    AI Coach!
                  </Link>
                </div>
              </div>
            </div>
          )}
          <div className=" grid gap-6 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 mb-[300px] md:mb-[20px] w-[92vw] ml-[-2vw] md:ml-0 md:w-[100%]">
            {workouts &&
              workouts.exercises.map((exercise) => (
                <WorkoutCard
                  removeWorkout={removeWorkout}
                  workout={exercise.embeddedexercises}
                  sets={exercise.sets}
                  noyt={true}
                  grid={true}
                  key={exercise!.id}
                  workoutExerciseId={exercise.id}
                />
              ))}
          </div>
        </div>

        {/* Ensure the footer takes its place */}
        <div className="flex-none">
          {/* Put any fixed footer or other content here */}
        </div>
      </div>
    </>
  );
}

export default WorkoutDisplay;
