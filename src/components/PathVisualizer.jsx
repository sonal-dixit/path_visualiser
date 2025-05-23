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
import dStarLitePathfindingOptimised from "./DStarOptimised";
import hybridPathfinding from "./hybrid";
import hybridPathfindingOptimised from "./hybridOptimised";

const cellSize = 1;
const directions = [
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0],
];
// reason for removing the diagnol directions is because they will be applicable only when there is obstacle on left and right and that is not suitable
const PathVisualizer = () => {
  const [gridSize, setGridSize] = useState(30);
  const [path, setPath] = useState([]);
  const [visitedCells, setVisitedCells] = useState([]);
  const [obstaclePositions, setObstaclePositions] = useState(new Set());
  const [obstacleCount, setObstacleCount] = useState(0);
  const [startPoint, setStartPoint] = useState([0, 0]);
  const [goalPoint, setGoalPoint] = useState([gridSize - 1, gridSize - 1]);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(50);
  const isSearching = useRef(false);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("A*");
  const [timeTaken, setTimeTaken] = useState(0);
  const [showVisitedCells, setShowVisitedCells] = useState(1);
  const [showObstacles, setShowObstacles] = useState(1);

  const resetAlgorithm = () => {
    setPath([]);
    setVisitedCells([]);
    setIsRunning(false);
    setShowObstacles(1);
    setShowVisitedCells(1);
    isSearching.current = false;
  };

  const resetGrid = () => {
    setPath([]);
    setVisitedCells([]);
    setObstaclePositions(new Set());
    setStartPoint([0, 0]);
    setGoalPoint([gridSize - 1, gridSize - 1]);
    setIsRunning(false);
    setObstacleCount(0);
    setShowObstacles(1);
    setShowVisitedCells(1);
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
        setObstaclePositions((prev) => {
          const newSet = new Set([...prev, obstacleKey]);
          setObstacleCount(newSet.size);
          return newSet;
        });
      }
    }
  };

  useEffect(() => {
    resetGrid();
  }, [gridSize]);

  return (
    <>
      <div>
        <button
          className={`bg-green-500 hover:bg-green-400 text-white font-bold py-2 px-4 border-b-4 border-green-700 hover:border-green-500 rounded m-2 ${
            selectedAlgorithm === "A*" ? "bg-green-700" : ""
          }`}
          onClick={() => setSelectedAlgorithm("A*")}
        >
          A*
        </button>
        {/* <button
          className={`bg-green-500 hover:bg-green-400 text-white font-bold py-2 px-4 border-b-4 border-green-700 hover:border-green-500 rounded m-2 ${
            selectedAlgorithm === "Bellman-Ford" ? "bg-green-700" : ""
          }`}
          onClick={() => setSelectedAlgorithm("Bellman-Ford")}
        >
          Bellman-Ford
        </button> */}
        <button
          className={`bg-green-500 hover:bg-green-400 text-white font-bold py-2 px-4 border-b-4 border-green-700 hover:border-green-500 rounded m-2 ${
            selectedAlgorithm === "Dijkstra's" ? "bg-green-700" : ""
          }`}
          onClick={() => setSelectedAlgorithm("Dijkstra's")}
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
            selectedAlgorithm === "D* Lite Optimised" ? "bg-green-700" : ""
          }`}
          onClick={() => setSelectedAlgorithm("D* Lite Optimised")}
        >
          D* Lite Optimised
        </button>
        <button
          className={`bg-green-500 hover:bg-green-400 text-white font-bold py-2 px-4 border-b-4 border-green-700 hover:border-green-500 rounded m-2 ${
            selectedAlgorithm === "A* + PFM" ? "bg-green-700" : ""
          }`}
          onClick={() => setSelectedAlgorithm("A* + PFM")}
        >
          A* + PFM
        </button>
        <button
          className={`bg-green-500 hover:bg-green-400 text-white font-bold py-2 px-4 border-b-4 border-green-700 hover:border-green-500 rounded m-2 ${
            selectedAlgorithm === "A* + PFM Optimised" ? "bg-green-700" : ""
          }`}
          onClick={() => setSelectedAlgorithm("A* + PFM Optimised")}
        >
          A* + PFM Optimised
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
              speed,
              setTimeTaken,
            };

            // Check the selectedAlgorithm state instead of setSelectedAlgorithm function
            if (selectedAlgorithm === "A*") {
              aStarPathfinding(algorithmParameters);
            } else if (selectedAlgorithm === "Dijkstra's") {
              dijkstraPathfinding(algorithmParameters);
            } else if (selectedAlgorithm === "BFS") {
              bfsPathfinding(algorithmParameters);
            } else if (selectedAlgorithm === "DFS") {
              dfsPathfinding(algorithmParameters);
            } else if (selectedAlgorithm === "Bellman-Ford") {
              bellmanFordPathfinding(algorithmParameters);
            } else if (selectedAlgorithm === "D* Lite") {
              dStarLitePathfinding(algorithmParameters);
            } else if (selectedAlgorithm === "D* Lite Optimised") {
              dStarLitePathfindingOptimised(algorithmParameters);
            } else if (selectedAlgorithm === "A* + PFM") {
              hybridPathfinding(algorithmParameters);
            } else if (selectedAlgorithm === "A* + PFM Optimised") {
              hybridPathfindingOptimised(algorithmParameters);
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
        <div className="absolute top-12 right-2 flex gap-2">
          <div classname="flex flex-col gap-4">
            <div className="flex flex-col text-center">
              <label>Speed: {speed} ms</label>
              <input
                type="range"
                min="1"
                max="300"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
              />
            </div>
            <div className="flex flex-col text-center mt-3">
              <label>GridSize: {gridSize}</label>
              <input
                type="range"
                min="10"
                max="100"
                value={gridSize}
                onChange={(e) => setGridSize(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col text-center">
              <label>Show Visited Cells?</label>
              <input
                type="checkbox"
                defaultChecked={showVisitedCells}
                onChange={(e) => setShowVisitedCells(e.target.checked)}
              />
            </div>
            <div className="flex flex-col text-center">
              <label>Show Obstacles?</label>
              <input
                type="checkbox"
                defaultChecked={showObstacles}
                onChange={(e) => setShowObstacles(e.target.checked)}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 right-0 bg-gray-800 text-white p-2 rounded m-2 z-10 flex flex-col gap-3">
        <div className="bg-gray-700 text-xl text-center">
          {selectedAlgorithm}
        </div>
        <span>No. of Obstacles: {obstacleCount}</span>
        <span>
          No. of nodes visited:{" "}
          {visitedCells?.length != null ? visitedCells?.length : 0}
        </span>
        <span>Path Length: {path?.length != null ? path?.length : 0}</span>
        <span>Time taken: {timeTaken} ms</span>
      </div>

      <Canvas camera={{ position: [10, 25, 50] }}>
        <color attach="background" args={["#bbbbbb"]} />
        <ambientLight intensity={0.5} />
        <OrbitControls />
        <gridHelper args={[gridSize * 2, gridSize, "#222", "black"]} />

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
        {showVisitedCells && (
          <>
            {visitedCells.map((position, index) => (
              <mesh
                key={`visited-${index}`}
                position={[position[0], position[1], 0]}
              >
                <boxGeometry args={[cellSize, cellSize, cellSize]} />
                <meshStandardMaterial color="lightgray" />
              </mesh>
            ))}
            {path.map((position, index) => (
              <mesh
                key={`path-${index}`}
                position={[position.x, position.y, position.z]}
              >
                <boxGeometry args={[cellSize, cellSize, cellSize]} />
                <meshStandardMaterial color="yellow" />
              </mesh>
            ))}
          </>
        )}

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
        {showObstacles && (
          <>
            {Array.from(obstaclePositions).map((obstacleKey, index) => {
              const [x, y] = obstacleKey.split(",").map(Number);
              return (
                <mesh key={`obstacle-${index}`} position={[x, y, 0]}>
                  <boxGeometry args={[cellSize, cellSize, cellSize]} />
                  <meshStandardMaterial color="red" />
                </mesh>
              );
            })}
          </>
        )}
      </Canvas>
    </>
  );
};

export default PathVisualizer;
