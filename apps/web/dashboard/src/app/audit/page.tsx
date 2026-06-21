"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";

type AuditLog = {
  id: number;
  userId: number;
  action: string;
  endpoint: string;
  method: string;
  details: string;
  createdAt: string;
};

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/audit")
      .then((res) => res.json())
      .then((data) => {
        setLogs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const user = {
    role: "admin",
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: isDark ? "#020617" : "#f8fafc",
      }}
    >
      <Navbar user={user} isDark={isDark} />

      <main
        style={{
          flex: 1,
          padding: "30px",
          color: isDark ? "white" : "#0f172a",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "30px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "32px",
                fontWeight: "bold",
              }}
            >
              Audit Logs
            </h1>

            <p
              style={{
                opacity: 0.7,
                marginTop: 5,
              }}
            >
              System activity tracking
            </p>
          </div>

          <button
            onClick={() => setIsDark(!isDark)}
            style={{
              background: "#22c55e",
              color: "white",
              border: "none",
              borderRadius: "10px",
              padding: "10px 20px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {isDark ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        <div
          style={{
            background: isDark ? "#0f172a" : "white",
            borderRadius: "16px",
            overflow: "hidden",
            border: "1px solid #1e293b",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#1e293b",
                  color: "white",
                }}
              >
                <th style={th}>User</th>
                <th style={th}>Action</th>
                <th style={th}>Endpoint</th>
                <th style={th}>Method</th>
                <th style={th}>Details</th>
                <th style={th}>Date</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} style={loadingCell}>
                    Loading...
                  </td>
                </tr>
              )}

              {!loading &&
                logs.map((log) => (
                  <tr
                    key={log.id}
                    style={{
                      borderBottom: "1px solid #1e293b",
                    }}
                  >
                    <td style={td}>{log.userId}</td>
                    <td style={td}>{log.action}</td>
                    <td style={td}>{log.endpoint}</td>
                    <td style={td}>
                      <span
                        style={{
                          background:
                            log.method === "POST"
                              ? "#22c55e"
                              : "#3b82f6",
                          color: "white",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "12px",
                        }}
                      >
                        {log.method}
                      </span>
                    </td>
                    <td style={td}>{log.details}</td>
                    <td style={td}>
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

const th = {
  padding: "16px",
  textAlign: "left" as const,
};

const td = {
  padding: "16px",
};

const loadingCell = {
  padding: "20px",
  textAlign: "center" as const,
};