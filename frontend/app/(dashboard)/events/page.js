/**
 * @file frontend/app/(dashboard)/events/page.js
 * @description Events landing matrix utilizing normalized database entities to provide
 * clean interface sorting, query matching, workflow activation, and session boundary configurations.
 */

"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import DataTable from "@/components/molecules/DataTable";
import SearchBar from "@/components/molecules/SearchBar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { useEventContext } from "@/context/EventContext";

/**
 * Reusable State-Driven Action Dropdown component for table records.
 * Integrates contextual navigation mapping with global single source of truth mutations.
 */
const ActionDropdown = ({ event }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { updateActiveEvent } = useEventContext();
  const dropdownRef = useRef(null);

  // Safely close the drop-down wrapper if a pointer click occurs outside the element container
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-neutral-400 hover:text-neutral-700 text-lg font-bold px-2 rounded hover:bg-neutral-100 transition-colors"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        ···
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50 overflow-hidden border border-neutral-100 animate-fadeIn">
          <div className="py-1">
            <button
              type="button"
              onClick={() => {
                updateActiveEvent(event.id);
                setIsOpen(false);
              }}
              className="block w-full text-left px-4 py-2.5 text-sm font-medium text-purple-700 hover:bg-purple-50 transition-colors"
            >
              Set as Active Pipeline
            </button>
            <Link
              href={`/events/${event.id}/edit`}
              className="block w-full text-left px-4 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
            >
              Edit Configuration
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default function EventsPage() {
  const [query, setQuery] = useState("");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Populate global records data pipeline from remote database instance on mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/v1/events", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          // Normalize retrieved records immediately to resolve schema primary identifier gaps
          const normalizedEvents = data.data.map((event) => ({
            ...event,
            id: event.id || event._id, 
          }));
          setEvents(normalizedEvents);
        } else {
          setError(data.message || "Failed to fetch events");
        }
      } catch (err) {
        setError("Network error occurred while synchronization was executing.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Compute character search queries matching layout configurations
  const filtered = useMemo(
    () => events.filter((e) => e.title && e.title.toLowerCase().includes(query.toLowerCase())),
    [query, events]
  );

  // Column Definitions Map feeding the standard DataTable component matrix
  const columns = [
    {
      key: "title",
      label: "Event Name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600 font-bold">
            {row.title.charAt(0)}
          </div>
          <span className="font-medium text-neutral-800">{row.title}</span>
        </div>
      ),
    },
    { key: "date", label: "Date", render: (row) => new Date(row.date).toLocaleDateString() },
    { key: "eventType", label: "Type", render: (row) => <span className="capitalize">{row.eventType}</span> },
    { key: "guestCount", label: "Guests" },
    { key: "status", label: "Status", render: (row) => <Badge status={row.layout ? "confirmed" : "planning"} /> },
    {
      key: "action",
      label: "Action",
      render: (row) => <ActionDropdown event={row} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Table Header Interactivity Dashboard Actions Panel */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="secondary" className="px-3 py-1.5 text-xs">
              ← Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-neutral-900">Events</h1>
        </div>
        
        {/* Next.js client routing gateway wrapping onboarding configurations */}
        <Link href="/onboarding">
          <Button>+ New Event</Button>
        </Link>
      </div>

      {/* Local Searching Content Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar id="events-search" value={query} onChange={setQuery} placeholder="Search Events" />
      </div>

      {/* Exception Error Guard Banner Feedback */}
      {error && (
        <div className="text-red-500 bg-red-50 px-4 py-2 rounded-xl text-sm font-medium border border-red-100">
          {error}
        </div>
      )}

      {/* Hydration Screen Conditional Loading Matrix Block */}
      {loading ? (
        <div className="py-10 text-center text-sm font-medium text-neutral-500 animate-pulse">
          Synchronizing event matrix...
        </div>
      ) : (
        <DataTable columns={columns} rows={filtered} caption="List of active planner events managed from context tracker" />
      )}
    </div>
  );
}