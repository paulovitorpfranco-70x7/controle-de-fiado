import { z } from "zod";

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

type DateBoundary = "start" | "midday" | "end";

export function createDateInputSchema(label: string, boundary: DateBoundary = "midday") {
  return z.union([z.string(), z.date()]).transform((value, context) => {
    try {
      return parseDateInput(value, boundary);
    } catch {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${label} invalida.`
      });

      return z.NEVER;
    }
  });
}

export function parseDateInput(value: string | Date, boundary: DateBoundary = "midday") {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw new Error("Invalid date.");
    }

    return new Date(value);
  }

  const normalizedValue = value.trim();

  if (DATE_ONLY_PATTERN.test(normalizedValue)) {
    const [year, month, day] = normalizedValue.split("-").map(Number);
    return createLocalDate(year, month, day, boundary);
  }

  const parsed = new Date(normalizedValue);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid date.");
  }

  return parsed;
}

export function isSameOrAfterDate(left: Date, right: Date) {
  return normalizeDateOnly(left).getTime() >= normalizeDateOnly(right).getTime();
}

function normalizeDateOnly(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function createLocalDate(year: number, month: number, day: number, boundary: DateBoundary) {
  switch (boundary) {
    case "start":
      return new Date(year, month - 1, day, 0, 0, 0, 0);
    case "end":
      return new Date(year, month - 1, day, 23, 59, 59, 999);
    default:
      return new Date(year, month - 1, day, 12, 0, 0, 0);
  }
}
