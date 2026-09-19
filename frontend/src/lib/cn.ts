import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// shadcn-ready class-name composition. Phase 4 components will import from here.
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(...inputs));
}
