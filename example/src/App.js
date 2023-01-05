import React from "react";
import { useEthPrice } from "use-eth-price";

const App = () => {
  const { ethPrice, loading } = useEthPrice();
  if (loading) {
    return loading;
  }
  return <div>{ethPrice}</div>;
};

export default App;
