import { format, isValid, parseISO } from "date-fns";

/**
 * Formats a date for display
 * @param date Date object or ISO string
 * @param formatStr Format string (default: 'MMM d, yyyy')
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | undefined,
  formatStr = "d MMM, yyyy",
): string {
  if (!date) return "N/A";

  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(dateObj)) return "Invalid date";
    return format(dateObj, formatStr);
  } catch (error) {
    console.error("Date formatting error:", error);
    return "Invalid date";
  }
}

export function formatDateToISOString(date: Date | string | undefined): string {
  if (!date) return "";

  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(dateObj)) return "";
    return dateObj.toISOString().split("T")[0];
  } catch (error) {
    console.error("Date formatting error:", error);
    return "";
  }
}

/**
 * Formats a date for HTML date input (YYYY-MM-DD)
 * @param date Date object or ISO string
 * @returns Formatted date string for input
 */
export function formatDateForInput(date: Date | string | undefined): string {
  if (!date) return "";

  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(dateObj)) return "";
    return format(dateObj, "yyyy-MM-dd");
  } catch (error) {
    console.error("Date formatting error:", error);
    return "";
  }
}

/**
 * Safely parses a date string to a Date object
 * @param dateStr Date string
 * @returns Date object or undefined if invalid
 */
export function parseDate(dateStr: string | undefined): Date | undefined {
  if (!dateStr) return undefined;

  try {
    const date = parseISO(dateStr);
    return isValid(date) ? date : undefined;
  } catch (error) {
    console.error("Date parsing error:", error);
    return undefined;
  }
}
