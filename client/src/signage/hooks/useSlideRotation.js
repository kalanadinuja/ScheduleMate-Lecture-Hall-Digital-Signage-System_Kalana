import { useState, useEffect, useMemo } from 'react';

export const SLIDE_DURATION_MS = 8000;

export const SLIDES = {
    ONGOING: 'ongoing',
    UPCOMING: 'upcoming',
    ROOM_STATUS: 'room_status',
    SESSION_UPDATES: 'session_updates'
};

/**
 * Hook managing automated slide rotation on an 8-second interval.
 * Dynamically includes or excludes the Session Updates slide based on data presence.
 */
export function useSlideRotation(cancelledCount = 0, rescheduledCount = 0) {
    const hasUpdates = (cancelledCount + rescheduledCount) > 0;

    // Available slides sequence
    const availableSlides = useMemo(() => {
        const list = [SLIDES.ONGOING, SLIDES.UPCOMING, SLIDES.ROOM_STATUS];
        if (hasUpdates) {
            list.push(SLIDES.SESSION_UPDATES);
        }
        return list;
    }, [hasUpdates]);

    const [currentIndex, setCurrentIndex] = useState(0);

    // If current index is out of bounds (e.g. session updates removed after poll update)
    useEffect(() => {
        if (currentIndex >= availableSlides.length) {
            setCurrentIndex(0);
        }
    }, [availableSlides, currentIndex]);

    // Timer loop
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex(prevIndex => (prevIndex + 1) % availableSlides.length);
        }, SLIDE_DURATION_MS);

        return () => clearInterval(timer);
    }, [availableSlides]);

    const currentSlide = availableSlides[currentIndex] || SLIDES.ONGOING;

    return {
        currentSlide,
        slideIndex: currentIndex,
        totalSlides: availableSlides.length,
        slideDuration: SLIDE_DURATION_MS,
        hasUpdates
    };
}
