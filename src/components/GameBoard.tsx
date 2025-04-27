import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { updateCredits } from "../store/authSlice";
import { socket } from "../socket";
import { cardMap, displayValue } from "../utils/cards";

const suitColor = (s: string) => (s === "♥" || s === "♦" ? "red" : "black");

type Winner =
  | { result: "draw"; delta: 0 }
  | {
      result: "win";
      delta: number;
      winner: { id: number; name: string };
      loser: { id: number; name: string };
    };

type ColRes = {
  handYou: string | null;
  handOpp: string | null;
  youWin: boolean | null;
};

const emptyColRes = (): Record<number, ColRes> => ({
  0: { handYou: null, handOpp: null, youWin: null },
  1: { handYou: null, handOpp: null, youWin: null },
  2: { handYou: null, handOpp: null, youWin: null },
  3: { handYou: null, handOpp: null, youWin: null },
  4: { handYou: null, handOpp: null, youWin: null },
});

const GameBoard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [drawn, setDrawn] = useState<number | null>(null);
  const [winner, setWinner] = useState<Winner | null>(null);
  const [youId, setYouId] = useState<string | null>(null);
  const [moveDL, setMoveDL] = useState<number | null>(null);
  const [rematchDL, setRematchDL] = useState<number | null>(null);
  const [colRes, setColRes] = useState<Record<number, ColRes>>(emptyColRes());

  const nav = useNavigate();
  const dispatch = useDispatch();

  /*----------- render tick -----------*/
  const [, force] = useState(0);
  useEffect(() => {
    const t = setInterval(() => force((x) => x + 1), 250);
    return () => clearInterval(t);
  }, []);

  /*----------- sockets -----------*/
  useEffect(() => {
    if (socket.connected) setYouId(socket.id ?? null);
    socket.on("connect", () => setYouId(socket.id ?? null));

    socket.emit("player-ready");

    socket
      .on("board", (d) => {
        setData(d);
        setDrawn(d.drawnCard);
        /* reset column names ONLY when a **new round** starts */
        if (!d.gameOver) {
          setWinner(null);
          setColRes(emptyColRes());
          setRematchDL(null);
        }
      })
      .on("drawn-card", setDrawn)
      .on("winner", (w: Winner) => setWinner(w))
      .on("turn-start", ({ deadline }) => setMoveDL(deadline))
      .on("credits-sync", ({ newCredits }) =>
        dispatch(updateCredits(newCredits))
      )
      .on(
        "column-result",
        ({
          column,
          p1,
          p2,
          winnerId,
        }: {
          column: number;
          p1: { id: string; hand: string };
          p2: { id: string; hand: string };
          winnerId: string | "draw";
        }) => {
          setColRes((prev) => {
            const youHand = p1.id === youId ? p1.hand : p2.hand;
            const oppHand = p1.id === youId ? p2.hand : p1.hand;
            const youWin =
              winnerId === "draw" ? null : winnerId === youId ? true : false;
            return {
              ...prev,
              [column]: { handYou: youHand, handOpp: oppHand, youWin },
            };
          });
        }
      )
      .on("rematch-countdown", ({ deadline }) => setRematchDL(deadline));

    socket.emit("request-board");
    return () => {
      socket.offAny();
    };
  }, [dispatch, youId]);

  if (!data || !youId) return <div>Loading…</div>;

  /*----------- derived ----------*/
  const oppId = Object.keys(data.board).find((i) => i !== youId)!;
  const youName = data.usernames?.[youId] ?? "You";
  const oppName = data.usernames?.[oppId] ?? "Opponent";
  const yourTurn = data.currentActivePlayer === youId;

  const secsLeft =
    moveDL && moveDL > Date.now() ? Math.ceil((moveDL - Date.now()) / 1000) : 0;
  const secsRematch =
    rematchDL && rematchDL > Date.now()
      ? Math.ceil((rematchDL - Date.now()) / 1000)
      : 0;

  const colsOpp = data.board[oppId] as (number | null)[][];
  const colsYou = data.board[youId] as (number | null)[][];
  const rowNeeded = Math.min(
    ...colsYou.map((c) => c.filter((x) => x !== null).length)
  );

  /*----------- event handlers -----------*/
  const draw = () => socket.emit("draw-card");
  const place = (col: number) => {
    if (drawn === null) return;
    socket.emit("place-card", { position: col });
    setDrawn(null);
  };
  const exit = () => {
    if (!window.confirm("Exit game?")) return;
    socket.emit("exit-game");
    setTimeout(() => {
      socket.disconnect();
      nav("/");
    }, 200);
  };

  /*----------- helper renders -----------*/
  const cardDiv = (c: number | null, k: React.Key) =>
    c === null ? (
      <div key={k} className="card-box card-hidden" />
    ) : (
      <div
        key={k}
        className="card-box"
        style={{ color: suitColor(cardMap[c].suit) }}
      >
        {cardMap[c].suit}
        {displayValue(cardMap[c].value)}
      </div>
    );

  const colBox = (col: (number | null)[], ci: number, who: "you" | "opp") => {
    const res = colRes[ci];
    const showNames = !!winner;
    const winBorder =
      showNames &&
      res.youWin !== null &&
      ((who === "you" && res.youWin) || (who === "opp" && !res.youWin))
        ? "border-2 border-green-400"
        : "";

    const handText =
      who === "you"
        ? showNames
          ? res.handYou ?? "?"
          : ""
        : showNames
        ? res.handOpp ?? "?"
        : "";

    return (
      <div
        key={ci}
        className={`column-box flex flex-col items-center ${winBorder}`}
      >
        {col.map((card, ri) => cardDiv(card, ri))}
        {who === "you" && !winner && (
          <button
            className="btn btn-sm mt-1"
            onClick={() => place(ci)}
            disabled={
              drawn === null ||
              !yourTurn ||
              col.filter((c) => c !== null).length !== rowNeeded
            }
          >
            Place
          </button>
        )}
        {showNames && <div className="text-xs mt-1">{handText}</div>}
      </div>
    );
  };

  /*----------- central banner -----------*/
  const banner = winner ? (
    winner.result === "draw" ? (
      <p className="text-xl font-bold">It&rsquo;s a draw!</p>
    ) : (
      <>
        <p className="text-green-600 text-2xl font-bold">
          Winner {winner.winner.name} +{winner.delta} points
        </p>
        <p className="text-red-600 text-xl font-bold">
          Lost {winner.loser.name} &minus;{winner.delta} points
        </p>
      </>
    )
  ) : null;

  /*===========  JSX  ===========*/
  return (
    <div className="relative game-container flex flex-col h-full justify-between p-4">
      {/* Opponent board */}
      <div className="opponent-board mb-6">
        <h3 className="text-center mb-2">{oppName}</h3>
        <div className="board-grid grid grid-cols-5 gap-2 justify-center">
          {colsOpp.map((col, ci) => colBox(col, ci, "opp"))}
        </div>
      </div>

      {/* Drawn card & turn timer (hidden once game ends) */}
      {!winner && (
        <div className="center-control flex items-center justify-center space-x-4 my-6">
          {drawn !== null ? cardDiv(drawn, "drawn") : cardDiv(null, "blank")}
          <div className="text-xl font-bold">
            {secsLeft > 0 ? secsLeft : ""}
          </div>
        </div>
      )}

      {/* Your board */}
      <div className="player-board mt-6">
        <h3 className="text-center mb-2">{youName}</h3>
        <div className="board-grid grid grid-cols-5 gap-2 justify-center">
          {colsYou.map((col, ci) => colBox(col, ci, "you"))}
        </div>
      </div>

      {/* Controls (hidden after game) */}
      {!winner && (
        <div className="game-controls flex justify-center space-x-4 mt-6">
          <button className="btn btn-danger" onClick={exit}>
            ❌ Exit
          </button>
        </div>
      )}

      {/* Central overlay banner at game end */}
      {winner && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-center">
          {banner}
          {secsRematch > 0 && (
            <p className="text-sm mt-2 text-white">
              Rematch starts in {secsRematch} s…
            </p>
          )}
          <button className="btn mt-4" onClick={exit}>
            Back to Lobby
          </button>
        </div>
      )}
    </div>
  );
};

export default GameBoard;
