import React from "react";
import { useEthPrice } from "use-eth-price";

const App = () => {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/eb5e702f-1914-4a1f-98fb-8ee1a0500386',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.js:6',message:'App component mounting, about to call useEthPrice',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  const { ethPrice, loading, error, lastUpdated, refetch } = useEthPrice({
    refreshInterval: 60000, // Auto-refresh every minute
  });
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/eb5e702f-1914-4a1f-98fb-8ee1a0500386',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.js:12',message:'useEthPrice hook returned',data:{ethPrice,loading,hasError:!!error},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
  // #endregion

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
