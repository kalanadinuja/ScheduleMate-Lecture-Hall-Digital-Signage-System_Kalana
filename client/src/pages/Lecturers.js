import React, { useState, useEffect } from 'react';
import { lecturersApi } from '../api';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ToastContainer from '../components/common/ToastContainer';
import StatCard from '../components/common/StatCard';
import { Users, Plus, Search, Edit3, Trash2, Mail, Phone, Award } from 'lucide-react';

const Lecturers = () => {
    const [lecturers, setLecturers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingLecturer, setEditingLecturer] = useState(null);
    const [lecturerCode, setLecturerCode] = useState('');
    const [fullName, setFullName] = useState('');
    const [title, setTitle] = useState('Senior Lecturer (Gr. I)');
    const [email, setEmail] = useState('');
    const [department, setDepartment] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [saving, setSaving] = useState(false);

    // Delete state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletingLecturer, setDeletingLecturer] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState(null);

    const [toasts, setToasts] = useState([]);

    const showToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    };

    const fetchLecturers = async () => {
        setLoading(true);
        try {
            const res = await lecturersApi.getAll(search);
            if (res.data?.success) {
                setLecturers(res.data.data);
            }
        } catch (err) {
            showToast('Failed to fetch academic staff', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchLecturers();
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const openAddModal = () => {
        setEditingLecturer(null);
        setLecturerCode('');
        setFullName('');
        setTitle('Senior Lecturer (Gr. I)');
        setEmail('');
        setDepartment('Faculty of Computing');
        setContactNumber('');
        setModalOpen(true);
    };

    const openEditModal = (lec) => {
        setEditingLecturer(lec);
        setLecturerCode(lec.lecturer_code);
        setFullName(lec.full_name);
        setTitle(lec.title || 'Senior Lecturer (Gr. I)');
        setEmail(lec.email);
        setDepartment(lec.department || '');
        setContactNumber(lec.contact_number || '');
        setModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                lecturer_code: lecturerCode,
                full_name: fullName,
                title,
                email,
                department,
                contact_number: contactNumber
            };

            let res;
            if (editingLecturer) {
                res = await lecturersApi.update(editingLecturer.lecturer_id, payload);
            } else {
                res = await lecturersApi.create(payload);
            }

            if (res.data?.success) {
                showToast(editingLecturer ? 'Lecturer updated successfully' : 'Lecturer registered successfully', 'success');
                setModalOpen(false);
                fetchLecturers();
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to save lecturer profile';
            showToast(msg, 'error');
        } finally {
            setSaving(false);
        }
    };

    const openDeleteDialog = (lec) => {
        setDeletingLecturer(lec);
        setDeleteError(null);
        setDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!deletingLecturer) return;
        setDeleting(true);
        setDeleteError(null);
        try {
            const res = await lecturersApi.delete(deletingLecturer.lecturer_id);
            if (res.data?.success) {
                showToast('Lecturer profile deleted successfully', 'success');
                setDeleteDialogOpen(false);
                fetchLecturers();
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.error || 'Cannot delete lecturer';
            setDeleteError(msg);
        } finally {
            setDeleting(false);
        }
    };

    const columns = [
        {
            header: 'Code',
            accessor: 'lecturer_code',
            cell: (row) => (
                <span className="font-bold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-md text-xs border border-gray-200">
                    {row.lecturer_code}
                </span>
            )
        },
        {
            header: 'Lecturer Name & Title',
            accessor: 'full_name',
            cell: (row) => (
                <div>
                    <div className="font-bold text-gray-900">{row.full_name}</div>
                    <div className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-0.5">
                        <Award className="w-3 h-3 text-amber-500 shrink-0" />
                        {row.title || 'Lecturer'}
                    </div>
                </div>
            )
        },
        {
            header: 'Email Address',
            accessor: 'email',
            cell: (row) => (
                <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium">
                    <Mail className="w-3.5 h-3.5 text-blue-400" />
                    <a href={`mailto:${row.email}`} className="hover:underline">{row.email}</a>
                </div>
            )
        },
        {
            header: 'Department',
            accessor: 'department',
            cell: (row) => <span className="text-xs font-semibold text-gray-700">{row.department || 'Computing'}</span>
        },
        {
            header: 'Contact Number',
            accessor: 'contact_number',
            cell: (row) => (
                <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    {row.contact_number || 'N/A'}
                </div>
            )
        },
        {
            header: 'Actions',
            accessor: 'actions',
            className: 'text-right',
            cell: (row) => (
                <div className="flex items-center justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => openEditModal(row)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Lecturer"
                    >
                        <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => openDeleteDialog(row)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Lecturer"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Lecturer Management</h1>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                        Manage academic teaching staff, contact details, and department allocations
                    </p>
                </div>
                <button
                    type="button"
                    onClick={openAddModal}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Lecturer</span>
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatCard title="TOTAL LECTURERS" value={lecturers.length} badgeText="Academic Staff" badgeColor="blue" icon={Users} />
                <StatCard title="DEPARTMENTS" value={new Set(lecturers.map(l => l.department).filter(Boolean)).size || 1} badgeText="Faculties" badgeColor="green" icon={Award} />
            </div>

            {/* Search Bar */}
            <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name, code, or email..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                </div>
            </div>

            {/* Data Table */}
            <DataTable
                columns={columns}
                data={lecturers}
                loading={loading}
                emptyMessage="No lecturers found. Click 'Add Lecturer' to register academic staff."
            />

            {/* Add/Edit Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingLecturer ? 'Edit Lecturer Profile' : 'Add New Lecturer'}
            >
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Lecturer Code *</label>
                            <input
                                type="text"
                                value={lecturerCode}
                                onChange={(e) => setLecturerCode(e.target.value)}
                                placeholder="e.g. L001"
                                className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl font-medium"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Academic Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Prof. / Dr. / Senior Lecturer"
                                className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl font-medium"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="e.g. Dr. K. Perera"
                            className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl font-medium"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Email Address *</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="e.g. perera@sparkline.lk"
                            className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl font-medium"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Department</label>
                            <input
                                type="text"
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                placeholder="e.g. Computer Science"
                                className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl font-medium"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Contact Number</label>
                            <input
                                type="text"
                                value={contactNumber}
                                onChange={(e) => setContactNumber(e.target.value)}
                                placeholder="e.g. 0711234567"
                                className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl font-medium"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => setModalOpen(false)}
                            className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md shadow-blue-600/30 transition-all disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Lecturer'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleDelete}
                title="Delete Lecturer"
                message={`Are you sure you want to delete lecturer '${deletingLecturer?.full_name}' (${deletingLecturer?.lecturer_code})?`}
                loading={deleting}
                errorMessage={deleteError}
            />
        </div>
    );
};

export default Lecturers;
