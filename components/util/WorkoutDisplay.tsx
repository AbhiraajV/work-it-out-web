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
import MaximizeMinimize from "./MaximizeMinimize";

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
  const [fullscreen, setFullscreen] = useState(false);
  return (
    <div
      className={`transition-all duration-500 ease-in-out ${
        fullscreen
          ? "absolute top-[-10%] bg-white z-[980] w-[107.9vw] ml-[-4vw]"
          : "relative top-[50%] bg-white w-full ml-0"
      }`}
    >
      {workouts && <AutoUpdatingWorkoutName workouts={workouts} />}

      <div className="relative w-full flex flex-col h-screen">
        {/* Ensure the header takes its place */}
        {workouts && workouts.exercises.length !== 0 && (
          <div
            onClick={() => setFullscreen(!fullscreen)}
            className={
              fullscreen
                ? "fixed z-[990] top-[8%] right-[-2%] rounded-[50%] flex items-center justify-center bg-black w-[30px] h-[30px] py-1 px-2 transition-all duration-300 ease-in-out"
                : "fixed z-[990] top-[40%] right-[2%] rounded-[50%] flex items-center justify-center bg-black w-[30px] h-[30px] py-1 px-2 transition-all duration-300 ease-in-out"
            }
          >
            <MaximizeMinimize maximized={fullscreen} />
          </div>
        )}

        <div className=" w-full flex-grow p-2 flex flex-col gap-2 relative custom-scrollbar overflow-y-scroll overflow-x-hidden pb-3 mb-[50px]">
          {" "}
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
          <div className=" grid gap-6 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 mb-[300px] md:mb-[20px] w-[100%] md:ml-0 md:w-[100%]">
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
    </div>
  );
}

export default WorkoutDisplay;
