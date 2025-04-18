import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import api from "../api";
import { loginSuccess } from "../store/authSlice";
import { connectSocket } from "../socket";

const Login = () => {
  const nav = useNavigate();
  const dispatch = useDispatch();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");

  const handle = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    console.log("🔑 submitting login…");
    try {
      const { data } = await api.post("/api/auth/login", form);
      dispatch(loginSuccess({ ...data.user, token: data.token }));
      connectSocket(data.user.id, data.token, data.user.username);
      nav("/"); // lobby
    } catch (e: any) {
      setErr(e.response?.data?.msg || "Error");
    }
  };

  return (
    <div style={{ maxWidth: 350, margin: "3rem auto" }}>
      <h2>Login</h2>
      <input name="email" placeholder="email" onChange={handle} />
      <input
        name="password"
        type="password"
        placeholder="password"
        onChange={handle}
        style={{ marginTop: 8 }}
      />
      <button onClick={submit} style={{ marginTop: 12 }}>
        Sign in
      </button>
      {err && <p style={{ color: "red" }}>{err}</p>}
      <Link to="/register">Need an account? Register</Link>
    </div>
  );
};
export default Login;
