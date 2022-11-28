import React, { useRef, useState } from "react";

const CommandBar = ({ setRobotPosition, setIsLost, setStatusMessage }) => {
  const POSITION_X_MAX = 5;
  const POSITION_Y_MAX = 3;
  const POSITION_MIN = 0;
  const ERROR_MESSAGE = "There was an error commanding the robot!";

  const submitButton = useRef(null);

  const [commandData, setCommandData] = useState({
    positionX: 0,
    positionY: 0,
    orientation: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCommandData((prevCommandData) => {
      return {
        ...prevCommandData,
        [name]: value,
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    await submitData();
    setLoading(false);
    resetForm();
    submitButton.current.blur();
  };

  const submitData = async () => {
    const command = `c%20${commandData.positionX}%20${commandData.positionY}%20${commandData.orientation}`;

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
      if (values.length !== 3) {
        throw new Error(ERROR_MESSAGE);
      }
      setRobotPosition({
        x: values[0],
        y: values[1],
        o: values[2],
      });
      setIsLost(false);
      setStatusMessage(
        `Robot Position - ${values[0]}, ${values[1]} Orientation - ${values[2]}`
      );
    } catch (error) {
      setStatusMessage(error.message);
    }
  };

  const resetForm = () => {
    setCommandData({
      positionX: 0,
      positionY: 0,
      orientation: "",
    });
  };

  const isFormValid = () => {
    const formValues = Object.values(commandData);
    return formValues.every((currentValue) => currentValue !== "");
  };

  return (
    <div id="commandBar">
      <p>
        Enter the coordinates and orientation used to place the robot on the
        grid.
      </p>
      <form id="commandForm" onSubmit={handleSubmit}>
        <div id="commandForm__position">
          <label>
            X Position
            <input
              type="number"
              name="positionX"
              min={POSITION_MIN}
              max={POSITION_X_MAX}
              onChange={handleChange}
              value={commandData.positionX}
            />
          </label>
          <label>
            Y Position
            <input
              type="number"
              name="positionY"
              min={POSITION_MIN}
              max={POSITION_Y_MAX}
              onChange={handleChange}
              value={commandData.positionY}
            />
          </label>
        </div>
        <div id="commandForm__orientation">
          <p>Orientation</p>
          <div id="orientation__inputs">
            <label>
              North
              <input
                type="radio"
                name="orientation"
                value="N"
                checked={commandData.orientation === "N"}
                onChange={handleChange}
              />
            </label>
            <label>
              South
              <input
                type="radio"
                name="orientation"
                value="S"
                checked={commandData.orientation === "S"}
                onChange={handleChange}
              />
            </label>
            <label>
              East
              <input
                type="radio"
                name="orientation"
                value="E"
                checked={commandData.orientation === "E"}
                onChange={handleChange}
              />
            </label>
            <label>
              West
              <input
                type="radio"
                name="orientation"
                value="W"
                checked={commandData.orientation === "W"}
                onChange={handleChange}
              />
            </label>
          </div>
        </div>
        <button disabled={!isFormValid() && !loading} ref={submitButton}>
          Submit
        </button>
      </form>
    </div>
  );
};

export default CommandBar;
