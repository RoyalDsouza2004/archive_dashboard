import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ isAllowed, children }) => {
  if (!isAllowed) {
    return <Navigate to="/search" replace />;
  }
  return children;
};

export default ProtectedRoute;