import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from "../assets/logo.png";

const Navbar = ({userName = "Admin"}) => {
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const isActive = (path) => {
    if (path === '/archive') {
      return location.pathname.startsWith('/archive');
    }
    return location.pathname === path;
  };

  return (
    <header className="flex items-center justify-between px-8 py-4 shadow-md bg-white sticky top-0 z-50">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2">
        <img src={logo} alt="PDF Library Logo" className="h-10 w-10 sm:h-14 sm:w-14" />
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">PDF Library</h1>
      </Link>

      {/* Navigation */}
      <nav className="flex items-center space-x-4 sm:space-x-8 relative">
        <NavItem to="/search" isActive={isActive('/search')}>
          Search
        </NavItem>

        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className={`px-4 py-2 rounded-md ${isActive('/archive') ? 'bg-blue-100 text-blue-700' : 'text-gray-800'} hover:bg-blue-100 transition`}
          >
            Archive
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-md z-10">
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

        <NavItem to="/profile" isActive={isActive('/profile')}>
          Admin
        </NavItem>
      </nav>
      <div>Welcome, {userName}</div>
    </header>
  );
};

const NavItem = ({ to, isActive, children }) => (
  <Link
    to={to}
    className={`px-4 py-2 rounded-md ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-800'} hover:bg-blue-100 transition`}
  >
    {children}
  </Link>
);

export default Navbar;
