"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { HeightUnit, User, WeightUnit } from "@prisma/client";
import { useToast } from "../ui/use-toast";
import { updateUserState } from "../actions/profile.action";

type Props = {
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
};
const HeightUnits: HeightUnit[] = ["CM", "FT_IN"];
const WeightUnits: WeightUnit[] = ["KG", "LB"];

function DetailPicker({ currentUser, setCurrentUser }: Props) {
  const { toast } = useToast();

  const [weightValue, setWeightValue] = useState<{
    unit: WeightUnit | undefined;
    value: number;
  }>({ unit: undefined, value: 0.0 });
  const [heightValue, setHeightValue] = useState<{
    unit: HeightUnit | undefined;
    value: number;
  }>({ unit: undefined, value: 0.0 });
  const [age, setAge] = useState(0);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const heightRef = useRef<HTMLDivElement>(null);
  const weightRef = useRef<HTMLDivElement>(null);
  const ageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentUser) {
      const wu = currentUser.weight[currentUser.weight.length - 1]?.unit;
      const wv = currentUser.weight[currentUser.weight.length - 1]?.value;
      const hu = currentUser.height[currentUser.height.length - 1]?.unit;
      const hv = currentUser.height[currentUser.height.length - 1]?.value;
      setWeightValue({ unit: wu || undefined, value: wv || 0.0 });
      setHeightValue({ unit: hu || undefined, value: hv || 0.0 });
      setAge(currentUser.age || 0);
    }
  }, [currentUser]);

  const handleValueChange = async () => {
    if (!currentUser) return;

    const newHeightValue = parseFloat(heightRef.current?.innerText || "0.0");
    const newWeightValue = parseFloat(weightRef.current?.innerText || "0.0");
    const newAge = parseInt(ageRef.current?.innerText || "0");

    const updatedUser: User = {
      ...currentUser,
      age: newAge,
      weight: [...currentUser.weight],
      height: [...currentUser.height],
    };

    if (heightValue.unit) {
      updatedUser.height.push({
        value: newHeightValue,
        unit: heightValue.unit,
        date: new Date(),
      });
      setHeightValue({ ...heightValue, value: newHeightValue });
    }

    if (weightValue.unit) {
      updatedUser.weight.push({
        value: newWeightValue,
        unit: weightValue.unit,
        date: new Date(),
      });
      setWeightValue({ ...weightValue, value: newWeightValue });
    }

    setAge(newAge);

    const updatedUserDB = await updateUserState(
      weightValue.unit
        ? { date: new Date(), unit: weightValue.unit, value: newWeightValue }
        : undefined,
      heightValue.unit
        ? { date: new Date(), unit: heightValue.unit, value: newHeightValue }
        : undefined,
      newAge,
      currentUser.clerkId
    );

    if (updatedUserDB.failed) {
      toast({
        title: "Failed to update details",
        description: updatedUserDB.message,
      });
    } else if (updatedUserDB.userCreated) {
      toast({
        title: "Details updated",
      });
      // setCurrentUser(updatedUserDB.user);
    }
  };

  const debounce = (func: () => void, delay: number) => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      const newTimeoutId = setTimeout(func, delay);
      setTimeoutId(newTimeoutId);
    };
  };

  useEffect(() => {
    const handler = debounce(handleValueChange, 1200);
    const refs = [heightRef, weightRef, ageRef];

    refs.forEach((ref) => {
      if (ref.current) {
        ref.current.addEventListener("input", handler);
      }
    });

    return () => {
      refs.forEach((ref) => {
        if (ref.current) {
          ref.current.removeEventListener("input", handler);
        }
      });
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId, currentUser]);

  return (
    <div className="flex flex-col gap-1">
      <div className="text-md font-semibold flex gap-1 items-center">
        your <span>height 📏 in</span>
        <Select
          value={heightValue.unit}
          onValueChange={(value: HeightUnit) =>
            setHeightValue({ ...heightValue, unit: value })
          }
        >
          <SelectTrigger className="w-[80px] outline-none border-none">
            <SelectValue placeholder="unit?" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Unit</SelectLabel>
              {HeightUnits.map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {unit === "FT_IN" ? "ft. in." : "cms."}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <span>is</span>
        <div
          ref={heightRef}
          className="text-md font-semibold border-b-purple-600 border-b-2 border-dashed ml-1"
          contentEditable
          style={{ outline: "none" }}
          suppressContentEditableWarning={true}
        >
          {heightValue.value + ""}
        </div>
        <span className="font-semibold text-3xl">,</span>
      </div>
      <div className="text-md font-semibold flex gap-1 items-center">
        your <span>weight⚖️ in</span>
        <Select
          value={weightValue.unit}
          onValueChange={(value: WeightUnit) =>
            setWeightValue({ ...weightValue, unit: value })
          }
        >
          <SelectTrigger className="w-[80px] outline-none border-none">
            <SelectValue placeholder="unit?" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Unit</SelectLabel>
              {WeightUnits.map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {unit === "KG" ? "kgs" : "lbs"}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <span>is</span>
        <div
          ref={weightRef}
          className="text-md font-semibold border-b-purple-600 border-b-2 border-dashed ml-1"
          contentEditable
          style={{ outline: "none" }}
          suppressContentEditableWarning={true}
        >
          {weightValue.value + ""}
        </div>
        <span className="font-semibold text-3xl">,</span>
      </div>
      <div className="text-md font-semibold flex gap-1 items-center">
        your <span>age 👶🏻/👴🏻</span>
        <div
          ref={ageRef}
          className="text-md font-semibold border-b-purple-600 border-b-2 border-dashed ml-1"
          contentEditable
          style={{ outline: "none" }}
          suppressContentEditableWarning={true}
        >
          {age}
        </div>
        <span className="font-semibold text-3xl">,</span>
      </div>
    </div>
  );
}

export default DetailPicker;