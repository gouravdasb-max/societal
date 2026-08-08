import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api.js";
import { disconnectSocket } from "../services/socket.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const login = async (email, password) => {
    disconnectSocket();
    const { data } = await api.post("/auth/login", { email, password });
    if (data.data?.requiresOtp) {
      return { requiresOtp: true, email: data.data.email };
    }
    localStorage.setItem("accessToken", data.data.accessToken);
    setUser(data.data.user);
    return data.data.user;
  };

  const verifyAdminLogin = async (email, otp) => {
    const { data } = await api.post("/auth/verify-login-otp", { email, otp });
    localStorage.setItem("accessToken", data.data.accessToken);
    setUser(data.data.user);
    return data.data.user;
  };

  const register = async (formData) => {
    const { data } = await api.post("/auth/register", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    localStorage.removeItem("accessToken");
    disconnectSocket();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, verifyAdminLogin, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
