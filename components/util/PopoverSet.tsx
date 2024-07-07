import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { $Enums, Set, Weight, WeightUnit } from "@prisma/client";
import {
  getSets,
  updateWorkoutHistorySet,
  WorkoutHistoryWithExercises,
} from "../actions/workout.action";
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
  calculateScore,
  calculateStats,
  metrics,
  renderValue,
  SetStats,
} from "@/lib/template.util";
export function PopoverSet({
  workoutExerciseId,
  sets,
  setSetsState,
  embeddedExerciseId,
  userId,
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

  embeddedExerciseId: string | undefined;
  userId: string | undefined;
}) {
  const { toast } = useToast();
  const inputRefs = useRef<(HTMLInputElement | null)[][]>([]);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [setsStats, setSetStats] = useState<SetStats>();
  const [prevSetStats, setPrevSetStats] = useState<SetStats>();
  const [otherPrevSetStats, setOtherPrevSetStats] = useState<SetStats>();
  const setItemWithExpiration = (
    key: string,
    value: any,
    expirationInMinutes: number
  ) => {
    const expirationDate = new Date();
    expirationDate.setMinutes(
      expirationDate.getMinutes() + expirationInMinutes
    ); // Set expiration time

    const item = {
      value,
      expiration: expirationDate.toISOString(), // Convert to ISO string for storage
    };
    localStorage.setItem(key, JSON.stringify(item)); // Store item in localStorage
  };
  const getItemWithExpiration = (key: string) => {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    const item = JSON.parse(itemStr);
    const expirationDate = new Date(item.expiration);
    const now = new Date();

    if (now > expirationDate) {
      localStorage.removeItem(key);
      return null;
    }

    return item.value as {
      date: Date;
      sets: {
        rep: number;
        weight: {
          value: number;
          unit: $Enums.WeightUnit;
          date: Date;
        };
      }[];
    }[];
  };
  useEffect(() => {
    const fetchData = async () => {
      const today = new Date(localStorage.getItem("selected-date") as string);
      const todayStr = today.toISOString().split("T")[0];

      if (!today) return;
      if (userId && embeddedExerciseId) {
        let setsWithDates = [];
        const storedSetsWithDates = getItemWithExpiration(embeddedExerciseId);
        if (storedSetsWithDates) {
          setsWithDates = storedSetsWithDates;
        } else {
          setsWithDates = await getSets(userId, embeddedExerciseId);
          if (setsWithDates.length > 0)
            setItemWithExpiration(embeddedExerciseId, setsWithDates, 60);
        }
        const filteredData = setsWithDates.filter((entry) => {
          const entryDateStr = new Date(entry.date).toISOString().split("T")[0];
          return entryDateStr !== todayStr;
        });

        filteredData.sort((a, b) => a.date.getTime() - b.date.getTime());

        const closestDates = filteredData.slice(0, 2);
        if (closestDates[1])
          setPrevSetStats(calculateStats(closestDates[1].sets));
        if (closestDates[0])
          setOtherPrevSetStats(calculateStats(closestDates[0].sets));
      }
    };
    if (!embeddedExerciseId || !userId) return;
    fetchData();
  }, [embeddedExerciseId, userId]);

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
            const allStoredWorkouts = JSON.parse(
              localStorage.getItem(
                localStorage.getItem("selected-date") + "-workout-stored"
              ) as string
            ) as WorkoutHistoryWithExercises;
            if (allStoredWorkouts) {
              const curIndex = allStoredWorkouts?.exercises.findIndex(
                (workout) => workout.id === workoutExerciseId
              ) as number;
              allStoredWorkouts.exercises[curIndex].sets = newSets;
              localStorage.setItem(
                localStorage.getItem("selected-date") + "-workout-stored",
                JSON.stringify(allStoredWorkouts)
              );
            }

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
  useEffect(() => {
    if (sets.length === 1) setSetStats(undefined);
    else setSetStats(calculateStats(sets));
  }, [sets]);

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
      {setsStats !== undefined && (
        <div className="flex flex-col gap-4">
          <span className="text-sm font-semibold mb-[-1rem]">Stats</span>
          <div className="overflow-x-auto">
            <table className="table-auto w-[90%] bg-white shadow-md rounded-lg">
              <thead className="bg-violet-200 text-sm text-black">
                <tr>
                  <th className="px-4 py-2 text-left">Metric</th>
                  {[setsStats, prevSetStats, otherPrevSetStats]
                    .filter(Boolean)
                    .map((_, index) => (
                      <th key={index} className="px-4 py-2 text-left">
                        {index === 0
                          ? "Today"
                          : index === 1
                          ? "Previous"
                          : "Previouser?"}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {metrics.map((metric) => (
                  <tr key={metric.key}>
                    <td className="border px-4 py-2 text-xs font-bold">
                      {metric.label}
                    </td>
                    {[setsStats, prevSetStats, otherPrevSetStats]
                      .filter(Boolean)
                      .map((set, index) => (
                        <td
                          key={index}
                          className="border px-4 py-2 text-sm font-semibold"
                        >
                          {metric.isCalculated && set
                            ? calculateScore(set)
                            : renderValue(set, metric.key)}
                        </td>
                      ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Button className="w-[82%] h-[1px] p-0 block md:hidden"></Button>
    </div>
  );
}
