"use client";

import { useRouter } from "next/navigation";

export default function Navbar({ user, isDark }: any) {
  const router = useRouter();

  return (
    <aside
      style={{
        width: 200,
        padding: 20,
        background: isDark ? "#020617" : "#ffffff",   // ✅ sync theme
        color: isDark ? "white" : "#020617",
        borderRight: isDark
          ? "1px solid #1f2937"
          : "1px solid #e5e7eb",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div>
        <p style={{ fontSize: 12, opacity: 0.6 }}>
          Role:{" "}
          <span style={{ color: "#22c55e", fontWeight: "bold" }}>
            {user?.role}
          </span>
        </p>

        <h2 style={{ marginTop: 20 }}>Dashboard</h2>

<p
  style={{ color: "#22c55e", cursor: "pointer" }}
  onClick={() => router.push("/")}
>
  Overview
</p>

<p
  style={{ opacity: 0.7, cursor: "pointer" }}
  onClick={() => router.push("/transactions")}
>
  Transactions
</p>

<p
  style={{ opacity: 0.7, cursor: "pointer" }}
  onClick={() => router.push("/")}
>
  Analytics
</p>

<p
  style={{ opacity: 0.7, cursor: "pointer" }}
  onClick={() => router.push("/")}
>
  Reports
</p>

<p
  style={{
    opacity: 0.7,
    cursor: "pointer",
  }}
  onClick={() => router.push("/audit")}
>
  Audit Logs
</p>
      </div>

      <button
        onClick={() => {
          localStorage.removeItem("token");
          router.push("/login");
        }}
        style={{
          background: "#ef4444",
          padding: "10px",
          borderRadius: "8px",
          color: "white",
          border: "none",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        Logout
      </button>
    </aside>
  );
}