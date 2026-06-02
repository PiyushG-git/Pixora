import React, { useState } from "react";
import "../style/form.scss";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import Spinner from "../../shared/components/Spinner";
import { Flame } from "lucide-react";
import { motion } from "framer-motion";

const Login = () => {
  const { loading, handleLogin } = useAuth();
  const [username, setUsername]  = useState("");
  const [password, setPassword]  = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await handleLogin(username, password);
      navigate("/");
    } catch {
      // toast shown inside useAuth — stay on page
    }
  };

  if (loading) {
    return (
      <div className="loading-page">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="auth-page">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        {/* Logo */}
        <div className="auth-logo">
          <Flame size={28} />
          <span>Pixora</span>
        </div>

        {/* Heading */}
        <div className="auth-heading">
          <h1>Welcome back</h1>
          <p>Sign in to your account to continue</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <input
            onInput={(e) => setUsername(e.target.value)}
            type="text"
            name="username"
            id="username"
            placeholder="Username"
            autoComplete="username"
          />
          <input
            onInput={(e) => setPassword(e.target.value)}
            type="password"
            name="password"
            id="password"
            placeholder="Password"
            autoComplete="current-password"
          />
          <button type="submit" className="submit-btn">Sign In</button>
        </form>

        {/* Footer */}
        <p className="auth-footer">
          Don't have an account?{" "}
          <Link to="/register">Create one.</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
