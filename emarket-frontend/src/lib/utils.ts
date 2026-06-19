import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumberString(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return '';
  const rawValue = String(value).replace(/\D/g, '');
  if (!rawValue) return '';
  return Number(rawValue).toLocaleString('vi-VN');
}

export function parseFormattedString(value: string | undefined | null): string {
  if (!value) return '';
  return value.replace(/\D/g, '');
}

