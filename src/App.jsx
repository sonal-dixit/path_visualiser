import React from 'react';
import PathVisualizer from './components/PathVisualizer';

const App = () => {
  return (
    <div className="App">
      <h1 className='text-2xl font-semibold p-2'>3D Drone Path Finding </h1>
      <PathVisualizer />
    </div>
  );
};

export default App;
