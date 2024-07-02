"use client";
import React, { useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { copyWorkoutHistory } from "../actions/workout.action";
import { toast } from "../ui/use-toast";

type Props = {
  favouriteWorkoutsForSearch: {
    id: string;
    workoutHistoryTitle: string | null;
  }[];
};

function FavouriteWorkoutSearch({ favouriteWorkoutsForSearch }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedFavouriteWorkoutId, setSelectedFavouriteWorkoutId] =
    useState<string>("");

  return (
    <div className="flex flex-col items-start justify-center gap-1">
      {selectedFavouriteWorkoutId.length === 0 ? (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="min-w-[250px] w-fit justify-between"
            >
              {selectedFavouriteWorkoutId
                ? favouriteWorkoutsForSearch.find(
                    (framework) => framework.id === selectedFavouriteWorkoutId
                  )?.workoutHistoryTitle
                : "import from favourite workouts..."}
              {/* <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /> */}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search muscle..." />
              <CommandList>
                <CommandEmpty>No workout found.</CommandEmpty>
                <CommandGroup>
                  {favouriteWorkoutsForSearch.map((framework) => (
                    <CommandItem
                      key={framework.id}
                      value={framework.workoutHistoryTitle!}
                      onSelect={(currentValue) => {
                        setSelectedFavouriteWorkoutId(
                          favouriteWorkoutsForSearch.find(
                            (f) => f.workoutHistoryTitle === currentValue
                          )?.id!
                        );
                        setOpen(false);
                      }}
                    >
                      {framework.workoutHistoryTitle}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      ) : (
        <div className="flex flex-col-reverse md:flex-row gap-1 items-center">
          <Button
            className="w-[60vw] md:w-fit"
            variant={"destructive"}
            onClick={() => setSelectedFavouriteWorkoutId("")}
          >
            Back
          </Button>
          <Button
            className="w-[60vw] md:w-fit"
            variant={"default"}
            onClick={async () => {
              const newDate = new Date(
                localStorage.getItem("selected-date") + ""
              );
              const out = await copyWorkoutHistory({
                newDate,
                workoutHistoryId: selectedFavouriteWorkoutId,
              });
              if (out.passed) location.reload();
              else toast({ title: "something went wrong,try again later" });
            }}
          >
            Import w/ Sets!
          </Button>
          <Button className="w-[60vw] md:w-fit" variant={"default"}>
            Import Execise only
          </Button>
        </div>
      )}
    </div>
  );
}

export default FavouriteWorkoutSearch;
