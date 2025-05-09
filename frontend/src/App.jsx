import { useEffect, useState, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import Loading from "./components/Loading";
import axios from "./api/axios";
import React from "react";
import ProtectedRoute from "./components/ProtectedRoute";

const Layout = React.lazy(() => import("./components/Layout"));
const Search = React.lazy(() => import("./pages/Search"));
const ENewspaper = React.lazy(() => import("./pages/archive/ENewspaper"));
const EMagazine = React.lazy(() => import("./pages/archive/EMagazine"));
const Profile = React.lazy(() => import("./pages/Profile"));
const Login = React.lazy(() => import("./pages/Login"));
const PDFViewingPage = React.lazy(() => import("./pages/PDFViewingPage"));
const AddUserPage = React.lazy(() => import("./pages/AddUser"));
const UpdateUserPage = React.lazy(() => import("./pages/UpdateUser"));

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAuth = async () => {
    try {
      const res = await axios.get("/auth/check");
      setIsLoggedIn(res.data.authenticated);
      setUserName(res.data.userName);
      setIsAdmin(res.data.isAdmin);

      if (res.data.authenticated === false) {
        toast.error(res.data?.message)
      }

    } catch (err) {
      setIsLoggedIn(false);
      err.response?.data?.message && toast.error(err.response?.data?.message)

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
      <Toaster
        position="bottom-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            maxWidth: "500px",
            wordBreak: "break-word",
          },
        }}
      />
      <Suspense fallback={<Loading />}>
        <Routes>
          {isLoggedIn ? (
            <Route
              path="/"
              element={
                <Layout
                  userName={userName}
                  setIsLoggedIn={setIsLoggedIn}
                  isAdmin={isAdmin}
                />
              }
            >
              <Route index element={<Navigate to="/search" />} />
              <Route path="search" element={<Search />} />
              <Route path="view-pdf" element={<PDFViewingPage />} />
              <Route path="archive">
                <Route path="e-newspaper" element={<ENewspaper />} />
                <Route path="e-magazine" element={<EMagazine />} />
              </Route>
              <Route
                path="profile"
                element={
                  <ProtectedRoute isAllowed={isAdmin}>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="profile/add"
                element={
                  <ProtectedRoute isAllowed={isAdmin}>
                    <AddUserPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="profile/update/:userId"
                element={
                  <ProtectedRoute isAllowed={isAdmin}>
                    <UpdateUserPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/search" />} />
            </Route>
          ) : (
            <>
              <Route
                path="/login"
                element={
                  <Login
                    onLoginSuccess={() => setIsLoggedIn(true)}
                    isLoggedIn={isLoggedIn}
                    setUserName={setUserName}
                    setIsAdmin={setIsAdmin}
                  />
                }
              />
              <Route path="*" element={<Navigate to="/login" />} />
            </>
          )}
        </Routes>
      </Suspense>
    </>
  );
};

export default App;
