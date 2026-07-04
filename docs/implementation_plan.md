# Eventvista Project Management & Backend Enhancement Plan

This plan details the steps required to grant project manager access to your actual GitHub account, configure repository protections, enforce conventional commits, and establish a testing framework for the backend developed by John. 

## User Review Required

> [!IMPORTANT]
> The GitHub repository settings (Roles and Branch Protection) require manual action from the repository owner or an existing administrator. I cannot modify GitHub settings directly without authentication. Please review the manual steps outlined below.
> 
> Also, please confirm if you would like me to proceed with implementing the automated code changes (Commit Linting and Backend Testing).

## Proposed Changes

### 1. GitHub Account Rights & Access (Manual Steps)

To grant your actual GitHub account (`Kenjin32icon`) Project Manager rights on the `Eventvista-Project-Development-` repository, please follow these steps:

1. Navigate to the [Eventvista-Project-Development- repository](https://github.com/Eventvista/Eventvista-Project-Development-) on GitHub.
2. Click on **Settings** in the top navigation bar.
3. In the left sidebar, click on **Collaborators**.
4. Click the **Add people** button.
5. Search for `Kenjin32icon` and select your account.
6. Assign the **Admin** or **Maintainer** role to grant project manager privileges.
7. Click **Add to repository**.

### 2. Establish Protected Branches (Manual Steps)

To ensure the integrity of the `development`, `staging`, and `main` branches, we need to establish branch protection rules.

1. In the repository **Settings**, click on **Branches** in the left sidebar.
2. Click on **Add branch protection rule**.
3. Enter `main` in the **Branch name pattern** field.
4. Check the following options:
   - **Require a pull request before merging** (Require approvals).
   - **Require status checks to pass before merging**.
   - **Do not allow bypassing the above settings**.
5. Click **Create** to save the rule.
6. Repeat steps 2-5 for the `development` and `staging` branches.

---

### 3. Conventional Commit Linting (Automated Changes)

To maintain a clean and readable commit history, we will configure conventional commit linting using `Husky` and `commitlint`.

#### [NEW] .husky/commit-msg
We will add a Husky hook to enforce linting on all commit messages before they are saved.

#### [NEW] commitlint.config.js
We will create a configuration file at the root of the project to define the conventional commit boundaries (e.g., ensuring commits start with `feat:`, `fix:`, `docs:`, etc.).

#### [MODIFY] package.json
We will install the necessary development dependencies (`@commitlint/cli`, `@commitlint/config-conventional`, and `husky`) and add a `prepare` script to enable Husky.

---

### 4. Backend Testing Framework (Automated Changes)

We will establish a simple testing framework to ensure the backend logic developed by John is robust and functioning as expected.

#### [MODIFY] package.json
We will install `jest` and `supertest` as development dependencies to facilitate our testing environment. We will also add a `"test"` script.

#### [NEW] tests/server.test.js
We will write a suite of tests starting with the API Gateway (`server.js`). This will include verifying the `/api/v1/health` endpoint to ensure the core service responds correctly.

## Verification Plan

### Automated Tests
- We will run `npm install` to ensure all required packages are present.
- We will execute `npm test` to verify that the health endpoint and core routes are functioning correctly.
- We will perform a test commit to ensure `commitlint` properly blocks invalid commit messages and allows valid ones.

### Manual Verification
- Please verify that your account `Kenjin32icon` has been successfully added to the repository with the correct permissions.
- Please verify that the branch protection rules are active in your GitHub repository settings.
