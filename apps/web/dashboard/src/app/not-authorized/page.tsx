"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function NotAuthorized() {
  const router = useRouter();

  // 🔥 AUTO REDIRECT (optional)
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.removeItem("token"); // penting
      router.push("/login");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  const handleLogin = () => {
    localStorage.removeItem("token"); // 🔥 WAJIB
    router.push("/login");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#020617",
        color: "white",
      }}
    >
      <div
        style={{
          textAlign: "center",
          background: "#0f172a",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          maxWidth: "400px",
          width: "100%",
        }}
      >
        <h1 style={{ fontSize: "28px", marginBottom: "10px" }}>
          🚫 Access Denied
        </h1>

        <p style={{ opacity: 0.7, marginBottom: "20px" }}>
          Kamu tidak punya akses ke halaman ini.
        </p>

        <p style={{ fontSize: "12px", opacity: 0.5 }}>
          Kamu akan diarahkan ke login dalam 3 detik...
        </p>

        <div style={{ marginTop: "20px" }}>
          <button
            onClick={handleLogin}
            style={{
              padding: "10px 16px",
              borderRadius: "8px",
              border: "none",
              background: "#22c55e",
              color: "black",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Ke Login Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}