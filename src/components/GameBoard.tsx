import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";
import { cardMap, displayValue } from "../utils/cards";

/** red for ♥ / ♦, black otherwise */
const suitColor = (s: string) => (s === "♥" || s === "♦" ? "red" : "black");

const GameBoard: React.FC = () => {
  const [gameData, setGameData] = useState<any>(null);
  const [drawnCard, setDrawnCard] = useState<number | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const navigate = useNavigate();

  /* ───────── socket bootstrap ───────── */
  useEffect(() => {
    if (socket.connected) setPlayerId(socket.id ?? null);
    socket.on("connect", () => setPlayerId(socket.id ?? null));

    socket.on("board", (d) => {
      setGameData(d);
      setDrawnCard(d.drawnCard);
    });
    socket.on("drawn-card", (c: number) => setDrawnCard(c));
    socket.on("winner", (id: string) => setWinner(id));
    socket.on("game-error", (msg: string) => setError(msg));

    socket.emit("request-board");
    return () => {
      socket.off("connect");
      socket.off("board");
      socket.off("drawn-card");
      socket.off("winner");
      socket.off("game-error");
    };
  }, []);

  /* ───────── helpers ───────── */
  const renderCard = (c: number | null, k: number) =>
    c === null ? (
      <img
        key={k}
        src="/card-back.png"
        alt="Hidden card"
        style={{ width: 40, height: 60, margin: "2px 0" }}
      />
    ) : (
      <div
        key={k}
        style={{
          background: "#eee",
          borderRadius: 4,
          padding: "4px 8px",
          margin: "2px 0",
          color: suitColor(cardMap[c].suit),
        }}
      >
        {cardMap[c].suit}
        {displayValue(cardMap[c].value)}
      </div>
    );

  /* ───────── actions ───────── */
  const draw = () => socket.emit("draw-card");
  const place = (col: number) => {
    if (drawnCard === null) return;
    socket.emit("place-card", { column: col });
    setDrawnCard(null);
  };
  const restart = () => socket.emit("restart-game");
  const exit = () => {
    socket.emit("exit-game");
    setTimeout(() => {
      socket.disconnect();
      navigate("/");
    }, 200);
  };

  /* ───────── guards ───────── */
  if (error) return <div>Error: {error}</div>;
  if (!gameData || !playerId) return <div>Loading game...</div>;

  /* ids & helper values */
  const you = playerId;
  const opp = Object.keys(gameData.board).find((id) => id !== you)!;
  const yourTurn = gameData.currentActivePlayer === you;
  const yourCols = gameData.board[you] as (number | null)[][];
  const currentRow = Math.min(...yourCols.map((c) => c.length)); // 0‑4

  /* ───────── render ───────── */
  return (
    <div
      style={{
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        minHeight: "100vh",
      }}
    >
      <h1>Game in Progress</h1>

      <p>
        <strong>Active:</strong> {gameData.currentActivePlayer}
      </p>
      <p>
        <strong>Drawn Card:</strong>{" "}
        {drawnCard !== null
          ? `${cardMap[drawnCard].suit}${displayValue(
              cardMap[drawnCard].value
            )}`
          : "None"}
      </p>

      {winner && (
        <div style={{ marginTop: 16, fontSize: 24, color: "green" }}>
          Winner: {winner}
        </div>
      )}

      <div style={{ marginTop: 32 }}>
        <h2>Board</h2>

        {/* Opponent columns */}
        <h3>Opponent ({opp})</h3>
        <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
          {gameData.board[opp]?.map((col: (number | null)[], i: number) => (
            <div
              key={i}
              style={{
                minWidth: 60,
                padding: 5,
                border: "1px solid #ccc",
                borderRadius: 4,
              }}
            >
              {col.map(renderCard)}
            </div>
          ))}
        </div>

        {/* Your columns */}
        <h3 style={{ marginTop: 24 }}>You ({you})</h3>
        <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
          {yourCols.map((col: (number | null)[], i: number) => (
            <div
              key={i}
              style={{
                minWidth: 60,
                padding: 5,
                border: "1px solid #ccc",
                borderRadius: 4,
              }}
            >
              {col.map(renderCard)}
              <button
                onClick={() => place(i)}
                disabled={
                  drawnCard === null /* need a card */ ||
                  col.length >= 5 /* column full */ ||
                  !yourTurn /* not your turn */ ||
                  col.length !== currentRow /* row rule */
                }
                style={{ marginTop: 4 }}
              >
                Place
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 32 }}>
        <button onClick={draw} disabled={drawnCard !== null || !yourTurn}>
          Draw
        </button>
        <button onClick={restart} style={{ marginLeft: 16 }}>
          🔁 Restart
        </button>
        <button onClick={exit} style={{ marginLeft: 16, color: "red" }}>
          ❌ Exit
        </button>
      </div>
    </div>
  );
};

export default GameBoard;
