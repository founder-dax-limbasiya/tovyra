# OTHRI architecture notes

## Current client

The Android-first client is an Expo Router application. Route screens are grouped under `app/(tabs)`; full-screen destinations such as Activity, Routines, Tasks and Permissions live at the app root. Reusable visual components and design tokens are isolated in `components/ui.tsx` and `constants/theme.ts`.

## Current data and provider boundaries

- Device-only memory, tasks and activity live in `lib/storage/` using Expo SQLite.
- The user's OpenAI-compatible model endpoint is called directly from the device through `lib/providers/openai-compatible.ts`.
- Provider URL, model ID and optional API key are stored with Expo SecureStore in `lib/providers/config.ts`. On Android, SecureStore uses Android Keystore-backed encryption.
- Provider keys are not hard-coded into the JS bundle or committed to Git. OTHRI sends them only as authorization to the exact provider URL the user saves.
- The mobile app accepts HTTPS providers. Plain HTTP is allowed only for loopback or private/local network hosts, and an API key is rejected over HTTP. Local HTTP traffic is still unencrypted in transit and should be used only on a trusted network.
- `lib/api/client.ts` is a provider-neutral transport boundary for a future OTHRI backend; it is not currently used for chat.

## Planned backend responsibilities

A future separately deployable OTHRI backend may own:
- Authentication and user sessions.
- Optional server-side provider routing for multi-device or managed deployments.
- Cloud memory sync and backup.
- Agent/task orchestration and cancellation.
- Tool integrations and server-enforced scoped permissions.
- Approval records and append-only audit events.
- Scheduled routines and retry policy.

The single-user BYOK mode does not require an OTHRI backend to chat with a compatible model endpoint. Server-side tools and external actions do require a trusted backend and must not be implemented as unrestricted client-side calls.

## Action safety lifecycle

A tool action should move through explicit states:

1. A user or agent requests a typed action.
2. The backend validates the user, agent, connector and requested scope.
3. Low-risk actions may proceed only under a user-configured policy.
4. External, destructive or irreversible actions wait for a specific approval.
5. The backend executes the approved action and stores the result.
6. The mobile client displays the server-reported outcome and audit record.

The client must not infer that an action succeeded merely because a request was submitted. The current Permissions screen documents this intended policy; no tool execution or approval gateway is active yet.

## Current implementation boundary

Implemented:
- Expo/React Native mobile shell and navigation.
- BYOK OpenAI-compatible, non-streaming chat request.
- Secure device storage for provider settings.
- Local SQLite memory create/list/edit/delete.
- Local SQLite task create/list/status-change/delete.
- Local activity records for memory and task changes.

Not implemented:
- Backend service, authentication or cloud sync.
- Model tool calling, agent execution or provider model discovery.
- External connectors, action gateway or executable approval flow.
- Scheduled routines, background jobs or push notifications.
- SQLCipher database encryption or automated backup.
- End-to-end tests and a verified Android build.
