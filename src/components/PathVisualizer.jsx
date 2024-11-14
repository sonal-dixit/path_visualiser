import React, { useState, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import aStarPathfinding from "./AStar";
import dijkstraPathfinding from "./Dijikstra";
import dfsPathfinding from "./DFS";
import bfsPathfinding from "./BFS";
import bellmanFordPathfinding from "./BellmanFord";
import dStarLitePathfinding from "./DStar";

const gridSize = 30;
const cellSize = 1;
const directions = [
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0],
];

const PathVisualizer = () => {
  const [path, setPath] = useState([]);
  const [visitedCells, setVisitedCells] = useState([]);
  const [obstaclePositions, setObstaclePositions] = useState(new Set());
  const [startPoint, setStartPoint] = useState([0, 0]);
  const [goalPoint, setGoalPoint] = useState([gridSize - 1, gridSize - 1]);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(50); 
  const isSearching = useRef(false);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('A*');

  const resetAlgorithm = () => {
    setPath([]);
    setVisitedCells([]);
    setIsRunning(false);
    isSearching.current = false;
  };

  const resetGrid = () => {
    setPath([]);
    setVisitedCells([]);
    setObstaclePositions(new Set());
    setStartPoint([0, 0]);
    setGoalPoint([gridSize - 1, gridSize - 1]);
    setIsRunning(false);
    isSearching.current = false;
  };

  const toggleAddObstacles = () => {
    for (let i = 0; i < 20; i++) {
      const x = Math.floor(Math.random() * gridSize);
      const y = Math.floor(Math.random() * gridSize);
      const obstacleKey = `${x},${y}`;
      if (
        !obstaclePositions.has(obstacleKey) &&
        !(x === startPoint[0] && y === startPoint[1]) &&
        !(x === goalPoint[0] && y === goalPoint[1])
      ) {
        setObstaclePositions((prev) => new Set([...prev, obstacleKey]));
      }
    }
  };


  return (
    <>
      <div
      >
        <button
          className={`bg-green-500 hover:bg-green-400 text-white font-bold py-2 px-4 border-b-4 border-green-700 hover:border-green-500 rounded m-2 ${
            selectedAlgorithm === "A*" ? "bg-green-700" : ""
          }`}
          onClick={() => setSelectedAlgorithm("A*")}
        >
          A*
        </button>
        <button
          className={`bg-green-500 hover:bg-green-400 text-white font-bold py-2 px-4 border-b-4 border-green-700 hover:border-green-500 rounded m-2 ${
            selectedAlgorithm === "Bellman-Ford" ? "bg-green-700" : ""
          }`}
          onClick={() => setSelectedAlgorithm("Bellman-Ford")}
        >
          Bellman-Ford
        </button>
        <button
          className={`bg-green-500 hover:bg-green-400 text-white font-bold py-2 px-4 border-b-4 border-green-700 hover:border-green-500 rounded m-2 ${
            selectedAlgorithm === "Dijkstra's" ? "bg-green-700" : ""
          }`}
          onClick={() => setSelectedAlgorithm("Dijkstras")}
        >
          Dijkstra's
        </button>
        <button
          className={`bg-green-500 hover:bg-green-400 text-white font-bold py-2 px-4 border-b-4 border-green-700 hover:border-green-500 rounded m-2 ${
            selectedAlgorithm === "DFS" ? "bg-green-700" : ""
          }`}
          onClick={() => setSelectedAlgorithm("DFS")}
        >
          DFS
        </button>
        <button
          className={`bg-green-500 hover:bg-green-400 text-white font-bold py-2 px-4 border-b-4 border-green-700 hover:border-green-500 rounded m-2 ${
            selectedAlgorithm === "BFS" ? "bg-green-700" : ""
          }`}
          onClick={() => setSelectedAlgorithm("BFS")}
        >
          BFS
        </button>
        <button
  className={`bg-green-500 hover:bg-green-400 text-white font-bold py-2 px-4 border-b-4 border-green-700 hover:border-green-500 rounded m-2 ${
    selectedAlgorithm === "D* Lite" ? "bg-green-700" : ""
  }`}
  onClick={() => setSelectedAlgorithm("D* Lite")}
>
  D* Lite
</button>

        <button
          className={`bg-green-500 hover:bg-green-400 text-white font-bold py-2 px-4 border-b-4 border-green-700 hover:border-green-500 rounded m-2 ${
            selectedAlgorithm === "Optimized Algorithm" ? "bg-green-700" : ""
          }`}
          onClick={() => setSelectedAlgorithm("Optimized Algorithm")}
        >
          Optimized Algorithm
        </button>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <button
          className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded m-2"
          onClick={() =>
            setStartPoint([
              Math.floor(Math.random() * gridSize),
              Math.floor(Math.random() * gridSize),
            ])
          }
        >
          Set Start Point
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded m-2"
          onClick={() =>
            setGoalPoint([
              Math.floor(Math.random() * gridSize),
              Math.floor(Math.random() * gridSize),
            ])
          }
        >
          Set Goal Point
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded m-2"
          onClick={toggleAddObstacles}
        >
          Add Obstacles
        </button>
        <button
  className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded m-2"
  onClick={() => {
    setIsRunning(true);
    const algorithmParameters = {
      startPoint,
      goalPoint,
      gridSize,
      setPath,
      setVisitedCells,
      isSearching,
      isRunning,
      setIsRunning,
      directions,
      obstaclePositions,
      speed
    };

    // Check the selectedAlgorithm state instead of setSelectedAlgorithm function
    if (selectedAlgorithm === "A*") {
      aStarPathfinding(algorithmParameters);
    } else if (selectedAlgorithm === "Dijkstras") {
      dijkstraPathfinding(algorithmParameters);
    } else if (selectedAlgorithm === "BFS") {
      bfsPathfinding(algorithmParameters);
    } else if (selectedAlgorithm === "DFS") {
      dfsPathfinding(algorithmParameters);
    } else if (selectedAlgorithm === "Bellman-Ford") {
      bellmanFordPathfinding(algorithmParameters);
    } else if (selectedAlgorithm === "D* Lite") {
      dStarLitePathfinding(algorithmParameters);
    }
    
  }}
>
  Play
</button>

        <button
          className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded m-2"
          onClick={resetAlgorithm}
        >
          Reset Algorithm
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded m-2"
          onClick={resetGrid}
        >
          Reset Grid
        </button>
        {/* Slider to control speed */}
      <div className="flex flex-col text-center">
        <label style={{ marginRight: "10px" }}>Speed: {speed} ms</label>
        <input
          type="range"
          min="1"
          max="300"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
        />
      </div>
      </div>
      <Canvas camera={{ position: [0, 5, 10], fov: 70 }}>
        <color attach="background" args={["#bbbbbb"]} />
        <ambientLight intensity={0.5} />
        <OrbitControls />
        <gridHelper args={[gridSize, gridSize, "#222", "black"]} />

        {/* Display Start Point */}
        <mesh position={[startPoint[0], startPoint[1], 0]}>
          <boxGeometry args={[cellSize, cellSize, cellSize]} />
          <meshStandardMaterial color="#00ff00" />
        </mesh>

        {/* Display Goal Point */}
        <mesh position={[goalPoint[0], goalPoint[1], 0]}>
          <boxGeometry args={[cellSize, cellSize, cellSize]} />
          <meshStandardMaterial color="blue" />
        </mesh>

        {/* Display Visited Cells */}
        {visitedCells.map((position, index) => (
          <mesh
            key={`visited-${index}`}
            position={[position[0], position[1], 0]}
          >
            <boxGeometry args={[cellSize, cellSize, cellSize]} />
            <meshStandardMaterial color="lightgray" />
          </mesh>
        ))}

        {/* Display Final Path */}
        {path.map((position, index) => (
          <mesh
            key={`path-${index}`}
            position={[position.x, position.y, position.z]}
          >
            <boxGeometry args={[cellSize, cellSize, cellSize]} />
            <meshStandardMaterial color="yellow" />
          </mesh>
        ))}

        {/* Display Obstacles */}
        {Array.from(obstaclePositions).map((obstacleKey, index) => {
          const [x, y] = obstacleKey.split(",").map(Number);
          return (
            <mesh key={`obstacle-${index}`} position={[x, y, 0]}>
              <boxGeometry args={[cellSize, cellSize, cellSize]} />
              <meshStandardMaterial color="red" />
            </mesh>
          );
        })}
      </Canvas>
    </>
  );
};

export default PathVisualizer;
