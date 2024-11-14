const bellmanFordPathfinding = async ({
  startPoint,
  goalPoint,
  gridSize,
  setPath,
  setVisitedCells,
  isSearching,
  isRunning,
  setIsRunning,
  obstaclePositions,
  edges,
  speed,
  setTimeTaken,
}) => {
  const startTime = Date.now();
  const distances = new Map(); // Map of nodes to distances from start
  const cameFrom = new Map(); // To track the shortest path
  const visited = [];

  // Initialize distances and cameFrom map
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      const pos = [x, y].toString();
      distances.set(pos, Infinity);
      cameFrom.set(pos, null);
    }
  }
  distances.set(startPoint.toString(), 0);

  // Bellman-Ford iterations
  const totalNodes = gridSize * gridSize;
  for (let i = 0; i < totalNodes - 1 && isRunning; i++) {
    let anyUpdate = false; // To check if there's an update in this iteration

    for (const { from, to, weight } of edges) {
      const fromKey = from.toString();
      const toKey = to.toString();

      if (
        distances.get(fromKey) + weight < distances.get(toKey) &&
        isValidPoint(to, gridSize, obstaclePositions)
      ) {
        distances.set(toKey, distances.get(fromKey) + weight);
        cameFrom.set(toKey, from);
        visited.push(to);
        setVisitedCells([...visited]); // Update visited cells for visualization
        anyUpdate = true;
      }
    }

    // Delay between steps for visualization
    await new Promise((resolve) => setTimeout(resolve, speed));

    // If no update occurred, break early (optimization)
    if (!anyUpdate) break;
  }

  // Check for path to goalPoint
  if (distances.get(goalPoint.toString()) === Infinity) {
    console.log("No path found to the goal point.");
    setIsRunning(false);
    setTimeTaken(Date.now() - startTime);
    return;
  }

  // Trace back the path from goalPoint to startPoint
  const path = [];
  let current = goalPoint;
  while (current) {
    path.push({ x: current[0], y: current[1], z: 0 });
    current = cameFrom.get(current.toString());
  }
  setPath(path.reverse());
  isSearching.current = false;
  setIsRunning(false);
  setTimeTaken(Date.now() - startTime);
};

// Helper function to check if a point is within bounds and not an obstacle
const isValidPoint = (point, gridSize, obstaclePositions) => {
  const [x, y] = point;
  return (
    x >= 0 &&
    x < gridSize &&
    y >= 0 &&
    y < gridSize &&
    !obstaclePositions.has(point.toString())
  );
};

export default bellmanFordPathfinding;
