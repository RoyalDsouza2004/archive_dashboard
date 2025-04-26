import { useState } from "react";
import axios from "axios";

const Search = () => {
  const [unit, setUnit] = useState("Manipal");
  const [publication, setPublication] = useState("Udayavani");
  const [publishDate, setPublishDate] = useState("");
  const [mainPages, setMainPages] = useState([]);
  const [sudinaPages, setSudinaPages] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const units = ["Manipal", "Bangalore", "Hubballi", "Kalaburgi", "Mumbai", "Davanagere"];
  const publications = ["Udayavani", "Taranga", "Roopatara", "Tushara", "Tunturu"];

  const fetchPageData = async () => {
    if (!publishDate) {
      alert("Please select a publish date!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/search", {
        unit,
        publication,
        publishDate,
      });

      setMainPages(response.data.mainPages);
      setSudinaPages(response.data.sudinaPages);
      setShowResults(true);
    } catch (error) {
      console.error("Error fetching archive data:", error);
      alert("Failed to fetch data. Please try again.");
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-6 text-start ">Search</h2>

      {/* Form Section */}
      <div className="bg-gray-100 text-sm md:text-lg p-4 sm:p-6 rounded-md shadow-md max-w-lg font-semibold mx-auto">
        <label className="block">Unit:</label>
        <select className="w-full p-2 border rounded" value={unit} onChange={(e) => setUnit(e.target.value)} >
          {units.map((u) => (
            <option key={u}>{u}</option>
          ))}
        </select>

        <label className="block mt-4">Publication:</label>
        <select className="w-full p-2 border rounded" value={publication} onChange={(e) => setPublication(e.target.value)}>
          {publications.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>

        <label className="block mt-4">Publish Date:</label>
        <input type="date" className="w-full p-2 border rounded" value={publishDate} onChange={(e) => setPublishDate(e.target.value)} />

        <button onClick={fetchPageData} className="mt-6 w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"> Submit </button>
      </div>

      {/* Results Section */}
      {showResults && (
        <>
          <div className="flex flex-col sm:flex-row text-center items-center gap-2 sm:gap-4 mx-4 my-6">
            <span className="bg-blue-500 w-full text-white px-4 py-2 rounded-md text-xs sm:text-sm">{publication}</span>
            <span className="bg-blue-500 w-full text-white px-4 py-2 rounded-md text-xs sm:text-sm">{unit}</span>
            <span className="bg-blue-500 w-full text-white px-4 py-2 rounded-md text-xs sm:text-sm">{publishDate}</span>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4 text-center">📖 Main Edition</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {mainPages.map((page) => (
                <button key={page} className="border p-3 text-blue-500 font-semibold rounded-md shadow-md hover:bg-blue-50"> Page {page}</button>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4 text-center">📖 Sudina Belthangadi Bantwal</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sudinaPages.map((page) => (
                <button key={page} className="border p-3 text-blue-500 font-semibold rounded-md shadow-md hover:bg-blue-50">
                Page {page}</button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Search;