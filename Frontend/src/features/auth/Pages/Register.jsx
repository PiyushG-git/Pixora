import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import "../style/form.scss";
import Spinner from "../../shared/components/Spinner";
import { Flame, ImagePlus } from "lucide-react";
import { motion } from "framer-motion";
import { useRef } from "react";

const Register = () => {
  const { loading, handleRegister } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio]           = useState("");
  const [preview, setPreview]   = useState(null);
  const profileImageRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("bio", bio);
    
    if (profileImageRef.current?.files?.[0]) {
        formData.append("profileImage", profileImageRef.current.files[0]);
    }

    try {
      await handleRegister(formData);
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
          <h1>Create account</h1>
          <p>Join Pixora and start sharing</p>
        </div>

        {/* Form */}
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
          <textarea
            onChange={(e) => setBio(e.target.value)}
            name="bio"
            id="bio"
            placeholder="Short bio (optional)"
            rows={2}
            style={{
                width: '100%',
                background: 'var(--bg-base)',
                border: '1.5px solid var(--border)',
                borderRadius: '0.75rem',
                padding: '0.875rem 1.125rem',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                fontSize: '0.95rem',
                outline: 'none',
                resize: 'vertical'
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem' }}>
              <label htmlFor="profileImage" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                  <ImagePlus size={20} />
                  <span style={{ fontSize: '0.875rem' }}>{preview ? 'Change Profile Pic' : 'Upload Profile Pic'}</span>
              </label>
              <input
                ref={profileImageRef}
                hidden
                type="file"
                name="profileImage"
                id="profileImage"
                accept="image/*"
                onChange={handleFileChange}
              />
              {preview && (
                  <img src={preview} alt="preview" style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', objectFit: 'cover' }} />
              )}
          </div>
          <button type="submit" className="submit-btn" style={{ marginTop: '0.5rem' }}>Create Account</button>
        </form>

        {/* Footer */}
        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login">Log in.</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
