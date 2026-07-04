"use client";

import { useState } from "react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const EVENTS = {
  20: { name: "Dream Wedding", color: "text-purple-600" },
  25: { name: "Birthday Party", color: "text-purple-600" },
};

export default function CalendarPage() {
  const [currentMonth] = useState("July 2026");

  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">Calendar</h1>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">Calendar</h2>
          <div className="flex items-center gap-3">
            <button className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50">
              Today
            </button>
            <button className="rounded-lg border border-neutral-200 px-2 py-1.5 text-neutral-600 hover:bg-neutral-50">
              ‹
            </button>
            <span className="text-sm font-semibold text-neutral-800">{currentMonth}</span>
            <button className="rounded-lg border border-neutral-200 px-2 py-1.5 text-neutral-600 hover:bg-neutral-50">
              ›
            </button>
            <div className="flex overflow-hidden rounded-lg border border-neutral-200">
              {["Month", "Week", "Day"].map((v) => (
                <button
                  key={v}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
                    v === "Month"
                      ? "bg-purple-600 text-white"
                      : "text-neutral-600 hover:bg-neutral-50"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-neutral-100 bg-neutral-100">
          {DAYS.map((day) => (
            <div
              key={day}
              className="bg-neutral-50 py-2 text-center text-xs font-semibold uppercase text-neutral-500"
            >
              {day.slice(0, 3)}
            </div>
          ))}

          {Array.from({ length: 3 }, (_, i) => (
            <div key={`empty-${i}`} className="min-h-24 bg-white p-2" />
          ))}

          {days.map((day) => (
            <div
              key={day}
              className="min-h-24 bg-white p-2 hover:bg-neutral-50 transition-colors duration-150"
            >
              <span
                className={`text-sm font-medium ${
                  day === 4
                    ? "flex h-6 w-6 items-center justify-center rounded-full bg-purple-600 text-white"
                    : "text-neutral-700"
                }`}
              >
                {day}
              </span>
              {EVENTS[day] && (
                <p className={`mt-1 truncate text-xs font-medium ${EVENTS[day].color}`}>
                  {EVENTS[day].name}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}