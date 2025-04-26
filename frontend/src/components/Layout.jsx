import { Link, Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div>
      <header className="flex items-center justify-between p-4 shadow-md bg-white">
        <nav className="flex space-x-6">
          <Link to="/search" className="hover:underline">Search</Link>
          
          <div className="relative group">
            <button className="hover:underline">Archive</button>
            <div className="absolute hidden group-hover:block bg-white shadow-md mt-2 rounded">
              <Link to="/archive/e-newspaper" className="block px-4 py-2 hover:bg-gray-100">E-Newspaper</Link>
              <Link to="/archive/e-magazine" className="block px-4 py-2 hover:bg-gray-100">E-Magazine</Link>
            </div>
          </div>

          <Link to="/profile" className="hover:underline">Profile</Link>
        </nav>
      </header>

      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
