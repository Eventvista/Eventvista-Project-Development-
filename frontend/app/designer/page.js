/**
 * @file frontend/app/designer/page.js
 * @description Interactive 3D Venue Spatial Layout Designer for Eventvista.
 * Integrates dynamic canvas coordinate state arrays with the TRELLIS 3D machine learning mesh model
 * and real-time advisory plan persistence powered by Groq LLM pipelines.
 */

"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

// Base gateway API path derived from system environments[cite: 15]
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

// Asset catalogs mapped to graphical UI emojis[cite: 15]
const ASSETS = {
  tables: [
    { id: "round-table", label: "Round Table", emoji: "🟤" },
    { id: "rect-table", label: "Rectangular Table", emoji: "🟫" },
  ],
  chairs: [{ id: "chiavari", label: "Chiavari Chair", emoji: "🪑" }],
  stages: [{ id: "stage-large", label: "Large Stage", emoji: "🎭" }],
};

function DesignerContent() {
  // Resolves event identification across shared routes by parsing URL search queries[cite: 15]
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");

  // Local Spatial Workspace States[cite: 15]
  const [activeTab, setActiveTab] = useState("tables");
  const [placed, setPlaced] = useState([]);
  const [selected, setSelected] = useState(null);
  const [processingImage, setProcessingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Floating AI Advisor Panel States[cite: 15]
  const [showAdvisor, setShowAdvisor] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [advisorPlan, setAdvisorPlan] = useState("");
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [advisorError, setAdvisorError] = useState("");

  /**
   * Helper function compiling localized JWT strings for secure cross-origin requests[cite: 15]
   * @returns {Object} Target authorization header dictionary map
   */
  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // =========================================================================
  // SECTION 1: PHOTO TO 3D STRUCTURAL VENUE GENERATION PIPELINE
  // =========================================================================
  /**
   * Processes physical photo file uploads into structural 3D canvas coordinates.
   */
  const handleVenueImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!eventId) {
      setUploadError("Open the Designer from a specific event first — there's nowhere to save this layout yet.");
      return;
    }

    setProcessingImage(true);
    setUploadError("");

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const base64String = reader.result;

        const response = await fetch(`${API_BASE}/ai/generate-layout`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify({
            eventId,
            imageBase64: base64String,
            // FIX: Reverted to an Array. The structural validation requirements must be met for the backend API[cite: 15].
            // Stringification to resolve downstream Groq parsing errors is now handled on the backend[cite: 15].
            itemRequests: [{ objectId: "initial-setup", description: "Standard spatial planning matrix" }],
          }),
        });

        const pipelineResult = await response.json();
        
        if (!response.ok || !pipelineResult.success) {
          // Intercept raw backend/Groq parsing errors and translate them into user-friendly UI messages[cite: 15].
          const isGroqParseError = pipelineResult.message?.includes("boundary-parsing");
          const safeErrorMessage = isGroqParseError 
            ? "The AI engine could not process the image format. Please ensure it's a clear photo and try again."
            : (pipelineResult.message || "The 3D generation pipeline did not return a valid layout structure.");
            
          throw new Error(safeErrorMessage);
        }

        const objects = pipelineResult.layoutData.objects || [];
        setPlaced(
          objects.map((obj) => ({
            instanceId: obj.objectId || Date.now() + Math.random(),
            label: obj.label,
            emoji: obj.category === "chair" ? "🪑" : "🟤",
            x: 50 + (obj.position?.x || 0),
            y: 50 + (obj.position?.z || 0),
            rotation: obj.rotation?.y || 0,
          }))
        );
      } catch (err) {
        console.error("Spatial generation layout execution anomaly:", err);
        setUploadError(err.message || "Could not generate a 3D layout from that image. Please try again.");
      } finally {
        setProcessingImage(false);
      }
    };
  };

  // =========================================================================
  // SECTION 2: COMPREHENSIVE STRATEGY ADVISOR PLAN GENERATION
  // =========================================================================
  /**
   * Dispatches event prompt details to Groq LLM orchestration endpoints for direct DB persistence[cite: 15].
   */
  const handleExecuteAdvisorPrompt = async (e) => {
    e.preventDefault();
    if (!aiPrompt) return;
    
    if (!eventId) {
      setAdvisorError("Open the Designer from a specific event first.");
      return;
    }

    setGeneratingPlan(true);
    setAdvisorError("");
    
    try {
      const res = await fetch(`${API_BASE}/ai/advisor-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ eventId, prompt: aiPrompt }),
      });
      
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "The AI Advisor could not compile an execution plan.");
      
      setAdvisorPlan(data.data.plan);
    } catch (err) {
      console.error("Advisor execution exception:", err);
      setAdvisorError(err.message || "The AI Advisor is temporarily unavailable.");
    } finally {
      setGeneratingPlan(false);
    }
  };

  return (
    <div className="relative flex h-screen overflow-hidden bg-neutral-900 font-sans">
      
      {/* Structural Toolbox Left Sidebar */}
      <aside className="flex w-64 shrink-0 flex-col border-r border-white/10 bg-neutral-900 text-white p-4">
        <Link href="/dashboard" className="text-xs text-neutral-400 hover:text-white mb-4 transition-colors">← Dashboard</Link>
        <h2 className="text-sm font-semibold mb-2">TRELLIS 3D Engine Core</h2>

        {/* Spatial Blueprint Processing Card */}
        <div className="border border-dashed border-white/20 rounded-xl p-3 bg-white/5 mb-4">
          <label className="block text-xs text-neutral-300 font-semibold mb-2">Upload Venue Photo</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleVenueImageUpload} 
            disabled={processingImage} 
            className="w-full text-xs text-neutral-400 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:bg-purple-600 file:text-white cursor-pointer disabled:opacity-50" 
          />
          {processingImage && <p className="text-xs text-amber-400 animate-pulse mt-2">Generating your 3D venue layout...</p>}
          {uploadError && <p className="text-xs text-red-400 mt-2" aria-live="assertive">{uploadError}</p>}
          {!eventId && <p className="text-xs text-neutral-500 mt-2">Open this page from an event to enable blueprint uploads.</p>}
        </div>

        {/* Toolbox Navigation Tab Matrix */}
        <div className="flex gap-1 mb-3 bg-white/5 p-1 rounded-xl border border-white/5">
          {Object.keys(ASSETS).map((cat) => (
            <button 
              key={cat} 
              onClick={() => setActiveTab(cat)} 
              className={`flex-1 rounded-lg py-1.5 text-xs font-semibold capitalize transition-all ${
                activeTab === cat ? "bg-purple-600 text-white shadow" : "text-neutral-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Available Asset Templates Node Array Grid */}
        <div className="grid grid-cols-2 gap-2 overflow-y-auto pr-1">
          {ASSETS[activeTab].map((asset) => (
            <button 
              key={asset.id} 
              onClick={() => setPlaced([...placed, { ...asset, instanceId: Date.now(), x: 40 + Math.random() * 20, y: 40 + Math.random() * 20, rotation: 0 }])} 
              className="flex flex-col items-center gap-1 rounded-xl bg-white/5 p-3 border border-white/10 text-center hover:border-purple-400 transition-colors group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">{asset.emoji}</span>
              <span className="text-xs font-medium leading-tight text-neutral-200">{asset.label}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Spatial Design Workspace Viewport Canvas */}
      <main className="relative flex-1 bg-neutral-800" role="main">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

        {placed.map((item) => (
          <div
            key={item.instanceId}
            onClick={() => setSelected(item)}
            className={`absolute flex flex-col items-center cursor-move p-2 bg-white/10 border-2 rounded-xl text-white select-none shadow-lg transition-shadow ${
              selected?.instanceId === item.instanceId ? "border-purple-400 ring-2 ring-purple-400/20" : "border-white/10"
            }`}
            style={{ left: `${item.x}%`, top: `${item.y}%`, transform: "translate(-50%, -50%)" }}
          >
            <span className="text-xl">{item.emoji}</span>
            <span className="text-[10px] font-medium mt-0.5 text-neutral-300">{item.label}</span>
          </div>
        ))}
      </main>

      {/* Floating Panel Optimization Controller Interface */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowAdvisor(!showAdvisor)}
          className="h-14 w-14 rounded-full bg-purple-600 hover:bg-purple-700 shadow-2xl flex items-center justify-center text-2xl transition-all hover:scale-105 active:scale-95 text-white"
          aria-label="Launch Eventvista Advisor Module"
          aria-expanded={showAdvisor}
        >
          ✨
        </button>

        {showAdvisor && (
          <div className="absolute bottom-16 right-0 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-neutral-200 p-5 flex flex-col text-neutral-800 animate-in slide-in-from-bottom-4 duration-200">
            <h3 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-2 mb-3 flex items-center gap-2">
              <span>🔮</span> Eventvista AI Advisor Panel
            </h3>

            <form onSubmit={handleExecuteAdvisorPrompt} className="space-y-3">
              <div>
                <label className="text-xs text-neutral-500 font-semibold mb-1 block">Budget, guest count, space constraints</label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="E.g., Budget is ksh 1,500,000, 150 guests, maximize dancefloor region..."
                  className="w-full text-xs p-3 border border-neutral-200 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                  rows={3}
                />
              </div>
              <button 
                type="submit" 
                disabled={generatingPlan || !aiPrompt.trim()} 
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {generatingPlan ? "Consulting Groq LLM pipelines..." : "Generate Advisory Plan"}
              </button>
            </form>

            {advisorError && <p className="mt-3 text-xs text-red-600" aria-live="polite">{advisorError}</p>}

            {advisorPlan && (
              <div className="mt-4 p-4 bg-neutral-950 rounded-xl border border-neutral-800 max-h-44 overflow-y-auto shadow-inner">
                <p className="text-[11px] font-mono text-green-400 whitespace-pre-line leading-relaxed">{advisorPlan}</p>
                <p className="text-[10px] text-emerald-600 font-bold mt-3 flex items-center gap-1">
                  <span>✓</span> Synced to MongoDB — viewable anytime inside the Reports interface.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}

// Next.js page boundary wrapping using Suspense to handle dynamic search param rehydration paths safely[cite: 15]
export default function DesignerPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm font-medium text-neutral-400 bg-neutral-900 h-screen animate-pulse">Loading designer workspace parameters...</div>}>
      <DesignerContent />
    </Suspense>
  );
}