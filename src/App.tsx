import React from 'react';
import { Home } from './Home'
import { FlowProvider } from './flow';

const App = () => {
  return (
    <FlowProvider>
      <Home />
    </FlowProvider>
  )
};

export default App;
