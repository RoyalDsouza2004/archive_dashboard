import { useState } from 'react';
import axios from '../api/axios';
import PublicationEditionForm from '../components/SelectForm';
import { Link } from 'react-router-dom';

export default function Search() {
  const [publicationId, setPublicationId] = useState('');
  const [editionId, setEditionId] = useState('');
  const [publishDate, setPublishDate] = useState('');
  const [searchResults, setSearchResults] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/papers/search', {
        params: {
          publicationId,
          editionId,
          date: publishDate,
        },
      });
      setSearchResults(data.logs || {});
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="mb-6">
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
          className="bg-blue-600 text-white px-6 py-3 rounded-md mt-4 hover:bg-blue-700 focus:outline-none"
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      <div>
        {Object.keys(searchResults).length === 0 && !loading && (
          <p className="text-gray-500">No results found.</p>
        )}

        {Object.entries(searchResults).map(([subEditionName, pages]) => (
          <div key={subEditionName} className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">{subEditionName}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {pages.map((page, index) => (
                <Link
                  key={index}
                  to={page.Path.replaceAll('\\', '/')}
                  className="group bg-white p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200"
                >
                  <div className="flex flex-col items-center justify-center">
                    <p className="font-semibold text-lg text-gray-800">Page {page.Page}</p>
                    <p className="text-sm text-gray-500 ">{page.PDFName}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
