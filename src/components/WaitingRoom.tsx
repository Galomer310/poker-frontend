// src/components/WaitingRoom.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";

/**
 * WaitingRoom component that displays until the match is ready.
 * Listens for the "start-game" event and navigates to the game board.
 */
const WaitingRoom: React.FC = () => {
  const [message, setMessage] = useState("Waiting for an opponent...");
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for "start-game" event from the backend.
    socket.on("start-game", (data: { player1: string; player2: string }) => {
      console.log("Received start-game event:", data);
      // Navigate to the game board when ready.
      navigate("/game");
    });

    // Listen for any matchmaking errors.
    socket.on("matchmaking-error", (errMsg: string) => {
      setMessage(errMsg);
    });

    // Clean up the event listeners when component unmounts.
    return () => {
      socket.off("start-game");
      socket.off("matchmaking-error");
    };
  }, [navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "3rem" }}>
      <h1>Waiting Room</h1>
      <p>{message}</p>
    </div>
  );
};

export default WaitingRoom;
