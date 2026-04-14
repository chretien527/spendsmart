import { useState, useEffect, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

// ─── Constants ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "food", label: "Food", emoji: "🍔", color: "#6C63FF" },
  { id: "transport", label: "Transport", emoji: "🚌", color: "#3B82F6" },
  { id: "airtime", label: "Airtime", emoji: "📱", color: "#8B5CF6" },
  { id: "rent", label: "Rent", emoji: "🏠", color: "#EC4899" },
  { id: "health", label: "Health", emoji: "💊", color: "#EF4444" },
  { id: "shopping", label: "Shopping", emoji: "🛍️", color: "#F59E0B" },
  { id: "other", label: "Other", emoji: "🎯", color: "#10B981" },
];

const PAYMENT_METHODS = ["Cash", "Mobile Money", "Bank Transfer", "Card"];

const CURRENCIES = ["RWF", "USD", "EUR", "KES", "UGX"];

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "⊞" },
  { id: "log", label: "Log Expense", icon: "+" },
  { id: "budgets", label: "Budgets", icon: "◎" },
  { id: "analytics", label: "Analytics", icon: "↗" },
];

const fmtAmount = (n, currency = "RWF") => `${currency} ${Number(n).toLocaleString()}`;

const today = () => new Date().toISOString().slice(0, 10);

