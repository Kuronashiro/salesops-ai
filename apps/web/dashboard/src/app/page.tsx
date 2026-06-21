'use client';
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useState } from 'react';
import { jwtDecode } from "jwt-decode";
import { getUserFromToken } from "../lib/auth";
import Navbar from "../components/Navbar";
import type { CSSProperties } from 'react';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7'];

function getActivityLabel(endpoint: string) {
  if (endpoint.includes("/transactions")) {
    return "Viewed Transactions";
  }

  if (endpoint.includes("/analytics")) {
    return "Viewed Analytics";
  }

  if (endpoint.includes("/audit")) {
    return "Viewed Audit Logs";
  }

  if (endpoint.includes("/auth/login")) {
    return "User Login";
  }

  return endpoint;
}

export default function Home() {
  const router = useRouter();
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  const [user, setUser] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [hidden, setHidden] = useState<string[]>([]);

  const [mode, setMode] = useState<"revenue" | "price" | "quantity">("price");
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');

  const [tempStart, setTempStart] = useState(startDate);
  const [tempEnd, setTempEnd] = useState(endDate);
  const [showPicker, setShowPicker] = useState(false);

// semua hooks dulu
useEffect(() => {
  fetch("http://localhost:3001/analytics/summary")
    .then((res) => res.json())
    .then(setSummary);

  fetch("http://localhost:3001/audit/recent")
    .then((res) => res.json())
    .then(setRecentLogs);
}, []);

useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) {
    router.push("/login");
    return;
  }

  const u = getUserFromToken();

  if (!u) {
    router.push("/login");
    return;
  }

  setUser(u);
}, []);

useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) {
    router.push("/login");
  }
}, []);

