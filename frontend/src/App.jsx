import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Loading from "./components/Loading";
import Search from "./pages/Search";
import ENewspaper from "./pages/Archive/ENewspaper";
import EMagazine from "./pages/Archive/EMagazine";
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
    <Routes>
      {isLoggedIn ? (
        <Route path="/" element={<Layout />}>
          <Route path="search" element={<Search />} />
          <Route path="archive">
            <Route path="e-newspaper" element={<ENewspaper />} />
            <Route path="e-magazine" element={<EMagazine />} />
          </Route>
          <Route path="profile" element={<Profile />} />
        </Route>
      ) : (
        <Route path="*" element={<Login onLoginSuccess={() => setIsLoggedIn(true)} />} />
      )}
    </Routes>
  );
};

export default App;
