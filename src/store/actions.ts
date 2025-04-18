// src/store/actions.ts

export const setWinner = (winner: string) => ({
    type: "SET_WINNER",
    payload: winner,
  });
  
  export const setHandScores = (scores: { p1: number; p2: number }) => ({
    type: "SET_HAND_SCORES",
    payload: scores,
  });
  
  export const setExitMessage = (message: string) => ({
    type: "SET_EXIT_MESSAGE",
    payload: message,
  });
  