import { useEffect, useState } from 'react';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [publications, setPublications] = useState([]);
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => setUsers(data));

    fetch('/api/admin/publications')
      .then(res => res.json())
      .then(data => setPublications(data));

    fetch('/api/admin/permissions')
      .then(res => res.json())
      .then(data => setPermissions(data));
  }, []);

  const handleDeleteUser = (userId) => {
    fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
      .then(() => setUsers(users.filter(user => user.User_Id !== userId)));
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

      <section>
        <h2 className="text-xl font-semibold mb-4">Manage Users</h2>
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="border p-2">User ID</th>
              <th className="border p-2">Username</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.User_Id}>
                <td className="border p-2">{user.User_Id}</td>
                <td className="border p-2">{user.User_Name}</td>
                <td className="border p-2">
                  <button onClick={() => handleDeleteUser(user.User_Id)} className="text-red-500">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Manage Publications</h2>
        <ul>
          {publications.map(pub => (
            <li key={pub.Publication_Id} className="border p-2">{pub.Publication_Id} - {pub.Publication_Name}</li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Manage Permissions</h2>
        <ul>
          {permissions.map(perm => (
            <li key={`${perm.User_Id}-${perm.Edition_Id}`} className="border p-2">
              User: {perm.User_Id}, Publication: {perm.Publication_Id}, Edition: {perm.Edition_Id}, Permission: {perm.Permission}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default Admin;
