// frontend/app/(dashboard)/reports/page.js
/**
 * @file frontend/app/(dashboard)/reports/page.js
 * @description Production intelligence compilation interface for Eventvista.
 * Resolves Next.js page route naming collisions by consolidating reporting into a single dynamic engine.
 * Replaces unpersisted localStorage hooks with live MongoDB aggregation pipelines.
 */

"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button"; // Added to support the new Header UI

// Fallback safety routing for programmatic network handshakes
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

export default function ReportsPage() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");

  const [event, setEvent] = useState(null);
  const [layout, setLayout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const reportRef = useRef(null);

  // =========================================================================
  // SECTION 1: ASYNC BACKEND CORE REHYDRATION (SSOT MAPPING)
  // =========================================================================
  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      setError("Select an event from your dashboard to view its report.");
      return;
    }

    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    // Concurrently fetch event records and 3D telemetry definitions
    Promise.all([
      fetch(`${API_BASE}/events/${eventId}`, { headers }).then((r) => r.json()),
      fetch(`${API_BASE}/layouts/${eventId}`, { headers }).then((r) => r.json()).catch(() => null),
    ])
      .then(([eventRes, layoutRes]) => {
        if (!eventRes.success) {
          throw new Error(eventRes.message || "Could not load this event configuration.");
        }
        
        setEvent(eventRes.data);
        if (layoutRes?.success) setLayout(layoutRes.data);
      })
      .catch((err) => {
        console.error("Reports aggregation fault:", err);
        setError(err.message || "A network anomaly degraded the report compilation.");
      })
      .finally(() => setLoading(false));
  }, [eventId]);

  // =========================================================================
  // SECTION 2: VECTOR GRAPHICS PDF COMPILE ENGINE (NON-BLOCKING CHUNKING)
  // =========================================================================
  /**
   * Generates a high-resolution PDF document matching layout boundaries.
   * Leverages progressive lazy-loading to keep dependencies split from the primary bundle core.
   */
  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    setExporting(true);
    
    try {
      // Dynamic chunk import isolates jspdf and html2canvas weights until needed
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);

      // Render the current layout reference state into a high-density graphics matrix
      const canvas = await html2canvas(reportRef.current, { 
        scale: 2, 
        backgroundColor: "#ffffff",
        useCORS: true 
      });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      // Draw metadata title header onto the structural document layout canvas
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.text(`Eventvista Report — ${event?.title || "Untitled Event"}`, 40, 40);
      
      // Inject rasterized base64 viewport snapshot image into page geometry
      pdf.addImage(imgData, "PNG", 0, 60, pageWidth, imgHeight);
      
      // Stream final build payload assembly down to client document folder paths
      const safeTitle = (event?.title || "report").replace(/\s+/g, "_");
      pdf.save(`Eventvista_${safeTitle}.pdf`);
    } catch (err) {
      console.error("PDF generation exception:", err);
      setError("Could not generate the binary PDF asset. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  // =========================================================================
  // SECTION 3: INTERACTIVE DOM RENDER ROUTINES
  // =========================================================================
  if (loading) {
    return <div className="p-8 text-sm font-medium text-neutral-500 animate-pulse">Assembling system intelligence reports…</div>;
  }

  if (error && !event) {
    return <div className="p-8 text-sm font-semibold text-red-600 bg-red-50 rounded-xl border border-red-200 m-4">{error}</div>;
  }

  return (
    <div className="space-y-6 font-sans">
      
      {/* Enhanced Routing UX Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-100 pb-5">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="secondary" className="px-3 py-1.5 text-xs">← Back to Dashboard</Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Reports Engine</h1>
            <p className="text-xs text-neutral-500 mt-1">
              AI strategy roadmap and 3D venue layout diagnostics for{" "}
              <span className="font-semibold text-purple-600">{event?.title}</span>
            </p>
          </div>
        </div>
        <button
          onClick={handleDownloadPdf}
          disabled={exporting}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {exporting ? (
            <>
              <span className="h-3.5 w-3.5 rounded-full border-2 border-neutral-300 border-t-white animate-spin" />
              <span>Compiling Document Bundle…</span>
            </>
          ) : (
            <span>⬇ Download Comprehensive PDF Report</span>
          )}
        </button>
      </div>

      {/* Target Printing Surface Node */}
      <div ref={reportRef} className="grid grid-cols-1 gap-6 lg:grid-cols-3 bg-white p-4 rounded-xl">
        
        {/* Left Section: Live Markdown Generated Strategy Feed */}
        <Card className="lg:col-span-2 shadow-sm border border-neutral-200/60 p-5">
          <h2 className="text-sm font-bold text-neutral-900 mb-3 flex items-center gap-2 border-b border-neutral-100 pb-3">
            <span aria-hidden="true">🔮</span> Eventvista Advisor Strategy Report Output
          </h2>
          <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 shadow-inner">
            <pre className="text-xs font-mono text-green-400 whitespace-pre-wrap leading-relaxed overflow-x-auto">
              {event?.latestAdvisoryPlan?.plan ||
                "No advisory plans found. Use the interactive 3D Designer Advisor interface to generate a personalized system plan strategy."}
            </pre>
          </div>
        </Card>

        {/* Right Section: Physical Mesh Spatial Analytics Tracking */}
        <Card className="lg:col-span-1 shadow-sm border border-neutral-200/60 p-5">
          <h2 className="text-sm font-bold text-neutral-900 mb-3 border-b border-neutral-100 pb-3">Spatial Telemetry Status</h2>
          {layout ? (
            <div className="space-y-3">
              <p className="text-xs text-neutral-500 leading-normal">
                Trellis structural venue configurations matched against current canvas coordinate boundaries.
              </p>
              <div className="border border-neutral-100 rounded-xl p-3 bg-neutral-50/70 space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-500">Spatial Engine</span>
                  <span className="font-semibold text-neutral-800 bg-white px-2 py-0.5 rounded border border-neutral-200/80">Trellis-Groq V3</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-500">Floor Boundary</span>
                  <span className="font-bold text-neutral-800">{layout.floorAreaSqm || 0} sqm</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-500">Object Instances Placed</span>
                  <span className="font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">{layout.objects?.length || 0} nodes</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 border-2 border-dashed border-neutral-200 rounded-xl bg-neutral-50/50">
              <span className="text-2xl text-neutral-300 block mb-1">📐</span>
              <p className="text-xs text-neutral-500 max-w-[200px] mx-auto">No 3D spatial models have been engineered for this asset framework yet.</p>
            </div>
          )}
        </Card>

      </div>
    </div>
  );
}