import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import toast from "react-hot-toast";

const UpdateUser = () => {
      const { userId } = useParams();
      const navigate = useNavigate();
      const [user, setUser] = useState(null);
      const [loading, setLoading] = useState(true);
      const [publications, setPublications] = useState([]);
      const [editionsMap, setEditionsMap] = useState({});
      const [newPermissions, setNewPermissions] = useState([]);

      useEffect(() => {
            const fetchUser = async () => {
                  try {
                        const res = await axios.get(`/user/${userId}`);
                        setUser(res.data.user);

                        // Preload editions for existing permissions
                        const uniquePublicationIds = [...new Set(res.data.user.permissions.map(p => p.publicationId))];
                        uniquePublicationIds.forEach(id => fetchEditions(id));
                  } catch (err) {
                        toast.error("Failed to load user data");
                        navigate("/profile");
                  } finally {
                        setLoading(false);
                  }
            };

            const fetchPublications = async () => {
                  try {
                        const res = await axios.get("/papers/get-publication");
                        if (!res.data?.success) throw new Error("Invalid publication data");
                        setPublications(res.data.publications);
                  } catch (err) {
                        toast.error("Failed to load publications");
                  }
            };

            fetchUser();
            fetchPublications();
      }, [userId, navigate]);

      const fetchEditions = async (publicationId) => {
            try {
                  const res = await axios.get(`/papers/get-edition?publicationId=${publicationId}`);
                  if (!res.data?.success) throw new Error("Invalid edition data");
                  setEditionsMap((prev) => ({ ...prev, [publicationId]: res.data.editions }));
            } catch (err) {
                  toast.error("Failed to load editions");
            }
      };

      const handlePermissionChange = (index, field, value, isExisting = false) => {
            if (isExisting) {
                  const updated = [...user.permissions];
                  updated[index][field] = value;

                  if (field === "publicationId") {
                        updated[index]["editionId"] = "";
                        fetchEditions(value);
                  }

                  setUser({ ...user, permissions: updated });
            } else {
                  const updated = [...newPermissions];
                  updated[index][field] = value;

                  if (field === "publicationId") {
                        updated[index]["editionId"] = "";
                        fetchEditions(value);
                  }

                  setNewPermissions(updated);
            }
      };

      const handleAddPermissionRow = () => {
            setNewPermissions([...newPermissions, { publicationId: "", editionId: "", permission: "" }]);
      };

      const handleRemovePermissionRow = (index) => {
            const updated = newPermissions.filter((_, i) => i !== index);
            setNewPermissions(updated);
      };

      const handleCheckboxChange = (field) => {
            setUser({ ...user, [field]: !user[field] });
      };

      const handleDeletePermission = async (publicationId, editionId) => {
            try {
                  const res = await axios.delete(`/user/${userId}/permission`, {
                        data: { publicationId, editionId },
                  });
                  setUser((prev) => ({
                        ...prev,
                        permissions: prev.permissions.filter(
                              (perm) =>
                                    !(perm.publicationId === publicationId && perm.editionId === editionId)
                        ),
                  }));

                  if (res.data.success) {
                        toast.success(res.data.message);
                  }
            } catch (err) {
                  toast.error("Failed to delete permission");
            }
      };

      const handleSubmit = async (e) => {
            e.preventDefault();
            try {
                  const cleanedPermissions = [
                        ...user.permissions.map((perm) => ({
                              publicationId: perm.publicationId,
                              editionId: perm.editionId,
                              permission: perm.permission,
                        })),
                        ...newPermissions,
                  ];

                  await axios.put(`/user/${userId}`, {
                        permissions: cleanedPermissions,
                        isAdmin: user.isAdmin,
                        isActive: user.isActive,
                  });

                  toast.success("User updated successfully!");
                  navigate("/profile");
            } catch (err) {
                  toast.error("Update failed");
            }
      };

      if (loading || !user) return <div className="text-center p-4">Loading...</div>;

      return (
            <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-8 mt-6">
                  <h2 className="text-2xl font-bold text-center mb-6">Update User: {user.userName}</h2>
                  <div className="flex mb-4 absolute top-32 left-16">
                        <button
                              onClick={() => navigate(-1)}
                              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                              🔙 Back to Profile
                        </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex justify-center">
                              <input
                                    type="email"
                                    value={user.emailId}
                                    disabled
                                    className="w-3/4 border border-gray-300 p-2 rounded-md bg-gray-100"
                              />
                        </div>

                        <div className="flex justify-center items-center gap-4">
                              <label className="flex items-center">
                                    <input
                                          type="checkbox"
                                          checked={user.isAdmin}
                                          onChange={() => handleCheckboxChange("isAdmin")}
                                          className="mr-2"
                                    />
                                    <span className="font-medium">Is Admin</span>
                              </label>

                              <label className="flex items-center">
                                    <input
                                          type="checkbox"
                                          checked={user.isActive}
                                          onChange={() => handleCheckboxChange("isActive")}
                                          className="mr-2"
                                    />
                                    <span className="font-medium">Is Active</span>
                              </label>
                        </div>

                        <div>
                              <h4 className="text-lg font-bold mb-2">User Permissions</h4>
                              <div className="overflow-x-auto">
                                    <table className="w-full border border-gray-300 text-sm">
                                          <thead className="bg-blue-600 text-white text-center">
                                                <tr>
                                                      <th className="border px-3 py-2">Publication</th>
                                                      <th className="border px-3 py-2">Edition</th>
                                                      <th className="border px-3 py-2">Permission</th>
                                                      <th className="border px-3 py-2">Action</th>
                                                </tr>
                                          </thead>
                                          <tbody>
                                                {user.permissions.map((perm, index) => (
                                                      <tr key={`existing-${index}`} className="bg-gray-100 text-center">
                                                            <td className="border px-3 py-2">
                                                                  {publications.find(p => p.Publication_Id === perm.publicationId)?.Publication_Name || perm.publicationId}
                                                            </td>
                                                            <td className="border px-3 py-2">
                                                                  {
                                                                        editionsMap[perm.publicationId]?.find(e => e.Edition_Id === perm.editionId)?.Edition_Name || perm.editionId
                                                                  }
                                                            </td>
                                                            <td className="border px-3 py-2">
                                                                  <select
                                                                        value={perm.permission}
                                                                        onChange={(e) => handlePermissionChange(index, "permission", e.target.value, true)}
                                                                        className="w-full border border-gray-300 p-2 rounded"
                                                                  >
                                                                        <option value="">-- Select Permission --</option>
                                                                        <option value="r">Read</option>
                                                                        <option value="w">Write</option>
                                                                        <option value="rw">Read/Write</option>
                                                                  </select>
                                                            </td>
                                                            <td className="border px-3 py-2">
                                                                  <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                              handleDeletePermission(perm.publicationId, perm.editionId)
                                                                        }
                                                                        className="text-red-600 hover:text-red-800"
                                                                  >
                                                                        🗑️
                                                                  </button>
                                                            </td>
                                                      </tr>
                                                ))}

                                                {newPermissions.map((perm, index) => (
                                                      <tr key={`new-${index}`} className="bg-white text-center">
                                                            <td className="border px-3 py-2">
                                                                  <select
                                                                        value={perm.publicationId}
                                                                        onChange={(e) =>
                                                                              handlePermissionChange(index, "publicationId", e.target.value)
                                                                        }
                                                                        className="w-full border border-gray-300 p-2 rounded"
                                                                  >
                                                                        <option value="">-- Select Publication --</option>
                                                                        {publications.map((pub) => (
                                                                              <option key={pub.Publication_Id} value={pub.Publication_Id}>
                                                                                    {pub.Publication_Name}
                                                                              </option>
                                                                        ))}
                                                                  </select>
                                                            </td>
                                                            <td className="border px-3 py-2">
                                                                  <select
                                                                        value={perm.editionId}
                                                                        onChange={(e) =>
                                                                              handlePermissionChange(index, "editionId", e.target.value)
                                                                        }
                                                                        className="w-full border border-gray-300 p-2 rounded"
                                                                        disabled={!perm.publicationId}
                                                                  >
                                                                        <option value="">-- Select Edition --</option>
                                                                        {(editionsMap[perm.publicationId] || []).map((ed) => (
                                                                              <option key={ed.Edition_Id} value={ed.Edition_Id}>
                                                                                    {ed.Edition_Name}
                                                                              </option>
                                                                        ))}
                                                                  </select>
                                                            </td>
                                                            <td className="border px-3 py-2">
                                                                  <select
                                                                        value={perm.permission}
                                                                        onChange={(e) =>
                                                                              handlePermissionChange(index, "permission", e.target.value)
                                                                        }
                                                                        className="w-full border border-gray-300 p-2 rounded"
                                                                  >
                                                                        <option value="">-- Select Permission --</option>
                                                                        <option value="r">Read</option>
                                                                        <option value="w">Write</option>
                                                                        <option value="rw">Read/Write</option>
                                                                  </select>
                                                            </td>
                                                            <td className="border px-3 py-2">
                                                                  <button
                                                                        type="button"
                                                                        onClick={() => handleRemovePermissionRow(index)}
                                                                        className="text-red-600 hover:text-red-800"
                                                                  >
                                                                        🗑️
                                                                  </button>
                                                            </td>
                                                      </tr>
                                                ))}
                                          </tbody>
                                    </table>
                              </div>

                              <div className="text-center mt-4">
                                    <button
                                          type="button"
                                          onClick={handleAddPermissionRow}
                                          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
                                    >
                                          ➕ Add Permission Row
                                    </button>
                              </div>
                        </div>

                        <div className="text-center mt-6">
                              <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded font-semibold"
                              >
                                    ✅ Update User
                              </button>
                        </div>
                  </form>
            </div>
      );
};

export default UpdateUser;
