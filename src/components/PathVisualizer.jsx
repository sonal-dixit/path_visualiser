import React, { useState, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import PriorityQueue from "js-priority-queue";

const gridSize = 30;
const cellSize = 1;
const directions = [
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0],
];

const heuristic = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);

const PathVisualizer = () => {
  const [path, setPath] = useState([]);
  const [visitedCells, setVisitedCells] = useState([]);
  const [obstaclePositions, setObstaclePositions] = useState(new Set());
  const [startPoint, setStartPoint] = useState([0, 0]);
  const [goalPoint, setGoalPoint] = useState([gridSize/2 - 1, gridSize/2 - 1]);
  const [isRunning, setIsRunning] = useState(false);
  const [isAddingObstacles, setIsAddingObstacles] = useState(false);
  const isSearching = useRef(false);

  const resetGrid = () => {
    setPath([]);
    setVisitedCells([]);
    setObstaclePositions(new Set());
    setStartPoint([0, 0]);
    setGoalPoint([gridSize/2 - 1, gridSize/2 - 1]);
    setIsRunning(false);
    isSearching.current = false;
  };

  const toggleAddObstacles = () => {
    if (isAddingObstacles) {
      setIsAddingObstacles(false); // Stop adding obstacles
    } else {
      for (let i = 0; i < 10; i++) {
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
      setIsAddingObstacles(true);
    }
  };

  // useEffect(() => {
  //   if (!isAddingObstacles) return;

  //   const addObstacleInterval = setInterval(() => {
  //     const x = Math.floor(Math.random() * gridSize);
  //     const y = Math.floor(Math.random() * gridSize);
  //     const obstacleKey = `${x},${y}`;

  //     if (
  //       !obstaclePositions.has(obstacleKey) &&
  //       !(x === startPoint[0] && y === startPoint[1]) &&
  //       !(x === goalPoint[0] && y === goalPoint[1])
  //     ) {
  //       setObstaclePositions((prev) => new Set([...prev, obstacleKey]));
  //     }
  //   }, 100); // Adjust delay to control obstacle addition speed

  //   return () => clearInterval(addObstacleInterval);
  // }, [isAddingObstacles, obstaclePositions, startPoint, goalPoint]);

  
  const aStarPathfinding = () => {
    const openSetQueue = new PriorityQueue({ comparator: (a, b) => a.f - b.f });
    openSetQueue.queue({
      pos: startPoint,
      f: heuristic(startPoint, goalPoint),
      g: 0,
    });
    const cameFrom = new Map();
    const gScore = new Map();
    gScore.set(startPoint.toString(), 0);
    const closedSet = new Set();
    const visited = [];

    const searchStep = () => {
      if (openSetQueue.length === 0 || !isRunning) return;

      const { pos: current } = openSetQueue.dequeue();
      const [x, y] = current;
      closedSet.add(current.toString());
      visited.push(current);

      setVisitedCells([...visited]); // Update visited cells in real-time

      if (current.toString() === goalPoint.toString()) {
        const path = [];
        let temp = current;
        while (temp) {
          path.push({ x: temp[0], y: temp[1], z: 0 });
          temp = cameFrom.get(temp.toString());
        }
        setPath(path.reverse());
        isSearching.current = false;
        setIsRunning(false);
        return;
      }

      for (const [dx, dy] of directions) {
        const neighbor = [x + dx, y + dy];
        const neighborKey = neighbor.toString();

        if (
          neighbor[0] < 0 ||
          neighbor[0] >= gridSize ||
          neighbor[1] < 0 ||
          neighbor[1] >= gridSize ||
          obstaclePositions.has(neighborKey) ||
          closedSet.has(neighborKey)
        ) {
          continue;
        }

        const tentativeGScore = gScore.get(current.toString()) + 1;
        if (tentativeGScore < (gScore.get(neighborKey) || Infinity)) {
          cameFrom.set(neighborKey, current);
          gScore.set(neighborKey, tentativeGScore);
          openSetQueue.queue({
            pos: neighbor,
            f: tentativeGScore + heuristic(neighbor, goalPoint),
            g: tentativeGScore,
          });
        }
      }

      // Delay between steps for animation
      setTimeout(searchStep, 50); // Adjust delay as desired
    };

    isSearching.current = true;
    searchStep();
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
          {isAddingObstacles ? "Stop Adding Obstacles" : "Add Obstacles"}
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded m-2"
          onClick={() => {
            setIsRunning(true);
            aStarPathfinding();
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
