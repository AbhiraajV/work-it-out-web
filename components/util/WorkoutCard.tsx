"use client";
import { embeddedexercises, Set, WeightUnit } from "@prisma/client";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import YouTubePlayer from "./YoutubePlayer";
import { PopoverSet } from "./PopoverSet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
// import { YouTubePlayer } from "react-youtube";

type Props = {
  workout: Partial<embeddedexercises>;
  addNewWorkout?: (workoutId: string) => Promise<void>;
  removeWorkout?: (workoutId: string) => Promise<void>;

  noyt?: boolean;
  grid?: boolean;
  sets?:
    | {
        rep: number;
        weight: {
          value: number;
          unit: WeightUnit;
          date: Date;
        };
      }[]
    | undefined;
  workoutExerciseId?: string;
};

const ExtendibleDesc = ({ desc }: { desc: string | undefined }) => {
  const [show, setShow] = useState(false);
  return (
    <CardDescription
      className="p-1 bg-slate-50 rounded-md"
      onClick={() => setShow(!show)}
    >
      {show ? desc + " ...hide" : desc?.substring(0, 35) + " ...show"}
    </CardDescription>
  );
};
function WorkoutCard({
  workout,
  addNewWorkout,
  removeWorkout,
  noyt = false,
  grid = false,
  sets = undefined,
  workoutExerciseId = undefined,
}: Props) {
  const [setsState, setSetsState] = useState<Set[]>([]);
  useEffect(() => {
    if (!sets) return;
    setSetsState(sets);
  }, [sets]);
  return (
    <Card
      className={
        "md:w-[30%] relative claymorphic h-fit ml-[-3rem] mt-[-1rem] font-semibold flex flex-col justify-start items-start overflow-x-hidden pr-2 md:pr-0" +
        !grid
          ? "overflow-y-scroll relative cursor-default custom-scrollbar  md:max-h-[250px]"
          : "relative"
      }
    >
      {(addNewWorkout || removeWorkout) && (
        <div
          className="text-md cursor-pointer absolute top-2 right-2"
          onClick={async () => {
            if (addNewWorkout) {
              // @ts-ignore
              await addNewWorkout(workout._id ? workout._id.$oid : "");
            } else if (removeWorkout && workoutExerciseId) {
              await removeWorkout(workoutExerciseId);
            }
          }}
        >
          {removeWorkout ? "✖️" : "➕"}
        </div>
      )}
      <Collapsible {...(!workoutExerciseId && { open: true })}>
        <CardHeader>
          <CardTitle className="">
            <CollapsibleTrigger className="text-lg w-[80%] text-left md:text-lg  text-gray-700 font-bold truncate">
              {workout.Title}
            </CollapsibleTrigger>
          </CardTitle>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="w-[100%] overflow-x-hidden flex item-center flex-col justify-center mt-[-1rem]">
            <span className="text-sm font-bold text-gray-700">
              Description:
            </span>
            <ExtendibleDesc desc={workout.Desc} />
          </CardContent>
          {workoutExerciseId && (
            <CardContent className="w-[100%] overflow-x-hidden flex item-center flex-col justify-center mt-[-1rem]">
              <Collapsible>
                <CollapsibleTrigger className="text-sm  font-bold text-gray-700">
                  Set Details ↕️
                </CollapsibleTrigger>
                <CollapsibleContent>
                  {workoutExerciseId && (
                    <PopoverSet
                      setSetsState={setSetsState}
                      sets={setsState}
                      workoutExerciseId={workoutExerciseId}
                    />
                  )}
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          )}

          <CardContent className="flex overflow-x-hidden item-center flex-col justify-center">
            <span className="text-sm font-bold text-gray-700">Tags:</span>
            <div className="w-[100%]">
              {workout.BodyPart && (
                <Badge className="m-1" variant="default">
                  {workout.BodyPart}
                </Badge>
              )}
              {workout.Equipment && (
                <Badge className="m-1" variant="default">
                  {workout.Equipment}
                </Badge>
              )}
              {workout.Level && (
                <Badge className="m-1" variant="default">
                  {workout.Level}
                </Badge>
              )}
              {workout.Rating && (
                <Badge className="m-1" variant="default">
                  Rated: {workout.Rating}
                </Badge>
              )}
              {workout.RatingDesc && (
                <Badge className="m-1" variant="default">
                  {workout.RatingDesc}
                </Badge>
              )}
              {workout.Type && (
                <Badge className="m-1" variant="default">
                  {workout.Type}
                </Badge>
              )}
            </div>
            {/* {!noyt && <YouTubePlayer videoId="43hWj8mfYGY" />} */}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export default WorkoutCard;
