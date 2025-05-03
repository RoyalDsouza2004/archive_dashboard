import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import Loading from "../components/Loading";

const AddUserForm = () => {
      const [permissions, setPermissions] = useState([
            { publicationId: "", editionId: "", permission: "" },
      ]);
      const [formData, setFormData] = useState({
            email: "",
            userName: "",
            password: "",
            isAdmin: false,
      });
      const [publications, setPublications] = useState([]);
      const [editionsMap, setEditionsMap] = useState({});
      const [loading, setLoading] = useState(true);
      const [showPassword, setShowPassword] = useState(false);

      const navigate = useNavigate();

      useEffect(() => {
            const fetchPublications = async () => {
                  try {
                        const res = await axios.get("/papers/get-publication");
                        setPublications(res.data.publications);
                        setLoading(false);
                  } catch (err) {
                        toast.error("Failed to load publications");
                  }
            };

            fetchPublications();
      }, []);

      const handleInputChange = (e) => {
            const { name, value } = e.target;
            setFormData((prev) => ({ ...prev, [name]: value }));
      };

      const handleAddPermissionRow = () => {
            setPermissions((prev) => [
                  ...prev,
                  { publicationId: "", editionId: "", permission: "" },
            ]);
      };

      const handleRemovePermissionRow = (index) => {
            setPermissions((prev) => prev.filter((_, i) => i !== index));
      };

      const handlePermissionChange = (index, field, value) => {
            const updated = [...permissions];
            updated[index][field] = value;

            if (field === "publicationId") {
                  updated[index]["editionId"] = ""; // Reset editionId when publication changes
                  if (value && !editionsMap[value]) {
                        fetchEditions(value); // Fetch editions for the selected publication
                  }
            }

            setPermissions(updated);
      };

      const fetchEditions = async (publicationId) => {
            try {
                  const res = await axios.get(`/papers/get-edition?publicationId=${publicationId}`);
                  setEditionsMap((prev) => ({ ...prev, [publicationId]: res.data.editions }));
            } catch (err) {
                  toast.error("Failed to load editions");
            }
      };

      const handleSubmit = async (e) => {
            e.preventDefault();

            const payload = {
                  email: formData.email,
                  userName: formData.userName,
                  password: formData.password,
                  isAdmin: formData.isAdmin,
                  permissions: permissions.map((perm) => ({
                        publicationId: perm.publicationId,
                        editionId: perm.editionId,
                        permission: perm.permission,
                  })),
            };

            try {
                  await axios.post("/user/new", payload);
                  toast.success("User added successfully!");
                  navigate("/profile");
            } catch (err) {
                  toast.error("Failed to add user");
            }
      };

      if (loading) return <Loading />

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
                  <h2 className="text-2xl font-bold text-center mb-6">Add User</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex justify-center">
                              <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-3/4 border border-gray-300 p-2 rounded-md"
                              />
                        </div>

                        <div className="flex justify-center">
                              <input
                                    type="text"
                                    name="userName"
                                    placeholder="Username"
                                    required
                                    value={formData.userName}
                                    onChange={handleInputChange}
                                    className="w-3/4 border border-gray-300 p-2 rounded-md"
                              />
                        </div>

                        <div className="flex justify-center relative">
                              <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Password"
                                    required
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-3/4 border border-gray-300 p-2 rounded-md"
                              />
                              <button
                                    type="button"
                                    onClick={()=> setShowPassword((prev) => !prev)}
                                    className="absolute right-16 top-1/2 transform -translate-y-1/2 text-gray-500"
                              >
                                    {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                              </button>
                        </div>

                        <div className="flex justify-center items-center gap-3">
                              <input
                                    type="checkbox"
                                    id="isAdmin"
                                    checked={formData.isAdmin}
                                    onChange={(e) =>
                                          setFormData((prev) => ({ ...prev, isAdmin: e.target.checked }))
                                    }
                              />
                              <label htmlFor="isAdmin" className="font-medium">
                                    Is Admin
                              </label>
                        </div>

                        <div className="mt-6">
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
                                                {permissions.map((row, index) => (
                                                      <tr key={index} className="bg-white hover:bg-gray-50">
                                                            <td className="border px-3 py-2">
                                                                  <select
                                                                        value={row.publicationId}
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
                                                                        value={row.editionId}
                                                                        onChange={(e) =>
                                                                              handlePermissionChange(index, "editionId", e.target.value)
                                                                        }
                                                                        className="w-full border border-gray-300 p-2 rounded"
                                                                        disabled={!row.publicationId}
                                                                  >
                                                                        <option value="">-- Select Edition --</option>
                                                                        {(editionsMap[row.publicationId] || []).map((ed) => (
                                                                              <option key={ed.Edition_Id} value={ed.Edition_Id}>
                                                                                    {ed.Edition_Name}
                                                                              </option>
                                                                        ))}
                                                                  </select>
                                                            </td>

                                                            <td className="border px-3 py-2">
                                                                  <select
                                                                        value={row.permission}
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

                                                            <td className="border px-3 py-2 text-center">
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

                              <div className="mt-6 text-center space-y-4">
                                    <button
                                          type="button"
                                          onClick={handleAddPermissionRow}
                                          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
                                    >
                                          ➕ Add Permission Row
                                    </button>

                                    <button
                                          type="submit"
                                          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded font-semibold"
                                    >
                                          Submit
                                    </button>
                              </div>
                        </div>
                  </form>
            </div>
      );
};

export default AddUserForm;
