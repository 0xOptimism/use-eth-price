import React from "react";
import { useEthPrice } from "use-eth-price";

const App = () => {
  const { ethPrice, loading, error, lastUpdated, refetch } = useEthPrice({
    refreshInterval: 60000, // Auto-refresh every minute
  });

  if (error) {
    return (
      <div className="container error">
        <p>Failed to load price: {error.message}</p>
        <button onClick={refetch}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="container">
      {loading && !ethPrice ? (
        <p>Loading...</p>
      ) : (
        <>
          <h1>ETH Price</h1>
          <p className="price">${ethPrice?.toLocaleString()}</p>
          {lastUpdated && (
            <p className="updated">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
          <button onClick={refetch} disabled={loading}>
            {loading ? "Refreshing..." : "🔄 Refresh"}
          </button>
        </>
      )}
    </div>
  );
};

export default App;
