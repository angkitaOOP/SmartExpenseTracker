import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Filler,
  Tooltip,
  Legend
);

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: "bi-house-door-fill" },
  { key: "transactions", label: "Transactions", icon: "bi-arrow-left-right" },
  { key: "categories", label: "Categories", icon: "bi-folder-fill" },
  { key: "budgets", label: "Budgets", icon: "bi-pie-chart-fill" },
  { key: "reports", label: "Reports", icon: "bi-bar-chart-line-fill" },
  { key: "goals", label: "Goals", icon: "bi-bullseye" },
  { key: "settings", label: "Settings", icon: "bi-gear-fill" },
];

const DEFAULT_CATEGORIES = [
  { id: "food", name: "Food & Dining", description: "Food and restaurant expenses", icon: "bi-cup-hot-fill", color: "#7c3aed", bg: "#efe9ff", budget: 8000 },
  { id: "transport", name: "Transport", description: "Travel and commuting", icon: "bi-bus-front-fill", color: "#2563eb", bg: "#e7edff", budget: 5000 },
  { id: "shopping", name: "Shopping", description: "Clothing and shopping", icon: "bi-bag-fill", color: "#f59e0b", bg: "#fff3de", budget: 4000 },
  { id: "bills", name: "Bills & Utilities", description: "Electricity, water, internet", icon: "bi-lightning-charge-fill", color: "#16a34a", bg: "#e6f7ec", budget: 3000 },
  { id: "entertainment", name: "Entertainment", description: "Movies, games, hobbies", icon: "bi-film", color: "#ec4899", bg: "#ffe6f3", budget: 2500 },
  { id: "education", name: "Education", description: "Books, courses, tuition", icon: "bi-mortarboard-fill", color: "#6366f1", bg: "#eceafe", budget: 2000 },
  { id: "health", name: "Health", description: "Medicine and healthcare", icon: "bi-heart-pulse-fill", color: "#14b8a6", bg: "#e2f9f5", budget: 2500 },
];

const ICON_CHOICES = [
  "bi-cup-hot-fill", "bi-bus-front-fill", "bi-bag-fill", "bi-lightning-charge-fill",
  "bi-film", "bi-mortarboard-fill", "bi-heart-pulse-fill", "bi-house-fill",
  "bi-airplane-fill", "bi-gift-fill", "bi-piggy-bank-fill", "bi-receipt",
];

const COLOR_CHOICES = ["#7c3aed", "#2563eb", "#f59e0b", "#16a34a", "#ec4899", "#6366f1", "#14b8a6", "#ef4444"];

const DEFAULT_GOALS = [
  { id: "emergency-fund", title: "Emergency Fund", target: 50000, saved: 12000, deadline: "", icon: "bi-shield-fill-check", color: "#2563eb" },
  { id: "new-laptop", title: "New Laptop", target: 80000, saved: 15000, deadline: "", icon: "bi-laptop-fill", color: "#7c3aed" },
];

function keywordFor(categoryName) {
  return categoryName.split(/&| and /i)[0].trim().toLowerCase();
}

const CATEGORY_STYLE = {
  food: { icon: "bi-basket-fill", color: "#7c3aed", bg: "#efe9ff" },
  grocery: { icon: "bi-basket-fill", color: "#7c3aed", bg: "#efe9ff" },
  transport: { icon: "bi-bus-front-fill", color: "#f43f5e", bg: "#ffe7ea" },
  bus: { icon: "bi-bus-front-fill", color: "#f43f5e", bg: "#ffe7ea" },
  bills: { icon: "bi-lightning-charge-fill", color: "#f59e0b", bg: "#fff3de" },
  electricity: { icon: "bi-lightning-charge-fill", color: "#f59e0b", bg: "#fff3de" },
  shopping: { icon: "bi-bag-fill", color: "#ec4899", bg: "#ffe6f3" },
  income: { icon: "bi-briefcase-fill", color: "#16a34a", bg: "#e3f9ea" },
  salary: { icon: "bi-briefcase-fill", color: "#16a34a", bg: "#e3f9ea" },
  freelance: { icon: "bi-briefcase-fill", color: "#16a34a", bg: "#e3f9ea" },
  education: { icon: "bi-book-fill", color: "#2563eb", bg: "#e7edff" },
  others: { icon: "bi-receipt", color: "#6b7280", bg: "#eef0f4" },
};

const DONUT_COLORS = ["#7c3aed", "#2563eb", "#f59e0b", "#16a34a", "#9ca3af", "#ec4899"];

function styleFor(item) {
  const key = (item.type === "Income" ? "income" : item.category || "others").toLowerCase();
  return CATEGORY_STYLE[key] || CATEGORY_STYLE.others;
}

