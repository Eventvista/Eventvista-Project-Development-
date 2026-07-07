# Eventvista Systems Analysis & File Structure

As a Systems Analyst, understanding the project's architecture requires mapping out how the system's directories and files interact to form the complete application. The Eventvista project is structured as a full-stack monorepo containing a Next.js frontend, a Node.js/Express backend, and provisions for a desktop application.

Below is the comprehensive file structure and the functional purpose of each component.

---

## 1. Root Directory (`/`)
The root directory acts as the workspace container, orchestrating the different sub-projects and maintaining global configurations.

- **`backend/`**: The Node.js REST API providing data and logic.
- **`frontend/`**: The Next.js React application providing the user interface.
- **`eventvista-desktop/`**: A reserved placeholder directory. This will eventually contain the Electron wrapper used to package the frontend as a downloadable desktop application.
- **`database/`**: A reserved directory likely intended for local database seed scripts, initialization dumps, or Docker volume mounts.
- **`docs/`**: Contains system documentation, Software Requirements Specifications (SRS), and API request examples (`requests.http`).
- **`package.json` & `package-lock.json`**: Root-level dependencies, often used to manage workspace scripts (e.g., running frontend and backend concurrently).
- **`.husky/` & `commitlint.config.js`**: Ensures code quality by enforcing Git commit standards and pre-commit hooks before code is pushed.

---

## 2. Backend Architecture (`/backend`)
The backend follows a classic **Model-View-Controller (MVC)** architectural pattern (excluding the 'View', which is handled by the frontend). It is responsible for database communication, business logic, authentication, and external API integrations.

### Core Entry Point
- **`server.js`**: The main execution script. It initializes the Express application, configures security middlewares (like Helmet and CORS), connects to MongoDB, mounts the route handlers, and starts the server listening on a port.

### Directory Breakdown
- **`models/`**: Defines the Data Access Layer using Mongoose schemas. Dictates how data is structured in MongoDB.
  - `User.js`: Schema for authentication, storing hashed passwords, and user profiles.
  - `Event.js`: Defines event parameters (dates, descriptions, capacities).
  - `Layout.js`: Stores JSON representations of the 3D/2D venue layouts.
  - `Vendor.js`: Manages vendor profiles and service offerings.

- **`controllers/`**: Contains the core business logic. Routes delegate requests here to be processed.
  - `aiController.js`: Manages external API calls to Groq/LLaMA and Hugging Face for AI-assisted planning and 3D object generation.
  - `eventController.js`: Handles creating, reading, updating, and deleting (CRUD) events.
  - `layoutController.js`: Logic for saving and loading complex layout states from the designer.
  - `userController.js`: Manages JWT generation, login, and registration.
  - `vendorController.js`: Logic for querying and managing vendors.

- **`routes/`**: Acts as the API Gateway/Router. Maps HTTP methods (GET, POST) and endpoints (`/api/events`) to the correct controller functions.
  - Contains `aiRoutes.js`, `eventRoutes.js`, `layoutRoutes.js`, `userRoutes.js`, and `vendorRoutes.js`.

- **`middleware/`**: Functions that intercept requests before they reach the controller. 
  - Functions here typically handle verifying JWT tokens, checking user roles, or formatting error responses.

- **`config/`**: Contains environment-specific setups, such as the MongoDB connection script.

- **`utils/`**: Helper scripts for repetitive tasks, such as password hashing utilities or custom response formatters.

- **`.env`**: Stores sensitive environment variables like `JWT_SECRET`, `MONGO_URI`, and external API keys.

---

## 3. Frontend Architecture (`/frontend`)
The frontend is built using **Next.js (App Router)** and utilizes **Zustand** for state management and **Tailwind CSS** for styling.

### Core Entry Point
- **`app/layout.tsx`**: The root HTML layout. It wraps the entire application in global providers (like Theme or Auth context).
- **`app/page.tsx`**: The landing page script.

### Directory Breakdown
- **`app/`**: Implements Next.js file-based routing. Every folder represents a URL route.
  - `login/` & `register/`: Public authentication routes.
  - `(dashboard)/`: A route group that shares a common authenticated layout (e.g., a sidebar).
    - Contains individual functional modules: `budget/`, `calendar/`, `dashboard/`, `events/`, `guests/`, `messages/`, `reports/`, `settings/`, `vendors/`.
  - `designer/`: A specialized route containing the complex 3D layout planner interface.

- **`components/`**: Modular, reusable UI elements separated by complexity (Atomic Design pattern).
  - `ui/`: Base components (Buttons, Inputs, Modals).
  - `molecules/`: Combinations of UI components (e.g., a form or a labeled input).
  - `layout/`: Structural components like `Sidebar.js` or `Navbar.js`.

- **`store/`**: Global State Management.
  - `useLayoutStore.js`: A Zustand store specifically designed to handle the complex, highly interactive state of the 3D designer (e.g., currently selected objects, grid coordinates) without prop-drilling.

- **`context/`**: React Context providers, generally used for application-wide states that don't change rapidly, such as the currently authenticated User session.

- **`public/`**: Stores static assets like the `favicon.ico`, logos, and default images.

- **Configuration Files**:
  - `next.config.ts`: Configures the Next.js build process.
  - `postcss.config.mjs` & Tailwind setups: Configures the CSS processing pipeline.
  - `eslint.config.mjs`: Defines rules for code quality and syntax standards.

---

## System Flow Summary
1. The user interacts with the React components in **`frontend/app`**.
2. State is updated locally via **`frontend/store`** or a network request is dispatched.
3. The request hits the Node API at **`backend/routes`**.
4. The route passes the request through **`backend/middleware`** (e.g., to verify the user is logged in).
5. The **`backend/controllers`** script executes the business logic.
6. The controller interacts with **`backend/models`** to fetch or save data in the MongoDB database.
7. A response is sent back up the chain to the frontend.
