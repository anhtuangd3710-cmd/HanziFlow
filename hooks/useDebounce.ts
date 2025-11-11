
import { useState, useEffect } from 'react';

// This custom hook delays updating a value until a specified time has passed without that value changing.
// It's perfect for preventing API calls on every keystroke in a search bar.
export function useDebounce<T>(value: T, delay: number): T {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(
    () => {
      // Set a timeout to update the debounced value after the specified delay
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      // Return a cleanup function that will be called every time the hook is re-executed.
      // This is crucial: it clears the previous timeout, so if the value changes within the delay period,
      // the debounced value is not updated.
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay] // Only re-call effect if value or delay changes
  );

  return debouncedValue;
}
