// src/hooks/useSocketListeners.ts

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setWinner, setHandScores, setExitMessage } from "../store/actions";  // Redux actions
import { io } from "socket.io-client";

// This is an example of how to listen to socket events
export const useSocketListeners = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const socket = io("http://localhost:4000");

    // Listen for the "winner" event from the backend
    socket.on("winner", (winnerId: string) => {
      if (winnerId === "draw") {
        dispatch(setWinner("It's a draw!"));
      } else {
        dispatch(setWinner(`Player ${winnerId} wins!`));
      }
    });

    // Listen for the "column-score" event from the backend
    socket.on("column-score", (data: { column: number; p1: number; p2: number }) => {
      dispatch(setHandScores({ p1: data.p1, p2: data.p2 }));
    });

    // Listen for the "player-exited" event from the backend
    socket.on("player-exited", (data: { message: string }) => {
      dispatch(setExitMessage(data.message));  // Show exit message when player exits
    });

    // Clean up socket listeners when component unmounts
    return () => {
      socket.off("winner");
      socket.off("column-score");
      socket.off("player-exited");
    };
  }, [dispatch]);
};
