import { useState, useEffect } from "react";
import axios from "axios";

const ImportEMagazine = () => {
  // State management
  const [rows, setRows] = useState([{ id: 1, from: "", to: "", file: null }]);
  const [publications, setPublications] = useState([]);
  const [editions, setEditions] = useState([]);
  const [publicationId, setPublicationId] = useState("");
  const [editionId, setEditionId] = useState("");
  const [publishDate, setPublishDate] = useState("");
  const [loading, setLoading] = useState({
    publications: true,
    editions: false
  });
  const [error, setError] = useState("");

  // Fetch publications on component mount
  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/v1/papers/get-publication', {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 10000
        });

        if (!response.data?.success) {
          throw new Error('Invalid response format');
        }

        setPublications(response.data.publications);
      } catch (err) {
        console.error("Fetch publications error:", {
          message: err.message,
          config: err.config,
          response: err.response?.data
        });
        setError(`Failed to load publications: ${err.message}`);
      } finally {
        setLoading(prev => ({ ...prev, publications: false }));
      }
    };

    fetchPublications();
  }, []);

  // Fetch editions when publication changes
  useEffect(() => {
    const fetchEditions = async () => {
      if (!publicationId) return;

      setLoading(prev => ({ ...prev, editions: true }));
      setEditions([]);
      setEditionId("");

      try {
        const response = await axios.get(`http://localhost:4000/api/v1/papers/get-edition?publicationId=${publicationId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 10000
        });

        if (!response.data?.success) {
          throw new Error('Invalid editions response format');
        }

        setEditions(response.data.editions || []);
        
      } catch (err) {
        console.error("Fetch editions error:", err);
        setError(`Failed to load editions: ${err.message}`);
      } finally {
        setLoading(prev => ({ ...prev, editions: false }));
      }
    };

    fetchEditions();
  }, [publicationId]);


  // Row management
  const addRow = () => {
    setRows([...rows, { id: rows.length + 1, from: "", to: "", file: null }]);
  };

  const removeRow = () => {
    if (rows.length > 1) {
      setRows(rows.slice(0, -1));
    }
  };

  const handleInputChange = (index, field, value) => {
    const updatedRows = rows.map((row, i) =>
      i === index ? { ...row, [field]: value } : row
    );
    setRows(updatedRows);
  };

  // Form submission
  const handleSubmit = async () => {
    try {
      // Validation
      if (!publicationId || !editionId || !publishDate) {
        throw new Error("Please fill all required fields!");
      }

      const invalidRow = rows.find(row => !row.from || !row.to || !row.file);
      if (invalidRow) {
        throw new Error("Please fill all page numbers and select files in all rows!");
      }

      // Prepare form data
      const formData = new FormData();
      formData.append("date", publishDate);
      
      const pages = rows.map(row => ({
        pageNoFrom: parseInt(row.from),
        pageNoTo: parseInt(row.to)
      }));
      formData.append("pages", JSON.stringify(pages));

      rows.forEach(row => {
        formData.append("files", row.file);
      });

      // API call
      const response = await axios.post(
        `http://localhost:4000/api/v1/magazines/add-files?publicationId=${publicationId}&editionId=${editionId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      // Handle response
      alert(response.data.message);
      if (response.data.skippedEntries?.length) {
        alert(`Skipped entries: ${response.data.skippedEntries.join(", ")}`);
      }

      // Reset form
      setPublicationId("");
      setEditionId("");
      setPublishDate("");
      setRows([{ id: 1, from: "", to: "", file: null }]);

    } catch (error) {
      console.error("Submission error:", error);
      alert(error.response?.data?.message || error.message || "Submission failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <h2 className="text-lg sm:text-xl md:text-2xl px-6 font-bold mt-4 mb-2">📖 Import E-Magazine</h2>
      
      <div className="px-6 flex flex-col items-center">
        {/* Publication and Edition Selection */}
        <div className="bg-gray-100 font-semibold text-sm md:text-lg p-4 rounded-lg shadow-md w-full max-w-lg">
          {/* Publication Dropdown */}
          <div className="mb-4">
            <label className="block py-2">Publication:</label>
            <select
              className="p-2 border rounded w-full"
              value={publicationId}
              onChange={(e) => setPublicationId(e.target.value)}
              disabled={loading.publications}
            >
              <option value="">--Select Publication--</option>
              {publications.map((pub) => (
                <option key={pub.Publication_Id} value={pub.Publication_Id}>
                  {pub.Publication_Name}
                </option>
              ))}
            </select>
            {loading.publications && <p className="text-sm text-gray-500 mt-1">Loading publications...</p>}
          </div>

          {/* Edition Dropdown */}
          <div className="mb-4">
            <label className="block py-2">Edition:</label>
            <select
              className="p-2 border rounded w-full"
              value={editionId}
              onChange={(e) => setEditionId(e.target.value)}
              disabled={!publicationId || loading.editions}
            >
              <option value="">--Select Edition--</option>
              {editions.map((edition) => (
                <option key={edition.Edition_Id} value={edition.Edition_Id}>
                  {edition.Edition_Name}
                </option>
              ))}
            </select>
            {loading.editions && <p className="text-sm text-gray-500 mt-1">Loading editions...</p>}
          </div>

          {/* Publish Date */}
          <div className="mb-4">
            <label className="block py-2">Publish Date:</label>
            <input
              type="date"
              className="p-2 border rounded w-full"
              value={publishDate}
              onChange={(e) => setPublishDate(e.target.value)}
            />
          </div>
        </div>

        {/* Page Input Table */}
        <div className="w-full shadow-md mt-6 overflow-hidden">
          <table className="w-full border-collapse border text-xs sm:text-sm md:text-lg border-gray-300">
            <thead>
              <tr className="bg-blue-700 text-white">
                <th className="border font-medium p-2">Sl.No</th>
                <th className="border font-medium p-2">Page From</th>
                <th className="border font-medium p-2">Page To</th>
                <th className="border font-medium p-2">Attach File</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index} className="text-center hover:bg-gray-50">
                  <td className="border p-2">{row.id}</td>
                  <td className="border p-2">
                    <input
                      type="number"
                      className="p-1 border text-center rounded w-full"
                      value={row.from}
                      onChange={(e) => handleInputChange(index, "from", e.target.value)}
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      className="p-1 border text-center rounded w-full"
                      value={row.to}
                      onChange={(e) => handleInputChange(index, "to", e.target.value)}
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="file"
                      className="block w-full text-xs sm:text-sm text-gray-500 file:mr-2 file:py-1 file:px-2 sm:file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      onChange={(e) => handleInputChange(index, "file", e.target.files[0])}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Row Management Buttons */}
        <div className="flex justify-center gap-4 mt-4">
          <button
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            onClick={addRow}
          >
            ➕ Add Row
          </button>
          <button
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            onClick={removeRow}
            disabled={rows.length === 1}
          >
            ➖ Remove Row
          </button>
        </div>

        {/* Status Messages */}
        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        <p className="text-red-500 text-sm text-center mt-4">
          📌 Maximum file upload limit: <b>2GB</b>
        </p>

        {/* Submit Button */}
        <div className="flex justify-center my-6">
          <button
            onClick={handleSubmit}
            className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-8 rounded-md shadow-md transition-colors"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportEMagazine;