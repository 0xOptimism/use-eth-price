# use-eth-price

> a custom React hook that provides ETH price

[![NPM](https://img.shields.io/npm/v/use-eth-price.svg)](https://www.npmjs.com/package/use-eth-price) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save use-eth-price
```

## Usage

To use the useEthPrice hook, you can import it into your React component and call it with a string argument that specifies the currency for which you want to get the ETH price. The hook will default to USD if you don't pass anything.

```jsx
import React from "react";
import { useEthPrice } from "use-eth-price";

const App = () => {
  const { ethPrice, loading, error } = useEthPrice("sek");

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error..</p>;
  }

  if (ethPrice) {
    return <div>The price of ETH in USD is: {ethPrice}</div>;
  }

  return null;
};

export default App;
```

## License

MIT © [0xOptimism](https://github.com/0xOptimism)

---
