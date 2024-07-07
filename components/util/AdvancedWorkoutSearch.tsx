"use client";
import React, { ReactNode, useEffect, useState } from "react";

type Props = {
  children: ReactNode;
  searchFunction: ({
    query,
    bodyPart,
  }: {
    query: string;
    bodyPart: BodyPart | undefined;
  }) => Promise<void>;
};

// import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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

import { BodyPart, WeightUnit } from "@prisma/client";
import { Input } from "../ui/input";
import { BodyParts } from "@/lib/template.util";
import { useToast } from "../ui/use-toast";

function AdvancedWorkoutSearch({ children, searchFunction }: Props) {
  const cBodyParts: { value: BodyPart | undefined; label: string }[] =
    BodyParts.map((bodyPart) => ({
      value: bodyPart,
      label: bodyPart,
    }));
  cBodyParts.push({
    value: undefined,
    label: "Any",
  });
  const initiallySelectedBodyPart =
    (window.localStorage.getItem("selected-bp") as BodyPart) || undefined;
  const [selectedBodyPart, setSelectedBodyPart] = useState<
    BodyPart | undefined
  >(initiallySelectedBodyPart);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  useEffect(() => {
    window.localStorage.setItem("selected-bp", selectedBodyPart + "");
  }, [selectedBodyPart]);

  return (
    <div className="flex gap-1 items-center relative md:w-[100%] w-[88vw] ml-[2.5vw]">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between"
          >
            {selectedBodyPart
              ? cBodyParts.find(
                  (framework) => framework.value === selectedBodyPart
                )?.label
              : "Select muscle..."}
            {/* <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /> */}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search muscle..." />
            <CommandList>
              <CommandEmpty>No framework found.</CommandEmpty>
              <CommandGroup>
                {cBodyParts.map((framework) => (
                  <CommandItem
                    key={framework.value}
                    value={framework.value}
                    onSelect={(currentValue) => {
                      setSelectedBodyPart(currentValue as BodyPart);
                      setOpen(false);
                    }}
                  >
                    {/* <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === framework.value ? "opacity-100" : "opacity-0"
                      )}
                    /> */}
                    {framework.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Input
        name="query"
        type="text"
        placeholder="what do you want to do?"
        className="w-[140%] "
        onChange={(e) => setQuery(e.target.value)}
        value={query}
        onKeyDown={async (e) => {
          if (
            e.keyCode === 13 ||
            e.keyCode === 9 ||
            e.key === "Enter" ||
            e.key === "Tab"
          ) {
            if (!selectedBodyPart) {
              toast({
                title: "Remember, choosing a muscle will help the AI 🤸🏻‍♂️",
              });
            }
            await searchFunction({ query, bodyPart: selectedBodyPart });
          }
        }}
      />
      <button
        className="outline-none border-l-2 absolute right-2 top-[50%] translate-y-[-50%] text-2xl hidden md:inline-block bg-white"
        type="submit"
        onClick={async () => {
          if (!selectedBodyPart) {
            toast({ title: "Remember, choosing a muscle will help the AI 🤸🏻‍♂️" });
          }
          await searchFunction({ query, bodyPart: selectedBodyPart });
        }}
      >
        🔍
      </button>
      {children}
    </div>
  );
}

export default AdvancedWorkoutSearch;
