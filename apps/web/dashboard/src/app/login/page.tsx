"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("token", data.access_token);

      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Admin Login</h2>
        <p style={styles.subtitle}>Sign in to access dashboard</p>

        {error && <div style={styles.error}>{error}</div>}

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          onFocus={(e) => (e.target.style.border = "1px solid #22c55e")}
          onBlur={(e) => (e.target.style.border = "1px solid #1e293b")}
        />

        {/* PASSWORD */}
        <div style={{ position: "relative" }}>
          <input
            type={show ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            onFocus={(e) => (e.target.style.border = "1px solid #22c55e")}
            onBlur={(e) => (e.target.style.border = "1px solid #1e293b")}
          />

          <span
            onClick={() => setShow(!show)}
            style={styles.eye}
          >
            {show ? "🙈" : "👁️"}
          </span>
        </div>

        {/* BUTTON */}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            ...styles.button,
            opacity: loading ? 0.6 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = loading ? "0.6" : "1")}
        >
          {loading ? "Loading..." : "Login"}
        </button>
      </div>
    </div>
  );
}

const styles: any = {
  container: {
    minHeight: "100vh",
    background: "#020617",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  card: {
    background: "#0f172a",
    padding: "40px",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "400px",
    boxShadow:
      "0 0 0 1px rgba(255,255,255,0.03), 0 10px 40px rgba(0,0,0,0.6)",
  },

  title: {
    color: "white",
    fontSize: "24px",
    marginBottom: "8px",
    textAlign: "center",
  },

  subtitle: {
    color: "#94a3b8",
    fontSize: "14px",
    marginBottom: "24px",
    textAlign: "center",
  },

  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "16px",
    borderRadius: "8px",
    border: "1px solid #1e293b",
    background: "#020617",
    color: "white",
    outline: "none",
    transition: "0.2s",
  },

  button: {
    width: "100%",
    padding: "12px",
    background: "#22c55e",
    color: "black",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    transition: "0.2s",
  },

  error: {
    background: "#7f1d1d",
    color: "#fecaca",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontSize: "14px",
  },

  eye: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    fontSize: "14px",
  },
};