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
): WorkoutStats {
  const bodyPartCounts: { [key in BodyPart]?: number } = {};
  const totalSets: { [key in BodyPart]?: number } = {};
  const uniqueEquipments: Set<Equipment> = new Set();

  if (!workoutHistory) {
    return { bodyPartCounts, totalSets, uniqueEquipments };
  }

  workoutHistory.exercises.forEach((exercise) => {
    const bodyPart = exercise.embeddedexercises.BodyPart;
    const equipment = exercise.embeddedexercises.Equipment;

    // Count body parts
    if (!bodyPartCounts[bodyPart]) {
      bodyPartCounts[bodyPart] = 0;
    }
    bodyPartCounts[bodyPart]! += 1;

    totalSets[bodyPart]! += exercise.sets.length;

    // Collect unique equipment
    uniqueEquipments.add(equipment);
  });

  return { bodyPartCounts, totalSets, uniqueEquipments };
}

function AutoUpdatingWorkoutName({ workouts }: Props) {
  const workoutTitleBase = (): string => {
    let title = "";

    if (workouts !== null) {
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
      return workouts.workoutHistoryTitle || title;
    }
    return "workouts not found";
  };

  const [workoutTitle, setWorkoutTitle] = useState<string>(workoutTitleBase());
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [fav, setFav] = useState(workouts?.favourited);
  const [workoutStats, setWorkoutStats] = useState<WorkoutStats>(
    extractWorkoutStats(workouts)
  );
  const divRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const initialWorkoutTitle = workouts?.workoutHistoryTitle;

    const setInitialTitle = async () => {
      if (!initialWorkoutTitle && workouts) {
        const newTitle = workoutTitleBase();
        const out = await updateWorkoutTitle(newTitle, workouts.id);
        if (out.passed) {
          setWorkoutTitle(out.data.workoutHistoryTitle + "");
          toast({
            title: "Workout title set successfully",
          });
          location.reload();
        } else if (out.failed) {
          toast({
            title: "Failed to set workout title",
            description: out.message,
          });
        }
      }
    };

    setInitialTitle();
  }, []);

  const handleWorkoutTitleChange = async () => {
    const workoutTitleDiv = divRef.current;
    const newWorkoutTitle = workoutTitleDiv?.innerText.trim() || "";
    if (newWorkoutTitle === workoutTitle) return;
    if (newWorkoutTitle.length === 0 || !workouts) {
      setWorkoutTitle(workoutTitleBase());

      toast({
        title: "Failed to update workout title",
        description:
          "Workout title cannot be blank or same as the current workout title",
      });
      return;
    }

    const out = await updateWorkoutTitle(newWorkoutTitle, workouts?.id);
    if (out.passed) {
      toast({
        title: "Workout title updated successfully",
      });
    } else if (out.failed) {
      setWorkoutTitle(workoutTitleBase());
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
    <div className="flex flex-col md:flex-row justify-between items-start text-xl mr-[1vw] md:ml-0 font-semibold bg-black text-white py-2 px-3 rounded-sm">
      <div className="flex flex-col justify-between items-baseline">
        <div className="flex gap-1 items-center justify-start">
          <div
            ref={divRef}
            id="profile_name"
            onClick={() => setExpandText(true)}
            className={
              !expandText
                ? "text-xl truncate w-[60%] font-bold border-b-purple-600 border-b-4 border-dashed"
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
        {/* <span className="text-lg inline w-[100vw]">
          {workouts?.exercises.length} Exercises
        </span> */}
        <div className="flex flex-row flex-wrap custom-scrollbar w-[90vw]">
          {Object.keys(workoutStats.bodyPartCounts).map((key) => (
            <Badge
              variant={"secondary"}
              className="mr-1 whitespace-nowrap block overflow-hidden px-2 mt-1"
              key={key}
            >
              {workoutStats.bodyPartCounts[key as BodyPart] + " "}
              {key}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AutoUpdatingWorkoutName;
