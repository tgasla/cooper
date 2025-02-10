import { useEffect } from "react";

export function useEventListener<
  KW extends keyof WindowEventMap,
  KH extends keyof HTMLElementEventMap & keyof SVGElementEventMap,
  KM extends keyof MediaQueryListEventMap,
>(event: KW | KH | KM, cb: () => void) {
  useEffect(() => {
    window.addEventListener(event, cb);
    return () => window.removeEventListener(event, cb);
  }, [cb, event]);
}
