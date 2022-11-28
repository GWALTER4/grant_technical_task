import React, { useRef, useState } from "react";
import CommandBar from "./CommandBar";
import Grid from "./Grid";
import RobotControls from "./RobotControls";
import StatusBar from "./StatusBar";

import "./styles/styles.css";

const App = () => {
  const [robotPosition, setRobotPosition] = useState(null);
  const [isLost, setIsLost] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  return (
    <>
      <header>
        <h1>Martian Robots</h1>
      </header>
      <main>
        <CommandBar
          setRobotPosition={setRobotPosition}
          setIsLost={setIsLost}
          setStatusMessage={setStatusMessage}
        />
        <StatusBar statusMessage={statusMessage} />
        <Grid robotPosition={robotPosition} isLost={isLost} />
        {!isLost && robotPosition && (
          <RobotControls
            setRobotPosition={setRobotPosition}
            setIsLost={setIsLost}
            setStatusMessage={setStatusMessage}
          />
        )}
      </main>
    </>
  );
};

export default App;
