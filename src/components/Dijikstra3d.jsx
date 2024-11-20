import PriorityQueue from "js-priority-queue";

const dijkstraPathfinding = async ({
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
  const openSetQueue = new PriorityQueue({ comparator: (a, b) => a.g - b.g });
  openSetQueue.queue({
    pos: startPoint,
    g: 0,
  });
  const cameFrom = new Map();
  const gScore = new Map();
  gScore.set(startPoint.toString(), 0);
  const closedSet = new Set();
  const visited = [];

  const searchStep = async () => {
    if (openSetQueue.length === 0 || !isRunning) return;

    const { pos: current } = openSetQueue.dequeue();
    const [x, y, z] = current;
    closedSet.add(current.toString());
    visited.push(current);

    setVisitedCells([...visited]); // Update visited cells in real-time

    // Stop the search if the goal is reached
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

      // Skip cells that are out of bounds, obstacles, or already closed
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

      const tentativeGScore = gScore.get(current.toString()) + 1;
      if (tentativeGScore < (gScore.get(neighborKey) || Infinity)) {
        cameFrom.set(neighborKey, current);
        gScore.set(neighborKey, tentativeGScore);
        openSetQueue.queue({
          pos: neighbor,
          g: tentativeGScore,
        });
      }
    }

    // Delay between steps for animation
    await new Promise(resolve => setTimeout(resolve, speed));
    await searchStep();
  };

  isSearching.current = true;
  await searchStep();
  setTimeTaken(Date.now() - startTime);
};

export default dijkstraPathfinding;
