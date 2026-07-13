// frontend/utils/apiClient.js
import { mockEventData, mockLayoutData, mockAiResponse } from './mockData.js';

const isDemoMode = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("eventvista_demo_mode") === "true";
  }
  return false;
};

export const fetchWithContext = async (endpoint, options = {}) => {
  // 1. Intercept for Demo Mode Sandbox
  if (isDemoMode()) {
    console.log(`[Sandbox] Intercepted request to ${endpoint}`);
    
    // Simulate network latency for realism
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Route to appropriate mock data block
    if (endpoint.includes("/events/")) return { success: true, data: mockEventData };
    if (endpoint.includes("/layouts/")) return { success: true, data: mockLayoutData };
    if (endpoint.includes("/ai/advisor-plan")) return { success: true, data: { plan: mockAiResponse } };
    
    return { success: true, data: [] };
  }

  // 2. Standard Production Request Pipeline
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(endpoint, { ...options, headers });
  return await response.json();
};