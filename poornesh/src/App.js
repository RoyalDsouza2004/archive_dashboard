import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Archive from "./pages/Archive";
import Search from "./pages/Search"
import Admin from "./pages/Admin";
import ImportEMagazine from "./pages/ImportEMagazine";
import ImportEPaper from "./pages/ImportEPaper";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/archive" element={<Archive />} />
        <Route path="/search" element={<Search />} />
        <Route path="/import-emagazine" element={<ImportEMagazine />} />
        <Route path="/import-epaper" element={<ImportEPaper />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;