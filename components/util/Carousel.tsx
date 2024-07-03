"use client";
import * as React from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import WorkoutCard from "./WorkoutCard";
import { BodyPart, embeddedexercises, WeightUnit } from "@prisma/client";
import { Input } from "../ui/input";
import ToggleGridCarousel from "./ToggleGridCarousel";
import AdvancedWorkoutSearch from "./AdvancedWorkoutSearch";

export function ExcerciseCarousel({
  workouts,
  loading,
  searchFunction,
  addNewWorkout,
}: {
  workouts: Partial<embeddedexercises>[] | undefined;
  loading: boolean;
  searchFunction: ({
    query,
    bodyPart,
  }: {
    query: string;
    bodyPart: BodyPart | undefined;
  }) => Promise<void>;
  addNewWorkout: (workoutId: string) => Promise<void>;
}) {
  const [toggleGrid, setToggleGrid] = React.useState(false);
  return (
    <div className="flex flex-col gap-1 relative h-full">
      <AdvancedWorkoutSearch searchFunction={searchFunction}>
        <div className="absolute right-[-8%] top-[50%] translate-y-[-50%]">
          <ToggleGridCarousel
            setToggleGrid={setToggleGrid}
            toggleGrid={toggleGrid}
          />
        </div>
      </AdvancedWorkoutSearch>
      {loading ? (
        <div className="absolute flex items-center gap-2 top-[450%] left-[50%] translate-x-[-50%] translate-y-[-50%] text-sm font-bold">
          <span className="text-xl">🏃🏻‍♀️</span>
          Loading <span className="text-xl">🏃🏻‍♀️</span>
        </div>
      ) : !workouts ? (
        <div className="absolute flex items-center gap-2 top-[450%] left-[50%] translate-x-[-50%] translate-y-[-50%] text-sm font-bold">
          <span className="text-xl">🏋️</span>
          <span className="inline whitespace-nowrap">
            Search for a workout G.
          </span>
          <span className="text-xl">🏋️</span>
        </div>
      ) : workouts.length === 0 ? (
        <div className="absolute  flex items-center gap-2 top-[450%] left-[50%] translate-x-[-50%] translate-y-[-50%] text-sm font-bold">
          <span className="text-xl">😓</span>
          <span className="inline whitespace-nowrap">
            No Relevant Workouts Found.
          </span>
          <span className="text-xl">😓</span>
        </div>
      ) : !toggleGrid ? (
        <Carousel
          opts={{
            align: "center",
          }}
          className="w-[95%]"
        >
          <CarouselContent>
            {workouts.map((workout, index) => (
              <CarouselItem
                key={index}
                className="md:basis-1/2 lg:basis-[43%] m-3"
              >
                <WorkoutCard workout={workout} addNewWorkout={addNewWorkout} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      ) : (
        <div className="w-full h-[400px] p-2 flex flex-col gap-2 relative custom-scrollbar overflow-y-scroll ">
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 mr-[-0.5rem] md:mr-0 pr-0 md:pr-2">
            {workouts.map((exercise) => (
              <WorkoutCard
                key={exercise.id}
                workout={exercise}
                addNewWorkout={addNewWorkout}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
