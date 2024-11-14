const bfsPathfinding = ({
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
    const queue = [];
    queue.push({ pos: startPoint });
    const cameFrom = new Map();
    const closedSet = new Set();
    const visited = [];
  
    const searchStep = async () => {
      if (queue.length === 0 || !isRunning) return;
  
      const { pos: current } = queue.shift();
      const [x, y] = current;
      closedSet.add(current.toString());
      visited.push(current);
  
      setVisitedCells([...visited]); // Update visited cells in real-time
  
      // Stop the search if the goal is reached
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
  
        // Skip cells that are out of bounds, obstacles, or already visited
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
  
        if (!cameFrom.has(neighborKey)) {
          cameFrom.set(neighborKey, current);
          queue.push({ pos: neighbor });
        }
      }
  
      // Delay between steps for animation
      await new Promise(resolve => setTimeout(resolve, speed));
      searchStep();
    };
  
    isSearching.current = true;
    searchStep();
  };
  
  export default bfsPathfinding;
  