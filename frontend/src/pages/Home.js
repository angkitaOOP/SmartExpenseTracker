import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}

const STATS = [
  { icon: "bi-trophy-fill", value: "10K+", label: "Happy users" },
  { icon: "bi-shield-check", value: "100%", label: "Secure & Private" },
  { icon: "bi-gift-fill", value: "Free", label: "Forever" },
  { icon: "bi-star-fill", value: "4.9/5", label: "User rating" },
];

const FEATURES = [
  {
    icon: "bi-graph-up-arrow",
    title: "Track income & expenses",
    text: "Log every transaction with a title, category and date, and see your balance update instantly.",
  },
  {
    icon: "bi-bar-chart-line-fill",
    title: "Category insights",
    text: "A live chart breaks down exactly where your money is going, category by category.",
  },
  {
    icon: "bi-exclamation-triangle-fill",
    title: "Budget warnings",
    text: "Set a budget per category and get an instant alert the moment you overspend.",
  },
  {
    icon: "bi-search",
    title: "Search & filter",
    text: "Find any transaction in seconds by title, or filter the whole list by income or expense.",
  },
  {
    icon: "bi-bell-fill",
    title: "Bill reminders",
    text: "Get timely reminders for electricity, internet, rent and other bills so you never miss a due date.",
  },
  {
    icon: "bi-piggy-bank-fill",
    title: "Savings goals",
    text: "Set goals for your dreams and track your progress step by step.",
  },
  {
    icon: "bi-file-earmark-arrow-down-fill",
    title: "Export reports",
    text: "Download beautiful PDF or Excel reports of your income, expenses and budgets.",
  },
  {
    icon: "bi-shield-lock-fill",
    title: "Secure & private",
    text: "Your data is encrypted and 100% private. We never share your information.",
  },
];

const STEPS = [
  {
    icon: "bi-wallet2",
    title: "Add your transactions",
    text: "Add income or expense in just a few taps.",
  },
  {
    icon: "bi-pie-chart-fill",
    title: "Set your budget",
    text: "Create a monthly budget for each category.",
  },
  {
    icon: "bi-graph-up-arrow",
    title: "Track & save more",
    text: "See charts, insights and save more every month.",
  },
];

const TESTIMONIALS = [
  {
    name: "Arafat Hossain",
    role: "DIU Student",
    quote:
      "I reduced my monthly food expenses by 20% after tracking every transaction with this app.",
  },
  {
    name: "Nusrat Jahan",
    role: "Teacher",
    quote:
      "Simple, clean and very helpful. Budget warnings save me from overspending every time.",
  },
  {
    name: "Rifat Ahmed",
    role: "Freelancer",
    quote:
      "The reports feature is awesome! I download and analyze my expenses every month.",
  },
];

