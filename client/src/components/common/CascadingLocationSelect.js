import React, { useState, useEffect } from 'react';
import { buildingsApi, floorsApi, floorSidesApi, lectureHallsApi } from '../../api';

const CascadingLocationSelect = ({
    selectedBuildingId,
    selectedFloorId,
    selectedFloorSideId,
    selectedHallId,
    onChange,
    showHall = true,
    showFloorSide = true,
    layout = 'horizontal', // 'horizontal' | 'vertical'
    disabled = false
}) => {
    const [buildings, setBuildings] = useState([]);
    const [floors, setFloors] = useState([]);
    const [floorSides, setFloorSides] = useState([]);
    const [halls, setHalls] = useState([]);

    useEffect(() => {
        buildingsApi.getAll().then((res) => {
            if (res.data?.success) setBuildings(res.data.data);
        }).catch(() => {});
    }, []);

    useEffect(() => {
        if (selectedBuildingId) {
            floorsApi.getAll(selectedBuildingId).then((res) => {
                if (res.data?.success) setFloors(res.data.data);
            }).catch(() => setFloors([]));
        } else {
            setFloors([]);
        }
    }, [selectedBuildingId]);

    useEffect(() => {
        if (selectedFloorId) {
            floorSidesApi.getAll(selectedFloorId, selectedBuildingId).then((res) => {
                if (res.data?.success) setFloorSides(res.data.data);
            }).catch(() => setFloorSides([]));
        } else {
            setFloorSides([]);
        }
    }, [selectedFloorId, selectedBuildingId]);

    useEffect(() => {
        if (showHall && selectedFloorSideId) {
            lectureHallsApi.getAll({ floor_side_id: selectedFloorSideId }).then((res) => {
                if (res.data?.success) setHalls(res.data.data);
            }).catch(() => setHalls([]));
        } else {
            setHalls([]);
        }
    }, [showHall, selectedFloorSideId]);

    const handleBuildingChange = (e) => {
        const val = e.target.value ? Number(e.target.value) : '';
        onChange({
            building_id: val,
            floor_id: '',
            floor_side_id: '',
            hall_id: ''
        });
    };

    const handleFloorChange = (e) => {
        const val = e.target.value ? Number(e.target.value) : '';
        onChange({
            building_id: selectedBuildingId,
            floor_id: val,
            floor_side_id: '',
            hall_id: ''
        });
    };

    const handleFloorSideChange = (e) => {
        const val = e.target.value ? Number(e.target.value) : '';
        onChange({
            building_id: selectedBuildingId,
            floor_id: selectedFloorId,
            floor_side_id: val,
            hall_id: ''
        });
    };

    const handleHallChange = (e) => {
        const val = e.target.value ? Number(e.target.value) : '';
        onChange({
            building_id: selectedBuildingId,
            floor_id: selectedFloorId,
            floor_side_id: selectedFloorSideId,
            hall_id: val
        });
    };

    const containerClass = layout === 'vertical' ? 'space-y-3' : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3';

    return (
        <div className={containerClass}>
            {/* Building Dropdown */}
            <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Building</label>
                <select
                    value={selectedBuildingId || ''}
                    onChange={handleBuildingChange}
                    disabled={disabled}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                >
                    <option value="">Building: All</option>
                    {buildings.map((b) => (
                        <option key={b.building_id} value={b.building_id}>
                            {b.building_code} - {b.building_name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Floor Dropdown */}
            <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Floor</label>
                <select
                    value={selectedFloorId || ''}
                    onChange={handleFloorChange}
                    disabled={disabled || !selectedBuildingId}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium disabled:bg-gray-50 disabled:opacity-60"
                >
                    <option value="">Floor: All</option>
                    {floors.map((f) => (
                        <option key={f.floor_id} value={f.floor_id}>
                            {f.floor_name || `Floor ${f.floor_number}`}
                        </option>
                    ))}
                </select>
            </div>

            {/* Floor Side Dropdown */}
            {showFloorSide && (
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Floor Side</label>
                    <select
                        value={selectedFloorSideId || ''}
                        onChange={handleFloorSideChange}
                        disabled={disabled || !selectedFloorId}
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium disabled:bg-gray-50 disabled:opacity-60"
                    >
                        <option value="">Floor Side: All</option>
                        {floorSides.map((fs) => (
                            <option key={fs.floor_side_id} value={fs.floor_side_id}>
                                {fs.side_name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Lecture Hall Dropdown */}
            {showHall && (
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Lecture Hall</label>
                    <select
                        value={selectedHallId || ''}
                        onChange={handleHallChange}
                        disabled={disabled || !selectedFloorSideId}
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium disabled:bg-gray-50 disabled:opacity-60"
                    >
                        <option value="">Hall: All</option>
                        {halls.map((h) => (
                            <option key={h.hall_id} value={h.hall_id}>
                                {h.hall_code} - {h.hall_name}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
};

export default CascadingLocationSelect;
