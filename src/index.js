import { useState, useEffect } from "react";

const COINGECKO_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd";

export function useEthPrice() {
  const [ethPrice, setEthPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const abortController = new AbortController();
    const signal = {
      signal: abortController.signal,
    };
    async function getEthPrice() {
      try {
        const response = await fetch(COINGECKO_URL, signal);
        const data = await response.json();
        const price = data?.ethereum?.usd;

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
  }, []);

  return { ethPrice, loading, error };
}
