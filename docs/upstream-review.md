# Upstream research and licensing notes

This note tracks the projects that informed OTHRI's direction. It is not a statement that their source code has been copied into this repository.

## Reviewed candidates

| Project | Upstream license | What is useful to OTHRI | Current decision |
| --- | --- | --- | --- |
| [Rakazo](https://github.com/elie222/rakazo) | Apache-2.0 | Existing Expo mobile client, agent/task concepts, server architecture, audit trail and integration boundaries | Study its mobile and product architecture. No source files copied yet. |
| [Open Dots](https://github.com/skynet-labs-ai/open-dots) | MIT | Deny-by-default action gateway, approval prompts, connector scoping and audit events | Use these as security design references. Its own README describes it as an early prototype; do not treat it as a hardened security boundary. |
| [OpenMuse archive](https://github.com/OpenMuseAgent/OpenMuse) | MIT | Personal-agent product model, memory, goals, proactive activity and user approval | Archived versions 0.1.0–0.6.0 are no longer maintained. We may study the archived MIT code with notices preserved if a later integration needs it. |
| [nanoMuse successor](https://github.com/nano-muse/nanoMuse) | GPL-3.0-or-later | Successor to OpenMuse with a broader device experience | Do not copy or link GPL code into OTHRI's distribution unless the project explicitly decides to adopt and satisfy GPL obligations. |
| [OpenFuse](https://github.com/CopilotKit/openfuse) | MIT | Separate personal-agent application with browser/workspace concepts | This is not OpenMuseAgent/OpenMuse. It is a separate project and is not currently included. |

## UI inspiration sources

The following websites were supplied as visual research references: [Jiro.build](https://jiro.build), [Header.design](https://header.design), [Recent.design](https://recent.design), [Landdding.com](https://landdding.com) and [FontInLogo.com](https://fontinlogo.com).

They are inspiration sources, not open-source software dependencies. Do not copy proprietary assets, designs, text or code without checking the applicable terms and permissions.

## Reuse checklist

Before copying or adapting any upstream implementation:

1. Confirm the exact repository, branch, version/tag and license file.
2. Review dependency licenses and any NOTICE, attribution or patent provisions.
3. Keep required license and copyright notices with redistributed code.
4. Record exactly which files or components were adapted and from which upstream revision.
5. Run security review before using connectors, browser automation, shell access, device control or other privileged actions.
6. Keep external actions behind a server-side deny-by-default permission gateway and require explicit approval for destructive or irreversible operations.

## OTHRI implementation status

The current OTHRI application is a custom Expo / React Native implementation. No source code from the five repositories above has been copied into this repository at this stage. Its current UI, local SQLite memory/task storage, permissions design and typed API boundary were written for this project.

The initial upstream work is therefore architectural research, not a merged-code release. This keeps the current app's source and licensing easier to audit while we identify exactly which upstream components are safe and worthwhile to integrate.