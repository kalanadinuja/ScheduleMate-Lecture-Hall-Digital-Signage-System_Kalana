import React, { useState, useEffect } from 'react';
import { lectureHallsApi, floorSidesApi, buildingsApi } from '../api';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ToastContainer from '../components/common/ToastContainer';
import StatusPill from '../components/common/StatusPill';
import StatCard from '../components/common/StatCard';
import CascadingLocationSelect from '../components/common/CascadingLocationSelect';
import { School, Building2, Plus, Search, Edit3, Trash2, Users } from 'lucide-react';

const LectureHalls = () => {
    const [halls, setHalls] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter location state
    const [filterLoc, setFilterLoc] = useState({
        building_id: '',
        floor_id: '',
        floor_side_id: ''
    });
    const [search, setSearch] = useState('');

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingHall, setEditingHall] = useState(null);

    const [modalLoc, setModalLoc] = useState({
        building_id: '',
        floor_id: '',
        floor_side_id: ''
    });
    const [hallCode, setHallCode] = useState('');
    const [hallName, setHallName] = useState('');
    const [description, setDescription] = useState('');
    const [hallType, setHallType] = useState('Lecture');
    const [capacity, setCapacity] = useState(100);
    const [hallStatus, setHallStatus] = useState('Active');
    const [saving, setSaving] = useState(false);

    // Delete state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletingHall, setDeletingHall] = useState(null);
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

    const fetchHalls = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filterLoc.building_id) params.building_id = filterLoc.building_id;
            if (filterLoc.floor_id) params.floor_id = filterLoc.floor_id;
            if (filterLoc.floor_side_id) params.floor_side_id = filterLoc.floor_side_id;

            const res = await lectureHallsApi.getAll(params);
            if (res.data?.success) {
                setHalls(res.data.data);
            }
        } catch (err) {
            showToast('Failed to fetch lecture halls', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHalls();
    }, [filterLoc.building_id, filterLoc.floor_id, filterLoc.floor_side_id]);

    const openAddModal = () => {
        setEditingHall(null);
        setModalLoc({
            building_id: filterLoc.building_id || '',
            floor_id: filterLoc.floor_id || '',
            floor_side_id: filterLoc.floor_side_id || ''
        });
        setHallCode('');
        setHallName('');
        setDescription('');
        setHallType('Lecture');
        setCapacity(100);
        setHallStatus('Active');
        setModalOpen(true);
    };

    const openEditModal = (hall) => {
        setEditingHall(hall);
        setModalLoc({
            building_id: hall.building_id,
            floor_id: hall.floor_id,
            floor_side_id: hall.floor_side_id
        });
        setHallCode(hall.hall_code);
        setHallName(hall.hall_name);
        setDescription(hall.description || '');
        setHallType(hall.hall_type || 'Lecture');
        setCapacity(hall.capacity);
        setHallStatus(hall.hall_status || 'Active');
        setModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();

        if (!modalLoc.floor_side_id) {
            showToast('Please select a valid Floor Side', 'error');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                floor_side_id: Number(modalLoc.floor_side_id),
                hall_code: hallCode,
                hall_name: hallName,
                description,
                hall_type: hallType,
                capacity: Number(capacity),
                hall_status: hallStatus
            };

            let res;
            if (editingHall) {
                res = await lectureHallsApi.update(editingHall.hall_id, payload);
            } else {
                res = await lectureHallsApi.create(payload);
            }

            if (res.data?.success) {
                showToast(editingHall ? 'Lecture hall updated successfully' : 'Lecture hall created successfully', 'success');
                setModalOpen(false);
                fetchHalls();
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to save lecture hall';
            showToast(msg, 'error');
        } finally {
            setSaving(false);
        }
    };

    const openDeleteDialog = (hall) => {
        setDeletingHall(hall);
        setDeleteError(null);
        setDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!deletingHall) return;
        setDeleting(true);
        setDeleteError(null);
        try {
            const res = await lectureHallsApi.delete(deletingHall.hall_id);
            if (res.data?.success) {
                showToast('Lecture hall deleted successfully', 'success');
                setDeleteDialogOpen(false);
                fetchHalls();
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.error || 'Cannot delete lecture hall';
            setDeleteError(msg);
        } finally {
            setDeleting(false);
        }
    };

    const filteredHalls = halls.filter((h) =>
        h.hall_name.toLowerCase().includes(search.toLowerCase()) ||
        h.hall_code.toLowerCase().includes(search.toLowerCase()) ||
        (h.description && h.description.toLowerCase().includes(search.toLowerCase())) ||
        (h.building_name && h.building_name.toLowerCase().includes(search.toLowerCase()))
    );

    const totalCapacity = halls.reduce((acc, h) => acc + (h.capacity || 0), 0);

    const columns = [
        {
            header: 'Hall Code',
            accessor: 'hall_code',
            cell: (row) => (
                <span className="font-bold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-md text-xs border border-gray-200">
                    {row.hall_code}
                </span>
            )
        },
        {
            header: 'Hall Name & Description',
            accessor: 'hall_name',
            cell: (row) => (
                <div>
                    <div className="font-bold text-gray-900">{row.hall_name}</div>
                    {row.description && <div className="text-xs text-gray-400 font-medium mt-0.5">{row.description}</div>}
                </div>
            )
        },
        {
            header: 'Location',
            accessor: 'location',
            cell: (row) => (
                <div className="text-xs space-y-0.5">
                    <div className="font-semibold text-gray-800">{row.building_code} • {row.floor_name || `Floor ${row.floor_number}`}</div>
                    <div className="text-gray-500 font-medium">{row.side_name}</div>
                </div>
            )
        },
        {
            header: 'Type & Capacity',
            accessor: 'capacity',
            cell: (row) => (
                <div className="text-xs font-semibold text-gray-700 flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-bold">
                        {row.hall_type || 'Lecture'}
                    </span>
                    <span className="flex items-center gap-1 text-gray-600">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        {row.capacity} Seats
                    </span>
                </div>
            )
        },
        {
            header: 'Status',
            accessor: 'hall_status',
            cell: (row) => <StatusPill status={row.hall_status || 'Active'} />
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
                        title="Edit Lecture Hall"
                    >
                        <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => openDeleteDialog(row)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Lecture Hall"
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
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Lecture Hall Management</h1>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                        Manage lecture theaters, computer laboratories, capacities, and availability
                    </p>
                </div>
                <button
                    type="button"
                    onClick={openAddModal}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Lecture Hall</span>
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatCard title="TOTAL LECTURE HALLS" value={halls.length} badgeText="Active Venues" badgeColor="blue" icon={School} />
                <StatCard title="TOTAL SEATING CAPACITY" value={totalCapacity} badgeText="Seats" badgeColor="green" icon={Users} />
            </div>

            {/* Cascading Filter Bar */}
            <div className="space-y-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Location Filters</span>
                    <div className="relative max-w-xs w-full">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by code or hall name..."
                            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                        />
                    </div>
                </div>

                <CascadingLocationSelect
                    selectedBuildingId={filterLoc.building_id}
                    selectedFloorId={filterLoc.floor_id}
                    selectedFloorSideId={filterLoc.floor_side_id}
                    showHall={false}
                    onChange={(loc) => setFilterLoc((prev) => ({ ...prev, ...loc }))}
                />
            </div>

            {/* Data Table */}
            <DataTable
                columns={columns}
                data={filteredHalls}
                loading={loading}
                emptyMessage="No lecture halls found. Click 'Add Lecture Hall' to create one."
            />

            {/* Add/Edit Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingHall ? 'Edit Lecture Hall' : 'Add New Lecture Hall'}
                maxWidth="max-w-2xl"
            >
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <label className="block text-xs font-bold text-gray-700 mb-2">Location Cascade *</label>
                        <CascadingLocationSelect
                            selectedBuildingId={modalLoc.building_id}
                            selectedFloorId={modalLoc.floor_id}
                            selectedFloorSideId={modalLoc.floor_side_id}
                            showHall={false}
                            onChange={(loc) => setModalLoc((prev) => ({ ...prev, ...loc }))}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Hall Code *</label>
                            <input
                                type="text"
                                value={hallCode}
                                onChange={(e) => setHallCode(e.target.value)}
                                placeholder="e.g. LH-101"
                                className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl font-medium"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Hall Name *</label>
                            <input
                                type="text"
                                value={hallName}
                                onChange={(e) => setHallName(e.target.value)}
                                placeholder="e.g. Alan Turing Auditorium"
                                className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl font-medium"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Hall Type</label>
                            <select
                                value={hallType}
                                onChange={(e) => setHallType(e.target.value)}
                                className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl font-medium"
                            >
                                <option value="Lecture">Lecture</option>
                                <option value="Laboratory">Laboratory</option>
                                <option value="Auditorium">Auditorium</option>
                                <option value="Seminar Room">Seminar Room</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Capacity (Seats) *</label>
                            <input
                                type="number"
                                value={capacity}
                                onChange={(e) => setCapacity(e.target.value)}
                                min="1"
                                className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl font-medium"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Status</label>
                            <select
                                value={hallStatus}
                                onChange={(e) => setHallStatus(e.target.value)}
                                className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl font-medium"
                            >
                                <option value="Active">Active</option>
                                <option value="Under Maintenance">Under Maintenance</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g. Equipped with 4K projectors and surround sound system"
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
                            {saving ? 'Saving...' : 'Save Lecture Hall'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleDelete}
                title="Delete Lecture Hall"
                message={`Are you sure you want to delete hall '${deletingHall?.hall_code}' (${deletingHall?.hall_name})?`}
                loading={deleting}
                errorMessage={deleteError}
            />
        </div>
    );
};

export default LectureHalls;
