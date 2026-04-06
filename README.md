# Survix

Modern survey and live polling platform with real-time analytics, team workspaces, and secure authentication.

**Live:** https://survix.pages.dev

**Key Features**

- Create surveys and live polls with multiple question types.
- Real-time response tracking and analytics dashboards.
- Public and private surveys with shareable links.
- Multi-tenant organizations with roles and permissions.
- Secure auth with OAuth, OTP verification, and password recovery.
- Media uploads and customizable branding elements.

**Tech Stack**

- Frontend: React + TypeScript + Vite
- Backend: NestJS + Prisma
- Realtime: Socket.IO

**Quick Start**

1. Backend
   ```bash
   cd backend
   npm install
   copy .env.example .env
   npm run start:dev
   ```
2. Frontend
   ```bash
   cd frontend
   npm install
   copy .env.example .env
   npm run dev
   ```

By default, the frontend proxies API requests to `http://localhost:3000` during development, and the backend allows `http://localhost:5173`.

**Commands**
Backend:

```bash
cd backend
npm run start:dev
npm run build
npm run test
```

Frontend:

```bash
cd frontend
npm run dev
npm run build
npm run test
```

**Future Extensions**

- Survey logic/branching and conditional question flows.
- Advanced analytics (cohorts, funnels, segmentation).
- More export formats (CSV, XLSX, scheduled reports).
- Multilingual surveys and RTL support.
- Team audit logs and SSO for enterprise workspaces.
- Template library and theming for brand kits.

Contributions are welcome. Please open an issue to discuss changes or improvements, then submit a PR with a clear description of the update.

**Author**
Mansi Shintre
