# Eventvista-Project-Development-
This is a project repository for Eventvista the group members to collaborate with the each other during development.
Here is a simple and clean `README.md` template tailored to the EventVista system, incorporating the technologies and roles we have discussed.

```markdown
# EventVista

---

## About The Project

**EventVista** is a comprehensive, full-stack event management platform designed to connect event organizers with vendors. The system uses a secure authentication flow and supports role-based access control to ensure users have the right tools for their specific needs.

### Supported Roles

*   **Organiser:** Can create and manage events.
*   **Vendor:** Can register their commercial business and offer services at events.
*   **Admin:** Has system-wide oversight and management capabilities.

### Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | Next.js, React |
| **Backend** | Node.js, Express |
| **Database** | MongoDB |
| **Authentication** | Firebase Auth |

---

## Getting Started

Follow these instructions to get a local copy of EventVista up and running on your machine.

### Prerequisites

Ensure you have the following installed on your local development environment:
*   Git
*   Node.js (v18 or higher recommended)
*   MongoDB (running locally or a MongoDB URI)

### 1. Clone the Repository

Open your terminal and run the following commands to clone the project and navigate into the directory:

```bash
git clone [https://github.com/your-username/eventvista.git](https://github.com/your-username/eventvista.git)
cd eventvista

```

### 2. Environment Variables

Before running the application, you must configure your environment variables.

* Create a `.env` file in the root of the **frontend** directory for your Next.js and Firebase public keys.
* Create a `.env` file in the root of the **backend** directory for your MongoDB URI, Firebase Admin credentials, and session secrets.

> **Note:** Refer to `.env.example` in both directories for the exact variables required.

### 3. Run the Application

EventVista includes automated scripts to install dependencies and start both the frontend and backend servers simultaneously. Choose the script that matches your operating system.

**For Mac and Linux (Bash):**
Make sure the script is executable, then run it:

```bash
chmod +x run-eventvista.sh
./run-eventvista.sh

```

**For Windows (Command Prompt / PowerShell):**
Simply execute the batch file:

```cmd
run-eventvista.bat

```

---

## Troubleshooting

* **Database Collision Errors (400 Bad Request):** If you are testing the registration flow and receive a `Duplicate value for unique field: email` error, ensure you are not trying to register with an email that is already present in your MongoDB database. Delete the test document in MongoDB or log in with a fresh email.
* **Ports Already in Use:** By default, the frontend runs on port `3000` and the backend on port `5000`. Ensure these ports are free before running the startup scripts.

```

```
