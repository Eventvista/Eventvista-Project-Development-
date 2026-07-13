// frontend/app/(dashboard)/guests/page.js
/**
 * @file frontend/app/(dashboard)/guests/page.js
 * @description Real-time guest registry page synced with current URL query state scope.
 */

"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function GuestsPage() {
  const searchParams = useSearchParams();
  
  // Extract contextual event ID reliably from current browser routing state
  const eventId = searchParams.get("eventId") || "";

  const [guests, setGuests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newGuest, setNewGuest] = useState({ name: '', email: '', phone: '', status: 'pending' });

  // Load guests list from backend database using derived routing state
  useEffect(() => {
    async function fetchGuests() {
      if (!eventId) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const response = await fetch(`/api/v1/events/${eventId}`);
        const result = await response.json();
        if (result.success) {
          setGuests(result.data.guests || []);
        }
      } catch (error) {
        console.error("Failed loading guests:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchGuests();
  }, [eventId]);

  const handleAddGuest = async (e) => {
    e.preventDefault();
    if (!eventId) return;

    try {
      const response = await fetch(`/api/v1/events/${eventId}/guests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGuest)
      });
      const result = await response.json();
      
      if (result.success) {
        setGuests(result.data); // Update visual tables seamlessly with direct MongoDB lists[cite: 18]
        setNewGuest({ name: '', email: '', phone: '', status: 'pending' }); // Flush out input state caches
      }
    } catch (error) {
      console.error("Could not save guest:", error);
    }
  };

  if (isLoading) {
    return <p className="p-6 text-sm font-medium text-neutral-500 animate-pulse">Loading guest management registry...</p>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="secondary" className="px-3 py-1.5 text-xs">← Back to Dashboard</Button>
          </Link>
          <h1 className="text-2xl font-bold">Guest List Management</h1>
        </div>
      </div>

      {!eventId ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-16 text-center">
          <span className="text-2xl">⚠️</span>
          <p className="mt-2 text-sm text-neutral-500">No active event scope selected. Return to your dashboard to select an active event.</p>
        </div>
      ) : (
        <>
          {/* Input Form connected directly to database writer action */}
          <form onSubmit={handleAddGuest} className="flex gap-4 p-4 border rounded-xl bg-white shadow-sm">
            <input 
              type="text" 
              placeholder="Guest Name" 
              value={newGuest.name}
              onChange={(e) => setNewGuest({...newGuest, name: e.target.value})}
              className="border p-2.5 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-purple-100"
              required
            />
            <input 
              type="email" 
              placeholder="Email Address" 
              value={newGuest.email}
              onChange={(e) => setNewGuest({...newGuest, email: e.target.value})}
              className="border p-2.5 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-purple-100"
            />
            <button type="submit" className="bg-purple-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap">
              Add Guest
            </button>
          </form>

          {/* Main Dynamic Table Display */}
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600">
                  <th className="p-4 font-semibold">Name</th>
                  <th className="p-4 font-semibold">Email</th>
                  <th className="p-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {guests.length === 0 ? (
                  <tr><td colSpan="3" className="p-8 text-neutral-400 text-center text-xs">No guests found assigned to this event scope.</td></tr>
                ) : (
                  guests.map((guest, index) => (
                    <tr key={guest._id || index} className="border-b border-neutral-100 hover:bg-neutral-50/50 transition-colors">
                      <td className="p-4 font-semibold text-neutral-800">{guest.name}</td>
                      <td className="p-4 text-neutral-500">{guest.email || 'N/A'}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                          guest.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 
                          guest.status === 'declined' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {guest.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}