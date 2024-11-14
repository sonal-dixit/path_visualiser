const bellmanFordPathfinding = ({
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
    const distances = new Map();
    distances.set(startPoint.toString(), 0);
    const cameFrom = new Map();
    const visited = [];
    const totalCells = gridSize * gridSize;
  
    // Initialize distances to all nodes as infinity
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const cellKey = [i, j].toString();
        if (cellKey !== startPoint.toString()) distances.set(cellKey, Infinity);
      }
    }
  
    const relaxEdges = async () => {
      for (let k = 0; k < totalCells - 1; k++) {
        let hasUpdates = false;
  
        for (const [cell, distance] of distances.entries()) {
          const [x, y] = cell.split(',').map(Number);
  
          if (distance === Infinity) continue;
  
          for (const [dx, dy] of directions) {
            const neighbor = [x + dx, y + dy];
            const neighborKey = neighbor.toString();
  
            // Skip out-of-bounds or obstacle cells
            if (
              neighbor[0] < 0 ||
              neighbor[0] >= gridSize ||
              neighbor[1] < 0 ||
              neighbor[1] >= gridSize ||
              obstaclePositions.has(neighborKey)
            ) {
              continue;
            }
  
            const newDistance = distance + 1;
  
            if (newDistance < (distances.get(neighborKey) || Infinity)) {
              distances.set(neighborKey, newDistance);
              cameFrom.set(neighborKey, [x, y]);
              hasUpdates = true;
            }
          }
        }
  
        // Update visited cells in real-time
        visited.push(...Array.from(distances.keys()).map(key => key.split(',').map(Number)));
        setVisitedCells([...visited]);
  
        // Delay between iterations for animation
        await new Promise(resolve => setTimeout(resolve, speed));
  
        if (!hasUpdates) break; // No changes, so we can stop early
      }
  
      // Reconstruct the path if goal is reachable
      if (distances.get(goalPoint.toString()) < Infinity) {
        const path = [];
        let temp = goalPoint;
        while (temp) {
          path.push({ x: temp[0], y: temp[1], z: 0 });
          temp = cameFrom.get(temp.toString());
        }
        setPath(path.reverse());
      }
  
      isSearching.current = false;
      setIsRunning(false);
    };
  
    isSearching.current = true;
    relaxEdges();
  };
  
  export default bellmanFordPathfinding;
  