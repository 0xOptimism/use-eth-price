import { useState, useEffect } from "react";

const COINGECKO_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd";

export function useEthPrice() {
  const [ethPrice, setEthPrice] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function getEthPrice() {
      setLoading(true);

      const response = await fetch(COINGECKO_URL);
      const data = await response.json();
      const price = data?.ethereum?.usd;

      setEthPrice(price);
      setLoading(false);
    }
    getEthPrice();
  }, []);

  return { ethPrice, loading };
}
