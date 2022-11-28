import React, { useState } from "react";

const Grid = ({ robotPosition, isLost }) => {
  const createGridColumns = (rowIndex) => {
    return new Array(6)
      .fill(null)
      .map((_, index) => (
        <GridCell
          key={index}
          position={{ x: index, y: rowIndex }}
          robotPosition={robotPosition}
          isLost={isLost}
        />
      ));
  };

  const gridRows = new Array(4).fill(null).map((_, index) => (
    <div key={index} className="gridRow">
      {createGridColumns(index)}
    </div>
  ));

  return <>{robotPosition && <div id="grid">{gridRows}</div>}</>;
};

const GridCell = ({ position, robotPosition, isLost }) => {
  const isRobotInCell = () => {
    return (
      position.x === Number(robotPosition.x) &&
      position.y === Number(robotPosition.y)
    );
  };

  const displayRobot = robotPosition ? isRobotInCell() : false;

  const orientationClass = getOrientationClass(robotPosition.o);
  const className = `gridCell ${
    displayRobot ? "robotCell" : ""
  } ${orientationClass} ${isLost ? "lost" : ""}`;

  return <div className={className}>{displayRobot && <p>{"^"}</p>}</div>;
};

const getOrientationClass = (orientation) => {
  switch (orientation) {
    case "N":
      return "";
    case "E":
      return "east";
    case "S":
      return "south";
    case "W":
      return "west";
  }
};

export default Grid;
