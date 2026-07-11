// frontend/app/(dashboard)/onboarding/page.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function OnboardingAdvisorWizard() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  
  // Unified form state initialized with core platform parameters
  const [form, setForm] = useState({
    title: "",
    eventType: "corporate",
    guestCount: 100,
    budgetTotal: 10000,
    date: "2026-07-20"
  });

  // Step 1: Handshake user context description with the Groq AI Advisor Engine
  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;
    setIsProcessing(true);

    try {
      // Fallback matrix to support standard tokens or Firebase ID layers
      const fbToken = localStorage.getItem("firebase_id_token") || localStorage.getItem("token");
      
      const res = await fetch("/api/v1/ai/onboarding-advisor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${fbToken}`
        },
        body: JSON.stringify({ description })
      });
      
      const result = await res.json();
      
      if (result.success && result.data) {
        const params = result.data;
        setSuggestions(params);
        
        // Populate the editable form state with response telemetry data
        setForm({
          title: params.title || "AI Generated Event Profile",
          eventType: params.eventType || "other",
          guestCount: Number(params.guestCount) || 100,
          budgetTotal: Number(params.budgetTotal) || 10000,
          date: "2026-07-20" // Anchored static parameter for 2026 workspace synchronization
        });
      }
    } catch (err) {
      console.error("AI pipeline synthesis parsing error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 2: Auto-populate metrics and structural layouts into the SSOT database
  const handleCommit = async () => {
    setIsProcessing(true);
    try {
      const appToken = localStorage.getItem("token") || localStorage.getItem("firebase_id_token");
      
      // Map out and distribute budget lines to calculated vendors if present
      const vendors = suggestions?.suggestedVendors || [];
      const calculatedAllocations = vendors.map((vendor) => ({
        category: vendor,
        budgeted: Math.floor(form.budgetTotal / (vendors.length || 1)),
        spent: 0
      }));

      const res = await fetch("/api/v1/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${appToken}`
        },
        body: JSON.stringify({
          title: form.title,
          eventType: form.eventType,
          date: new Date(`${form.date}T18:00:00.000Z`).toISOString(),
          guestCount: form.guestCount,
          budget: {
            total: form.budgetTotal,
            spent: 0,
            allocations: calculatedAllocations
          }
        })
      });
      
      const data = await res.json();
      
      if (data.success && data.data) {
        // Capture context identifiers to anchor active system data streams
        localStorage.setItem("activeEventId", data.data._id);
        
        // Forward user to active, populated workspace application nodes
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to commit telemetry parameters to active database:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-6 my-12 space-y-8 font-sans">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-neutral-900 tracking-tight">AI Advisor Terminal</h1>
        <p className="text-sm text-neutral-500 max-w-md mx-auto leading-relaxed">
          Describe your layout parameters to automatically build your 3D canvas environment and ledger frameworks.
        </p>
      </div>

      {!suggestions ? (
        /* Configuration Generation Input View */
        <Card className="p-6 border border-neutral-200/80 shadow-sm bg-white rounded-2xl">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-bold text-neutral-700">
                What event space are you planning?
              </label>
              <textarea
                id="description"
                rows={5}
                required
                disabled={isProcessing}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., I want to plan a corporate conference for 250 people in July 2026 with an overall budget allocation of 2.5 million ksh covering tech setups and catering configurations..."
                className="w-full rounded-xl border border-neutral-200 p-4 text-sm focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition-all placeholder:text-neutral-400 disabled:bg-neutral-50 disabled:cursor-not-allowed"
              />
            </div>
            <Button type="submit" className="w-full h-11 text-sm font-bold shadow-md shadow-purple-600/10" disabled={isProcessing}>
              {isProcessing ? "Synthesizing Environment Structures..." : "Initialize Workspace via AI"}
            </Button>
          </form>
        </Card>
      ) : (
        /* Dynamic Matrix Refinement View */
        <Card className="p-6 border border-neutral-200/80 shadow-sm bg-white rounded-2xl space-y-6">
          <div className="border-b border-neutral-100 pb-3">
            <h2 className="text-lg font-bold text-neutral-900">Review Suggested Layout Configurations</h2>
            <p className="text-xs text-neutral-400 mt-0.5">Refine telemetry details before committing structures to the live ledger pipeline.</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider">Project Title Name</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full mt-1.5 rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider">Attendance Scale</label>
                <input
                  type="number"
                  value={form.guestCount}
                  onChange={(e) => setForm({ ...form, guestCount: Number(e.target.value) })}
                  className="w-full mt-1.5 rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider">Budget Limit (Ksh)</label>
                <input
                  type="number"
                  value={form.budgetTotal}
                  onChange={(e) => setForm({ ...form, budgetTotal: Number(e.target.value) })}
                  className="w-full mt-1.5 rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider">Target Date Anchor</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full mt-1.5 rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Render Suggested Vendors Allocation Breakdown If Extracted */}
            {suggestions.suggestedVendors && suggestions.suggestedVendors.length > 0 && (
              <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200/60">
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Automated Ledger Line-Item Projections</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.suggestedVendors.map((vendor, index) => (
                    <span key={index} className="inline-flex items-center rounded-lg bg-white border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-700 shadow-sm">
                      {vendor} Layout Setup
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Explainable AI Rationales Panel Box */}
            {suggestions.rationales && (
              <div className="bg-purple-50/60 border border-purple-100 rounded-xl p-4 text-xs text-purple-900 space-y-1.5">
                <p className="font-extrabold text-purple-900 flex items-center gap-1">
                  <span>✨</span> Explainable AI Generation Insights
                </p>
                {suggestions.rationales.guestCount && <p className="leading-relaxed"><strong className="font-semibold text-purple-800">Density:</strong> {suggestions.rationales.guestCount}</p>}
                {suggestions.rationales.budget && <p className="leading-relaxed"><strong className="font-semibold text-purple-800">Capitalization:</strong> {suggestions.rationales.budget}</p>}
              </div>
            )}
          </div>

          <div className="flex gap-4 border-t border-neutral-100 pt-4">
            <Button variant="secondary" onClick={() => setSuggestions(null)} className="flex-1 text-xs py-2.5" disabled={isProcessing}>
              Modify Description Prompt
            </Button>
            <Button onClick={handleCommit} className="flex-1 text-xs py-2.5 shadow-md shadow-purple-600/10" disabled={isProcessing}>
              {isProcessing ? "Configuring Matrix Elements..." : "Confirm & Build Workspace"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}