function initials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function HeroIllustration() {
  return (
    <svg viewBox="0 0 900 620" className="home-hero__illustration-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="walletGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#6d5cff" />
        </linearGradient>
        <linearGradient id="coinGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="coinGradGreen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>

      {/* soft background circles */}
      <circle cx="150" cy="120" r="160" fill="#818cf8" opacity="0.35" />
      <circle cx="760" cy="480" r="200" fill="#4ade80" opacity="0.25" />
      <circle cx="700" cy="90" r="90" fill="#f472b6" opacity="0.2" />

      {/* wallet */}
      <g transform="translate(280,220)">
        <rect x="0" y="40" width="320" height="200" rx="28" fill="url(#walletGrad)" />
        <rect x="0" y="40" width="320" height="60" rx="28" fill="#4c3a9e" opacity="0.6" />
        <rect x="230" y="110" width="110" height="70" rx="16" fill="#1e1b3a" />
        <circle cx="300" cy="145" r="16" fill="#fde68a" />
      </g>

      {/* bar chart card */}
      <g transform="translate(80,320)">
        <rect x="0" y="0" width="220" height="180" rx="20" fill="#ffffff" opacity="0.12" />
        <rect x="24" y="110" width="26" height="50" rx="6" fill="#a78bfa" />
        <rect x="66" y="80" width="26" height="80" rx="6" fill="#4ade80" />
        <rect x="108" y="50" width="26" height="110" rx="6" fill="#f472b6" />
        <rect x="150" y="95" width="26" height="65" rx="6" fill="#fbbf24" />
      </g>

      {/* floating coins */}
      <circle cx="620" cy="260" r="36" fill="url(#coinGrad)" />
      <text x="620" y="270" textAnchor="middle" fontSize="30" fontWeight="700" fill="#92400e">৳</text>

      <circle cx="700" cy="360" r="26" fill="url(#coinGradGreen)" />
      <text x="700" y="368" textAnchor="middle" fontSize="22" fontWeight="700" fill="#14532d">৳</text>

      <circle cx="560" cy="150" r="20" fill="url(#coinGrad)" />
      <text x="560" y="157" textAnchor="middle" fontSize="17" fontWeight="700" fill="#92400e">৳</text>

      {/* upward arrow */}
      <path
        d="M 420 470 L 500 400 L 580 440 L 700 320"
        stroke="#4ade80"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M 660 320 L 700 320 L 700 360" stroke="#4ade80" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DashboardPreview({ compact }) {
  return (
    <div className={`preview ${compact ? "preview--compact" : ""}`}>
      <div className="preview__sidebar">
        <div className="preview__brand">
          <span className="preview__brand-dot">💰</span> Smart Expense
        </div>
        <div className="preview__nav">
          <span className="preview__nav-item preview__nav-item--active">
            <i className="bi bi-grid-fill" /> Dashboard
          </span>
          <span className="preview__nav-item">
            <i className="bi bi-arrow-left-right" /> Transactions
          </span>
          <span className="preview__nav-item">
            <i className="bi bi-tags-fill" /> Categories
          </span>
          <span className="preview__nav-item">
            <i className="bi bi-piggy-bank-fill" /> Budgets
          </span>
          <span className="preview__nav-item">
            <i className="bi bi-file-earmark-bar-graph-fill" /> Reports
          </span>
          <span className="preview__nav-item">
            <i className="bi bi-flag-fill" /> Goals
          </span>
          <span className="preview__nav-item">
            <i className="bi bi-gear-fill" /> Settings
          </span>
          {compact && (
            <span className="preview__nav-item preview__nav-item--logout">
              <i className="bi bi-box-arrow-left" /> Logout
            </span>
          )}
        </div>
      </div>

      <div className="preview__main">
        <div className="preview__topbar">
          <strong>Dashboard</strong>
          <i className="bi bi-search" />
        </div>

        <div className="preview__stats">
          <div className="preview__stat">
            <span>Total Balance</span>
            <strong>৳ 25,430</strong>
          </div>
          <div className="preview__stat preview__stat--green">
            <span>Income</span>
            <strong>৳ 40,000</strong>
          </div>
          <div className="preview__stat preview__stat--red">
            <span>Expenses</span>
            <strong>৳ 14,570</strong>
          </div>
          <div className="preview__stat">
            <span>Savings</span>
            <strong>৳ 10,860</strong>
          </div>
        </div>

        <div className="preview__row">
          <div className="preview__card preview__card--chart">
            <div className="preview__card-head">
              <span>Expense Overview</span>
              <em>This Month</em>
            </div>
            <svg viewBox="0 0 220 70" className="preview__sparkline">
              <polyline
                points="0,55 25,40 50,45 75,20 100,32 125,15 150,25 175,10 200,18 220,8"
                fill="none"
                stroke="#7c8cff"
                strokeWidth="2.5"
              />
            </svg>
          </div>
          <div className="preview__card preview__card--donut">
            <div className="preview__card-head">
              <span>Top Categories</span>
            </div>
            <div className="preview__donut-row">
              <div className="preview__donut" />
              <ul>
                <li><i className="dot" style={{ background: "#7c8cff" }} />Food<b>35%</b></li>
                <li><i className="dot" style={{ background: "#2dd4bf" }} />Transport<b>25%</b></li>
                <li><i className="dot" style={{ background: "#f5a524" }} />Shopping<b>20%</b></li>
                <li><i className="dot" style={{ background: "#f43f5e" }} />Bills<b>10%</b></li>
                <li><i className="dot" style={{ background: "#a78bfa" }} />Others<b>10%</b></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="preview__row">
          <div className="preview__card">
            <div className="preview__card-head">
              <span>Recent Transactions</span>
            </div>
            <ul className="preview__tx-list">
              <li>
                <span className="preview__tx-icon">🍔</span>
                <span className="preview__tx-body">
                  <b>Lunch</b>
                  <em>Food · May 24, 2026</em>
                </span>
                <span className="preview__tx-amount preview__tx-amount--neg">-250</span>
              </li>
              <li>
                <span className="preview__tx-icon">🚌</span>
                <span className="preview__tx-body">
                  <b>Bus Fare</b>
                  <em>Transport · May 24, 2026</em>
                </span>
                <span className="preview__tx-amount preview__tx-amount--neg">-60</span>
              </li>
              <li>
                <span className="preview__tx-icon">💵</span>
                <span className="preview__tx-body">
                  <b>Salary</b>
                  <em>Income · May 24, 2026</em>
                </span>
                <span className="preview__tx-amount preview__tx-amount--pos">+40,000</span>
              </li>
            </ul>
          </div>
          <div className="preview__card">
            <div className="preview__card-head">
              <span>Budget Overview</span>
            </div>
            <div className="preview__budget-list">
              <div className="preview__budget-item">
                <span>Food <b>৳2,500 / ৳4,000</b></span>
                <div className="preview__bar"><i style={{ width: "62%", background: "#2dd4bf" }} /></div>
              </div>
              <div className="preview__budget-item">
                <span>Transport <b>৳1,200 / ৳2,000</b></span>
                <div className="preview__bar"><i style={{ width: "60%", background: "#f5a524" }} /></div>
              </div>
              <div className="preview__budget-item">
                <span>Shopping <b>৳1,000 / ৳3,000</b></span>
                <div className="preview__bar"><i style={{ width: "33%", background: "#f43f5e" }} /></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Home() {
  const [featuresRef, featuresVisible] = useReveal();
  const [stepsRef, stepsVisible] = useReveal();
  const [previewRef, previewVisible] = useReveal();
  const [testimonialsRef, testimonialsVisible] = useReveal();
  const [pricingRef, pricingVisible] = useReveal();

  return (
    <div className="home-page">
      <div className="home-blob home-blob--1" />
      <div className="home-blob home-blob--2" />

      <nav className="home-navbar">
        <div className="home-navbar__brand">
          <span className="home-navbar__logo">💰</span>
          Smart Expense Tracker
        </div>
        <div className="home-navbar__actions">
          <Link to="/login" className="nav-auth-btn nav-auth-btn--login">
            Login
          </Link>
          <Link to="/register" className="nav-auth-btn nav-auth-btn--register">
            Get Started
          </Link>
        </div>
      </nav>

      <header className="home-hero">
        <div className="home-hero__illustration" aria-hidden="true">
          <HeroIllustration />
        </div>
        <div className="home-hero__text">
          <h1>
            Know exactly where <span>every taka</span> goes.
          </h1>
          <p>
            Smart Expense Tracker helps you log income and expenses, watch
            your balance in real time, and get warned before you blow your
            budget — all from one simple dashboard.
          </p>
          <div className="home-hero__actions">
            <Link to="/register" className="btn-solid-pill btn-solid-pill--lg">
              Create free account
            </Link>
            <Link to="/login" className="btn-outline-pill btn-outline-pill--lg">
              I already have an account
            </Link>
          </div>
        </div>

        <div className="home-hero__preview">
          <DashboardPreview compact />
        </div>
      </header>

      <section className="home-stats-section">
        <div className="home-stats-grid">
          {STATS.map((s) => (
            <div className="home-stat-card" key={s.label}>
              <div className="home-stat-card__icon">
                <i className={`bi ${s.icon}`} />
              </div>
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={`home-features reveal ${featuresVisible ? "is-visible" : ""}`} ref={featuresRef}>
        <h2>Everything you need to stay on budget</h2>
        <div className="home-features__grid">
          {FEATURES.map((f) => (
            <div className="home-feature-card" key={f.title}>
              <div className="home-feature-card__icon">
                <i className={`bi ${f.icon}`} />
              </div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={`home-steps reveal ${stepsVisible ? "is-visible" : ""}`} ref={stepsRef}>
        <h2>How it works</h2>
        <div className="home-steps__row">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.title}>
              <div className="home-step">
                <div className="home-step__badge">{i + 1}</div>
                <div className="home-step__icon">
                  <i className={`bi ${s.icon}`} />
                </div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
              {i < STEPS.length - 1 && <div className="home-step__line" />}
            </React.Fragment>
          ))}
        </div>
      </section>

      <section className={`home-preview-section reveal ${previewVisible ? "is-visible" : ""}`} ref={previewRef}>
        <h2>Your financial dashboard at a glance</h2>
        <DashboardPreview />
      </section>

      <section className={`home-testimonials reveal ${testimonialsVisible ? "is-visible" : ""}`} ref={testimonialsRef}>
        <h2>Loved by students and professionals</h2>
        <div className="home-testimonials__grid">
          {TESTIMONIALS.map((t) => (
            <div className="home-testimonial-card" key={t.name}>
              <div className="home-testimonial-card__head">
                <span className="home-testimonial-card__avatar">{initials(t.name)}</span>
                <div>
                  <strong>{t.name}</strong>
                  <span>{t.role}</span>
                </div>
              </div>
              <p>"{t.quote}"</p>
              <div className="home-testimonial-card__stars">
                {"★★★★★".split("").map((star, i) => (
                  <span key={i}>{star}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={`home-pricing reveal ${pricingVisible ? "is-visible" : ""}`} ref={pricingRef}>
        <h2>Simple pricing for everyone</h2>
        <div className="home-pricing__grid">
          <div className="home-pricing-card">
            <span className="home-pricing-card__plan">Free</span>
            <div className="home-pricing-card__price">
              ৳0<small>/month</small>
            </div>
            <ul>
              <li><i className="bi bi-check-lg" /> Unlimited transactions</li>
              <li><i className="bi bi-check-lg" /> Budget & expense tracking</li>
              <li><i className="bi bi-check-lg" /> Basic reports</li>
              <li><i className="bi bi-check-lg" /> 100% free forever</li>
            </ul>
            <Link to="/register" className="btn-solid-pill">
              Get Started
            </Link>
          </div>

          <div className="home-pricing-card home-pricing-card--highlight">
            <span className="home-pricing-card__plan">Pro <em>(Coming Soon)</em></span>
            <div className="home-pricing-card__price">
              ৳199<small>/month</small>
            </div>
            <ul>
              <li><i className="bi bi-check-lg" /> Advanced analytics</li>
              <li><i className="bi bi-check-lg" /> Bill reminders</li>
              <li><i className="bi bi-check-lg" /> Export to PDF / Excel</li>
              <li><i className="bi bi-check-lg" /> Priority support</li>
            </ul>
            <button className="btn-outline-pill btn-outline-pill--dark" disabled>
              Learn More
            </button>
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <div className="home-footer__grid">
          <div className="home-footer__brand">
            <div className="home-navbar__brand">
              <span className="home-navbar__logo">💰</span>
              Smart Expense Tracker
            </div>
            <p>Track today. Save tomorrow.</p>
          </div>

          <div className="home-footer__col">
            <h4>Product</h4>
            <span>Features</span>
            <span>How it works</span>
            <span>Pricing</span>
          </div>

          <div className="home-footer__col">
            <h4>Company</h4>
            <span>About us</span>
            <span>Blog</span>
            <span>Contact</span>
          </div>

          <div className="home-footer__col">
            <h4>Legal</h4>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>

          <div className="home-footer__col">
            <h4>Follow us</h4>
            <div className="home-footer__socials">
              <i className="bi bi-facebook" />
              <i className="bi bi-twitter" />
              <i className="bi bi-linkedin" />
              <i className="bi bi-github" />
            </div>
          </div>
        </div>
        <div className="home-footer__bottom">
          © 2026 Smart Expense Tracker. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default Home;