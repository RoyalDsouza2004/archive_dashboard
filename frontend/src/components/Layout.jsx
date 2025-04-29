import {Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const Layout = ({userName , setIsLoggedIn}) => {
  return (
    <div>
      <Navbar userName={userName} setIsLoggedIn={setIsLoggedIn} />
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
