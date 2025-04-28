
import { useLocation, useNavigate } from "react-router-dom";

const PDFViewingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { pdfPath, pageNo, pdfName, subEditionName } = location.state || {};

  if (!pdfPath) {
    return <div className="p-8">No PDF path provided.</div>;
  }

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <div className="flex mb-4">
        <button
          onClick={() => navigate(-1)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          🔙 Back to Search
        </button>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-4xl font-bold">
          {subEditionName || "Edition"} - Page {pageNo}
        </h1>
        <a
          href={pdfPath}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 font-bold mt-2 sm:mt-0 "
        >
          Go to - {pdfName}
        </a>
      </div>

      <iframe
        src={pdfPath}
        title="PDF Viewer"
        className="w-full h-[80vh] rounded-lg border"
      />
    </div>
  );
};

export default PDFViewingPage;
