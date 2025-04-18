import { useSelector } from "react-redux";
import { RootState } from "../store";
import { useNavigate } from "react-router-dom";
import { socket, ensureSocketConnected } from "../socket";

/**
 * Lobby — choose a 1 v 1 match.
 */
const Lobby = () => {
  const nav = useNavigate();
  const { id, token, username, credits } = useSelector(
    (s: RootState) => s.auth
  );

  /** join queue — reconnect first if user has returned from a finished game */
  const joinOneVsOne = () => {
    if (socket.disconnected) {
      // reconnect, then emit once we’re connected
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

  return (
    <div className="lobby-wrapper">
      <h2>Welcome, {username}!</h2>
      <h3>You Have: {credits} Credit Points</h3>
      <div className="chinese-poker-wrapper">
        <p>Play Chinese Poker </p>
        <button className="btn" onClick={joinOneVsOne}>
          1 Vs 1
        </button>

        <button className="btn" onClick={() => nav("/under-construction")}>
          4 players
        </button>
      </div>
    </div>
  );
};

export default Lobby;
