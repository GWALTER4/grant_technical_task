import React from "react";

const StatusBar = ({ statusMessage }) => {
  return (
    <div id="statusBar">
      <div id="statusMessage">
        <p>{statusMessage}</p>
      </div>
    </div>
  );
};

export default StatusBar;
