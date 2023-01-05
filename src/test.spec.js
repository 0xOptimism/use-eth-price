import { renderHook } from "@testing-library/react-hooks";
import { useEthPrice } from "./";

describe("useStarWarsQuote", () => {
  test("should return an object with the keys: loading and ethPrice", () => {
    const { result } = renderHook(() => useEthPrice());

    expect(result.current).toHaveProperty("loading");
    expect(result.current).toHaveProperty("ethPrice");
  });

  test("should return a quote and set loading to false", async () => {
    const { result, waitForNextUpdate } = renderHook(() => useEthPrice());

    await waitForNextUpdate();
    expect(typeof result.current.ethPrice).toBe("number");
    expect(result.current.ethPrice).not.toBe(null);
    expect(result.current.ethPrice).not.toBe("");
    expect(result.current.loading).toBe(false);
  });
});
