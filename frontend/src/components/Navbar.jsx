import { useState, useEffect } from "react";
import { Menu } from "@headlessui/react";
import { ChevronDownIcon, XMarkIcon, Bars3Icon } from "@heroicons/react/24/solid";
import { ArchiveBoxIcon, MagnifyingGlassIcon, ArrowDownTrayIcon, Cog6ToothIcon } from "@heroicons/react/24/solid";
import logo from "../assets/logo.png";

const Navbar = () => {
  const [username, setUsername] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUsername('');
    window.location.href = '/';
  };

  return (
    <nav className="bg-white text-black font-medium px-4 sm:px-4 py-2 shadow-md flex justify-between items-center">
      <div className="flex items-center gap-0 cursor-pointer" onClick={() => window.location.href = '/'}>
        <img src={logo} alt="PDF Library Logo" className="h-10 w-10 sm:h-14 sm:w-14" />
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">PDF Library</h1>
      </div>

      <div className="lg:hidden">
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-blue-600">
          {isMobileMenuOpen ? <XMarkIcon className="h-8 w-8" /> : <Bars3Icon className="h-8 w-8" />}
        </button>
      </div>

      {/* Desktop Menu */}
      <div className="hidden lg:flex items-center gap-2">
        <a href="/archive" className="flex items-center gap-1 text-gray-700 hover:text-blue-600">
          <ArchiveBoxIcon className="h-6 w-6 text-blue-600" /> ARCHIVES
        </a>
        <a href="/search" className="flex items-center gap-1 text-gray-700 hover:text-blue-600">
          <MagnifyingGlassIcon className="h-6 w-6 text-blue-600" /> SEARCH PDF
        </a>

        <Menu as="div" className="relative inline-block text-left">
          <Menu.Button className="flex items-center gap-1 text-gray-700 hover:text-blue-600">
            <ArrowDownTrayIcon className="h-6 w-6 text-blue-600" /> IMPORT <ChevronDownIcon className="w-5 h-5" />
          </Menu.Button>
          <Menu.Items className="absolute w-max bg-blue-50 text-black p-1 rounded-md shadow-md right-0">
            <Menu.Item>
              {({ active }) => (
                <a href="/import-epaper" className={`block px-6 py-2 ${active ? "bg-blue-600 text-white" : ""}`}>E-paper</a>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <a href="/import-emagazine" className={`block px-6 py-2 ${active ? "bg-blue-600 text-white" : ""}`}>E-Magazine</a>
              )}
            </Menu.Item>
          </Menu.Items>
        </Menu>

        <a href="/admin" className="flex items-center gap-1 text-gray-700 hover:text-blue-600">
          <Cog6ToothIcon className="h-6 w-6 text-blue-600" /> ADMIN
        </a>
      </div>

      {/* Login/Logout Button */}
      <div className="hidden lg:flex items-center gap-1">
        {username ? (
          <>
            <span className="text-gray-700">{username}</span>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <a href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">Login</a>
        )}
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {isMobileMenuOpen && (
        <div className="absolute w-full top-16 sm:top-20 right-0 sm:w-3/5 bg-white shadow-md p-4 z-50">
          <a href="/archive" className="block py-2 text-gray-700 hover:text-blue-600">
            <ArchiveBoxIcon className="inline-block h-6 w-6 text-blue-600 mr-2" /> ARCHIVES
          </a>
          <a href="/search" className="block py-2 text-gray-700 hover:text-blue-600">
            <MagnifyingGlassIcon className="inline-block h-6 w-6 text-blue-600 mr-2" /> SEARCH PDF
          </a>

          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center py-2 text-gray-700 hover:text-blue-600 w-full">
              <ArrowDownTrayIcon className="h-6 w-6 text-blue-600 mr-2" /> IMPORT <ChevronDownIcon className="w-5 h-5 ml-auto" />
            </Menu.Button>
            <Menu.Items className="bg-blue-50 text-black p-1 rounded-md shadow-md">
              <Menu.Item>
                {({ active }) => (
                  <a href="/import-epaper" className={`block px-6 py-2 ${active ? "bg-blue-600 text-white" : ""}`}>E-paper</a>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <a href="/import-emagazine" className={`block px-6 py-2 ${active ? "bg-blue-600 text-white" : ""}`}>E-Magazine</a>
                )}
              </Menu.Item>
            </Menu.Items>
          </Menu>

          <a href="/admin" className="block py-2 text-gray-700 hover:text-blue-600">
            <Cog6ToothIcon className="inline-block h-6 w-6 text-blue-600 mr-2" /> ADMIN
          </a>

          {username ? (
            <>
              <span className="block py-2 text-gray-700">{username}</span>
              <button className="w-1/3 mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <a href="/login" className="block w-1/3 mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 text-center py-2 rounded-md">Login</a>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
