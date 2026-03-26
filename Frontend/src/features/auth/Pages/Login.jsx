import React, { useState } from "react";
import "../style/form.scss";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import Spinner from "../../shared/components/Spinner";

const Login = () => {
  const { loading, handleLogin } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await handleLogin(username, password);
      navigate("/");
    } catch {
      // toast already shown inside useAuth, just stay on the page
    }
  };

  if (loading) {
    return (
      <main className="loading-page">
        <Spinner />
      </main>
    );
  }

  return (
    <main>
      <div className="form-container">
        <h1>Welcome back</h1>
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
          <button type="submit" className="button primary-button">Login</button>
        </form>
        <p>
          Don't have an account?{" "}
          <Link to="/register" className="toggleAuthForm">Create one.</Link>
        </p>
      </div>
    </main>
  );
};

export default Login;
