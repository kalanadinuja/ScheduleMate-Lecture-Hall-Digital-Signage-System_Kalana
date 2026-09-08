/**
 * Validation helpers for API requests
 */

const isNonEmptyString = (val) => typeof val === 'string' && val.trim().length > 0;
const isPositiveInteger = (val) => Number.isInteger(Number(val)) && Number(val) > 0;
const isValidEmail = (val) => typeof val === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
const isValidDate = (val) => !isNaN(Date.parse(val));
const isValidTime = (val) => typeof val === 'string' && /^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/.test(val);

const validateBuilding = ({ building_code, building_name }) => {
    const errors = [];
    if (!isNonEmptyString(building_code)) errors.push('building_code is required');
    if (!isNonEmptyString(building_name)) errors.push('building_name is required');
    return errors;
};

const validateFloor = ({ building_id, floor_number }) => {
    const errors = [];
    if (!isPositiveInteger(building_id)) errors.push('Valid building_id is required');
    if (floor_number === undefined || floor_number === null || isNaN(Number(floor_number))) {
        errors.push('floor_number is required and must be a number');
    }
    return errors;
};

const validateFloorSide = ({ floor_id, side_name }) => {
    const errors = [];
    if (!isPositiveInteger(floor_id)) errors.push('Valid floor_id is required');
    if (!isNonEmptyString(side_name)) errors.push('side_name is required');
    return errors;
};

const validateLectureHall = ({ floor_side_id, hall_code, hall_name, capacity }) => {
    const errors = [];
    if (!isPositiveInteger(floor_side_id)) errors.push('Valid floor_side_id is required');
    if (!isNonEmptyString(hall_code)) errors.push('hall_code is required');
    if (!isNonEmptyString(hall_name)) errors.push('hall_name is required');
    if (!isPositiveInteger(capacity)) errors.push('capacity must be a positive integer (> 0)');
    return errors;
};

const validateModule = ({ module_code, module_name }) => {
    const errors = [];
    if (!isNonEmptyString(module_code)) errors.push('module_code is required');
    if (!isNonEmptyString(module_name)) errors.push('module_name is required');
    return errors;
};

const validateLecturer = ({ lecturer_code, full_name, email }) => {
    const errors = [];
    if (!isNonEmptyString(lecturer_code)) errors.push('lecturer_code is required');
    if (!isNonEmptyString(full_name)) errors.push('full_name is required');
    if (!isValidEmail(email)) errors.push('Valid email address is required');
    return errors;
};

const validateDigitalDisplay = ({ display_code, display_name, floor_side_id, refresh_interval_seconds }) => {
    const errors = [];
    if (!isNonEmptyString(display_code)) errors.push('display_code is required');
    if (!isNonEmptyString(display_name)) errors.push('display_name is required');
    if (!isPositiveInteger(floor_side_id)) errors.push('Valid floor_side_id is required');
    if (refresh_interval_seconds !== undefined && !isPositiveInteger(refresh_interval_seconds)) {
        errors.push('refresh_interval_seconds must be a positive integer');
    }
    return errors;
};

const validateSession = ({ module_id, lecturer_id, hall_id, session_date, start_time, end_time }) => {
    const errors = [];
    if (!isPositiveInteger(module_id)) errors.push('Valid module_id is required');
    if (!isPositiveInteger(lecturer_id)) errors.push('Valid lecturer_id is required');
    if (!isPositiveInteger(hall_id)) errors.push('Valid hall_id is required');
    if (!isValidDate(session_date)) errors.push('Valid session_date (YYYY-MM-DD) is required');
    if (!isValidTime(start_time)) errors.push('Valid start_time (HH:MM or HH:MM:SS) is required');
    if (!isValidTime(end_time)) errors.push('Valid end_time (HH:MM or HH:MM:SS) is required');

    if (start_time && end_time && start_time >= end_time) {
        errors.push('start_time must be earlier than end_time');
    }

    return errors;
};

module.exports = {
    validateBuilding,
    validateFloor,
    validateFloorSide,
    validateLectureHall,
    validateModule,
    validateLecturer,
    validateDigitalDisplay,
    validateSession
};
