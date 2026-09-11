import React, { useState, useEffect } from 'react';
import { modulesApi } from '../api';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ToastContainer from '../components/common/ToastContainer';
import StatusPill from '../components/common/StatusPill';
import StatCard from '../components/common/StatCard';
import { BookOpen, Plus, Search, Edit3, Trash2 } from 'lucide-react';

const Modules = () => {
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);

    const [departmentFilter, setDepartmentFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [search, setSearch] = useState('');

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingModule, setEditingModule] = useState(null);
    const [moduleCode, setModuleCode] = useState('');
    const [moduleName, setModuleName] = useState('');
    const [description, setDescription] = useState('');
    const [department, setDepartment] = useState('');
    const [moduleType, setModuleType] = useState('Core');
    const [saving, setSaving] = useState(false);

    // Delete state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletingModule, setDeletingModule] = useState(null);
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

    const fetchModules = async () => {
        setLoading(true);
        try {
            const params = {};
            if (departmentFilter) params.department = departmentFilter;
            if (typeFilter) params.module_type = typeFilter;

            const res = await modulesApi.getAll(params);
            if (res.data?.success) {
                setModules(res.data.data);
            }
        } catch (err) {
            showToast('Failed to fetch academic modules', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchModules();
    }, [departmentFilter, typeFilter]);

    const openAddModal = () => {
        setEditingModule(null);
        setModuleCode('');
        setModuleName('');
        setDescription('');
        setDepartment('Faculty of Computing');
        setModuleType('Core');
        setModalOpen(true);
    };

    const openEditModal = (mod) => {
        setEditingModule(mod);
        setModuleCode(mod.module_code);
        setModuleName(mod.module_name);
        setDescription(mod.description || '');
        setDepartment(mod.department || '');
        setModuleType(mod.module_type || 'Core');
        setModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                module_code: moduleCode,
                module_name: moduleName,
                description,
                department,
                module_type: moduleType
            };

            let res;
            if (editingModule) {
                res = await modulesApi.update(editingModule.module_id, payload);
            } else {
                res = await modulesApi.create(payload);
            }

            if (res.data?.success) {
                showToast(editingModule ? 'Module updated successfully' : 'Module created successfully', 'success');
                setModalOpen(false);
                fetchModules();
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to save module';
            showToast(msg, 'error');
        } finally {
            setSaving(false);
        }
    };

    const openDeleteDialog = (mod) => {
        setDeletingModule(mod);
        setDeleteError(null);
        setDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!deletingModule) return;
        setDeleting(true);
        setDeleteError(null);
        try {
            const res = await modulesApi.delete(deletingModule.module_id);
            if (res.data?.success) {
                showToast('Module deleted successfully', 'success');
                setDeleteDialogOpen(false);
                fetchModules();
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.error || 'Cannot delete module';
            setDeleteError(msg);
        } finally {
            setDeleting(false);
        }
    };

    const filteredModules = modules.filter((m) =>
        m.module_name.toLowerCase().includes(search.toLowerCase()) ||
        m.module_code.toLowerCase().includes(search.toLowerCase()) ||
        (m.department && m.department.toLowerCase().includes(search.toLowerCase()))
    );

    const columns = [
        {
            header: 'Module Code',
            accessor: 'module_code',
            cell: (row) => (
                <span className="font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md text-xs">
                    {row.module_code}
                </span>
            )
        },
        {
            header: 'Module Name & Description',
            accessor: 'module_name',
            cell: (row) => (
                <div>
                    <div className="font-bold text-gray-900">{row.module_name}</div>
                    {row.description && <div className="text-xs text-gray-400 font-medium mt-0.5 max-w-md line-clamp-1">{row.description}</div>}
                </div>
            )
        },
        {
            header: 'Department / Faculty',
            accessor: 'department',
            cell: (row) => <span className="text-xs font-semibold text-gray-700">{row.department || 'General'}</span>
        },
        {
            header: 'Module Type',
            accessor: 'module_type',
            cell: (row) => <StatusPill status={row.module_type || 'Core'} />
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
                        title="Edit Module"
                    >
                        <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => openDeleteDialog(row)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Module"
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
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Module Management</h1>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                        Manage academic course modules, subject codes, and faculty assignments
                    </p>
                </div>
                <button
                    type="button"
                    onClick={openAddModal}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Module</span>
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatCard title="TOTAL MODULES" value={modules.length} badgeText="Curriculum" badgeColor="blue" icon={BookOpen} />
                <StatCard title="CORE MODULES" value={modules.filter(m => m.module_type === 'Core').length} badgeText="Mandatory" badgeColor="green" icon={BookOpen} />
            </div>

            {/* Controls Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Module Type</label>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50 font-semibold text-gray-800"
                    >
                        <option value="">Type: All</option>
                        <option value="Core">Core</option>
                        <option value="Elective">Elective</option>
                    </select>
                </div>

                <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Search</label>
                    <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by module code, name, or department..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                        />
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <DataTable
                columns={columns}
                data={filteredModules}
                loading={loading}
                emptyMessage="No modules found. Click 'Add Module' to create one."
            />

            {/* Add/Edit Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingModule ? 'Edit Module' : 'Add New Module'}
            >
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Module Code *</label>
                            <input
                                type="text"
                                value={moduleCode}
                                onChange={(e) => setModuleCode(e.target.value)}
                                placeholder="e.g. IT2010"
                                className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl font-medium"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Module Type</label>
                            <select
                                value={moduleType}
                                onChange={(e) => setModuleType(e.target.value)}
                                className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl font-medium"
                            >
                                <option value="Core">Core</option>
                                <option value="Elective">Elective</option>
                                <option value="General">General</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Module Name *</label>
                        <input
                            type="text"
                            value={moduleName}
                            onChange={(e) => setModuleName(e.target.value)}
                            placeholder="e.g. Programming Fundamentals"
                            className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl font-medium"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Department / Faculty</label>
                        <input
                            type="text"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            placeholder="e.g. Faculty of Computing"
                            className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl font-medium"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Basic programming concepts and object-oriented design..."
                            rows="3"
                            className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl font-medium"
                        />
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
                            {saving ? 'Saving...' : 'Save Module'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleDelete}
                title="Delete Module"
                message={`Are you sure you want to delete module '${deletingModule?.module_code}' (${deletingModule?.module_name})?`}
                loading={deleting}
                errorMessage={deleteError}
            />
        </div>
    );
};

export default Modules;
