// frontend/context/EventContext.js
/**
 * @file frontend/context/EventContext.js
 * @description Centralized state management for tracking active event scopes.
 * Orchestrates bidirectional synchronization between the browser's local storage,
 * dynamic URL query boundaries, and React 19 application space.
 */

"use client";

import React, { createContext, useContext, useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

// Initialize context with 'undefined' to safely flag unprovided hook invocations
const EventContext = createContext(undefined);

/**
 * Handles the central core synchronizing operations of the event session tracking.
 */
function EventContextLogic({ children }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // Initialize state from URL query parameters to allow persistent sharing links[cite: 18]
    const urlEventId = searchParams.get("eventId");
    const [activeEventId, setActiveEventId] = useState(urlEventId || "");

    // Sync state to URL parameters and cache locally whenever user changes active focus[cite: 18]
    useEffect(() => {
        if (activeEventId) {
            // Keep localStorage as a backup client cache for page layout initialization[cite: 18]
            localStorage.setItem("activeEventId", activeEventId);

            // Dynamically replace the current URL search parameters if mismatched[cite: 18]
            if (urlEventId !== activeEventId) {
                const params = new URLSearchParams(searchParams.toString());
                params.set("eventId", activeEventId);
                router.replace(`${pathname}?${params.toString()}`);
            }
        }
    }, [activeEventId, pathname, router, searchParams, urlEventId]);

    // Track direct parameter input adjustments (such as pasting a link with a query token)[cite: 18]
    useEffect(() => {
        if (urlEventId && urlEventId !== activeEventId) {
            setActiveEventId(urlEventId);
        }
    }, [urlEventId, activeEventId]);

    return (
        <EventContext.Provider value={{ activeEventId, setActiveEventId }}>
            {children}
        </EventContext.Provider>
    );
}

/**
 * Primary React Context Provider Wrapper.
 * Embeds a Suspense wrapper around query operations to prevent Next.js SSG build compilation warnings[cite: 18].
 */
export function EventContextProvider({ children }) {
    return (
        <Suspense fallback={<div className="p-4 text-center text-xs text-neutral-400">Loading Event Data...</div>}>
            <EventContextLogic>{children}</EventContextLogic>
        </Suspense>
    );
}

/**
 * Safe, validated custom hook to consume the current active event context scope.
 * 
 * @throws {Error} If consumed outside of the `<EventContextProvider>` layout boundary.
 * @returns {{ activeEventId: string, setActiveEventId: React.Dispatch<React.SetStateAction<string>> }}
 */
export function useEventContext() {
    const context = useContext(EventContext);
    
    // Catch-all safety net: instantly highlights tree nesting mistakes during development
    if (context === undefined) {
        throw new Error(
            "useEventContext must be invoked safely within an active <EventContextProvider> layout tree."
        );
    }
    
    return context;
}