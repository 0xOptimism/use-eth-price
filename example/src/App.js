import React from "react";
import { useEthPrice } from "use-eth-price";

const App = () => {
  const { ethPrice, loading, error } = useEthPrice();

  if (loading) {
    return <p>Loading...</p>;
  }
  if (error) {
    return <p>Error..</p>;
  }
  return <div>{ethPrice}</div>;
};

export default App;
