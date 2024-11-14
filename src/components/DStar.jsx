import PriorityQueue from "js-priority-queue";

// Heuristic function for D* Lite (Manhattan distance)
const heuristic = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);

const dStarLitePathFinding = async ({
  startPoint,
  goalPoint,
  gridSize,
  setPath,
  setVisitedCells,
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
  const rhs = new Map();
  const k = new Map();  // Key for sorting open set

  gScore.set(startPoint.toString(), 0);
  rhs.set(goalPoint.toString(), 0);

  const closedSet = new Set();
  const visited = [];

  // Helper function to get the cost to move to a neighbor
  const getCost = (current, neighbor) => 1;

  // Update function for D* Lite to propagate updates in the grid
  const updateKey = (node) => {
    const g = gScore.get(node.toString()) || Infinity;
    const rhsVal = rhs.get(node.toString()) || Infinity;
    const f = Math.min(g, rhsVal) + heuristic(node, goalPoint);
    k.set(node.toString(), f);
  };

  // Initialize the key for start and goal points
  updateKey(startPoint);
  updateKey(goalPoint);

  // A function to compute the D* Lite path
  const computePath = async () => {
    if (!isRunning) return;

    const openSetQueue = new PriorityQueue({ comparator: (a, b) => a.f - b.f });

    openSetQueue.queue({
      pos: startPoint,
      f: heuristic(startPoint, goalPoint),
      g: 0,
    });

    const visited = [];
    const path = [];
    
    // Main search loop for D* Lite
    while (openSetQueue.length > 0 && isRunning) {
      const { pos: current } = openSetQueue.dequeue();
      const [x, y] = current;
      visited.push(current);
      setVisitedCells([...visited]);

      // Check if we reached the goal
      if (current.toString() === goalPoint.toString()) {
        let temp = current;
        while (temp) {
          path.push({ x: temp[0], y: temp[1], z: 0 });
          temp = cameFrom.get(temp.toString());
        }
        setPath(path.reverse());
        setIsRunning(false);
        return;
      }

      // Explore neighbors of the current node
      for (const [dx, dy] of directions) {
        const neighbor = [x + dx, y + dy];
        const neighborKey = neighbor.toString();

        if (
          neighbor[0] < 0 ||
          neighbor[0] >= gridSize ||
          neighbor[1] < 0 ||
          neighbor[1] >= gridSize ||
          obstaclePositions.has(neighborKey)
        ) {
          continue;
        }

        const tentativeGScore = gScore.get(current.toString()) + getCost(current, neighbor);
        if (tentativeGScore < (gScore.get(neighborKey) || Infinity)) {
          gScore.set(neighborKey, tentativeGScore);
          cameFrom.set(neighborKey, current);
        }
        
        updateKey(neighbor);
        openSetQueue.queue({
          pos: neighbor,
          f: heuristic(neighbor, goalPoint) + tentativeGScore,
          g: tentativeGScore,
        });
      }

      // Delay between steps for animation
      await new Promise(resolve => setTimeout(resolve, speed));
    }
  };

  await computePath();
  setTimeTaken(Date.now() - startTime);
};

export default dStarLitePathFinding;
