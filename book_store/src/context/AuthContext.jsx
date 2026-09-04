import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { toast } from "react-toastify";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser({
          ...parsed,
          id: parsed.id || parsed.userId,
          userId: parsed.userId || parsed.id,
        });
      } catch (e) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await API.post("/auth/login", { email, password });
      const rawData = res.data;
      const userData = {
        ...rawData,
        id: rawData.id || rawData.userId,
        userId: rawData.userId || rawData.id,
      };
      localStorage.setItem("token", userData.token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      toast.success("Logged in successfully!");
      if (userData.role === "ADMIN") navigate("/admin");
      else if (userData.role === "LIBRARIAN") navigate("/admin");
      else navigate("/member");
    } catch (err) {
      toast.error(err.response?.data?.error || "Login failed. Check your credentials.");
    }
  };

  const register = async (data) => {
    try {
      await API.post("/auth/register", data);
      toast.success("Registered successfully! Please login.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.error || "Registration failed");
    }
  };

  const updateCurrentUser = (updatedData) => {
    const newUserData = {
      ...user,
      ...updatedData,
      id: updatedData.id || user?.id,
      userId: updatedData.id || user?.userId,
    };
    localStorage.setItem("user", JSON.stringify(newUserData));
    setUser(newUserData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
    toast.info("Logged out!");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateCurrentUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
