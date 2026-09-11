import { useState, useEffect, useRef } from 'react';

/**
 * Hook providing a live client-side clock ticking every second.
 * Seeded with server date/time string from signage polls and resynced on new polls.
 */
export function useLiveClock(serverDateStr, serverTimeStr) {
    const [now, setNow] = useState(new Date());
    const offsetRef = useRef(0);

    // Resync local clock when server date/time string updates from poll
    useEffect(() => {
        if (!serverDateStr || !serverTimeStr) return;

        try {
            // Parse server datetime ISO string (YYYY-MM-DD THH:mm:ss)
            const serverDateTime = new Date(`${serverDateStr}T${serverTimeStr}`);
            if (!isNaN(serverDateTime.getTime())) {
                const localSystemTime = new Date();
                // Store offset between local system time and server time
                offsetRef.current = serverDateTime.getTime() - localSystemTime.getTime();
                setNow(new Date(localSystemTime.getTime() + offsetRef.current));
            }
        } catch (e) {
            console.error('Error parsing server datetime:', e);
        }
    }, [serverDateStr, serverTimeStr]);

    // Tick forward every second
    useEffect(() => {
        const timer = setInterval(() => {
            const currentSystemTime = new Date();
            setNow(new Date(currentSystemTime.getTime() + offsetRef.current));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Formatters
    const formattedTime = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });

    const formattedDate = now.toLocaleDateString('en-US', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    return {
        now,
        formattedTime,
        formattedDate
    };
}
