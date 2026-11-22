# OTHRI

**Your other mind. Your rules.**

OTHRI is an open-source, Android-first personal AI workspace bringing chat, memory, tasks, agents, routines and permission-controlled actions into one mobile experience.

- **Repository:** `founder-dax-limbasiya/tovyra`
- **Product:** OTHRI
- **Client:** Expo SDK 58, React Native 0.88, TypeScript
- **Initial target:** Android
- **Current stage:** early mobile prototype

## Current screens and working features

- **Home:** workspace overview and prompt hand-off to Chat.
- **Chat:** calls the OpenAI-compatible endpoint that you configure. Supports two narrow local tool requests: `create_task` and `save_memory`. Each request shows its exact arguments and waits for your approval. Conversation messages stay in screen memory only; they are not persisted yet.
- **Tasks:** create, list, complete, reopen and delete tasks stored locally on the phone.
- **Memory:** create, list, edit and delete personal memory entries stored in the phone's local SQLite database.
- **Activity:** records local memory and task changes, plus local chat-tool approval outcomes.
- **Agents:** catalogue of planning, research, writing and organiser concepts. These are templates, not executable agents.
- **Permissions:** default-deny policy. The two local tools require per-action approval; all external integrations are disconnected.
- **Settings:** BYOK endpoint setup, local storage status and privacy controls.
- **Routines:** draft workflow templates. Nothing is scheduled or run in the background.

## Connect a model (BYOK)

Open Settings and enter the API base URL and exact model ID supported by your OpenAI-compatible service. OTHRI calls the `/chat/completions` endpoint directly from the phone.

For a self-hosted Ollama server on your private Wi-Fi, the base URL is commonly:

```text
http://192.168.1.10:11434/v1
```

Replace the example address with the server's actual LAN IP and enter the model ID that is installed there. Leave the API key blank for a local Ollama server. The Android phone must be able to reach that server on the network.

For an internet-hosted provider, use an HTTPS API base URL ending in `/v1` when required by that provider, and its API key. The provider/model must support OpenAI-compatible chat completions and tool calling for the task and memory actions to work. HTTP is accepted only for private/local hosts, and a key is rejected over HTTP. Provider settings, including the optional key, are stored using Expo SecureStore, which uses Android Keystore-backed encryption. The key is not hard-coded, committed to Git or sent through an OTHRI backend.

**Network caution:** a local Ollama HTTP connection is not encrypted in transit. Use it only on a trusted private network, and do not send sensitive prompts across untrusted Wi-Fi. Running a local model still requires a computer or server with enough resources; the app itself does not provide free inference compute.

## Product principles

1. **One personal workspace:** chat, agents, memory, tasks, routines and activity belong together.
2. **User control first:** external or irreversible actions require explicit, scoped approval.
3. **Mobile first:** thumb-friendly navigation, readable layouts and graceful small-screen behavior.
4. **Provider flexible:** model providers and tool integrations should be replaceable.
5. **Honest status:** queued, running, waiting for approval, completed, failed and cancelled must be distinct states.
6. **Privacy by design:** never commit provider secrets or log them.

## Architecture direction

- Expo Router + React Native for the Android-first client.
- Expo SecureStore for device-local provider settings and keys.
- Expo SQLite for local memory, tasks and activity records.
- A separately deployable backend remains planned for authentication, shared orchestration, durable cloud sync and controlled tool execution.
- A permission gateway that defaults to deny and records approvals and outcomes.

## Development

```bash
npm install
npx expo start
```

Use Expo Go or an Android development build to preview on a phone. Native capabilities may require a development build.

## Android install build

An internal Android APK profile is configured in `eas.json`. After installing EAS CLI and signing in to an Expo account, run:

```bash
npx eas-cli build --platform android --profile preview
```

EAS will build an installable APK and provide a download link when the remote build completes. A Play Store Android App Bundle profile is also configured as `production`:

```bash
npx eas-cli build --platform android --profile production
```

Remote builds require an Expo account and are subject to the account's available build quota. No APK has been built or tested yet.

## Current limitations

Authentication, cloud sync, multi-step agent orchestration, external connectors, server-side permission enforcement, background routine scheduling and end-to-end tests are not implemented. Model tool calling is limited to two on-device operations (`create_task` and `save_memory`) with explicit per-request approval. The current permission flow is client-side and must not be treated as a security boundary for future external tools. Chat uses ordinary non-streaming OpenAI-compatible completions. Chat history is not persisted. Local memory, tasks and activity use standard SQLite and are not SQLCipher-encrypted in this prototype. The permission centre describes the two local actions and blocked integrations; it is not a server-side action gateway.

## Open-source and licensing policy

See [the upstream review](docs/upstream-review.md). Check each dependency and upstream component before reuse. Preserve required notices and licenses. Do not copy GPL-licensed code into a permissively licensed distribution without an explicit decision to adopt its obligations. The project's own distribution license has not yet been selected.
