// src/socket.ts
import { io } from "socket.io-client";

/**
 * Create a singleton Socket.IO client instance.
 * We disable autoConnect because we want to connect manually after login.
 */
export const socket = io("http://localhost:4000", { autoConnect: false });

/**
 * Connects the socket with the given authentication information.
 *
 * @param userId - The authenticated user's ID.
 * @param token - The authentication token (e.g., JWT).
 */
export function connectSocket(userId: number, token: string) {
  socket.auth = { userId, token };
  socket.connect();
}
