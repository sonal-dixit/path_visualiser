import React, { useState, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import aStarPathfinding from "./AStar";

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
  const isSearching = useRef(false);

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
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "10px",
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
            aStarPathfinding({
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
            });
          }}
        >
          Play
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded m-2"
          onClick={resetGrid}
        >
          Reset
        </button>
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
