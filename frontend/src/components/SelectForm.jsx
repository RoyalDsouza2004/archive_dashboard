import React from "react";

const PublicationEditionForm = ({
      publications,
      publicationId,
      setPublicationId,
      loadingPublications,
      editions,
      editionId,
      setEditionId,
      loadingEditions,
      publishDate,
      setPublishDate
}) => {
      return (
            <div className="bg-gray-100 font-semibold text-sm md:text-lg p-4 rounded-lg shadow-md w-full max-w-lg">
                  {/* Publication Dropdown */}
                  <div className="mb-4">
                        <label className="block py-2">Publication:</label>
                        <select
                              className="p-2 border rounded w-full"
                              value={publicationId}
                              onChange={(e) => setPublicationId(e.target.value)}
                              disabled={loadingPublications}
                        >
                              <option value="">--Select Publication--</option>
                              {publications.map((pub) => (
                                    <option key={pub.Publication_Id} value={pub.Publication_Id}>
                                          {pub.Publication_Name}
                                    </option>
                              ))}
                        </select>
                        {loadingPublications && (
                              <p className="text-sm text-gray-500 mt-1">Loading publications...</p>
                        )}
                  </div>

                  {/* Edition Dropdown */}
                  <div className="mb-4">
                        <label className="block py-2">Edition:</label>
                        <select
                              className="p-2 border rounded w-full"
                              value={editionId}
                              onChange={(e) => setEditionId(e.target.value)}
                              disabled={!publicationId || loadingEditions}
                        >
                              <option value="">--Select Edition--</option>
                              {editions.map((edition) => (
                                    <option key={edition.Edition_Id} value={edition.Edition_Id}>
                                          {edition.Edition_Name}
                                    </option>
                              ))}
                        </select>
                        {loadingEditions && (
                              <p className="text-sm text-gray-500 mt-1">Loading editions...</p>
                        )}
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
      );
};

export default PublicationEditionForm;
