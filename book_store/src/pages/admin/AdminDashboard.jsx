import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../api";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Core stats & data
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalTransactions: 0,
    totalMembers: 0,
    totalCategories: 0,
    totalAuthors: 0
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [membersList, setMembersList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [authorsList, setAuthorsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters for Transactions
  const [txSearchQuery, setTxSearchQuery] = useState("");
  const [txStatusFilter, setTxStatusFilter] = useState("ALL");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Modals state
  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [categoriesModalOpen, setCategoriesModalOpen] = useState(false);
  const [authorsModalOpen, setAuthorsModalOpen] = useState(false);

  // Forms inside modals
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [newAuthor, setNewAuthor] = useState({ name: "", bio: "" });
  const [modalSubmitting, setModalSubmitting] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, txRes, usersRes, catsRes, authorsRes] = await Promise.allSettled([
        API.get("/stats"),
        API.get("/transactions"),
        API.get("/users"),
        API.get("/categories"),
        API.get("/authors")
      ]);

      const usersData = (usersRes.status === "fulfilled" && Array.isArray(usersRes.value.data)) ? usersRes.value.data : [];
      const actualMembers = usersData.filter(
        (u) => u.role !== "ADMIN" && u.role?.toUpperCase() !== "ADMIN"
      );

      if (statsRes.status === "fulfilled" && statsRes.value.data) {
        setStats({
          totalBooks: statsRes.value.data.totalBooks || 0,
          totalTransactions: statsRes.value.data.totalTransactions || 0,
          totalMembers: actualMembers.length,
          totalCategories: statsRes.value.data.totalCategories || 0,
          totalAuthors: statsRes.value.data.totalAuthors || 0
        });
      }

      if (txRes.status === "fulfilled" && Array.isArray(txRes.value.data)) {
        setRecentTransactions(txRes.value.data);
      } else {
        setRecentTransactions([]);
      }

      if (usersRes.status === "fulfilled" && Array.isArray(usersRes.value.data)) {
        setMembersList(usersRes.value.data);
      }
      if (catsRes.status === "fulfilled" && Array.isArray(catsRes.value.data)) {
        setCategoriesList(catsRes.value.data);
      }
      if (authorsRes.status === "fulfilled" && Array.isArray(authorsRes.value.data)) {
        setAuthorsList(authorsRes.value.data);
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  // Return book handler
  const handleReturnBook = async (txId, bookTitle) => {
    try {
      setActionLoadingId(txId);
      await API.put(`/transactions/return/${txId}`);
      toast.success(`Book "${bookTitle}" successfully returned & restocked!`);
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data || "Failed to return book");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Create Category handler
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name.trim()) return;
    try {
      setModalSubmitting(true);
      await API.post("/categories", newCategory);
      toast.success(`Category "${newCategory.name}" created!`);
      setNewCategory({ name: "", description: "" });
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data || "Failed to create category");
    } finally {
      setModalSubmitting(false);
    }
  };

  // Delete Category handler
  const handleDeleteCategory = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete category "${name}"?`)) {
      try {
        await API.delete(`/categories/${id}`);
        toast.success(`Category "${name}" deleted`);
        fetchDashboardData();
      } catch (err) {
        toast.error("Failed to delete category");
      }
    }
  };

  // Create Author handler
  const handleAddAuthor = async (e) => {
    e.preventDefault();
    if (!newAuthor.name.trim()) return;
    try {
      setModalSubmitting(true);
      await API.post("/authors", newAuthor);
      toast.success(`Author "${newAuthor.name}" added!`);
      setNewAuthor({ name: "", bio: "" });
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data || "Failed to add author");
    } finally {
      setModalSubmitting(false);
    }
  };

  // Delete Author handler
  const handleDeleteAuthor = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete author "${name}"?`)) {
      try {
        await API.delete(`/authors/${id}`);
        toast.success(`Author "${name}" deleted`);
        fetchDashboardData();
      } catch (err) {
        toast.error("Failed to delete author");
      }
    }
  };

  // Delete User handler
  const handleDeleteUser = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove member "${name}"?`)) {
      try {
        await API.delete(`/users/${id}`);
        toast.success(`Member "${name}" removed`);
        fetchDashboardData();
      } catch (err) {
        toast.error("Failed to remove member");
      }
    }
  };

  const chartData = [
    { name: "Books", count: stats.totalBooks, color: "#6366f1" },
    { name: "Loans", count: stats.totalTransactions, color: "#10b981" },
    { name: "Members", count: stats.totalMembers, color: "#8b5cf6" },
    { name: "Categories", count: stats.totalCategories, color: "#f59e0b" },
    { name: "Authors", count: stats.totalAuthors, color: "#06b6d4" },
  ];

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric"
  });

  // Filter only real library members (strictly excludes ADMIN)
  const onlyMembers = membersList.filter(
    (m) => m.role !== "ADMIN" && m.role?.toUpperCase() !== "ADMIN"
  );

  const filteredMembers = onlyMembers.filter(
    (m) =>
      m.name?.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
      m.email?.toLowerCase().includes(memberSearchQuery.toLowerCase())
  );

  // Filtered transactions
  const filteredTransactions = recentTransactions.filter((tx) => {
    const matchesSearch =
      tx.book?.title?.toLowerCase().includes(txSearchQuery.toLowerCase()) ||
      tx.member?.name?.toLowerCase().includes(txSearchQuery.toLowerCase()) ||
      tx.member?.email?.toLowerCase().includes(txSearchQuery.toLowerCase());

    const matchesStatus =
      txStatusFilter === "ALL" || tx.status === txStatusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <span className="text-xs font-semibold">Loading live dashboard analytics...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-brand-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-slate-900/10 border border-slate-800 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>{currentDate} • System Live</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-white">
            Welcome back, {user?.name || "Administrator"} 👋
          </h1>
          <p className="text-slate-300 text-sm max-w-xl">
            Here is your live library overview. You have complete control over books inventory, loan transactions, categories, and registered members.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
          <Link
            to="/admin/books"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-brand-500/25 transition-all duration-200 active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Manage Books</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid (Fully Clickable & Interactive) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
        {[
          { 
            label: "Total Books", 
            value: stats.totalBooks, 
            sub: "In Catalog", 
            actionText: "Manage Books →",
            onClick: () => navigate("/admin/books"),
            gradient: "from-indigo-500 to-brand-600",
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            )
          },
          { 
            label: "Total Loans", 
            value: stats.totalTransactions, 
            sub: "Transactions", 
            actionText: "View Table ↓",
            onClick: () => {
              const el = document.getElementById("transactions-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            },
            gradient: "from-emerald-500 to-teal-600",
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            )
          },
          { 
            label: "Active Members", 
            value: onlyMembers.length, 
            sub: "Registered Members", 
            actionText: "View Members →",
            onClick: () => setMembersModalOpen(true),
            gradient: "from-violet-500 to-purple-600",
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            )
          },
          { 
            label: "Categories", 
            value: stats.totalCategories, 
            sub: "Genres / Topics", 
            actionText: "Manage Genres →",
            onClick: () => setCategoriesModalOpen(true),
            gradient: "from-amber-500 to-orange-600",
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            )
          },
          { 
            label: "Authors", 
            value: stats.totalAuthors, 
            sub: "Writers Indexed", 
            actionText: "Manage Authors →",
            onClick: () => setAuthorsModalOpen(true),
            gradient: "from-cyan-500 to-blue-600",
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            )
          }
        ].map((card, idx) => (
          <div 
            key={idx} 
            onClick={card.onClick}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{card.label}</span>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${card.gradient} text-white flex items-center justify-center shadow-md shadow-slate-200 group-hover:scale-110 transition-transform`}>
                {card.icon}
              </div>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tracking-tight">
                {card.value}
              </p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[11px] font-medium text-slate-400">{card.sub}</span>
                <span className="text-[10px] font-bold text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  {card.actionText}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics & Quick Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Chart */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold font-display text-slate-900">System Resources Distribution</h2>
              <p className="text-xs text-slate-500">Live counts across core library entities</p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
              Live Database
            </span>
          </div>

          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: '1px solid #e2e8f0', 
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
                    padding: '10px 14px'
                  }} 
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={42}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Quick Actions (Fully Working Buttons) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
            <h2 className="text-base font-bold font-display text-slate-900 mb-4">Quick Operations</h2>
            <div className="space-y-2.5">
              {/* Quick Operation 1: Books Inventory */}
              <Link
                to="/admin/books"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-brand-50/80 border border-slate-200/80 hover:border-brand-300 text-slate-800 hover:text-brand-700 transition-all duration-150 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">
                    📚
                  </div>
                  <div>
                    <span className="text-xs font-bold block">Books Inventory</span>
                    <span className="text-[10px] text-slate-500">Add, edit, or remove books ({stats.totalBooks})</span>
                  </div>
                </div>
                <span className="text-slate-400 group-hover:text-brand-600 transition-colors">→</span>
              </Link>

              {/* Quick Operation 3: Categories Modal Trigger */}
              <button
                onClick={() => setCategoriesModalOpen(true)}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-amber-50/80 border border-slate-200/80 hover:border-amber-300 text-slate-800 hover:text-amber-700 transition-all duration-150 group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
                    🏷️
                  </div>
                  <div>
                    <span className="text-xs font-bold block">Manage Categories</span>
                    <span className="text-[10px] text-slate-500">{stats.totalCategories} Active Genres</span>
                  </div>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 group-hover:bg-amber-200">
                  Manage →
                </span>
              </button>

              {/* Quick Operation 4: Authors Modal Trigger */}
              <button
                onClick={() => setAuthorsModalOpen(true)}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-cyan-50/80 border border-slate-200/80 hover:border-cyan-300 text-slate-800 hover:text-cyan-700 transition-all duration-150 group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-sm">
                    ✍️
                  </div>
                  <div>
                    <span className="text-xs font-bold block">Manage Authors</span>
                    <span className="text-[10px] text-slate-500">{stats.totalAuthors} Writers Listed</span>
                  </div>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 group-hover:bg-cyan-200">
                  Manage →
                </span>
              </button>

              {/* Quick Operation 5: Members Modal Trigger */}
              <button
                onClick={() => setMembersModalOpen(true)}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-violet-50/80 border border-slate-200/80 hover:border-violet-300 text-slate-800 hover:text-violet-700 transition-all duration-150 group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-sm">
                    👥
                  </div>
                  <div>
                    <span className="text-xs font-bold block">Active Members</span>
                    <span className="text-[10px] text-slate-500">{onlyMembers.length} Members (Excludes Admin)</span>
                  </div>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-violet-100 text-violet-800 group-hover:bg-violet-200">
                  Manage →
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions Activity Table (With Search, Filter & Return Actions) */}
      <div id="transactions-section" className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold font-display text-slate-900">Library Loan Transactions</h2>
            <p className="text-xs text-slate-500">Live transaction registry: issue loans, mark returns, and track fines</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search filter */}
            <input
              type="text"
              placeholder="Search by book or member..."
              value={txSearchQuery}
              onChange={(e) => setTxSearchQuery(e.target.value)}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 outline-none focus:border-brand-500 w-48 sm:w-56"
            />

            {/* Status filter */}
            <select
              value={txStatusFilter}
              onChange={(e) => setTxStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white outline-none focus:border-brand-500"
            >
              <option value="ALL">All Loans ({recentTransactions.length})</option>
              <option value="ISSUED">Active Loans Only</option>
              <option value="RETURNED">Returned Only</option>
            </select>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl">
            <span className="text-3xl block mb-2">📋</span>
            No transactions match your current search or status filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                  <th className="py-3 pl-3">Member</th>
                  <th className="py-3 px-3">Book Title</th>
                  <th className="py-3 px-3">Issue Date</th>
                  <th className="py-3 px-3">Due Date</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Fine (₹)</th>
                  <th className="py-3 pr-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 pl-3">
                      <p className="font-bold text-slate-800">{tx.member?.name || `Member #${tx.member?.id || "-"}`}</p>
                      <p className="text-[10px] text-slate-400">{tx.member?.email || ""}</p>
                    </td>
                    <td className="py-3.5 px-3 font-medium text-slate-700">
                      {tx.book?.title}
                    </td>
                    <td className="py-3.5 px-3 text-slate-500">{tx.issueDate}</td>
                    <td className="py-3.5 px-3 font-semibold text-slate-700">{tx.dueDate}</td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        tx.status === 'RETURNED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        tx.status === 'ISSUED' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                        'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-800">
                      ₹{Number(tx.fineAmount || 0).toFixed(2)}
                    </td>
                    <td className="py-3.5 pr-3 text-right">
                      {tx.status === "ISSUED" ? (
                        <button
                          onClick={() => handleReturnBook(tx.id, tx.book?.title)}
                          disabled={actionLoadingId === tx.id}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs transition-colors shadow-sm active:scale-95 disabled:opacity-50"
                          title="Mark Book as Returned"
                        >
                          {actionLoadingId === tx.id ? "Returning..." : "Mark Returned"}
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-600 flex items-center justify-end gap-1">
                          ✓ Completed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= MODAL 1: CATEGORIES MODAL ================= */}
      {categoriesModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-lg font-bold font-display text-slate-900">Manage Categories / Genres</h3>
                <p className="text-xs text-slate-500">Add or remove library book categories ({categoriesList.length} total)</p>
              </div>
              <button
                onClick={() => setCategoriesModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 text-slate-500 flex items-center justify-center shadow-sm"
              >
                ✕
              </button>
            </div>

            {/* Add Category Form */}
            <form onSubmit={handleAddCategory} className="p-5 bg-slate-50/60 border-b border-slate-100 space-y-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">+ Add New Category</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Category Name (e.g. AI)"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 outline-none focus:border-brand-500"
                />
                <input
                  type="text"
                  placeholder="Brief description"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 outline-none focus:border-brand-500 sm:col-span-1"
                />
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition-colors shadow-sm active:scale-95 disabled:opacity-50"
                >
                  {modalSubmitting ? "Adding..." : "Add Category"}
                </button>
              </div>
            </form>

            {/* Category List */}
            <div className="p-6 overflow-y-auto flex-grow divide-y divide-slate-100 space-y-2">
              {categoriesList.map((c) => (
                <div key={c.id} className="pt-2 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{c.name}</p>
                    <p className="text-[11px] text-slate-400">{c.description || "No description"}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(c.id, c.name)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 text-xs font-bold transition-colors"
                    title="Delete Category"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: AUTHORS MODAL ================= */}
      {authorsModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-lg font-bold font-display text-slate-900">Manage Authors Directory</h3>
                <p className="text-xs text-slate-500">Indexed book authors and bio records ({authorsList.length} total)</p>
              </div>
              <button
                onClick={() => setAuthorsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 text-slate-500 flex items-center justify-center shadow-sm"
              >
                ✕
              </button>
            </div>

            {/* Add Author Form */}
            <form onSubmit={handleAddAuthor} className="p-5 bg-slate-50/60 border-b border-slate-100 space-y-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">+ Add New Author</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Author Name"
                  value={newAuthor.name}
                  onChange={(e) => setNewAuthor({ ...newAuthor, name: e.target.value })}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 outline-none focus:border-brand-500"
                />
                <input
                  type="text"
                  placeholder="Short Biography"
                  value={newAuthor.bio}
                  onChange={(e) => setNewAuthor({ ...newAuthor, bio: e.target.value })}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 outline-none focus:border-brand-500"
                />
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors shadow-sm active:scale-95 disabled:opacity-50"
                >
                  {modalSubmitting ? "Adding..." : "Add Author"}
                </button>
              </div>
            </form>

            {/* Author List */}
            <div className="p-6 overflow-y-auto flex-grow divide-y divide-slate-100 space-y-2">
              {authorsList.map((a) => (
                <div key={a.id} className="pt-2 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{a.name}</p>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{a.bio || "No biography"}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteAuthor(a.id, a.name)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 text-xs font-bold transition-colors"
                    title="Delete Author"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: MEMBERS MODAL (EXCLUSIVELY MEMBERS, NO ADMIN) ================= */}
      {membersModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-lg font-bold font-display text-slate-900">Active Library Members</h3>
                <p className="text-xs text-slate-500">Showing only registered members, excluding administrators ({onlyMembers.length} active members)</p>
              </div>
              <button
                onClick={() => {
                  setMembersModalOpen(false);
                  setMemberSearchQuery("");
                }}
                className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 text-slate-500 flex items-center justify-center shadow-sm"
              >
                ✕
              </button>
            </div>

            {/* Member search bar */}
            <div className="p-4 bg-slate-50/70 border-b border-slate-100">
              <input
                type="text"
                placeholder="Search active members by name or email..."
                value={memberSearchQuery}
                onChange={(e) => setMemberSearchQuery(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 outline-none focus:border-brand-500 bg-white"
              />
            </div>

            <div className="p-6 overflow-y-auto flex-grow">
              {filteredMembers.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl">
                  <span className="text-3xl block mb-2">👥</span>
                  {onlyMembers.length === 0 ? "No active members registered yet." : "No members match your search."}
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredMembers.map((m) => (
                    <div key={m.id} className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/50 px-2 rounded-xl transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                          {m.name ? m.name.charAt(0).toUpperCase() : "M"}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{m.name}</p>
                          <p className="text-[11px] text-slate-500">{m.email}</p>
                          {m.phone && <p className="text-[10px] text-slate-400">📞 {m.phone}</p>}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                          MEMBER
                        </span>

                        <button
                          onClick={() => handleDeleteUser(m.id, m.name)}
                          className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded-lg font-bold text-xs transition-colors"
                          title="Remove Member"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
