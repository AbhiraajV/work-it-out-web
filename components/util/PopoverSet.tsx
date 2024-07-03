import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { $Enums, Set, Weight, WeightUnit } from "@prisma/client";
import { updateWorkoutHistorySet } from "../actions/workout.action";
import { useToast } from "../ui/use-toast";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";

export function PopoverSet({
  workoutExerciseId,
  sets,
  setSetsState,
}: {
  workoutExerciseId: string;
  sets: Set[];
  setSetsState: React.Dispatch<
    React.SetStateAction<
      {
        rep: number;
        weight: {
          value: number;
          unit: $Enums.WeightUnit;
          date: Date;
        };
      }[]
    >
  >;
}) {
  const { toast } = useToast();
  const inputRefs = useRef<(HTMLInputElement | null)[][]>([]);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  // Initialize sets if empty
  useEffect(() => {
    if (sets.length === 0) {
      setSetsState([
        { rep: 0, weight: { value: 0, unit: "KG", date: new Date() } },
      ]);
    }
  }, [sets, setSetsState]);

  const handleChange = (index: number, field: string, value: any) => {
    const newSets = [...sets];
    if (field === "rep") {
      newSets[index].rep = parseInt(value);
    } else {
      newSets[index].weight.value = parseFloat(value);
    }
    setSetsState(newSets);
    debounceUpdate(newSets);
  };

  const handleUnitChange = (index: number, value: WeightUnit) => {
    const newSets = [...sets];
    newSets[index].weight.unit = value;
    setSetsState(newSets);
    debounceUpdate(newSets);
  };

  const debounceUpdate = useCallback(
    (newSets: Set[]) => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
      const timeout = setTimeout(async () => {
        try {
          const result = await updateWorkoutHistorySet({
            workoutExerciseId,
            sets: newSets,
          });
          if (result.passed) {
            // setSetsState(result.data);
            toast({
              title: "Sets updated",
              description: "Workout sets have been successfully updated.",
            });
          } else {
            toast({
              title: "Update failed",
              description: result.message,
            });
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "An error occurred while updating the sets.",
          });
          console.error(error);
        }
      }, 1200);
      setDebounceTimeout(timeout);
    },
    [debounceTimeout, toast, workoutExerciseId]
  );

  const handleKeyPress = (
    e: React.KeyboardEvent,
    rowIndex: number,
    colIndex: number
  ) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      const nextColIndex = colIndex + 1;
      const nextRowIndex = rowIndex + (nextColIndex >= 2 ? 1 : 0);
      const nextFieldIndex = nextColIndex % 2;

      if (nextRowIndex >= sets.length) {
        // Add a new row
        const newSets = [
          ...sets,
          {
            rep: 0,
            weight: {
              value: 0,
              unit: sets[sets.length - 1].weight.unit as WeightUnit,
              date: new Date(),
            },
          },
        ];
        setSetsState(newSets);
        setTimeout(() => {
          inputRefs.current[nextRowIndex][0]?.focus();
        }, 0);
      } else {
        inputRefs.current[nextRowIndex][nextFieldIndex]?.focus();
      }
    }
  };

  const handleBackspace = (
    e: React.KeyboardEvent,
    rowIndex: number,
    colIndex: number
  ) => {
    // @ts-ignore
    if (e.key === "Backspace" && e.currentTarget.value === "") {
      if (colIndex === 0 && sets.length > 1) {
        e.preventDefault();
        const newSets = sets.filter((_, i) => i !== rowIndex);
        setSetsState(newSets);
        debounceUpdate(newSets);
        const prevRowIndex = rowIndex - 1;
        const prevColIndex = newSets.length ? 1 : 0;
        setTimeout(() => {
          inputRefs.current[prevRowIndex]?.[prevColIndex]?.focus();
        }, 0);
      } else if (colIndex > 0) {
        e.preventDefault();
        const prevColIndex = colIndex - 1;
        setTimeout(() => {
          inputRefs.current[rowIndex]?.[prevColIndex]?.focus();
        }, 0);
      }
    }

    if (
      e.keyCode === 13 ||
      e.keyCode === 9 ||
      e.key === "Enter" ||
      e.key === "Tab"
    ) {
      e.preventDefault();
      const nextColIndex = colIndex + 1;
      const nextRowIndex = rowIndex + (nextColIndex >= 2 ? 1 : 0);
      const nextFieldIndex = nextColIndex % 2;

      if (nextRowIndex >= sets.length) {
        // Add a new row
        const newSets = [
          ...sets,
          {
            rep: 0,
            weight: {
              value: 0,
              unit: sets[sets.length - 1].weight.unit as WeightUnit,
              date: new Date(),
            },
          },
        ];
        setSetsState(newSets);
        setTimeout(() => {
          inputRefs.current[nextRowIndex][0]?.focus();
        }, 0);
      } else {
        inputRefs.current[nextRowIndex][nextFieldIndex]?.focus();
      }
    }
  };

  return (
    <div className="min-w-[120%] overflow-x-hidden flex flex-col gap-1 text-md md:text-sm">
      <div className="w-[82%] h-[1px] p-0 block md:hidden"></div>

      {sets.map((set, rowIndex) => (
        <div className="flex items-center gap-2" key={rowIndex}>
          <div className="flex gap-1 items-center w-[100%]">
            <Label htmlFor={`weight-${rowIndex}`}>Weight</Label>
            <Input
              ref={(el) => {
                if (!inputRefs.current[rowIndex])
                  inputRefs.current[rowIndex] = [];
                inputRefs.current[rowIndex][0] = el;
              }}
              value={set.weight.value}
              className="w-[30%] h-8"
              type="number"
              onChange={(e) => handleChange(rowIndex, "weight", e.target.value)}
              // onKeyPress={(e) => handleKeyPress(e, rowIndex, 0)}
              onKeyDown={(e) => handleBackspace(e, rowIndex, 0)}
            />
            <Select
              onValueChange={(value) =>
                handleUnitChange(rowIndex, value as WeightUnit)
              }
              value={set.weight.unit}
            >
              <SelectTrigger className="w-[25%]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>unit?</SelectLabel>
                  {(["KG", "LB"] as WeightUnit[]).map((unit) => (
                    <SelectItem value={unit} key={unit}>
                      {unit === "KG" ? "kgs" : "lbs"}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <div className="flex gap-1 items-center">
              <Label htmlFor={`reps-${rowIndex}`}>Reps</Label>
              <Input
                ref={(el) => {
                  if (!inputRefs.current[rowIndex])
                    inputRefs.current[rowIndex] = [];
                  inputRefs.current[rowIndex][1] = el;
                }}
                value={set.rep}
                className="w-[35%] h-8"
                type="number"
                // inputMode="numeric"
                onChange={(e) => handleChange(rowIndex, "rep", e.target.value)}
                // onKeyPress={(e) => handleKeyPress(e, rowIndex, 1)}
                onKeyDown={(e) => handleBackspace(e, rowIndex, 1)}
                // onKeyUp={}
              />
            </div>
          </div>
        </div>
      ))}

      <Button className="w-[82%] h-[1px] p-0 block md:hidden"></Button>
    </div>
  );
}
