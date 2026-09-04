import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Register = () => {
  const { register } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    role: "MEMBER",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (selectedRole) => {
    setFormData({ ...formData, role: selectedRole });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await register(formData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Hero */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-brand-950 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-brand-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-brand-200 mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Join LibFlow Network
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold font-display leading-tight tracking-tight text-white mb-4">
              Start Borrowing & Managing Books
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed mb-8">
              Register in seconds to explore the entire digital and physical catalog, track due dates, and reserve titles effortlessly.
            </p>

            <div className="space-y-3.5">
              {[
                { title: "Personalized Library Dashboard", desc: "View your borrowed books, history, and active loans" },
                { title: "No Delay Checkout", desc: "Instant automated transaction issuance with fine trackers" },
                { title: "Campus & Multi-Branch Support", desc: "Designed for universities, colleges, and libraries" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white tracking-wide">{item.title}</h4>
                    <p className="text-[11px] text-slate-300">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 mt-8 pt-6 border-t border-white/10 text-xs text-slate-300">
            Already registered?{" "}
            <Link to="/login" className="font-bold text-brand-300 hover:text-white hover:underline">
              Sign in to your account →
            </Link>
          </div>
        </div>

        {/* Right Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
                Create your account
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Select your account role and fill in your profile details.
              </p>
            </div>

            {/* Account Role Selector Chips */}
            <div className="mb-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleRoleSelect("MEMBER")}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                    formData.role === "MEMBER"
                      ? "border-brand-500 bg-brand-50/70 text-brand-900 ring-2 ring-brand-500/20 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                  }`}
                >
                  <span className="text-xl">🎓</span>
                  <div>
                    <span className="text-xs font-bold block">Library Member</span>
                    <span className="text-[10px] text-slate-500">Borrow & read books</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect("ADMIN")}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                    formData.role === "ADMIN"
                      ? "border-brand-500 bg-brand-50/70 text-brand-900 ring-2 ring-brand-500/20 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                  }`}
                >
                  <span className="text-xl">🛡️</span>
                  <div>
                    <span className="text-xs font-bold block">Administrator</span>
                    <span className="text-[10px] text-slate-500">Full management rights</span>
                  </div>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Vipul Kumar"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@university.edu"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    City / Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Campus Hostel, Block A"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-600 hover:from-brand-700 hover:to-violet-700 text-white font-bold text-sm shadow-md shadow-brand-500/25 hover:shadow-glow transition-all duration-200 active:scale-[0.99] disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
