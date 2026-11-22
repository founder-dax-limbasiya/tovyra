# OTHRI architecture notes

## Current client

The Android-first client is an Expo Router application. Route screens are grouped under `app/(tabs)`; full-screen destinations such as Activity and Routines live at the app root. Reusable visual components and design tokens are isolated in `components/ui.tsx` and `constants/theme.ts`.

## Backend boundary

The mobile client talks to OTHRI's own backend through `lib/api/client.ts` when one is configured. Device-only memory and tasks currently live in `lib/storage/` using Expo SQLite. The mobile bundle may contain a public API origin, but must never contain model-provider API keys, database service keys, OAuth client secrets or privileged credentials.

The backend will own:
- Authentication and user sessions.
- Model provider credentials and provider routing.
- Durable user memory with inspect, edit, export and delete operations.
- Agent/task orchestration and cancellation.
- Tool integrations and scoped permission checks.
- Approval records and append-only audit events.
- Scheduled routines and retry policy.

## Action safety lifecycle

A tool action should move through explicit states:

1. A user or agent requests a typed action.
2. The backend validates the user, agent, connector and requested scope.
3. Low-risk actions may proceed only under a user-configured policy.
4. External, destructive or irreversible actions wait for a specific approval.
5. The backend executes the approved action and stores the result.
6. The mobile client displays the server-reported outcome and audit record.

The client must not infer that an action succeeded merely because a request was submitted.

## Current implementation boundary

The app currently contains a mobile UI foundation and provider-neutral API transport. No backend service, model adapter, auth flow, cloud memory sync, tool runner or scheduler is implemented yet. Local device memory and task records, plus their activity records, are implemented with standard SQLite storage; SQLCipher encryption is not enabled. The chat composer intentionally does not send messages while the backend is absent.