useEffect(() => {
  if (!user) return;

  // contoh: hanya admin boleh akses dashboard ini
  if (user.role !== "admin") {
    router.push("/not-authorized");
  }
}, [user]);

  // 🔽 baru useEffect lain
  useEffect(() => {
    const saved = localStorage.getItem("theme") as any;
    if (saved) setTheme(saved);
  }, []);

  /* ================= THEME ================= */
  useEffect(() => {
    const saved = localStorage.getItem('theme') as any;
    if (saved) setTheme(saved);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
  };

  const isDark = theme === 'dark';

  /* ================= FETCH ================= */
  useEffect(() => {
  const fetchData = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    const [s, c, p] = await Promise.all([
      fetch("http://localhost:3001/analytics/summary", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch("http://localhost:3001/analytics/sales-by-month", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch("http://localhost:3001/analytics/top-products", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    if (s.status === 401 || c.status === 401 || p.status === 401) {
      localStorage.removeItem("token");
      router.push("/login");
      return;
    }

    setSummary(await s.json());
    const chartRes = await c.json();

// normalize jadi array
const safeChart = Array.isArray(chartRes)
  ? chartRes
  : chartRes.data
  ? chartRes.data
  : Object.entries(chartRes).map(([month, revenue]) => ({
      month,
      revenue,
    }));

setChartData(safeChart);
    setPieData(await p.json());
  };

  fetchData();
}, [startDate, endDate, mode]);

if (!user) {
  return <div>Loading...</div>;
}
  if (!summary) return <Loading />;

const limitedPie = Array.isArray(pieData) ? pieData.slice(0, 5) : [];
const filteredPie = limitedPie.filter(p => !hidden.includes(p.name));
  const totalPie = filteredPie.reduce((sum, p) => sum + p.value, 0);

  const toggleProduct = (name: string) => {
    setHidden(prev =>
      prev.includes(name)
        ? prev.filter(p => p !== name)
        : [...prev, name]
    );
  };

  const safeChart = Array.isArray(chartData) ? chartData : [];

const maxRevenue = Math.max(
  ...safeChart.map(d => d.revenue || 0),
  0
);
  const roundedMax = Math.ceil(maxRevenue / 5000000) * 5000000;

  return (
    <div
      style={{
        ...layout,
        background: isDark ? '#020617' : '#f1f5f9',
        color: isDark ? 'white' : '#020617',
      }}
    >
      
      <Navbar user={user} isDark={isDark} />

      {/* MAIN */}
      <main style={main}>
        {/* HEADER */}
        <div style={header}>
          <div>
            <h1 style={title}>Sales Dashboard</h1>
            <p style={subtitle}>
              Monitor revenue and performance insights
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button style={btn} onClick={toggleTheme}>
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>

            <DateBox label="Start Date" value={startDate} onClick={()=>setShowPicker(true)} />
            <DateBox label="End Date" value={endDate} onClick={()=>setShowPicker(true)} />
          </div>
        </div>

        {/* KPI */}
        <div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 16,
    marginBottom: 24,
  }}
>
  <Card
  title="Revenue"
  value={summary.totalRevenue}
  isDark={isDark}
/>

<Card
  title="Transactions"
  value={summary.totalTransactions}
  isDark={isDark}
/>

<Card
  title="Top Product"
  value={summary.topProduct}
  isDark={isDark}
/>

<div
  style={{
    background: "#2563eb",
    borderRadius: 16,
    padding: 20,
    color: "white",
  }}
>
  <div
    style={{
      fontSize: 13,
      opacity: 0.8,
      marginBottom: 10,
    }}
  >
    Audit Logs
  </div>

  <div
    style={{
      fontSize: 28,
      fontWeight: 700,
    }}
  >
    {summary.auditLogs}
  </div>
</div>
</div>

        {/* LINE */}
        <h2 style={section}>Sales Overview</h2>

        <div
  style={chartBox(isDark)}
  onMouseEnter={(e)=>{
    e.currentTarget.style.boxShadow = isDark
      ? '0 0 30px rgba(34,197,94,0.15)'
      : '0 10px 40px rgba(0,0,0,0.08)';
  }}
  onMouseLeave={(e)=>{
    e.currentTarget.style.boxShadow='none';
  }}
>
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <defs>
                <linearGradient id="colorLine" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0.2} />
                </linearGradient>

                <filter id="glow">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <CartesianGrid stroke="#1f2937" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis
                domain={[0, roundedMax]}
                stroke="#9ca3af"
                tickFormatter={(v) =>
                  v === 0 ? 'Rp 0' : 'Rp ' + v / 1000000 + 'jt'
                }
              />

              <Tooltip
  formatter={(value) => formatRupiah(Number(value ?? 0))}
  contentStyle={{
    background: isDark ? '#020617' : '#ffffff',
    border: isDark ? '1px solid #1f2937' : '1px solid #e5e7eb',
    borderRadius: 10,
    color: isDark ? '#fff' : '#000'
  }}
  labelStyle={{
    color: isDark ? '#9ca3af' : '#64748b'
  }}
/>

              <Line
                dataKey="revenue"
                stroke="url(#colorLine)"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 7 }}
                style={{ filter:'url(#glow)' }}
                animationDuration={1200}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* DONUT */}
        <h2 style={section}>Top Products</h2>
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
  {["revenue", "price", "quantity"].map((m) => (
    <button
      key={m}
      onClick={() => setMode(m as any)}
      style={{
        padding: "6px 12px",
        borderRadius: 8,
        background: mode === m ? "#22c55e" : "#1f2937",
        color: "white",
        border: "none",
        cursor: "pointer",
      }}
    >
      {m}
    </button>
  ))}
</div>

        <div
  style={pieBox(isDark)}
  onMouseEnter={(e)=>{
    e.currentTarget.style.boxShadow = isDark
      ? '0 0 30px rgba(59,130,246,0.15)'
      : '0 10px 40px rgba(0,0,0,0.08)';
  }}
  onMouseLeave={(e)=>{
    e.currentTarget.style.boxShadow='none';
  }}
