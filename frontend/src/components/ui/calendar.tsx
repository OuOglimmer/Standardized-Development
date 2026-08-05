"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        root: "w-full",
        months: "flex flex-col",
        month: "space-y-3",
        month_caption: "flex h-7 items-center justify-center",
        caption_label: "text-sm font-semibold text-foreground",
        nav: "flex items-center justify-between",
        button_previous: cn(buttonVariants({ variant: "ghost", size: "icon-sm" })),
        button_next: cn(buttonVariants({ variant: "ghost", size: "icon-sm" })),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "w-9 text-center text-xs font-medium text-muted-foreground",
        week: "mt-1 flex w-full",
        day: "relative size-9 p-0 text-center",
        day_button: cn(
          buttonVariants({ variant: "ghost", size: "icon-sm" }),
          "size-9 rounded-md p-0 font-normal aria-selected:bg-primary aria-selected:text-primary-foreground"
        ),
        selected: "bg-primary text-primary-foreground",
        today: "font-semibold text-primary",
        outside: "text-muted-foreground/45",
        disabled: "text-muted-foreground/35",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: iconClassName }) =>
          orientation === "left" ? (
            <ChevronLeft className={cn("size-4", iconClassName)} />
          ) : (
            <ChevronRight className={cn("size-4", iconClassName)} />
          ),
      }}
      {...props}
    />
  );
}

export { Calendar };
