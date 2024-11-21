import PriorityQueue from "js-priority-queue";


const heuristic = (a, b) =>
 Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);


const dStarLitePathfinding3D = async ({
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


 const openSetQueue = new PriorityQueue({ comparator: (a, b) => a.key - b.key });
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


 // Update the rhs value for all neighbors of a position in 3D
 const updateRHS = (pos) => {
   const [x, y, z] = pos;
   const neighbors = directions.map(([dx, dy, dz]) => [x + dx, y + dy, z + dz]);


   let minRHS = Infinity;
   neighbors.forEach(([nx, ny, nz]) => {
     if (nx >= 0 && ny >= 0 && nz >= 0 && nx < gridSize && ny < gridSize && nz < gridSize) {
       const neighborKey = [nx, ny, nz].toString();
       if (!obstaclePositions.has(neighborKey)) {
         minRHS = Math.min(minRHS, gScore.get(neighborKey) + 1);
       }
     }
   });
  
   rhs.set(pos.toString(), minRHS);
 };


 // Function to handle dynamic obstacle appearance in 3D
 const addRandomObstacle = () => {
   const randX = Math.floor(Math.random() * gridSize);
   const randY = Math.floor(Math.random() * gridSize);
   const randZ = Math.floor(Math.random() * gridSize);
   const randPos = [randX, randY, randZ].toString();
   if (!obstaclePositions.has(randPos) && [randX, randY, randZ].toString() !== startPoint.toString() && [randX, randY, randZ].toString() !== goalPoint.toString()) {
     obstaclePositions.add(randPos);
     console.log("New obstacle added at", randPos);
   }
 };


 // Recalculate path
 const recalculatePath = () => {
   const path = [];
   let current = goalPoint;
   while (cameFrom.has(current.toString())) {
     path.push({ x: current[0], y: current[1], z: current[2] });
     current = cameFrom.get(current.toString());
   }
   path.reverse();
   setPath(path);
 };


 const searchStep = async () => {
   if (openSetQueue.length === 0 || !isRunning) return;


   const { pos: current } = openSetQueue.dequeue();
   const [x, y, z] = current;
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
   if (Math.random() < 0.05) { // Adjust probability as needed
     addRandomObstacle();
   }


   // Update rhs for neighbors in 3D space
   const neighbors = directions.map(([dx, dy, dz]) => [x + dx, y + dy, z + dz]);
   for (const [nx, ny, nz] of neighbors) {
     const neighborKey = [nx, ny, nz].toString();
     if (
       nx >= 0 && ny >= 0 && nz >= 0 && nx < gridSize && ny < gridSize && nz < gridSize &&
       !obstaclePositions.has(neighborKey) &&
       !closedSet.has(neighborKey)
     ) {
       const newGScore = gScore.get(current.toString()) + 1;
       gScore.set(neighborKey, newGScore);
       cameFrom.set(neighborKey, current);
       openSetQueue.queue({
         pos: [nx, ny, nz],
         key: newGScore + heuristic([nx, ny, nz], goalPoint),
       });
     }
   }


   // Delay for animation
   await new Promise(resolve => setTimeout(resolve, speed));


   await searchStep();
 };


 isSearching.current = true;
 await searchStep();
 setTimeTaken(Date.now() - startTime);
};


export default dStarLitePathfinding3D;
