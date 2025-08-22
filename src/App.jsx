import React, { useEffect } from "react";
import startGame from "./game/Game"; 

const App = () => {
  useEffect(() => {
    startGame();
  }, []);

  return (
    <div
      id="phaser-game"
      style={{ width: "100%", height: "100vh", overflow: "hidden" }}
    />
  );
};

export default App;
