import React, { useState, useEffect } from 'react';
import { buildingsApi } from '../api';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ToastContainer from '../components/common/ToastContainer';
import StatCard from '../components/common/StatCard';
import { Building2, Layers, School, Plus, Search, Edit3, Trash2 } from 'lucide-react';

const Buildings = () => {
    const [buildings, setBuildings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingBuilding, setEditingBuilding] = useState(null);
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [saving, setSaving] = useState(false);

    // Delete dialog state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletingBuilding, setDeletingBuilding] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState(null);

    // Toasts
    const [toasts, setToasts] = useState([]);

    const showToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    };

    const fetchBuildings = async () => {
        setLoading(true);
        try {
            const res = await buildingsApi.getAll();
            if (res.data?.success) {
                setBuildings(res.data.data);
            }
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to fetch buildings', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBuildings();
    }, []);

    const openAddModal = () => {
        setEditingBuilding(null);
        setCode('');
        setName('');
        setLocation('');
        setModalOpen(true);
    };

    const openEditModal = (building) => {
        setEditingBuilding(building);
        setCode(building.building_code);
        setName(building.building_name);
        setLocation(building.location || '');
        setModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { building_code: code, building_name: name, location };
            let res;
            if (editingBuilding) {
                res = await buildingsApi.update(editingBuilding.building_id, payload);
            } else {
                res = await buildingsApi.create(payload);
            }

            if (res.data?.success) {
                showToast(editingBuilding ? 'Building updated successfully' : 'Building created successfully', 'success');
                setModalOpen(false);
                fetchBuildings();
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to save building';
            showToast(msg, 'error');
        } finally {
            setSaving(false);
        }
    };

    const openDeleteDialog = (building) => {
        setDeletingBuilding(building);
        setDeleteError(null);
        setDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!deletingBuilding) return;
        setDeleting(true);
        setDeleteError(null);
        try {
            const res = await buildingsApi.delete(deletingBuilding.building_id);
            if (res.data?.success) {
                showToast('Building deleted successfully', 'success');
                setDeleteDialogOpen(false);
                fetchBuildings();
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.error || 'Cannot delete building';
            setDeleteError(msg);
        } finally {
            setDeleting(false);
        }
    };

    const filteredBuildings = buildings.filter((b) =>
        b.building_name.toLowerCase().includes(search.toLowerCase()) ||
        b.building_code.toLowerCase().includes(search.toLowerCase()) ||
        (b.location && b.location.toLowerCase().includes(search.toLowerCase()))
    );

    const totalFloors = buildings.reduce((acc, b) => acc + (b.floor_count || 0), 0);
    const totalHalls = buildings.reduce((acc, b) => acc + (b.hall_count || 0), 0);

    const columns = [
        {
            header: 'Building Code',
            accessor: 'building_code',
            cell: (row) => (
                <span className="font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md text-xs">
                    {row.building_code}
                </span>
            )
        },
        {
            header: 'Building Name',
            accessor: 'building_name',
            cell: (row) => <span className="font-bold text-gray-900">{row.building_name}</span>
        },
        {
            header: 'Location / Zone',
            accessor: 'location',
            cell: (row) => (
                <span className="text-gray-600 text-xs">{row.location || 'Main Campus'}</span>
            )
        },
        {
            header: 'Floors Count',
            accessor: 'floor_count',
            cell: (row) => (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700">
                    <Layers className="w-3.5 h-3.5 text-gray-400" />
                    {row.floor_count || 0} Floors
                </span>
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
                        title="Edit Building"
                    >
                        <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => openDeleteDialog(row)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Building"
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
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Building Management</h1>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                        Manage institute campus structures, zones, and building profiles
                    </p>
                </div>
                <button
                    type="button"
                    onClick={openAddModal}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Building</span>
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard title="REGISTERED BUILDINGS" value={buildings.length} badgeText="Active" badgeColor="blue" icon={Building2} />
                <StatCard title="TOTAL FLOORS" value={totalFloors} badgeText="Mapped" badgeColor="green" icon={Layers} />
                <StatCard title="LECTURE HALLS" value={totalHalls} badgeText="Capacity" badgeColor="blue" icon={School} />
            </div>

            {/* Controls Bar */}
            <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by building name, code, or location..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                    />
                </div>
            </div>

            {/* Data Table */}
            <DataTable
                columns={columns}
                data={filteredBuildings}
                loading={loading}
                emptyMessage="No buildings found. Click 'Add Building' to create one."
            />

            {/* Add / Edit Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingBuilding ? 'Edit Building' : 'Add New Building'}
            >
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Building Code *</label>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="e.g. BLD-01"
                            className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Building Name *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Main Computing Building"
                            className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Location / Zone</label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="e.g. North Wing Campus"
                            className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
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
                            {saving ? 'Saving...' : 'Save Building'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleDelete}
                title="Delete Building"
                message={`Are you sure you want to delete building '${deletingBuilding?.building_name}'?`}
                loading={deleting}
                errorMessage={deleteError}
            />
        </div>
    );
};

export default Buildings;
