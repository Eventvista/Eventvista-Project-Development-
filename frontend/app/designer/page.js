// frontend/app/designer/page.js
"use client";

import { useState } from "react";
import Link from "next/link";

const ASSETS = {
  tables: [
    { id: "round-table", label: "Round Table", emoji: "🟤" },
    { id: "rect-table", label: "Rectangular Table", emoji: "🟫" },
    { id: "cocktail-table", label: "Cocktail Table", emoji: "🔘" },
  ],
  chairs: [
    { id: "chiavari", label: "Chiavari Chair", emoji: "🪑" },
    { id: "banquet", label: "Banquet Chair", emoji: "🪑" },
  ],
  stages: [
    { id: "stage-small", label: "Small Stage", emoji: "🎤" },
    { id: "stage-large", label: "Large Stage", emoji: "🎭" },
  ],
};

export default function DesignerPage() {
  const [activeTab, setActiveTab] = useState("tables");
  const [rotation, setRotation] = useState(0);
  const [placed, setPlaced] = useState([]);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleAdd = (asset) => {
    const newAsset = {
      ...asset,
      instanceId: Date.now(),
      x: Math.random() * 60 + 20,
      y: Math.random() * 60 + 20,
      rotation: 0,
    };
    setPlaced((prev) => [...prev, newAsset]);
    setSelected(newAsset);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    alert("Layout saved successfully!");
  };

  return (
    <div className="relative flex h-[calc(100vh)] overflow-hidden bg-neutral-900">

      {/* Left Asset Panel */}
      <aside className="flex w-64 shrink-0 flex-col border-r border-white/10 bg-neutral-900 text-white">
        <div className="border-b border-white/10 px-4 py-4 flex flex-col gap-4">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-xs font-medium text-neutral-400 hover:text-white transition-colors"
          >
            ← Return to Dashboard
          </Link>
          <h2 className="text-sm font-semibold">Asset Library</h2>
        </div>

        <div className="flex gap-1 px-3 pt-3">
          {Object.keys(ASSETS).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium capitalize transition-colors duration-200 ${
                activeTab === cat
                  ? "bg-purple-600 text-white"
                  : "text-neutral-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid flex-1 grid-cols-2 gap-3 overflow-y-auto p-4">
          {ASSETS[activeTab].map((asset) => (
            <button
              key={asset.id}
              onClick={() => handleAdd(asset)}
              className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-center transition-colors duration-200 hover:border-purple-400 hover:bg-white/10"
            >
              <span className="text-2xl">{asset.emoji}</span>
              <span className="text-xs font-medium leading-tight text-white">{asset.label}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Canvas Area */}
      <div className="relative flex-1 overflow-hidden bg-neutral-800">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {placed.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-4xl">🎪</p>
              <p className="mt-2 text-sm text-neutral-400">Click assets on the left to add them to your venue</p>
            </div>
          </div>
        )}

        {placed.map((item) => (
          <button
            key={item.instanceId}
            onClick={() => setSelected(item)}
            className={`absolute flex flex-col items-center gap-1 rounded-lg border-2 bg-white/10 p-2 transition-all duration-200 hover:bg-white/20 ${
              selected?.instanceId === item.instanceId ? "border-purple-400" : "border-white/20"
            }`}
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              transform: `translate(-50%, -50%) rotate(${selected?.instanceId === item.instanceId ? rotation : item.rotation}deg)`,
            }}
          >
            <span className="text-xl">{item.emoji}</span>
            <span className="text-xs text-white">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Right Inspector Panel */}
      <aside className="flex w-56 shrink-0 flex-col border-l border-white/10 bg-neutral-900 text-white">
        <div className="border-b border-white/10 px-4 py-4">
          <h2 className="text-sm font-semibold">Inspector</h2>
        </div>

        <div className="flex-1 p-4">
          {selected ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-neutral-400">Selected</p>
                <p className="text-sm font-medium text-white">{selected.label}</p>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-300">Rotation ({rotation}°)</label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>
              <div>
                <p className="mb-1 text-xs font-medium text-neutral-300">Position</p>
                <p className="text-xs text-neutral-400">X: {Math.round(selected.x)}% Y: {Math.round(selected.y)}%</p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-neutral-400">Click an asset on the canvas to inspect it.</p>
          )}
        </div>

        <div className="border-t border-white/10 p-4 space-y-2">
          <button
            onClick={() => setPlaced([])}
            className="w-full rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-neutral-300 transition-colors duration-200 hover:bg-white/10"
          >
            Clear Canvas
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-lg bg-purple-600 px-3 py-2 text-xs font-semibold text-white transition-colors duration-200 hover:bg-purple-700 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Layout"}
          </button>
        </div>
      </aside>
    </div>
  );
}