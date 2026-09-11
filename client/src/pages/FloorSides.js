import React, { useState, useEffect } from 'react';
import { floorSidesApi, buildingsApi, floorsApi } from '../api';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ToastContainer from '../components/common/ToastContainer';
import StatusPill from '../components/common/StatusPill';
import StatCard from '../components/common/StatCard';
import { ArrowLeftRight, Building2, Layers, Plus, Search, Edit3, Trash2 } from 'lucide-react';

const FloorSides = () => {
    const [floorSides, setFloorSides] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [floors, setFloors] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [selectedBuildingId, setSelectedBuildingId] = useState('');
    const [selectedFloorId, setSelectedFloorId] = useState('');
    const [search, setSearch] = useState('');

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingFloorSide, setEditingFloorSide] = useState(null);
    const [modalBuildingId, setModalBuildingId] = useState('');
    const [modalFloors, setModalFloors] = useState([]);
    const [floorId, setFloorId] = useState('');
    const [sideName, setSideName] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('Active');
    const [saving, setSaving] = useState(false);

    // Delete state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletingFloorSide, setDeletingFloorSide] = useState(null);
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

    const fetchFloors = async (bId) => {
        if (!bId) {
            setFloors([]);
            return;
        }
        try {
            const res = await floorsApi.getAll(bId);
            if (res.data?.success) setFloors(res.data.data);
        } catch (err) {
            setFloors([]);
        }
    };

    const fetchFloorSides = async () => {
        setLoading(true);
        try {
            const res = await floorSidesApi.getAll(selectedFloorId, selectedBuildingId);
            if (res.data?.success) {
                setFloorSides(res.data.data);
            }
        } catch (err) {
            showToast('Failed to fetch floor sides', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBuildings();
    }, []);

    useEffect(() => {
        if (selectedBuildingId) {
            fetchFloors(selectedBuildingId);
        } else {
            setFloors([]);
            setSelectedFloorId('');
        }
    }, [selectedBuildingId]);

    useEffect(() => {
        fetchFloorSides();
    }, [selectedBuildingId, selectedFloorId]);

    // Update modal floor dropdown when modal building changes
    useEffect(() => {
        if (modalBuildingId) {
            floorsApi.getAll(modalBuildingId).then((res) => {
                if (res.data?.success) setModalFloors(res.data.data);
            }).catch(() => setModalFloors([]));
        } else {
            setModalFloors([]);
        }
    }, [modalBuildingId]);

    const openAddModal = () => {
        setEditingFloorSide(null);
        setModalBuildingId(selectedBuildingId || (buildings[0]?.building_id || ''));
        setFloorId(selectedFloorId || '');
        setSideName('');
        setDescription('');
        setStatus('Active');
        setModalOpen(true);
    };

    const openEditModal = (fs) => {
        setEditingFloorSide(fs);
        setModalBuildingId(fs.building_id);
        setFloorId(fs.floor_id);
        setSideName(fs.side_name);
        setDescription(fs.description || '');
        setStatus(fs.status || 'Active');
        setModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                floor_id: Number(floorId),
                side_name: sideName,
                description,
                status
            };
            let res;
            if (editingFloorSide) {
                res = await floorSidesApi.update(editingFloorSide.floor_side_id, payload);
            } else {
                res = await floorSidesApi.create(payload);
            }

            if (res.data?.success) {
                showToast(editingFloorSide ? 'Floor side updated successfully' : 'Floor side created successfully', 'success');
                setModalOpen(false);
                fetchFloorSides();
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to save floor side';
            showToast(msg, 'error');
        } finally {
            setSaving(false);
        }
    };

    const openDeleteDialog = (fs) => {
        setDeletingFloorSide(fs);
        setDeleteError(null);
        setDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!deletingFloorSide) return;
        setDeleting(true);
        setDeleteError(null);
        try {
            const res = await floorSidesApi.delete(deletingFloorSide.floor_side_id);
            if (res.data?.success) {
                showToast('Floor side deleted successfully', 'success');
                setDeleteDialogOpen(false);
                fetchFloorSides();
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.error || 'Cannot delete floor side';
            setDeleteError(msg);
        } finally {
            setDeleting(false);
        }
    };

    const filteredFloorSides = floorSides.filter((fs) =>
        fs.side_name.toLowerCase().includes(search.toLowerCase()) ||
        (fs.description && fs.description.toLowerCase().includes(search.toLowerCase())) ||
        (fs.building_name && fs.building_name.toLowerCase().includes(search.toLowerCase()))
    );

    const columns = [
        {
            header: 'Floor Side Name',
            accessor: 'side_name',
            cell: (row) => (
                <div>
                    <div className="font-bold text-gray-900">{row.side_name}</div>
                    {row.description && <div className="text-xs text-gray-400 font-medium mt-0.5">{row.description}</div>}
                </div>
            )
        },
        {
            header: 'Building & Floor',
            accessor: 'building_name',
            cell: (row) => (
                <div className="text-xs space-y-0.5">
                    <div className="font-semibold text-gray-800">{row.building_code} - {row.building_name}</div>
                    <div className="text-gray-500 font-medium">{row.floor_name || `Floor ${row.floor_number}`}</div>
                </div>
            )
        },
        {
            header: 'Status',
            accessor: 'status',
            cell: (row) => <StatusPill status={row.status || 'Active'} />
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
                        title="Edit Floor Side"
                    >
                        <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => openDeleteDialog(row)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Floor Side"
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
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Floor Side Management</h1>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                        Manage wings, sides, and digital display sectors per floor
                    </p>
                </div>
                <button
                    type="button"
                    onClick={openAddModal}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Floor Side</span>
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatCard title="TOTAL FLOOR SIDES" value={floorSides.length} badgeText="Active Sectors" badgeColor="blue" icon={ArrowLeftRight} />
                <StatCard title="BUILDINGS" value={buildings.length} badgeText="Mapped" badgeColor="green" icon={Building2} />
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Building</label>
                    <select
                        value={selectedBuildingId}
                        onChange={(e) => setSelectedBuildingId(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50 font-semibold text-gray-800"
                    >
                        <option value="">Building: All</option>
                        {buildings.map((b) => (
                            <option key={b.building_id} value={b.building_id}>
                                {b.building_code} - {b.building_name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Floor</label>
                    <select
                        value={selectedFloorId}
                        onChange={(e) => setSelectedFloorId(e.target.value)}
                        disabled={!selectedBuildingId}
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50 font-semibold text-gray-800 disabled:opacity-50"
                    >
                        <option value="">Floor: All</option>
                        {floors.map((f) => (
                            <option key={f.floor_id} value={f.floor_id}>
                                {f.floor_name || `Floor ${f.floor_number}`}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Search</label>
                    <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by side name..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                        />
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <DataTable
                columns={columns}
                data={filteredFloorSides}
                loading={loading}
                emptyMessage="No floor sides found. Click 'Add Floor Side' to create one."
            />

            {/* Add/Edit Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingFloorSide ? 'Edit Floor Side' : 'Add New Floor Side'}
            >
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Building *</label>
                        <select
                            value={modalBuildingId}
                            onChange={(e) => setModalBuildingId(e.target.value)}
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
                        <label className="block text-xs font-bold text-gray-700 mb-1">Floor *</label>
                        <select
                            value={floorId}
                            onChange={(e) => setFloorId(e.target.value)}
                            disabled={!modalBuildingId}
                            className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl font-medium disabled:opacity-50"
                            required
                        >
                            <option value="">Select Floor</option>
                            {modalFloors.map((f) => (
                                <option key={f.floor_id} value={f.floor_id}>
                                    {f.floor_name || `Floor ${f.floor_number}`}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Floor Side Name *</label>
                        <input
                            type="text"
                            value={sideName}
                            onChange={(e) => setSideName(e.target.value)}
                            placeholder="e.g. A Side / North Wing"
                            className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl font-medium"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g. Main corridor facing lecture halls 101-105"
                            className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl font-medium"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl font-medium"
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
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
                            {saving ? 'Saving...' : 'Save Floor Side'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleDelete}
                title="Delete Floor Side"
                message={`Are you sure you want to delete floor side '${deletingFloorSide?.side_name}'?`}
                loading={deleting}
                errorMessage={deleteError}
            />
        </div>
    );
};

export default FloorSides;
