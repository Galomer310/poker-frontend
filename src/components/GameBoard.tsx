import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";
import { cardMap, displayValue } from "../utils/cards";

/* helper: red for hearts / diamonds */
const suitColor = (s: string) => (s === "♥" || s === "♦" ? "red" : "black");

/* winner payload the server emits */
type WinnerPayload =
  | { result: "draw" }
  | {
      result: "win";
      winner: { id: number; name: string };
      loser: { id: number; name: string };
    };

const GameBoard: React.FC = () => {
  /* ---------- local state ---------- */
  const [gameData, setGameData] = useState<any>(null);
  const [drawnCard, setDrawnCard] = useState<number | null>(null);
  const [winner, setWinner] = useState<WinnerPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [offerFrom, setOfferFrom] = useState<string | null>(null);
  const [deadline, setDeadline] = useState<number | null>(null); // turn timer

  const nav = useNavigate();

  /* force re‑render every 250 ms to keep countdown smooth */
  const [, forceTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => deadline && forceTick((x) => x + 1), 250);
    return () => clearInterval(id);
  }, [deadline]);

  /* ---------- socket bootstrap ---------- */
  useEffect(() => {
    if (socket.connected) setPlayerId(socket.id ?? null);
    socket.on("connect", () => setPlayerId(socket.id ?? null));

    socket
      .on("board", (d) => {
        setGameData(d);
        setDrawnCard(d.drawnCard);
        if (!d.gameOver) setWinner(null); // clear banner on fresh game
      })
      .on("drawn-card", (c: number) => setDrawnCard(c))
      .on("winner", (payload: WinnerPayload) => setWinner(payload))
      .on("game-error", (msg: string) => setError(msg))
      .on("restart-offer", ({ from }) => setOfferFrom(from))
      .on("restart-declined", () => {
        alert("Opponent declined rematch – returning to lobby.");
        exitGame();
      })
      .on("turn-start", (d: { player: string; deadline: number }) =>
        setDeadline(d.deadline)
      );

    socket.emit("request-board");
    return () => {
      socket.removeAllListeners();
    };
  }, []);

  /* ---------- guards ---------- */
  if (error) return <div>Error: {error}</div>;
  if (!gameData || !playerId) return <div>Loading game...</div>;

  /* ---------- derived IDs & helpers ---------- */
  const yourId = playerId;
  const oppId = Object.keys(gameData.board).find((i) => i !== yourId)!;

  const youName = gameData.usernames?.[yourId] ?? "You";
  const oppName = gameData.usernames?.[oppId] ?? "Opponent";

  const yourTurn = gameData.currentActivePlayer === yourId;

  /* row restriction for “Place” button */
  const currentRow = Math.min(
    ...(gameData.board[yourId] as (number | null)[][]).map((c) => c.length)
  );

  /* countdown seconds */
  const secsLeft =
    deadline && deadline > Date.now()
      ? Math.ceil((deadline - Date.now()) / 1000)
      : 0;

  /* ---------- handlers ---------- */
  const draw = () => socket.emit("draw-card");
  const place = (col: number) => {
    if (drawnCard === null) return;
    socket.emit("place-card", { column: col });
    setDrawnCard(null);
  };
  const sendRestartRequest = () => socket.emit("restart-request");
  const respondRestart = (agree: boolean) => {
    socket.emit("restart-response", agree);
    setOfferFrom(null);
  };
  const exitGame = () => {
    socket.emit("exit-game");
    setTimeout(() => {
      socket.disconnect();
      nav("/");
    }, 200);
  };

  /* ---------- render helpers ---------- */
  /* visible card div */
  const cardDiv = (card: number | null, key: React.Key) =>
    card === null ? (
      <div key={key} className="card-box card-hidden" />
    ) : (
      <div
        key={key}
        className="card-box"
        style={{ color: suitColor(cardMap[card].suit) }}
      >
        {cardMap[card].suit}
        {displayValue(cardMap[card].value)}
      </div>
    );

  /* ---------- JSX ---------- */
  return (
    <div className="game-container">
      <h1 className="game-title">Game in Progress</h1>

      <p>
        <strong>Active:</strong>{" "}
        <span className="active-player">
          {gameData.usernames?.[gameData.currentActivePlayer] ??
            gameData.currentActivePlayer}
        </span>
        {secsLeft > 0 && <span className="countdown">({secsLeft})</span>}
      </p>

      <p style={{ marginTop: 10 }}>
        <strong>Drawn Card:</strong>{" "}
        {drawnCard !== null
          ? `${cardMap[drawnCard].suit}${displayValue(
              cardMap[drawnCard].value
            )}`
          : "None"}
      </p>

      {/*  winner  */}
      {winner && (
        <div className="winner-banner">
          {winner.result === "draw" ? (
            <h2>Draw!</h2>
          ) : (
            <>
              <h2>{winner.winner.name} wins (+2)</h2>
              <h3>{winner.loser.name} loses (−2)</h3>
            </>
          )}
        </div>
      )}

      {/*  boards  */}
      <div className="board-wrapper">
        {/* Opponent */}
        <h3 style={{ marginTop: 24 }}>{oppName}</h3>
        <div className="board-grid">
          {(gameData.board[oppId] as (number | null)[][]).map((col, ci) => (
            <div key={ci} className="column-box">
              {col.map((card, ri) =>
                ri === 4 ? cardDiv(null, ri) : cardDiv(card, ri)
              )}
            </div>
          ))}
        </div>

        {/* You */}
        <h3 style={{ marginTop: 24 }}>{youName}</h3>
        <div className="board-grid">
          {(gameData.board[yourId] as (number | null)[][]).map((col, ci) => (
            <div key={ci} className="column-box">
              {col.map((card, ri) => cardDiv(card, ri))}
              <button
                className="btn"
                onClick={() => place(ci)}
                disabled={
                  drawnCard === null ||
                  col.length >= 5 ||
                  !yourTurn ||
                  col.length !== currentRow
                }
              >
                Place
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* controls */}
      <div className="game-controls">
        <button
          className="btn"
          onClick={draw}
          disabled={!yourTurn || drawnCard !== null}
        >
          Draw
        </button>

        {offerFrom ? (
          <>
            <span style={{ marginLeft: 12 }}>{offerFrom} wants a rematch:</span>
            <button
              className="btn"
              onClick={() => respondRestart(true)}
              style={{ marginLeft: 6 }}
            >
              Yes
            </button>
            <button
              className="btn btn-danger"
              onClick={() => respondRestart(false)}
              style={{ marginLeft: 6 }}
            >
              No
            </button>
          </>
        ) : (
          <button
            className="btn"
            onClick={sendRestartRequest}
            disabled={!winner}
            style={{ marginLeft: 12 }}
          >
            🔁 Rematch
          </button>
        )}

        <button
          className="btn btn-danger"
          onClick={exitGame}
          style={{ marginLeft: 12 }}
        >
          ❌ Exit
        </button>
      </div>
    </div>
  );
};

export default GameBoard;
