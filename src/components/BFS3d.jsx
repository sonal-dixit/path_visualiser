const bfsPathfinding = async ({
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
    const queue = [];
    queue.push({ pos: startPoint });
    const cameFrom = new Map();
    const closedSet = new Set();
    const visited = [];
  
    const searchStep = async () => {
      if (queue.length === 0 || !isRunning) return;
  
      const { pos: current } = queue.shift();
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
  
        // Skip cells that are out of bounds, obstacles, or already visited
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
  
        if (!cameFrom.has(neighborKey)) {
          cameFrom.set(neighborKey, current);
          queue.push({ pos: neighbor });
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
  
  export default bfsPathfinding;
  