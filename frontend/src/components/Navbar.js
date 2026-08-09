import React from "react";

function Navbar() {

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <nav
      className="navbar navbar-expand-lg"
      style={{
        background: "linear-gradient(90deg,#4e54c8,#8f94fb)",
        padding: "15px 30px",
      }}
    >
      <div className="container-fluid">

        <h3 className="text-white fw-bold">
          💰 Smart Expense Tracker
        </h3>

        <button
          className="btn btn-light"
          onClick={logout}
        >
          Logout
        </button>

      </div>
    </nav>
  );
}

export default Navbar;