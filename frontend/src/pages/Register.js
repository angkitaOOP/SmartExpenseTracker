import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Toast from "../components/Toast";
import { getPasswordChecks, getPasswordStrength, isPasswordAcceptable } from "../utils/passwordStrength";

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

function Register() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touchedPassword, setTouchedPassword] = useState(false);
  const [toast, setToast] = useState(null); // { message, type }

  const navigate = useNavigate();

  const checks = getPasswordChecks(password);
  const strength = getPasswordStrength(password);
  const passwordIsValid = isPasswordAcceptable(password);

  const showToast = (message, type = "success") => setToast({ message, type });

  const registerUser = async (e) => {

    e.preventDefault();

    if (!passwordIsValid) {
      setTouchedPassword(true);
      showToast("Please choose a stronger password before continuing.", "error");
      return;
    }

    try {

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/users/register`,
        {
          name,
          email,
          password,
        }
      );

      showToast(res.data.message || "Registered successfully!", "success");

      // Clear Input Fields
      setName("");
      setEmail("");
      setPassword("");
      setTouchedPassword(false);

      // Redirect to Login Page after the toast has had time to show
      setTimeout(() => navigate("/login"), 1200);

    } catch (error) {

      const message =
        error.response?.data?.message ||
        "Registration failed. Please try again.";

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

      <div className="register-card">

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
            <i className="bi bi-person-plus-fill" />
          </div>
          <h2>Create your account</h2>
        </div>

        <p className="auth-subtitle">Join Smart Expense Tracker and take control of your money.</p>

        <form autoComplete="off" onSubmit={registerUser}>

          {/* Hidden Fields to reduce browser autofill */}
          <input type="text" name="fakeuser" style={{ display: "none" }} />
          <input type="password" name="fakepassword" style={{ display: "none" }} />

          <div className="auth-field">
            <i className="bi bi-person auth-field__icon" />
            <input
              className="form-control"
              type="text"
              id="register_name"
              name="register_name"
              autoComplete="off"
              placeholder=" "
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <label htmlFor="register_name">Full name</label>
          </div>

          <div className="auth-field">
            <i className="bi bi-envelope auth-field__icon" />
            <input
              className="form-control"
              type="email"
              id="register_email"
              name="register_email"
              autoComplete="off"
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label htmlFor="register_email">Email address</label>
          </div>

          <div className="auth-field">

            <i className="bi bi-lock auth-field__icon" />

            <input
              className="form-control"
              type={showPassword ? "text" : "password"}
              id="register_password"
              name="register_password"
              autoComplete="new-password"
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouchedPassword(true)}
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

            <label htmlFor="register_password">Password</label>

            {password.length > 0 && (
              <div className="pw-strength">
                <div className="pw-strength__track">
                  <div className={`pw-strength__bar ${strength !== "empty" ? `is-active-${strength}` : ""}`} />
                  <div className={`pw-strength__bar ${strength === "medium" || strength === "strong" ? `is-active-${strength}` : ""}`} />
                  <div className={`pw-strength__bar ${strength === "strong" ? "is-active-strong" : ""}`} />
                </div>

                <span className={`pw-strength__label ${strength}`}>
                  {strength === "weak" && "Weak password — try adding numbers, symbols or capital letters"}
                  {strength === "medium" && "Medium strength — good, but could be stronger"}
                  {strength === "strong" && "Strong password ✔"}
                </span>

                <ul className="pw-rules">
                  <li className={checks.length ? "is-met" : ""}>
                    <i className={`bi ${checks.length ? "bi-check-circle-fill" : "bi-circle"}`} />
                    At least 8 characters
                  </li>
                  <li className={checks.hasUpper && checks.hasLower ? "is-met" : ""}>
                    <i className={`bi ${checks.hasUpper && checks.hasLower ? "bi-check-circle-fill" : "bi-circle"}`} />
                    Upper &amp; lower case letters
                  </li>
                  <li className={checks.hasNumber ? "is-met" : ""}>
                    <i className={`bi ${checks.hasNumber ? "bi-check-circle-fill" : "bi-circle"}`} />
                    At least one number
                  </li>
                  <li className={checks.hasSpecial ? "is-met" : ""}>
                    <i className={`bi ${checks.hasSpecial ? "bi-check-circle-fill" : "bi-circle"}`} />
                    At least one symbol (recommended)
                  </li>
                  <li className={checks.notCommon ? "is-met" : ""}>
                    <i className={`bi ${checks.notCommon ? "bi-check-circle-fill" : "bi-circle"}`} />
                    Not a common password (e.g. 123456)
                  </li>
                </ul>
              </div>
            )}

            {touchedPassword && password.length > 0 && !passwordIsValid && (
              <div className="text-danger mt-2" style={{ fontSize: "12.5px", fontWeight: 600 }}>
                This password is too weak to use. Please strengthen it.
              </div>
            )}

          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={password.length > 0 && !passwordIsValid}
          >
            Register <i className="bi bi-arrow-right" />
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

        <p className="auth-terms">
          By registering, you agree to our <a href="#terms">Terms of Service</a>
        </p>

        <div className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </div>

      </div>

    </div>

  );

}

export default Register;