"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { ReactNode } from "react";
import { WorkoutHistoryWithExercises } from "../actions/workout.action";
import AutoUpdatingWorkoutName from "./AutoupdatingWorkoutName";
type Props = {
  tabs: { key: string; comp: ReactNode; name: string }[];
  workouts: WorkoutHistoryWithExercises;
};
export function TabsHandler({ tabs, workouts }: Props) {
  return (
    <Tabs
      defaultValue={tabs[0].key}
      className="w-[100%] h-[100vh] flex flex-col gap-1"
    >
      <TabsList
        className={
          workouts
            ? "grid w-full grid-cols-1 md:mb-0 md:grid-cols-2 mb-[5rem]"
            : "grid w-full grid-cols-1 md:mb-0 md:grid-cols-2 "
        }
      >
        <AutoUpdatingWorkoutName workouts={workouts} />
      </TabsList>
      <div>
        {tabs.map((tab) => (
          <TabsContent key={tab.key} value={tab.key} className="mt-4">
            {tab.comp}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}
