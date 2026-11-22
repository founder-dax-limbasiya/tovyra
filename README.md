# OTHRI

**Your other mind. Your rules.**

OTHRI is an open-source, Android-first personal AI workspace designed to bring conversations, memory, agents, routines, and permission-controlled actions into one mobile experience.

> Repository: `founder-dax-limbasiya/tovyra`  
> Product name: **OTHRI**  
> Initial target: Android phones  
> Approach: mobile-first, local-friendly, modular, open-source

## Product principles

- **One personal workspace:** chat, agents, memory, tasks, routines, and activity belong together.
- **User control first:** external or irreversible actions require explicit, scoped approval.
- **Mobile first:** thumb-friendly navigation, readable layouts, fast startup, and graceful small-screen behavior.
- **Provider-flexible:** model providers and tool integrations should be replaceable; no model vendor lock-in.
- **Honest status:** show queued, running, waiting for approval, completed, failed, and cancelled states distinctly.
- **Privacy by design:** never ship provider secrets in the mobile app or log sensitive values.

## Initial navigation

1. **Home** — personal overview, quick prompt, current tasks, and recent activity.
2. **Chat** — conversational workspace and voice-ready interaction.
3. **Agents** — agent catalogue and run controls.
4. **Memory** — user-visible memory and controls.
5. **Settings** — providers, integrations, permissions, and privacy.

## Architecture direction

- Expo + React Native + TypeScript for the Android-first client.
- A separately deployable backend for authentication, orchestration, durable memory, tool execution, and audit events.
- Provider adapters so local or user-supplied model endpoints can be configured without hard-coding a vendor.
- A permission gateway that defaults to deny and records approvals and outcomes.

The first milestone is a working mobile shell with navigation and clear placeholder states. Backend integrations will be added behind typed interfaces rather than simulated as successful actions.

## Open-source and licensing policy

Every dependency and reused component must be checked before integration. Preserve upstream notices and licenses. Do not copy GPL-licensed code into a permissively licensed distribution without an explicit decision to adopt its obligations.

## Development

Install dependencies with your package manager, then run the Expo development server:

```bash
npm install
npx expo start
```

Use Expo Go or an Android development build to test on a phone. Native features may require a development build.

## Status

Early foundation. Not production-ready yet. Authentication, backend persistence, real model execution, tool permissions, and end-to-end tests are not implemented in this first scaffold.
