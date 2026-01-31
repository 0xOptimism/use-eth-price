import { useState, useEffect, useCallback, useRef } from "react";

export interface UseEthPriceOptions {
  currency?: string;
  refreshInterval?: number; // ms, 0 = disabled
  retry?: number; // retry attempts on failure
  retryDelay?: number; // ms between retries
}

export interface UseEthPriceResult {
  ethPrice: number | null;
  loading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  refetch: () => void;
}

// Simple in-memory cache for request deduplication
const cache = new Map<string, { price: number; timestamp: number }>();
const CACHE_TTL = 10_000; // 10 seconds

export function useEthPrice(
  options: UseEthPriceOptions | string = {}
): UseEthPriceResult {
  // Support legacy API: useEthPrice("usd")
  const opts = typeof options === "string" ? { currency: options } : options;
  const {
    currency = "usd",
    refreshInterval = 0,
    retry = 3,
    retryDelay = 1000,
  } = opts;

  const [ethPrice, setEthPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);

  const fetchPrice = useCallback(
    async (isRetry = false) => {
      const cacheKey = currency.toLowerCase();
      const cached = cache.get(cacheKey);
      const now = Date.now();

      // Return cached value if fresh
      if (cached && now - cached.timestamp < CACHE_TTL) {
        setEthPrice(cached.price);
        setLoading(false);
        setLastUpdated(new Date(cached.timestamp));
        return;
      }

      // Abort any in-flight request
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      if (!isRetry) {
        setLoading(true);
        setError(null);
        retryCountRef.current = 0;
      }

      const url = `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=${encodeURIComponent(currency)}`;

      try {
        const response = await fetch(url, {
          signal: abortControllerRef.current.signal,
        });

        // Handle rate limiting
        if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please try again later.");
        }

        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Validate response structure
        const price = data?.ethereum?.[currency.toLowerCase()];
        if (typeof price !== "number") {
          throw new Error(`Invalid response: price not found for ${currency}`);
        }

        // Update cache
        cache.set(cacheKey, { price, timestamp: now });

        setEthPrice(price);
        setLastUpdated(new Date());
        setError(null);
        retryCountRef.current = 0;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        const error = err instanceof Error ? err : new Error(String(err));

        // Retry logic
        if (retryCountRef.current < retry) {
          retryCountRef.current++;
          setTimeout(() => fetchPrice(true), retryDelay * retryCountRef.current);
          return;
        }

        setError(error);
      } finally {
        setLoading(false);
      }
    },
    [currency, retry, retryDelay]
  );

  useEffect(() => {
    fetchPrice();

    // Set up polling interval if configured
    let intervalId: ReturnType<typeof setInterval> | null = null;
    if (refreshInterval > 0) {
      intervalId = setInterval(fetchPrice, refreshInterval);
    }

    return () => {
      abortControllerRef.current?.abort();
      if (intervalId) clearInterval(intervalId);
    };
  }, [fetchPrice, refreshInterval]);

  return {
    ethPrice,
    loading,
    error,
    lastUpdated,
    refetch: fetchPrice,
  };
}

// Utility to clear the cache (useful for testing)
export function clearEthPriceCache(): void {
  cache.clear();
}
