import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate a URL slug from an animal name
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

// Generate a unique slug by appending ID if needed
export function generateUniqueSlug(name: string, id: string): string {
  const baseSlug = generateSlug(name)
  return `${baseSlug}-${id}`
}