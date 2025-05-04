import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import toast from "react-hot-toast";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import Loading from "../components/Loading"

const UpdateUser = () => {
      const { userId } = useParams();
      const navigate = useNavigate();
      const [user, setUser] = useState(null);
      const [formData, setFormData] = useState({ emailId: "", password: "" });
      const [loading, setLoading] = useState(true);
      const [publications, setPublications] = useState([]);
      const [editionsMap, setEditionsMap] = useState({});
      const [newPermissions, setNewPermissions] = useState([]);
      const [showPassword, setShowPassword] = useState(false);

      useEffect(() => {
            const fetchUser = async () => {
                  try {
                        const res = await axios.get(`/user/${userId}`);
                        const userData = res.data.user;
                        setUser(userData);
                        setFormData({ emailId: userData.emailId || "", password: "" });
                        const uniquePubIds = [...new Set(userData.permissions.map(p => p.publicationId))];
                        uniquePubIds.forEach(id => fetchEditions(id));
                  } catch {
                        toast.error("Failed to load user data");
                        navigate("/profile");
                  } finally {
                        setLoading(false);
                  }
            };

            const fetchPublications = async () => {
                  try {
                        const res = await axios.get("/papers/get-publication");
                        if (!res.data?.success) throw new Error();
                        setPublications(res.data.publications);
                  } catch {
                        toast.error("Failed to load publications");
                  }
            };

            fetchUser();
            fetchPublications();
      }, [userId, navigate]);

      const fetchEditions = async (publicationId) => {
            try {
                  const res = await axios.get(`/papers/get-edition?publicationId=${publicationId}`);
                  if (!res.data?.success) throw new Error();
                  setEditionsMap((prev) => ({ ...prev, [publicationId]: res.data.editions }));
            } catch {
                  toast.error("Failed to load editions");
            }
      };

      const handlePermissionChange = (index, field, value, isExisting = false) => {
            if (isExisting) {
                  const updated = [...user.permissions];
                  updated[index][field] = value;
                  if (field === "publicationId") {
                        updated[index].editionId = "";
                        fetchEditions(value);
                  }
                  setUser({ ...user, permissions: updated });
            } else {
                  const updated = [...newPermissions];
                  updated[index][field] = value;
                  if (field === "publicationId") {
                        updated[index].editionId = "";
                        fetchEditions(value);
                  }
                  setNewPermissions(updated);
            }
      };

      const handleAddPermissionRow = () => {
            setNewPermissions([...newPermissions, { publicationId: "", editionId: "", permission: "" }]);
      };

      const handleRemovePermissionRow = (index) => {
            setNewPermissions(newPermissions.filter((_, i) => i !== index));
      };

      const handleCheckboxChange = (field) => {
            setUser({ ...user, [field]: !user[field] });
      };

      const handleDeletePermission = async (publicationId, editionId) => {
            try {
                  const res = await axios.delete(`/user/${userId}/permission`, { data: { publicationId, editionId } });
                  setUser((prev) => ({
                        ...prev,
                        permissions: prev.permissions.filter(p => !(p.publicationId === publicationId && p.editionId === editionId))
                  }));
                  if (res.data.success) toast.success(res.data.message);
            } catch {
                  toast.error("Failed to delete permission");
            }
      };

      const handleSubmit = async (e) => {
            e.preventDefault();
            try {
                  const finalPermissions = [
                        ...user.permissions.map(p => ({ publicationId: p.publicationId, editionId: p.editionId, permission: p.permission })),
                        ...newPermissions,
                  ];



                  await axios.put(`/user/${userId}`, {
                        emailId: formData.emailId,
                        ...(formData.password && { password: formData.password }),
                        isAdmin: user.isAdmin,
                        isActive: user.isActive,
                        permissions: finalPermissions.length > 0 ? finalPermissions : [{ publicationId: "", editionId: "", permission: "" }],
                  });

                  console.log(finalPermissions)

                  toast.success("User updated successfully!");
                  navigate("/profile");
            } catch {
                  toast.error("Update failed");
            }
      };

      if (loading || !user) return <Loading />

      return (
            <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-8 mt-6">
                  <div className="flex mb-4 absolute top-32 max-lg:top-36 left-16 max-lg:left-8">
                        <button
                              onClick={() => navigate(-1)}
                              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 max-lg:px-2 max-lg:py-1 "
                        >
                              🔙 Back to Profile
                        </button>
                  </div>
                  <h2 className="text-2xl font-bold text-center mb-6">Update User: {user.userName}</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                              <label className="block font-medium">Email</label>
                              <input
                                    type="email"
                                    value={formData.emailId}
                                    onChange={(e) => setFormData({ ...formData, emailId: e.target.value })}
                                    className="w-full border border-gray-300 p-2 rounded"
                                    required
                              />
                        </div>

                        <div className="relative">
                              <label className="block font-medium">Password</label>
                              <input
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Leave blank to keep current password"
                                    className="w-full border border-gray-300 p-2 rounded"
                              />
                              <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute right-4 top-[42px] transform -translate-y-1/2 text-gray-500"
                              >
                                    {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                              </button>
                        </div>

                        <div className="flex items-center gap-6">
                              <label className="flex items-center">
                                    <input
                                          type="checkbox"
                                          checked={user.isAdmin}
                                          onChange={() => handleCheckboxChange("isAdmin")}
                                          className="mr-2 accent-purple-500"
                                    />
                                    Is Admin
                              </label>

                              <label className="flex items-center">
                                    <input
                                          type="checkbox"
                                          checked={user.isActive}
                                          onChange={() => handleCheckboxChange("isActive")}
                                          className="mr-2 accent-green-500"
                                    />
                                    Is Active
                              </label>
                        </div>

                        <div>
                              <h4 className="text-lg font-bold mb-2">Permissions</h4>
                              <div className="overflow-x-auto">
                                    <table className="w-full border text-sm">
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
                                                      <tr key={`exist-${index}`} className="bg-gray-100 text-center">
                                                            <td className="border px-3 py-2">{publications.find(p => p.Publication_Id === perm.publicationId)?.Publication_Name || perm.publicationId}</td>
                                                            <td className="border px-3 py-2">{editionsMap[perm.publicationId]?.find(e => e.Edition_Id === perm.editionId)?.Edition_Name || perm.editionId}</td>
                                                            <td className="border px-3 py-2">
                                                                  <select
                                                                        value={perm.permission}
                                                                        onChange={(e) => handlePermissionChange(index, "permission", e.target.value, true)}
                                                                        className="w-full border p-1 rounded"
                                                                  >
                                                                        <option value="">Select</option>
                                                                        <option value="r">Read</option>
                                                                        <option value="w">Write</option>
                                                                        <option value="rw">Read/Write</option>
                                                                  </select>
                                                            </td>
                                                            <td className="border px-3 py-2">
                                                                  <button
                                                                        type="button"
                                                                        onClick={() => handleDeletePermission(perm.publicationId, perm.editionId)}
                                                                        className="text-red-600 hover:text-red-800"
                                                                  >🗑️</button>
                                                            </td>
                                                      </tr>
                                                ))}

                                                {newPermissions.map((perm, index) => (
                                                      <tr key={`new-${index}`} className="text-center">
                                                            <td className="border px-3 py-2">
                                                                  <select
                                                                        value={perm.publicationId}
                                                                        onChange={(e) => handlePermissionChange(index, "publicationId", e.target.value)}
                                                                        className="w-full border p-1 rounded"
                                                                  >
                                                                        <option value="">Select</option>
                                                                        {publications.map(p => (
                                                                              <option key={p.Publication_Id} value={p.Publication_Id}>{p.Publication_Name}</option>
                                                                        ))}
                                                                  </select>
                                                            </td>
                                                            <td className="border px-3 py-2">
                                                                  <select
                                                                        value={perm.editionId}
                                                                        onChange={(e) => handlePermissionChange(index, "editionId", e.target.value)}
                                                                        disabled={!perm.publicationId}
                                                                        className="w-full border p-1 rounded"
                                                                  >
                                                                        <option value="">Select</option>
                                                                        {(editionsMap[perm.publicationId] || []).map(ed => (
                                                                              <option key={ed.Edition_Id} value={ed.Edition_Id}>{ed.Edition_Name}</option>
                                                                        ))}
                                                                  </select>
                                                            </td>
                                                            <td className="border px-3 py-2">
                                                                  <select
                                                                        value={perm.permission}
                                                                        onChange={(e) => handlePermissionChange(index, "permission", e.target.value)}
                                                                        className="w-full border p-1 rounded"
                                                                  >
                                                                        <option value="">Select</option>
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
                                                                  >🗑️</button>
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
                                          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                    >➕ Add Permission</button>
                              </div>
                        </div>

                        <div className="text-center">
                              <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                              >✅ Update User</button>
                        </div>
                  </form>
            </div>
      );
};

export default UpdateUser;