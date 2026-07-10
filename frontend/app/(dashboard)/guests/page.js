// frontend/app/(dashboard)/guests/page.js
"use client";

import { useState, useEffect } from 'react';
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function GuestsPage({ params }) {
  // 1. Establish state containers for your real database items
  const [guests, setGuests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newGuest, setNewGuest] = useState({ name: '', email: '', phone: '', status: 'pending' });
  
  const eventId = params.id || "YOUR_ACTIVE_EVENT_ID"; // Pull contextually from routing params or context

  // 2. Fetch records from the database on component mount
  useEffect(() => {
    async function fetchGuests() {
      try {
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

  // 3. Handle submission form interactions to write to MongoDB
  const handleAddGuest = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/v1/events/${eventId}/guests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGuest)
      });
      const result = await response.json();
      
      if (result.success) {
        setGuests(result.data); // Update table view automatically with fresh database list
        setNewGuest({ name: '', email: '', phone: '', status: 'pending' }); // Reset form inputs
      }
    } catch (error) {
      console.error("Could not save guest:", error);
    }
  };

  if (isLoading) return <p className="p-6">Loading guest management registry...</p>;

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

      {/* Input Form connected directly to database writer action */}
      <form onSubmit={handleAddGuest} className="flex gap-4 p-4 border rounded bg-white">
        <input 
          type="text" 
          placeholder="Guest Name" 
          value={newGuest.name}
          onChange={(e) => setNewGuest({...newGuest, name: e.target.value})}
          className="border p-2 rounded w-full"
          required
        />
        <input 
          type="email" 
          placeholder="Email Address" 
          value={newGuest.email}
          onChange={(e) => setNewGuest({...newGuest, email: e.target.value})}
          className="border p-2 rounded w-full"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded whitespace-nowrap">
          Add Guest
        </button>
      </form>

      {/* Main Dynamic Table Display */}
      <div className="bg-white rounded border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {guests.length === 0 ? (
              <tr><td colSpan="3" className="p-3 text-gray-500 text-center">No guests found.</td></tr>
            ) : (
              guests.map((guest, index) => (
                <tr key={guest._id || index} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{guest.name}</td>
                  <td className="p-3 text-gray-600">{guest.email || 'N/A'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs capitalize ${
                      guest.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                      guest.status === 'declined' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
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
    </div>
  );
}