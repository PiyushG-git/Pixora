# Pixora - React UI Client 🎨

The Frontend for Pixora is built utilizing modern React and Vite. It heavily focuses on a streamlined, fluid user experience (UX) and hyper-organized structural layout meant for large, scalable Enterprise SPA (Single Page Application) software.

## 📂 4-Layer Feature-Driven Architecture

In standard React apps, code often becomes jumbled into massive "components" folders. We utilized a **Feature-Driven 4-Layer Architecture** so isolation is clean and side-effects are minimized.

```mermaid
graph TD
    App[app.routes.jsx (Vite/React Router)] --> FeatureA[Auth Feature]
    App --> FeatureB[Post Feature]
    App --> FeatureC[Shared Global UI]

    subgraph "The 4 Layers of a Feature (e.g., Post)"
    P[Pages layer] -->|Uses| C[Components layer]
    C -->|Subscribes to| H[Hooks/Context layer]
    H -->|Executes Network via| S[Services/API layer]
    end
```

### The Layers Explained:
1. **Pages (`/pages`)** - Layout structures controlling wide visual components. (e.g., `Feed.jsx`, `Login.jsx`).
2. **Components (`/components`)** - Reusable UI widgets mapped with specific data logic. (e.g., `Post.jsx`, `Spinner.jsx`).
3. **Hooks & Context (`/hooks`, `/post.context.jsx`)** - The state managers. Houses abstract business logic like "Optimistic State Pushing" and "App loading states".
4. **Services (`/services/post.api.js`)** - The exact Axios configurations handling the backend REST routes directly. Absolute clean separation from UI.

## 🚀 Advanced Frontend Techniques

1. **Optimistic UI Updates (Zero Latency Execution)**
   - To make the interaction feel as natively fast as an iOS application, clicking a generic Like button instantly recalculates raw front-end variables and updates CSS. Concurrently, the network `axios` request fires silently. If the backend throws a 500 error, the React Hook gracefully reverts the visual button and presents a toast notification.
2. **React Hot Toast Integration**
   - Global pop-over components alert users seamlessly about operations succeeding or halting without requiring the page to hard refresh or trapping users in endless spinners.
3. **Central Layout Navigation Injection**
   - Utilizing React Router's nested Outlet (`<Layout><Outlet/></Layout>`), the core navigation bar persists seamlessly across pages without needing redundant HTML mounts.

## ⚙️ Deployment Notes
This frontend is configured with a custom `vite.config.js` proxy pointing `localhost:3000`. This means all development API requests (like `/api/auth/`) correctly emulate the final production stage where this application is built and served natively out of the Node Backend `dist/` directory.