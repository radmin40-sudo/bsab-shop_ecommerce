import { Head, useForm } from '@inertiajs/react';
import { Pencil, Plus, Search, ShieldCheck, Trash2, UserRound, UsersRound, X } from 'lucide-react';
import { FormEventHandler, useMemo, useState } from 'react';

import { PortalLayout, StatCard } from '@/components/portal-layout';

interface UserRole {
    id: number;
    name: string;
}
interface AdminUser {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string | null;
    created_at: string;
    roles: UserRole[];
}
interface AdminUsersProps {
    users: AdminUser[];
}
interface UserForm {
    name: string;
    email: string;
    password: string;
    role: string;
    status: string;
}

const emptyForm: UserForm = { name: '', email: '', password: '', role: 'customer', status: 'active' };

export default function AdminUsers({ users }: AdminUsersProps) {
    const [search, setSearch] = useState('');
    const [role, setRole] = useState('all');
    const [status, setStatus] = useState('all');
    const [editing, setEditing] = useState<AdminUser | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const form = useForm<UserForm>(emptyForm);

    const filteredUsers = useMemo(
        () =>
            users.filter((user) => {
                const query = search.trim().toLowerCase();
                return (
                    (!query || user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)) &&
                    (role === 'all' || user.roles.some((item) => item.name === role)) &&
                    (status === 'all' || (user.status ?? 'active') === status)
                );
            }),
        [role, search, status, users],
    );
    const countByRole = (name: string) => users.filter((user) => user.roles.some((item) => item.name === name)).length;
    const activeUsers = users.filter((user) => (user.status ?? 'active') === 'active').length;

    function openCreate() {
        setEditing(null);
        form.setData(emptyForm);
        form.clearErrors();
        setFormOpen(true);
    }
    function openEdit(user: AdminUser) {
        setEditing(user);
        form.setData({ name: user.name, email: user.email, password: '', role: user.role, status: user.status ?? 'active' });
        form.clearErrors();
        setFormOpen(true);
    }
    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        const options = {
            onSuccess: () => {
                setFormOpen(false);
                form.reset();
            },
            preserveScroll: true,
        };
        editing ? form.patch(route('admin.users.update', editing.id), options) : form.post(route('admin.users.store'), options);
    };
    function remove(user: AdminUser) {
        if (window.confirm(`Delete ${user.name}? This cannot be undone.`))
            form.delete(route('admin.users.destroy', user.id), { preserveScroll: true });
    }

    return (
        <>
            <Head title="User management" />
            <PortalLayout role="admin" title="User management" eyebrow="People and access">
                <div className="grid gap-4 sm:grid-cols-3">
                    <StatCard label="All users" value={String(users.length)} detail="Registered accounts" />
                    <StatCard label="Customers" value={String(countByRole('customer'))} detail="Shopping accounts" tone="green" />
                    <StatCard label="Active users" value={String(activeUsers)} detail="Currently enabled" tone="warm" />
                </div>
                <section className="mt-8 overflow-hidden border border-[#dfe3dc] bg-white">
                    <div className="border-b border-[#dfe3dc] p-5 sm:p-6">
                        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                            <div>
                                <p className="flex items-center gap-2 text-xs font-bold tracking-[0.18em] text-[#9a6b45] uppercase">
                                    <UsersRound size={15} /> Directory
                                </p>
                                <h2 className="mt-2 font-serif text-2xl">All users</h2>
                                <p className="mt-1 text-sm text-[#657066]">
                                    {filteredUsers.length} of {users.length} accounts shown
                                </p>
                            </div>
                            <div className="flex w-full gap-2 lg:w-auto">
                                <div className="relative w-full lg:w-64">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#9aa69b]" />
                                    <input
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                        placeholder="Search name or email"
                                        className="w-full border border-[#ccd3ca] bg-[#f7f6f2] py-2.5 pr-3 pl-9 text-sm outline-none focus:border-[#1e2420]"
                                    />
                                </div>
                                <button
                                    onClick={openCreate}
                                    className="flex shrink-0 items-center gap-2 bg-[#1e2420] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2c7a3b]"
                                >
                                    <Plus size={16} /> Add user
                                </button>
                            </div>
                        </div>
                        <div className="mt-5 flex flex-wrap gap-2">
                            <select
                                value={role}
                                onChange={(event) => setRole(event.target.value)}
                                className="border border-[#ccd3ca] bg-white px-3 py-2 text-sm outline-none"
                            >
                                <option value="all">All roles</option>
                                <option value="admin">Admins</option>
                                <option value="seller">Sellers</option>
                                <option value="customer">Customers</option>
                            </select>
                            <select
                                value={status}
                                onChange={(event) => setStatus(event.target.value)}
                                className="border border-[#ccd3ca] bg-white px-3 py-2 text-sm outline-none"
                            >
                                <option value="all">All statuses</option>
                                <option value="active">Active</option>
                                <option value="suspended">Suspended</option>
                            </select>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[820px] text-left text-sm">
                            <thead className="bg-[#eef0e9] text-xs tracking-[0.12em] text-[#657066] uppercase">
                                <tr>
                                    <th className="px-5 py-3 font-semibold">User</th>
                                    <th className="px-5 py-3 font-semibold">Role</th>
                                    <th className="px-5 py-3 font-semibold">Status</th>
                                    <th className="px-5 py-3 font-semibold">Joined</th>
                                    <th className="px-5 py-3 text-right font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#edf0eb]">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="transition hover:bg-[#fbfcfa]">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dce7d5] text-[#2c7a3b]">
                                                    <UserRound size={17} />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-[#1e2420]">{user.name}</p>
                                                    <p className="mt-0.5 text-xs text-[#657066]">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex flex-wrap gap-1.5">
                                                {user.roles.length ? (
                                                    user.roles.map((item) => (
                                                        <span
                                                            key={item.id}
                                                            className="inline-flex items-center gap-1 rounded-full bg-[#f1e5d8] px-2.5 py-1 text-xs font-semibold text-[#7f5637]"
                                                        >
                                                            <ShieldCheck size={12} />
                                                            {item.name}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-[#9aa69b]">No role</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${(user.status ?? 'active') === 'active' ? 'bg-[#dce7d5] text-[#2c7a3b]' : 'bg-[#f7e1dc] text-[#a23b2d]'}`}
                                            >
                                                {user.status ?? 'active'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-[#657066]">{new Date(user.created_at).toLocaleDateString()}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openEdit(user)}
                                                    className="flex items-center gap-1 border border-[#ccd3ca] px-2.5 py-1.5 text-xs font-semibold hover:bg-[#eef0e9]"
                                                >
                                                    <Pencil size={13} /> Edit
                                                </button>
                                                <button
                                                    onClick={() => remove(user)}
                                                    className="flex items-center gap-1 border border-[#eccac3] px-2.5 py-1.5 text-xs font-semibold text-[#a23b2d] hover:bg-[#f7e1dc]"
                                                >
                                                    <Trash2 size={13} /> Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-5 py-16 text-center text-sm text-[#657066]">
                                            No users match the current filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
                {formOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1e2420]/35 p-5">
                        <div className="w-full max-w-lg border border-[#dfe3dc] bg-white p-6 shadow-2xl sm:p-8">
                            <div className="mb-6 flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-bold tracking-[0.18em] text-[#9a6b45] uppercase">
                                        {editing ? 'Edit account' : 'New account'}
                                    </p>
                                    <h2 className="mt-2 font-serif text-2xl">{editing ? 'Update user' : 'Add a user'}</h2>
                                </div>
                                <button onClick={() => setFormOpen(false)} aria-label="Close form">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={submit} className="grid gap-4">
                                <div className="grid gap-2">
                                    <label htmlFor="user-name" className="text-sm font-semibold">
                                        Full name
                                    </label>
                                    <input
                                        id="user-name"
                                        required
                                        value={form.data.name}
                                        onChange={(event) => form.setData('name', event.target.value)}
                                        className="border border-[#ccd3ca] px-3 py-2.5 text-sm outline-none focus:border-[#1e2420]"
                                    />
                                    {form.errors.name && <p className="text-xs text-[#a23b2d]">{form.errors.name}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <label htmlFor="user-email" className="text-sm font-semibold">
                                        Email
                                    </label>
                                    <input
                                        id="user-email"
                                        type="email"
                                        required
                                        value={form.data.email}
                                        onChange={(event) => form.setData('email', event.target.value)}
                                        className="border border-[#ccd3ca] px-3 py-2.5 text-sm outline-none focus:border-[#1e2420]"
                                    />
                                    {form.errors.email && <p className="text-xs text-[#a23b2d]">{form.errors.email}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <label htmlFor="user-password" className="text-sm font-semibold">
                                        Password {editing && <span className="font-normal text-[#657066]">(leave blank to keep current)</span>}
                                    </label>
                                    <input
                                        id="user-password"
                                        type="password"
                                        required={!editing}
                                        value={form.data.password}
                                        onChange={(event) => form.setData('password', event.target.value)}
                                        className="border border-[#ccd3ca] px-3 py-2.5 text-sm outline-none focus:border-[#1e2420]"
                                    />
                                    {form.errors.password && <p className="text-xs text-[#a23b2d]">{form.errors.password}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="grid gap-2">
                                        <label htmlFor="user-role" className="text-sm font-semibold">
                                            Role
                                        </label>
                                        <select
                                            id="user-role"
                                            value={form.data.role}
                                            onChange={(event) => form.setData('role', event.target.value)}
                                            className="border border-[#ccd3ca] px-3 py-2.5 text-sm outline-none"
                                        >
                                            <option value="customer">Customer</option>
                                            <option value="seller">Seller</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div className="grid gap-2">
                                        <label htmlFor="user-status" className="text-sm font-semibold">
                                            Status
                                        </label>
                                        <select
                                            id="user-status"
                                            value={form.data.status}
                                            onChange={(event) => form.setData('status', event.target.value)}
                                            className="border border-[#ccd3ca] px-3 py-2.5 text-sm outline-none"
                                        >
                                            <option value="active">Active</option>
                                            <option value="suspended">Suspended</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="mt-3 flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setFormOpen(false)}
                                        className="border border-[#ccd3ca] px-4 py-2.5 text-sm font-semibold"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={form.processing}
                                        className="bg-[#1e2420] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                                    >
                                        {form.processing ? 'Saving...' : editing ? 'Save changes' : 'Create user'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </PortalLayout>
        </>
    );
}
