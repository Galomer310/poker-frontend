import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";
import { cardMap, displayValue } from "../utils/cards";

const suitColor = (s: string) => (s === "♥" || s === "♦" ? "red" : "black");

type WinnerPayload =
  | { result: "draw" }
  | {
      result: "win";
      winner: { id: number; name: string };
      loser: { id: number; name: string };
    };

const GameBoard: React.FC = () => {
  const [gameData, setGameData] = useState<any>(null);
  const [drawnCard, setDrawnCard] = useState<number | null>(null);
  const [winner, setWinner] = useState<WinnerPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [offerFrom, setOfferFrom] = useState<string | null>(null);
  const [deadline, setDeadline] = useState<number | null>(null); // NEW
  const nav = useNavigate();

  /* countdown ticker */
  const [, forceTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => deadline && forceTick((x) => x + 1), 250);
    return () => clearInterval(id);
  }, [deadline]);

  /* ───────── socket bootstrap ───────── */
  useEffect(() => {
    if (socket.connected) setPlayerId(socket.id ?? null);
    socket.on("connect", () => setPlayerId(socket.id ?? null));

    socket
      .on("board", (d) => {
        setGameData(d);
        setDrawnCard(d.drawnCard);
        if (!d.gameOver) setWinner(null); // banner clears on new game
      })
      .on("drawn-card", (c: number) => setDrawnCard(c))
      .on("winner", (payload: WinnerPayload) => setWinner(payload))
      .on("game-error", (msg: string) => setError(msg))
      .on("restart-offer", ({ from }) => setOfferFrom(from))
      .on("restart-declined", () => {
        alert("Opponent declined rematch – returning to lobby.");
        exit();
      })
      .on("turn-start", ({ deadline }: { deadline: number }) => {
        setDeadline(deadline);
      });

    socket.emit("request-board");
    return () => {
      socket.removeAllListeners();
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

  /* current row rule */
  const currentRow = Math.min(
    ...(gameData.board[youId] as (number | null)[][]).map(
      (c: (number | null)[]) => c.length
    )
  );

  /* secs left */
  const secsLeft =
    deadline && deadline > Date.now()
      ? Math.ceil((deadline - Date.now()) / 1000)
      : 0;

  /* ───────── render helpers ───────── */
  const visibleCard = (c: number | null, k: number) =>
    c === null ? (
      <div
        key={k}
        style={{
          width: 40,
          height: 60,
          border: "1px solid #aaa",
          margin: "2px 0",
        }}
      />
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
          margin: "2px 0",
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
      style={{ width: 40, height: 60, borderRadius: 4, margin: "2px 0" }}
    />
  );

  /* ───────── actions ───────── */
  const draw = () => socket.emit("draw-card");
  const place = (col: number) => {
    if (drawnCard === null) return;
    socket.emit("place-card", { column: col });
    setDrawnCard(null);
  };
  const restart = () => socket.emit("restart-request");
  const respond = (ans: boolean) => {
    setOfferFrom(null);
    socket.emit("restart-response", ans);
  };
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
        {secsLeft > 0 && (
          <span style={{ marginLeft: 8, fontWeight: 600 }}>({secsLeft})</span>
        )}
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
        <div style={{ marginTop: 16, lineHeight: 1.4 }}>
          {winner.result === "draw" ? (
            <h2 style={{ color: "green" }}>Draw!</h2>
          ) : (
            <>
              <h2 style={{ color: "green" }}>
                {winner.winner.name} wins (+2 points)
              </h2>
              <h3 style={{ color: "crimson" }}>
                {winner.loser.name} loses (−2 points)
              </h3>
            </>
          )}
        </div>
      )}

      {/* boards */}
      <div style={{ marginTop: 32 }}>
        <h3>{oppName}</h3>
        <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
          {(gameData.board[oppId] as (number | null)[][]).map((col, ci) => (
            <div
              key={ci}
              style={{
                minWidth: 60,
                padding: 5,
                border: "1px solid #ccc",
                borderRadius: 4,
              }}
            >
              {col.map((card, ri) =>
                ri === 4 ? hiddenCard(ri) : visibleCard(card, ri)
              )}
            </div>
          ))}
        </div>

        <h3 style={{ marginTop: 24 }}>{youName}</h3>
        <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
          {(gameData.board[youId] as (number | null)[][]).map((col, ci) => (
            <div
              key={ci}
              style={{
                minWidth: 60,
                padding: 5,
                border: "1px solid #ccc",
                borderRadius: 4,
              }}
            >
              {col.map((card, ri) => visibleCard(card, ri))}
              <button
                onClick={() => place(ci)}
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

        {offerFrom ? (
          <>
            <span style={{ marginLeft: 16 }}>{offerFrom} wants a rematch:</span>
            <button onClick={() => respond(true)} style={{ marginLeft: 8 }}>
              Yes
            </button>
            <button onClick={() => respond(false)} style={{ marginLeft: 8 }}>
              No
            </button>
          </>
        ) : (
          <button
            onClick={restart}
            disabled={!winner}
            style={{ marginLeft: 16 }}
          >
            🔁 Rematch?
          </button>
        )}

        <button onClick={exit} style={{ marginLeft: 16, color: "red" }}>
          ❌ Exit
        </button>
      </div>
    </div>
  );
};

export default GameBoard;
