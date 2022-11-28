import React, { useEffect } from "react";

const RobotControls = ({ setRobotPosition, setStatusMessage, setIsLost }) => {
  const ERROR_MESSAGE = "There was an error moving the robot!";

  const handleKeydown = async ({ key }) => {
    if (key === "ArrowUp" || key === "w") {
      await submitMovement("F");
    } else if (key === "ArrowLeft" || key === "a") {
      await submitMovement("L");
    } else if (key === "ArrowRight" || key === "d") {
      await submitMovement("R");
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeydown);

    return () => window.removeEventListener("keydown", handleKeydown);
  }, []);

  const handleClick = async (direction) => {
    await submitMovement(direction);
  };

  const submitMovement = async (direction) => {
    const command = `m%20${direction}`;

    try {
      const response = await fetch(`command/${command}`);
      if (!response.ok) {
        throw new Error(ERROR_MESSAGE);
      }
      const data = await response.json();
      handleResponse(data);
    } catch (error) {
      setStatusMessage(error.message);
    }
  };

  const handleResponse = (data) => {
    try {
      const values = data[0].split(" ");

      setRobotPosition({
        x: values[0],
        y: values[1],
        o: values[2],
      });

      if (values.length === 4) {
        setStatusMessage(
          "LOST - Please place the robot again and be more careful. They're expensive!"
        );
        setIsLost(true);
        return;
      } else if (values.length !== 3) {
        throw new Error(ERROR_MESSAGE);
      }

      setStatusMessage(
        `Robot Position - ${values[0]}, ${values[1]} Orientation - ${values[2]}`
      );
    } catch (error) {
      setStatusMessage(error.message);
    }
  };

  return (
    <div id="robotControlsBar">
      <div id="robotControls">
        <button onClick={() => handleClick("L")}>Left</button>
        <button onClick={() => handleClick("R")}>Right</button>
        <button onClick={() => handleClick("F")}>Forward</button>
      </div>
    </div>
  );
};

export default RobotControls;
