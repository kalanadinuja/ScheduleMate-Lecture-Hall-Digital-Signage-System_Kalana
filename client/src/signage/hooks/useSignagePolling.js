import { useState, useEffect, useRef, useCallback } from 'react';
import { signageApi } from '../signageApi';

/**
 * Hook for resilient polling of public signage endpoints.
 * Keeps showing last known good data during transient network/server failures with a reconnecting indicator.
 */
export function useSignagePolling(displayCode) {
    const [data, setData] = useState(null);
    const [roomStatus, setRoomStatus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isReconnecting, setIsReconnecting] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    const hasLoadedInitialRef = useRef(false);

    const fetchData = useCallback(async () => {
        if (!displayCode) return;

        try {
            const [signageRes, roomStatusRes] = await Promise.all([
                signageApi.getSignageData(displayCode),
                signageApi.getRoomStatusData(displayCode)
            ]);

            const signagePayload = signageRes.data || signageRes;
            const roomStatusPayload = roomStatusRes.data || roomStatusRes;

            setData(signagePayload);
            setRoomStatus(Array.isArray(roomStatusPayload) ? roomStatusPayload : []);
            setLastUpdated(new Date());
            setError(null);
            setIsReconnecting(false);
            setNotFound(false);
            hasLoadedInitialRef.current = true;
        } catch (err) {
            console.error('Signage poll failed:', err);

            if (err.status === 404) {
                if (!hasLoadedInitialRef.current) {
                    setNotFound(true);
                } else {
                    // Subsequent 404 while polling
                    setIsReconnecting(true);
                }
            } else {
                if (hasLoadedInitialRef.current) {
                    // Retain existing data and display unobtrusive reconnecting status
                    setIsReconnecting(true);
                } else {
                    setError(err.message || 'Failed to connect to digital signage service');
                }
            }
        } finally {
            setLoading(false);
        }
    }, [displayCode]);

    useEffect(() => {
        setLoading(true);
        setError(null);
        setNotFound(false);
        setIsReconnecting(false);
        hasLoadedInitialRef.current = false;

        fetchData();
    }, [displayCode, fetchData]);

    // Interval polling
    useEffect(() => {
        const intervalSec = data?.refresh_interval_seconds || 30;
        const intervalMs = Math.max(intervalSec, 5) * 1000;

        const timer = setInterval(() => {
            fetchData();
        }, intervalMs);

        return () => clearInterval(timer);
    }, [fetchData, data?.refresh_interval_seconds]);

    return {
        data,
        roomStatus,
        loading,
        error,
        isReconnecting,
        notFound,
        lastUpdated
    };
}
