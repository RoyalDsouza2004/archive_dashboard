import { useState } from "react";
import Login from "./pages/Login";

const Home = () => {
  return (
    <div className="p-10 text-2xl">
      ✅ Welcome to the Home Page!
    </div>
  );
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  return isLoggedIn ? <Home /> : <Login onLoginSuccess={handleLoginSuccess} />;
};

export default App;
