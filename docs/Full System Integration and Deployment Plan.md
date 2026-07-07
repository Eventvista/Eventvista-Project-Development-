# Full System Integration and Deployment Plan

This plan outlines the steps required to merge existing features, integrate the frontend with the MongoDB backend, set up user authentication, and deploy the application.

## User Review Required

> [!WARNING]
> This plan involves merging branches and modifying the database schema. Please ensure you have backed up any critical local data before proceeding with the execution phase.

## Open Questions

> [!IMPORTANT]
> 1. Which specific collections/models do we need for the placeholder data currently in the frontend (e.g., Events, Guests, Budgets)?
> 2. Do we have a preferred domain name for the frontend deployment, or will we use the default Vercel/Netlify URL?
> 3. Should the 'Return' button on the designer page go back to the dashboard or the previous page the user visited?

## Proposed Changes

### Phase 1: Git Branch Management

1. **Merge Swagger API Docs:**
   - Checkout the `feature/electron-testing-environment` branch.
   - Merge `feature/swagger-api-docs` into it.
   - Resolve any merge conflicts.
2. **Create Integration Branch:**
   - Create a new branch named `feature/db-integration-and-auth` from the newly merged branch.

### Phase 2: Environment Variables Setup

You will need to configure the following environment variables in the `backend/.env` file:

- `JWT_SECRET`: Generate a secure random string (e.g., using `openssl rand -base64 32` in your terminal).
- `JWT_EXPIRES_IN`: Set this to your preferred duration, typically `7d` (7 days) or `24h` (24 hours).
- `HUGGINGFACE_API_KEY`: Create an account on [Hugging Face](https://huggingface.co/), navigate to Settings > Access Tokens, and generate a new token with read/write access.
- `HUGGINGFACE_TRELLIS_URL`: This is the API endpoint for the TRELLIS model, typically `https://api-inference.huggingface.co/models/microsoft/TRELLIS`.

### Phase 3: Frontend & Backend Integration

#### 1. Data Migration (Placeholder to MongoDB)
- Analyse the frontend `app/(dashboard)` components to locate placeholder data (e.g., events, budgets, guests).
- Create corresponding Mongoose schemas in the `backend/models` directory.
- Develop backend API routes in `backend/routes` (e.g., `GET /api/events`, `POST /api/events`).
- Replace frontend static data with `fetch` or `axios` calls to the new backend endpoints.

#### 2. Authentication System
- Ensure the backend has routes for user registration (`POST /api/auth/register`) and login (`POST /api/auth/login`) that interact with MongoDB.
- Connect the frontend `/register` and `/login` pages to these endpoints.
- Store the JWT securely in the frontend (e.g., in an `HttpOnly` cookie or local storage) and attach it to subsequent API requests.

#### 3. Designer Page Navigation
- Modify `frontend/app/designer/page.js`.
- Add a 'Return to Dashboard' button using Next.js `next/link` or the `useRouter` hook to ensure smooth routing.

### Phase 4: Functional Alpha Testing

- **Local Setup:** Start both the frontend (`npm run dev`) and backend (`npm run dev`) servers locally.
- **Account Creation:** Register a new user account and verify it appears in MongoDB.
- **Authentication:** Log out and log back in to ensure the JWT token is issued and handled correctly.
- **Data Flow:** Navigate to the dashboard and ensure data is fetched from the backend, not hardcoded.
- **Designer Routing:** Test the designer page and the new 'Return' button.

### Phase 5: Final Merge

- Once alpha testing is successful, open a Pull Request (PR).
- Merge `feature/db-integration-and-auth` into the `main` branch.

### Phase 6: Deployment Plan

#### Backend Deployment (Render)
1. Create a free account on [Render](https://render.com/).
2. Connect your GitHub repository to Render.
3. Create a new "Web Service".
4. Set the Root Directory to `backend`.
5. Set the Build Command to `npm install` and the Start Command to `npm start`.
6. Add all the environment variables from your `.env` file to the Render dashboard.

#### Frontend Deployment (Vercel)
1. Create an account on [Vercel](https://vercel.com/).
2. Import your GitHub repository.
3. Set the Root Directory to `frontend`.
4. Add the `NEXT_PUBLIC_API_URL` environment variable pointing to your deployed Render backend URL.
5. Deploy.

## Verification Plan

### Automated Tests
- Run `npm run lint` and any existing unit tests on both the frontend and backend to ensure no breaking syntax issues.

### Manual Verification
- The user will perform the alpha testing steps detailed in Phase 4.
- Verify the Render and Vercel deployments are accessible publicly and communicate successfully.
