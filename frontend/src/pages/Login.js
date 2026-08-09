import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Toast from "../components/Toast";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.6 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.4C29.6 35.4 26.9 36 24 36c-5.3 0-9.7-3.4-11.3-8.1l-6.6 5.1C9.4 39.6 16.1 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.6 5.4C40.8 36.2 44 30.6 44 24c0-1.3-.1-2.7-.4-3.5z" />
    </svg>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState(null); // { message, type }

  const navigate = useNavigate();

  const showToast = (message, type = "success") => setToast({ message, type });

  const loginUser = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/users/login`,
        {
          email,
          password,
        }
      );

      // Backend returns 200 with a message even when the credentials
      // are wrong (e.g. "Wrong Password" / "User Not Found"), so we
      // branch on whether a token actually came back.
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userName", res.data.name || "");

        showToast("Login successful! Redirecting to your dashboard...", "success");

        // Clear Fields
        setEmail("");
        setPassword("");

        setTimeout(() => navigate("/dashboard"), 900);
      } else if (res.data.message === "Wrong Password") {
        showToast("Password did not match. Please try again.", "error");
      } else if (res.data.message === "User Not Found") {
        showToast("No account found with this email.", "error");
      } else {
        showToast(res.data.message || "Login failed.", "error");
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Invalid email or password.";
      showToast(message, "error");
      console.log(error);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-page__blob auth-page__blob--1" />
      <div className="auth-page__blob auth-page__blob--2" />
      <div className="auth-page__ring auth-page__ring--1" />
      <div className="auth-page__ring auth-page__ring--2" />
      <div className="auth-page__dots auth-page__dots--1">
        {Array.from({ length: 15 }).map((_, i) => <span key={i} />)}
      </div>
      <div className="auth-page__dots auth-page__dots--2">
        {Array.from({ length: 15 }).map((_, i) => <span key={i} />)}
      </div>

      <div className="login-card">

        <Toast
          message={toast?.message}
          type={toast?.type}
          onClose={() => setToast(null)}
        />

        <Link to="/" className="auth-back-link">
          <i className="bi bi-arrow-left" /> Back to home
        </Link>

        <div className="auth-header">
          <div className="auth-icon-badge">
            <i className="bi bi-shield-lock-fill" />
          </div>
          <h2>Welcome back</h2>
        </div>

        <p className="auth-subtitle">Log in to Smart Expense Tracker to see your dashboard.</p>

        <form autoComplete="off" onSubmit={loginUser}>

          {/* Hidden fields to reduce browser autofill */}
          <input type="text" name="fakeuser" style={{ display: "none" }} />
          <input type="password" name="fakepassword" style={{ display: "none" }} />

          <div className="auth-field">
            <i className="bi bi-envelope auth-field__icon" />
            <input
              className="form-control"
              type="email"
              id="login_email"
              name="login_email"
              autoComplete="off"
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label htmlFor="login_email">Email address</label>
          </div>

          <div className="auth-field">
            <i className="bi bi-lock auth-field__icon" />
            <input
              className="form-control"
              type={showPassword ? "text" : "password"}
              id="login_password"
              name="login_password"
              autoComplete="new-password"
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="auth-field__toggle"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} />
            </button>
            <label htmlFor="login_password">Password</label>
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
          >
            Login <i className="bi bi-arrow-right" />
          </button>

        </form>

        <div className="auth-divider">or</div>

        <button
          type="button"
          className="auth-google-btn"
          onClick={() => showToast("Google sign-in is coming soon!", "error")}
        >
          <GoogleIcon /> Continue with Google
        </button>

        <div className="auth-switch">
          Don't have an account? <Link to="/register">Register</Link>
        </div>

      </div>

    </div>
  );
}

export default Login;