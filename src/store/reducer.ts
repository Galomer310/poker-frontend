// src/store/reducer.ts

const initialState = {
    winner: null,
    handScores: { p1: 0, p2: 0 },
    exitMessage: null,
  };
  
  export const gameReducer = (state = initialState, action: any) => {
    switch (action.type) {
      case "SET_WINNER":
        return { ...state, winner: action.payload };
      case "SET_HAND_SCORES":
        return { ...state, handScores: action.payload };
      case "SET_EXIT_MESSAGE":
        return { ...state, exitMessage: action.payload };
      default:
        return state;
    }
  };
  