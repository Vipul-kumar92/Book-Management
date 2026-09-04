import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";
import { toast } from "react-toastify";

const ManageBooks = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [viewMode, setViewMode] = useState("cards"); // 'cards' | 'table'

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    isbn: "",
    publisher: "",
    publicationYear: "",
    language: "English",
    edition: "1st Edition",
    price: "",
    quantity: "5",
    shelfNumber: "",
    description: "",
    categoryName: "",
    authorName: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [booksRes, catRes, authRes] = await Promise.allSettled([
        API.get("/books"),
        API.get("/categories"),
        API.get("/authors"),
      ]);

      if (booksRes.status === "fulfilled") setBooks(booksRes.value.data);
      if (catRes.status === "fulfilled") setCategories(catRes.value.data);
      if (authRes.status === "fulfilled") setAuthors(authRes.value.data);
    } catch (err) {
      toast.error("Failed to load library catalog data");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openModal = (book = null) => {
    if (book) {
      setEditingId(book.id);
      setFormData({
        title: book.title || "",
        isbn: book.isbn || "",
        publisher: book.publisher || "",
        publicationYear: book.publicationYear || "",
        language: book.language || "English",
        edition: book.edition || "1st Edition",
        price: book.price !== undefined ? book.price : "",
        quantity: book.quantity || 5,
        shelfNumber: book.shelfNumber || "",
        description: book.description || "",
        categoryName: book.category?.name || "",
        authorName: book.author?.name || "",
      });
    } else {
      setEditingId(null);
      setFormData({
        title: "",
        isbn: "",
        publisher: "",
        publicationYear: new Date().getFullYear(),
        language: "English",
        edition: "1st Edition",
        price: "",
        quantity: "5",
        shelfNumber: "",
        description: "",
        categoryName: "",
        authorName: "",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        isbn: formData.isbn,
        publisher: formData.publisher,
        publicationYear: formData.publicationYear ? parseInt(formData.publicationYear, 10) : null,
        language: formData.language,
        edition: formData.edition,
        price: formData.price ? parseFloat(formData.price) : 0,
        quantity: formData.quantity ? parseInt(formData.quantity, 10) : 1,
        shelfNumber: formData.shelfNumber,
        description: formData.description,
        category: formData.categoryName?.trim() ? { name: formData.categoryName.trim() } : null,
        author: formData.authorName?.trim() ? { name: formData.authorName.trim() } : null,
      };

      if (editingId) {
        await API.put(`/books/${editingId}`, payload);
        toast.success("Book updated successfully!");
      } else {
        await API.post("/books", payload);
        toast.success("New book added to library!");
      }
      closeModal();
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data || "Failed to save book");
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      try {
        await API.delete(`/books/${id}`);
        toast.success("Book removed from catalog");
        loadData();
      } catch (err) {
        toast.error("Failed to delete book. Check if active loans exist.");
      }
    }
  };

  // Filter books
  const filteredBooks = books.filter((b) => {
    const matchesSearch =
      b.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.isbn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "ALL" ||
      b.category?.id?.toString() === selectedCategory.toString() ||
      b.category?.name === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-7 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => navigate(-1)}
            className="w-11 h-11 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:bg-slate-50 hover:border-slate-300 text-slate-700 hover:text-brand-600 flex items-center justify-center transition-all duration-150 active:scale-95 group shrink-0"
            title="Go Back"
            aria-label="Go Back"
          >
            <svg
              className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform duration-150"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tracking-tight">
              Books Inventory & Catalog
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Manage your physical and digital book catalog, allocate shelf numbers, and update stocks.
            </p>
          </div>
        </div>

        <button
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md shadow-brand-500/20 hover:shadow-glow transition-all duration-200 active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add New Book</span>
        </button>
      </div>

      {/* Filter & View Control Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by title, author, ISBN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:border-brand-500 outline-none transition-colors"
          >
            <option value="ALL">All Categories ({books.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* View Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/80">
            <button
              onClick={() => setViewMode("cards")}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "cards" ? "bg-white text-brand-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
              title="Grid View"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "table" ? "bg-white text-brand-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
              title="Table View"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Books Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <span className="text-xs font-medium">Loading books inventory...</span>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
          <span className="text-4xl block mb-3">📖</span>
          <h3 className="text-base font-bold text-slate-800">No books found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No titles match your current search or category filter. Try clearing filters or add a new book.
          </p>
        </div>
      ) : viewMode === "cards" ? (
        /* Grid Card View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBooks.map((book) => {
            const availPct = book.quantity > 0 ? (book.availableQuantity / book.quantity) * 100 : 0;
            return (
              <div
                key={book.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 overflow-hidden flex flex-col justify-between"
              >
                {/* Book Header / Card Top */}
                <div className="p-5 pb-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200/60">
                      {book.category?.name || "General"}
                    </span>
                    <span className="text-sm font-extrabold text-slate-900">
                      ₹{Number(book.price || 0).toFixed(2)}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 line-clamp-2 leading-snug mb-1 font-display">
                    {book.title}
                  </h3>

                  <p className="text-xs font-medium text-slate-500 mb-3">
                    by <span className="text-slate-800 font-semibold">{book.author?.name || "Unknown Author"}</span>
                  </p>

                  <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                    {book.description || "No description provided for this catalog entry."}
                  </p>

                  {/* Metadata Chips */}
                  <div className="flex flex-wrap gap-1.5 text-[10px] text-slate-500">
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-mono">
                      ISBN: {book.isbn}
                    </span>
                    {book.shelfNumber && (
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold">
                        📍 {book.shelfNumber}
                      </span>
                    )}
                    {book.publicationYear && (
                      <span className="px-2 py-0.5 rounded bg-slate-100">
                        {book.publicationYear}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stock bar & Actions */}
                <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold text-slate-700">
                        {book.availableQuantity} / {book.quantity} copies
                      </span>
                      <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                        book.availableQuantity > 0 ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                      }`}>
                        {book.availableQuantity > 0 ? "Available" : "Checked Out"}
                      </span>
                    </div>
                    <div className="w-28 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          availPct > 50 ? "bg-emerald-500" : availPct > 0 ? "bg-amber-500" : "bg-rose-500"
                        }`}
                        style={{ width: `${availPct}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => openModal(book)}
                      className="p-2 rounded-xl text-slate-600 hover:text-brand-600 hover:bg-white transition-colors"
                      title="Edit Book"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(book.id, book.title)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Book"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                  <th className="py-3.5 pl-6">Book Title</th>
                  <th className="py-3.5 px-4">Author</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">ISBN</th>
                  <th className="py-3.5 px-4">Shelf</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 pl-6 font-bold text-slate-900">{book.title}</td>
                    <td className="py-3.5 px-4 text-slate-600">{book.author?.name || "-"}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {book.category?.name || "General"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{book.isbn}</td>
                    <td className="py-3.5 px-4 text-slate-600">{book.shelfNumber || "-"}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        book.availableQuantity > 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                      }`}>
                        {book.availableQuantity} / {book.quantity}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ₹{Number(book.price || 0).toFixed(2)}
                    </td>
                    <td className="py-3.5 pr-6 text-right space-x-2">
                      <button
                        onClick={() => openModal(book)}
                        className="text-brand-600 hover:text-brand-800 font-bold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(book.id, book.title)}
                        className="text-rose-600 hover:text-rose-800 font-bold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Book Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[88vh] flex flex-col border border-slate-200 overflow-hidden">
            {/* Fixed Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <div>
                <h2 className="text-xl font-bold font-display text-slate-900">
                  {editingId ? "Edit Book Details" : "Add Book to Catalog"}
                </h2>
                <p className="text-xs text-slate-500">Enter publication and inventory details</p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="w-9 h-9 rounded-full bg-white hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors shadow-sm"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-hidden">
              <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-grow custom-modal-scrollbar pr-3.5 sm:pr-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Book Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g. Clean Architecture"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 text-xs font-medium text-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      ISBN *
                    </label>
                    <input
                      type="text"
                      name="isbn"
                      required
                      value={formData.isbn}
                      onChange={handleChange}
                      placeholder="978-0134494166"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 text-xs font-medium text-slate-900 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Category / Genre *
                    </label>
                    <input
                      type="text"
                      list="category-suggestions"
                      name="categoryName"
                      required
                      value={formData.categoryName}
                      onChange={handleChange}
                      placeholder="Type or select category (e.g. Computer Science)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 text-xs font-medium text-slate-900 outline-none"
                    />
                    <datalist id="category-suggestions">
                      {categories.map((c) => (
                        <option key={c.id} value={c.name} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Author Name *
                    </label>
                    <input
                      type="text"
                      list="author-suggestions"
                      name="authorName"
                      required
                      value={formData.authorName}
                      onChange={handleChange}
                      placeholder="Type or select author (e.g. Robert C. Martin)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 text-xs font-medium text-slate-900 outline-none"
                    />
                    <datalist id="author-suggestions">
                      {authors.map((a) => (
                        <option key={a.id} value={a.name} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Shelf Location
                    </label>
                    <input
                      type="text"
                      name="shelfNumber"
                      value={formData.shelfNumber}
                      onChange={handleChange}
                      placeholder="e.g. CS-B202"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 text-xs font-medium text-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="price"
                      required
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="499.00"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 text-xs font-medium text-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Quantity / Stock *
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      required
                      value={formData.quantity}
                      onChange={handleChange}
                      placeholder="10"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 text-xs font-medium text-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Publisher
                    </label>
                    <input
                      type="text"
                      name="publisher"
                      value={formData.publisher}
                      onChange={handleChange}
                      placeholder="O'Reilly Media"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 outline-none text-xs font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Edition
                    </label>
                    <input
                      type="text"
                      name="edition"
                      value={formData.edition}
                      onChange={handleChange}
                      placeholder="2nd Edition"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 outline-none text-xs font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Summary of the book content, prerequisites, or topics..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 outline-none text-xs font-medium text-slate-900"
                  ></textarea>
                </div>
              </div>

              {/* Fixed Footer Buttons */}
              <div className="p-4 sm:px-6 bg-slate-50/80 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all active:scale-95"
                >
                  {editingId ? "Update Book" : "Save to Catalog"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBooks;
