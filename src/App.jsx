import React from "react";
import PathVisualizer from "./components/PathVisualizer";
import PathVisualizer3D from "./components/PathVisualizer3d";

const App = () => {
  const [is3D, setIs3D] = React.useState(false);

  const toggleView = () => {
    setIs3D(!is3D);
  };

  return (
    <div className="App">
      <div className="header flex justify-between items-center">
        <h1 className="text-2xl font-semibold p-2">
          {is3D ? "3D Path Visualizer" : "2D Path Visualizer"}
        </h1>
        <button
          onClick={toggleView}
          className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded m-2"
        >
          Toggle to {is3D ? "2D" : "3D"}
        </button>
      </div>
      {is3D ? <PathVisualizer3D /> : <PathVisualizer />}
    </div>
  );
};

export default App;
