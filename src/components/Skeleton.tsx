import React from "react";
import { motion } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Skeleton({ className }: { className?: string; key?: React.Key }) {
  return (
    <motion.div
      initial={{ opacity: 0.2 }}
      animate={{ opacity: [0.2, 0.4, 0.2] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      className={cn("bg-[#151515] rounded-none", className)}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="flex flex-col border border-editorial-border bg-[#0D0D0D] overflow-hidden">
      <Skeleton className="aspect-[3/4] w-full" />
      <div className="p-5 border-t border-editorial-border space-y-3">
        <Skeleton className="h-2 w-1/4 bg-[#222]" />
        <Skeleton className="h-6 w-3/4 bg-[#222]" />
        <div className="space-y-2 pt-2">
            <Skeleton className="h-2 w-full bg-[#1a1a1a]" />
            <Skeleton className="h-2 w-5/6 bg-[#1a1a1a]" />
        </div>
      </div>
    </div>
  );
}
