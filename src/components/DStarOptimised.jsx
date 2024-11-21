import PriorityQueue from "js-priority-queue";

const heuristic = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);

const dStarLitePathfindingOptimised = async ({
  startPoint,
  goalPoint,
  gridSize,
  setPath,
  setVisitedCells,
  isSearching,
  isRunning,
  setIsRunning,
  obstaclePositions,
  speed,
  setTimeTaken,
}) => {
  const getDynamicDirections = (startPoint, goalPoint) => {
    const dx = goalPoint[0] - startPoint[0]; // X-axis difference
    const dy = goalPoint[1] - startPoint[1]; // Y-axis difference
    
    // Prioritize directions based on the goal's relative position
    const directions = [];
    if (dx > 0) directions.push([1, 0]); // Move down
    if (dx < 0) directions.push([-1, 0]); // Move up
    if (dy > 0) directions.push([0, 1]); // Move right
    if (dy < 0) directions.push([0, -1]); // Move left
    
    return directions;
  };

  const directions = getDynamicDirections(startPoint, goalPoint);
  const startTime = Date.now();
  
  const openSetQueue = new PriorityQueue({
    comparator: (a, b) => a.key - b.key,
  });
  const gScore = new Map();
  const rhs = new Map();
  const cameFrom = new Map();

  // Initialize gScore and rhs for start point
  const startKey = heuristic(startPoint, goalPoint);
  openSetQueue.queue({
    pos: startPoint,
    key: startKey,
  });
  gScore.set(startPoint.toString(), Infinity);
  rhs.set(startPoint.toString(), 0);
  const closedSet = new Set();
  const visited = [];

  // Update the rhs value for all neighbors of a position
  const updateRHS = (pos) => {
    const [x, y] = pos;
    const neighbors = directions.map(([dx, dy]) => [x + dx, y + dy]);

    let minRHS = Infinity;
    neighbors.forEach(([nx, ny]) => {
      if (nx >= 0 && ny >= 0 && nx < gridSize && ny < gridSize) {
        const neighborKey = [nx, ny].toString();
        if (!obstaclePositions.has(neighborKey)) {
          minRHS = Math.min(minRHS, gScore.get(neighborKey) + 1);
        }
      }
    });

    rhs.set(pos.toString(), minRHS);
  };

  // Function to handle dynamic obstacle appearance
  const addRandomObstacle = () => {
    const randX = Math.floor(Math.random() * gridSize);
    const randY = Math.floor(Math.random() * gridSize);
    const randPos = [randX, randY].toString();
    if (
      !obstaclePositions.has(randPos) &&
      [randX, randY].toString() !== startPoint.toString() &&
      [randX, randY].toString() !== goalPoint.toString()
    ) {
      obstaclePositions.add(randPos);
      console.log("New obstacle added at", randPos);
    }
  };

  // Recalculate path
  const recalculatePath = () => {
    const path = [];
    let current = goalPoint;
    while (cameFrom.has(current.toString())) {
      path.push({ x: current[0], y: current[1], z: 0 });
      current = cameFrom.get(current.toString());
    }
    path.reverse();
    setPath(path);
  };

  const searchStep = async () => {
    if (openSetQueue.length === 0 || !isRunning) return;

    const { pos: current } = openSetQueue.dequeue();
    const [x, y] = current;
    closedSet.add(current.toString());
    visited.push(current);

    setVisitedCells([...visited]);

    // If we reach the goal
    if (current.toString() === goalPoint.toString()) {
      recalculatePath();
      isSearching.current = false;
      setIsRunning(false);
      return;
    }

    // Add a random obstacle at regular intervals during the search process
    if (Math.random() < 0.05) {
      // Adjust probability as needed
      addRandomObstacle();
    }

    // Update rhs for neighbors
    const neighbors = directions.map(([dx, dy]) => [x + dx, y + dy]);
    for (const [nx, ny] of neighbors) {
      const neighborKey = [nx, ny].toString();
      if (
        nx >= 0 &&
        ny >= 0 &&
        nx < gridSize &&
        ny < gridSize &&
        !obstaclePositions.has(neighborKey) &&
        !closedSet.has(neighborKey)
      ) {
        const newGScore = gScore.get(current.toString()) + 1;
        gScore.set(neighborKey, newGScore);
        cameFrom.set(neighborKey, current);
        openSetQueue.queue({
          pos: [nx, ny],
          key: newGScore + heuristic([nx, ny], goalPoint),
        });
      }
    }

    // Delay for animation
    await new Promise((resolve) => setTimeout(resolve, speed));

    await searchStep();
  };

  isSearching.current = true;
  await searchStep();
  setTimeTaken(Date.now() - startTime);
};

export default dStarLitePathfindingOptimised;
