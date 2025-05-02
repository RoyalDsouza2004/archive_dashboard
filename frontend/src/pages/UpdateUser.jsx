import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import toast from "react-hot-toast";

const UpdateUser = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`/user/${userId}`);
        setUser(res.data.user);
      } catch (err) {
        toast.error("Failed to load user data");
        navigate("/profile");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId, navigate]);

  const handlePermissionChange = (index, field, value) => {
    const updated = [...user.permissions];
    updated[index][field] = value;
    setUser({ ...user, permissions: updated });
  };

  const handleAddPermissionRow = () => {
    const updated = [...user.permissions, { publicationId: "", editionId: "", permission: "" }];
    setUser({ ...user, permissions: updated });
  };

  const handleRemovePermissionRow = (index) => {
    const updated = user.permissions.filter((_, i) => i !== index);
    setUser({ ...user, permissions: updated });
  };

  const handleCheckboxChange = (field) => {
    setUser({ ...user, [field]: !user[field] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const cleanedPermissions = user.permissions.map((perm) => ({
        publicationId: perm.publicationId,
        editionId: perm.editionId,
        permission: perm.permission,
      }));

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

  if (loading) return <div className="text-center p-4">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-8 mt-6">
      <h2 className="text-2xl font-bold text-center mb-6">
        Update User: {user.userName}
      </h2>

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
                  <th className="border px-3 py-2">Publication ID</th>
                  <th className="border px-3 py-2">Edition ID</th>
                  <th className="border px-3 py-2">Permission</th>
                  <th className="border px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {user.permissions.map((perm, index) => (
                  <tr key={index} className="bg-white hover:bg-gray-50 text-center">
                    <td className="border px-3 py-2">
                      <input
                        type="text"
                        value={perm.publicationId}
                        onChange={(e) =>
                          handlePermissionChange(index, "publicationId", e.target.value)
                        }
                        className="w-full border border-gray-300 p-2 rounded"
                      />
                    </td>
                    <td className="border px-3 py-2">
                      <input
                        type="text"
                        value={perm.editionId}
                        onChange={(e) =>
                          handlePermissionChange(index, "editionId", e.target.value)
                        }
                        className="w-full border border-gray-300 p-2 rounded"
                      />
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

          <div className="text-center mt-4 space-y-4">
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
