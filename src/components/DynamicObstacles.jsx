import React from 'react';

const DynamicObstacles = ({ obstacles }) => {
  return (
    <>
      {obstacles.map((obstacle, index) => (
        <mesh key={index} position={[obstacle.x, obstacle.y, obstacle.z]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="red" />
        </mesh>
      ))}
    </>
  );
};

export default DynamicObstacles;
