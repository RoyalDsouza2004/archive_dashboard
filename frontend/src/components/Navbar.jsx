import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import axios from "../api/axios";
import { toast } from "react-hot-toast";

const Navbar = ({ userName = "Admin", setIsLoggedIn, isAdmin }) => {
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const isActive = (path) => {
    if (path === "/archive") {
      return location.pathname.startsWith("/archive");
    }
    if (path === "/profile") {
      return location.pathname.startsWith("/profile");
    }
    return location.pathname === path;
  };

  const handleLogout = async () => {
    try {
      const res = await axios.post(
        "/user/logout",
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (res.data?.success) {
        toast.success(res.data.message);
        setIsLoggedIn(false);
        localStorage.removeItem("searchInputs");
        localStorage.removeItem("searchResults");
        navigate("/login");
      } else {
        toast.error("Logout failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <header className="flex items-center justify-between px-8 py-4 shadow-md bg-white sticky top-0 z-50 gap-2.5">
      <Link to="/" className="flex items-center gap-2" onClick={() => setIsDropdownOpen(false)}>
        <img src={logo} alt="PDF Library Logo" className="h-10 w-10 sm:h-14 sm:w-14" />
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">PDF Library</h1>
      </Link>

      <nav className="flex items-center space-x-4 sm:space-x-8 relative">
        <NavItem to="/search" isActive={isActive("/search")} onClick={() => setIsDropdownOpen(false)}>
          Search
        </NavItem>

        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className={`px-4 py-2 rounded-md ${
              isActive("/archive") ? "bg-blue-100 text-blue-700" : "text-gray-800"
            } hover:bg-blue-100 transition`}
          >
            Archive
          </button>

          {isDropdownOpen && (
            <div className="absolute -right-20 mt-4 w-40 bg-white rounded-md shadow-md z-10">
              <Link
                to="/archive/e-newspaper"
                onClick={() => setIsDropdownOpen(false)}
                className="block px-4 py-2 hover:bg-gray-100 text-gray-700"
              >
                E-Newspaper
              </Link>
              <Link
                to="/archive/e-magazine"
                onClick={() => setIsDropdownOpen(false)}
                className="block px-4 py-2 hover:bg-gray-100 text-gray-700"
              >
                E-Magazine
              </Link>
            </div>
          )}
        </div>

        {isAdmin == 1 && (
          <NavItem to="/profile" isActive={isActive("/profile")} onClick={() => setIsDropdownOpen(false)}>
            Admin
          </NavItem>
        )}
      </nav>

      <div className="flex flex-col items-start space-y-1">
        <div className="text-gray-800 font-medium">Welcome, {userName}</div>
        <button
          onClick={handleLogout}
          className="px-3 py-1 rounded-md bg-red-500 text-white hover:bg-red-600 transition text-sm"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

const NavItem = ({ to, isActive, children, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`px-4 py-2 rounded-md ${isActive ? "bg-blue-100 text-blue-700" : "text-gray-800"} hover:bg-blue-100 transition`}
  >
    {children}
  </Link>
);

export default Navbar;