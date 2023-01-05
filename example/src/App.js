import React from 'react'
import { useMyHook } from 'use-eth-price'

const App = () => {
  const example = useMyHook()
  return (
    <div>
      {example}
    </div>
  )
}
export default App