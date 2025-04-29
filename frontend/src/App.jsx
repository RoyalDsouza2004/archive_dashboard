import { useEffect, useState, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Loading from "./components/Loading";
import axios from "./api/axios";

const Layout = React.lazy(() => import("./components/Layout"));
const Search = React.lazy(() => import("./pages/Search"));
const ENewspaper = React.lazy(() => import("./pages/archive/ENewspaper"));
const EMagazine = React.lazy(() => import("./pages/archive/EMagazine"));
const Profile = React.lazy(() => import("./pages/Profile"));
const Login = React.lazy(() => import("./pages/Login"));
const PDFViewingPage = React.lazy(() => import("./pages/PDFViewingPage"));

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  const checkAuth = async () => {
    try {
      const res = await axios.get("/auth/check");
      setIsLoggedIn(res.data.authenticated);
      setUserName(res.data.userName);
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
      <Suspense fallback={<Loading />}>
        <Routes>
          {isLoggedIn ? (
            <Route path="/" element={<Layout userName={userName} setIsLoggedIn={setIsLoggedIn} />}>
              <Route index element={<Navigate to="/search" />} />
              <Route path="search" element={<Search />} />
              <Route path="view-pdf" element={<PDFViewingPage />} />
              <Route path="archive">
                <Route path="e-newspaper" element={<ENewspaper />} />
                <Route path="e-magazine" element={<EMagazine />} />
              </Route>
              <Route path="profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/search" />} />
            </Route>
          ) : (
            <>
              <Route path="/login" element={<Login onLoginSuccess={() => setIsLoggedIn(true)} isLoggedIn={isLoggedIn} setUserName={setUserName} />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </>
          )}
        </Routes>
      </Suspense>
    </>
  );
};

export default App;
