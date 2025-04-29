import axios from "../../api/axios";
import { useState } from "react";
import PublicationEditionForm from "../../components/SelectForm";
import { toast } from "react-hot-toast"

const EMagazine = () => {
      const [rows, setRows] = useState([{ id: 1, from: "", to: "", file: null }]);
      const [publicationId, setPublicationId] = useState("");
      const [editionId, setEditionId] = useState("");
      const [publishDate, setPublishDate] = useState("");
      const [isSubmitting, setIsSubmitting] = useState(false);


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
            setIsSubmitting(true)

            try {
                  if (!publicationId || !editionId || !publishDate) {
                        throw new Error("Please fill all required fields!");
                  }

                  const invalidRow = rows.find(row => !row.from || !row.to || !row.file);
                  if (invalidRow) {
                        throw new Error("Please fill all page numbers and select files in all rows!");
                  }

                  const formData = new FormData();
                  formData.append("publicationId", publicationId);
                  formData.append("editionId", editionId);
                  formData.append("date", publishDate);

                  const pages = rows.map(row => ({
                        pageNoFrom: parseInt(row.from),
                        pageNoTo: parseInt(row.to)
                  }));

                  formData.append("pages", JSON.stringify(pages));

                  rows.forEach(row => {
                        formData.append("files", row.file);
                  });


                  for (const [key, value] of formData.entries()) {
                        console.log(key, value);
                  }

                  const response = await axios.post(
                        `/magazines/add-files?publicationId=${publicationId}&editionId=${editionId}`,
                        formData,
                        {
                              headers: {
                                    "Content-Type": "multipart/form-data"
                              }
                        }
                  );

                  toast.success(response.data.message);

                  if (response.data.skippedEntries?.length) {
                        toast.error(`Skipped entries: ${response.data.skippedEntries.join(", ")}`);
                  }

                  setPublicationId("");
                  setEditionId("");
                  setPublishDate("");
                  setRows([{ id: 1, from: "", to: "", file: null }]);

            } catch (error) {
                  console.error("Submission error:", error);
                  toast.error(error.response?.data?.message || error.message || "Submission failed");
            } finally {
                  setIsSubmitting(false)
            }
      };

      return (
            <div className="min-h-screen bg-gray-50 rounded-xl p-2">
                  <h2 className="text-lg sm:text-xl md:text-2xl px-6 font-bold mt-4 mb-2">📖 Import E-Magazine</h2>

                  <div className="px-6 flex flex-col items-center">
                        <PublicationEditionForm
                              publicationId={publicationId}
                              editionId={editionId}
                              publishDate={publishDate}
                              onChange={({ publicationId, editionId, publishDate }) => {
                                    setPublicationId(publicationId);
                                    setEditionId(editionId);
                                    setPublishDate(publishDate);
                              }}
                        />


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

                        <p className="text-red-500 text-sm text-center mt-4">
                              📌 Maximum file upload limit: <b>2GB</b>
                        </p>

                        {/* Submit Button */}
                        <div className="flex justify-center my-6">
                              <button
                                    onClick={handleSubmit}
                                    className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-8 rounded-md shadow-md transition-colors flex items-center justify-center gap-2"
                                    disabled={isSubmitting} // Disable button while submitting
                              >
                                    {isSubmitting ? (
                                          <>
                                                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                                                </svg>
                                                Submitting...
                                          </>
                                    ) : (
                                          "Submit"
                                    )}
                              </button>
                        </div>
                  </div>
            </div>
      );
};

export default EMagazine;
