import { useState, useEffect, useMemo } from 'react';

export const SLIDE_DURATION_MS = 30000;
export const PAGE_DURATION_MS = 10000;

export const SLIDES = {
    ONGOING: 'ongoing',
    UPCOMING: 'upcoming',
    ROOM_STATUS: 'room_status',
    SESSION_UPDATES: 'session_updates'
};

/**
 * Hook managing automated slide rotation with two-tier durations and multi-page pagination.
 *
 * Rules:
 * - Empty slides (0 items): 10 seconds (PAGE_DURATION_MS) for Ongoing and Upcoming.
 * - Single-page slides (1-3 items): 30 seconds (SLIDE_DURATION_MS) for Ongoing, Upcoming, and Session Updates.
 * - Room Status: always single page, 30 seconds (SLIDE_DURATION_MS).
 * - Multi-page slides (4+ items): 10 seconds per page (PAGE_DURATION_MS), paginated 3 items per page.
 * - Session Updates: skipped entirely if 0 cancelled AND 0 rescheduled sessions today.
 * - Slide sequence: Ongoing -> Upcoming -> Room Status -> Session Updates (if any) -> loop to Ongoing.
 * - Never loops within the same slide.
 */
export function useSlideRotation(arg1 = 0, arg2 = 0, arg3 = 0, arg4 = 0) {
    let ongoingCount = 0;
    let upcomingCount = 0;
    let cancelledCount = 0;
    let rescheduledCount = 0;

    if (typeof arg1 === 'object' && arg1 !== null) {
        ongoingCount = Number(arg1.ongoingCount ?? (arg1.ongoingSessions?.length || 0)) || 0;
        upcomingCount = Number(arg1.upcomingCount ?? (arg1.upcomingSessions?.length || 0)) || 0;
        cancelledCount = Number(arg1.cancelledCount ?? (arg1.cancelledSessions?.length || 0)) || 0;
        rescheduledCount = Number(arg1.rescheduledCount ?? (arg1.rescheduledSessions?.length || 0)) || 0;
    } else if (arguments.length >= 3) {
        ongoingCount = Number(arg1) || 0;
        upcomingCount = Number(arg2) || 0;
        cancelledCount = Number(arg3) || 0;
        rescheduledCount = Number(arg4) || 0;
    } else {
        // Legacy 2-argument signature: (cancelledCount, rescheduledCount)
        cancelledCount = Number(arg1) || 0;
        rescheduledCount = Number(arg2) || 0;
    }

    const hasUpdates = (cancelledCount + rescheduledCount) > 0;

    // Available unique slides sequence
    const availableSlides = useMemo(() => {
        const list = [SLIDES.ONGOING, SLIDES.UPCOMING, SLIDES.ROOM_STATUS];
        if (hasUpdates) {
            list.push(SLIDES.SESSION_UPDATES);
        }
        return list;
    }, [hasUpdates]);

    // Build flat sequence of rotation steps (slides & pages)
    const steps = useMemo(() => {
        const list = [];

        // 1. Ongoing Sessions
        if (ongoingCount === 0) {
            list.push({ slide: SLIDES.ONGOING, page: 0, totalPages: 1, duration: PAGE_DURATION_MS });
        } else if (ongoingCount <= 3) {
            list.push({ slide: SLIDES.ONGOING, page: 0, totalPages: 1, duration: SLIDE_DURATION_MS });
        } else {
            const pages = Math.ceil(ongoingCount / 3);
            for (let p = 0; p < pages; p++) {
                list.push({ slide: SLIDES.ONGOING, page: p, totalPages: pages, duration: PAGE_DURATION_MS });
            }
        }

        // 2. Upcoming Sessions
        if (upcomingCount === 0) {
            list.push({ slide: SLIDES.UPCOMING, page: 0, totalPages: 1, duration: PAGE_DURATION_MS });
        } else if (upcomingCount <= 3) {
            list.push({ slide: SLIDES.UPCOMING, page: 0, totalPages: 1, duration: SLIDE_DURATION_MS });
        } else {
            const pages = Math.ceil(upcomingCount / 3);
            for (let p = 0; p < pages; p++) {
                list.push({ slide: SLIDES.UPCOMING, page: p, totalPages: pages, duration: PAGE_DURATION_MS });
            }
        }

        // 3. Room Status (always single page — all halls)
        list.push({ slide: SLIDES.ROOM_STATUS, page: 0, totalPages: 1, duration: SLIDE_DURATION_MS });

        // 4. Session Updates (if any)
        const updateCount = cancelledCount + rescheduledCount;
        if (updateCount > 0) {
            if (updateCount <= 3) {
                list.push({ slide: SLIDES.SESSION_UPDATES, page: 0, totalPages: 1, duration: SLIDE_DURATION_MS });
            } else {
                const pages = Math.ceil(updateCount / 3);
                for (let p = 0; p < pages; p++) {
                    list.push({ slide: SLIDES.SESSION_UPDATES, page: p, totalPages: pages, duration: PAGE_DURATION_MS });
                }
            }
        }

        return list;
    }, [ongoingCount, upcomingCount, cancelledCount, rescheduledCount]);

    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    // Keep step index within bounds if data changes
    useEffect(() => {
        if (currentStepIndex >= steps.length) {
            setCurrentStepIndex(0);
        }
    }, [steps.length, currentStepIndex]);

    // Timer loop with per-step duration (10s or 30s)
    useEffect(() => {
        if (!steps || steps.length === 0) return;

        const currentStep = steps[currentStepIndex] || steps[0];
        const duration = currentStep?.duration || SLIDE_DURATION_MS;

        const timer = setTimeout(() => {
            setCurrentStepIndex(prevIndex => (prevIndex + 1) % steps.length);
        }, duration);

        return () => clearTimeout(timer);
    }, [currentStepIndex, steps]);

    const safeIndex = currentStepIndex < steps.length ? currentStepIndex : 0;
    const currentStep = steps[safeIndex] || {
        slide: SLIDES.ONGOING,
        page: 0,
        totalPages: 1,
        duration: PAGE_DURATION_MS
    };

    const currentSlide = currentStep.slide;
    const currentPage = currentStep.page;
    const totalPages = currentStep.totalPages;
    const currentDuration = currentStep.duration;
    const slideIndex = availableSlides.indexOf(currentSlide);

    return {
        currentSlide,
        currentPage,
        pageNumber: currentPage + 1,
        totalPages,
        currentDuration,
        slideDuration: currentDuration,
        stepIndex: safeIndex,
        totalSteps: steps.length,
        slideIndex: slideIndex >= 0 ? slideIndex : 0,
        totalSlides: availableSlides.length,
        availableSlides,
        hasUpdates
    };
}