>
          <div style={{ display:'flex', justifyContent:'center', gap:60 }}>

            <PieChart width={360} height={260}>
              <Pie
                data={filteredPie}
                dataKey="value"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                isAnimationActive
                animationDuration={1200}
              >
                {filteredPie.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>

              {/* CENTER TOTAL FIXED */}
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                <tspan
  dy="-8"
  fill={isDark ? '#9ca3af' : '#64748b'}
  fontSize="12"
>
  {
    mode === "price"
      ? "Top 5 Most Expensive"
      : mode === "quantity"
      ? "Top 5 Most Sold"
      : "Top 5 Revenue"
  }
</tspan>

<tspan
  dy="18"
  x="50%"
  fontSize="16"
  fontWeight="600"
  fill={isDark ? '#ffffff' : '#0f172a'}
>
  {
    mode === "quantity"
      ? `${totalPie} trx`
      : formatRupiah(totalPie)
  }
</tspan>
              </text>

             <Tooltip
  formatter={(value) => [
  formatRupiah(Number(value ?? 0)),
  "Revenue"
]}
/>
            </PieChart>

            {/* LEGEND */}
            <div style={{
  display:'flex',
  flexDirection:'column',
  gap:12,
  justifyContent:'center'
}}>
  {limitedPie.map((p, i) => (
    <div
      key={i}
      onClick={() => toggleProduct(p.name)}
      style={{
        display:'flex',
        alignItems:'center', // 🔥 FIX ALIGN
        gap:10,
        cursor:'pointer',
        opacity: hidden.includes(p.name) ? 0.4 : 1
      }}
    >
      <div
        style={{
          width:12,
          height:12,
          background: COLORS[i],
          borderRadius:4,
          flexShrink:0 // 🔥 FIX biar gak geser
        }}
      />

      <span
       style={{
    color: isDark ? '#e5e7eb' : '#020617',
    fontSize:14,
    display:'flex',
    alignItems:'center'
  }}
      >
        {p.name}
      </span>
    </div>
  ))}
</div>

          </div>
        </div>
        <div
  style={{
    marginTop: 24,
    background: isDark ? "#0f172a" : "#ffffff",
    border: "1px solid #334155",
    borderRadius: 12,
    padding: 20,
  }}
>
  <h2
    style={{
      fontSize: 18,
      fontWeight: 600,
      marginBottom: 16,
    }}
  >
    Recent Activities
  </h2>

  {recentLogs.map((log) => (
  <div
    key={log.id}
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "14px 0",
      borderBottom: "1px solid #1e293b",
    }}
  >
    <div>
      <div
        style={{
          fontWeight: 600,
          marginBottom: 4,
        }}
      >
        {getActivityLabel(log.endpoint)}
      </div>

      <div
        style={{
          fontSize: 12,
          opacity: 0.6,
        }}
      >
        User #{log.userId}
      </div>
    </div>

    <div
      style={{
        fontSize: 12,
        opacity: 0.7,
      }}
    >
      {new Date(log.createdAt).toLocaleString("id-ID")}
    </div>
  </div>
))}

