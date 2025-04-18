import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";
import { cardMap, displayValue } from "../utils/cards";

const suitColor = (s: string) => (s === "♥" || s === "♦" ? "red" : "black");

const GameBoard: React.FC = () => {
  const [gameData, setGameData] = useState<any>(null);
  const [drawnCard, setDrawnCard] = useState<number | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const nav = useNavigate();

  /* ───────── socket bootstrap ───────── */
  useEffect(() => {
    if (socket.connected) setPlayerId(socket.id ?? null);
    socket.on("connect", () => setPlayerId(socket.id ?? null));

    socket
      .on("board", (d) => {
        setGameData(d);
        setDrawnCard(d.drawnCard);
      })
      .on("drawn-card", (c: number) => setDrawnCard(c))
      .on("winner", (id: string) => setWinner(id))
      .on("game-error", (msg: string) => setError(msg));

    socket.emit("request-board");

    return () => {
      socket
        .off("connect")
        .off("board")
        .off("drawn-card")
        .off("winner")
        .off("game-error");
    };
  }, []);

  /* ───────── guards ───────── */
  if (error) return <div>Error: {error}</div>;
  if (!gameData || !playerId) return <div>Loading game...</div>;

  /* ids & helpers */
  const youId = playerId;
  const oppId = Object.keys(gameData.board).find((i) => i !== youId)!;

  const youName = gameData.usernames?.[youId] ?? "You";
  const oppName = gameData.usernames?.[oppId] ?? "Opponent";
  const yourTurn = gameData.currentActivePlayer === youId;

  /* smallest column length = current row (0‑4) */
  const currentRow = Math.min(
    ...(gameData.board[youId] as (number | null)[][]).map((col) => col.length)
  );

  /* ───────── render helpers ───────── */
  const visibleCard = (c: number | null, k: number) =>
    c === null ? (
      <div key={k} style={{ width: 40, height: 60 }} />
    ) : (
      <div
        key={k}
        style={{
          width: 40,
          height: 60,
          border: "1px solid #aaa",
          borderRadius: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: suitColor(cardMap[c].suit),
        }}
      >
        {cardMap[c].suit}
        {displayValue(cardMap[c].value)}
      </div>
    );

  const hiddenCard = (k: number) => (
    <img
      key={k}
      src="/card-back.png"
      alt="Hidden"
      style={{ width: 40, height: 60, borderRadius: 4 }}
    />
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
      nav("/");
    }, 200);
  };

  /* ───────── UI ───────── */
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
        <strong>Active:</strong>{" "}
        <span style={{ color: "red" }}>
          {gameData.usernames?.[gameData.currentActivePlayer] ??
            gameData.currentActivePlayer}
        </span>
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
        <h2 style={{ color: "green", marginTop: 16 }}>
          {winner === "draw"
            ? "Draw!"
            : `Winner: ${
                winner === youId
                  ? youName
                  : gameData.usernames?.[winner] ?? winner
              }`}
        </h2>
      )}

      {/* ─── Boards ─── */}
      <div style={{ marginTop: 32 }}>
        {/* Opponent */}
        <h3>{oppName}</h3>
        <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
          {(gameData.board[oppId] as (number | null)[][]).map((col, i) => (
            <div
              key={i}
              style={{
                minWidth: 60,
                padding: 5,
                border: "1px solid #ccc",
                borderRadius: 4,
              }}
            >
              {col.map((card, rowIdx) =>
                rowIdx === 4
                  ? hiddenCard(rowIdx) // hide 5‑th row
                  : visibleCard(card, rowIdx)
              )}
            </div>
          ))}
        </div>

        {/* You */}
        <h3 style={{ marginTop: 24 }}>{youName}</h3>
        <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
          {(gameData.board[youId] as (number | null)[][]).map((col, i) => (
            <div
              key={i}
              style={{
                minWidth: 60,
                padding: 5,
                border: "1px solid #ccc",
                borderRadius: 4,
              }}
            >
              {col.map((card, rowIdx) => visibleCard(card, rowIdx))}
              {/* place button enabled only if this column belongs to current row */}
              <button
                onClick={() => place(i)}
                disabled={
                  drawnCard === null ||
                  col.length >= 5 ||
                  !yourTurn ||
                  col.length !== currentRow
                }
                style={{ marginTop: 4 }}
              >
                Place
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* controls */}
      <div style={{ marginTop: 32 }}>
        <button onClick={draw} disabled={!yourTurn || drawnCard !== null}>
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
