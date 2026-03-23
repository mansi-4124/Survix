# Frontend Analysis Report

## 1. OpenAPI Generation (Backend)

**Status: Done**

- Script: `backend/scripts/generate-openapi.mjs`
- Command: `npm run build && npm run generate:openapi`
- Uses the built `dist/` output to avoid TypeScript augmentation issues with `express.d.ts`
- Writes `backend/openapi.json` deterministically

---

## 2. Frontend Logical Errors & Breaking Issues

### Fixed

| File | Issue | Fix |
|------|-------|-----|
| `pollLivePage.tsx` | Poll CSV download used raw `fetch()` bypassing axios 401 retry | Switched to `pollsApi.downloadCsv()` which uses axios; expired tokens now trigger refresh before download |

### Per-File Issues (Remaining / Notes)

#### `frontend/src/pages/polls/pollLivePage.tsx`
- **participantName**: Backend no longer sends `participantName` in realtime `vote_update`; frontend still references it. Activity feed will show "Vote" / "Word" instead of names. **Not breaking**, just less informative.

#### `frontend/src/api/services/MediaService.ts`
- **Unused & incorrect**: Generated client sends only `surveyId` as query param; backend expects `multipart/form-data` with a `file` field. MediaService is **never imported** in features. If you add file upload (e.g. for FILE_UPLOAD question type), implement a custom upload that posts FormData with the file.

#### `frontend/src/pages/surveys/surveyResponsePage.tsx`
- **Post-submit UX**: After successful submit, the Submit button remains visible (disabled only during `isPending`). `submitted` state is set but not used to hide or change the CTA. Minor UX improvement: hide Submit and show only success state when `submitted`.

#### `frontend/src/pages/surveys/surveyMembersPage.tsx`
- **Orphan route**: Exported from `pages/surveys/index.ts` but **not registered in the router**. Survey members UI lives inside `SurveyPage` (right panel). Either add a route or remove the orphan page.

#### `frontend/src/features/surveys/hooks/surveys.hooks.ts`
- **useUpdatePage / useDeletePage**: `onSuccess` invalidates `surveysKeys.all` (`["surveys"]`), which correctly invalidates all survey queries including structure. Working as intended.
- **usePublishSurvey onSuccess**: Passes `surveyId` as second arg to callback; `useMutation` provides `(data, variables, context)`. The callback signature `(_, surveyId)` is wrong—`surveyId` should come from `variables`. Check: `onSuccess: async (_, { surveyId })`—the mutation variables shape is `{ surveyId }` for `publishSurvey.mutate(surveyId)`. Actually `mutate(surveyId)` means variables = `surveyId` (string), not `{ surveyId }`. So `variables` is the string. Need to fix: `onSuccess: async (_, surveyId)` with `surveyId` as the second param. Same for closeSurvey, deleteSurvey, duplicateSurvey. Verify these hooks.

#### `frontend/src/features/auth/store/auth.store.ts`
- **onRehydrateStorage**: Calls `state?.setHasHydrated(true)`. After persist rehydration, `state` may not include actions in some setups. Confirm zustand persist passes full state; if not, this could be a no-op.

#### `frontend/src/app/router.tsx`
- **Settings button**: Header has a Settings button with no `onClick` or `Link`. Dead UI unless wired to a route.

---

## 3. Backend Endpoints vs Frontend Usage

### Auth

| Backend Endpoint | Frontend Usage |
|------------------|----------------|
| `POST /auth/signup` | ✅ `authApi`, signup page |
| `POST /auth/verify-email` | ✅ `authApi`, verify email page |
| `POST /auth/login` | ✅ `authApi`, login page |
| `POST /auth/refresh` | ✅ `authApi`, interceptor, useAuthInit |
| `POST /auth/logout` | ✅ `authApi`, useLogout |
| `POST /auth/forgot-password` | ✅ `authApi`, reset password page |
| `POST /auth/reset-password` | ✅ `authApi`, reset password page |
| `POST /auth/google` | ✅ `authApi`, Google login |

### Organization

