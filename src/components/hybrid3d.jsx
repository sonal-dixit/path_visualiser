import PriorityQueue from "js-priority-queue";

// Heuristic for D* Lite (3D Manhattan distance)
const heuristic3D = (a, b) => 
  Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);

// Dynamic A* Lite Pathfinding Algorithm with 3D Potential Field Smoothing
const hybridPathfinding = async ({
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
}) => {
  const startTime = Date.now();
  const openSetQueue = new PriorityQueue({ comparator: (a, b) => a.f - b.f });
  openSetQueue.queue({
    pos: startPoint,
    f: heuristic3D(startPoint, goalPoint),
    g: 0,
  });

  const cameFrom = new Map();
  const gScore = new Map();
  gScore.set(startPoint.toString(), 0);
  const closedSet = new Set();
  const visited = [];

  // Helper function to get the "cost" to move to a neighbor
  const getCost = (current, neighbor) => 1;

  // Optimized Potential Field Method (PFM) for smooth navigation
  const applyPotentialField = (current, goal) => {
    const [cx, cy, cz] = current;
    const [gx, gy, gz] = goal;

    // Calculate attractive force (towards the goal)
    const attractiveForceX = gx - cx;
    const attractiveForceY = gy - cy;
    const attractiveForceZ = gz - cz;

    // Repulsive forces from obstacles
    let repulsiveForceX = 0;
    let repulsiveForceY = 0;
    let repulsiveForceZ = 0;
    for (const pos of obstaclePositions) {
      const [ox, oy, oz] = pos.split(',').map(Number);
      const distance = Math.hypot(cx - ox, cy - oy, cz - oz);
      if (distance < 2) {
        const repulsionStrength = 1 / (distance ** 2);
        repulsiveForceX += (cx - ox) * repulsionStrength;
        repulsiveForceY += (cy - oy) * repulsionStrength;
        repulsiveForceZ += (cz - oz) * repulsionStrength;
      }
    }

    // Combine attractive and repulsive forces
    return [
      attractiveForceX - repulsiveForceX,
      attractiveForceY - repulsiveForceY,
      attractiveForceZ - repulsiveForceZ,
    ];
  };

  // Search step
  const searchStep = async () => {
    if (openSetQueue.length === 0 || !isRunning) return;

    const { pos: current } = openSetQueue.dequeue();
    const [x, y, z] = current;
    closedSet.add(current.toString());
    visited.push(current);

    setVisitedCells([...visited]); // Update visited cells in real-time

    if (current.toString() === goalPoint.toString()) {
      const path = [];
      let temp = current;
      while (temp) {
        path.push({ x: temp[0], y: temp[1], z: temp[2] });
        temp = cameFrom.get(temp.toString());
      }
      setPath(path.reverse());
      isSearching.current = false;
      setIsRunning(false);
      return;
    }

    for (const [dx, dy, dz] of directions) {
      const neighbor = [x + dx, y + dy, z + dz];
      const neighborKey = neighbor.toString();

      if (
        neighbor[0] < 0 ||
        neighbor[0] >= gridSize ||
        neighbor[1] < 0 ||
        neighbor[1] >= gridSize ||
        neighbor[2] < 0 ||
        neighbor[2] >= gridSize ||
        obstaclePositions.has(neighborKey) ||
        closedSet.has(neighborKey)
      ) {
        continue;
      }

      // Calculate cost and apply potential field smoothing
      const tentativeGScore = gScore.get(current.toString()) + getCost(current, neighbor);
      const [smoothX, smoothY, smoothZ] = applyPotentialField(neighbor, goalPoint);
      const smoothedHeuristic = heuristic3D(neighbor, goalPoint) + Math.hypot(smoothX, smoothY, smoothZ);

      if (tentativeGScore < (gScore.get(neighborKey) || Infinity)) {
        cameFrom.set(neighborKey, current);
        gScore.set(neighborKey, tentativeGScore);
        openSetQueue.queue({
          pos: neighbor,
          f: tentativeGScore + smoothedHeuristic,
          g: tentativeGScore,
        });
      }
    }

    // Delay between steps for animation
    await new Promise((resolve) => setTimeout(resolve, speed));
    await searchStep();
  };

  isSearching.current = true;
  await searchStep();
  setTimeTaken(Date.now() - startTime);
};

export default hybridPathfinding;
