import { useState } from "react";
import axios from "../../api/axios";
import PublicationEditionForm from "../../components/SelectForm";
import { toast } from "react-hot-toast";

const ENewspaper = () => {
      const [publicationId, setPublicationId] = useState("");
      const [editionId, setEditionId] = useState("");
      const [publishDate, setPublishDate] = useState("");
      const [filesData, setFilesData] = useState([]);
      const [folderPath, setFolderPath] = useState("");
      const [loading, setLoading] = useState(false);
      const [confirmLoading, setConfirmLoading] = useState(false);

      const handleSearch = async () => {
            if (!publicationId || !editionId || !publishDate) {
                  toast.error("Please select all fields");
                  return;
            }

            try {
                  setLoading(true);
                  const res = await axios.get("/news-papers/get-new-files", {
                        params: { publicationId, editionId, date: publishDate },
                  });

                  setFolderPath(res.data.folderPath);
                  setFilesData(res.data.files);
                  toast.success("Files retrieved successfully!");
            } catch (error) {
                  console.error(error);
                  toast.error(error.response?.data?.message || "Failed to fetch files");
            } finally {
                  setLoading(false);
            }
      };

      const handleConfirm = async () => {
            if (!filesData.length) {
                  toast.error("No files to confirm");
                  return;
            }

            try {
                  setConfirmLoading(true);
                  const res = await axios.post("/news-papers/add-files", {}, {
                        params: { publicationId, editionId, date: publishDate }
                  });

                  const { message, totalFiles, skippedEntries } = res.data;

                  toast.success(`${message} (${totalFiles} files uploaded)`);

                  // If there are skipped entries show a toast too (optional)
                  if (skippedEntries && skippedEntries.length > 0) {
                        toast((t) => (
                              <div>
                                    <p className="font-bold">Skipped {skippedEntries.length} duplicates</p>
                                    <button
                                          onClick={() => toast.dismiss(t.id)}
                                          className="mt-2 bg-gray-800 text-white px-3 py-1 rounded"
                                    >
                                          Close
                                    </button>
                              </div>
                        ), { duration: 5000 });
                  }


                  setFilesData([]);
                  setFolderPath("");
                  setPublicationId("");
                  setEditionId("");
                  setPublishDate("");

            } catch (error) {
                  console.error(error);
                  toast.error(error.response?.data?.message || "Failed to confirm files");
            } finally {
                  setConfirmLoading(false);
            }
      };

      return (
            <div className="p-6 space-y-6">
                   <h2 className="text-lg sm:text-xl md:text-2xl px-6 font-bold mt-4 mb-2">📖 Import E-Newspaper</h2>
                  <div className="px-6 flex flex-col items-center gap-4">
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
                        <button
                              onClick={handleSearch}
                              disabled={loading}
                              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                        >
                              {loading ? "Searching..." : "Search"}
                        </button>
                  </div>



                  {/* ✅ Display Retrieved Files */}
                  {filesData.length > 0 && (
                        <div className="mt-8 space-y-4">
                              <h2 className="text-xl font-semibold">Files Found</h2>
                              <p className="text-gray-700"><strong>Folder Path:</strong> {folderPath.replace(/\\/g, "/")}</p>

                              <ul className="border rounded p-4 max-h-80 overflow-y-auto space-y-2">
                                    {filesData.map((file, idx) => (
                                          <li key={idx} className="bg-gray-100 p-2 rounded flex justify-between items-center">
                                                <span className="font-medium">{file}</span>
                                          </li>
                                    ))}
                              </ul>

                              {/* ✅ Confirm Button */}
                              <button
                                    onClick={handleConfirm}
                                    disabled={confirmLoading}
                                    className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                              >
                                    {confirmLoading ? "Confirming..." : "Confirm"}
                              </button>


                        </div>

                  )}
            </div>
      );
};

export default ENewspaper;
