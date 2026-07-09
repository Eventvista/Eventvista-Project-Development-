// frontend/app/onboarding/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function OnboardingPage() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [form, setForm] = useState({ title: "", eventType: "corporate", guestCount: 100, budgetTotal: 10000 });

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fbToken = localStorage.getItem("firebase_id_token");
      const res = await fetch("/api/v1/ai/onboarding-advisor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${fbToken}`
        },
        body: JSON.stringify({ description })
      });
      const result = await res.json();
      if (result.success) {
        setSuggestions(result.data);
        setForm({
          title: result.data.title,
          eventType: result.data.eventType,
          guestCount: result.data.guestCount,
          budgetTotal: result.data.budgetTotal
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCommit = async () => {
    try {
      const appToken = localStorage.getItem("token");
      const res = await fetch("/api/v1/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${appToken}`
        },
        body: JSON.stringify({
          title: form.title,
          eventType: form.eventType,
          date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          guestCount: form.guestCount,
          budget: { total: form.budgetTotal, spent: 0 }
        })
      });
      const data = await res.json();
      if (data.success) router.push("/dashboard");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-neutral-900">AI Advisor Terminal</h1>
        <p className="text-sm text-neutral-500 mt-2">Describe your vision to dynamically build your 3D canvas environment.</p>
      </div>

      {!suggestions ? (
        <Card>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-neutral-700">What event are you planning?</label>
              <textarea
                id="description"
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="E.g., An elegant summer wedding for 150 guests with an outdoor banquet theme."
                className="w-full mt-2 rounded-xl border border-neutral-200 p-3 text-sm focus:border-purple-500 focus:outline-none"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Parsing requirements..." : "Consult AI Advisor"}
            </Button>
          </form>
        </Card>
      ) : (
        <Card className="space-y-6">
          <h2 className="text-lg font-bold text-neutral-900">Review Suggestions</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-500 uppercase">Event Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full mt-1 rounded-lg border border-neutral-200 p-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase">Guests</label>
                <input
                  type="number"
                  value={form.guestCount}
                  onChange={(e) => setForm({ ...form, guestCount: Number(e.target.value) })}
                  className="w-full mt-1 rounded-lg border border-neutral-200 p-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase">Budget Allocation</label>
                <input
                  type="number"
                  value={form.budgetTotal}
                  onChange={(e) => setForm({ ...form, budgetTotal: Number(e.target.value) })}
                  className="w-full mt-1 rounded-lg border border-neutral-200 p-2 text-sm"
                />
              </div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-xs text-purple-800 space-y-1">
              <p className="font-bold">Explainable AI Insights:</p>
              <p>• {suggestions.rationales?.guestCount}</p>
              <p>• {suggestions.rationales?.budget}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Button variant="secondary" onClick={() => setSuggestions(null)} className="flex-1">Retry Prompt</Button>
            <Button onClick={handleCommit} className="flex-1">Confirm Parameters</Button>
          </div>
        </Card>
      )}
    </div>
  );
}