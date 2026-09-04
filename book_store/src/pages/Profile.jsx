import React, { useState, useEffect, useContext, useCallback } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";

const Profile = () => {
  const { user, updateCurrentUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("general"); // 'general' | 'security'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    membershipType: "Standard",
    role: "MEMBER",
    status: "Active",
    registrationDate: "",
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const currentUserId = user?.id || user?.userId;

  const fetchUserProfile = useCallback(async () => {
    if (!currentUserId) return;
    try {
      setLoading(true);
      const res = await API.get(`/users/${currentUserId}`);
      const data = res.data;
      setFormData({
        name: data.name || user?.name || "",
        email: data.email || user?.email || "",
        phone: data.phone || "",
        address: data.address || "",
        membershipType: data.membershipType || "Standard",
        role: data.role || user?.role || "MEMBER",
        status: data.status || "Active",
        registrationDate: data.registrationDate || "",
      });
    } catch (err) {
      // Fallback to local user context data if API fails
      setFormData({
        name: user?.name || "",
        email: user?.email || "",
        phone: "",
        address: "",
        membershipType: "Standard",
        role: user?.role || "MEMBER",
        status: "Active",
        registrationDate: "",
      });
    } finally {
      setLoading(false);
    }
  }, [currentUserId, user]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        membershipType: formData.membershipType,
        role: formData.role,
        status: formData.status,
      };

      const res = await API.put(`/users/${currentUserId}`, payload);
      toast.success("Profile details updated successfully!");

      // Update global context so header reflects new name immediately
      if (updateCurrentUser) {
        updateCurrentUser({
          name: res.data.name || formData.name,
          phone: res.data.phone || formData.phone,
          address: res.data.address || formData.address,
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordData.newPassword) {
      toast.warning("Please enter a new password");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.warning("Password must be at least 6 characters long");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setPasswordSaving(true);
      await API.put(`/users/${currentUserId}`, {
        name: formData.name,
        password: passwordData.newPassword,
      });
      toast.success("Password changed successfully!");
      setPasswordData({ newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error("Failed to update password");
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <span className="text-xs font-semibold">Loading your account profile...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Top Banner & Profile Overview */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-brand-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-slate-900/10 border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-500 via-indigo-600 to-violet-500 text-white flex items-center justify-center text-3xl font-extrabold shadow-lg shadow-brand-500/25 border-2 border-white/20 shrink-0">
              {formData.name ? formData.name.charAt(0).toUpperCase() : "U"}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white">
                  {formData.name}
                </h1>
                <span className="text-emerald-400 text-lg" title="Verified Account">✓</span>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm font-medium">{formData.email}</p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                  formData.role === 'ADMIN'
                    ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/40'
                    : 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/40'
                }`}>
                  {formData.role === 'ADMIN' ? '🛡️ Administrator' : '🎓 Library Member'}
                </span>

                <span className="text-[10px] font-semibold text-slate-300 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/10">
                  LibFlow ID #{currentUserId || "001"}
                </span>

                <span className="text-[10px] font-semibold text-emerald-300 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Active Account
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {formData.role === "ADMIN" ? (
              <Link
                to="/admin"
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all backdrop-blur-sm border border-white/15"
              >
                ← Back to Dashboard
              </Link>
            ) : (
              <Link
                to="/member"
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all backdrop-blur-sm border border-white/15"
              >
                ← Back to Library Portal
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-3 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("general")}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "general"
              ? "border-brand-600 text-brand-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>👤 Personal Details</span>
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "security"
              ? "border-brand-600 text-brand-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>🔒 Security & Password</span>
        </button>
      </div>

      {/* TAB 1: GENERAL PERSONAL DETAILS */}
      {activeTab === "general" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Edit Form */}
          <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
            <h2 className="text-lg font-bold font-display text-slate-900 mb-1">Account Information</h2>
            <p className="text-xs text-slate-500 mb-6">Update your name, contact phone number, and mailing address.</p>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 text-xs font-medium text-slate-900 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Email Address (Registered)
                  </label>
                  <input
                    type="email"
                    name="email"
                    disabled
                    value={formData.email}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-500 outline-none cursor-not-allowed"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Contact library admin to change your registered email address.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+91 9876543210"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 text-xs font-medium text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Membership Tier
                  </label>
                  <select
                    name="membershipType"
                    value={formData.membershipType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 outline-none text-xs font-medium text-slate-900 bg-white"
                  >
                    <option value="Standard">Standard Student</option>
                    <option value="Premium">Premium Scholar</option>
                    <option value="Faculty">Faculty / Research</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Campus / Physical Address
                  </label>
                  <textarea
                    rows={3}
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your residence or department address"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 text-xs font-medium text-slate-900 outline-none resize-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  {saving ? "Saving Changes..." : "Save Profile Details"}
                </button>
              </div>
            </form>
          </div>

          {/* Quick Info Sidebar */}
          <div className="space-y-5">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-sm text-slate-900 font-display">Membership Card</h3>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white space-y-3 relative overflow-hidden">
                <div className="flex justify-between items-center text-[10px] text-brand-300 font-mono">
                  <span>LIBFLOW CARD</span>
                  <span>ID: #{currentUserId || "001"}</span>
                </div>
                <div className="pt-2">
                  <p className="text-sm font-bold tracking-wide">{formData.name}</p>
                  <p className="text-[10px] text-slate-300">{formData.role} • {formData.membershipType}</p>
                </div>
                <div className="pt-1 flex justify-between items-center text-[10px] text-slate-400">
                  <span>VALID THRU: 12/2028</span>
                  <span className="text-emerald-400 font-bold">● ACTIVE</span>
                </div>
              </div>

              <div className="space-y-3 pt-2 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">System Role</span>
                  <span className="font-bold text-slate-800">{formData.role}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Account Status</span>
                  <span className="font-bold text-emerald-600">Active</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Max Loan Limit</span>
                  <span className="font-bold text-slate-800">
                    {formData.role === "ADMIN" ? "Unlimited" : "5 Books at once"}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">Standard Loan Period</span>
                  <span className="font-bold text-slate-800">14 Days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SECURITY & PASSWORD CHANGE */}
      {activeTab === "security" && (
        <div className="max-w-2xl bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
          <h2 className="text-lg font-bold font-display text-slate-900 mb-1">Update Password</h2>
          <p className="text-xs text-slate-500 mb-6">
            Ensure your account is using a long, random password to stay secure.
          </p>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                New Password *
              </label>
              <input
                type="password"
                name="newPassword"
                required
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                placeholder="Enter at least 6 characters"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 text-xs font-medium text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Confirm New Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                required
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Re-enter your new password"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 text-xs font-medium text-slate-900 outline-none"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={passwordSaving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {passwordSaving ? "Updating Password..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;
