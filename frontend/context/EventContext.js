/**
 * @file frontend/context/EventContext.js
 * @description Centralized state management for tracking active event scopes.
 * Orchestrates bidirectional synchronization between backend REST pipelines, browser local storage,
 * dynamic URL query boundaries, and the React application space.
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

    // Initialize state from URL query parameters to allow persistent sharing links
    const urlEventId = searchParams.get("eventId");
    const [activeEventId, setActiveEventId] = useState(urlEventId || "");
    const [events, setEvents] = useState([]);

    // =========================================================================
    // PIPELINE HYDRATION (Method 1 Data Sync & LocalStorage Fallback)
    // =========================================================================
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;
                const res = await fetch("/api/v1/events", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    setEvents(data.data);
                }
            } catch (err) {
                console.error("Event context synchronization failed:", err);
            }
        };
        
        fetchEvents();

        // Rehydrate active event from persistent local cache only if URL query parameter is missing
        if (!urlEventId) {
            const storedId = localStorage.getItem("activeEventId");
            if (storedId) {
                setActiveEventId(storedId);
            }
        }
    }, [urlEventId]);

    // =========================================================================
    // STATE TO ROUTER SYNCHRONIZATION (Method 2 Multi-surface Push)
    // =========================================================================
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());

        if (activeEventId) {
            // Keep localStorage as a backup client cache for page layout initialization
            localStorage.setItem("activeEventId", activeEventId);

            // Dynamically replace the current URL search parameters if mismatched
            if (urlEventId !== activeEventId) {
                params.set("eventId", activeEventId);
                router.replace(`${pathname}?${params.toString()}`);
            }
        } else {
            // Clear both historical cache tracks when active scope is unassigned
            localStorage.removeItem("activeEventId");
            if (params.has("eventId")) {
                params.delete("eventId");
                router.replace(`${pathname}?${params.toString()}`);
            }
        }
    }, [activeEventId, pathname, router, searchParams, urlEventId]);

    // Track direct parameter input adjustments (such as pasting a link with a query token)
    useEffect(() => {
        if (urlEventId && urlEventId !== activeEventId) {
            setActiveEventId(urlEventId);
        }
    }, [urlEventId, activeEventId]);

    // Backward-compatible explicit mutation abstraction wrapper
    const updateActiveEvent = (id) => {
        setActiveEventId(id || "");
    };

    return (
        <EventContext.Provider value={{ activeEventId, setActiveEventId, updateActiveEvent, events }}>
            {children}
        </EventContext.Provider>
    );
}

/**
 * Primary React Context Provider Wrapper.
 * Embeds a Suspense wrapper around query operations to prevent Next.js SSG build compilation warnings.
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
 * @returns {{ 
 *   activeEventId: string, 
 *   setActiveEventId: React.Dispatch<React.SetStateAction<string>>,
 *   updateActiveEvent: (id: string) => void,
 *   events: Array<object>
 * }}
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