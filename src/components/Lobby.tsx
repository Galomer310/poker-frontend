import { useSelector } from "react-redux";
import { RootState } from "../store";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";

const Lobby = () => {
  const nav = useNavigate();
  const { username, credits } = useSelector((s: RootState) => s.auth);

  const joinOneVsOne = () => {
    socket.emit("join-queue");
    console.log("📥 Joining queue with socket id:", socket.id);
    nav("/waiting");
  };

  return (
    <div className="lobby-wrapper">
      <h2>
        Welcome, {username}! — Credits: {credits}
      </h2>

      <p>
        1 v 1 costs 2 credits, winner gains 2 pts &nbsp;|&nbsp; loser −2 pts
      </p>

      <button className="btn" onClick={joinOneVsOne}>
        1 v 1
      </button>

      <button className="btn" onClick={() => nav("/under-construction")}>
        4 players
      </button>
    </div>
  );
};

export default Lobby;
