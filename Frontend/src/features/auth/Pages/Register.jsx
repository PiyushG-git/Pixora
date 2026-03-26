import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import "../style/form.scss";
import Spinner from "../../shared/components/Spinner";

const Register = () => {
  const { loading, handleRegister } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await handleRegister(username, email, password);
      navigate("/");
    } catch {
      // toast already shown inside useAuth, stay on page
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
        <h1>Create account</h1>
        <form onSubmit={handleSubmit}>
          <input
            onChange={(e) => setUsername(e.target.value)}
            type="text"
            name="username"
            id="username"
            placeholder="Username"
            autoComplete="username"
          />
          <input
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            name="email"
            id="email"
            placeholder="Email address"
            autoComplete="email"
          />
          <input
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            name="password"
            id="password"
            placeholder="Password"
            autoComplete="new-password"
          />
          <button type="submit" className="button primary-button">Create Account</button>
        </form>
        <p>
          Already have an account?{" "}
          <Link to="/login" className="toggleAuthForm">Log in.</Link>
        </p>
      </div>
    </main>
  );
};

export default Register;
