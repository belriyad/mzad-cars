import { useEffect, useState } from "react";

/**
 * Returns a debounced copy of `value` that only updates after
 * `delay` ms of no changes. Use this to avoid firing API calls
 * or expensive operations on every keystroke.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
