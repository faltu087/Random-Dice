
"use client";

import * as React from "react";
import { History, Trash2 } from "lucide-react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useDiceStore } from "@/lib/store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

export function HistoryDrawer() {
  const { history, resetAll } = useDiceStore();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <History className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Session History
          </SheetTitle>
          <Button variant="ghost" size="icon" onClick={resetAll} title="Reset All Data">
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-80px)] mt-4 pr-4">
          <div className="space-y-4">
            {history.length === 0 ? (
              <p className="text-center text-muted-foreground mt-10">No rolls yet this session.</p>
            ) : (
              history.map((entry) => (
                <div key={entry.id} className="p-3 border rounded-lg bg-card shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: entry.playerColor }} 
                      />
                      <span className="font-medium">{entry.playerName}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(entry.timestamp, "HH:mm:ss")}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm px-2 py-0.5 rounded bg-muted">
                      {entry.section}
                    </span>
                    <span className="text-xl font-bold text-primary">
                      {entry.result}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
