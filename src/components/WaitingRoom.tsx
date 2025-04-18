import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";

const WaitingRoom = () => {
  const [msg, setMsg] = useState("Waiting for an opponent…");
  const nav = useNavigate();

  useEffect(() => {
    socket.on("start-game", () => nav("/game"));
    socket.on("matchmaking-error", (m: string) => setMsg(m));
    return () => {
      socket.off("start-game");
      socket.off("matchmaking-error");
    };
  }, [nav]);

  return (
    <div className="lobby-wrapper">
      <h1>Waiting Room</h1>
      <p>{msg}</p>
    </div>
  );
};

export default WaitingRoom;
