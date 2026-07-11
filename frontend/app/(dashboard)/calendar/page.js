// frontend/app/(dashboard)/calendar/page.js
"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Link from "next/link";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [currentMonth] = useState("July 2026");
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("Month");

  // Fetch contextual server-side array events on mount
  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/v1/events", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success) {
          setEvents(json.data);
        }
      } catch (err) {
        console.error("Calendar data stream synchronization fault:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCalendarData();
  }, []);

  // Generate day items for July 2026 (31 days total)
  const daysArray = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      
      {/* Enhanced Routing UX Header Area */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="secondary" className="px-3 py-1.5 text-xs">
              ← Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-neutral-900">Workspace Calendar</h1>
        </div>
        <div className="hidden sm:block" />
      </div>

      {/* Main Calendar Board Container */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        
        {/* Workspace Management Header Controls */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-neutral-100 pb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-neutral-800">{currentMonth}</h2>
            <Badge text="Live SSOT Pipeline" />
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors">
              Today
            </button>
            <div className="flex items-center rounded-lg border border-neutral-200 bg-white">
              <button className="px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-50 border-r border-neutral-200">
                ‹
              </button>
              <button className="px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-50">
                ›
              </button>
            </div>
            
            {/* Context Mode Layout Controls */}
            <div className="flex overflow-hidden rounded-lg border border-neutral-200">
              {["Month", "Week", "Day"].map((view) => (
                <button
                  key={view}
                  type="button"
                  onClick={() => setActiveView(view)}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
                    activeView === view
                      ? "bg-purple-600 text-white"
                      : "bg-white text-neutral-600 hover:bg-neutral-50"
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Matrix Grid Structure */}
        {loading ? (
          <div className="py-24 text-center text-sm font-medium text-neutral-400 animate-pulse">
            Synchronizing live grid positions...
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-px rounded-xl bg-neutral-100 overflow-hidden border border-neutral-100 shadow-inner">
            
            {/* Weekday Labels Column Headers */}
            {DAYS.map((d) => (
              <div 
                key={d} 
                className="bg-neutral-50 py-2.5 text-center text-xs font-semibold text-neutral-500 uppercase tracking-wider border-b border-neutral-100"
              >
                {d}
              </div>
            ))}
            
            {/* Calendar Offset Spacers (July 2026 starts on Wednesday; skips Mon/Tue) */}
            <div className="bg-white min-h-[110px] p-2" />
            <div className="bg-white min-h-[110px] p-2" />

            {/* Rendered Live Calendar Cells */}
            {daysArray.map((day) => {
              // Filter out database nodes belonging explicitly to this matrix day position
              const dayEvents = events.filter((e) => {
                const d = new Date(e.date);
                return d.getDate() === day && d.getMonth() === 6 && d.getFullYear() === 2026;
              });

              return (
                <div 
                  key={day} 
                  className="bg-white p-2 min-h-[110px] hover:bg-neutral-50/70 transition-colors flex flex-col justify-between group border-t border-r border-neutral-50"
                >
                  <div className="space-y-1">
                    <span 
                      className={`text-xs font-bold ${
                        day === 4 
                          ? "flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-white" 
                          : "text-neutral-400 group-hover:text-neutral-700 transition-colors"
                      }`}
                    >
                      {day}
                    </span>
                    
                    {/* Synchronized Live Data Streams Blocks */}
                    <div className="space-y-1 max-h-[72px] overflow-y-auto no-scrollbar">
                      {dayEvents.map((e) => (
                        <div 
                          key={e._id} 
                          className="truncate rounded bg-purple-50 px-1.5 py-1 text-[10px] font-bold text-purple-700 border border-purple-100 shadow-sm transition-transform hover:scale-[1.02]"
                          title={e.title}
                        >
                          {e.title}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Badge({ text }) {
  return (
    <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-[10px] font-semibold text-green-700 border border-green-200 shadow-sm tracking-wide">
      {text}
    </span>
  );
}