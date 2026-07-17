/**
 * @file frontend/app/(dashboard)/events/page.js
 * @description Events landing matrix utilizing normalized database entities. Enhanced with an
 * isolated action context dropdown component and a hovering Event Configuration Workspace Modal with Groq AI Advisor telemetry.
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
 * Integrates instance-level click containment hooks to prevent row visibility conflicts.
 */
const ActionDropdown = ({ event, onOpenConfig }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { updateActiveEvent } = useEventContext();
  const dropdownRef = useRef(null);

  // Safely close the dropdown if an interaction occurs outside the element container
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
    <div className="relative inline-block text-left" ref={dropdownRef} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-neutral-400 hover:text-neutral-700 text-lg font-bold px-2 py-1 rounded-lg hover:bg-neutral-100 transition-colors"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        ···
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 rounded-xl border border-neutral-200 bg-white shadow-xl z-30 py-1.5 animate-in fade-in slide-in-from-top-1 duration-100">
          <button
            type="button"
            onClick={() => {
              updateActiveEvent(event.id);
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50 transition-colors flex items-center gap-2"
          >
            🎯 Set as Active Pipeline
          </button>
          
          <button
            type="button"
            onClick={() => {
              onOpenConfig(event);
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-purple-50 hover:text-purple-700 transition-colors flex items-center gap-2"
          >
            ⚙️ Edit Configuration
          </button>

          <div className="border-t border-neutral-100 my-1" />

          <Link href={`/designer?eventId=${event.id}`}>
            <span className="block px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors">
              📐 Open 3D Designer
            </span>
          </Link>
          
          <Link href={`/reports?eventId=${event.id}`}>
            <span className="block px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors">
              📊 Performance Report
            </span>
          </Link>
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

  // Modal Workspace State Management
  const [configEvent, setConfigEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Groq AI Advisor Telemetry States
  const [aiPrompt, setAiPrompt] = useState("");
  const [advisorPlan, setAdvisorPlan] = useState("");
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [advisorError, setAdvisorError] = useState("");

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/v1/events", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        // Normalize MongoDB schemas mapping _id definitions to unified keys
        const normalizedEvents = data.data.map((event) => ({
          ...event,
          id: event.id || event._id
        }));
        setEvents(normalizedEvents);

        // Dynamic synchronization update: If workspace overlay is active, refresh metadata variables
        if (configEvent) {
          const updated = normalizedEvents.find(e => e.id === configEvent.id);
          if (updated) setConfigEvent(updated);
        }
      } else {
        setError(data.message || "Failed to fetch event matrices from target system.");
      }
    } catch (err) {
      setError("Network layer synchronization fault occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filtered = useMemo(
    () => events.filter((e) => e.title && e.title.toLowerCase().includes(query.toLowerCase())),
    [query, events]
  );

  const openConfigurationModal = (eventObj) => {
    setConfigEvent(eventObj);
    setAdvisorPlan(eventObj.latestAdvisoryPlan?.plan || "");
    setAiPrompt("");
    setAdvisorError("");
    setIsModalOpen(true);
    
    // Seed browser environment cache fallback configuration safely
    localStorage.setItem("activeEventId", eventObj.id);
  };

  const handleExecuteAdvisorPrompt = async (e) => {
    e.preventDefault();
    if (!aiPrompt.trim() || !configEvent) return;

    setGeneratingPlan(true);
    setAdvisorError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/v1/ai/advisor-plan", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ eventId: configEvent.id, prompt: aiPrompt }),
      });
      
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "The AI Advisor could not compile an execution plan.");
      
      setAdvisorPlan(data.data.plan);
      
      // Force immediate client collection rehydration to pass payload mutations downstream
      await fetchEvents();
    } catch (err) {
      console.error("Advisor configuration execution exception:", err);
      setAdvisorError(err.message || "The AI Advisor pipeline is temporarily unavailable.");
    } finally {
      setGeneratingPlan(false);
    }
  };

  const columns = [
    {
      key: "title", 
      label: "Event Name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600 font-bold">
            {row.title?.charAt(0) || "E"}
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
      render: (row) => (
        <ActionDropdown event={row} onOpenConfig={openConfigurationModal} />
      ),
    },
  ];

  return (
    <div className="space-y-6 relative">
      {/* Top Application Navigation Control Banner Panel */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="secondary" className="px-3 py-1.5 text-xs">← Back to Dashboard</Button>
          </Link>        
          <h1 className="text-2xl font-bold text-neutral-900">Events</h1>
        </div>
        
        <Link href="/onboarding">
          <Button type="button">+ New Event</Button>
        </Link>
      </div>

      {/* Query Search Matrix Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar id="events-search" value={query} onChange={setQuery} placeholder="Search Events..." />
      </div>
      
      {error && (
        <div className="text-red-500 bg-red-50 px-4 py-2 rounded-xl text-sm font-medium border border-red-100 animate-fadeIn">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="py-10 text-center text-sm font-medium text-neutral-500 animate-pulse">
          Synchronizing event matrix...
        </div>
      ) : (
        <DataTable columns={columns} rows={filtered} caption="List of events available to active workspace session boundary" />
      )}

      {/* Hovering Event Configuration Workspace Overlays (Method 2 Layout Core) */}
      {isModalOpen && configEvent && (
        <div 
          className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex justify-end animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="w-full max-w-2xl bg-neutral-50 h-full shadow-2xl flex flex-col overflow-y-auto p-6 border-l border-neutral-200 animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Overlay Navigation Headers */}
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4 mb-6">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-purple-600 bg-purple-50 border border-purple-100 px-2.5 py-1 rounded-full">
                  Event Workspace Hub
                </span>
                <h2 className="text-xl font-black text-neutral-900 mt-1.5">{configEvent.title}</h2>
              </div>
              <button 
                type="button"
                onClick={() => setIsOpenModal(false) || setIsModalOpen(false)}
                className="rounded-xl border border-neutral-200 bg-white p-2 text-xs font-bold text-neutral-500 hover:bg-neutral-100 transition-colors shadow-sm"
              >
                ✕ Close Workspace
              </button>
            </div>

            {/* Event Metrics Registry Deck */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
              <div className="bg-white border border-neutral-200 p-3 rounded-xl shadow-sm">
                <p className="text-[10px] font-bold text-neutral-400 uppercase">Event Type</p>
                <p className="text-sm font-bold text-neutral-800 capitalize mt-0.5">{configEvent.eventType || "N/A"}</p>
              </div>
              <div className="bg-white border border-neutral-200 p-3 rounded-xl shadow-sm">
                <p className="text-[10px] font-bold text-neutral-400 uppercase">Guest Metrics</p>
                <p className="text-sm font-bold text-purple-600 mt-0.5">{configEvent.guestCount || 0} Attending</p>
              </div>
              <div className="bg-white border border-neutral-200 p-3 rounded-xl shadow-sm">
                <p className="text-[10px] font-bold text-neutral-400 uppercase">Financial Cap</p>
                <p className="text-sm font-bold text-green-600 mt-0.5">ksh {(configEvent.budget?.total || 0).toLocaleString()}</p>
              </div>
              <div className="bg-white border border-neutral-200 p-3 rounded-xl shadow-sm">
                <p className="text-[10px] font-bold text-neutral-400 uppercase">Mesh Status</p>
                <p className="text-sm font-bold text-neutral-800 mt-0.5">{configEvent.layout ? "✓ Plotted" : "Planning"}</p>
              </div>
            </div>

            {/* Cross-Workspace Routing Architecture Map */}
            <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm mb-6">
              <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-3">Jump To Application Functional Workspaces</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <Link href={`/designer?eventId=${configEvent.id}`} className="flex items-center gap-2 rounded-xl bg-neutral-50 border border-neutral-200 p-2.5 text-xs font-bold text-neutral-700 hover:border-purple-400 hover:bg-purple-50/40 transition-colors">
                  📐 3D Spatial Designer
                </Link>
                <Link href={`/budget?eventId=${configEvent.id}`} className="flex items-center gap-2 rounded-xl bg-neutral-50 border border-neutral-200 p-2.5 text-xs font-bold text-neutral-700 hover:border-purple-400 hover:bg-purple-50/40 transition-colors">
                  💰 Budget Analytics
                </Link>
                <Link href={`/guests?eventId=${configEvent.id}`} className="flex items-center gap-2 rounded-xl bg-neutral-50 border border-neutral-200 p-2.5 text-xs font-bold text-neutral-700 hover:border-purple-400 hover:bg-purple-50/40 transition-colors">
                  👥 Guest Registry
                </Link>
                <Link href={`/messages?eventId=${configEvent.id}`} className="flex items-center gap-2 rounded-xl bg-neutral-50 border border-neutral-200 p-2.5 text-xs font-bold text-neutral-700 hover:border-purple-400 hover:bg-purple-50/40 transition-colors">
                  💬 Secure Channels
                </Link>
                <Link href={`/reports?eventId=${configEvent.id}`} className="flex items-center gap-2 rounded-xl bg-neutral-50 border border-neutral-200 p-2.5 text-xs font-bold text-neutral-700 hover:border-purple-400 hover:bg-purple-50/40 transition-colors">
                  📊 Reports Engine
                </Link>
                <Link href={`/calendar?eventId=${configEvent.id}`} className="flex items-center gap-2 rounded-xl bg-neutral-50 border border-neutral-200 p-2.5 text-xs font-bold text-neutral-700 hover:border-purple-400 hover:bg-purple-50/40 transition-colors">
                  📅 Master Calendar
                </Link>
              </div>
            </div>

            {/* Embedded Groq Advisor Intelligence Core Interface */}
            <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm flex-1 flex flex-col min-h-[320px]">
              <h3 className="text-xs font-bold text-neutral-900 border-b border-neutral-100 pb-2.5 mb-4 flex items-center gap-2">
                <span>🔮</span> Groq AI Tactical Optimization Advisor
              </h3>

              <form onSubmit={handleExecuteAdvisorPrompt} className="space-y-3">
                <div>
                  <label htmlFor="modal-ai-prompt" className="text-[11px] text-neutral-400 font-bold uppercase block mb-1">Compute Direct Workspace Goals</label>
                  <textarea
                    id="modal-ai-prompt"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="E.g., Recalculate logistical safety margins for catering setup given our guest count parameters..."
                    className="w-full text-xs p-3 border border-neutral-200 rounded-xl focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all resize-none"
                    rows={3}
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={generatingPlan || !aiPrompt.trim()} 
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
                >
                  {generatingPlan ? "Consulting Groq LLM pipelines..." : "Generate Advisory Optimization Plan"}
                </button>
              </form>

              {advisorError && <p className="mt-3 text-xs text-red-500 font-medium" aria-live="polite">⚠️ {advisorError}</p>}

              {/* Streaming Strategy System Monitor Console */}
              <div className="mt-4 flex-1 overflow-hidden flex flex-col bg-neutral-950 rounded-xl border border-neutral-800 p-4 shadow-inner">
                <p className="text-[10px] uppercase font-bold text-neutral-500 tracking-widest mb-2 font-mono">Live Plan Output Trace</p>
                <div className="flex-1 overflow-y-auto text-xs font-mono text-green-400 space-y-2 leading-relaxed">
                  {advisorPlan ? (
                    <p className="whitespace-pre-wrap">{advisorPlan}</p>
                  ) : (
                    <p className="text-neutral-500 italic">No plan deployed to context stack yet. Fire a prompt query above to execute structural analytics.</p>
                  )}
                </div>
                {advisorPlan && (
                  <p className="text-[10px] text-emerald-500 font-bold mt-2 pt-2 border-t border-neutral-800 flex items-center gap-1">
                    ✓ Synced to MongoDB — viewable inside /reports.
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}