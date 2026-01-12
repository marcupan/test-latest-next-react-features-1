# Secure Workspace (Next.js & React Features)

This project initially served as a production-grade starter for building secure, multi-tenant SaaS applications using the Next.js App Router. It has now evolved into a dedicated environment for testing and demonstrating the latest features of Next.js and React, providing a practical, hands-on space to explore new patterns and capabilities.

> [!NOTE]
> The primary goal is to experiment with cutting-edge features in a realistic application setting, rather than building a production-ready application.

## Project Structure

The project follows a feature-sliced architecture, with code organized by domain.

-   `src/app`: Contains the application's routes, following the Next.js App Router structure.
    -   `(authed)` and `(public)`: Route groups for authentication states.
    -   `@modal`: Implements parallel and intercepting routes for modals.
    -   `api`: Houses API route handlers.
-   `src/features`: Contains individual feature slices, such as `auth`, `projects`, and `comments`. Each feature has its own actions, data fetching logic, and components.
-   `src/lib`: Shared libraries and utilities.
-   `src/shared`: Contains shared database logic, types, and UI components.

## Functionality Overview

The project includes the following features, which serve as a practical foundation for testing:

-   **Authentication:** User login and session management.
-   **Projects:** Create, view, and manage projects.
-   **Tasks:** Within projects, users can create and manage tasks.
-   **Comments:** Users can add comments to tasks for collaboration.
-al & Intercepting Routes for advanced routing patterns like modals.
-   **Audit Log:** A log of significant events for security and compliance.
-   **File attachments:** Attach files to tasks.
-   **Public Sharing:** Share resources publicly via a secure token.


## Features Used

### React

-   **React Server Components (RSCs):** Components are server-first by default.
-   **Client Components:** Used for interactive UI, denoted with the `"use client"` directive.
-   **Suspense:** Used for handling loading states of asynchronous operations.
-   **Context:** `ProjectContext.tsx` shows the use of context for state sharing.

### Next.js

-   **App Router:** The core of the application's routing.
-   **Route Groups:** Organizing routes without affecting the URL path.
-   **Parallel & Intercepting Routes:** For advanced routing patterns like modals.
-   **API Routes:** For building backend endpoints.
-   **Server Actions:** For handling form submissions and mutations securely on the server.
-   **Data Fetching:** Co-located with components for efficient data loading.

## Quick Start

### 1. Prerequisites

-   Node.js (v20+)
-   pnpm
-   PostgreSQL

### 2. Setup

```bash
# Install dependencies
pnpm install

# Create local environment file
cp .env.example .env.local
```

### 3. Configure

Edit `.env.local` with your database connection string and secrets.

### 4. Run Migrations

```bash
pnpm run migrate
```

### 5. Run Development Server

```bash
pnpm run dev
```

Application will be available at [http://localhost:3000](http://localhost:3000).

## Core Commands

-   `pnpm dev`: Start the development server.
-   `pnpm build`: Create a production build.
-   `pnpm start`: Run the production server.
-   `pnpm lint`: Run ESLint.
-   `pnpm migrate`: Run database migrations.
