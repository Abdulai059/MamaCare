// src/hooks/useDateInput.ts
import { useCallback, useState } from "react";

interface UseDateInputOptions {
  minYear?: number;
  maxYear?: number;
  /** Set false to allow empty value to pass validation (i.e. optional field) */
  required?: boolean;
}

interface UseDateInputResult {
  value: string;
  error: string | undefined;
  onChangeText: (text: string) => void;
  /** Run validation on demand (e.g. on submit). Returns true if valid. */
  validate: () => boolean;
  reset: () => void;
  /** The validated value, or undefined if empty/invalid — convenient for payloads */
  getValidValue: () => string | undefined;
}

// Formats raw digit input into YYYY-MM-DD as the user types
function formatDateInput(raw: string): string {
  const digitsOnly = raw.replace(/[^0-9]/g, "").slice(0, 8); // YYYYMMDD max

  let formatted = digitsOnly;
  if (digitsOnly.length > 4) {
    formatted = `${digitsOnly.slice(0, 4)}-${digitsOnly.slice(4)}`;
  }
  if (digitsOnly.length > 6) {
    formatted = `${digitsOnly.slice(0, 4)}-${digitsOnly.slice(4, 6)}-${digitsOnly.slice(6)}`;
  }
  return formatted;
}

function isCompleteValidDate(
  value: string,
  minYear: number,
  maxYear: number,
): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  if (month < 1 || month > 12) return false;

  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) return false;

  if (year < minYear || year > maxYear) return false;

  return true;
}

export function useDateInput({
  minYear = 1900,
  maxYear = new Date().getFullYear(),
  required = false,
}: UseDateInputOptions = {}): UseDateInputResult {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | undefined>();

  const onChangeText = useCallback(
    (text: string) => {
      // Only auto-format while growing (typing), not while deleting
      const next = text.length > value.length ? formatDateInput(text) : text;

      setValue(next);
      if (error) setError(undefined);
    },
    [value, error],
  );

  const validate = useCallback((): boolean => {
    const trimmed = value.trim();

    if (!trimmed) {
      if (required) {
        setError("Date of birth is required");
        return false;
      }
      setError(undefined);
      return true;
    }

    if (!isCompleteValidDate(trimmed, minYear, maxYear)) {
      setError("Enter a full date as YYYY-MM-DD");
      return false;
    }

    setError(undefined);
    return true;
  }, [value, required, minYear, maxYear]);

  const reset = useCallback(() => {
    setValue("");
    setError(undefined);
  }, []);

  const getValidValue = useCallback((): string | undefined => {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    return isCompleteValidDate(trimmed, minYear, maxYear) ? trimmed : undefined;
  }, [value, minYear, maxYear]);

  return { value, error, onChangeText, validate, reset, getValidValue };
}
