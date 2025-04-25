// src/App.tsx
import React, { JSX } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "./store";
import Lobby from "./components/Lobby";
import Register from "./components/Register";
import Login from "./components/Login";
import WaitingRoom from "./components/WaitingRoom";
import GameBoard from "./components/GameBoard";
import UnderConstruction from "./components/UnderConstruction";
import GameRooms from "./components/GameRooms";

/**
 * Private route component that renders children only if the user is authenticated.
 */
const Private: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const isAuth = useSelector((state: RootState) => state.auth.isAuth);
  return isAuth ? children : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <Private>
              <Lobby />
            </Private>
          }
        />
        <Route
          path="/waiting"
          element={
            <Private>
              <WaitingRoom />
            </Private>
          }
        />
        <Route
          path="/game"
          element={
            <Private>
              <GameBoard />
            </Private>
          }
        />
        <Route
          path="/rooms"
          element={
            <Private>
              <GameRooms />
            </Private>
          }
        />

        <Route path="/under-construction" element={<UnderConstruction />} />
      </Routes>
    </Router>
  );
};

export default App;