function money(n) {
  return Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function startOfWeek(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // Monday as start
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function Dashboard() {
  const userName = localStorage.getItem("userName") || "";
  const firstName = userName.split(" ")[0] || "there";

  const [view, setView] = useState("dashboard");
  const [profileOpen, setProfileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // ---------- Categories (persisted locally) ----------
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem("categories");
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });
  const [categorySearch, setCategorySearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [catIcon, setCatIcon] = useState(ICON_CHOICES[0]);
  const [catColor, setCatColor] = useState(COLOR_CHOICES[0]);
  const [catBudget, setCatBudget] = useState("");

  useEffect(() => {
    localStorage.setItem("categories", JSON.stringify(categories));
  }, [categories]);

  // ---------- Goals (persisted locally) ----------
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem("goals");
    return saved ? JSON.parse(saved) : DEFAULT_GOALS;
  });
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalSaved, setGoalSaved] = useState("");
  const [goalDeadline, setGoalDeadline] = useState("");
  const [goalIcon, setGoalIcon] = useState(ICON_CHOICES[0]);
  const [goalColor, setGoalColor] = useState(COLOR_CHOICES[0]);
  const [addFundsGoalId, setAddFundsGoalId] = useState(null);
  const [addFundsAmount, setAddFundsAmount] = useState("");

  useEffect(() => {
    localStorage.setItem("goals", JSON.stringify(goals));
  }, [goals]);

  // ---------- Transaction form state (Transactions view) ----------
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");

  const [transactions, setTransactions] = useState([]);
  const [editId, setEditId] = useState(null);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
    }
    loadData();
  }, []);

  // Every request must prove who's logged in, otherwise the backend
  // can't tell whose transactions to return/add/edit/delete.
  const authHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  const loadData = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/transactions`,
        authHeader()
      );
      setTransactions(res.data);
    } catch (error) {
      console.log(error);
      if (error?.response?.status === 401) {
        logout();
      }
    }
  };

  const saveData = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/transactions/add`,
        {
          title,
          amount,
          type,
          category,
          date,
        },
        authHeader()
      );
      alert("Saved Successfully");
      clearForm();
      loadData();
    } catch (error) {
      console.log(error);
    }
  };

  const editData = (item) => {
    setEditId(item.id);
    setTitle(item.title);
    setAmount(item.amount);
    setType(item.type);
    setCategory(item.category);
    if (item.date) setDate(item.date.split("T")[0]);
  };

  const updateData = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/transactions/${editId}`,
        {
          title,
          amount,
          type,
          category,
          date,
        },
        authHeader()
      );
      alert("Updated Successfully");
      clearForm();
      loadData();
    } catch (error) {
      console.log(error);
    }
  };

  const deleteData = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/transactions/${id}`,
        authHeader()
      );
      alert("Deleted Successfully");
      loadData();
    } catch (error) {
      console.log(error);
    }
  };

  const clearForm = () => {
    setTitle("");
    setAmount("");
    setType("");
    setCategory("");
    setDate("");
    setEditId(null);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    window.location.href = "/login";
  };

  // ---------- Derived dashboard data ----------
  const totalIncome = transactions
    .filter((i) => i.type === "Income")
    .reduce((sum, i) => sum + Number(i.amount), 0);

  const totalExpense = transactions
    .filter((i) => i.type === "Expense")
    .reduce((sum, i) => sum + Number(i.amount), 0);

  const balance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0;

  const monthChange = useMemo(() => {
    const now = new Date();
    const thisM = now.getMonth();
    const thisY = now.getFullYear();
    const prevDate = new Date(thisY, thisM - 1, 1);

    const sums = { thisIncome: 0, thisExpense: 0, prevIncome: 0, prevExpense: 0 };

    transactions.forEach((t) => {
      const d = t.date ? new Date(t.date) : null;
      if (!d || isNaN(d)) return;
      const amt = Number(t.amount) || 0;
      const isThis = d.getMonth() === thisM && d.getFullYear() === thisY;
      const isPrev = d.getMonth() === prevDate.getMonth() && d.getFullYear() === prevDate.getFullYear();
      if (isThis) {
        if (t.type === "Income") sums.thisIncome += amt;
        else sums.thisExpense += amt;
      } else if (isPrev) {
        if (t.type === "Income") sums.prevIncome += amt;
        else sums.prevExpense += amt;
      }
    });

    const pct = (curr, prev) => (prev ? ((curr - prev) / prev) * 100 : curr > 0 ? 100 : 0);
    const thisBalance = sums.thisIncome - sums.thisExpense;
    const prevBalance = sums.prevIncome - sums.prevExpense;

    return {
      income: pct(sums.thisIncome, sums.prevIncome),
      expense: pct(sums.thisExpense, sums.prevExpense),
      balance: pct(thisBalance, Math.abs(prevBalance) || 1),
    };
  }, [transactions]);

  const weeklySeries = useMemo(() => {
    const buckets = [];
    for (let i = 4; i >= 0; i -= 1) {
      const start = startOfWeek(new Date());
      start.setDate(start.getDate() - i * 7);
      buckets.push({ start, income: 0, expense: 0 });
    }
    transactions.forEach((t) => {
      const d = t.date ? new Date(t.date) : null;
      if (!d || isNaN(d)) return;
      const wk = startOfWeek(d).getTime();
      const bucket = buckets.find((b) => b.start.getTime() === wk);
      if (!bucket) return;
      const amt = Number(t.amount) || 0;
      if (t.type === "Income") bucket.income += amt;
      else bucket.expense += amt;
    });
    return {
      labels: buckets.map((b) => b.start.toLocaleDateString("en-US", { month: "short", day: "numeric" })),
      income: buckets.map((b) => b.income),
      expense: buckets.map((b) => b.expense),
    };
  }, [transactions]);

  const categoryTotals = useMemo(() => {
    const totals = {};
    transactions
      .filter((t) => t.type === "Expense")
      .forEach((t) => {
        const cat = t.category || "Others";
        totals[cat] = (totals[cat] || 0) + Number(t.amount);
      });
    const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]);
    const sum = entries.reduce((s, [, v]) => s + v, 0) || 1;
    return entries.map(([label, value], i) => ({
      label,
      value,
      pct: (value / sum) * 100,
      color: DONUT_COLORS[i % DONUT_COLORS.length],
    }));
  }, [transactions]);

  const recentActivity = useMemo(
    () => [...transactions].sort((a, b) => (b.id || 0) - (a.id || 0)).slice(0, 5),
    [transactions]
  );

  const categorySpend = useMemo(() => {
    return categories.map((c) => {
      const kw = keywordFor(c.name);
      const spent = transactions
        .filter((t) => t.type === "Expense" && (t.category || "").toLowerCase().includes(kw))
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const pct = c.budget > 0 ? Math.round((spent / c.budget) * 100) : 0;
      return { ...c, spent, pct };
    });
  }, [categories, transactions]);

  const budgetOverview = useMemo(() => {
    return categorySpend
      .filter((b) => b.spent > 0)
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 3)
      .map((b) => ({ cat: b.name, spent: b.spent, budget: b.budget, pct: Math.min(b.pct, 999) }));
  }, [categorySpend]);

  const overspent = budgetOverview.filter((b) => b.spent > b.budget);

  const categoryTotalSpent = categorySpend.reduce((sum, c) => sum + c.spent, 0);
  const topCategory = [...categorySpend].sort((a, b) => b.spent - a.spent)[0];

  const filteredCategories = categorySpend.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(categorySearch.toLowerCase());
    const matchFilter =
      categoryFilter === "All" ||
      (categoryFilter === "Over Budget" && c.spent > c.budget) ||
      (categoryFilter === "Under Budget" && c.spent <= c.budget);
    return matchSearch && matchFilter;
  });

  const openAddCategory = () => {
    setEditingCategoryId(null);
    setCatName("");
    setCatDesc("");
    setCatIcon(ICON_CHOICES[0]);
    setCatColor(COLOR_CHOICES[0]);
    setCatBudget("");
    setCategoryModalOpen(true);
  };

  const openEditCategory = (c) => {
    setEditingCategoryId(c.id);
    setCatName(c.name);
    setCatDesc(c.description);
    setCatIcon(c.icon);
    setCatColor(c.color);
    setCatBudget(c.budget);
    setCategoryModalOpen(true);
  };

  const saveCategory = (e) => {
    e.preventDefault();
    if (!catName.trim() || !catBudget) return;

    if (editingCategoryId) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategoryId
            ? { ...c, name: catName, description: catDesc, icon: catIcon, color: catColor, budget: Number(catBudget) }
            : c
        )
      );
    } else {
      const id = catName.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();
      setCategories((prev) => [
        ...prev,
        {
          id,
          name: catName,
          description: catDesc,
          icon: catIcon,
          color: catColor,
          bg: catColor + "22",
          budget: Number(catBudget),
        },
      ]);
    }
    setCategoryModalOpen(false);
  };

  const deleteCategory = (id) => {
    if (!window.confirm("Delete this category?")) return;
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // ---------- Goals handlers ----------
  const openAddGoal = () => {
    setEditingGoalId(null);
    setGoalTitle("");
    setGoalTarget("");
    setGoalSaved("");
    setGoalDeadline("");
    setGoalIcon(ICON_CHOICES[0]);
    setGoalColor(COLOR_CHOICES[0]);
    setGoalModalOpen(true);
  };

  const openEditGoal = (g) => {
    setEditingGoalId(g.id);
    setGoalTitle(g.title);
    setGoalTarget(g.target);
    setGoalSaved(g.saved);
    setGoalDeadline(g.deadline || "");
    setGoalIcon(g.icon);
    setGoalColor(g.color);
    setGoalModalOpen(true);
  };

  const saveGoal = (e) => {
    e.preventDefault();
    if (!goalTitle.trim() || !goalTarget) return;

    if (editingGoalId) {
      setGoals((prev) =>
        prev.map((g) =>
          g.id === editingGoalId
            ? { ...g, title: goalTitle, target: Number(goalTarget), saved: Number(goalSaved) || 0, deadline: goalDeadline, icon: goalIcon, color: goalColor }
            : g
        )
      );
    } else {
      const id = goalTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();
      setGoals((prev) => [
        ...prev,
        {
          id,
          title: goalTitle,
          target: Number(goalTarget),
          saved: Number(goalSaved) || 0,
          deadline: goalDeadline,
          icon: goalIcon,
          color: goalColor,
        },
      ]);
    }
    setGoalModalOpen(false);
  };

  const deleteGoal = (id) => {
    if (!window.confirm("Delete this goal?")) return;
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const addFunds = (e) => {
    e.preventDefault();
    if (!addFundsAmount) return;
    setGoals((prev) =>
      prev.map((g) => (g.id === addFundsGoalId ? { ...g, saved: g.saved + Number(addFundsAmount) } : g))
    );
    setAddFundsGoalId(null);
    setAddFundsAmount("");
  };

  // ---------- Reports data ----------
  const monthlyReport = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i -= 1) {
      months.push(new Date(now.getFullYear(), now.getMonth() - i, 1));
    }
    return months.map((m) => {
      let income = 0;
      let expense = 0;
      transactions.forEach((t) => {
        const d = t.date ? new Date(t.date) : null;
        if (!d || isNaN(d)) return;
        if (d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear()) {
          if (t.type === "Income") income += Number(t.amount);
          else expense += Number(t.amount);
        }
      });
      return {
        label: m.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
        income,
        expense,
        net: income - expense,
      };
    });
  }, [transactions]);

  const exportCSV = () => {
    const header = "ID,Title,Amount,Type,Category,Date\n";
    const rows = transactions
      .map((t) => [t.id, `"${(t.title || "").replace(/"/g, '""')}"`, t.amount, t.type, t.category, t.date ? t.date.split("T")[0] : ""].join(","))
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "transactions.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearLocalData = () => {
    if (!window.confirm("This will reset Categories and Goals to their defaults on this device. Continue?")) return;
    localStorage.removeItem("categories");
    localStorage.removeItem("goals");
    setCategories(DEFAULT_CATEGORIES);
    setGoals(DEFAULT_GOALS);
    alert("Local data reset.");
  };

  const lineData = {
    labels: weeklySeries.labels,
    datasets: [
      {
        label: "Income",
        data: weeklySeries.income,
        borderColor: "#16a34a",
        backgroundColor: "rgba(22, 163, 74, 0.12)",
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
        borderWidth: 2.5,
      },
      {
        label: "Expense",
        data: weeklySeries.expense,
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.08)",
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
        borderWidth: 2.5,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: { legend: { display: false }, tooltip: { padding: 10, cornerRadius: 8 } },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#9ca3af", font: { size: 11 } } },
      y: { grid: { color: "#eef1f8" }, ticks: { color: "#9ca3af", font: { size: 11 } } },
    },
  };

  const doughnutData = {
    labels: categoryTotals.map((c) => c.label),
    datasets: [
      {
        data: categoryTotals.map((c) => c.value),
        backgroundColor: categoryTotals.map((c) => c.color),
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "72%",
    plugins: { legend: { display: false } },
  };

  const filteredTransactions = transactions.filter((item) => {
    const matchTitle = (item.title || "").toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "All" || item.type === filterType;
    return matchTitle && matchType;
  });

  const todayLabel = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className={`app-shell ${darkMode ? "app-shell--dark" : ""}`}>
      {/* ---------------- Sidebar ---------------- */}
      <aside className="app-sidebar">
        <div className="app-sidebar__brand">
          <span className="app-sidebar__logo">💰</span>
          <span>
            Smart Expense
            <br />
            Tracker
          </span>
        </div>

        <nav className="app-sidebar__nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              className={`app-sidebar__link ${view === item.key ? "app-sidebar__link--active" : ""}`}
              onClick={() => setView(item.key)}
            >
              <i className={`bi ${item.icon}`} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="app-sidebar__upgrade">
          <div className="app-sidebar__upgrade-icon">
            <i className="bi bi-wallet2" />
          </div>
          <strong>Upgrade to Pro</strong>
          <span>Unlock advanced analytics and custom budgets.</span>
          <button onClick={() => alert("Pro plan is coming soon!")}>Upgrade Now</button>
        </div>

        <label className="app-sidebar__theme">
          <i className={`bi ${darkMode ? "bi-moon-stars" : "bi-sun"}`} />
          {darkMode ? "Dark Mode" : "Light Mode"}
          <span
            className={`app-sidebar__switch ${darkMode ? "app-sidebar__switch--on" : ""}`}
            onClick={() => setDarkMode((d) => !d)}
          >
            <i />
          </span>
        </label>
      </aside>

      {/* ---------------- Main ---------------- */}
      <div className="app-main">
        <header className="app-header">
          <div className="app-header__greeting">
            <h1>Welcome back, {firstName} 👋</h1>
            <p>Here's what's happening with your finances today.</p>
          </div>

          <div className="app-header__actions">
            <div className="app-header__date">
              <i className="bi bi-calendar3" />
              {todayLabel}
              <i className="bi bi-chevron-down" />
            </div>

            <button className="app-header__icon-btn">
              <i className="bi bi-bell" />
              {overspent.length > 0 && <span className="app-header__badge">{overspent.length}</span>}
            </button>

            <div className="app-header__profile" onClick={() => setProfileOpen((o) => !o)}>
              <span className="app-header__avatar">
                <i className="bi bi-person-fill" />
              </span>
              <strong>{userName || "User"}</strong>
              <i className={`bi bi-chevron-down ${profileOpen ? "is-open" : ""}`} />

              {profileOpen && (
                <div className="app-header__menu" onClick={(e) => e.stopPropagation()}>
                  <button onClick={logout}>
                    <i className="bi bi-box-arrow-right" /> Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {view === "dashboard" && (
          <div className="app-content">
            {/* Stat cards */}
            <div className="stat-grid">
              <div className="stat-tile stat-tile--green">
                <span className="stat-tile__icon">
                  <i className="bi bi-graph-up-arrow" />
                </span>
                <div>
                  <p>Total Income</p>
                  <h3>৳ {money(totalIncome)}</h3>
                  <span className={`stat-tile__trend ${monthChange.income >= 0 ? "is-up" : "is-down"}`}>
                    <i className={`bi ${monthChange.income >= 0 ? "bi-arrow-up-right" : "bi-arrow-down-right"}`} />
                    {Math.abs(monthChange.income).toFixed(0)}% from last month
                  </span>
                </div>
              </div>

              <div className="stat-tile stat-tile--red">
                <span className="stat-tile__icon">
                  <i className="bi bi-graph-down-arrow" />
                </span>
                <div>
                  <p>Total Expense</p>
                  <h3>৳ {money(totalExpense)}</h3>
                  <span className={`stat-tile__trend ${monthChange.expense >= 0 ? "is-up" : "is-down"}`}>
                    <i className={`bi ${monthChange.expense >= 0 ? "bi-arrow-up-right" : "bi-arrow-down-right"}`} />
                    {Math.abs(monthChange.expense).toFixed(0)}% from last month
                  </span>
                </div>
              </div>

              <div className="stat-tile stat-tile--blue">
                <span className="stat-tile__icon">
                  <i className="bi bi-credit-card-2-front-fill" />
                </span>
                <div>
                  <p>Balance</p>
                  <h3>৳ {money(balance)}</h3>
                  <span className={`stat-tile__trend ${monthChange.balance >= 0 ? "is-up" : "is-down"}`}>
                    <i className={`bi ${monthChange.balance >= 0 ? "bi-arrow-up-right" : "bi-arrow-down-right"}`} />
                    {Math.abs(monthChange.balance).toFixed(0)}% from last month
                  </span>
                </div>
              </div>

              <div className="stat-tile stat-tile--purple">
                <span className="stat-tile__icon">
                  <i className="bi bi-pie-chart-fill" />
                </span>
                <div>
                  <p>Savings Rate</p>
                  <h3>{savingsRate}%</h3>
                  <span className="stat-tile__trend is-up">
                    <i className="bi bi-arrow-up-right" /> of your income saved
                  </span>
                </div>
              </div>
            </div>

            {/* Charts row */}
            <div className="dash-grid dash-grid--charts">
              <div className="panel">
                <div className="panel__head">
                  <h3>Income vs Expense</h3>
                  <span className="panel__pill">This Month</span>
                </div>
                <div className="panel__legend">
                  <span><i className="dot" style={{ background: "#16a34a" }} /> Income</span>
                  <span><i className="dot" style={{ background: "#ef4444" }} /> Expense</span>
                </div>
                <div className="panel__chart">
                  {transactions.length === 0 ? (
                    <p className="panel__empty">Add a transaction to see this chart.</p>
                  ) : (
                    <Line data={lineData} options={lineOptions} />
                  )}
                </div>
              </div>

              <div className="panel">
                <div className="panel__head">
                  <h3>Expense by Category</h3>
                </div>
                {categoryTotals.length === 0 ? (
                  <p className="panel__empty">No expenses logged yet.</p>
                ) : (
                  <>
                    <div className="donut-wrap">
                      <Doughnut data={doughnutData} options={doughnutOptions} />
                      <div className="donut-center">
                        <strong>৳{money(totalExpense)}</strong>
                        <span>Total</span>
                      </div>
                    </div>
                    <ul className="donut-legend">
                      {categoryTotals.map((c) => (
                        <li key={c.label}>
                          <i className="dot" style={{ background: c.color }} />
                          {c.label}
                          <b>৳{money(c.value)}</b>
                          <em>({c.pct.toFixed(0)}%)</em>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>

            {/* Recent + Advice */}
            <div className="dash-grid dash-grid--activity">
              <div className="panel">
                <div className="panel__head">
                  <h3>Recent Transactions</h3>
                  <button className="panel__link" onClick={() => setView("transactions")}>
                    View All
                  </button>
                </div>
                {recentActivity.length === 0 ? (
                  <p className="panel__empty">No transactions yet.</p>
                ) : (
                  <ul className="activity-list">
                    {recentActivity.map((t) => {
                      const s = styleFor(t);
                      return (
                        <li key={t.id}>
                          <span className="activity-list__icon" style={{ background: s.bg, color: s.color }}>
                            <i className={`bi ${s.icon}`} />
                          </span>
                          <span className="activity-list__body">
                            <b>{t.title}</b>
                            <em>{t.category || t.type}</em>
                          </span>
                          <span className="activity-list__meta">
                            <span className={t.type === "Income" ? "amt-pos" : "amt-neg"}>
                              {t.type === "Income" ? "+" : "-"}৳ {money(t.amount)}
                            </span>
                            <small>{t.date ? t.date.split("T")[0] : ""}</small>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <div className={`advice-card ${overspent.length > 0 ? "advice-card--warn" : ""}`}>
                <div className="advice-card__icon">
                  <i className="bi bi-lightbulb-fill" />
                </div>
                <h4>Smart Advice</h4>
                {overspent.length === 0 ? (
                  <>
                    <strong>Great! You are within your budget.</strong>
                    <p>Try to keep up your good financial habits.</p>
                  </>
                ) : (
                  <>
                    <strong>Careful — you're over budget.</strong>
                    <p>
                      You've overspent in {overspent.map((o) => o.cat).join(", ")}. Consider slowing
                      down spending in these categories this month.
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Top categories + Budget overview */}
            <div className="dash-grid dash-grid--bottom">
              <div className="panel">
                <div className="panel__head">
                  <h3>Top Spending Categories</h3>
                </div>
                {categoryTotals.length === 0 ? (
                  <p className="panel__empty">No expenses logged yet.</p>
                ) : (
                  <div className="bar-list">
                    {categoryTotals.map((c) => (
                      <div className="bar-list__row" key={c.label}>
                        <span className="bar-list__label">{c.label}</span>
                        <div className="bar-list__track">
                          <div className="bar-list__fill" style={{ width: `${c.pct}%`, background: c.color }} />
                        </div>
                        <span className="bar-list__pct">{c.pct.toFixed(0)}%</span>
                        <span className="bar-list__amt">৳{money(c.value)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="panel">
                <div className="panel__head">
                  <h3>Budget Overview</h3>
                  <button className="panel__link" onClick={() => setView("budgets")}>
                    View All
                  </button>
                </div>
                {budgetOverview.length === 0 ? (
                  <p className="panel__empty">Log expenses to see your budget usage.</p>
                ) : (
                  <div className="budget-list">
                    {budgetOverview.map((b) => (
                      <div className="budget-list__row" key={b.cat}>
                        <div className="budget-list__top">
                          <span>{b.cat}</span>
                          <b>{b.pct}%</b>
                        </div>
                        <span className="budget-list__amt">
                          ৳{money(b.spent)} / ৳{money(b.budget)}
                        </span>
                        <div className="budget-list__track">
                          <div
                            className="budget-list__fill"
                            style={{
                              width: `${Math.min(b.pct, 100)}%`,
                              background: b.pct >= 100 ? "#ef4444" : b.pct >= 70 ? "#f59e0b" : "#16a34a",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {view === "transactions" && (
          <div className="app-content">
            <div className="panel mb-4">
              <div className="panel__head">
                <h3>{editId ? "Update Transaction" : "Add Transaction"}</h3>
              </div>

              <div className="row">
                <div className="col-md-4 mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="">Select Type</option>
                    <option value="Income">Income</option>
                    <option value="Expense">Expense</option>
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <input
                    type="date"
                    className="form-control"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>

              {editId ? (
                <button className="btn btn-warning w-100" onClick={updateData}>
                  Update Transaction
                </button>
              ) : (
                <button className="btn btn-success w-100" onClick={saveData}>
                  Save Transaction
                </button>
              )}
            </div>

            <div className="panel">
              <div className="panel__head">
                <h3>All Transactions</h3>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by Title..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <select
                    className="form-select"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="All">All</option>
                    <option value="Income">Income</option>
                    <option value="Expense">Expense</option>
                  </select>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th>ID</th>
                      <th>Title</th>
                      <th>Amount</th>
                      <th>Type</th>
                      <th>Category</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((item) => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.title}</td>
                        <td>৳ {item.amount}</td>
                        <td>{item.type}</td>
                        <td>{item.category}</td>
                        <td>{item.date ? item.date.split("T")[0] : ""}</td>
                        <td>
                          <button className="btn btn-primary btn-sm me-2" onClick={() => editData(item)}>
                            Edit
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => deleteData(item.id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {view === "categories" && (
          <div className="app-content">
            <div className="cat-breadcrumb">
              <button onClick={() => setView("dashboard")}>Dashboard</button>
              <i className="bi bi-chevron-right" />
              <span>Categories</span>
            </div>

            <div className="cat-summary">
              <div className="stat-tile stat-tile--purple">
                <span className="stat-tile__icon">
                  <i className="bi bi-grid-fill" />
                </span>
                <div>
                  <p>Total Categories</p>
                  <h3>{categories.length}</h3>
                  <span className="stat-tile__trend is-up">Active categories</span>
                </div>
              </div>

              <div className="stat-tile stat-tile--blue">
                <span className="stat-tile__icon">
                  <i className="bi bi-wallet2" />
                </span>
                <div>
                  <p>Total Spent</p>
                  <h3>৳ {money(categoryTotalSpent)}</h3>
                  <span className="stat-tile__trend is-up">Across all categories</span>
                </div>
              </div>

              <div className="stat-tile stat-tile--green">
                <span className="stat-tile__icon">
                  <i className="bi bi-pie-chart-fill" />
                </span>
                <div>
                  <p>Top Category</p>
                  <h3>{topCategory && topCategory.spent > 0 ? topCategory.name : "—"}</h3>
                  <span className="stat-tile__trend is-up">
                    {topCategory && topCategory.spent > 0
                      ? `৳${money(topCategory.spent)} (${categoryTotalSpent ? Math.round((topCategory.spent / categoryTotalSpent) * 100) : 0}%)`
                      : "No spending yet"}
                  </span>
                </div>
              </div>

              <button className="cat-add-btn" onClick={openAddCategory}>
                <i className="bi bi-plus-lg" /> Add Category
              </button>
            </div>

            <div className="panel">
              <div className="cat-table-head">
                <h3>All Categories</h3>
                <div className="cat-table-controls">
                  <div className="cat-search">
                    <input
                      placeholder="Search category..."
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                    />
                    <i className="bi bi-search" />
                  </div>
                  <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                    <option>All</option>
                    <option>Over Budget</option>
                    <option>Under Budget</option>
                  </select>
                </div>
              </div>

              <div className="table-responsive">
                <table className="cat-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Icon</th>
                      <th>Total Spent</th>
                      <th>Budget</th>
                      <th>Progress</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCategories.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="cat-table__empty">
                          No categories found.
                        </td>
                      </tr>
                    ) : (
                      filteredCategories.map((c) => (
                        <tr key={c.id}>
                          <td>
                            <b>{c.name}</b>
                            <small>{c.description}</small>
                          </td>
                          <td>
                            <span className="cat-icon" style={{ background: c.bg || c.color + "22", color: c.color }}>
                              <i className={`bi ${c.icon}`} />
                            </span>
                          </td>
                          <td>৳{money(c.spent)}</td>
                          <td>৳{money(c.budget)}</td>
                          <td>
                            <div className="cat-progress">
                              <span>{Math.min(c.pct, 999)}%</span>
                              <div className="cat-progress__track">
                                <div
                                  className="cat-progress__fill"
                                  style={{ width: `${Math.min(c.pct, 100)}%`, background: c.color }}
                                />
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="cat-actions">
                              <button onClick={() => openEditCategory(c)} aria-label="Edit">
                                <i className="bi bi-pencil" />
                              </button>
                              <button className="is-danger" onClick={() => deleteCategory(c.id)} aria-label="Delete">
                                <i className="bi bi-trash" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="cat-table-footer">
                Showing 1 to {filteredCategories.length} of {filteredCategories.length} categories
              </div>
            </div>

            {categoryModalOpen && (
              <div className="modal-backdrop" onClick={() => setCategoryModalOpen(false)}>
                <form className="cat-modal" onClick={(e) => e.stopPropagation()} onSubmit={saveCategory}>
                  <div className="cat-modal__head">
                    <h3>{editingCategoryId ? "Edit Category" : "Add Category"}</h3>
                    <button type="button" onClick={() => setCategoryModalOpen(false)}>
                      <i className="bi bi-x-lg" />
                    </button>
                  </div>

                  <div className="cat-modal__body">
                    <label>Name</label>
                    <input value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="e.g. Travel" required />

                    <label>Description</label>
                    <input
                      value={catDesc}
                      onChange={(e) => setCatDesc(e.target.value)}
                      placeholder="Short description"
                    />

                    <label>Monthly Budget (৳)</label>
                    <input
                      type="number"
                      min="0"
                      value={catBudget}
                      onChange={(e) => setCatBudget(e.target.value)}
                      required
                    />

                    <label>Icon</label>
                    <div className="cat-swatch-row">
                      {ICON_CHOICES.map((ic) => (
                        <button
                          type="button"
                          key={ic}
                          className={`cat-icon-pick ${catIcon === ic ? "is-selected" : ""}`}
                          style={{ color: catColor }}
                          onClick={() => setCatIcon(ic)}
                        >
                          <i className={`bi ${ic}`} />
                        </button>
                      ))}
                    </div>

                    <label>Color</label>
                    <div className="cat-swatch-row">
                      {COLOR_CHOICES.map((c) => (
                        <button
                          type="button"
                          key={c}
                          className={`cat-color-pick ${catColor === c ? "is-selected" : ""}`}
                          style={{ background: c }}
                          onClick={() => setCatColor(c)}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="cat-modal__footer">
                    <button type="button" className="btn btn-light" onClick={() => setCategoryModalOpen(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editingCategoryId ? "Save changes" : "Add category"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {view === "budgets" && (
          <div className="app-content">
            <div className="cat-breadcrumb">
              <button onClick={() => setView("dashboard")}>Dashboard</button>
              <i className="bi bi-chevron-right" />
              <span>Budgets</span>
            </div>

            <div className="stat-grid">
              <div className="stat-tile stat-tile--purple">
                <span className="stat-tile__icon"><i className="bi bi-wallet-fill" /></span>
                <div>
                  <p>Total Budget</p>
                  <h3>৳ {money(categories.reduce((s, c) => s + c.budget, 0))}</h3>
                  <span className="stat-tile__trend is-up">Across {categories.length} categories</span>
                </div>
              </div>
              <div className="stat-tile stat-tile--red">
                <span className="stat-tile__icon"><i className="bi bi-graph-down-arrow" /></span>
                <div>
                  <p>Total Spent</p>
                  <h3>৳ {money(categoryTotalSpent)}</h3>
                  <span className="stat-tile__trend is-up">This month so far</span>
                </div>
              </div>
              <div className="stat-tile stat-tile--green">
                <span className="stat-tile__icon"><i className="bi bi-piggy-bank-fill" /></span>
                <div>
                  <p>Remaining</p>
                  <h3>৳ {money(Math.max(categories.reduce((s, c) => s + c.budget, 0) - categoryTotalSpent, 0))}</h3>
                  <span className="stat-tile__trend is-up">Still available</span>
                </div>
              </div>
              <div className="stat-tile stat-tile--blue">
                <span className="stat-tile__icon"><i className="bi bi-speedometer2" /></span>
                <div>
                  <p>Overall Usage</p>
                  <h3>
                    {categories.reduce((s, c) => s + c.budget, 0) > 0
                      ? Math.round((categoryTotalSpent / categories.reduce((s, c) => s + c.budget, 0)) * 100)
                      : 0}
                    %
                  </h3>
                  <span className="stat-tile__trend is-up">of total budget used</span>
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel__head">
                <h3>Budget by Category</h3>
                <button className="panel__link" onClick={() => setView("categories")}>
                  Manage Categories
                </button>
              </div>

              <div className="budget-edit-list">
                {[...categorySpend].sort((a, b) => b.pct - a.pct).map((c) => (
                  <div className="budget-edit-row" key={c.id}>
                    <span className="cat-icon" style={{ background: c.bg || c.color + "22", color: c.color }}>
                      <i className={`bi ${c.icon}`} />
                    </span>
                    <div className="budget-edit-row__main">
                      <div className="budget-edit-row__top">
                        <b>{c.name}</b>
                        <span>{Math.min(c.pct, 999)}%</span>
                      </div>
                      <div className="budget-list__track">
                        <div
                          className="budget-list__fill"
                          style={{ width: `${Math.min(c.pct, 100)}%`, background: c.pct >= 100 ? "#ef4444" : c.color }}
                        />
                      </div>
                    </div>
                    <div className="budget-edit-row__amt">
                      <span>৳{money(c.spent)} spent</span>
                      <input
                        type="number"
                        min="0"
                        defaultValue={c.budget}
                        onBlur={(e) => {
                          const val = Number(e.target.value);
                          if (val >= 0 && val !== c.budget) {
                            setCategories((prev) => prev.map((cat) => (cat.id === c.id ? { ...cat, budget: val } : cat)));
                          }
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {view === "reports" && (
          <div className="app-content">
            <div className="cat-breadcrumb">
              <button onClick={() => setView("dashboard")}>Dashboard</button>
              <i className="bi bi-chevron-right" />
              <span>Reports</span>
            </div>

            <div className="panel mb-4">
              <div className="panel__head">
                <h3>Monthly Income vs Expense</h3>
                <button className="btn btn-success btn-sm" onClick={exportCSV}>
                  <i className="bi bi-download" /> Export CSV
                </button>
              </div>
              <div className="panel__chart" style={{ height: 280 }}>
                {transactions.length === 0 ? (
                  <p className="panel__empty">Add transactions to see your report.</p>
                ) : (
                  <Bar
                    data={{
                      labels: monthlyReport.map((m) => m.label),
                      datasets: [
                        { label: "Income", data: monthlyReport.map((m) => m.income), backgroundColor: "#16a34a", borderRadius: 6 },
                        { label: "Expense", data: monthlyReport.map((m) => m.expense), backgroundColor: "#ef4444", borderRadius: 6 },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: "top", labels: { color: "#6b7280" } } },
                      scales: {
                        x: { grid: { display: false }, ticks: { color: "#9ca3af" } },
                        y: { grid: { color: "#eef1f8" }, ticks: { color: "#9ca3af" } },
                      },
                    }}
                  />
                )}
              </div>
            </div>

            <div className="dash-grid dash-grid--bottom">
              <div className="panel">
                <div className="panel__head"><h3>Monthly Summary</h3></div>
                <div className="table-responsive">
                  <table className="cat-table">
                    <thead>
                      <tr><th>Month</th><th>Income</th><th>Expense</th><th>Net</th></tr>
                    </thead>
                    <tbody>
                      {monthlyReport.map((m) => (
                        <tr key={m.label}>
                          <td>{m.label}</td>
                          <td className="amt-pos">৳{money(m.income)}</td>
                          <td className="amt-neg">৳{money(m.expense)}</td>
                          <td className={m.net >= 0 ? "amt-pos" : "amt-neg"}>৳{money(m.net)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="panel">
                <div className="panel__head"><h3>Category Breakdown</h3></div>
                {categorySpend.filter((c) => c.spent > 0).length === 0 ? (
                  <p className="panel__empty">No expenses logged yet.</p>
                ) : (
                  <div className="bar-list">
                    {categorySpend.filter((c) => c.spent > 0).sort((a, b) => b.spent - a.spent).map((c) => (
                      <div className="bar-list__row" key={c.id}>
                        <span className="bar-list__label">{c.name}</span>
                        <div className="bar-list__track">
                          <div
                            className="bar-list__fill"
                            style={{ width: `${categoryTotalSpent ? (c.spent / categoryTotalSpent) * 100 : 0}%`, background: c.color }}
                          />
                        </div>
                        <span className="bar-list__pct">
                          {categoryTotalSpent ? Math.round((c.spent / categoryTotalSpent) * 100) : 0}%
                        </span>
                        <span className="bar-list__amt">৳{money(c.spent)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {view === "goals" && (
          <div className="app-content">
            <div className="cat-breadcrumb">
              <button onClick={() => setView("dashboard")}>Dashboard</button>
              <i className="bi bi-chevron-right" />
              <span>Goals</span>
            </div>

            <div className="cat-summary">
              <div className="stat-tile stat-tile--purple">
                <span className="stat-tile__icon"><i className="bi bi-bullseye" /></span>
                <div>
                  <p>Active Goals</p>
                  <h3>{goals.length}</h3>
                  <span className="stat-tile__trend is-up">In progress</span>
                </div>
              </div>
              <div className="stat-tile stat-tile--green">
                <span className="stat-tile__icon"><i className="bi bi-piggy-bank-fill" /></span>
                <div>
                  <p>Total Saved</p>
                  <h3>৳ {money(goals.reduce((s, g) => s + g.saved, 0))}</h3>
                  <span className="stat-tile__trend is-up">Across all goals</span>
                </div>
              </div>
              <div className="stat-tile stat-tile--blue">
                <span className="stat-tile__icon"><i className="bi bi-flag-fill" /></span>
                <div>
                  <p>Total Target</p>
                  <h3>৳ {money(goals.reduce((s, g) => s + g.target, 0))}</h3>
                  <span className="stat-tile__trend is-up">Combined goal amount</span>
                </div>
              </div>
              <button className="cat-add-btn" onClick={openAddGoal}>
                <i className="bi bi-plus-lg" /> Add Goal
              </button>
            </div>

            {goals.length === 0 ? (
              <div className="panel coming-soon">
                <i className="bi bi-bullseye" />
                <h3>No goals yet</h3>
                <p>Click "Add Goal" to start saving towards something.</p>
              </div>
            ) : (
              <div className="goal-grid">
                {goals.map((g) => {
                  const pct = g.target > 0 ? Math.min(Math.round((g.saved / g.target) * 100), 100) : 0;
                  return (
                    <div className="goal-card" key={g.id}>
                      <div className="goal-card__head">
                        <span className="cat-icon" style={{ background: g.color + "22", color: g.color }}>
                          <i className={`bi ${g.icon}`} />
                        </span>
                        <div className="cat-actions">
                          <button onClick={() => openEditGoal(g)} aria-label="Edit"><i className="bi bi-pencil" /></button>
                          <button className="is-danger" onClick={() => deleteGoal(g.id)} aria-label="Delete"><i className="bi bi-trash" /></button>
                        </div>
                      </div>
                      <h4>{g.title}</h4>
                      {g.deadline && <span className="goal-card__deadline"><i className="bi bi-calendar-event" /> Target: {g.deadline}</span>}
                      <div className="goal-card__amounts">
                        <b>৳{money(g.saved)}</b> <span>/ ৳{money(g.target)}</span>
                      </div>
                      <div className="budget-list__track">
                        <div className="budget-list__fill" style={{ width: `${pct}%`, background: g.color }} />
                      </div>
                      <div className="goal-card__footer">
                        <span>{pct}% complete</span>
                        {addFundsGoalId === g.id ? (
                          <form className="goal-card__addfunds" onSubmit={addFunds}>
                            <input
                              type="number"
                              min="1"
                              autoFocus
                              placeholder="Amount"
                              value={addFundsAmount}
                              onChange={(e) => setAddFundsAmount(e.target.value)}
                            />
                            <button type="submit"><i className="bi bi-check-lg" /></button>
                            <button type="button" onClick={() => setAddFundsGoalId(null)}><i className="bi bi-x-lg" /></button>
                          </form>
                        ) : (
                          <button className="panel__link" onClick={() => setAddFundsGoalId(g.id)}>
                            + Add Funds
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {goalModalOpen && (
              <div className="modal-backdrop" onClick={() => setGoalModalOpen(false)}>
                <form className="cat-modal" onClick={(e) => e.stopPropagation()} onSubmit={saveGoal}>
                  <div className="cat-modal__head">
                    <h3>{editingGoalId ? "Edit Goal" : "Add Goal"}</h3>
                    <button type="button" onClick={() => setGoalModalOpen(false)}><i className="bi bi-x-lg" /></button>
                  </div>
                  <div className="cat-modal__body">
                    <label>Goal Title</label>
                    <input value={goalTitle} onChange={(e) => setGoalTitle(e.target.value)} placeholder="e.g. New Phone" required />

                    <label>Target Amount (৳)</label>
                    <input type="number" min="0" value={goalTarget} onChange={(e) => setGoalTarget(e.target.value)} required />

                    <label>Already Saved (৳)</label>
                    <input type="number" min="0" value={goalSaved} onChange={(e) => setGoalSaved(e.target.value)} />

                    <label>Target Date (optional)</label>
                    <input type="date" value={goalDeadline} onChange={(e) => setGoalDeadline(e.target.value)} />

                    <label>Icon</label>
                    <div className="cat-swatch-row">
                      {ICON_CHOICES.map((ic) => (
                        <button
                          type="button"
                          key={ic}
                          className={`cat-icon-pick ${goalIcon === ic ? "is-selected" : ""}`}
                          style={{ color: goalColor }}
                          onClick={() => setGoalIcon(ic)}
                        >
                          <i className={`bi ${ic}`} />
                        </button>
                      ))}
                    </div>

                    <label>Color</label>
                    <div className="cat-swatch-row">
                      {COLOR_CHOICES.map((c) => (
                        <button
                          type="button"
                          key={c}
                          className={`cat-color-pick ${goalColor === c ? "is-selected" : ""}`}
                          style={{ background: c }}
                          onClick={() => setGoalColor(c)}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="cat-modal__footer">
                    <button type="button" className="btn btn-light" onClick={() => setGoalModalOpen(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">{editingGoalId ? "Save changes" : "Add goal"}</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {view === "settings" && (
          <div className="app-content">
            <div className="cat-breadcrumb">
              <button onClick={() => setView("dashboard")}>Dashboard</button>
              <i className="bi bi-chevron-right" />
              <span>Settings</span>
            </div>

            <div className="settings-grid">
              <div className="panel">
                <div className="panel__head"><h3>Profile</h3></div>
                <div className="settings-profile">
                  <span className="app-header__avatar" style={{ width: 56, height: 56, fontSize: 22 }}>
                    <i className="bi bi-person-fill" />
                  </span>
                  <div>
                    <strong>{userName || "User"}</strong>
                    <p>Signed in</p>
                  </div>
                </div>
              </div>

              <div className="panel">
                <div className="panel__head"><h3>Appearance</h3></div>
                <div className="settings-row">
                  <div>
                    <b>Dark Mode</b>
                    <p>Switch the dashboard to a dark color theme.</p>
                  </div>
                  <span
                    className={`app-sidebar__switch ${darkMode ? "app-sidebar__switch--on" : ""}`}
                    onClick={() => setDarkMode((d) => !d)}
                  >
                    <i />
                  </span>
                </div>
              </div>

              <div className="panel">
                <div className="panel__head"><h3>Data</h3></div>
                <div className="settings-row">
                  <div>
                    <b>Export Transactions</b>
                    <p>Download all your transactions as a CSV file.</p>
                  </div>
                  <button className="btn btn-success btn-sm" onClick={exportCSV}>
                    <i className="bi bi-download" /> Export CSV
                  </button>
                </div>
                <div className="settings-row">
                  <div>
                    <b>Reset Categories & Goals</b>
                    <p>Resets Categories and Goals on this device back to defaults.</p>
                  </div>
                  <button className="btn btn-warning btn-sm" onClick={clearLocalData}>
                    Reset
                  </button>
                </div>
              </div>

              <div className="panel">
                <div className="panel__head"><h3>Account</h3></div>
                <div className="settings-row">
                  <div>
                    <b>Log out</b>
                    <p>Sign out of Smart Expense Tracker on this device.</p>
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={logout}>
                    <i className="bi bi-box-arrow-right" /> Log out
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;