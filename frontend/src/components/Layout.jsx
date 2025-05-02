import {Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const Layout = ({userName , setIsLoggedIn , isAdmin}) => {
  return (
    <div>
      <Navbar userName={userName} setIsLoggedIn={setIsLoggedIn} isAdmin={isAdmin}  />
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
