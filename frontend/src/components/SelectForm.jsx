import { useState, useEffect } from "react";
import axios from "../api/axios";
import { toast } from "react-hot-toast";

const PublicationEditionForm = ({publications, publicationId, editionId, publishDate, onChange }) => {
  const [editions, setEditions] = useState([]);
  const [loading, setLoading] = useState({editions: false });


  useEffect(() => {
    const fetchEditions = async () => {
      if (!publicationId) {
        setEditions([]);
        return;
      }
      setLoading(prev => ({ ...prev, editions: true }));
      try {
        const response = await axios.get(`/papers/get-edition?publicationId=${publicationId}`);
        if (!response.data?.success) {
          throw new Error('Invalid editions response format');
        }
        setEditions(response.data.editions || []);
      } catch (err) {
        toast.error(`Failed to load editions`);
      } finally {
        setLoading(prev => ({ ...prev, editions: false }));
      }
    };
    fetchEditions();
  }, [publicationId]);

  return (
    <div className="bg-gray-100 font-semibold text-sm md:text-lg p-4 rounded-lg shadow-md w-full max-w-lg">
      {/* Publication Dropdown */}
      <div className="mb-4">
        <label className="block py-2">Publication:</label>
        <select
          className="p-2 border rounded w-full"
          value={publicationId}
          onChange={(e) => onChange({ publicationId: e.target.value, editionId: "", publishDate })}
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
          onChange={(e) => onChange({ publicationId, editionId: e.target.value, publishDate })}
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
          onChange={(e) => onChange({ publicationId, editionId, publishDate: e.target.value })}
        />
      </div>
    </div>
  );
};

export default PublicationEditionForm;