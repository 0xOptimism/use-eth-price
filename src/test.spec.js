import { renderHook, act } from "@testing-library/react-hooks";
import { useEthPrice, clearEthPriceCache } from "./";

const mockFetch = (data, options = {}) => {
  const { status = 200, ok = true } = options;
  return jest.fn(() =>
    Promise.resolve({
      ok,
      status,
      statusText: status === 200 ? "OK" : "Error",
      json: () => Promise.resolve(data),
    })
  );
};

describe("useEthPrice", () => {
  beforeEach(() => {
    clearEthPriceCache();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("should return an object with all expected keys", () => {
    const { result } = renderHook(() => useEthPrice());

    expect(result.current).toHaveProperty("loading");
    expect(result.current).toHaveProperty("ethPrice");
    expect(result.current).toHaveProperty("error");
    expect(result.current).toHaveProperty("lastUpdated");
    expect(result.current).toHaveProperty("refetch");
  });

  it("should return initial state correctly", () => {
    const { result } = renderHook(() => useEthPrice());

    expect(result.current.ethPrice).toBe(null);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);
    expect(result.current.lastUpdated).toBe(null);
    expect(typeof result.current.refetch).toBe("function");
  });

  it("should return price from the CoinGecko API", async () => {
    const ethPriceData = { ethereum: { usd: 1200.22 } };
    global.fetch = mockFetch(ethPriceData);

    const { result, waitForNextUpdate } = renderHook(() => useEthPrice());

    expect(result.current.ethPrice).toBe(null);
    expect(result.current.loading).toBe(true);

    await waitForNextUpdate();

    expect(result.current.ethPrice).toBe(1200.22);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.lastUpdated).toBeInstanceOf(Date);
  });

  it("should support legacy string API for currency", async () => {
    const ethPriceData = { ethereum: { eur: 1100.5 } };
    global.fetch = mockFetch(ethPriceData);

    const { result, waitForNextUpdate } = renderHook(() => useEthPrice("eur"));

    await waitForNextUpdate();

    expect(result.current.ethPrice).toBe(1100.5);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("vs_currencies=eur"),
      expect.any(Object)
    );
  });

  it("should support options object API", async () => {
    const ethPriceData = { ethereum: { gbp: 900.75 } };
    global.fetch = mockFetch(ethPriceData);

    const { result, waitForNextUpdate } = renderHook(() =>
      useEthPrice({ currency: "gbp" })
    );

    await waitForNextUpdate();

    expect(result.current.ethPrice).toBe(900.75);
  });

  it("should handle API errors", async () => {
    global.fetch = mockFetch({}, { status: 500, ok: false });

    const { result, waitForNextUpdate } = renderHook(() =>
      useEthPrice({ retry: 0 })
    );

    await waitForNextUpdate();

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error.message).toContain("API error: 500");
    expect(result.current.loading).toBe(false);
  });

  it("should handle rate limiting (429)", async () => {
    global.fetch = mockFetch({}, { status: 429, ok: false });

    const { result, waitForNextUpdate } = renderHook(() =>
      useEthPrice({ retry: 0 })
    );

    await waitForNextUpdate();

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error.message).toContain("Rate limit exceeded");
  });

  it("should handle invalid response structure", async () => {
    global.fetch = mockFetch({ invalid: "data" });

    const { result, waitForNextUpdate } = renderHook(() =>
      useEthPrice({ retry: 0 })
    );

    await waitForNextUpdate();

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error.message).toContain("Invalid response");
  });

  it("should use cached value when available", async () => {
    const ethPriceData = { ethereum: { usd: 1200.22 } };
    global.fetch = mockFetch(ethPriceData);

    // First render - fetches from API
    const { result: result1, waitForNextUpdate: wait1 } = renderHook(() =>
      useEthPrice()
    );
    await wait1();
    expect(result1.current.ethPrice).toBe(1200.22);

    // Second render - should use cache
    const { result: result2 } = renderHook(() => useEthPrice());
    
    // Should immediately have the cached value
    expect(result2.current.ethPrice).toBe(1200.22);
    expect(result2.current.loading).toBe(false);
    
    // Fetch should only have been called once (for the first hook)
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("should allow manual refetch", async () => {
    const ethPriceData = { ethereum: { usd: 1200.22 } };
    global.fetch = mockFetch(ethPriceData);

    const { result, waitForNextUpdate } = renderHook(() => useEthPrice());

    await waitForNextUpdate();
    expect(result.current.ethPrice).toBe(1200.22);

    // Clear cache and update mock
    clearEthPriceCache();
    const newPriceData = { ethereum: { usd: 1300.0 } };
    global.fetch = mockFetch(newPriceData);

    // Trigger refetch
    await act(async () => {
      result.current.refetch();
    });

    await waitForNextUpdate();
    expect(result.current.ethPrice).toBe(1300.0);
  });

  it("should retry on failure", async () => {
    let callCount = 0;
    global.fetch = jest.fn(() => {
      callCount++;
      if (callCount < 3) {
        return Promise.resolve({
          ok: false,
          status: 500,
          statusText: "Error",
          json: () => Promise.resolve({}),
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        statusText: "OK",
        json: () => Promise.resolve({ ethereum: { usd: 1200.22 } }),
      });
    });

    const { result, waitForNextUpdate } = renderHook(() =>
      useEthPrice({ retry: 3, retryDelay: 100 })
    );

    // Wait for initial failed attempt
    await waitForNextUpdate();

    // Advance timer for first retry
    await act(async () => {
      jest.advanceTimersByTime(100);
    });

    // Advance timer for second retry
    await act(async () => {
      jest.advanceTimersByTime(200);
    });

    await waitForNextUpdate();

    expect(result.current.ethPrice).toBe(1200.22);
    expect(callCount).toBe(3);
  });

  it("should poll at specified interval", async () => {
    const ethPriceData = { ethereum: { usd: 1200.22 } };
    global.fetch = mockFetch(ethPriceData);

    const { waitForNextUpdate } = renderHook(() =>
      useEthPrice({ refreshInterval: 5000 })
    );

    await waitForNextUpdate();
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Clear cache to ensure next poll makes a request
    clearEthPriceCache();

    // Advance time past the interval
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    // Should have made another fetch
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
