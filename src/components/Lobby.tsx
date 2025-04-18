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
      <h2>
        Welcome, {username}! — Credits: {credits}
      </h2>

      <p>1 v 1 costs 2 credits, winner +2&nbsp;|&nbsp;loser −2</p>

      <button className="btn" onClick={joinOneVsOne}>
        1 vs 1
      </button>

      <button className="btn" onClick={() => nav("/under-construction")}>
        4 players
      </button>
    </div>
  );
};

export default Lobby;
