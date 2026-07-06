
# Eventvista Implementation Plan: Testing Environment & Database Setup

**To:** The Eventvista Development Team (John, Shekinah, Gideon)

**From:** Lewis Kariuki, Project Manager

**Subject:** Moving to our Electron Testing Environment and Setting up MongoDB

Team, as we move into the heavier technical phases of the project (specifically the AI integrations and 3D Venue Designer), we need to ensure our testing environment is stable and our database is properly connected.

Please follow this step-by-step plan to get your local machines fully set up.

---

## Part 1: The Electron Testing Environment

### Why are we using this?

I have created a new branch called `feature/electron-testing-environment`. This branch wraps our Next.js frontend and Express backend inside a desktop application called **Electron**.

* **Isolated Testing:** It stops your normal web browser (like Chrome or Edge) from caching old data or using browser extensions that might break our UI.
* **3D & VR Readiness:** Since Shekinah and John will be working heavily with Hugging Face TRELLIS for the 3D venue canvas, Electron gives us better access to hardware acceleration and prepares the system for eventual VR testing.
* **Accurate API Testing:** It strictly enforces how our frontend talks to our backend over port 5000, mimicking how the live system will behave.

#### The "Overview" Table
| Desktop Client | Electron + electron-builder | eventvista-desktop/ | Native Window |

#### The "Full Directory Tree" Section

Eventvista-Project-Development-/
│
├── eventvista-desktop/          <- NEW: Standalone Electron Wrapper & 

Compiler
│  ├── main.js                  <- Controls native OS window properties
│  └── package.json             <- Build engine settings (electron-builder)
│
├── frontend/                    <- Next.js Web App



### How to get the new branch:

Open your terminal inside the root `Eventvista-Project-Development-` folder and run:

```bash
git fetch origin
git checkout feature/electron-testing-environment

```

Ensure your dependencies are up to date by running `npm install` inside **both** the `frontend` and `backend` folders.

---

## Part 2: Creating a Clickable Executable to Run the App

To save you from typing multiple terminal commands every time you want to test the app, you can create a simple clickable file on your desktop that will launch the backend, wait for the frontend, and open the Electron app automatically.

**If you are on Windows:**

1. Open Notepad.
2. Paste the following code into the file:

```bat
@echo off
title Eventvista Full-Stack Desktop Terminal Launcher
cls

echo ===================================================
echo   1. RESETTING WINDOWS PORTS ^& KILLING GHOST PIDs  
echo ===================================================

echo Checking Port 3000 (Frontend Next.js)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    echo Found ghost process PID %%a on Port 3000. Force-terminating...
    taskkill /f /pid %%a 2>nul
)

echo Checking Port 5000 (Backend Express)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do (
    echo Found ghost process PID %%a on Port 5000. Force-terminating...
    taskkill /f /pid %%a 2>nul
)

echo Ports checked and cleared successfully.
echo.

echo ===================================================
echo   2. SPINNING UP EVENTVISTA FULL-STACK SYSTEM      
echo ===================================================

echo -^> Launching API Engine (Backend)...
:: Opens the backend in its own independent command window
start "Eventvista Backend Service" cmd /k "cd backend && npm run dev"

echo -^> Launching Frontend Dev Server ^& Spawning Electron App...
echo Please wait for Next.js to compile. Electron will open automatically...
echo.

:: Switches into the frontend folder and triggers your package.json concurrent workflow
cd frontend && npm run test:desktop

echo.
echo ===================================================
echo   3. COOLDOWN TERMINATION ENGINE                   
echo ===================================================
echo Main process exited. 
pause

```


3. Save the file directly in the root of the project folder (or your desktop) as `Run-Eventvista.bat`. (Make sure it does not save as a `.txt` file).
4. **To use it:** Just double-click `Run-Eventvista.bat` and the whole system will start up.

**If you are on Mac/Linux:**

1. Open your terminal and create a new file in the root folder: `touch run-eventvista.sh`
2. Open the file in your code editor and paste this:

