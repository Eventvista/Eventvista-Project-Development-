"use client";

import { useState } from "react";

const THREADS = [
  { id: 1, name: "Elegant Decor", preview: "Typing…", time: "10:30 am", color: "bg-purple-500" },
  { id: 2, name: "Classic Catering", preview: "Here is the……", time: "9:45 am", color: "bg-green-500" },
  { id: 3, name: "Client. Alice", preview: "Thank you", time: "Yesterday", color: "bg-pink-500" },
  { id: 4, name: "Team Group", preview: "Meeting at 4pm", time: "2 days ago", color: "bg-cyan-500" },
];

const MESSAGES = {
  1: [
    { id: 1, from: "them", text: "Hi John, we have received your request" },
    { id: 2, from: "me", text: "Great! Please share the virtual setup" },
    {
      id: 3,
      from: "them",
      text: "Here is the 3D setup for the stage",
      image: "/images/3d venue stage photo.jpeg",
    },
  ],
  2: [
    { id: 1, from: "them", text: "Here is the catering menu for your review" },
    { id: 2, from: "me", text: "Looks great, thank you!" },
  ],
  3: [
    { id: 1, from: "them", text: "Thank you for choosing us!" },
  ],
  4: [
    { id: 1, from: "them", text: "Team meeting at 4pm today" },
    { id: 2, from: "me", text: "I will be there" },
  ],
};

export default function MessagesPage() {
  const [active, setActive] = useState(1);
  const [draft, setDraft] = useState("");
  const activeThread = THREADS.find((t) => t.id === active);
  const activeMessages = MESSAGES[active] || [];

  return (
    <div className="flex h-[calc(100vh-7rem)] overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">

      {/* Left threads panel */}
      <aside className="hidden w-72 shrink-0 overflow-y-auto border-r border-neutral-100 sm:block">
        <h1 className="px-4 py-4 text-lg font-bold text-neutral-900">Messages</h1>
        <ul>
          {THREADS.map((thread) => (
            <li key={thread.id}>
              <button
                onClick={() => setActive(thread.id)}
                className={`flex w-full items-center gap-3 border-b border-neutral-50 px-4 py-3 text-left transition-colors duration-200 ${
                  active === thread.id ? "bg-purple-50" : "hover:bg-neutral-50"
                }`}
              >
                <span className={`h-9 w-9 shrink-0 rounded-full ${thread.color}`} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-neutral-800">
                    {thread.name}
                  </span>
                  <span className="block truncate text-xs text-neutral-500">
                    {thread.preview}
                  </span>
                </span>
                <span className="shrink-0 text-xs text-neutral-400">
                  {thread.time}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Right chat panel */}
      <section className="flex flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-neutral-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className={`h-9 w-9 rounded-full ${activeThread.color}`} />
            <div>
              <p className="text-sm font-semibold text-neutral-800">
                {activeThread.name}
              </p>
              <p className="text-xs text-green-500">Online</p>
            </div>
          </div>
          <button className="text-neutral-400 hover:text-neutral-600">
            •••
          </button>
        </header>

        {/* Search bar */}
        <div className="border-b border-neutral-100 px-5 py-2">
          <input
            type="search"
            placeholder="Search messages.."
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
          />
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {activeMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-sm rounded-2xl px-4 py-2.5 text-sm ${
                  msg.from === "me"
                    ? "rounded-tr-none bg-purple-100 text-purple-800"
                    : "rounded-tl-none bg-neutral-100 text-neutral-700"
                }`}
              >
                {msg.text}
                {msg.image && (
                  <div className="mt-2 overflow-hidden rounded-lg">
                    <img
                      src={msg.image}
                      alt="3D venue setup"
                      className="w-full max-w-xs rounded-lg object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setDraft("");
          }}
          className="flex items-center gap-3 border-t border-neutral-100 p-4"
        >
          <label htmlFor="message-input" className="sr-only">
            Type a message
          </label>
          <input
            id="message-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type a Message"
            className="flex-1 rounded-lg border border-neutral-200 px-4 py-2.5 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
          />
          <button
            type="submit"
            className="rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 transition-colors duration-200"
          >
            Send
          </button>
        </form>
      </section>
    </div>
  );
}