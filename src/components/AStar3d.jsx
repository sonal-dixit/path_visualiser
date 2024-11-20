import PriorityQueue from "js-priority-queue";

const heuristic = (a, b) =>
  Math.abs(a[0] - b[0]) +
  Math.abs(a[1] - b[1]) +
  Math.abs(a[2] - b[2]);

const aStarPathfinding = async ({
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
    f: heuristic(startPoint, goalPoint),
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
    await new Promise((resolve) => setTimeout(resolve, speed));
    await searchStep();
  };

  isSearching.current = true;
  await searchStep();
  setTimeTaken(Date.now() - startTime);
};

export default aStarPathfinding;
