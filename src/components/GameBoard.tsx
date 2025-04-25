import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
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
  const { id: myDbId } = useSelector((s: RootState) => s.auth);

  const [data, setData] = useState<any>(null);
  const [drawn, setDrawn] = useState<number | null>(null);
  const [winner, setWinner] = useState<Winner | null>(null);
  const [exitMsg, setExitMsg] = useState<string | null>(null);
  const [youId, setYouId] = useState<string | null>(null);
  const [moveDL, setMoveDL] = useState<number | null>(null);
  const [rematchDL, setRematchDL] = useState<number | null>(null);
  const [colRes, setColRes] = useState<Record<number, ColRes>>(emptyColRes());

  const navigate = useNavigate();
  const dispatch = useDispatch();

  /* force small re-render every 250 ms for countdowns */
  const [, force] = useState(0);
  useEffect(() => {
    const t = setInterval(() => force((x) => x + 1), 250);
    return () => clearInterval(t);
  }, []);

  /* sockets */
  useEffect(() => {
    /* identify ourselves */
    if (socket.connected) setYouId(socket.id ?? null);
    socket.on("connect", () => setYouId(socket.id ?? null));

    /* -------- tell server we’re on the board and ready -------- */
    socket.emit("player-ready");
    /* ---------------------------------------------------------- */

    socket
      .on("board", (d) => {
        setData(d);
        setDrawn(d.drawnCard);
        if (!d.gameOver) {
          setWinner(null);
          setExitMsg(null);
          setColRes(emptyColRes());
          setRematchDL(null);
        }
      })
      .on("drawn-card", setDrawn)
      .on("winner", (w: Winner) => setWinner(w))
      .on("player-exited", ({ message }) => setExitMsg(message))
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

  /* -------- derived values -------- */
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

  /* -------- handlers -------- */
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
      navigate("/");
    }, 200);
  };

  /* -------- render helpers -------- */
  const cardDiv = (c: number | null, k: React.Key) => {
    if (c === null) return <div key={k} className="card-box card-hidden" />;
    const m = cardMap[c];
    return (
      <div key={k} className="card-box" style={{ color: suitColor(m.suit) }}>
        {m.suit}
        {displayValue(m.value)}
      </div>
    );
  };

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
          : "…"
        : showNames
        ? res.handOpp ?? "?"
        : "…";

    return (
      <div
        key={ci}
        className={`column-box flex flex-col items-center ${winBorder}`}
      >
        {col.map((card, ri) => cardDiv(card, ri))}
        {who === "you" && (
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
        <div className="text-xs mt-1">{handText}</div>
      </div>
    );
  };

  const banner = () => {
    if (!winner) return null;
    if (winner.result === "draw")
      return <p className="text-xl font-bold">It&rsquo;s a draw!</p>;

    const delta = winner.delta ?? 2;
    return (
      <>
        <p className="text-green-600 text-2xl font-bold">
          Winner {winner.winner.name} +{delta} points
        </p>
        <p className="text-red-600 text-xl font-bold">
          Lost {winner.loser.name} &minus;{delta} points
        </p>
      </>
    );
  };

  /* -------- UI -------- */
  return (
    <div className="game-container flex flex-col h-full justify-between p-4">
      {/* opponent board */}
      <div className="opponent-board mb-6">
        <h3 className="text-center mb-2">{oppName}</h3>
        <div className="board-grid grid grid-cols-5 gap-2 justify-center">
          {colsOpp.map((col, ci) => colBox(col, ci, "opp"))}
        </div>
      </div>

      {/* drawn card & turn timer */}
      <div className="center-control flex items-center justify-center space-x-4 my-6">
        {drawn !== null ? cardDiv(drawn, "drawn") : cardDiv(null, "blank")}
        <div className="text-xl font-bold">{secsLeft > 0 ? secsLeft : ""}</div>
      </div>

      {/* your board */}
      <div className="player-board mt-6">
        <h3 className="text-center mb-2">{youName}</h3>
        <div className="board-grid grid grid-cols-5 gap-2 justify-center">
          {colsYou.map((col, ci) => colBox(col, ci, "you"))}
        </div>
      </div>

      {/* exit button */}
      <div className="flex justify-center mt-6">
        <button className="btn btn-danger" onClick={exit}>
          ❌ Exit
        </button>
      </div>

      {/* winner / rematch banner */}
      {winner && (
        <div className="result-banner text-center mt-6">
          {banner()}
          {secsRematch > 0 && (
            <p className="text-sm mt-2">Rematch starts in {secsRematch} s…</p>
          )}
        </div>
      )}

      {exitMsg && (
        <p className="text-center text-red-600 text-lg mt-4">{exitMsg}</p>
      )}
    </div>
  );
};

export default GameBoard;
