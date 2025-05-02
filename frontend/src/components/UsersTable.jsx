import React from "react";
import { useNavigate } from "react-router-dom";

const UsersTable = ({ users }) => {
      const navigate = useNavigate();

      return (
            <div>
                  {/* Add User Button */}
                  <div className="flex justify-end mb-4">
                        <button
                              onClick={() => navigate("/profile/add")}
                              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-semibold"
                        >
                              ➕ Add User
                        </button>
                  </div>

                  {/* Users Table */}
                  <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-300 text-sm">
                              <thead className="bg-blue-600 text-white">
                                    <tr>
                                          <th className="px-4 py-2 border">Name</th>
                                          <th className="px-4 py-2 border">Email</th>
                                          <th className="px-4 py-2 border">Permissions</th>
                                          <th className="px-4 py-2 border">Actions</th>
                                    </tr>
                              </thead>
                              <tbody>
                                    {users.map((user) => (
                                          <tr key={user.userId} className="text-center hover:bg-gray-50">
                                                <td className="px-4 py-2 border">{user.userName}</td>
                                                <td className="px-4 py-2 border">{user.emailId}</td>
                                                <td className="px-4 py-2 border">
                                                      {user.permissions.length > 0 && user.permissions.map((p, i) => (
                                                            <div key={i}>
                                                                  {p.publicationName} / {p.editionName} - <strong>{p.permission}</strong>
                                                            </div>
                                                      ))}
                                                </td>
                                                <td className="px-4 py-2 border">
                                                      <button
                                                            onClick={() => navigate(`/profile/update/${user.userId}`)}
                                                            className="text-blue-600 hover:underline"
                                                      >
                                                            ✏️ Edit
                                                      </button>
                                                </td>
                                          </tr>
                                    ))}
                              </tbody>
                        </table>
                  </div>
            </div>
      );
};

export default UsersTable;
