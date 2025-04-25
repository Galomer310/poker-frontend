import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { socket } from "../socket";

/* shape broadcast from backend */
interface RoomInfo {
  id: string;
  name: string;
  ownerUserId: number;
  hasPassword: boolean;
  cost: number;
  occupants: number;
}

const GameRooms = () => {
  const nav = useNavigate();
  const { id: myDbId, username } = useSelector((s: RootState) => s.auth);

  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const [ownsRoom, setOwnsRoom] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: "",
    cost: 1,
    password: "",
    hasPwd: false,
  });

  /* ––––– socket listeners ––––– */
  useEffect(() => {
    socket.emit("request-rooms");

    socket.on("room-list", (list: RoomInfo[]) => {
      setRooms(list);
      setOwnsRoom(list.some((r) => r.ownerUserId === myDbId));
    });
    socket.on("room-created", () => setOwnsRoom(true));
    socket.on("start-game", () => nav("/game"));
    socket.on("room-error", (msg: string) => {
      alert(msg);
      nav("/rooms");
    });

    return () => {
      socket.offAny();
    };
  }, [myDbId, nav]);

  /* ––––– helpers ––––– */
  const createRoom = () => {
    socket.emit("create-room", {
      name: form.name || `${username}'s room`,
      cost: form.cost,
      password: form.hasPwd ? form.password : undefined,
    });
    setShowCreate(false);
  };

  const joinRoom = (room: RoomInfo) => {
    let pwd: string | null = null;
    if (room.hasPassword) pwd = prompt("Enter room password") ?? "";
    socket.emit("join-room", { roomId: room.id, password: pwd });
  };

  const cancelRoom = () => socket.emit("cancel-room");

  /* ––––– UI ––––– */
  return (
    <div className="lobby-wrapper">
      <h1 className="mb-4">Custom Rooms</h1>

      <button
        className="btn mb-4"
        onClick={() => setShowCreate(true)}
        disabled={ownsRoom}
      >
        ➕ Create Room
      </button>
      {ownsRoom && (
        <p className="text-sm text-gray-500 mb-4">
          You already created a room. Cancel it before creating another.
        </p>
      )}

      <table className="w-full text-left">
        <thead>
          <tr>
            <th>Name</th>
            <th>Cost</th>
            <th>Players</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rooms.length === 0 && (
            <tr>
              <td colSpan={4}>No rooms yet</td>
            </tr>
          )}
          {rooms.map((r) => (
            <tr key={r.id}>
              <td>{r.name}</td>
              <td>{r.cost}</td>
              <td>{r.occupants}/2</td>
              <td>
                {r.ownerUserId === myDbId && r.occupants === 1 ? (
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={cancelRoom}
                  >
                    Cancel
                  </button>
                ) : r.occupants < 2 ? (
                  <button className="btn btn-sm" onClick={() => joinRoom(r)}>
                    Join
                  </button>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* overlay */}
      {showCreate && (
        <div className="overlay">
          <div className="modal p-4 bg-white rounded shadow">
            <h2>Create Room</h2>
            <label>
              Name:
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label>
              Credit cost:
              <input
                type="number"
                min={1}
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: +e.target.value })}
              />
            </label>
            <label>
              <input
                type="checkbox"
                checked={form.hasPwd}
                onChange={(e) => setForm({ ...form, hasPwd: e.target.checked })}
              />
              Password protected
            </label>
            {form.hasPwd && (
              <input
                type="password"
                placeholder="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            )}

            <div className="mt-4 space-x-2">
              <button className="btn" onClick={createRoom}>
                Create
              </button>
              <button
                className="btn btn-danger"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameRooms;
