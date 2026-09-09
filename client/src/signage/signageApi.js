const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Public, unauthenticated API calls for digital signage displays.
 * Does not send Authorization header and operates independently of auth token storage.
 */
export const signageApi = {
    getSignageData: async (displayCode) => {
        const response = await fetch(`${API_BASE_URL}/signage/${encodeURIComponent(displayCode)}`, {
            headers: {
                'Accept': 'application/json'
            }
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const error = new Error(errorData.message || `Failed to fetch signage data (${response.status})`);
            error.status = response.status;
            throw error;
        }
        return response.json();
    },

    getRoomStatusData: async (displayCode) => {
        const response = await fetch(`${API_BASE_URL}/signage/${encodeURIComponent(displayCode)}/room-status`, {
            headers: {
                'Accept': 'application/json'
            }
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const error = new Error(errorData.message || `Failed to fetch room status data (${response.status})`);
            error.status = response.status;
            throw error;
        }
        return response.json();
    }
};
