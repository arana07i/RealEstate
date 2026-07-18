'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import type { UserWithRole, UserRole } from '@/lib/types';

export default function UsersClient() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const { users } = await response.json();
        setUsers(users);
      }
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const full_name = formData.get('full_name') as string;
    const role = formData.get('role') as UserRole;

    const response = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, full_name, role }),
    });

    if (response.ok) {
      toast.success('User created successfully');
      setShowCreateForm(false);
      fetchUsers();
    } else {
      const { error } = await response.json();
      toast.error(error || 'Failed to create user');
    }
  };

  const handleUpdateRole = async (userId: string, role: UserRole) => {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });

    if (response.ok) {
      toast.success('User role updated');
      fetchUsers();
    } else {
      const { error } = await response.json();
      toast.error(error || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      toast.success('User deleted');
      fetchUsers();
    } else {
      const { error } = await response.json();
      toast.error(error || 'Failed to delete user');
    }
  };

  return (
    <div className="mt-8">
      <div className="mb-6">
        <button
          type="button"
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn btn-secondary"
        >
          {showCreateForm ? 'Cancel' : '+ Add User'}
        </button>
      </div>

      {showCreateForm && (
        <div className="card mb-8 p-6">
          <h3 className="mb-4 text-lg font-semibold text-primary">Create New User</h3>
          <form onSubmit={handleCreateUser} className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="email" className="block text-sm font-medium">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="input"
                placeholder="user@example.com"
              />
            </div>
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium">Full Name</label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                className="input"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium">Role</label>
              <select id="role" name="role" className="input">
                <option value="agency_admin">Agency Admin</option>
                <option value="agent">Agent</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <div className="flex items-end">
              <button type="submit" className="btn btn-primary">
                Create User
              </button>
            </div>
          </form>
        </div>
      )}

{loading ? (
         <div className="card animate-pulse p-8">
           <div className="h-8 bg-muted rounded mb-4" />
           <div className="h-8 bg-muted rounded" />
         </div>
       ) : (
         <div className="overflow-x-auto card">
           <table className="w-full text-left text-sm">
             <thead className="border-b border-border bg-muted/30">
               <tr>
                 <th scope="col" className="px-6 py-4 font-semibold text-primary">Name</th>
                 <th scope="col" className="px-6 py-4 font-semibold text-primary">Email</th>
                 <th scope="col" className="px-6 py-4 font-semibold text-primary">Role</th>
                 <th scope="col" className="px-6 py-4 font-semibold text-primary">Actions</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-border">
               {users.map((user) => (
                 <tr key={user.id} className="hover:bg-muted/20">
                   <td className="px-6 py-4 font-medium text-primary">
                     {user.full_name || 'No name'}
                   </td>
                   <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                   <td className="px-6 py-4">
                     <select
                       value={user.role}
                       onChange={(e) => handleUpdateRole(user.id, e.target.value as UserRole)}
                       className="input"
                     >
                       <option value="super_admin">Super Admin</option>
                       <option value="agency_admin">Agency Admin</option>
                       <option value="agent">Agent</option>
                       <option value="viewer">Viewer</option>
                     </select>
                   </td>
                   <td className="px-6 py-4">
                     <button
                       type="button"
                       onClick={() => handleDeleteUser(user.id)}
                       className="text-sm font-medium text-destructive hover:text-destructive/80"
                     >
                       Delete
                     </button>
                   </td>
                 </tr>
               ))}
               {users.length === 0 && (
                 <tr>
                   <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                     No users found. Create your first user to get started.
                   </td>
                 </tr>
               )}
             </tbody>
           </table>
         </div>
       )}
    </div>
  );
}
