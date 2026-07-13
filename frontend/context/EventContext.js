// frontend/context/EventContext.js
"use client";

import React, { createContext, useContext, useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

const EventContext = createContext();

function EventContextLogic({ children }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // Initialize from URL parameters, falling back to an empty string
    const urlEventId = searchParams.get("eventId");
    const [activeEventId, setActiveEventId] = useState(urlEventId || "");

    // Sync Context -> URL and LocalStorage whenever activeEventId changes
    useEffect(() => {
        if (activeEventId) {
            // Deprecating localStorage as the primary SSOT, but keeping it as a fallback cache
            localStorage.setItem("activeEventId", activeEventId);

            // Update the URL if it doesn't already have the correct eventId
            if (urlEventId !== activeEventId) {
                const params = new URLSearchParams(searchParams.toString());
                params.set("eventId", activeEventId);
                router.replace(`${pathname}?${params.toString()}`);
            }
        }
    }, [activeEventId, pathname, router, searchParams, urlEventId]);

    // Sync URL -> Context in case of direct navigation or sharing a link
    useEffect(() => {
        if (urlEventId && urlEventId !== activeEventId) {
            setActiveEventId(urlEventId);
        }
    }, [urlEventId]);

    return (
        <EventContext.Provider value={{ activeEventId, setActiveEventId }}>
            {children}
        </EventContext.Provider>
    );
}

export function EventContextProvider({ children }) {
    return (
        // Suspense boundary is required by Next.js when using useSearchParams()
        <Suspense fallback={<div>Loading Event Data...</div>}>
            <EventContextLogic>{children}</EventContextLogic>
        </Suspense>
    );
}

export function useEventContext() {
    return useContext(EventContext);
}