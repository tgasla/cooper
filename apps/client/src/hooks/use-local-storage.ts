import {
  useState,
  useEffect,
  useCallback,
  Dispatch,
  SetStateAction,
} from "react";

// Define the type for the hook's return value
type UseLocalStorageReturn<T> = [T, Dispatch<SetStateAction<T>>];

/**
 * Custom React hook to manage state in localStorage.
 *
 * @template T The type of the value to store.
 * @param {string} key The key under which to store the value in localStorage.
 * @param {T} initialValue The initial value to use if nothing is stored under the key.
 * @returns {[T, React.Dispatch<React.SetStateAction<T>>]} A stateful value, and a function to update it.
 */
function useLocalStorage<T>(
  key: string,
  initialValue: T,
): UseLocalStorageReturn<T> {
  // Helper function to safely get value from localStorage
  const readValue = useCallback((): T => {
    // Prevent build errors during server-side rendering
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      // Parse stored json or return initialValue if undefined, null or parsing error
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Return a wrapped version of useState's setter function that persists the new value to localStorage.
  const setValue: Dispatch<SetStateAction<T>> = useCallback(
    (value) => {
      // Prevent build errors during server-side rendering
      if (typeof window === "undefined") {
        console.warn(
          `Tried setting localStorage key “${key}” even though environment is not a client`,
        );
      }

      try {
        // Allow value to be a function so we have the same API as useState
        const newValue = value instanceof Function ? value(storedValue) : value;
        // Save state
        setStoredValue(newValue);
        // Save to local storage
        window.localStorage.setItem(key, JSON.stringify(newValue));
      } catch (error) {
        console.warn(`Error setting localStorage key “${key}”:`, error);
      }
    },
    [key, storedValue], // Include storedValue in dependencies to ensure the function gets the latest state if used in `value()`
  );

  // Listen for storage changes from other tabs/windows
  useEffect(() => {
    // Prevent build errors during server-side rendering
    if (typeof window === "undefined") {
      return;
    }

    const handleStorageChange = (event: StorageEvent) => {
      // Check if the change occurred in the localStorage area and for the specific key
      if (event.storageArea === window.localStorage && event.key === key) {
        try {
          // Update the state with the new value from the event, or initialValue if cleared
          setStoredValue(
            event.newValue ? (JSON.parse(event.newValue) as T) : initialValue,
          );
        } catch (error) {
          console.warn(
            `Error parsing stored value on storage event for key “${key}”:`,
            error,
          );
          setStoredValue(initialValue); // Fallback to initial value on parse error
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [key, initialValue]); // Add initialValue as dependency for the error fallback case

  // Re-read value if key changes (though this is less common for localStorage hooks)
  useEffect(() => {
    setStoredValue(readValue());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [storedValue, setValue];
}

export default useLocalStorage;
