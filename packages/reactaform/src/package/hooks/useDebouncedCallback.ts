import { useCallback, useEffect, useRef } from "react";

export type DebouncedCallback = {
  callback: (...args: unknown[]) => void;
  cancel: () => void;
  flush: () => void;
};

/**
 * useDebouncedCallback
 * - callback: function to call
 * - wait: debounce delay in ms
 * - options.leading: if true, call on leading edge (optional)
 *
 * Returns { callback, cancel, flush } where callback is debounced.
 */
export function useDebouncedCallback(
  callback: (...args: unknown[]) => unknown,
  wait = 300,
  options?: { leading?: boolean }
): DebouncedCallback {
  const timer = useRef<number | undefined>(undefined);
  const latestCb = useRef<typeof callback>(callback);
  const lastArgs = useRef<unknown[] | null>(null);
  const leadingCalled = useRef(false);

  // keep latest callback ref to avoid stale closure
  useEffect(() => {
    latestCb.current = callback;
  }, [callback]);

  useEffect(
    () => () => {
      // cleanup on unmount
      if (timer.current !== undefined) {
        window.clearTimeout(timer.current);
        timer.current = undefined;
      }
    },
    []
  );

  const cancel = useCallback(() => {
    if (timer.current !== undefined) {
      window.clearTimeout(timer.current);
      timer.current = undefined;
    }
    lastArgs.current = null;
    leadingCalled.current = false;
  }, []);

  const flush = useCallback(() => {
    if (timer.current !== undefined) {
      window.clearTimeout(timer.current);
      timer.current = undefined;
    }
    if (lastArgs.current) {
      try {
        latestCb.current(...lastArgs.current);
      } finally {
        lastArgs.current = null;
        leadingCalled.current = false;
      }
    }
  }, []);

  const debounced = useCallback(
    (...args: unknown[]) => {
      const leading = options?.leading === true;

      // leading behavior: call immediately on first call, then debounce subsequent calls
      if (leading && !leadingCalled.current) {
        leadingCalled.current = true;
        latestCb.current(...args);
        // schedule reset of leading flag after wait so next leading call can occur
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => {
          leadingCalled.current = false;
          timer.current = undefined;
        }, wait) as unknown as number;
        return;
      }

      // save last args for eventual flush
      lastArgs.current = args;

      // standard trailing debounce
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        timer.current = undefined;
        if (lastArgs.current) {
          latestCb.current(...lastArgs.current);
          lastArgs.current = null;
          leadingCalled.current = false;
        }
      }, wait) as unknown as number;
    },
    [wait, options?.leading]
  );

  return { callback: debounced, cancel, flush };
}

/**
 * createDebouncedCallback - non-hook variant that returns the same API but
 * doesn't use React hooks. Useful for creating many debounced callbacks
 * programmatically (e.g., driven from a static schema) while handling
 * lifecycle cleanup manually.
 */
export function createDebouncedCallback(
  callback: (...args: unknown[]) => unknown,
  wait = 300,
  options?: { leading?: boolean }
): DebouncedCallback {
  let timer: number | undefined = undefined;
  let lastArgs: unknown[] | null = null;
  let leadingCalled = false;

  const cancel = () => {
    if (timer !== undefined) {
      window.clearTimeout(timer);
      timer = undefined;
    }
    lastArgs = null;
    leadingCalled = false;
  };

  const flush = () => {
    if (timer !== undefined) {
      window.clearTimeout(timer);
      timer = undefined;
    }
    if (lastArgs) {
      callback(...lastArgs);
      lastArgs = null;
      leadingCalled = false;
    }
  };

  const debounced = (...args: unknown[]) => {
    const leading = options?.leading === true;

    if (leading && !leadingCalled) {
      leadingCalled = true;
      callback(...args);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        leadingCalled = false;
        timer = undefined;
      }, wait) as unknown as number;
      return;
    }

    lastArgs = args;
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      timer = undefined;
      if (lastArgs) {
        callback(...lastArgs);
        lastArgs = null;
        leadingCalled = false;
      }
    }, wait) as unknown as number;
  };

  return { callback: debounced, cancel, flush };
}
