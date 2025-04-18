// src/components/Lobby.tsx
import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";

/**
 * Lobby component where authenticated users choose to join a 1v1 match.
 */
const Lobby: React.FC = () => {
  const navigate = useNavigate();
  const { username, credits } = useSelector((state: RootState) => state.auth);

  /**
   * Join a 1v1 match: Emit a "join-queue" event and navigate to the waiting room.
   */
  const joinOneVsOne = () => {
    socket.emit("join-queue");
    console.log("📥 Joining queue with socket id:", socket.id);
    navigate("/waiting");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "3rem" }}>
      <h2>
        Welcome, {username}! — Credits: {credits}
      </h2>
      <p>
        1 v 1 costs 2 credits, winner gains 2 points and loser loses 2 points.
      </p>
      <button
        onClick={joinOneVsOne}
        style={{ padding: "1rem 2rem", marginRight: 20 }}
      >
        1 v 1
      </button>
      <button
        onClick={() => navigate("/under-construction")}
        style={{ padding: "1rem 2rem" }}
      >
        4 players
      </button>
    </div>
  );
};

export default Lobby;
