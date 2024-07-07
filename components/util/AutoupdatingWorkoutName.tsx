"use client";
import React, { useEffect, useRef, useState } from "react";
import { useToast } from "../ui/use-toast";
import {
  deleteWorkoutHistory,
  favWorkoutToggle,
  updateWorkoutTitle,
  WorkoutHistoryWithExercises,
} from "../actions/workout.action";
import { BodyPart, Equipment } from "@prisma/client";
import { Badge } from "../ui/badge";
import Star from "./Star";
import { formatDateShort } from "@/lib/template.util";
import { Button } from "../ui/button";
import { TabsTrigger } from "../ui/tabs";

type Props = {
  workouts: WorkoutHistoryWithExercises;
};

type WorkoutStats = {
  bodyPartCounts: { [key in BodyPart]?: number };
  totalSets: { [key in BodyPart]?: number };
  uniqueEquipments: Set<Equipment>;
};

function extractWorkoutStats(
  workoutHistory: WorkoutHistoryWithExercises
): WorkoutStats | null {
  console.log({ workoutHistory });
  const bodyPartCounts: { [key in BodyPart]?: number } = {};
  const totalSets: { [key in BodyPart]?: number } = {};
  const uniqueEquipments: Set<Equipment> = new Set();

  if (!workoutHistory) {
    console.log("Broke");
    return null;
  }

  workoutHistory.exercises.forEach((exercise) => {
    const bodyPart = exercise.embeddedexercises.BodyPart;
    const equipment = exercise.embeddedexercises.Equipment;

    // Count body parts
    if (!bodyPartCounts[bodyPart]) {
      bodyPartCounts[bodyPart] = 0;
    }
    bodyPartCounts[bodyPart]! += 1;

    // Initialize totalSets for bodyPart if it doesn't exist
    if (!totalSets[bodyPart]) {
      totalSets[bodyPart] = 0;
    }
    totalSets[bodyPart]! += exercise.sets.length;

    // Collect unique equipment
    uniqueEquipments.add(equipment);
  });

  return { bodyPartCounts, totalSets, uniqueEquipments };
}

