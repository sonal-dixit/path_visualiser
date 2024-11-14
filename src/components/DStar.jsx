import PriorityQueue from "js-priority-queue";

const heuristic = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);

const dStarLitePathfinding = async({
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
}) => {
  const startTime = Date.now();
  // Initialize the priority queue
  const queue = new PriorityQueue({ comparator: (a, b) => a.key - b.key });
  const gScore = new Map(); // Cost to reach each node
  const rhs = new Map(); // Best cost from a node to goal
  const cameFrom = new Map();
  const visited = [];

  const startKey = startPoint.toString();
  const goalKey = goalPoint.toString();

  // Set the initial goal values
  gScore.set(goalKey, 0);
  rhs.set(goalKey, 0);
  queue.queue({ pos: goalPoint, key: calculateKey(goalPoint) });

  // Ensure all cells are within bounds of the grid
  const isValidCell = (x, y) => x >= 0 && x < gridSize && y >= 0 && y < gridSize;

  // Calculate the key for a vertex
  const calculateKey = (vertex) => {
    const g = gScore.get(vertex.toString()) || Infinity;
    const r = rhs.get(vertex.toString()) || Infinity;
    return Math.min(g, r) + heuristic(startPoint, vertex);
  };

  // Update vertex's rhs value and re-add to the queue if needed
  const updateVertex = (vertex) => {
    const vertexKey = vertex.toString();
    if (vertexKey !== goalKey) {
      let minRhs = Infinity;
      let bestNeighbor = null;

      // Loop over neighbors to find the best rhs value
      for (const [dx, dy] of directions) {
        const neighbor = [vertex[0] + dx, vertex[1] + dy];
        const neighborKey = neighbor.toString();

        if (isValidCell(neighbor[0], neighbor[1]) && !obstaclePositions.has(neighborKey)) {
          const tentativeRhs = gScore.get(neighborKey) + 1;
          if (tentativeRhs < minRhs) {
            minRhs = tentativeRhs;
            bestNeighbor = neighbor;
          }
        }
      }

      rhs.set(vertexKey, minRhs);
      if (bestNeighbor) {
        cameFrom.set(vertexKey, bestNeighbor);
      }
    }
    if (gScore.get(vertexKey) !== rhs.get(vertexKey)) {
      queue.queue({ pos: vertex, key: calculateKey(vertex) });
    }
  };

  // Compute the shortest path
  const computeShortestPath = async () => {
    while (isRunning && !queue.isEmpty()) {
      const { pos: current } = queue.dequeue();
      const currentKey = current.toString();
      visited.push(current);

      setVisitedCells([...visited]); // Update visited cells in real-time
      console.log(`Visiting: ${current}`); // Log the visited cells

      // Process the node and update surrounding vertices
      if (gScore.get(currentKey) > rhs.get(currentKey)) {
        gScore.set(currentKey, rhs.get(currentKey));
        for (const [dx, dy] of directions) {
          const neighbor = [current[0] + dx, current[1] + dy];
          const neighborKey = neighbor.toString();
          if (isValidCell(neighbor[0], neighbor[1]) && !obstaclePositions.has(neighborKey)) {
            updateVertex(neighbor);
          }
        }
      } else {
        gScore.set(currentKey, Infinity);
        updateVertex(current);
        for (const [dx, dy] of directions) {
          const neighbor = [current[0] + dx, current[1] + dy];
          const neighborKey = neighbor.toString();
          if (isValidCell(neighbor[0], neighbor[1]) && !obstaclePositions.has(neighborKey)) {
            updateVertex(neighbor);
          }
        }
      }

      // Add a delay to visualize the process
      await new Promise(resolve => setTimeout(resolve, speed));
    }

    // Reconstruct the path from the start to goal
    const path = [];
    let temp = startPoint;
    while (temp && temp.toString() !== goalKey) {
      path.push({ x: temp[0], y: temp[1], z: 0 });
      temp = cameFrom.get(temp.toString());
    }

    // Include the goal point in the path
    path.push({ x: goalPoint[0], y: goalPoint[1], z: 0 });

    setPath(path.reverse()); // Reverse the path to go from start to goal
    setIsRunning(false); // Stop the search animation
    isSearching.current = false; // Stop the search flag
    console.log("Path found:", path.reverse()); // Log the found path
  };

  isSearching.current = true;
  await computeShortestPath();
  setTimeTaken(Date.now() - startTime);
};

export default dStarLitePathfinding;
