import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { ReactNode } from "react";
type Props = {
  tabs: { key: string; comp: ReactNode; name: string }[];
};
export function TabsHandler({ tabs }: Props) {
  return (
    <Tabs defaultValue={tabs[0].key} className="w-[100%] h-[100vh]">
      <TabsList className="grid w-full grid-cols-1 mb-10 md:mb-0 md:grid-cols-2">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.key} value={tab.key}>
            {tab.name}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <>
          <TabsContent key={tab.key} value={tab.key}>
            {tab.comp}
          </TabsContent>
        </>
      ))}
    </Tabs>
  );
}
