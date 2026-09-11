import React, { useState, useEffect } from 'react';
import { floorsApi, buildingsApi } from '../api';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ToastContainer from '../components/common/ToastContainer';
import StatCard from '../components/common/StatCard';
import { Layers, Building2, Plus, Search, Edit3, Trash2 } from 'lucide-react';

const Floors = () => {
    const [floors, setFloors] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [selectedBuildingId, setSelectedBuildingId] = useState('');
    const [search, setSearch] = useState('');

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingFloor, setEditingFloor] = useState(null);
    const [buildingId, setBuildingId] = useState('');
    const [floorNumber, setFloorNumber] = useState(1);
    const [floorName, setFloorName] = useState('');
    const [description, setDescription] = useState('');
    const [saving, setSaving] = useState(false);

    // Delete state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletingFloor, setDeletingFloor] = useState(null);
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

    const fetchBuildings = async () => {
        try {
            const res = await buildingsApi.getAll();
            if (res.data?.success) setBuildings(res.data.data);
        } catch (err) {}
    };

    const fetchFloors = async () => {
        setLoading(true);
        try {
            const res = await floorsApi.getAll(selectedBuildingId);
            if (res.data?.success) {
                setFloors(res.data.data);
            }
        } catch (err) {
            showToast('Failed to fetch floors', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBuildings();
    }, []);

    useEffect(() => {
        fetchFloors();
    }, [selectedBuildingId]);

    const openAddModal = () => {
        setEditingFloor(null);
        setBuildingId(selectedBuildingId || (buildings[0]?.building_id || ''));
        setFloorNumber(1);
        setFloorName('');
        setDescription('');
        setModalOpen(true);
    };

    const openEditModal = (floor) => {
        setEditingFloor(floor);
        setBuildingId(floor.building_id);
        setFloorNumber(floor.floor_number);
        setFloorName(floor.floor_name || '');
        setDescription(floor.description || '');
        setModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                building_id: Number(buildingId),
                floor_number: Number(floorNumber),
                floor_name: floorName,
                description
            };
            let res;
            if (editingFloor) {
                res = await floorsApi.update(editingFloor.floor_id, payload);
            } else {
                res = await floorsApi.create(payload);
            }

            if (res.data?.success) {
                showToast(editingFloor ? 'Floor updated successfully' : 'Floor created successfully', 'success');
                setModalOpen(false);
                fetchFloors();
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to save floor';
            showToast(msg, 'error');
        } finally {
            setSaving(false);
        }
    };

    const openDeleteDialog = (floor) => {
        setDeletingFloor(floor);
        setDeleteError(null);
        setDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!deletingFloor) return;
        setDeleting(true);
        setDeleteError(null);
        try {
            const res = await floorsApi.delete(deletingFloor.floor_id);
            if (res.data?.success) {
                showToast('Floor deleted successfully', 'success');
                setDeleteDialogOpen(false);
                fetchFloors();
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.error || 'Cannot delete floor';
            setDeleteError(msg);
        } finally {
            setDeleting(false);
        }
    };

    const filteredFloors = floors.filter((f) =>
        (f.floor_name && f.floor_name.toLowerCase().includes(search.toLowerCase())) ||
        (f.description && f.description.toLowerCase().includes(search.toLowerCase())) ||
        String(f.floor_number).includes(search) ||
        (f.building_name && f.building_name.toLowerCase().includes(search.toLowerCase()))
    );

    const columns = [
        {
            header: 'Floor Number',
            accessor: 'floor_number',
            cell: (row) => (
                <span className="font-bold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-md text-xs border border-gray-200">
                    Floor {row.floor_number}
                </span>
            )
        },
        {
            header: 'Floor Name & Description',
            accessor: 'floor_name',
            cell: (row) => (
                <div>
                    <div className="font-bold text-gray-900">{row.floor_name || `Floor ${row.floor_number}`}</div>
                    {row.description && <div className="text-xs text-gray-400 font-medium mt-0.5">{row.description}</div>}
                </div>
            )
        },
        {
            header: 'Building',
            accessor: 'building_name',
            cell: (row) => (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md">
                    <Building2 className="w-3.5 h-3.5" />
                    {row.building_code} - {row.building_name}
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
                        title="Edit Floor"
                    >
                        <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => openDeleteDialog(row)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Floor"
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
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Floor Management</h1>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                        Manage building floor levels and structural floor descriptions
                    </p>
                </div>
                <button
                    type="button"
                    onClick={openAddModal}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Floor</span>
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatCard title="TOTAL FLOORS" value={floors.length} badgeText="Configured" badgeColor="green" icon={Layers} />
                <StatCard title="BUILDINGS" value={buildings.length} badgeText="Mapped" badgeColor="blue" icon={Building2} />
            </div>

            {/* Controls & Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Filter by Building</label>
                    <select
                        value={selectedBuildingId}
                        onChange={(e) => setSelectedBuildingId(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50 font-semibold text-gray-800"
                    >
                        <option value="">All Buildings</option>
                        {buildings.map((b) => (
                            <option key={b.building_id} value={b.building_id}>
                                {b.building_code} - {b.building_name}
                            </option>
                        ))}
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
                            placeholder="Search floors by number or name..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                        />
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <DataTable
                columns={columns}
                data={filteredFloors}
                loading={loading}
                emptyMessage="No floors found. Select a building or click 'Add Floor' to create one."
            />

            {/* Add/Edit Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingFloor ? 'Edit Floor' : 'Add New Floor'}
            >
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Building *</label>
                        <select
                            value={buildingId}
                            onChange={(e) => setBuildingId(e.target.value)}
                            className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl font-medium"
                            required
                        >
                            <option value="">Select Building</option>
                            {buildings.map((b) => (
                                <option key={b.building_id} value={b.building_id}>
                                    {b.building_code} - {b.building_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Floor Number *</label>
                        <input
                            type="number"
                            value={floorNumber}
                            onChange={(e) => setFloorNumber(e.target.value)}
                            placeholder="e.g. 1"
                            className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl font-medium"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Floor Name</label>
                        <input
                            type="text"
                            value={floorName}
                            onChange={(e) => setFloorName(e.target.value)}
                            placeholder="e.g. 1st Floor / Ground Level"
                            className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl font-medium"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g. Computer Science Department and Labs"
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
                            {saving ? 'Saving...' : 'Save Floor'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleDelete}
                title="Delete Floor"
                message={`Are you sure you want to delete floor '${deletingFloor?.floor_name || deletingFloor?.floor_number}'?`}
                loading={deleting}
                errorMessage={deleteError}
            />
        </div>
    );
};

export default Floors;
