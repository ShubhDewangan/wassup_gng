// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// This function safely merges Tailwind classes and resolves conflicts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