function AutoUpdatingWorkoutName({ workouts }: Props) {
  const workoutTitleBase = (workouts: WorkoutHistoryWithExercises): string => {
    let title = "";
    if (workouts) {
      if (workouts.workoutHistoryTitle) return workouts.workoutHistoryTitle;
      workouts.exercises
        .map(({ embeddedexercises: { BodyPart } }) => {
          return BodyPart;
        })
        .reduce((acc: string[], bodyPart: BodyPart) => {
          if (!acc.includes(bodyPart.trim())) {
            acc.push(bodyPart.trim());
          }
          return acc;
        }, [])
        .forEach((bodyPart) => (title += bodyPart + " "));
      title += formatDateShort(new Date(workouts.date));
      return title;
    }
    return "workouts not found";
  };

  const [workoutTitle, setWorkoutTitle] = useState<string>(
    workoutTitleBase(workouts)
  );
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [fav, setFav] = useState(workouts?.favourited);
  const [workoutStats, setWorkoutStats] = useState<WorkoutStats | null>(null);

  useEffect(() => {
    if (!workouts) return;

    const updatedWorkoutStats = extractWorkoutStats(workouts);
    if (updatedWorkoutStats) setWorkoutStats({ ...updatedWorkoutStats! });

    const newTitle = workoutTitleBase(workouts);
    setWorkoutTitle(newTitle);
  }, [workouts]);

  const divRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const StoredWorkoutTitleFix = (wht: string) => {
    const allStoredWorkouts = JSON.parse(
      localStorage.getItem(
        localStorage.getItem("selected-date") + "-workout-stored"
      ) as string
    ) as WorkoutHistoryWithExercises;
    if (!allStoredWorkouts) return;
    allStoredWorkouts.workoutHistoryTitle = wht;
    localStorage.setItem(
      localStorage.getItem("selected-date") + "-workout-stored",
      JSON.stringify(allStoredWorkouts)
    );
  };

  useEffect(() => {
    const initialWorkoutTitle = workouts?.workoutHistoryTitle;

    const setInitialTitle = async () => {
      if (!initialWorkoutTitle && workouts) {
        const newTitle = workoutTitleBase(workouts);
        const out = await updateWorkoutTitle(newTitle, workouts.id);
        if (out.passed) {
          setWorkoutTitle(out.data.workoutHistoryTitle + "");
          StoredWorkoutTitleFix(out.data.workoutHistoryTitle + "");
          toast({
            title: "Workout title set successfully",
          });
        } else if (out.failed) {
          toast({
            title: "Failed to set workout title",
            description: out.message,
          });
        }
      }
    };

    setInitialTitle();
  }, [workouts]);

  const handleWorkoutTitleChange = async () => {
    const workoutTitleDiv = divRef.current;
    const newWorkoutTitle = workoutTitleDiv?.innerText.trim() || "";
    if (newWorkoutTitle === workoutTitle) return;
    if (newWorkoutTitle.length === 0 || !workouts) {
      setWorkoutTitle(workoutTitleBase(workouts));

      toast({
        title: "Failed to update workout title",
        description:
          "Workout title cannot be blank or same as the current workout title",
      });
      return;
    }

    const out = await updateWorkoutTitle(newWorkoutTitle, workouts?.id);
    if (out.passed) {
      StoredWorkoutTitleFix(out.data.workoutHistoryTitle!);
      toast({
        title: "Workout title updated successfully",
      });
    } else if (out.failed) {
      setWorkoutTitle(workoutTitleBase(workouts));
      toast({
        title: "Failed to update workout title",
        description: out.message,
      });
    }
  };

  const scheduleSave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    const newTimeoutId = setTimeout(() => {
      handleWorkoutTitleChange();
    }, 3000);
    setTimeoutId(newTimeoutId);
  };

  useEffect(() => {
    if (divRef.current) {
      divRef.current.addEventListener("input", scheduleSave);
    }

    return () => {
      if (divRef.current) {
        divRef.current.removeEventListener("input", scheduleSave);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  const [expandText, setExpandText] = useState(false);
  return (
    <div className="flex flex-col md:flex-row justify-between items-start text-xl mr-[1vw] md:ml-0 font-semibold  text-black py-2 px-3 rounded-sm mb-10">
      {workouts && (
        <>
          <div className="flex flex-col justify-between items-baseline">
            <div className="flex gap-1 items-center justify-start">
              <div
                ref={divRef}
                id="profile_name"
                onClick={() => setExpandText(true)}
                className={
                  !expandText
                    ? "text-xl truncate max-w-[70vw] font-bold border-b-purple-600 border-b-4 border-dashed"
                    : "text-xl w-fit font-bold border-b-purple-600 border-b-4 border-dashed"
                }
                contentEditable
                style={{ outline: "none" }}
                onBlur={() => {
                  handleWorkoutTitleChange();
                  setExpandText(false);
                }}
                suppressContentEditableWarning={true}
              >
                {workoutTitle}
              </div>
              <span
                className="cursor-pointer"
                onClick={async () => {
                  const out = await favWorkoutToggle(workouts?.id + "", !fav);
                  if (out.passed) setFav(out.data.favourited);
                }}
              >
                {fav ? <>⭐</> : <Star />}
              </span>
            </div>
            {/* <div className="text-xs">
          Make it a favourite, to use this workout again!
        </div> */}
          </div>
          <div className="flex flex-col max-w-[40%]">
            <span className="text-lg inline w-[100vw]">
              {workouts?.exercises.length} Exercises
            </span>{" "}
            <div className="flex flex-row flex-wrap custom-scrollbar w-[90vw]">
              {workoutStats &&
                Object.keys(workoutStats.bodyPartCounts).map((key) => (
                  <Badge
                    variant={"default"}
                    className="mr-1 whitespace-nowrap block overflow-hidden px-2 mt-1"
                    key={key}
                  >
                    {workoutStats.bodyPartCounts[key as BodyPart] + " "}
                    {key}
                  </Badge>
                ))}
            </div>
          </div>
        </>
      )}
      <div className="flex justify-center items-center gap-1 my-1 mb-1">
        <TabsTrigger
          className=" data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow py-0"
          key={"workoutDisplay"}
          value={"workoutDisplay"}
        >
          Display
        </TabsTrigger>
        <TabsTrigger
          className=" data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow py-0"
          key={"workoutAdd"}
          value={"workoutAdd"}
        >
          Add
        </TabsTrigger>
        <TabsTrigger
          className=" data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow py-0"
          value="publish"
        >
          Publish{" "}
        </TabsTrigger>
      </div>
    </div>
  );
}

export default AutoUpdatingWorkoutName;
