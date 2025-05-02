import React, { useEffect, useState } from "react";
import axios from "../api/axios" 
import UsersTable from "../components/UsersTable";
import Loading from "../components/Loading";

const Profile = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/user/all");
      setUsers(res.data.users);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-6">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <UsersTable users={users} />
    </div>
  );
};

export default Profile;
