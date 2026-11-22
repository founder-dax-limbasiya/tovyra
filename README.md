# OTHRI

**Your other mind. Your rules.**

OTHRI is an open-source, Android-first personal AI workspace designed to bring conversations, memory, agents, routines and permission-controlled actions into one mobile experience.

- **Repository:** `founder-dax-limbasiya/tovyra`
- **Product:** OTHRI
- **Client:** Expo SDK 58 + React Native 0.88 + TypeScript
- **Initial platform:** Android
- **Current stage:** mobile UI foundation

## Current mobile screens

- **Home:** workspace overview and prompt hand-off to Chat.
- **Tasks:** create, list, complete, reopen and delete tasks stored locally on the phone.
- **Chat:** conversation composer with an explicit local-preview state; messages are not sent because no model backend is connected.
- **Agents:** catalogue of planning, research, writing and organiser agent concepts. These are templates, not executable agents.
- **Memory:** create, list and delete personal memory entries stored in the phone's local SQLite database.
- **Activity:** records local memory and task changes. Agent and external tool audit events are not implemented yet.
- **Settings:** provider, tool, permission and privacy setup placeholders.
- **Activity:** empty audit view until real actions exist.
- **Routines:** draft workflow templates. Nothing is scheduled or run in the background.

## Product principles

1. **One personal workspace:** chat, agents, memory, tasks, routines and activity belong together.
2. **User control first:** external or irreversible actions require explicit, scoped approval.
3. **Mobile first:** thumb-friendly navigation, readable layouts and graceful small-screen behavior.
4. **Provider flexible:** model providers and tool integrations must be replaceable.
5. **Honest status:** queued, running, waiting for approval, completed, failed and cancelled must be distinct states.
6. **Privacy by design:** never ship provider secrets in the mobile app or logs.

## Architecture direction

- Expo Router + React Native for the Android-first client.
- A separately deployable backend for authentication, orchestration, durable memory, tool execution and audit events.
- Provider adapters for user-supplied model endpoints.
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

This repository currently contains the mobile UI foundation only. Authentication, cloud sync, model execution, tool connections, permission enforcement, background routine scheduling and end-to-end tests are not implemented. Tasks and memory entries use standard on-device SQLite storage. Local memory uses standard SQLite storage on the device and is not SQLCipher-encrypted in this prototype. The interface intentionally avoids pretending these services are active.

## Open-source and licensing policy

Check every dependency and upstream component before integration. Preserve required notices and licenses. Do not copy GPL-licensed code into a permissively licensed distribution without an explicit decision to adopt its obligations. The project's own distribution license has not yet been selected.
