import { useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import GenVid from "./GenVid";
import Gif from "./Gif";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <GenVid />
      <Gif />
    </div>
  );
}

export default App;
