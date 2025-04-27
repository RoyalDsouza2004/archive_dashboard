import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Layout from "./components/Layout";
import Loading from "./components/Loading";
import Search from "./pages/Search";
import ENewspaper from "./pages/archive/ENewspaper";
import EMagazine from "./pages/archive/EMagazine";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import axios from "./api/axios";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const res = await axios.get("/auth/check");
      setIsLoggedIn(res.data.authenticated);
    } catch (err) {
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  if (loading) return <Loading />;

  return (
    <>
      <Toaster position="bottom-center" reverseOrder={false} /> 
      <Routes>
        {isLoggedIn ? (
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/search" />} />
            <Route path="search" element={<Search />} />
            <Route path="archive">
              <Route path="e-newspaper" element={<ENewspaper />} />
              <Route path="e-magazine" element={<EMagazine />} />
            </Route>
            <Route path="profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/search" />} />
          </Route>
        ) : (
          <>
            <Route path="/login" element={<Login onLoginSuccess={() => setIsLoggedIn(true)} isLoggedIn={isLoggedIn} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        )}
      </Routes>
    </>
  );
};

export default App;
