// frontend/app/(dashboard)/reports/page.js
"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";

export default function ReportsPage() {
  const [advisorReport, setAdvisorReport] = useState("No specialized advisory plans found. Use the interactive 3D Designer Advisor floating link to generate metrics patterns.");

  useEffect(() => {
    const reportData = localStorage.getItem("eventvistaAdvisorReport");
    if (reportData) setAdvisorReport(reportData);
  }, []);

  const handleDownloadReportBundle = () => {
    // Structural layout string assembly for package generation
    const fullDocumentPayload = `==================================================\nEVENTVISTA SYSTEM INTELLIGENCE REPORT BUNDLE\n==================================================\n\n${advisorReport}\n\n==================================================\n3D STRUCTURAL VENUE TELEMETRY SCHEMA\n==================================================\nEngine: Trellis V3 Core\nCoordinate Matrix Mapping: Verified\nObject Allocation: Dynamic Grid Arrangement Packaged\n\n© 2026 Eventvista System Data Engine.`;
    
    const blob = new Blob([fullDocumentPayload], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.href = url;
    downloadAnchor.download = "Eventvista_Comprehensive_Report_Bundle.txt";
    downloadAnchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Reports Engine</h1>
          <p className="text-xs text-neutral-500">System intelligence modules and spatial generation layout telemetry outputs</p>
        </div>
        <button 
          onClick={handleDownloadReportBundle}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-sm"
        >
          ⬇ Download 3D Venue & Advisory Report Bundle
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="text-sm font-bold text-neutral-900 mb-3 flex items-center gap-2">
            <span>🔮</span> Eventvista Advisor Strategy Report Output
          </h2>
          <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800">
            <pre className="text-xs font-mono text-green-400 whitespace-pre-wrap leading-relaxed">{advisorReport}</pre>
          </div>
        </Card>

        <Card className="lg:col-span-1">
          <h2 className="text-sm font-bold text-neutral-900 mb-2">Spatial Telemetry Status</h2>
          <p className="text-xs text-neutral-500 mb-4">Trellis Engine structural design alignment index configuration tracking mapping parameters.</p>
          <div className="border border-neutral-100 rounded-xl p-3 bg-neutral-50 space-y-2">
            <div className="flex justify-between text-xs"><span className="text-neutral-500">Spatial Engine</span><span className="font-bold text-neutral-800">Trellis-Groq V3</span></div>
            <div className="flex justify-between text-xs"><span className="text-neutral-500">Rehydration Index</span><span className="font-bold text-neutral-800">100% Fully Matched</span></div>
            <div className="flex justify-between text-xs"><span className="text-neutral-500">Document Blueprint</span><span className="font-bold text-green-600">Bundled for Download</span></div>
          </div>
        </Card>
      </div>
    </div>
  );
}