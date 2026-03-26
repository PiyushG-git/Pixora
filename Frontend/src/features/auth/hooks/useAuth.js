import { useContext, useEffect } from "react";
import { AuthContext } from "../auth.context"
import { login, register, getMe, logout } from "../services/auth.api";
import toast from "react-hot-toast";

export const useAuth = () => {
  const context = useContext(AuthContext);
  const { user, setUser, loading, setLoading, initialized, setInitialized } = context;

  // On first load, silently restore session from existing cookie
  useEffect(() => {
    async function restoreSession() {
      try {
        const response = await getMe();
        setUser(response.user);
      } catch {
        // No valid session — stay as null, redirect handled by ProtectedRoute
        setUser(null);
      } finally {
        setInitialized(true);
      }
    }
    if (!initialized) {
      restoreSession();
    }
  }, []);

  const handleLogin = async (username, password) => {
    setLoading(true);
    try {
      const response = await login(username, password);
      setUser(response.user);
      toast.success("Welcome back!");
    } catch (err) {
      const msg = err?.response?.data?.message || "Login failed. Please try again.";
      toast.error(msg);
      throw err; // re-throw so the page stays on /login
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (username, email, password) => {
    setLoading(true);
    try {
      const response = await register(username, email, password);
      setUser(response.user);
      toast.success("Account created successfully!");
    } catch (err) {
      const msg = err?.response?.data?.message || "Registration failed. Please try again.";
      toast.error(msg);
      throw err; // re-throw so the page stays on /register
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      toast.success("Logged out.");
    } catch {
      toast.error("Logout failed. Please try again.");
    }
  };

  return {
    user,
    loading,
    initialized,
    handleLogin,
    handleRegister,
    handleLogout,
  };
};
