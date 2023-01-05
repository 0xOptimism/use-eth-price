# use-eth-price

> a custom React hook that provides ETH price

[![NPM](https://img.shields.io/npm/v/use-eth-price.svg)](https://www.npmjs.com/package/use-eth-price) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save use-eth-price
```

## Usage

```jsx
import React from "react";
import { useEthPrice } from "use-eth-price";

const App = () => {
  const { ethPrice, loading } = useEthPrice();

  if (loading) return <p>Loading..</p>;

  if (ethPrice) {
    return <div>{ethPrice}</div>;
  }

  return null;
};

export default App;
```

## License

MIT © [0xOptimism](https://github.com/0xOptimism)

---

This hook is created using [create-react-hook](https://github.com/hermanya/create-react-hook).