```bash
#!/bin/bash

# Terminate the script immediately if any individual command fails
set -e

echo "==================================================="
echo "  1. RESETTING NETWORK PORTS & KILLING GHOST PIDs  "
echo "==================================================="

# Automatically kill any hidden background processes holding port 3000 or 5000
# This guarantees Next.js will never throw a port/collision crash.
echo "Clearing Port 3000 (Frontend Next.js)..."
fuser -k 3000/tcp 2>/dev/null || true

echo "Clearing Port 5000 (Backend Express)..."
fuser -k 5000/tcp 2>/dev/null || true

echo "Ports cleared successfully."
echo ""

echo "==================================================="
echo "  2. SPINNING UP EVENTVISTA FULL-STACK SYSTEM      "
echo "==================================================="

# Capture the absolute path of the project root
ROOT_DIR=$(pwd)

# Step A: Enter the backend folder, install missing modules, and start it in the background
echo "-> Starting API Engine (Backend)..."
cd "$ROOT_DIR/backend"
npm install --silent
npm run dev &
BACKEND_PID=$! # Save the process ID of the backend to clean it up later

# Step B: Enter the frontend folder and execute your combined test:desktop script
echo "-> Running Frontend Dev Server & Spawning Electron App..."
cd "$ROOT_DIR/frontend"
npm install --silent

# Run your package.json concurrent script natively
npm run test:desktop

echo "==================================================="
echo "  3. SYSTEM TEARDOWN & CLEANUP                     "
echo "==================================================="

# Once you close the Electron application window, gracefully stop the background backend API
echo "Closing desktop window. Safely shutting down backend process (PID: $BACKEND_PID)..."
kill $BACKEND_PID 2>/dev/null || true

echo "All systems stopped cleanly. Terminal ready."
```


3. Make the file clickable by running: `chmod +x run-eventvista.sh`
4. **To use it:** Simply double-click the file, or run `./run-eventvista.sh` in your terminal.

### The "NPM Scripts Summary" Section

You will need to document the new build commands that the team will use to generate the `.exe` files. Add these rows to your Scripts Summary table:

| Location | Command | Action |
| --- | --- | --- |
| `eventvista-desktop/` | `npm start` | Launches the Electron sandbox for local testing |
| `eventvista-desktop/` | `npm run build:win` | Compiles the project into a Windows `.exe` application |
| `eventvista-desktop/` | `npm run build:linux` | Compiles the project into a Linux `.AppImage` application |

---

## Part 3: Setting Up MongoDB Compass

We are now moving away from local, temporary databases and connecting to our shared cloud database on MongoDB Atlas. To view and manage this data easily, you need **MongoDB Compass** (a visual desktop tool for our database).

### 1. Install MongoDB Compass

* Go to the official MongoDB website and search for "Download MongoDB Compass".
* Download and install the version for your operating system.

### 2. Connect to our Cloud Atlas Account

* Check your emails. You should have received an invitation from me to join our MongoDB Atlas project. Click the link to accept it and create your login details.
* Once logged into the Atlas website, find our shared "Cluster" and click the **Connect** button.
* Choose **"Compass"** as your connection method.
* Atlas will give you a **Connection String** that looks like this: `mongodb+srv://<username>:<password>@cluster0...` (Replace `<password>` with an  password we are currently sharing and i willsend it to to thhe group ).
* Open your installed MongoDB Compass app on your computer, paste that connection string into the main URL bar, and click **Connect**.

### 3. How to Use Compass

Once connected, you will see a simple dashboard:

* **Databases:** On the left panel, you will see a list of databases. Click on `eventvista`.
* **Collections:** Inside the database are "collections" (which are like tables, e.g., `users`, `events`, `vendors`).
* **Documents:** Clicking on a collection shows the actual data (documents). You can visually click the green "Add Data" button here to manually insert or edit records, just like editing a spreadsheet.

---

## Part 4: Migrating the Sample Data (Action for John & Shekinah)

Currently, the system uses hardcoded placeholder data (likely stored in `.json` or `.js` files in our frontend/backend folders). We need to move this into MongoDB.

**Step-by-step Migration:**

1. **Locate the Data:** Find the files containing our sample users, venues, and event data.
2. **Import via Compass:** * Open MongoDB Compass and connect to our database.
* Go to the relevant collection (e.g., `events`).
* Click **"Add Data" -> "Import JSON or CSV file"**.
* Select the local file containing the sample data and upload it.


3. **Update the Backend (John's Task):** John, please update the backend routes and controllers so that instead of reading the local placeholder files, the system queries the MongoDB database using Mongoose.
4. **Test the UI (Shekinah's Task):** Shekinah, once John pushes the updated backend code, run the system using the executable file we created in Part 2. Ensure the UI still populates the venues and events correctly now that they are being fetched from the cloud database.

Summary for the Team

By adapting this procedure for Eventvista, John and Shekinah won't just be testing in a desktop window; they will actually be able to compile a standalone Eventvista.exe file. This is highly beneficial for the VR and 3D Venue rendering requirements outlined in our SRS Document, as native desktop apps handle heavy 3D graphics much better than standard web browsers!
Let me know if anyone runs into any permission errors or needs help with the setup!
