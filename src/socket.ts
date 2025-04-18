import { io } from "socket.io-client";

/** singleton Socket.IO instance (manual connect) */
export const socket = io("http://localhost:4000", { autoConnect: false });

/**
 * Connect after login
 * @param userId   numeric db id
 * @param token    JWT
 * @param username display name
 */
export function connectSocket(
  userId: number,
  token: string,
  username: string
) {
  socket.auth = { userId, token, username };
  socket.connect();
}
