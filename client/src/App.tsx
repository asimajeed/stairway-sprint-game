import Waves from "./components/Waves";
import "./App.css";
import Game from "./components/Game";

export default function App() {
  return (
    <>
      <div id="welcome-overlay">
        <h1>Welcome to my first web game...</h1>
      </div>
      <Waves />

      <div className="header-div">
        <header className="header">
          <span className="header-span">Asim's</span>
          <h1>Precision Escalier</h1>
        </header>
      </div>
      <Game />
    </>
  );
}
