# use-eth-price

> A robust React hook for fetching ETH price with caching, retry logic, and auto-refresh

[![NPM](https://img.shields.io/npm/v/use-eth-price.svg)](https://www.npmjs.com/package/use-eth-price) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Features

- 🚀 **Simple API** - Works out of the box with sensible defaults
- 💾 **Built-in caching** - Prevents duplicate API calls across components
- 🔄 **Auto-refresh** - Optional polling for live price updates
- 🔁 **Retry logic** - Automatic retries with exponential backoff on failures
- ⚡ **Manual refetch** - Trigger price updates programmatically
- 🛡️ **Error handling** - Proper handling of rate limits and API errors
- 📅 **Timestamps** - Know exactly when the price was last updated
- 🔙 **Backward compatible** - Supports legacy string-based API

## Install

```bash
npm install --save use-eth-price
```

or

```bash
yarn add use-eth-price
```

## Basic Usage

```jsx
import React from "react";
import { useEthPrice } from "use-eth-price";

const App = () => {
  const { ethPrice, loading, error } = useEthPrice();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return <div>ETH Price: ${ethPrice}</div>;
};
```

## API

### `useEthPrice(options?)`

#### Parameters

You can pass either a string (legacy API) or an options object:

```typescript
// Legacy API - just the currency
useEthPrice("eur");

// Options object (recommended)
useEthPrice({
  currency: "usd",
  refreshInterval: 30000,
  retry: 3,
  retryDelay: 1000,
});
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `currency` | `string` | `"usd"` | Currency code (e.g., `"usd"`, `"eur"`, `"gbp"`) |
| `refreshInterval` | `number` | `0` | Auto-refresh interval in ms. Set to `0` to disable |
| `retry` | `number` | `3` | Number of retry attempts on failure |
| `retryDelay` | `number` | `1000` | Base delay between retries in ms (uses linear backoff) |

#### Return Value

```typescript
interface UseEthPriceResult {
  ethPrice: number | null;      // The current ETH price
  loading: boolean;             // True while fetching
  error: Error | null;          // Error object if request failed
  lastUpdated: Date | null;     // Timestamp of last successful fetch
  refetch: () => void;          // Function to manually trigger a refetch
}
```

## Examples

### Different Currency

```jsx
const { ethPrice } = useEthPrice({ currency: "eur" });
// or legacy API:
const { ethPrice } = useEthPrice("eur");
```

### Auto-Refresh Every 30 Seconds

```jsx
const { ethPrice, lastUpdated } = useEthPrice({
  refreshInterval: 30000,
});

return (
  <div>
    <p>ETH: ${ethPrice}</p>
    <small>Last updated: {lastUpdated?.toLocaleTimeString()}</small>
  </div>
);
```

### Manual Refresh Button

```jsx
const { ethPrice, loading, refetch } = useEthPrice();

return (
  <div>
    <p>ETH: ${ethPrice}</p>
    <button onClick={refetch} disabled={loading}>
      {loading ? "Refreshing..." : "Refresh Price"}
    </button>
  </div>
);
```

### Custom Retry Configuration

```jsx
const { ethPrice, error } = useEthPrice({
  retry: 5,        // Try up to 5 times
  retryDelay: 2000 // Start with 2s delay, increases linearly
});
```

### Full Example with All Features

```jsx
import React from "react";
import { useEthPrice } from "use-eth-price";

const PriceWidget = () => {
  const { ethPrice, loading, error, lastUpdated, refetch } = useEthPrice({
    currency: "usd",
    refreshInterval: 60000, // Refresh every minute
    retry: 3,
    retryDelay: 1000,
  });

  if (error) {
    return (
      <div>
        <p>Failed to load price: {error.message}</p>
        <button onClick={refetch}>Try Again</button>
      </div>
    );
  }

  return (
    <div>
      {loading && !ethPrice ? (
        <p>Loading...</p>
      ) : (
        <>
          <h2>ETH: ${ethPrice?.toLocaleString()}</h2>
          {lastUpdated && (
            <small>Updated: {lastUpdated.toLocaleTimeString()}</small>
          )}
          <button onClick={refetch} disabled={loading}>
            {loading ? "⏳" : "🔄"} Refresh
          </button>
        </>
      )}
    </div>
  );
};

export default PriceWidget;
```

## Caching

The hook includes a 10-second in-memory cache to prevent excessive API calls. Multiple components using `useEthPrice` with the same currency will share cached data.

For testing purposes, you can clear the cache:

```jsx
import { clearEthPriceCache } from "use-eth-price";

// In your tests
beforeEach(() => {
  clearEthPriceCache();
});
```

## Rate Limiting

CoinGecko's free API has rate limits. The hook handles `429` responses gracefully and will retry with backoff. If you're hitting rate limits frequently, consider:

1. Increasing `refreshInterval` to reduce polling frequency
2. Using the built-in cache (enabled by default)
3. Upgrading to CoinGecko Pro API

## TypeScript

Full TypeScript support with exported types:

```typescript
import { useEthPrice, UseEthPriceOptions, UseEthPriceResult } from "use-eth-price";
```

## License

MIT © [0xOptimism](https://github.com/0xOptimism)
