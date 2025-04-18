import { io } from "socket.io-client";

/** single Socket.IO instance shared across the app */
export const socket = io("http://localhost:4000", { autoConnect: false });

/** connect right after login */
export function connectSocket(
  userId: number,
  token: string,
  username: string
) {
  socket.auth = { userId, token, username };
  socket.connect();
}

/**
 * If the socket was disconnected (e.g. after exit‑game),
 * reconnect with the stored credentials from Redux.
 */
export function ensureSocketConnected(
  userId: number,
  token: string,
  username: string
) {
  if (socket.connected) return;

  socket.auth = { userId, token, username };
  socket.connect();
}
