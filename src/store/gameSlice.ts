import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface GameState {
  board: Record<string, number[][]>;
  currentActivePlayer: string | null;
  currentCard: number | null;
  winner: string | null;
  gameOver: boolean | null;
  username: string | null;
  credits: number | null;
  columnScores: Record<number, { your: number; opp: number }>;
}

const initialState: GameState = {
  board: {},
  currentActivePlayer: null,
  currentCard: null,
  winner: null,
  gameOver: null,
  username: null,
  credits: null,
  columnScores: {},
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    setGameState(state, action: PayloadAction<any>) {
      const { currentActivePlayer, currentCard, gameOver, ...board } = action.payload;
      state.board = board;
      state.currentActivePlayer = currentActivePlayer;
      state.currentCard = currentCard;
      state.gameOver = gameOver;
    },
    setWinner(state, action: PayloadAction<string>) {
      state.winner = action.payload;
    },
    setUser(state, action: PayloadAction<{ username: string; credits: number }>) {
      state.username = action.payload.username;
      state.credits = action.payload.credits;
    },
    updateCredits(state, action: PayloadAction<number>) {
      state.credits = action.payload;
    },
    updateColumnScore(
      state,
      action: PayloadAction<{ column: number; your: number; opp: number }>
    ) {
      state.columnScores[action.payload.column] = {
        your: action.payload.your,
        opp: action.payload.opp,
      };
    },
    resetColumnScores(state) {
      state.columnScores = {};
    },
  },
});

export const {
  setGameState,
  setWinner,
  setUser,
  updateCredits,
  updateColumnScore,
  resetColumnScores,
} = gameSlice.actions;
export default gameSlice.reducer;