| Backend Endpoint | Frontend Usage |
|------------------|----------------|
| `POST /organizations` | ✅ create organization |
| `POST /organizations/personal` | ✅ create personal workspace |
| `GET /organizations` | ✅ list my organizations |
| `GET /organizations/:orgId` | ✅ organization details |
| `PATCH /organizations/:orgId` | ✅ edit organization |
| `DELETE /organizations/:orgId` | ✅ soft delete |
| `POST /organizations/:orgId/transfer-ownership` | ✅ |
| `POST /organizations/:orgId/invite` | ✅ |
| `POST /organizations/accept-invite` | ✅ |
| `DELETE /organizations/:orgId/members/:userId` | ✅ |
| `POST /organizations/:orgId/leave` | ✅ |
| `PATCH /organizations/:orgId/members/:userId/role` | ✅ |
| `PATCH /organizations/:orgId/members/:userId/suspend` | ✅ |
| `PATCH /organizations/:orgId/members/:userId/reactivate` | ✅ |
| `GET /organizations/:orgId/members` | ✅ |
| `GET /organizations/:orgId/users/search` | ✅ |

### Survey

| Backend Endpoint | Frontend Usage |
|------------------|----------------|
| `POST /surveys` | ✅ |
| `GET /surveys/my` | ✅ |
| `PATCH /surveys/:surveyId` | ✅ |
| `POST /surveys/:surveyId/publish` | ✅ |
| `POST /surveys/:surveyId/close` | ✅ |
| `DELETE /surveys/:surveyId` | ✅ |
| `POST /surveys/:surveyId/duplicate` | ✅ |
| `GET /surveys/public` | ✅ (no `search` query used) |
| `GET /surveys/:surveyId` | ✅ |
| `POST /surveys/:surveyId/members` | ✅ |
| `POST /surveys/:surveyId/pages` | ✅ |
| `GET /surveys/:surveyId/members` | ✅ |
| `DELETE /surveys/:surveyId/members/:userId` | ✅ |
| `POST /pages/:pageId/questions` | ✅ |
| `PATCH /questions/:questionId` | ✅ |
| `DELETE /questions/:questionId` | ✅ |
| `PATCH /pages/:pageId` | ✅ |
| `DELETE /pages/:pageId` | ✅ |
| `POST /pages/:pageId/questions/reorder` | ✅ |
| `POST /questions/:questionId/move` | ✅ |
| `GET /pages/:pageId/questions` | ✅ |
| `GET /surveys/:surveyId/structure` | ✅ |

### Response

| Backend Endpoint | Frontend Usage |
|------------------|----------------|
| `POST /surveys/:surveyId/responses/start` | ✅ |
| `POST /responses/:responseId/answers` | ✅ |
| `POST /responses/:responseId/submit` | ✅ |
| `POST /responses/:responseId/reopen` | ❌ **Not used** |
| `DELETE /responses/:responseId` | ❌ **Not used** |

### Poll

| Backend Endpoint | Frontend Usage |
|------------------|----------------|
| `POST /polls` | ✅ |
| `GET /polls/my` | ✅ |
| `GET /polls/:pollId` | ✅ |
| `PATCH /polls/:pollId` | ✅ |
| `DELETE /polls/:pollId` | ✅ |
| `POST /polls/:pollId/close` | ✅ |
| `GET /polls/:pollId/live` | ✅ |
| `GET /polls/code/:code/live` | ✅ |
| `GET /polls/:pollId/results` | ✅ |
| `POST /polls/:pollId/votes` | ✅ |
| `GET /polls/:pollId/responses/csv` | ✅ (fixed to use axios) |

### Media

| Backend Endpoint | Frontend Usage |
|------------------|----------------|
| `POST /media/upload` | ❌ **Not used** – MediaService exists but is never called; implementation would need multipart/file upload |

### App

| Backend Endpoint | Frontend Usage |
|------------------|----------------|
| `GET /` | ❌ Health check; typically not called from frontend |

---

## 4. Missing Frontend Features (Backend Endpoints Available)

| Backend Endpoint | Suggested Frontend Feature |
|------------------|----------------------------|
| `POST /responses/:responseId/reopen` | "Reopen response" for draft or withdrawn responses; e.g. in a responses list or response detail view |
| `DELETE /responses/:responseId` | "Delete response" for draft or test responses; soft delete in UI |
| `POST /media/upload` | File upload for survey questions (FILE_UPLOAD, AUDIO, VIDEO types); needs FormData + file input and correct multipart request |
| `GET /surveys/public?search=` | Public survey search: pass a search query when listing public surveys on the dashboard |
| `GET /` (health) | Optional health/status indicator in app footer or admin area |

---

## 5. Summary

- **OpenAPI**: Generated via `npm run generate:openapi` (after build).
- **CSV download**: Fixed to use axios for proper 401 handling.
- **Media upload**: Backend ready; frontend needs a proper multipart upload flow.
- **Response management**: Reopen and delete response endpoints are implemented in backend but not exposed in the UI.
