# Eventvista Implementation Plan: Firebase Google Authentication

This document details the implementation plan for integrating Firebase Google Authentication into the Eventvista web application (Next.js frontend and Express/MongoDB backend). The goal is to allow users to sign in or register simply using their Google Accounts through the existing "Continue with Google" buttons.

---

## User Review Required

> [!IMPORTANT]
> **Role Discrepancy Between Frontend and Backend**
> The current signup/register form on the frontend offers the following roles:
> * `Client`
> * `Event Planner`
> * `Vendor`
> * `Admin`
>
> However, the backend Mongoose schema `User.js` only enforces the following role enum:
> * `['organiser', 'vendor', 'admin']` (with default `'organiser'`)
>
> *Recommendation:* During Google Sign-In, we will assign a default role of `'organiser'` unless specified. We need to decide how to handle role selection for Google sign-ins, or align the frontend role options to match the backend.

> [!WARNING]
> **Firebase Credentials & Security Setup**
> * The frontend requires Firebase configuration variables (`API_KEY`, `AUTH_DOMAIN`, etc.) to run the authentication flow.
> * The backend requires Firebase Admin credentials (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`) to verify client tokens securely. These should be kept secret and configured in `.env`.

---

## Open Questions

1. **How should we handle new users signing in via Google for the first time?**
   * Currently, we can create them with a default role of `'organiser'`. Do we want to present a role-selection step to them first, or is a default role of `'organiser'` acceptable?
2. **Do we need to link existing email-password accounts?**
   * If a user previously registered via email-password and later signs in using Google with the same email, we recommend automatically linking the Google login to their existing account by updating their `firebaseUid` field.

---

## Proposed Changes

### Component 1: Next.js Frontend

We will install `firebase` in the frontend directory and initialize the client SDK. We will then update the Google login buttons to trigger the popup authentication flow.

#### [NEW] [firebase.js](file:///home/infoscience/Desktop/Eventvista-Project-Development-/frontend/config/firebase.js)
Create a new utility module for initializing the Firebase app and configuring the Google Authentication provider.
* Initialize Firebase using variables like `process.env.NEXT_PUBLIC_FIREBASE_API_KEY`, etc.
* Export `auth` and `googleProvider` instances.

#### [MODIFY] [page.js (Login)](file:///home/infoscience/Desktop/Eventvista-Project-Development-/frontend/app/login/page.js)
Update the login page component to handle Google Sign-In:
* Import `signInWithPopup`, `auth`, and `googleProvider`.
* Implement a `handleGoogleSignIn` function linked to the "Continue with Google" button:
  1. Trigger Firebase Google Popup.
  2. Obtain the Firebase ID Token using `user.getIdToken()`.
  3. Send the ID Token to the backend API endpoint (`POST /api/v1/users/google-login`).
  4. On success, store the returned local JWT token (e.g., in `localStorage`) and redirect to `/dashboard`.
  5. On error, display an appropriate error message.

#### [MODIFY] [page.js (Register)](file:///home/infoscience/Desktop/Eventvista-Project-Development-/frontend/app/register/page.js)
Apply the same changes as the login page to the "Continue with Google" button on the sign-up page.

---

### Component 2: Express Backend

We will add a new database field `firebaseUid` to represent the unique ID provided by Firebase, modify the `password` field constraint, verify Firebase ID tokens on the backend using the Admin SDK, and handle user creation/lookup.

#### [MODIFY] [User.js (Model)](file:///home/infoscience/Desktop/Eventvista-Project-Development-/backend/models/User.js)
* Add `firebaseUid: { type: String, unique: true, sparse: true }`.
* Set `password.required` to `false` (since Google users do not have a password). Ensure that password hashing in the pre-save hook is skipped if `password` is not modified/provided.

#### [NEW] [firebase.js](file:///home/infoscience/Desktop/Eventvista-Project-Development-/backend/config/firebase.js)
Initialize the `firebase-admin` SDK using environment variables (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY`).

#### [MODIFY] [userController.js](file:///home/infoscience/Desktop/Eventvista-Project-Development-/backend/controllers/userController.js)
Implement the `googleLogin` controller:
1. Extract `token` (the Firebase ID Token) from the request body.
2. Verify the token using `admin.auth().verifyIdToken(token)`.
3. Extract `email`, `name`, `picture` (for `avatarUrl`), and `uid` from the verified token payload.
4. Query the database to find an existing user:
   * First, search by `firebaseUid: uid`.
   * If not found, search by `email: email`.
5. Create or update the user:
   * **Case 1: User does not exist at all.** Create a new user record with `name`, `email`, `firebaseUid`, `avatarUrl`, and default role `'organiser'`.
   * **Case 2: User exists but has no `firebaseUid` associated.** Set `user.firebaseUid = uid` and update their `avatarUrl` if applicable, then save.
   * **Case 3: User exists and is already linked.** Proceed to login.
6. Generate a local Eventvista JWT using `signToken(user._id)`.
7. Return the local JWT token and user profile in the response payload.

#### [MODIFY] [userRoutes.js](file:///home/infoscience/Desktop/Eventvista-Project-Development-/backend/routes/userRoutes.js)
* Import the new `googleLogin` controller.
* Mount the POST route: `router.post('/google-login', googleLogin);`.

---

## Verification Plan

### Automated Tests
* We will verify token verification and controller logic using a test script that mocks the Firebase token verification behavior:
  ```bash
  # Run backend unit tests (once mock tests are implemented)
  npm run test
  ```

### Manual Verification
1. Start the backend service (`npm run dev` in `/backend`).
2. Start the Next.js frontend (`npm run dev` in `/frontend`).
3. Open the browser or Electron window, navigate to the Login page, and click "Continue with Google".
4. Complete the sign-in modal.
5. Verify that the user record is correctly created/updated in the MongoDB database, and that the client successfully redirects to `/dashboard` with a valid authentication token.
