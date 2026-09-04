import React, { useEffect, useState, useContext, useCallback } from "react";
import API from "../../api";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";

const MemberDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("loans"); // 'loans' | 'browse'
  const [transactions, setTransactions] = useState([]);
  const [availableBooks, setAvailableBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [borrowingId, setBorrowingId] = useState(null);
  const [returningId, setReturningId] = useState(null);

  const currentUserId = user?.id || user?.userId;

  const loadMemberData = useCallback(async () => {
    try {
      setLoading(true);
      const [txRes, booksRes, catRes] = await Promise.allSettled([
        currentUserId ? API.get(`/transactions/member/${currentUserId}`) : Promise.resolve({ data: [] }),
        API.get("/books"),
        API.get("/categories"),
      ]);

      if (txRes.status === "fulfilled") setTransactions(txRes.value.data || []);
      if (booksRes.status === "fulfilled") setAvailableBooks(booksRes.value.data || []);
      if (catRes.status === "fulfilled") setCategories(catRes.value.data || []);
    } catch (err) {
      console.error("Failed to fetch member dashboard data", err);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    loadMemberData();
  }, [loadMemberData]);

  const handleBorrowBook = async (book) => {
    if (book.availableQuantity <= 0) {
      toast.warning("This book is currently checked out by others.");
      return;
    }

    try {
      setBorrowingId(book.id);
      await API.post("/transactions/issue", {
        memberId: currentUserId,
        bookId: book.id,
        daysToIssue: 14,
      });
      toast.success(`Successfully borrowed "${book.title}"! Due in 14 days.`);
      loadMemberData();
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data || "Failed to borrow book");
    } finally {
      setBorrowingId(null);
    }
  };

  const handleReturnBook = async (txId, bookTitle) => {
    try {
      setReturningId(txId);
      await API.put(`/transactions/return/${txId}`);
      toast.success(`Returned "${bookTitle}" successfully!`);
      loadMemberData();
    } catch (err) {
      toast.error("Failed to return book");
    } finally {
      setReturningId(null);
    }
  };

  // Stats
  const activeLoans = transactions.filter((t) => t.status === "ISSUED");
  const returnedLoans = transactions.filter((t) => t.status === "RETURNED");
  const totalFine = transactions.reduce((acc, t) => acc + (t.fineAmount || 0), 0);

  // Filter books in catalog
  const filteredCatalog = availableBooks.filter((b) => {
    const matchesSearch =
      b.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.isbn?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "ALL" ||
      b.category?.id?.toString() === selectedCategory.toString() ||
      b.category?.name === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <span className="text-xs font-semibold">Loading your library dashboard...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Member Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-brand-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-slate-900/10 border border-slate-800 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Active Student Membership • LibFlow ID #{user?.id || "001"}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-white">
            Hello, {user?.name} 📚
          </h1>
          <p className="text-slate-300 text-sm max-w-xl">
            Browse our university library catalog, borrow books with 1 click, and keep track of your active loans and due dates.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab(activeTab === "browse" ? "loans" : "browse")}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-brand-500/25 transition-all duration-200 active:scale-95"
          >
            <span>{activeTab === "browse" ? "📋 View My Loans" : "🔍 Browse Library"}</span>
          </button>
        </div>
      </div>

      {/* Member Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Currently Borrowed</span>
            <p className="text-3xl font-extrabold font-display text-indigo-600 mt-1">
              {activeLoans.length}
            </p>
            <span className="text-[11px] text-slate-400">Active books in hand</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold">
            📖
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Returned Titles</span>
            <p className="text-3xl font-extrabold font-display text-emerald-600 mt-1">
              {returnedLoans.length}
            </p>
            <span className="text-[11px] text-slate-400">Past reading history</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
            ✅
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Outstanding Fines</span>
            <p className="text-3xl font-extrabold font-display text-slate-900 mt-1">
              ₹{Number(totalFine || 0).toFixed(2)}
            </p>
            <span className="text-[11px] text-slate-400">Late return penalties</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold">
            💵
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("loans")}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all ${
            activeTab === "loans"
              ? "border-brand-600 text-brand-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          My Borrowed Books ({transactions.length})
        </button>
        <button
          onClick={() => setActiveTab("browse")}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all ${
            activeTab === "browse"
              ? "border-brand-600 text-brand-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Explore & Borrow Books ({availableBooks.length})
        </button>
      </div>

      {/* TAB 1: MY BORROWED BOOKS */}
      {activeTab === "loans" && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold font-display text-slate-900">Your Borrowing History</h2>
              <p className="text-xs text-slate-500">Track loan status and return books on time to avoid fines</p>
            </div>
            <button
              onClick={() => setActiveTab("browse")}
              className="text-xs font-bold text-brand-600 hover:text-brand-800 hover:underline"
            >
              + Borrow more books
            </button>
          </div>

          {transactions.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <span className="text-4xl block mb-3">📚</span>
              <h3 className="text-base font-bold text-slate-700">No books borrowed yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
                Explore the library catalog to find books on computer science, literature, algorithms, and more.
              </p>
              <button
                onClick={() => setActiveTab("browse")}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20"
              >
                Browse Books Catalog
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                    <th className="py-3.5 pl-6">Book Title</th>
                    <th className="py-3.5 px-4">Author</th>
                    <th className="py-3.5 px-4">Issue Date</th>
                    <th className="py-3.5 px-4">Due Date</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Fine</th>
                    <th className="py-3.5 pr-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 pl-6 font-bold text-slate-900">{tx.book?.title}</td>
                      <td className="py-4 px-4 text-slate-600">{tx.book?.author?.name || "-"}</td>
                      <td className="py-4 px-4 text-slate-500">{tx.issueDate}</td>
                      <td className="py-4 px-4 font-semibold text-slate-800">{tx.dueDate}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            tx.status === "RETURNED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : tx.status === "ISSUED"
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-900">
                        ₹{Number(tx.fineAmount || 0).toFixed(2)}
                      </td>
                      <td className="py-4 pr-6 text-right">
                        {tx.status === "ISSUED" ? (
                          <button
                            onClick={() => handleReturnBook(tx.id, tx.book?.title)}
                            disabled={returningId === tx.id}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-brand-600 text-white font-bold text-xs transition-colors shadow-sm active:scale-95 disabled:opacity-50"
                          >
                            {returningId === tx.id ? "Returning..." : "Return Book"}
                          </button>
                        ) : (
                          <span className="text-[11px] font-semibold text-emerald-600">
                            ✓ Returned
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
      )}

      {/* TAB 2: EXPLORE & BORROW BOOKS */}
      {activeTab === "browse" && (
        <div className="space-y-6">
          {/* Search bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search by title, author, ISBN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 outline-none focus:border-brand-500"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Catalog grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCatalog.map((book) => (
              <div
                key={book.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200/60">
                      {book.category?.name || "General"}
                    </span>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                      book.availableQuantity > 0 ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                    }`}>
                      {book.availableQuantity > 0 ? `${book.availableQuantity} In Stock` : "Out of Stock"}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 line-clamp-2 mb-1 font-display">
                    {book.title}
                  </h3>

                  <p className="text-xs font-medium text-slate-500 mb-3">
                    by <span className="text-slate-800 font-semibold">{book.author?.name || "Unknown Author"}</span>
                  </p>

                  <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                    {book.description || "Comprehensive library catalog edition."}
                  </p>

                  <div className="flex flex-wrap gap-1.5 text-[10px] text-slate-500 mb-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-mono">ISBN: {book.isbn}</span>
                    {book.shelfNumber && (
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold">
                        📍 {book.shelfNumber}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-extrabold text-slate-900">
                    ₹{Number(book.price || 0).toFixed(2)}
                  </span>

                  <button
                    onClick={() => handleBorrowBook(book)}
                    disabled={book.availableQuantity <= 0 || borrowingId === book.id}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {borrowingId === book.id ? "Issuing..." : book.availableQuantity > 0 ? "Borrow Book" : "Unavailable"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberDashboard;
