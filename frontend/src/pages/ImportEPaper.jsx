import { useState } from "react";
import axios from "axios";

const ImportEPaper = () => {
  const [rows, setRows] = useState([{ id: 1, from: "", to: "", file: null }]);
  const [publication, setPublication] = useState("Udayavani");
  const [unit, setUnit] = useState("");
  const [publishDate, setPublishDate] = useState("");

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

  const handleSubmit = async () => {
    if (!unit || !publishDate) {
      alert("Please fill all required fields!");
      return;
    }

    const formData = new FormData();
    formData.append("publication", publication);
    formData.append("unit", unit);
    formData.append("publishDate", publishDate);

    rows.forEach((row, index) => {
      formData.append(`rows[${index}][from]`, row.from);
      formData.append(`rows[${index}][to]`, row.to);
      formData.append(`rows[${index}][file]`, row.file);
    });

    try {
      const response = await axios.post("http://localhost:5000/import-epaper", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(response.data.message);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error submitting form. Please try again.");
    }
  };

  return (
    <>
      <h2 className="text-lg sm:text-xl md:text-2xl px-6 font-bold mt-4 mb-2">📰 Import E-Paper</h2>
      <div className="px-6 flex flex-col items-center">
        {/* Form Section */}
        <div className="bg-gray-100 font-semibold text-sm md:text-lg p-4 rounded-lg shadow-md w-full max-w-lg">
          <label className="block py-2">Publication:</label>
          <select className="p-2 border rounded w-full" value={publication} disabled>
            <option>Udayavani</option>
          </select>

          <label className="block py-2">Unit:</label>
          <select className="p-2 border rounded w-full" value={unit} onChange={(e) => setUnit(e.target.value)}>
            <option value="">--Select--</option>
            <option>Manipal</option>
            <option>Bangalore</option>
            <option>Hubballi</option>
            <option>Kalaburgi</option>
            <option>Mumbai</option>
            <option>Davanagere</option>
          </select>

          <label className="block py-2">Publish Date:</label>
          <input type="date" className="p-2 border rounded w-full" value={publishDate} onChange={(e) => setPublishDate(e.target.value)} />
        </div>

        {/* Table Section */}
        <div className="w-full shadow-md mt-6 overflow-hidden">
          <table className="w-full border-collapse border text-xs sm:text-sm md:text-lg border-gray-300">
            <thead>
              <tr className="bg-blue-700 text-white">
                <th className="border font-medium p-1 sm:p-2">Sl.No</th>
                <th className="border font-medium p-1 sm:p-2">Page From</th>
                <th className="border font-medium p-1 sm:p-2">Page To</th>
                <th className="border font-medium p-1 sm:p-2">Attach File</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index} className="text-center">
                  <td className="border p-1 sm:p-2">{row.id}</td>
                  <td className="border p-1 sm:p-2">
                    <input
                      type="number"
                      className="p-1 border text-center rounded w-full"
                      value={row.from}
                      onChange={(e) => handleInputChange(index, "from", e.target.value)}
                    />
                  </td>
                  <td className="border p-1 sm:p-2">
                    <input
                      type="number"
                      className="p-1 border text-center rounded w-full"
                      value={row.to}
                      onChange={(e) => handleInputChange(index, "to", e.target.value)}
                    />
                  </td>
                  <td className="border p-1 sm:p-2">
                    <div className="flex justify-center">
                      <label className="relative cursor-pointer">
                        <span className="sr-only">Choose file</span>
                        <input
                          type="file"
                          className="block w-full text-xs sm:text-sm text-gray-500 file:mr-2 file:py-1 file:px-2 sm:file:px-4 file:rounded file:border-0 file:text-xs sm:file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          onChange={(e) => handleInputChange(index, "file", e.target.files[0])}
                        />
                      </label>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center text-xs sm:text-base gap-4 mt-4">
          <button className="bg-green-600 text-white px-4 py-2 rounded-md" onClick={addRow}>➕ Add</button>
          <button className="bg-red-600 text-white px-4 py-2 rounded-md" onClick={removeRow} disabled={rows.length === 1}>➖ Remove</button>
        </div>

        <p className="text-red-500 text-xs sm:text-base text-center mt-2">📌 Maximum file upload limit: <b>2GB</b>.</p>
        <div className="flex justify-center mb-2">
          <button onClick={handleSubmit} className="bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs sm:text-base md:text-lg px-20 py-2 rounded-md shadow-md mt-6">Submit</button>
        </div>
      </div>
    </>
  );
};

export default ImportEPaper;
