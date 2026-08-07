"use client";

import type { ReactNode } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ProfileTabs({
  account,
  bounties,
}: {
  account: ReactNode;
  bounties: ReactNode;
}) {
  return (
    <Tabs defaultValue="account" className="gap-6">
      <TabsList className="w-full justify-start sm:w-auto">
        <TabsTrigger value="account">Conta</TabsTrigger>
        <TabsTrigger value="bounties">Bounties e entregas</TabsTrigger>
      </TabsList>
      <TabsContent value="account" className="space-y-8">
        {account}
      </TabsContent>
      <TabsContent value="bounties">{bounties}</TabsContent>
    </Tabs>
  );
}
