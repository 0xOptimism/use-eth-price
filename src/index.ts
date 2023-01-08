import { useState, useEffect } from "react";

export function useEthPrice(currency: string = "usd"): {
  ethPrice: number | null;
  loading: boolean;
  error: Error | null;
} {
  const [ethPrice, setEthPrice] = useState<number | null>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const COINGECKO_URL = `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=${currency}`;
  useEffect(() => {
    const abortController = new AbortController();
    const signal = {
      signal: abortController.signal,
    };

    async function getEthPrice() {
      try {
        const response = await fetch(COINGECKO_URL, signal);
        const data = await response.json();
        const price = data?.ethereum?.[currency];

        setEthPrice(price);
        setLoading(false);
      } catch (error) {
        if (error.name === "AbortError") return;
        setError(error);
        setLoading(false);
      }
    }
    getEthPrice();
    return () => {
      abortController.abort();
    };
  }, [currency]);

  return { ethPrice, loading, error };
}
