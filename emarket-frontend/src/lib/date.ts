/**
 * Utility functions for formatting dates and times in Vietnamese format (DD/MM/YYYY and HH:mm DD/MM/YYYY).
 */

export function formatDate(dateInput: Date | string | number | null | undefined): string {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "";

  const pad = (num: number) => String(num).padStart(2, "0");
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

export function formatTime(dateInput: Date | string | number | null | undefined): string {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "";

  const pad = (num: number) => String(num).padStart(2, "0");
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${hours}:${minutes}`;
}

export function formatDateTime(dateInput: Date | string | number | null | undefined): string {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "";

  const pad = (num: number) => String(num).padStart(2, "0");
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();

  return `${hours}:${minutes} ${day}/${month}/${year}`;
}

export function formatDateLong(dateInput: Date | string | number | null | undefined): string {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "";

  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return `ngày ${day} tháng ${month} năm ${year}`;
}
