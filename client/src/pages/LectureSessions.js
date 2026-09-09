import React, { useState, useEffect } from 'react';
import { sessionsApi, modulesApi, lecturersApi } from '../api';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ToastContainer from '../components/common/ToastContainer';
import StatusPill from '../components/common/StatusPill';
import StatCard from '../components/common/StatCard';
import CascadingLocationSelect from '../components/common/CascadingLocationSelect';
import { Calendar, Plus, Search, Edit3, Trash2, Ban, Clock, AlertTriangle } from 'lucide-react';

const LectureSessions = () => {
    const [sessions, setSessions] = useState([]);
    const [modules, setModules] = useState([]);
    const [lecturers, setLecturers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter controls
    const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [filterLoc, setFilterLoc] = useState({
        building_id: '',
        floor_id: '',
        hall_id: ''
    });
    const [statusFilter, setStatusFilter] = useState('');
    const [search, setSearch] = useState('');

    // Add / Edit Modal state
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editingSession, setEditingSession] = useState(null);
    const [moduleId, setModuleId] = useState('');
    const [lecturerId, setLecturerId] = useState('');
    const [formLoc, setFormLoc] = useState({
        building_id: '',
        floor_id: '',
        floor_side_id: '',
        hall_id: ''
    });
    const [sessionType, setSessionType] = useState('Lecture');
    const [sessionDate, setSessionDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState('08:30');
    const [endTime, setEndTime] = useState('10:30');
    const [description, setDescription] = useState('');
    const [formSaving, setFormSaving] = useState(false);
    const [formError, setFormError] = useState(null);

    // Cancel Modal state
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [cancellingSession, setCancellingSession] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelling, setCancelling] = useState(false);

    // Reschedule Modal state
    const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
    const [reschedulingSession, setReschedulingSession] = useState(null);
    const [newDate, setNewDate] = useState('');
    const [newStartTime, setNewStartTime] = useState('');
    const [newEndTime, setNewEndTime] = useState('');
    const [rescheduleLoc, setRescheduleLoc] = useState({
        building_id: '',
        floor_id: '',
        floor_side_id: '',
        hall_id: ''
    });
    const [rescheduleReason, setRescheduleReason] = useState('');
    const [rescheduling, setRescheduling] = useState(false);
    const [rescheduleError, setRescheduleError] = useState(null);

    // Delete state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletingSession, setDeletingSession] = useState(null);
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

    const fetchOptions = async () => {
        try {
            const [mRes, lRes] = await Promise.all([
                modulesApi.getAll(),
                lecturersApi.getAll()
            ]);
            if (mRes.data?.success) setModules(mRes.data.data);
            if (lRes.data?.success) setLecturers(lRes.data.data);
        } catch (e) {}
    };

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const params = {};
            if (selectedDate) params.date = selectedDate;
            if (filterLoc.building_id) params.building_id = filterLoc.building_id;
            if (filterLoc.floor_id) params.floor_id = filterLoc.floor_id;
            if (filterLoc.hall_id) params.hall_id = filterLoc.hall_id;
            if (statusFilter) params.status = statusFilter;

            const res = await sessionsApi.getAll(params);
            if (res.data?.success) {
                setSessions(res.data.data);
            }
        } catch (err) {
            showToast('Failed to fetch lecture sessions', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOptions();
    }, []);

    useEffect(() => {
        fetchSessions();
    }, [selectedDate, filterLoc.building_id, filterLoc.floor_id, filterLoc.hall_id, statusFilter]);

    // Open Add Modal
    const openAddModal = () => {
        setEditingSession(null);
        setModuleId(modules[0]?.module_id || '');
        setLecturerId(lecturers[0]?.lecturer_id || '');
        setFormLoc({
            building_id: filterLoc.building_id || '',
            floor_id: filterLoc.floor_id || '',
            floor_side_id: '',
            hall_id: filterLoc.hall_id || ''
        });
        setSessionType('Lecture');
        setSessionDate(selectedDate || new Date().toISOString().split('T')[0]);
        setStartTime('08:30');
        setEndTime('10:30');
        setDescription('');
        setFormError(null);
        setAddModalOpen(true);
    };

    // Open Edit Modal
    const openEditModal = (sess) => {
        setEditingSession(sess);
        setModuleId(sess.module_id);
        setLecturerId(sess.lecturer_id);
        setFormLoc({
            building_id: sess.building_id,
            floor_id: sess.floor_id,
            floor_side_id: sess.floor_side_id,
            hall_id: sess.hall_id
        });
        setSessionType(sess.session_type || 'Lecture');
        setSessionDate(sess.session_date);
        setStartTime(sess.start_time?.slice(0, 5) || '08:30');
        setEndTime(sess.end_time?.slice(0, 5) || '10:30');
        setDescription(sess.description || '');
        setFormError(null);
        setAddModalOpen(true);
    };

    const handleFormSave = async (e) => {
        e.preventDefault();
        setFormError(null);

        if (!formLoc.hall_id) {
            setFormError('Please select a valid Lecture Hall');
            return;
        }

        setFormSaving(true);
        try {
            const payload = {
                module_id: Number(moduleId),
                lecturer_id: Number(lecturerId),
                hall_id: Number(formLoc.hall_id),
                session_date: sessionDate,
                start_time: startTime,
                end_time: endTime,
                session_type: sessionType,
                description
            };

            let res;
            if (editingSession) {
                res = await sessionsApi.update(editingSession.session_id, payload);
            } else {
                res = await sessionsApi.create(payload);
            }

            if (res.data?.success) {
                showToast(editingSession ? 'Session updated successfully' : 'Session created successfully', 'success');
                setAddModalOpen(false);
                fetchSessions();
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.error || 'Scheduling conflict or validation error';
            setFormError(msg);
        } finally {
            setFormSaving(false);
        }
    };

    // Open Cancel Modal
    const openCancelModal = (sess) => {
        setCancellingSession(sess);
        setCancelReason('');
        setCancelModalOpen(true);
    };

    const handleConfirmCancel = async (e) => {
        e.preventDefault();
        if (!cancelReason.trim()) return;

        setCancelling(true);
        try {
            const res = await sessionsApi.cancel(cancellingSession.session_id, cancelReason);
            if (res.data?.success) {
                showToast('Lecture session cancelled', 'success');
                setCancelModalOpen(false);
                fetchSessions();
            }
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to cancel session', 'error');
        } finally {
            setCancelling(false);
        }
    };

    // Open Reschedule Modal
    const openRescheduleModal = (sess) => {
        setReschedulingSession(sess);
        setNewDate(sess.session_date);
        setNewStartTime(sess.start_time?.slice(0, 5) || '10:00');
        setNewEndTime(sess.end_time?.slice(0, 5) || '12:00');
        setRescheduleLoc({
            building_id: sess.building_id,
            floor_id: sess.floor_id,
            floor_side_id: sess.floor_side_id,
            hall_id: sess.hall_id
        });
        setRescheduleReason('');
        setRescheduleError(null);
        setRescheduleModalOpen(true);
    };

    const handleConfirmReschedule = async (e) => {
        e.preventDefault();
        setRescheduleError(null);

        if (!rescheduleReason.trim()) {
            setRescheduleError('Please enter a reason for rescheduling');
            return;
        }

        setRescheduling(true);
        try {
            const payload = {
                new_date: newDate,
                new_start_time: newStartTime,
                new_end_time: newEndTime,
                new_hall_id: Number(rescheduleLoc.hall_id || reschedulingSession.hall_id),
                reason: rescheduleReason
            };

            const res = await sessionsApi.reschedule(reschedulingSession.session_id, payload);
            if (res.data?.success) {
                showToast('Lecture session rescheduled successfully', 'success');
                setRescheduleModalOpen(false);
                fetchSessions();
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.error || 'Target slot has a scheduling conflict';
            setRescheduleError(msg);
        } finally {
            setRescheduling(false);
        }
    };

    // Open Delete Dialog
    const openDeleteDialog = (sess) => {
        setDeletingSession(sess);
        setDeleteError(null);
        setDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!deletingSession) return;
        setDeleting(true);
        setDeleteError(null);
        try {
            const res = await sessionsApi.delete(deletingSession.session_id);
            if (res.data?.success) {
                showToast('Lecture session deleted successfully', 'success');
                setDeleteDialogOpen(false);
                fetchSessions();
            }
        } catch (err) {
            setDeleteError(err.response?.data?.message || 'Failed to delete session');
        } finally {
            setDeleting(false);
        }
    };

    const filteredSessions = sessions.filter((s) =>
        s.module_code.toLowerCase().includes(search.toLowerCase()) ||
        s.module_name.toLowerCase().includes(search.toLowerCase()) ||
        s.lecturer_name.toLowerCase().includes(search.toLowerCase()) ||
        s.hall_code.toLowerCase().includes(search.toLowerCase())
    );

    const ongoingCount = sessions.filter((s) => s.computed_status === 'Ongoing').length;
    const rescheduledCount = sessions.filter((s) => s.computed_status === 'Rescheduled').length;
    const cancelledCount = sessions.filter((s) => s.computed_status === 'Cancelled').length;

    const columns = [
        {
            header: 'Date & Time',
            accessor: 'session_date',
            cell: (row) => (
                <div className="text-xs space-y-0.5">
                    <div className="font-bold text-gray-900">{row.session_date}</div>
                    <div className="text-blue-600 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-blue-500" />
                        {row.start_time?.slice(0, 5)} - {row.end_time?.slice(0, 5)}
                    </div>
                </div>
            )
        },
        {
            header: 'Module & Details',
            accessor: 'module_code',
            cell: (row) => (
                <div>
                    <div className="font-bold text-blue-600 text-xs">{row.module_code}</div>
                    <div className="font-bold text-gray-900 text-xs">{row.module_name}</div>
                    {row.description && <div className="text-[11px] text-gray-400 font-medium">{row.description}</div>}
                </div>
            )
        },
        {
            header: 'Lecturer',
            accessor: 'lecturer_name',
            cell: (row) => <span className="text-xs font-semibold text-gray-800">{row.lecturer_name}</span>
        },
        {
            header: 'Hall & Type',
            accessor: 'hall_code',
            cell: (row) => (
                <div className="text-xs space-y-1">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-900 rounded font-mono font-bold border border-gray-200 inline-block">
                        {row.hall_code}
                    </span>
                    <div className="text-[11px] text-gray-500 font-medium">{row.session_type || 'Lecture'}</div>
                </div>
            )
        },
        {
            header: 'Status',
            accessor: 'computed_status',
            cell: (row) => (
                <div>
                    <StatusPill status={row.computed_status} />
                    {row.computed_status === 'Cancelled' && row.cancellation_reason && (
                        <div className="text-[11px] text-red-500 font-medium mt-1 italic">
                            Reason: {row.cancellation_reason}
                        </div>
                    )}
                    {row.computed_status === 'Rescheduled' && row.reschedule_reason && (
                        <div className="text-[11px] text-amber-600 font-medium mt-1 italic">
                            From: {row.original_hall_code || 'Old Hall'} • {row.reschedule_reason}
                        </div>
                    )}
                </div>
            )
        },
        {
            header: 'Actions',
            accessor: 'actions',
            className: 'text-right',
            cell: (row) => {
                const isCancelled = row.computed_status === 'Cancelled';
                return (
                    <div className="flex items-center justify-end gap-1.5">
                        <button
                            type="button"
                            onClick={() => openEditModal(row)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Session"
                        >
                            <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                            type="button"
                            onClick={() => openRescheduleModal(row)}
                            disabled={isCancelled}
                            className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-30"
                            title="Reschedule Session"
                        >
                            <Clock className="w-4 h-4" />
                        </button>

                        <button
                            type="button"
                            onClick={() => openCancelModal(row)}
                            disabled={isCancelled}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30"
                            title="Cancel Session"
                        >
                            <Ban className="w-4 h-4" />
                        </button>

                        <button
                            type="button"
                            onClick={() => openDeleteDialog(row)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hard Delete Session"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                );
            }
        }
    ];

    return (
        <div className="space-y-6">
            <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Lecture Sessions</h1>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                        Manage real-time lecture scheduling, venue hall allocation, lecturer assignments, and status
                    </p>
                </div>
                <button
                    type="button"
                    onClick={openAddModal}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Session</span>
                </button>
            </div>

            {/* Filter Bar */}
            <div className="space-y-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                    {/* Date Selector */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Session Date</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white font-semibold text-gray-800"
                        />
                    </div>

                    {/* Status Selector */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Status Filter</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white font-semibold text-gray-800"
                        >
                            <option value="">Status: All</option>
                            <option value="Ongoing">Ongoing</option>
                            <option value="Upcoming">Upcoming</option>
                            <option value="Rescheduled">Rescheduled</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>

                    {/* Cascading Location Selectors */}
                    <div className="lg:col-span-3">
                        <CascadingLocationSelect
                            selectedBuildingId={filterLoc.building_id}
                            selectedFloorId={filterLoc.floor_id}
                            selectedHallId={filterLoc.hall_id}
                            showFloorSide={false}
                            showHall={false}
                            onChange={(loc) => setFilterLoc((prev) => ({ ...prev, ...loc }))}
                        />
                    </div>

                    {/* Search */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Search</label>
                        <div className="relative">
                            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search..."
                                className="w-full pl-8 pr-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <StatCard title="TOTAL SCHEDULED" value={sessions.length} badgeText="Filtered" badgeColor="blue" icon={Calendar} />
                <StatCard title="ACTIVE ONGOING" value={ongoingCount} badgeText="Live" badgeColor="green" icon={Clock} />
                <StatCard title="RESCHEDULED" value={rescheduledCount} badgeText="Updated" badgeColor="amber" icon={Clock} />
                <StatCard title="CANCELLED" value={cancelledCount} badgeText="Notice" badgeColor="red" icon={Ban} />
            </div>

            {/* Sessions Table */}
            <DataTable
                columns={columns}
                data={filteredSessions}
                loading={loading}
                emptyMessage="No lecture sessions found for current filters."
            />

            {/* Add / Edit Session Modal */}
            <Modal
                isOpen={addModalOpen}
                onClose={() => setAddModalOpen(false)}
                title={editingSession ? 'Edit Lecture Session' : 'Add Lecture Session'}
                maxWidth="max-w-3xl"
            >
                <form onSubmit={handleFormSave} className="space-y-4">
                    {formError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{formError}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Module *</label>
                            <select
                                value={moduleId}
                                onChange={(e) => setModuleId(e.target.value)}
                                className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl font-medium"
                                required
                            >
                                <option value="">Select Module</option>
                                {modules.map((m) => (
                                    <option key={m.module_id} value={m.module_id}>
                                        {m.module_code} - {m.module_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Lecturer *</label>
                            <select
                                value={lecturerId}
                                onChange={(e) => setLecturerId(e.target.value)}
                                className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl font-medium"
                                required
                            >
                                <option value="">Select Lecturer</option>
                                {lecturers.map((l) => (
                                    <option key={l.lecturer_id} value={l.lecturer_id}>
                                        {l.full_name} ({l.lecturer_code})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Location Cascade */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <label className="block text-xs font-bold text-gray-700 mb-2">Venue Allocation Cascade *</label>
                        <CascadingLocationSelect
                            selectedBuildingId={formLoc.building_id}
                            selectedFloorId={formLoc.floor_id}
                            selectedFloorSideId={formLoc.floor_side_id}
                            selectedHallId={formLoc.hall_id}
                            onChange={(loc) => setFormLoc((prev) => ({ ...prev, ...loc }))}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Session Type</label>
                            <div className="flex items-center gap-4 pt-1">
                                <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                                    <input
                                        type="radio"
                                        name="stype"
                                        value="Lecture"
                                        checked={sessionType === 'Lecture'}
                                        onChange={() => setSessionType('Lecture')}
                                        className="text-blue-600"
                                    />
                                    <span>Lecture</span>
                                </label>
                                <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                                    <input
                                        type="radio"
                                        name="stype"
                                        value="Lab"
                                        checked={sessionType === 'Lab'}
                                        onChange={() => setSessionType('Lab')}
                                        className="text-blue-600"
                                    />
                                    <span>Laboratory</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Date *</label>
                            <input
                                type="date"
                                value={sessionDate}
                                onChange={(e) => setSessionDate(e.target.value)}
                                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl font-medium"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Start Time *</label>
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl font-medium"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">End Time *</label>
                            <input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl font-medium"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter session notes or topic outline..."
                            rows="2"
                            className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl font-medium"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => setAddModalOpen(false)}
                            className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={formSaving}
                            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md shadow-blue-600/30 transition-all disabled:opacity-50"
                        >
                            {formSaving ? 'Checking Overlap & Saving...' : 'Save Session'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Cancel Session Modal */}
            <Modal
                isOpen={cancelModalOpen}
                onClose={() => setCancelModalOpen(false)}
                title="Cancel Lecture Session"
                maxWidth="max-w-md"
            >
                <form onSubmit={handleConfirmCancel} className="space-y-4">
                    {cancellingSession && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs space-y-1">
                            <div className="font-bold text-red-900">{cancellingSession.module_code} - {cancellingSession.module_name}</div>
                            <div className="text-red-700 font-medium">
                                Lecturer: {cancellingSession.lecturer_name} | Hall: {cancellingSession.hall_code}
                            </div>
                            <div className="text-red-700 font-medium">
                                Schedule: {cancellingSession.session_date} ({cancellingSession.start_time?.slice(0, 5)} - {cancellingSession.end_time?.slice(0, 5)})
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Reason for Cancellation *</label>
                        <textarea
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="e.g. Lecturer unwell / Public holiday..."
                            rows="3"
                            className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl font-medium"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setCancelModalOpen(false)}
                            className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                        >
                            Back
                        </button>
                        <button
                            type="submit"
                            disabled={cancelling || !cancelReason.trim()}
                            className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl shadow-md shadow-red-600/30 transition-all disabled:opacity-50"
                        >
                            {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Reschedule Session Modal */}
            <Modal
                isOpen={rescheduleModalOpen}
                onClose={() => setRescheduleModalOpen(false)}
                title="Reschedule Lecture Session"
                maxWidth="max-w-2xl"
            >
                <form onSubmit={handleConfirmReschedule} className="space-y-4">
                    {rescheduleError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{rescheduleError}</span>
                        </div>
                    )}

                    {reschedulingSession && (
                        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                            <div className="font-bold text-slate-900 uppercase text-[10px] tracking-wider text-slate-400">Current Session Details</div>
                            <div className="font-bold text-slate-800">{reschedulingSession.module_code} - {reschedulingSession.module_name}</div>
                            <div className="text-slate-600 font-medium">
                                Current Slot: {reschedulingSession.session_date} @ {reschedulingSession.start_time?.slice(0, 5)} - {reschedulingSession.end_time?.slice(0, 5)} in {reschedulingSession.hall_code}
                            </div>
                        </div>
                    )}

                    <div className="border border-blue-200 bg-blue-50/50 p-4 rounded-2xl space-y-4">
                        <div className="text-xs font-bold text-blue-900 uppercase tracking-wider">New Slot & Venue</div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">New Date *</label>
                                <input
                                    type="date"
                                    value={newDate}
                                    onChange={(e) => setNewDate(e.target.value)}
                                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl font-medium bg-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">New Start Time *</label>
                                <input
                                    type="time"
                                    value={newStartTime}
                                    onChange={(e) => setNewStartTime(e.target.value)}
                                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl font-medium bg-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">New End Time *</label>
                                <input
                                    type="time"
                                    value={newEndTime}
                                    onChange={(e) => setNewEndTime(e.target.value)}
                                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl font-medium bg-white"
                                    required
                                />
                            </div>
                        </div>

                        {/* Location Select */}
                        <CascadingLocationSelect
                            selectedBuildingId={rescheduleLoc.building_id}
                            selectedFloorId={rescheduleLoc.floor_id}
                            selectedFloorSideId={rescheduleLoc.floor_side_id}
                            selectedHallId={rescheduleLoc.hall_id}
                            onChange={(loc) => setRescheduleLoc((prev) => ({ ...prev, ...loc }))}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Reason for Rescheduling *</label>
                        <textarea
                            value={rescheduleReason}
                            onChange={(e) => setRescheduleReason(e.target.value)}
                            placeholder="e.g. Hall maintenance issue / Time slot conflict..."
                            rows="2"
                            className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl font-medium"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setRescheduleModalOpen(false)}
                            className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={rescheduling}
                            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md shadow-blue-600/30 transition-all disabled:opacity-50"
                        >
                            {rescheduling ? 'Checking Overlap & Saving...' : 'Save Rescheduled Session'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleDelete}
                title="Hard Delete Lecture Session"
                message={`Are you sure you want to permanently delete session '${deletingSession?.module_code}' on ${deletingSession?.session_date}?`}
                loading={deleting}
                errorMessage={deleteError}
            />
        </div>
    );
};

export default LectureSessions;
