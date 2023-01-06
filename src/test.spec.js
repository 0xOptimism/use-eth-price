import { renderHook } from "@testing-library/react-hooks";
import { useEthPrice } from "./";

const mock = (ethPriceData) =>
  jest.fn(() => Promise.resolve({ json: () => ethPriceData }));

describe("useEthPrice", () => {
  it("should return an object with the keys: loading and ethPrice", () => {
    const { result } = renderHook(() => useEthPrice());

    expect(result.current).toHaveProperty("loading");
    expect(result.current).toHaveProperty("ethPrice");
  });

  it("should return a quote and set loading to false", async () => {
    const { result, waitForNextUpdate } = renderHook(() => useEthPrice());

    await waitForNextUpdate();

    expect(typeof result.current.ethPrice).toBe("number");
    expect(result.current.ethPrice).not.toBe(null);
    expect(result.current.ethPrice).not.toBe("");
    expect(result.current.loading).toBe(false);
  });

  it("should return price from the coinguecko API", async () => {
    const ethPriceData = { ethereum: { usd: 1200.22 } };
    global.fetch = mock(ethPriceData);

    const { result, waitForNextUpdate } = renderHook(() => useEthPrice());

    expect(result.current.ethPrice).toBe(null);
    expect(result.current.error).toBe(null);
    expect(result.current.loading).toBe(true);

    await waitForNextUpdate();

    expect(result.current.ethPrice).toBe(1200.22);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });
});
