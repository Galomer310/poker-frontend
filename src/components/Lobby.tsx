import { useSelector } from "react-redux";
import { RootState } from "../store";
import { useNavigate } from "react-router-dom";
import { socket, ensureSocketConnected } from "../socket";

/**
 * Lobby — choose a 1 v 1 quick match or browse custom rooms.
 */
const Lobby = () => {
  const nav = useNavigate();
  const { id, token, username, credits } = useSelector(
    (s: RootState) => s.auth
  );

  /** quick queue (unchanged) */
  const joinOneVsOne = () => {
    if (socket.disconnected) {
      socket.once("connect", () => {
        socket.emit("join-queue");
        nav("/waiting");
      });
      ensureSocketConnected(id!, token!, username!);
    } else {
      socket.emit("join-queue");
      nav("/waiting");
    }
  };

  /** go to rooms page */
  const goRooms = () => {
    if (socket.disconnected) {
      ensureSocketConnected(id!, token!, username!);
      socket.once("connect", () => nav("/rooms"));
    } else {
      nav("/rooms");
    }
  };

  return (
    <div className="lobby-wrapper">
      <h2>Welcome, {username}!</h2>
      <h3>You Have: {credits} Credit Points</h3>

      <p className="mb-4">Play Chinese Poker 5 Cards 🃜🃚🃖🃁🂭🂺</p>

      <button className="btn mb-2" onClick={joinOneVsOne}>
        1 Vs 1 (Quick)
      </button>

      <button className="btn" onClick={goRooms}>
        Rooms
      </button>
    </div>
  );
};

export default Lobby;
