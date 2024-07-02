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

  // Initialize the states from currentUser
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

  const handleValueChange = async (type: string) => {
    if (!currentUser) return;

    // Get new values
    const newHeightValue = parseFloat(heightRef.current?.innerText || "0.0");
    const newWeightValue = parseFloat(weightRef.current?.innerText || "0.0");
    const newAge = parseInt(ageRef.current?.innerText || "0");

    const updatedUser: User = {
      clerkId: currentUser.clerkId,
      username: currentUser.username,
      name: currentUser.name || "",
      age: currentUser.age || 0,
      weight: [...(currentUser?.weight || [])],
      height: [...(currentUser?.height || [])],
    };

    if (type === "height") {
      if (!heightValue.unit) {
        toast({
          title: "Failed to update height",
          description: "Error: Height unit is not set.",
        });
        return;
      }
      updatedUser.height.push({
        value: newHeightValue,
        unit: heightValue.unit,
        date: new Date(),
      });
      setHeightValue({ ...heightValue, value: newHeightValue });
      const updatedUserDB = await updateUserState(
        undefined,
        {
          date: new Date(),
          unit: heightValue.unit,
          value: newHeightValue,
        },
        undefined,
        currentUser?.clerkId
      );
      if (updatedUserDB.failed) {
        toast({
          title: "Failed height update",
          description: updatedUserDB.message,
        });
      }
      if (updatedUserDB.userCreated) {
        toast({
          title: "Height updated",
        });
        setCurrentUser(updatedUserDB.user);
      }
    } else if (type === "weight") {
      if (!weightValue.unit) {
        toast({
          title: "Failed to update weight",
          description: "Error: Weight unit is not set.",
        });
        return;
      }
      updatedUser.weight.push({
        value: newWeightValue,
        unit: weightValue.unit,
        date: new Date(),
      });
      setWeightValue({ ...weightValue, value: newWeightValue });
      const updatedUserDB = await updateUserState(
        {
          date: new Date(),
          unit: weightValue.unit,
          value: newWeightValue,
        },
        undefined,
        undefined,
        currentUser?.clerkId
      );
      if (updatedUserDB.failed) {
        toast({
          title: "Failed weight update",
          description: updatedUserDB.message,
        });
      }
      if (updatedUserDB.userCreated) {
        toast({
          title: "Weight updated",
        });
        setCurrentUser(updatedUserDB.user);
      }
    } else if (type === "age") {
      updatedUser.age = newAge;
      setAge(newAge);
      const updatedUserDB = await updateUserState(
        undefined,
        undefined,
        newAge,
        currentUser?.clerkId
      );
      if (updatedUserDB.failed) {
        toast({
          title: "Failed age update",
          description: updatedUserDB.message,
        });
      }
      if (updatedUserDB.userCreated) {
        toast({
          title: "Age updated",
        });
        setCurrentUser(updatedUserDB.user);
      }
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

  const scheduleSave = (type: string) => {
    debounce(() => handleValueChange(type), 1000)();
  };

  useEffect(() => {
    if (heightRef.current) {
      heightRef.current.addEventListener("input", () => scheduleSave("height"));
    }
    if (weightRef.current) {
      weightRef.current.addEventListener("input", () => scheduleSave("weight"));
    }
    if (ageRef.current) {
      ageRef.current.addEventListener("input", () => scheduleSave("age"));
    }

    return () => {
      if (heightRef.current) {
        heightRef.current.removeEventListener("input", () =>
          scheduleSave("height")
        );
      }
      if (weightRef.current) {
        weightRef.current.removeEventListener("input", () =>
          scheduleSave("weight")
        );
      }
      if (ageRef.current) {
        ageRef.current.removeEventListener("input", () => scheduleSave("age"));
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId, currentUser, scheduleSave]);

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
