import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

const Register = () => {
  const nav = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [err, setErr] = useState("");

  const handle = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    try {
      await api.post("/api/auth/register", form);
      alert("Check your e‑mail and verify your account, then login.");
      nav("/login");
    } catch (e: any) {
      setErr(e.response?.data?.msg || "Error");
    }
  };

  return (
    <div className="auth-wrapper">
      <h2>Register</h2>

      {["username", "email", "password"].map((f) => (
        <input
          key={f}
          name={f}
          placeholder={f}
          type={f === "password" ? "password" : "text"}
          onChange={handle}
        />
      ))}

      <button className="btn" onClick={submit}>
        Create account
      </button>

      {err && <p className="auth-error">{err}</p>}

      <Link to="/login">Already have an account? Login</Link>
    </div>
  );
};

export default Register;
