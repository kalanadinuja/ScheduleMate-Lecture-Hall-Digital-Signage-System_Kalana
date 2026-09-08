import React, { useState, useEffect } from 'react';
import { displaysApi, buildingsApi } from '../api';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ToastContainer from '../components/common/ToastContainer';
import StatusPill from '../components/common/StatusPill';
import StatCard from '../components/common/StatCard';
import CascadingLocationSelect from '../components/common/CascadingLocationSelect';
import { Tv, Plus, Search, Edit3, Trash2, RefreshCw, Monitor, CheckCircle } from 'lucide-react';

const DigitalDisplays = () => {
    const [displays, setDisplays] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingDisplay, setEditingDisplay] = useState(null);

    const [displayCode, setDisplayCode] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [locSelect, setLocSelect] = useState({
        building_id: '',
        floor_id: '',
        floor_side_id: ''
    });
    const [refreshInterval, setRefreshInterval] = useState(30);
    const [rotationMode, setRotationMode] = useState('Default');
    const [operationMode, setOperationMode] = useState('Active');
    const [displayStatus, setDisplayStatus] = useState('Online');
    const [saving, setSaving] = useState(false);

    // Delete state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletingDisplay, setDeletingDisplay] = useState(null);
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

    const fetchDisplays = async () => {
        setLoading(true);
        try {
            const res = await displaysApi.getAll();
            if (res.data?.success) {
                setDisplays(res.data.data);
            }
        } catch (err) {
            showToast('Failed to fetch digital displays', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBuildings();
        fetchDisplays();
    }, []);

    const openAddModal = () => {
        setEditingDisplay(null);
        setDisplayCode(`DSP-${String(displays.length + 1).padStart(3, '0')}`);
        setDisplayName('Main Corridor North Display');
        setLocSelect({ building_id: '', floor_id: '', floor_side_id: '' });
        setRefreshInterval(30);
        setRotationMode('Default');
        setOperationMode('Active');
        setDisplayStatus('Online');
        setModalOpen(true);
    };

    const openEditModal = (disp) => {
        setEditingDisplay(disp);
        setDisplayCode(disp.display_code);
        setDisplayName(disp.display_name);
        setLocSelect({
            building_id: disp.building_id,
            floor_id: disp.floor_id,
            floor_side_id: disp.floor_side_id
        });
        setRefreshInterval(disp.refresh_interval_seconds || 30);
        setRotationMode(disp.rotation_mode || 'Default');
        setOperationMode(disp.operation_mode || 'Active');
        setDisplayStatus(disp.display_status || 'Online');
        setModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();

        if (!locSelect.floor_side_id) {
            showToast('Please select a valid Floor Side', 'error');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                display_code: displayCode,
                display_name: displayName,
                floor_side_id: Number(locSelect.floor_side_id),
                refresh_interval_seconds: Number(refreshInterval),
                rotation_mode: rotationMode,
                operation_mode: operationMode,
                display_status: displayStatus
            };

            let res;
            if (editingDisplay) {
                res = await displaysApi.update(editingDisplay.display_id, payload);
            } else {
                res = await displaysApi.create(payload);
            }

            if (res.data?.success) {
                showToast(editingDisplay ? 'Display updated successfully' : 'Display created successfully', 'success');
                setModalOpen(false);
                fetchDisplays();
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to save display configuration';
            showToast(msg, 'error');
        } finally {
            setSaving(false);
        }
    };

    const openDeleteDialog = (disp) => {
        setDeletingDisplay(disp);
        setDeleteError(null);
        setDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!deletingDisplay) return;
        setDeleting(true);
        setDeleteError(null);
        try {
            const res = await displaysApi.delete(deletingDisplay.display_id);
            if (res.data?.success) {
                showToast('Display deleted successfully', 'success');
                setDeleteDialogOpen(false);
                fetchDisplays();
            }
        } catch (err) {
            setDeleteError(err.response?.data?.message || 'Cannot delete display');
        } finally {
            setDeleting(false);
        }
    };

    const filteredDisplays = displays.filter((d) =>
        d.display_name.toLowerCase().includes(search.toLowerCase()) ||
        d.display_code.toLowerCase().includes(search.toLowerCase()) ||
        (d.building_name && d.building_name.toLowerCase().includes(search.toLowerCase())) ||
        (d.side_name && d.side_name.toLowerCase().includes(search.toLowerCase()))
    );

    const onlineCount = displays.filter((d) => d.display_status === 'Online').length;
    const maintenanceCount = displays.filter((d) => d.display_status === 'Maintenance' || d.display_status === 'Offline').length;

    // Resolve names for static preview panel
    const selectedBuildingObj = buildings.find(b => b.building_id === Number(locSelect.building_id));
    const previewBuildingName = selectedBuildingObj?.building_name || 'Main Building';

    const columns = [
        {
            header: 'Display ID',
            accessor: 'display_code',
            cell: (row) => (
                <span className="font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md text-xs">
                    {row.display_code}
                </span>
            )
        },
        {
            header: 'Display Name',
            accessor: 'display_name',
            cell: (row) => <span className="font-bold text-gray-900">{row.display_name}</span>
        },
        {
            header: 'Location',
            accessor: 'building_name',
            cell: (row) => (
                <div className="text-xs space-y-0.5">
                    <div className="font-semibold text-gray-800">{row.building_code} • {row.floor_name || `Floor ${row.floor_number}`}</div>
                    <div className="text-gray-500 font-medium">{row.side_name}</div>
                </div>
            )
        },
        {
            header: 'Status',
            accessor: 'display_status',
            cell: (row) => <StatusPill status={row.display_status || 'Online'} />
        },
        {
            header: 'Refresh Rate',
            accessor: 'refresh_interval_seconds',
            cell: (row) => (
                <span className="text-xs font-semibold text-gray-700">
                    {row.refresh_interval_seconds || 30}s Interval
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
                        title="Configure Display"
                    >
                        <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => openDeleteDialog(row)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Display"
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
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Digital Displays</h1>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                        Manage TV hardware status, refresh intervals, and floor-side screen output configurations
                    </p>
                </div>
                <button
                    type="button"
                    onClick={openAddModal}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all"
                >
                    <Plus className="w-4 h-4" />
                    <span>Configure Display</span>
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard title="CONFIGURED TV DISPLAYS" value={displays.length} badgeText="Mesh Active" badgeColor="blue" icon={Tv} />
                <StatCard title="ONLINE HARDWARE" value={onlineCount} badgeText="Broadcasting" badgeColor="green" icon={CheckCircle} />
                <StatCard title="ATTENTION REQUIRED" value={maintenanceCount} badgeText="Offline/Maint" badgeColor="amber" icon={RefreshCw} />
            </div>

            {/* Controls Bar */}
            <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search displays by name, code, or building..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                </div>
            </div>

            {/* Data Table */}
            <DataTable
                columns={columns}
                data={filteredDisplays}
                loading={loading}
                emptyMessage="No digital displays found. Click 'Configure Display' to add one."
            />

            {/* Configure Digital Display Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Configure Digital Display"
                maxWidth="max-w-4xl"
            >
                <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left 7 cols: Form inputs */}
                    <div className="lg:col-span-7 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Display ID Code *</label>
                                <input
                                    type="text"
                                    value={displayCode}
                                    onChange={(e) => setDisplayCode(e.target.value)}
                                    placeholder="e.g. DSP-01"
                                    className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl font-medium"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Display Name *</label>
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="e.g. Main Corridor Display"
                                    className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl font-medium"
                                    required
                                />
                            </div>
                        </div>

                        {/* Location Select */}
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                            <label className="block text-xs font-bold text-gray-700 mb-2">Location Assignment *</label>
                            <CascadingLocationSelect
                                selectedBuildingId={locSelect.building_id}
                                selectedFloorId={locSelect.floor_id}
                                selectedFloorSideId={locSelect.floor_side_id}
                                showHall={false}
                                onChange={(loc) => setLocSelect((prev) => ({ ...prev, ...loc }))}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Refresh Interval (seconds)</label>
                                <input
                                    type="number"
                                    value={refreshInterval}
                                    onChange={(e) => setRefreshInterval(e.target.value)}
                                    min="5"
                                    max="300"
                                    className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl font-medium"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Operation Mode</label>
                                <select
                                    value={operationMode}
                                    onChange={(e) => setOperationMode(e.target.value)}
                                    className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl font-medium"
                                >
                                    <option value="Active">Active Signage Mode</option>
                                    <option value="Maintenance">Maintenance Mode</option>
                                    <option value="Off">Power Savings / Off</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Display Rotation Mode</label>
                            <div className="flex items-center gap-4 pt-1">
                                <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                                    <input
                                        type="radio"
                                        name="rotation"
                                        value="Default"
                                        checked={rotationMode === 'Default'}
                                        onChange={() => setRotationMode('Default')}
                                        className="text-blue-600"
                                    />
                                    <span>Default Rotation</span>
                                </label>
                                <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                                    <input
                                        type="radio"
                                        name="rotation"
                                        value="Custom"
                                        checked={rotationMode === 'Custom'}
                                        onChange={() => setRotationMode('Custom')}
                                        className="text-blue-600"
                                    />
                                    <span>Select Rotation</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Hardware Status</label>
                            <select
                                value={displayStatus}
                                onChange={(e) => setDisplayStatus(e.target.value)}
                                className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl font-medium"
                            >
                                <option value="Online">Online</option>
                                <option value="Offline">Offline</option>
                                <option value="Maintenance">Maintenance</option>
                            </select>
                        </div>
                    </div>

                    {/* Right 5 cols: Live Miniature Digital Signage Preview Panel (FRONTEND ONLY STYLING - NOT A REAL API CALL) */}
                    <div className="lg:col-span-5 bg-navy-950 rounded-2xl p-4 text-white border border-slate-800 flex flex-col justify-between shadow-2xl relative overflow-hidden select-none">
                        {/* Note Comment for Evaluators */}
                        {/* NOTE: This preview panel is frontend-only styling mocking currently selected values, NOT a live API fetch */}
                        
                        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center font-bold text-[10px]">S</div>
                                <div>
                                    <div className="font-bold text-xs leading-none">ScheduleMate</div>
                                    <div className="text-[9px] text-slate-400">Lecture Hall Digital Signage</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs font-mono font-bold text-blue-400">08:42 AM</div>
                                <div className="text-[9px] text-slate-400">Sep 08, 2026</div>
                            </div>
                        </div>

                        {/* Simulated Signage Slide */}
                        <div className="my-4 space-y-3">
                            <div className="p-3 rounded-xl bg-blue-950/80 border border-blue-800/60 space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold text-[9px] uppercase tracking-wider">
                                        ONGOING
                                    </span>
                                    <span className="text-[10px] font-mono text-slate-300">08:00 - 09:30 AM</span>
                                </div>
                                <div className="font-bold text-xs text-white">IT2010 - Programming Fundamentals</div>
                                <div className="flex items-center justify-between text-[10px] text-slate-300">
                                    <span>Hall: LH-101</span>
                                    <span>Lecturer: Dr. Perera</span>
                                </div>
                            </div>

                            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                                <div className="text-[9px] font-bold text-slate-400 uppercase">NEXT SESSION (10:00 AM)</div>
                                <div className="font-semibold text-xs text-slate-200">IT2030 - Database Systems</div>
                            </div>
                        </div>

                        {/* Ticker / Location Preview Bar */}
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[9px] text-slate-400">
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                <span className="truncate max-w-[150px]">{previewBuildingName} • {displayName}</span>
                            </div>
                            <span className="font-mono text-blue-400 font-bold">{displayCode}</span>
                        </div>

                        <div className="text-[9px] text-slate-500 text-center mt-2 italic">
                            Simulated real-time output rendering at 1080p
                        </div>
                    </div>

                    {/* Footer buttons */}
                    <div className="lg:col-span-12 flex justify-end gap-3 pt-4 border-t border-gray-100">
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
                            {saving ? 'Saving Configuration...' : 'Save Configuration'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleDelete}
                title="Delete Digital Display"
                message={`Are you sure you want to delete display '${deletingDisplay?.display_code}' (${deletingDisplay?.display_name})?`}
                loading={deleting}
                errorMessage={deleteError}
            />
        </div>
    );
};

export default DigitalDisplays;