</div>
      </main>

      {/* MODAL */}
      {showPicker && (
        <div style={overlay}>
          <div style={modal}>
            <h3>Select Date Range</h3>

            <input type="date" value={tempStart} onChange={(e)=>setTempStart(e.target.value)} style={input}/>
            <input type="date" value={tempEnd} onChange={(e)=>setTempEnd(e.target.value)} style={input}/>

            <div style={{ marginTop:20, display:'flex', gap:10 }}>
              <button style={btn} onClick={()=>{
                setStartDate(tempStart);
                setEndDate(tempEnd);
                setShowPicker(false);
              }}>Apply</button>

              <button style={btnCancel} onClick={()=>setShowPicker(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* 🔥 COUNT UP */
function useCountUp(target:number){
  const [val,setVal]=useState(0);

  useEffect(()=>{
    let start=0;
    const step=target/30;

    const timer=setInterval(()=>{
      start+=step;
      if(start>=target){
        setVal(target);
        clearInterval(timer);
      } else setVal(Math.floor(start));
    },20);

    return()=>clearInterval(timer);
  },[target]);

  return val;
}

function Card({
  title,
  value,
  isDark,
}: {
  title: string;
  value: any;
  isDark: boolean;
}) {
  const displayValue =
    typeof value === "number" && title === "Revenue"
      ? `Rp ${value.toLocaleString("id-ID")}`
      : value;

  return (
    <div
      style={{
        background: isDark ? "#0f172a" : "#ffffff",
        border: `1px solid ${
          isDark ? "#1e293b" : "#e2e8f0"
        }`,
        borderRadius: 16,
        padding: 20,
        transition: "0.2s",
        boxShadow: isDark
          ? "0 0 0 rgba(0,0,0,0)"
          : "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          fontSize: 13,
          opacity: 0.7,
          marginBottom: 10,
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: 28,
          fontWeight: 700,
        }}
      >
        {displayValue}
      </div>
    </div>
  );
}

function DateBox({ label, value, onClick, isDark }: any) {
  return (
    <div style={dateBox}>
      <span style={dateLabel}>{label}</span>
      <div style={dateDisplay(isDark)} onClick={onClick}>
        {formatDate(value)}
      </div>
    </div>
  );
}

function Loading(){
  return <div style={{padding:40}}>Loading...</div>;
}

/* UTIL */
function formatRupiah(v:number){
  return 'Rp '+v.toLocaleString('id-ID');
}

function formatDate(d:string){
  return new Date(d).toLocaleDateString('id-ID');
}

/* STYLE */
const layout = { display: 'flex', minHeight: '100vh' };
const sidebar = { width: 200, padding: 20 };
const logo = { fontSize: 18, marginBottom: 20 };
const menu = { color: '#9ca3af' };
const menuActive={color:'#22c55e'};

const main={flex:1,padding:30};

const header={display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:30};
const title={fontSize:24,fontWeight:600};
const subtitle={color:'#9ca3af',fontSize:13};

const dateBox: CSSProperties ={display:'flex',flexDirection:'column'};
const dateLabel={fontSize:11,color:'#9ca3af',marginBottom:4};

const dateDisplay = (isDark:boolean)=>({
  background: isDark ? '#111827' : '#ffffff',
  border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
  color: isDark ? '#ffffff' : '#020617', // 🔥 FIX TEXT
  padding:'10px 14px',
  borderRadius:10,
  cursor:'pointer'
});

const cardRow={display:'flex',gap:20};
const card = (isDark:boolean)=>({
  background: isDark ? '#111827' : '#ffffff',
  padding:20,
  borderRadius:14,
  width:220,
  border: isDark ? 'none' : '1px solid #e5e7eb',

  transition:'all 0.3s ease', // 🔥 smooth
});

const section={marginTop:40,marginBottom:10};

const chartBox=(isDark:boolean)=>({
  background:isDark?'#111827':'#ffffff',
  padding:20,
  borderRadius:14,
  height:300,

  transition:'all 0.3s ease'
});
const pieBox = (isDark:boolean)=>({
  background: isDark ? '#111827' : '#ffffff',
  padding:20,
  borderRadius:14,
  transition:'all 0.3s ease'
});


const overlay: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,.6)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};
const modal={background:'#020617',padding:30,borderRadius:16,width:320};
const input={width:'100%',marginTop:8,marginBottom:10,padding:10,borderRadius:8,border:'1px solid #1f2937',background:'#111827',color:'white'};
const btn={background:'#22c55e',padding:'8px 12px',borderRadius:8,cursor:'pointer'};
const btnCancel={background:'#374151',padding:'8px 12px',borderRadius:8,cursor:'pointer'};