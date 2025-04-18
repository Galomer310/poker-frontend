// src/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import gameReducer from "./gameSlice";
import authReducer from "./authSlice";     // ← import the new slice

// ——— define the store ———
export const store = configureStore({
  reducer: {
    game: gameReducer,
    auth: authReducer,                    // ← add slice here
  },
});

// ——— RootState & AppDispatch types ———
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;



