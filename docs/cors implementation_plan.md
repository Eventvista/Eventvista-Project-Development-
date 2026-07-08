# Implementation Plan — System Analysis & Integration

This plan outlines the steps to connect the Next.js frontend with the Node.js/Express backend, ensure proper CORS and API proxying, extend the Event database schema to store all frontend placeholder data (guests, vendors, expenses), and connect all frontend pages to write to and read from the MongoDB database.

## User Review Required

> [!IMPORTANT]
> The database schema for `Event` will be extended to store `guests`, `vendors`, and `expenses` nested subdocuments. This allows us to persist all the placeholder data from the frontend directly inside MongoDB without introducing complex external relational models, adhering cleanly to the MongoDB stack defined in the SRS.

> [!WARNING]
> Next.js relative `/api/v1/...` requests will be proxied to the backend running on port 5000 using Next.js rewrites. We will also mount the user routes under `/api/v1/auth` on the backend to avoid breaking existing frontend API calls.

## Proposed Changes

---

### Component 1: Routing & Proxying (System Connection)

#### [MODIFY] [next.config.ts](file:///home/infoscience/Desktop/Eventvista-Project-Development-/frontend/next.config.ts)
Configure Next.js rewrites to proxy all requests to `/api/v1/:path*` to `http://localhost:5000/api/v1/:path*`.

#### [MODIFY] [server.js](file:///home/infoscience/Desktop/Eventvista-Project-Development-/backend/server.js)
- Mount `userRoutes` on `/api/v1/auth` to support the frontend's login and register requests.
- Update `allowedOrigins` to support port 3000 (Next.js default) by updating the `CLIENT_ORIGIN` environment variable.

#### [MODIFY] [.env](file:///home/infoscience/Desktop/Eventvista-Project-Development-/backend/.env)
Update `CLIENT_ORIGIN` to support both `http://localhost:3000` and `http://localhost:5173`.

---

### Component 2: Database Schema (Event Model Expansion)

#### [MODIFY] [Event.js](file:///home/infoscience/Desktop/Eventvista-Project-Development-/backend/models/Event.js)
Extend the mongoose `Event` schema to store `guests`, `vendors`, and `expenses` as nested arrays.

---

### Component 3: Frontend Integration (Replacing Placeholder Data)

We will make the frontend pages dynamic, using a shared or local client-side state for the active event ID. The token will be read from `localStorage`.

#### [MODIFY] [page.js (designer)](file:///home/infoscience/Desktop/Eventvista-Project-Development-/frontend/app/designer/page.js)
Connect the 2D layout designer to the `useLayoutStore` Zustand store. Fetch the layout on load and save modifications back to the database.

#### [MODIFY] [page.js (dashboard)](file:///home/infoscience/Desktop/Eventvista-Project-Development-/frontend/app/(dashboard)/dashboard/page.js)
Convert the dashboard to a client component (`"use client"`). Fetch the user's events and the active event data to compute and display actual statistics, upcoming events, and recent activities.

#### [MODIFY] [page.js (events)](file:///home/infoscience/Desktop/Eventvista-Project-Development-/frontend/app/(dashboard)/events/page.js)
Implement a clean event creation form/modal to allow users to add new events. This sends a `POST /api/v1/events` request and updates the state.

#### [MODIFY] [page.js (budget)](file:///home/infoscience/Desktop/Eventvista-Project-Development-/frontend/app/(dashboard)/budget/page.js)
Convert to a client component. Load the active event's budget and expense breakdown from the database. Implement an "Add Expense" form to add expenses and update the budget in MongoDB.

#### [MODIFY] [page.js (vendors)](file:///home/infoscience/Desktop/Eventvista-Project-Development-/frontend/app/(dashboard)/vendors/page.js)
Load the active event's booked vendors from the database. Implement an "Add Vendor" form to book a new vendor and save it to MongoDB.

#### [MODIFY] [page.js (guests)](file:///home/infoscience/Desktop/Eventvista-Project-Development-/frontend/app/(dashboard)/guests/page.js)
Load the active event's guest list from the database. Implement "Add Guest" and mock "Import" triggers to store guests in MongoDB.

---

## Verification Plan

### Automated Verification
Run the dev servers for both frontend and backend to verify successful compilations and page loads.

### Manual Verification
1. Register a new user and log in to verify token issuance and storage.
2. Create events, add guests, add vendors, and add expenses. Verify that they persist in MongoDB on reload.
3. Access the 3D Designer, drag assets around, click Save, and reload the designer to verify the layout was successfully saved and fetched from the backend.
