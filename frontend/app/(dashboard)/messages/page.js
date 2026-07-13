// frontend/app/(dashboard)/messages/page.js
/**
 * @file frontend/app/(dashboard)/messages/page.js
 * @description Consolidated messaging panel that retrieves thread payloads 
 * using real-time search parameter state updates[cite: 18].
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";

const CHANNELS = [
  { id: "vendor", name: "Vendor Channel", color: "bg-purple-500", description: "Coordination feed for logistics vendors" },
  { id: "catering", name: "Catering Channel", color: "bg-green-500", description: "Food, beverage, and menu logistics" },
  { id: "client", name: "Client Channel", color: "bg-pink-500", description: "Direct feedback channel with the event host" },
  { id: "team", name: "Team Group", color: "bg-cyan-500", description: "Internal workspace operations mesh" },
];

export default function MessagesPage() {
  const searchParams = useSearchParams();

  // Derive active context directly from routing query strings
  const activeEventId = searchParams.get("eventId") || "";

  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [recipient, setRecipient] = useState("Vendor Channel");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Synchronously reload thread payload when changing targeted events
  useEffect(() => {
    if (activeEventId) {
      fetchMessages(activeEventId);
    } else {
      setLoading(false);
    }
  }, [activeEventId]);

  // Automatically scroll viewport to newest updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, recipient]);

  const fetchMessages = async (eventId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/v1/messages/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setMessages(json.data);
      }
    } catch (err) {
      console.error("Communication rehydration failure:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!draft.trim() || !activeEventId) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          eventId: activeEventId,
          text: draft,
          recipientName: recipient,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setMessages((prev) => [...prev, json.data]);
        setDraft("");
      }
    } catch (err) {
      console.error("Message submission error:", err);
    }
  };

  const activeChannelConfig = CHANNELS.find((c) => c.name === recipient) || CHANNELS[0];

  // Filter messages by active channel and search parameters
  const filteredMessages = messages
    .filter((msg) => msg.recipientName === recipient)
    .filter((msg) => msg.text.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) {
    return <div className="p-8 text-sm font-medium text-neutral-500 animate-pulse">Syncing secure communications network...</div>;
  }

  return (
    <div className="flex h-[calc(100vh-7rem)] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      
      {/* Left Threads/Channels Panel */}
      <aside className="hidden w-72 shrink-0 overflow-y-auto border-r border-neutral-200 sm:block bg-neutral-50/50">
        <h1 className="px-6 py-4 text-lg font-bold text-neutral-900 border-b border-neutral-100 bg-white">Messages</h1>
        <ul className="divide-y divide-neutral-100">
          {CHANNELS.map((channel) => (
            <li key={channel.id}>
              <button
                onClick={() => setRecipient(channel.name)}
                className={`flex w-full items-center gap-3 px-6 py-4 text-left transition-colors duration-200 ${
                  recipient === channel.name ? "bg-purple-50/70 border-r-2 border-purple-600" : "hover:bg-neutral-50"
                }`}
              >
                <span className={`h-3 w-3 shrink-0 rounded-full ${channel.color}`} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-neutral-800">
                    {channel.name}
                  </span>
                  <span className="block truncate text-xs text-neutral-400 mt-0.5">
                    {channel.description}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Right Chat Terminal Framework */}
      <section className="flex flex-1 flex-col bg-white">
        
        {/* Dynamic Recipient Header */}
        <header className="flex items-center justify-between gap-3 border-b border-neutral-100 px-6 py-4 bg-white">
          <div className="flex items-center gap-3">
            <span className={`h-3 w-3 rounded-full ${activeChannelConfig.color} animate-ping`} />
            <div>
              <p className="text-sm font-semibold text-neutral-800">{recipient}</p>
              <p className="text-[11px] text-neutral-400">SSOT Live Messaging Protocol</p>
            </div>
          </div>
          <button className="text-neutral-400 hover:text-neutral-600 transition-colors" aria-label="Channel Actions">
            •••
          </button>
        </header>

        {/* Client-side Live Search Area */}
        <div className="border-b border-neutral-100 px-6 py-2 bg-neutral-50/30">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search secure logs inside ${recipient}...`}
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100/50"
          />
        </div>

        {/* Message Pipeline Shell */}
        <div className="flex-1 space-y-4 overflow-y-auto p-6 bg-neutral-50/30">
          {!activeEventId ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="text-2xl mb-2">⚠️</span>
              <p className="text-xs text-neutral-500 max-w-xs">No active event scope selected. Return to your dashboard to open a deployment pipeline.</p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="text-xl mb-2">💬</span>
              <p className="text-xs text-neutral-400">No coordination history found matching this terminal state.</p>
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const isMe = msg.sender === "me";
              return (
                <div key={msg._id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  <div
                    className={`max-w-md rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                      isMe
                        ? "rounded-tr-none bg-purple-600 text-white"
                        : "rounded-tl-none bg-white border border-neutral-200 text-neutral-800"
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    
                    {/* Retroactive rendering wrapper for system images embedded inside data blocks */}
                    {msg.image && (
                      <div className="mt-2 overflow-hidden rounded-lg border border-neutral-100">
                        <img
                          src={msg.image}
                          alt="Visual Attachment Asset Pipeline"
                          className="w-full max-w-xs rounded-lg object-cover"
                        />
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-neutral-400 mt-1 px-1 tracking-tight">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Writeback Submission Form */}
        <form onSubmit={handleSend} className="border-t border-neutral-200 p-4 bg-white flex gap-3 items-center">
          <input
            id="message-input"
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={!activeEventId}
            placeholder={activeEventId ? "Type secure coordination message..." : "Select an event context to begin messaging..."}
            className="flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed"
          />
          <Button type="submit" disabled={!draft.trim() || !activeEventId}>
            Send
          </Button>
        </form>
      </section>
    </div>
  );
}