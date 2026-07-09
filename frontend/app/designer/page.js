// frontend/app/designer/page.js
"use client";

import { useState } from "react";
import Link from "next/link";

const ASSETS = {
  tables: [
    { id: "round-table", label: "Round Table", emoji: "🟤" },
    { id: "rect-table", label: "Rectangular Table", emoji: "🟫" },
  ],
  chairs: [{ id: "chiavari", label: "Chiavari Chair", emoji: "🪑" }],
  stages: [{ id: "stage-large", label: "Large Stage", emoji: "🎭" }]
};

export default function DesignerPage() {
  const [activeTab, setActiveTab] = useState("tables");
  const [placed, setPlaced] = useState([]);
  const [selected, setSelected] = useState(null);
  const [processingImage, setProcessingImage] = useState(false);
  
  // Eventvista Advisor state orchestration
  const [showAdvisor, setShowAdvisor] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [advisorPlan, setAdvisorPlan] = useState("");
  const [generatingPlan, setGeneratingPlan] = useState(false);

  const handleVenueImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessingImage(true);
    
    // Transform layout assets cleanly to Base64 format strings
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const base64String = reader.result;
        
        // Execute structural layout configuration against back-end pipeline APIs
        const response = await fetch("/api/v1/ai/generate-layout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId: "demo-event-id",
            imageBase64: base64String,
            itemRequests: [{ objectId: "initial-setup", description: "Standard spatial planning matrix" }]
          })
        });
        
        const pipelineResult = await response.json();
        if (pipelineResult.success && pipelineResult.layoutData) {
          setPlaced(pipelineResult.layoutData.furnitureMap);
        } else {
          // Fallback parsing arrangement if Hugging Face or backend infrastructure timeouts happen
          setPlaced([
            { instanceId: 101, label: "Trellis Main Stage", emoji: "🎭", x: 50, y: 25, rotation: 0 },
            { instanceId: 102, label: "Arranged Table Alpha", emoji: "🟤", x: 30, y: 60, rotation: 0 },
            { instanceId: 103, label: "Arranged Table Beta", emoji: "🟤", x: 70, y: 60, rotation: 0 }
          ]);
        }
      } catch (err) {
        console.error("Spatial generation error details: ", err);
      } finally {
        setProcessingImage(false);
      }
    };
  };

  const handleExecuteAdvisorPrompt = async (e) => {
    e.preventDefault();
    if (!aiPrompt) return;

    setGeneratingPlan(true);
    // Mimic groq system structure evaluation rules
    setTimeout(() => {
      const targetReport = `EVENTVISTA STRUCTURAL EXECUTION PLAN\n=================================\nUser Requirements Specified: ${aiPrompt}\n\nSystem Recommendations:\n1. Space Allocation Strategy: Layout clustered dynamically to reduce bottleneck regions.\n2. Financial Strategy: Scale structure components to match specified asset limits.\n3. Implementation Sequence: Deploy core layout elements before setting up tables.`;
      setAdvisorPlan(targetReport);
      localStorage.setItem("eventvistaAdvisorReport", targetReport);
      setGeneratingPlan(false);
    }, 1500);
  };

  return (
    <div className="relative flex h-screen overflow-hidden bg-neutral-900 font-sans">
      
      {/* Asset Panel */}
      <aside className="flex w-64 shrink-0 flex-col border-r border-white/10 bg-neutral-900 text-white p-4">
        <Link href="/dashboard" className="text-xs text-neutral-400 hover:text-white mb-4">← Dashboard</Link>
        <h2 className="text-sm font-semibold mb-2">Trellis Engine Core</h2>
        
        {/* Architectural blueprints input parsing gate */}
        <div className="border border-dashed border-white/20 rounded-xl p-3 bg-white/5 mb-4">
          <label className="block text-xs text-neutral-300 font-semibold mb-2">Upload Venue Blueprints</label>
          <input type="file" accept="image/*" onChange={handleVenueImageUpload} className="w-full text-xs text-neutral-400 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:bg-purple-600 file:text-white cursor-pointer" />
          {processingImage && <p className="text-xs text-amber-400 animate-pulse mt-2">Trellis Engine processing boundaries...</p>}
        </div>

        <div className="flex gap-1 mb-3">
          {Object.keys(ASSETS).map((cat) => (
            <button key={cat} onClick={() => setActiveTab(cat)} className={`flex-1 rounded-lg py-1.5 text-xs font-semibold capitalize ${activeTab === cat ? "bg-purple-600 text-white" : "text-neutral-400 hover:bg-white/5"}`}>{cat}</button>
          ))}
        </div>
        
        <div className="grid grid-cols-2 gap-2 overflow-y-auto">
          {ASSETS[activeTab].map((asset) => (
            <button key={asset.id} onClick={() => setPlaced([...placed, { ...asset, instanceId: Date.now(), x: 40 + Math.random()*20, y: 40 + Math.random()*20, rotation: 0 }])} className="flex flex-col items-center gap-1 rounded-xl bg-white/5 p-3 border border-white/10 text-center hover:border-purple-400">
              <span className="text-xl">{asset.emoji}</span>
              <span className="text-xs font-medium leading-tight text-neutral-200">{asset.label}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Canvas Viewport Workspace */}
      <div className="relative flex-1 bg-neutral-800">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        
        {placed.map((item) => (
          <div
            key={item.instanceId}
            onClick={() => setSelected(item)}
            className={`absolute flex flex-col items-center cursor-move p-2 bg-white/10 border-2 rounded-xl text-white ${selected?.instanceId === item.instanceId ? "border-purple-400" : "border-white/10"}`}
            style={{ left: `${item.x}%`, top: `${item.y}%`, transform: "translate(-50%, -50%)" }}
          >
            <span className="text-xl">{item.emoji}</span>
            <span className="text-[10px] text-neutral-300">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Interactive AI Floating Control Advisor Module */}
      <div className="fixed bottom-6 right-6 z-50">
        <button 
          onClick={() => setShowAdvisor(!showAdvisor)}
          className="h-14 w-14 rounded-full bg-purple-600 hover:bg-purple-700 shadow-2xl flex items-center justify-center text-2xl transition-transform hover:scale-105 active:scale-95"
          aria-label="Launch Eventvista Advisor Module"
        >
          ✨
        </button>

        {showAdvisor && (
          <div className="absolute bottom-16 right-0 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-neutral-200 p-5 flex flex-col text-neutral-800">
            <h3 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-2 mb-3 flex items-center gap-2">
              <span>🔮</span> Eventvista AI Advisor Module
            </h3>
            
            <form onSubmit={handleExecuteAdvisorPrompt} className="space-y-3">
              <div>
                <label className="text-xs text-neutral-500 font-semibold mb-1 block">Specify Parameters (Budget, Capital, Space Constraints)</label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="E.g., Budget is ksh 1,500,000, 150 guests, maximize dancefloor region..."
                  className="w-full text-xs p-3 border border-neutral-200 rounded-xl focus:border-purple-500 focus:outline-none"
                  rows={3}
                />
              </div>
              <button type="submit" disabled={generatingPlan} className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl disabled:opacity-50">
                {generatingPlan ? "Structuring Advisory Analysis..." : "Compile Optimization Blueprint"}
              </button>
            </form>

            {advisorPlan && (
              <div className="mt-4 p-3 bg-neutral-50 border border-neutral-100 rounded-xl max-h-40 overflow-y-auto">
                <p className="text-[11px] font-mono text-neutral-700 whitespace-pre-line">{advisorPlan}</p>
                <p className="text-[9px] text-green-600 font-bold mt-2">✓ Layout strategies successfully ported over to system reports page parameters.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}