const startOfDay = (d) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
const startOfWeek = () => { const d = new Date(); d.setDate(d.getDate() - d.getDay()); d.setHours(0,0,0,0); return d; };
const startOfMonth = () => { const d = new Date(); d.setDate(1); d.setHours(0,0,0,0); return d; };

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  app: { display: "flex", minHeight: "100vh", background: "#F4F4F8", fontFamily: "'DM Sans', system-ui, sans-serif", color: "#1a1a2e" },
  sidebar: { width: 200, background: "#12121f", display: "flex", flexDirection: "column", padding: "24px 0", position: "sticky", top: 0, height: "100vh", flexShrink: 0 },
  logo: { padding: "0 20px 28px", borderBottom: "1px solid #ffffff18" },
  logoIcon: { width: 36, height: 36, background: "linear-gradient(135deg, #6C63FF, #a78bfa)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 10 },
  logoName: { color: "#fff", fontWeight: 700, fontSize: 16, margin: 0 },
  logoSub: { color: "#ffffff66", fontSize: 11, margin: "2px 0 0" },
  navSection: { padding: "20px 12px 8px", color: "#ffffff44", fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" },
  navItem: (active) => ({ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", margin: "2px 8px", borderRadius: 10, cursor: "pointer", color: active ? "#fff" : "#ffffff88", background: active ? "#6C63FF" : "transparent", fontSize: 14, fontWeight: active ? 600 : 400, transition: "all 0.15s", userSelect: "none" }),
  navBottom: { marginTop: "auto", padding: "0 0 8px" },
  main: { flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" },
  topbar: { background: "#fff", padding: "0 32px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e8e8f0", position: "sticky", top: 0, zIndex: 10 },
  pageTitle: { margin: 0, fontSize: 18, fontWeight: 700, color: "#1a1a2e" },
  pageSubtitle: { fontSize: 12, color: "#9999b3", marginLeft: 8, fontWeight: 400 },
  topActions: { display: "flex", alignItems: "center", gap: 12 },
  searchBox: { display: "flex", alignItems: "center", gap: 8, background: "#f4f4f8", border: "1px solid #e0e0ee", borderRadius: 10, padding: "6px 14px", fontSize: 13, color: "#9999b3", cursor: "text", minWidth: 180 },
  avatar: { width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#6C63FF,#a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" },
  content: { flex: 1, padding: "28px 32px" },
  // Cards
  statGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 },
  statCard: (accent) => ({ background: accent || "#fff", borderRadius: 16, padding: "20px 22px", border: "1px solid #e8e8f0" }),
  statLabel: (light) => ({ fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: light ? "#ffffffaa" : "#9999b3", marginBottom: 8 }),
  statEmoji: { fontSize: 22, marginBottom: 6, display: "block" },
  statValue: (light) => ({ fontSize: 22, fontWeight: 700, color: light ? "#fff" : "#1a1a2e", margin: "4px 0" }),
  statSub: (light) => ({ fontSize: 12, color: light ? "#ffffffbb" : "#9999b3", margin: 0 }),
  // Panels
  panel: { background: "#fff", borderRadius: 16, border: "1px solid #e8e8f0", padding: "22px 24px" },
  panelTitle: { fontSize: 15, fontWeight: 700, margin: "0 0 16px", color: "#1a1a2e" },
  row: { display: "flex", gap: 20 },
  // Form
  label: { fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: "#9999b3", display: "block", marginBottom: 6 },
  input: { width: "100%", border: "1.5px solid #e0e0ee", borderRadius: 10, padding: "9px 13px", fontSize: 14, color: "#1a1a2e", background: "#fff", outline: "none", boxSizing: "border-box" },
  select: { width: "100%", border: "1.5px solid #e0e0ee", borderRadius: 10, padding: "9px 13px", fontSize: 14, color: "#1a1a2e", background: "#fff", outline: "none", boxSizing: "border-box" },
  btn: (variant = "primary") => ({
    background: variant === "primary" ? "linear-gradient(135deg,#6C63FF,#a78bfa)" : variant === "danger" ? "#fff" : "#fff",
    border: variant === "danger" ? "1.5px solid #EF4444" : "none",
    color: variant === "primary" ? "#fff" : variant === "danger" ? "#EF4444" : "#1a1a2e",
    borderRadius: 10, padding: "10px 20px", fontWeight: 600, fontSize: 14, cursor: "pointer", width: "100%"
  }),
  chip: (active) => ({ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 20, border: active ? "2px solid #6C63FF" : "1.5px solid #e0e0ee", background: active ? "#f0efff" : "#fff", cursor: "pointer", fontSize: 13, color: active ? "#6C63FF" : "#555", fontWeight: active ? 600 : 400, userSelect: "none" }),
  txRow: { display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: "1px solid #f0f0f8" },
  txIcon: (color) => ({ width: 38, height: 38, borderRadius: 12, background: color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }),
  badge: (color) => ({ background: color + "22", color, padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600 }),
  toggle: (on) => ({ width: 44, height: 24, borderRadius: 12, background: on ? "#6C63FF" : "#e0e0ee", position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }),
  toggleThumb: (on) => ({ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: on ? 23 : 3, transition: "left 0.2s" }),
  filterBtn: (active) => ({ padding: "5px 14px", borderRadius: 8, border: active ? "1.5px solid #6C63FF" : "1.5px solid #e0e0ee", background: active ? "#f0efff" : "#fff", color: active ? "#6C63FF" : "#555", fontSize: 13, fontWeight: active ? 600 : 400, cursor: "pointer" }),
  empty: { textAlign: "center", padding: "48px 0", color: "#9999b3" },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  progressBar: (pct, color) => ({ height: 8, borderRadius: 4, background: "#f0f0f8", overflow: "hidden", position: "relative", children: null }),
};

// ─── Hooks ────────────────────────────────────────────────────────────────────
function useStorage(key, initial) {
  const [val, setVal] = useState(() => {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : initial; } catch { return initial; }
  });
  const set = useCallback((v) => {
    setVal((prev) => {
      const next = typeof v === "function" ? v(prev) : v;
      try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [key]);
  return [val, set];
}

// ─── Components ───────────────────────────────────────────────────────────────
function ProgressBar({ pct, color }) {
  return (
    <div style={{ height: 8, borderRadius: 4, background: "#f0f0f8", overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, background: color || "#6C63FF", borderRadius: 4, transition: "width 0.4s" }} />
    </div>
  );
}

function Toggle({ on, onToggle }) {
  return (
    <div style={S.toggle(on)} onClick={onToggle}>
      <div style={S.toggleThumb(on)} />
    </div>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
function Dashboard({ expenses, budgets, currency, navigate }) {
  const todayStart = startOfDay(new Date());
  const weekStart = startOfWeek();
  const monthStart = startOfMonth();

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const todayTotal = expenses.filter(e => new Date(e.date) >= todayStart).reduce((s, e) => s + e.amount, 0);
  const weekTotal = expenses.filter(e => new Date(e.date) >= weekStart).reduce((s, e) => s + e.amount, 0);
  const monthTotal = expenses.filter(e => new Date(e.date) >= monthStart).reduce((s, e) => s + e.amount, 0);

  // Last 7 days chart data
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i)); d.setHours(0,0,0,0);
    const next = new Date(d); next.setDate(next.getDate() + 1);
    const amt = expenses.filter(e => { const ed = new Date(e.date); return ed >= d && ed < next; }).reduce((s, e) => s + e.amount, 0);
    return { day: d.toLocaleDateString("en", { weekday: "short" }), amount: amt };
  });

  // Category totals for pie
  const catTotals = CATEGORIES.map(c => ({ name: c.label, value: expenses.filter(e => e.category === c.id).reduce((s, e) => s + e.amount, 0), color: c.color })).filter(c => c.value > 0);

  // Budget status
  const budgetItems = CATEGORIES.filter(c => budgets[c.id] > 0).map(c => {
    const spent = expenses.filter(e => e.category === c.id && new Date(e.date) >= monthStart).reduce((s, e) => s + e.amount, 0);
    return { ...c, spent, budget: budgets[c.id], pct: budgets[c.id] ? (spent / budgets[c.id]) * 100 : 0 };
  });

  const recent = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  return (
    <div>
      <div style={S.statGrid}>
        <div style={S.statCard("linear-gradient(135deg,#6C63FF,#a78bfa)")}>
          <span style={S.statEmoji}>💸</span>
          <div style={S.statLabel(true)}>Total Spent</div>
          <div style={S.statValue(true)}>{fmtAmount(total, currency)}</div>
          <p style={S.statSub(true)}>{expenses.length} transactions</p>
        </div>
        <div style={S.statCard()}>
          <span style={S.statEmoji}>📅</span>
          <div style={S.statLabel()}>Today</div>
          <div style={S.statValue()}>{fmtAmount(todayTotal, currency)}</div>
          <p style={S.statSub()}>{expenses.filter(e => new Date(e.date) >= todayStart).length} entries</p>
        </div>
        <div style={S.statCard()}>
          <span style={S.statEmoji}>📆</span>
          <div style={S.statLabel()}>This Week</div>
          <div style={S.statValue()}>{fmtAmount(weekTotal, currency)}</div>
          <p style={S.statSub()}>{expenses.filter(e => new Date(e.date) >= weekStart).length} entries</p>
        </div>
        <div style={S.statCard()}>
          <span style={S.statEmoji}>🗓️</span>
          <div style={S.statLabel()}>This Month</div>
          <div style={S.statValue()}>{fmtAmount(monthTotal, currency)}</div>
          <p style={S.statSub()}>{expenses.filter(e => new Date(e.date) >= monthStart).length} entries</p>
        </div>
      </div>

      <div style={{ ...S.row, marginBottom: 20 }}>
        <div style={{ ...S.panel, flex: 2 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={S.panelTitle}>Spending Over Time</div>
          </div>
          {expenses.length === 0 ? (
            <div style={S.empty}><div style={S.emptyEmoji}>📊</div><p>Log expenses to see trends</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData}>
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#9999b3" }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip formatter={(v) => fmtAmount(v, currency)} contentStyle={{ borderRadius: 10, border: "1px solid #e0e0ee", fontSize: 13 }} />
                <Line type="monotone" dataKey="amount" stroke="#6C63FF" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        <div style={{ ...S.panel, flex: 1 }}>
          <div style={S.panelTitle}>By Category</div>
          {catTotals.length === 0 ? (
            <div style={S.empty}><div style={{ fontSize: 32, marginBottom: 8 }}>🍩</div><p style={{ fontSize: 12 }}>No data yet</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={catTotals} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3}>
                  {catTotals.map((c, i) => <Cell key={i} fill={c.color} />)}
                </Pie>
                <Tooltip formatter={(v) => fmtAmount(v, currency)} contentStyle={{ borderRadius: 10, border: "1px solid #e0e0ee", fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {budgetItems.length > 0 && (
        <div style={{ ...S.panel, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={S.panelTitle}>Budget Status <span style={{ fontWeight: 400, fontSize: 12, color: "#9999b3" }}>This month</span></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            {budgetItems.map(c => (
              <div key={c.id}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13 }}>{c.emoji} {c.label}</span>
                  <span style={{ fontSize: 12, color: c.pct > 90 ? "#EF4444" : "#9999b3" }}>{fmtAmount(c.spent, currency)} / {fmtAmount(c.budget, currency)}</span>
                </div>
                <ProgressBar pct={c.pct} color={c.pct > 90 ? "#EF4444" : c.pct > 70 ? "#F59E0B" : "#6C63FF"} />
              </div>
            ))}
          </div>
        </div>
      )}

      {budgetItems.length === 0 && (
        <div style={{ ...S.panel, marginBottom: 20 }}>
          <div style={S.panelTitle}>Budget Status <span style={{ fontWeight: 400, fontSize: 12, color: "#9999b3" }}>This month</span></div>
          <p style={{ color: "#9999b3", fontSize: 14, margin: 0 }}>No budgets set. <span style={{ color: "#6C63FF", cursor: "pointer" }} onClick={() => navigate("budgets")}>Set budgets →</span></p>
        </div>
      )}

      <div style={S.panel}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={S.panelTitle}>Recent Transactions</div>
          <span style={{ fontSize: 13, color: "#6C63FF", cursor: "pointer" }} onClick={() => navigate("log")}>See all →</span>
        </div>
        {recent.length === 0 ? (
          <div style={S.empty}><div style={S.emptyEmoji}>💰</div><p>No transactions yet</p></div>
        ) : (
          recent.map(e => {
            const cat = CATEGORIES.find(c => c.id === e.category) || CATEGORIES[6];
            return (
              <div key={e.id} style={S.txRow}>
                <div style={S.txIcon(cat.color)}>{cat.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{e.description || cat.label}</div>
                  <div style={{ fontSize: 12, color: "#9999b3" }}>{new Date(e.date).toLocaleDateString("en", { month: "short", day: "numeric" })} · {e.method}</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>{fmtAmount(e.amount, currency)}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Log Expense ──────────────────────────────────────────────────────────────
function LogExpense({ expenses, setExpenses, currency }) {
  const [cat, setCat] = useState("food");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today());
  const [desc, setDesc] = useState("");
  const [method, setMethod] = useState("Cash");
  const [note, setNote] = useState("");
  const [success, setSuccess] = useState(false);
  const [filter, setFilter] = useState("all");
  const [filterCat, setFilterCat] = useState("all");
  const [sort, setSort] = useState("newest");

  const submit = () => {
    if (!amount || isNaN(+amount) || +amount <= 0) return;
    const entry = { id: Date.now(), category: cat, amount: +amount, date, description: desc, method, note };
    setExpenses(prev => [entry, ...prev]);
    setAmount(""); setDesc(""); setNote(""); setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  const remove = (id) => setExpenses(prev => prev.filter(e => e.id !== id));

  const now = new Date();
  const filtered = expenses.filter(e => {
    const ed = new Date(e.date);
    if (filter === "today" && startOfDay(ed) < startOfDay(now)) return false;
    if (filter === "week" && ed < startOfWeek()) return false;
    if (filter === "month" && ed < startOfMonth()) return false;
    if (filterCat !== "all" && e.category !== filterCat) return false;
    return true;
  }).sort((a, b) => sort === "newest" ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date));

  return (
    <div style={S.row}>
      {/* Form */}
      <div style={{ ...S.panel, width: 320, flexShrink: 0 }}>
        <div style={{ ...S.panelTitle, marginBottom: 20 }}>+ New Expense</div>
        <div style={{ marginBottom: 14 }}>
          <div style={S.label}>Category</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {CATEGORIES.map(c => (
              <div key={c.id} style={S.chip(cat === c.id)} onClick={() => setCat(c.id)}>
                <span style={{ fontSize: 14 }}>{c.emoji}</span> {c.label}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <label style={S.label}>Amount ({currency})</label>
            <input style={S.input} type="number" placeholder="e.g. 2000" value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={S.label}>Date</label>
            <input style={S.input} type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={S.label}>Description</label>
          <input style={S.input} placeholder="e.g. Lunch at cafeteria" value={desc} onChange={e => setDesc(e.target.value)} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={S.label}>Payment Method</label>
          <select style={S.select} value={method} onChange={e => setMethod(e.target.value)}>
            {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={S.label}>Note (optional)</label>
          <textarea style={{ ...S.input, resize: "vertical", minHeight: 70 }} placeholder="Any extra details..." value={note} onChange={e => setNote(e.target.value)} />
        </div>
        <button style={S.btn("primary")} onClick={submit}>
          {success ? "✓ Logged!" : "+ Log Expense"}
        </button>
      </div>

      {/* List */}
      <div style={{ ...S.panel, flex: 1 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
          {["all", "today", "week", "month"].map(f => (
            <button key={f} style={S.filterBtn(filter === f)} onClick={() => setFilter(f)}>
              {{ all: "All", today: "Today", week: "This Week", month: "This Month" }[f]}
            </button>
          ))}
          <select style={{ ...S.select, width: "auto", marginLeft: "auto" }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
          </select>
          <select style={{ ...S.select, width: "auto" }} value={sort} onChange={e => setSort(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
        {filtered.length === 0 ? (
          <div style={S.empty}><div style={S.emptyEmoji}>💰</div><p>No expenses found.<br />Start logging your spending!</p></div>
        ) : (
          filtered.map(e => {
            const cat2 = CATEGORIES.find(c => c.id === e.category) || CATEGORIES[6];
            return (
              <div key={e.id} style={S.txRow}>
                <div style={S.txIcon(cat2.color)}>{cat2.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{e.description || cat2.label}</div>
                  <div style={{ fontSize: 12, color: "#9999b3", marginTop: 2 }}>
                    {new Date(e.date).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
                    {" · "}{e.method}
                    {e.note && <> · <span style={{ fontStyle: "italic" }}>{e.note}</span></>}
                  </div>
                </div>
                <span style={S.badge(cat2.color)}>{cat2.label}</span>
                <div style={{ fontWeight: 700, fontSize: 14, marginLeft: 12 }}>{fmtAmount(e.amount, currency)}</div>
                <div style={{ marginLeft: 10, color: "#ccc", cursor: "pointer", fontSize: 18, lineHeight: 1 }} onClick={() => remove(e.id)} title="Delete">×</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Budgets ──────────────────────────────────────────────────────────────────
function Budgets({ budgets, setBudgets, expenses, currency }) {
  const [draft, setDraft] = useState({ ...budgets });
  const [saved, setSaved] = useState(false);
  const monthStart = startOfMonth();

  const save = () => {
    const cleaned = {};
    Object.entries(draft).forEach(([k, v]) => { cleaned[k] = +v || 0; });
    setBudgets(cleaned);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const active = CATEGORIES.filter(c => draft[c.id] > 0).map(c => {
    const spent = expenses.filter(e => e.category === c.id && new Date(e.date) >= monthStart).reduce((s, e) => s + e.amount, 0);
    const pct = draft[c.id] ? (spent / draft[c.id]) * 100 : 0;
    return { ...c, spent, budget: +draft[c.id], pct };
  });

  return (
    <div style={S.row}>
      <div style={{ ...S.panel, width: 500, flexShrink: 0 }}>
        <div style={S.panelTitle}>🎯 Set Monthly Budgets</div>
        {CATEGORIES.map(c => (
          <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0", borderBottom: "1px solid #f0f0f8" }}>
            <span style={{ fontSize: 20 }}>{c.emoji}</span>
            <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{c.label}</span>
            <input
              style={{ ...S.input, width: 120, textAlign: "right" }}
              type="number"
              min="0"
              value={draft[c.id] || ""}
              placeholder="0"
              onChange={e => setDraft(prev => ({ ...prev, [c.id]: e.target.value }))}
            />
          </div>
        ))}
        <div style={{ marginTop: 20 }}>
          <button style={S.btn("primary")} onClick={save}>{saved ? "✓ Saved!" : "Save Budgets"}</button>
        </div>
      </div>

      <div style={{ ...S.panel, flex: 1 }}>
        <div style={S.panelTitle}>📊 Budget Status</div>
        {active.length === 0 ? (
          <p style={{ color: "#9999b3", fontSize: 14 }}>Set budgets on the left to track them here.</p>
        ) : (
          active.map(c => (
            <div key={c.id} style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{c.emoji} {c.label}</span>
                <span style={{ fontSize: 12, color: c.pct > 90 ? "#EF4444" : "#9999b3" }}>
                  {fmtAmount(c.spent, currency)} / {fmtAmount(c.budget, currency)}
                </span>
              </div>
              <ProgressBar pct={c.pct} color={c.pct > 90 ? "#EF4444" : c.pct > 70 ? "#F59E0B" : "#6C63FF"} />
              <div style={{ fontSize: 12, color: "#9999b3", marginTop: 4 }}>
                {c.pct > 90 ? "⚠️ Near limit" : c.pct > 100 ? "❌ Over budget" : `${Math.round(100 - c.pct)}% remaining`}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Analytics ────────────────────────────────────────────────────────────────
function Analytics({ expenses, currency }) {
  // Monthly trend
  const monthlyMap = {};
  expenses.forEach(e => {
    const key = new Date(e.date).toLocaleDateString("en", { year: "numeric", month: "short" });
    monthlyMap[key] = (monthlyMap[key] || 0) + e.amount;
  });
  const months = Object.entries(monthlyMap).sort((a, b) => new Date("1 " + a[0]) - new Date("1 " + b[0]));

  // Category all-time
  const catTotals = CATEGORIES.map(c => ({
    ...c,
    total: expenses.filter(e => e.category === c.id).reduce((s, e) => s + e.amount, 0),
    count: expenses.filter(e => e.category === c.id).length,
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

  const totalAll = catTotals.reduce((s, c) => s + c.total, 0);
  const avgDays = expenses.length > 0 ? (() => {
    const dates = [...new Set(expenses.map(e => e.date))];
    return totalAll / dates.length;
  })() : 0;

  return (
    <div>
      {/* Monthly trend table */}
      <div style={{ ...S.panel, marginBottom: 20 }}>
        <div style={S.panelTitle}>📅 Monthly Spending Trend</div>
        {months.length === 0 ? (
          <p style={{ color: "#9999b3", fontSize: 14 }}>No data yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: "1.5px solid #f0f0f8" }}>
                {["Month", "Total", "vs Prev", "Entries", "Top Category"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "8px 0", fontSize: 11, color: "#9999b3", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {months.map(([month, total], i) => {
                const prev = i > 0 ? months[i - 1][1] : null;
                const diff = prev ? ((total - prev) / prev) * 100 : null;
                const entries = expenses.filter(e => new Date(e.date).toLocaleDateString("en", { year: "numeric", month: "short" }) === month).length;
                const topCat = CATEGORIES.map(c => ({
                  ...c,
                  amt: expenses.filter(e => e.category === c.id && new Date(e.date).toLocaleDateString("en", { year: "numeric", month: "short" }) === month).reduce((s, e) => s + e.amount, 0)
                })).sort((a, b) => b.amt - a.amt)[0];
                return (
                  <tr key={month} style={{ borderBottom: "1px solid #f8f8fc" }}>
                    <td style={{ padding: "10px 0", fontWeight: 500 }}>{month}</td>
                    <td style={{ padding: "10px 0" }}>{fmtAmount(total, currency)}</td>
                    <td style={{ padding: "10px 0", color: diff === null ? "#9999b3" : diff > 0 ? "#EF4444" : "#10B981", fontWeight: 500 }}>
                      {diff === null ? "—" : `${diff > 0 ? "+" : ""}${diff.toFixed(1)}%`}
                    </td>
                    <td style={{ padding: "10px 0" }}>{entries}</td>
                    <td style={{ padding: "10px 0" }}>{topCat?.amt > 0 ? `${topCat.emoji} ${topCat.label}` : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div style={S.row}>
        {/* Smart insights */}
        <div style={{ ...S.panel, flex: 1 }}>
          <div style={S.panelTitle}>💡 Smart Insights</div>
          {expenses.length === 0 ? (
            <p style={{ color: "#9999b3", fontSize: 14 }}>No data yet.</p>
          ) : (
            <>
              <div style={{ display: "flex", gap: 14, padding: "12px 0", borderBottom: "1px solid #f0f0f8", alignItems: "center" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#f0efff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📊</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Daily average: {fmtAmount(Math.round(avgDays), currency)}</div>
                  <div style={{ fontSize: 12, color: "#9999b3" }}>Based on active spending days</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 14, padding: "12px 0", borderBottom: "1px solid #f0f0f8", alignItems: "center" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#f0fff8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📝</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{expenses.length} total entries logged</div>
                  <div style={{ fontSize: 12, color: "#9999b3" }}>Great habit — tracking is the first step to saving!</div>
                </div>
              </div>
              {catTotals[0] && (
                <div style={{ display: "flex", gap: 14, padding: "12px 0", alignItems: "center" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "#fff8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{catTotals[0].emoji}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Top spend: {catTotals[0].label}</div>
                    <div style={{ fontSize: 12, color: "#9999b3" }}>{fmtAmount(catTotals[0].total, currency)} ({((catTotals[0].total / totalAll) * 100).toFixed(1)}% of all spending)</div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* By Category */}
        <div style={{ ...S.panel, flex: 1 }}>
          <div style={S.panelTitle}>🏆 All-time by Category</div>
          {catTotals.length === 0 ? (
            <p style={{ color: "#9999b3", fontSize: 14 }}>No data yet.</p>
          ) : (
            catTotals.map(c => (
              <div key={c.id} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{c.emoji} {c.label}</span>
                  <span style={{ fontSize: 13, color: "#9999b3" }}>{fmtAmount(c.total, currency)}</span>
                </div>
                <ProgressBar pct={(c.total / catTotals[0].total) * 100} color={c.color} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Settings ─────────────────────────────────────────────────────────────────
function Settings({ displayName, setDisplayName, currency, setCurrency, darkMode, setDarkMode, budgetAlerts, setBudgetAlerts, expenses, setExpenses, setBudgets }) {
  const [name, setName] = useState(displayName);
  const [saved, setSaved] = useState(false);

  const saveName = () => { setDisplayName(name); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const exportCSV = () => {
    const header = "Date,Category,Amount,Currency,Description,Method,Note";
    const rows = expenses.map(e => `${e.date},${e.category},${e.amount},${currency},${e.description || ""},${e.method},${e.note || ""}`);
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "spendsmart-expenses.csv"; a.click();
  };

  const clearAll = () => {
    if (window.confirm("Clear all data? This cannot be undone.")) {
      setExpenses([]); setBudgets({});
    }
  };

  const storage = JSON.stringify(expenses).length;

  return (
    <div style={S.row}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={S.panel}>
          <div style={S.panelTitle}>👤 Profile</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px", background: "#f8f8fc", borderRadius: 12, marginBottom: 20 }}>
            <div style={{ ...S.avatar, width: 44, height: 44, fontSize: 16 }}>{name[0]?.toUpperCase() || "U"}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{displayName}</div>
              <div style={{ fontSize: 12, color: "#9999b3" }}>SpendSmart User</div>
            </div>
          </div>
          <label style={S.label}>Display Name</label>
          <input style={{ ...S.input, marginBottom: 16 }} value={name} onChange={e => setName(e.target.value)} />
          <button style={S.btn("primary")} onClick={saveName}>{saved ? "✓ Saved!" : "Save Profile"}</button>
        </div>

        <div style={S.panel}>
          <div style={S.panelTitle}>💾 Data</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f0f0f8" }}>
            <div><div style={{ fontWeight: 500, fontSize: 14 }}>Export CSV</div><div style={{ fontSize: 12, color: "#9999b3" }}>Download all expenses</div></div>
            <button style={{ ...S.btn("secondary"), width: "auto", padding: "8px 20px", background: "#6C63FF", color: "#fff", border: "none", borderRadius: 10 }} onClick={exportCSV}>Export</button>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f0f0f8" }}>
            <span style={{ fontSize: 14, color: "#9999b3" }}>Entries</span><span style={{ fontSize: 14, fontWeight: 500 }}>{expenses.length}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f0f0f8" }}>
            <span style={{ fontSize: 14, color: "#9999b3" }}>Storage</span><span style={{ fontSize: 14, fontWeight: 500 }}>{(storage / 1024).toFixed(1)} KB</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0" }}>
            <div><div style={{ fontWeight: 500, fontSize: 14, color: "#EF4444" }}>Clear All Data</div><div style={{ fontSize: 12, color: "#9999b3" }}>Cannot be undone</div></div>
            <button style={{ ...S.btn("danger"), width: "auto", padding: "8px 16px" }} onClick={clearAll}>Clear</button>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={S.panel}>
          <div style={S.panelTitle}>⚙️ Preferences</div>
          {[
            { label: "Dark Mode", sub: "Toggle dark/light theme (coming soon)", val: darkMode, set: setDarkMode },
            { label: "Budget Alerts", sub: "Warn when near limit", val: budgetAlerts, set: setBudgetAlerts },
          ].map(p => (
            <div key={p.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid #f0f0f8" }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{p.label}</div>
                <div style={{ fontSize: 12, color: "#9999b3" }}>{p.sub}</div>
              </div>
              <Toggle on={p.val} onToggle={() => p.set(v => !v)} />
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0" }}>
            <div>
              <div style={{ fontWeight: 500, fontSize: 14 }}>Currency</div>
              <div style={{ fontSize: 12, color: "#9999b3" }}>Display currency symbol</div>
            </div>
            <select style={{ ...S.select, width: 120 }} value={currency} onChange={e => setCurrency(e.target.value)}>
              {CURRENCIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div style={S.panel}>
          <div style={S.panelTitle}>ℹ️ About</div>
          {[["Version", "v2.0.0"], ["Built with", "React + Recharts"], ["Data stored", "Locally (your browser)"]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f0f0f8" }}>
              <span style={{ fontSize: 14, color: "#9999b3" }}>{k}</span>
              <span style={{ fontSize: 14, color: "#9999b3" }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [expenses, setExpenses] = useStorage("ss_expenses", []);
  const [budgets, setBudgets] = useStorage("ss_budgets", {});
  const [displayName, setDisplayName] = useStorage("ss_name", "User");
  const [currency, setCurrency] = useStorage("ss_currency", "RWF");
  const [darkMode, setDarkMode] = useStorage("ss_dark", false);
  const [budgetAlerts, setBudgetAlerts] = useStorage("ss_alerts", true);

  const pageLabel = { dashboard: "Dashboard", log: "Log Expense", budgets: "Budgets", analytics: "Analytics", settings: "Settings" };
  const pageSub = { dashboard: "Overview", log: "Add & View", budgets: "Monthly Limits", analytics: "Insights", settings: "Preferences" };

  return (
    <div style={S.app}>
      {/* Sidebar */}
      <div style={S.sidebar}>
        <div style={S.logo}>
          <div style={S.logoIcon}>💸</div>
          <p style={S.logoName}>SpendSmart</p>
          <p style={S.logoSub}>money clarity, daily</p>
        </div>
        <div style={S.navSection}>Main</div>
        {NAV_ITEMS.map(n => (
          <div key={n.id} style={S.navItem(page === n.id)} onClick={() => setPage(n.id)}>
            <span style={{ fontSize: 16 }}>{n.icon}</span> {n.label}
          </div>
        ))}
        <div style={S.navBottom}>
          <div style={S.navSection}>Account</div>
          <div style={S.navItem(page === "settings")} onClick={() => setPage("settings")}>
            <span style={{ fontSize: 16 }}>⚙</span> Settings
          </div>
        </div>
        <div style={{ padding: "12px 20px", borderTop: "1px solid #ffffff18", fontSize: 12, color: "#ffffff44", display: "flex", justifyContent: "space-between" }}>
          <span>Currency</span><span style={{ color: "#fff" }}>{currency}</span>
        </div>
      </div>

      {/* Main */}
      <div style={S.main}>
        <div style={S.topbar}>
          <div>
            <span style={S.pageTitle}>{pageLabel[page]}</span>
            <span style={S.pageSubtitle}>{pageSub[page]}</span>
          </div>
          <div style={S.topActions}>
            <div style={S.searchBox}>🔍 Search expenses...</div>
            <div style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid #e0e0ee", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 18 }} onClick={() => setPage("log")}>+</div>
            <div style={S.avatar}>{displayName[0]?.toUpperCase() || "U"}</div>
          </div>
        </div>

        <div style={S.content}>
          {page === "dashboard" && <Dashboard expenses={expenses} budgets={budgets} currency={currency} navigate={setPage} />}
          {page === "log" && <LogExpense expenses={expenses} setExpenses={setExpenses} currency={currency} />}
          {page === "budgets" && <Budgets budgets={budgets} setBudgets={setBudgets} expenses={expenses} currency={currency} />}
          {page === "analytics" && <Analytics expenses={expenses} currency={currency} />}
          {page === "settings" && (
            <Settings
              displayName={displayName} setDisplayName={setDisplayName}
              currency={currency} setCurrency={setCurrency}
              darkMode={darkMode} setDarkMode={setDarkMode}
              budgetAlerts={budgetAlerts} setBudgetAlerts={setBudgetAlerts}
              expenses={expenses} setExpenses={setExpenses}
              setBudgets={setBudgets}
            />
          )}
        </div>
      </div>
    </div>
  );
}
