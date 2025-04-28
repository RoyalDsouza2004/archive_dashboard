import {Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const Layout = ({userName}) => {
  return (
    <div>
      <Navbar userName={userName}  />
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
