import { useCallback, useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [val, setVal] = useState<T>(initialValue);

  useEffect(() => {
    const storedVal = window.localStorage.getItem(key);
    if (storedVal) {
      setVal(JSON.parse(storedVal));
    } else {
      setVal(initialValue);
    }
  }, [key, initialValue]);

  const updateVal = useCallback(
    (v: T) => {
      setVal(v);
      window.localStorage.setItem(key, JSON.stringify(v));
    },
    [setVal, key],
  );

  return [val, updateVal];
}
